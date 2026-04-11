'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const [url, setUrl] = useState('')
  const router = useRouter()

  const handleQuickScan = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) {
      router.push(`/signup?url=${encodeURIComponent(url.trim())}`)
    }
  }

  const features = [
    {
      icon: '⬡',
      title: '10 Device Presets',
      desc: 'iPhone SE to 4K desktop — covering 100% of market share',
    },
    {
      icon: '◈',
      title: 'AI Visual Analysis',
      desc: 'Claude AI detects overlapping elements, clipped text & broken layouts',
    },
    {
      icon: '◎',
      title: 'Issue Prioritization',
      desc: 'Ranked by device market share — fix what matters most first',
    },
    {
      icon: '⬡',
      title: 'Instant Screenshots',
      desc: 'Real browser rendering via Playwright for pixel-perfect accuracy',
    },
    {
      icon: '◈',
      title: 'Email Alerts',
      desc: 'Get notified immediately when critical issues are found',
    },
    {
      icon: '◎',
      title: 'Project Tracking',
      desc: 'Monitor multiple sites with full scan history',
    },
  ]

  const devices = [
    { name: 'iPhone 15', share: '18.5%', w: 393 },
    { name: 'Desktop 1440', share: '19.8%', w: 1440 },
    { name: 'Samsung A15', share: '8.3%', w: 384 },
    { name: 'iPad Air', share: '4.2%', w: 820 },
    { name: 'Desktop 1280', share: '15.4%', w: 1280 },
  ]

  return (
    <div className="min-h-screen bg-bg-primary grid-bg">
      {/* Navbar */}
      <nav className="border-b border-border bg-bg-primary/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-accent-cyan flex items-center justify-center">
                <span className="text-bg-primary font-bold text-sm font-syne">P</span>
              </div>
              <span className="font-syne font-bold text-lg text-text-primary">
                Pixel<span className="text-accent-cyan">Proof</span>
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/login" className="nav-link">
                Sign In
              </Link>
              <Link href="/signup" className="btn-primary text-sm py-2 px-4">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-20 px-4">
        {/* Decorative elements */}
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-accent-cyan/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-cyan-dark/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-accent-cyan/5 border border-accent-cyan/20 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
            <span className="text-accent-cyan text-sm font-medium monospace">
              AI-Powered • 10 Devices • Real-Time Analysis
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-syne font-bold text-text-primary mb-6 leading-tight">
            Every pixel.
            <br />
            <span className="text-accent-cyan">Every device.</span>
          </h1>

          <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-12 leading-relaxed">
            PixelProof automatically screenshots your website across 10 device
            configurations and uses AI to detect broken layouts, overlapping text,
            and hidden CTAs — ranked by real market share.
          </p>

          {/* URL Input */}
          <form onSubmit={handleQuickScan} className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted monospace text-sm">
                  https://
                </div>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="yoursite.com"
                  className="w-full bg-bg-secondary border border-border text-text-primary pl-20 pr-4 py-4 rounded-xl focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/20 transition-all duration-200 text-lg"
                />
              </div>
              <button type="submit" className="btn-primary whitespace-nowrap text-base py-4 px-8">
                Run Free Scan →
              </button>
            </div>
            <p className="text-text-muted text-sm mt-3">
              Free to start · No credit card required
            </p>
          </form>
        </div>
      </section>

      {/* Device Preview Strip */}
      <section className="border-y border-border bg-bg-secondary/30 py-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            {devices.map((d) => (
              <div
                key={d.name}
                className="flex-shrink-0 bg-bg-secondary border border-border rounded-lg p-3 flex items-center gap-3"
              >
                <div className="w-8 h-12 bg-bg-tertiary border border-border-bright rounded flex items-center justify-center">
                  <div className="w-4 h-6 bg-accent-cyan/20 rounded-sm" />
                </div>
                <div>
                  <div className="text-text-primary text-sm font-medium whitespace-nowrap">
                    {d.name}
                  </div>
                  <div className="text-text-secondary text-xs monospace">
                    {d.w}px · {d.share} share
                  </div>
                </div>
              </div>
            ))}
            <div className="flex-shrink-0 text-text-muted text-sm px-4">
              +5 more devices →
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-syne font-bold text-text-primary mb-4">
              Precision testing at scale
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Built for developers and QA teams who need confidence that their
              UI works on every device their users actually use.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="card group hover:border-accent-cyan/30 transition-all duration-300 cursor-default"
              >
                <div className="text-2xl mb-4 text-accent-cyan">{f.icon}</div>
                <h3 className="font-syne font-semibold text-text-primary text-lg mb-2">
                  {f.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-bg-secondary/20 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-syne font-bold text-text-primary mb-4">
              How it works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Enter your URL',
                desc: 'Paste any publicly accessible URL. PixelProof accepts any website.',
              },
              {
                step: '02',
                title: 'AI captures & analyzes',
                desc: 'Playwright renders your page on 10 real device viewports. Claude AI examines each screenshot.',
              },
              {
                step: '03',
                title: 'Review ranked issues',
                desc: 'Issues sorted by device market share. Fix what impacts the most users first.',
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="monospace text-accent-cyan text-5xl font-bold opacity-20 mb-4">
                  {item.step}
                </div>
                <h3 className="font-syne font-semibold text-text-primary text-xl mb-2">
                  {item.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-syne font-bold text-text-primary mb-6">
            Start scanning for free
          </h2>
          <p className="text-text-secondary text-lg mb-10">
            Create your account and run your first cross-device scan in under 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="btn-primary text-lg py-4 px-10">
              Create Free Account
            </Link>
            <Link href="/login" className="btn-secondary text-lg py-4 px-10">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-accent-cyan flex items-center justify-center">
              <span className="text-bg-primary font-bold text-xs font-syne">P</span>
            </div>
            <span className="font-syne font-bold text-text-secondary">PixelProof</span>
          </div>
          <p className="text-text-muted text-sm">
            © {new Date().getFullYear()} PixelProof. Built with AI-powered precision.
          </p>
        </div>
      </footer>
    </div>
  )
}
