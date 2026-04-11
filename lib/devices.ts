export interface DevicePreset {
  name: string
  viewportWidth: number
  viewportHeight: number
  userAgent: string
  marketShare: number
  category: 'mobile' | 'tablet' | 'desktop'
}

export const DEVICE_PRESETS: DevicePreset[] = [
  {
    name: 'iPhone SE',
    viewportWidth: 375,
    viewportHeight: 667,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    marketShare: 3.2,
    category: 'mobile',
  },
  {
    name: 'iPhone 15',
    viewportWidth: 393,
    viewportHeight: 852,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    marketShare: 18.5,
    category: 'mobile',
  },
  {
    name: 'iPhone 15 Pro Max',
    viewportWidth: 430,
    viewportHeight: 932,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    marketShare: 12.1,
    category: 'mobile',
  },
  {
    name: 'Samsung Galaxy A15',
    viewportWidth: 384,
    viewportHeight: 854,
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; SM-A155F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    marketShare: 8.3,
    category: 'mobile',
  },
  {
    name: 'Google Pixel 7',
    viewportWidth: 412,
    viewportHeight: 915,
    userAgent:
      'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    marketShare: 5.7,
    category: 'mobile',
  },
  {
    name: 'iPad Air',
    viewportWidth: 820,
    viewportHeight: 1180,
    userAgent:
      'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    marketShare: 4.2,
    category: 'tablet',
  },
  {
    name: 'iPad Pro',
    viewportWidth: 1024,
    viewportHeight: 1366,
    userAgent:
      'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    marketShare: 2.8,
    category: 'tablet',
  },
  {
    name: 'Desktop 1280',
    viewportWidth: 1280,
    viewportHeight: 720,
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    marketShare: 15.4,
    category: 'desktop',
  },
  {
    name: 'Desktop 1440',
    viewportWidth: 1440,
    viewportHeight: 900,
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    marketShare: 19.8,
    category: 'desktop',
  },
  {
    name: 'Desktop 1920',
    viewportWidth: 1920,
    viewportHeight: 1080,
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    marketShare: 10.0,
    category: 'desktop',
  },
]
