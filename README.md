# PixelProof

**AI Cross-Device Testing Monitor** — Automatically screenshot your pages across 10 virtual device/viewport combinations. AI (Anthropic Claude) analyzes each screenshot to detect broken layouts, overlapping text, hidden CTAs, and more. Issues are ranked by device market share so you fix what matters most first.

## Features

- **10 Device Presets** — iPhone SE to 4K desktop, covering real market share data
- **AI Visual Analysis** — Claude AI analyzes each screenshot as a QA engineer
- **Issue Prioritization** — Ranked by device market share × severity
- **Project Management** — Organize scans by project with full history
- **Email Alerts** — Resend integration for critical issue notifications
- **Real-time Progress** — Live scan progress with polling

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL via Neon + Prisma
- **AI**: Anthropic Claude (claude-opus-4-5)
- **Screenshots**: Playwright
- **Auth**: NextAuth.js
- **Email**: Resend

## Getting Started

### Prerequisites

- Node.js 18+
- A Neon PostgreSQL database
- Anthropic API key
- (Optional) Resend API key for email alerts

### Setup

1. Clone and install dependencies:
   ```bash
   npm install
   ```

2. Copy the example env file and fill in your values:
   ```bash
   cp .env.example .env.local
   ```

3. Set up required environment variables in `.env.local`:
   ```
   DATABASE_URL=postgresql://...
   AUTH_SECRET=<run: openssl rand -base64 32>
   NEXTAUTH_URL=http://localhost:3000
   ANTHROPIC_API_KEY=sk-ant-...
   RESEND_API_KEY=re_... (optional)
   ```

4. Push the database schema:
   ```bash
   npx prisma db push
   ```

5. (Optional) Install Playwright browsers for real screenshots:
   ```bash
   npx playwright install chromium --with-deps
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see PixelProof.

## Device Presets

| Device | Viewport | Market Share |
|--------|----------|-------------|
| iPhone SE | 375×667 | 3.2% |
| iPhone 15 | 393×852 | 18.5% |
| iPhone 15 Pro Max | 430×932 | 12.1% |
| Samsung Galaxy A15 | 384×854 | 8.3% |
| Google Pixel 7 | 412×915 | 5.7% |
| iPad Air | 820×1180 | 4.2% |
| iPad Pro | 1024×1366 | 2.8% |
| Desktop 1280 | 1280×720 | 15.4% |
| Desktop 1440 | 1440×900 | 19.8% |
| Desktop 1920 | 1920×1080 | 10.0% |

## User Flows

1. **Landing → Signup → Dashboard** (empty state) → Add Project → New Scan → Results
2. **Landing → Login → Dashboard** (existing projects) → View Project → View Scan Results

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `AUTH_SECRET` | Yes | NextAuth secret (use `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Yes | Your app URL |
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key for AI analysis |
| `RESEND_API_KEY` | No | Resend API key for email alerts |

## License

MIT © Riku Kenju
