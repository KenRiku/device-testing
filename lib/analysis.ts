import Anthropic from '@anthropic-ai/sdk'
import * as fs from 'fs'
import * as path from 'path'

export interface AnalysisIssue {
  severity: 'critical' | 'major' | 'minor' | 'info'
  category: string
  description: string
  boundingBox?: string
  suggestion?: string
}

export interface AnalysisResult {
  issues: AnalysisIssue[]
  summary: string
}

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function analyzeScreenshot(
  screenshotPublicPath: string,
  deviceName: string,
  url: string
): Promise<AnalysisResult> {
  try {
    const absolutePath = path.join(process.cwd(), 'public', screenshotPublicPath)

    if (!fs.existsSync(absolutePath)) {
      return {
        issues: [
          {
            severity: 'info',
            category: 'Screenshot',
            description: 'Screenshot could not be captured for analysis',
            suggestion: 'Ensure the URL is accessible and try again',
          },
        ],
        summary: 'Screenshot unavailable for analysis',
      }
    }

    const screenshotBuffer = fs.readFileSync(absolutePath)
    const base64Image = screenshotBuffer.toString('base64')

    const prompt = `You are an expert QA engineer and UI/UX specialist analyzing a website screenshot for visual and layout issues.

Device: ${deviceName}
URL: ${url}

Carefully examine this screenshot and identify any visual or layout issues. Look for:

1. **Overlapping elements** - Text or UI components that overlap each other
2. **Clipped/truncated text** - Text that is cut off or not fully visible
3. **Hidden CTAs/buttons** - Call-to-action buttons that are partially or fully hidden
4. **Horizontal overflow** - Content extending beyond the viewport width
5. **Broken layout** - Elements misaligned or in wrong positions
6. **Illegible text** - Text too small, low contrast, or otherwise hard to read
7. **Broken images** - Missing, stretched, or distorted images
8. **Navigation issues** - Menu items that are inaccessible or broken
9. **Form issues** - Input fields that are too small or misaligned
10. **Responsive design issues** - Content not adapting properly to this viewport

Respond with a JSON object in this exact format:
{
  "issues": [
    {
      "severity": "critical|major|minor|info",
      "category": "Layout|Typography|Navigation|Images|Forms|Performance|Accessibility|Overflow",
      "description": "Clear description of the specific issue observed",
      "boundingBox": "approximate location like 'top-left', 'center', 'bottom-right', or null",
      "suggestion": "Specific actionable fix for this issue"
    }
  ],
  "summary": "Brief 1-2 sentence overall assessment"
}

Severity guidelines:
- critical: Completely broken, unusable, or blocking critical user flows
- major: Significantly degrades user experience
- minor: Small issues that don't severely impact usability
- info: Observations or best practice suggestions

If no issues are found, return an empty issues array with a positive summary.
Only return valid JSON, no other text.`

    let fullResponse = ''

    const stream = await client.messages.stream({
      model: 'claude-opus-4-5',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/png',
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    })

    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        fullResponse += chunk.delta.text
      }
    }

    // Parse the JSON response
    const jsonMatch = fullResponse.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const parsed = JSON.parse(jsonMatch[0]) as AnalysisResult

    return {
      issues: parsed.issues || [],
      summary: parsed.summary || 'Analysis complete',
    }
  } catch (error) {
    console.error('Analysis error:', error)
    return {
      issues: [
        {
          severity: 'info',
          category: 'Analysis',
          description: 'AI analysis could not be completed for this device',
          suggestion: 'Check API key and try again',
        },
      ],
      summary: 'Analysis failed - please check configuration',
    }
  }
}
