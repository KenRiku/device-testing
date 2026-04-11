import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DEVICE_PRESETS } from '@/lib/devices'
import { captureScreenshot } from '@/lib/screenshot'
import { analyzeScreenshot } from '@/lib/analysis'
import { sendCriticalIssueAlert } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await request.json()
    const { url, projectId } = body

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    let normalizedUrl = url
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`
    }

    // Create scan record immediately and return scanId
    const scan = await prisma.scan.create({
      data: {
        url: normalizedUrl,
        userId,
        projectId: projectId || null,
        status: 'running',
      },
    })

    // Process in background (fire and forget)
    processScan(scan.id, normalizedUrl, userId).catch((error) => {
      console.error(`Background scan error for ${scan.id}:`, error)
      prisma.scan.update({
        where: { id: scan.id },
        data: { status: 'failed' },
      }).catch(console.error)
    })

    return NextResponse.json({ scanId: scan.id, status: 'running' }, { status: 201 })
  } catch (error) {
    console.error('Scan POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create scan' },
      { status: 500 }
    )
  }
}

async function processScan(scanId: string, url: string, userId: string) {
  let totalIssues = 0
  const criticalDevices: string[] = []

  for (const device of DEVICE_PRESETS) {
    try {
      console.log(`Processing ${device.name} for scan ${scanId}`)

      // Capture screenshot
      const screenshotPath = await captureScreenshot(url, device, scanId)

      // Run AI analysis
      const analysis = await analyzeScreenshot(screenshotPath, device.name, url)

      // Save device result to DB
      const deviceResult = await prisma.deviceResult.create({
        data: {
          scanId,
          deviceName: device.name,
          viewportWidth: device.viewportWidth,
          viewportHeight: device.viewportHeight,
          userAgent: device.userAgent,
          marketShare: device.marketShare,
          screenshotPath,
        },
      })

      // Save issues
      if (analysis.issues.length > 0) {
        await prisma.issue.createMany({
          data: analysis.issues.map((issue) => ({
            deviceResultId: deviceResult.id,
            severity: issue.severity,
            category: issue.category,
            description: issue.description,
            boundingBox: issue.boundingBox || null,
            suggestion: issue.suggestion || null,
          })),
        })

        totalIssues += analysis.issues.length

        const hasCritical = analysis.issues.some((i) => i.severity === 'critical')
        if (hasCritical) {
          criticalDevices.push(device.name)
        }
      }
    } catch (deviceError) {
      console.error(`Error processing device ${device.name}:`, deviceError)
    }
  }

  // Update scan as complete
  await prisma.scan.update({
    where: { id: scanId },
    data: {
      status: 'complete',
      issueCount: totalIssues,
    },
  })

  // Send email if critical issues found
  if (criticalDevices.length > 0) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (user) {
        await sendCriticalIssueAlert({
          userEmail: user.email,
          userName: user.name,
          url,
          scanId,
          criticalIssueCount: criticalDevices.length,
          deviceNames: criticalDevices,
        })
      }
    } catch (emailError) {
      console.error('Email error:', emailError)
    }
  }

  console.log(`Scan ${scanId} complete. Total issues: ${totalIssues}`)
}
