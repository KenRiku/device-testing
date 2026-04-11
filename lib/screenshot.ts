import * as fs from 'fs'
import * as path from 'path'
import type { DevicePreset } from './devices'

export async function captureScreenshot(
  url: string,
  device: DevicePreset,
  scanId: string
): Promise<string> {
  const screenshotDir = path.join(
    process.cwd(),
    'public',
    'screenshots',
    scanId
  )

  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true })
  }

  const deviceSlug = device.name.toLowerCase().replace(/\s+/g, '-')
  const screenshotPath = path.join(screenshotDir, `${deviceSlug}.png`)
  const publicPath = `/screenshots/${scanId}/${deviceSlug}.png`

  try {
    const { chromium } = await import('playwright')

    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    })

    const context = await browser.newContext({
      viewport: {
        width: device.viewportWidth,
        height: device.viewportHeight,
      },
      userAgent: device.userAgent,
    })

    const page = await context.newPage()

    try {
      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 30000,
      })

      await page.waitForTimeout(2000)

      await page.screenshot({
        path: screenshotPath,
        fullPage: false,
      })
    } catch (navError) {
      console.error(`Navigation error for ${url} on ${device.name}:`, navError)
      await page.screenshot({
        path: screenshotPath,
        fullPage: false,
      }).catch(() => {
        createPlaceholderScreenshot(screenshotPath, device)
      })
    }

    await browser.close()
    return publicPath
  } catch (playwrightError) {
    console.error(
      `Playwright error for ${device.name}:`,
      playwrightError
    )
    createPlaceholderScreenshot(screenshotPath, device)
    return publicPath
  }
}

function createPlaceholderScreenshot(filePath: string, device: DevicePreset): void {
  // Create a minimal valid PNG file (1x1 pixel, dark colored)
  // PNG signature + IHDR + IDAT + IEND
  const width = Math.min(device.viewportWidth, 400)
  const height = Math.min(device.viewportHeight, 300)

  // Minimal PNG: 1x1 dark pixel
  const pngBuffer = Buffer.from([
    // PNG signature
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    // IHDR chunk
    0x00, 0x00, 0x00, 0x0d, // length = 13
    0x49, 0x48, 0x44, 0x52, // "IHDR"
    0x00, 0x00, 0x00, 0x01, // width = 1
    0x00, 0x00, 0x00, 0x01, // height = 1
    0x08, 0x02,             // bit depth = 8, color type = 2 (RGB)
    0x00, 0x00, 0x00,       // compression, filter, interlace
    0x90, 0x77, 0x53, 0xde, // CRC
    // IDAT chunk
    0x00, 0x00, 0x00, 0x0c, // length = 12
    0x49, 0x44, 0x41, 0x54, // "IDAT"
    0x08, 0xd7, 0x63, 0x18, 0x16, 0x16, 0x00, 0x00, 0x00, 0x04, 0x00, 0x01, // compressed data (dark pixel)
    0xe2, 0x21, 0xbc, 0x33, // CRC
    // IEND chunk
    0x00, 0x00, 0x00, 0x00, // length = 0
    0x49, 0x45, 0x4e, 0x44, // "IEND"
    0xae, 0x42, 0x60, 0x82, // CRC
  ])

  fs.writeFileSync(filePath, pngBuffer)
  console.log(`Created placeholder screenshot for ${device.name} at ${filePath}`)
}
