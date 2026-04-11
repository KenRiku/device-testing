import type { Metadata } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
import { SessionProvider } from '@/components/SessionProvider'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '500', '600', '700', '800'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'PixelProof — AI Cross-Device Testing Monitor',
  description:
    'Automatically screenshot your pages across 10 device/viewport combinations. AI detects broken layouts, overlapping text, and hidden CTAs.',
  keywords: ['cross-device testing', 'responsive design', 'visual regression', 'AI testing'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
