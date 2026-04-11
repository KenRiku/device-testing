# PixelProof — Claude Code Context

## Project Overview
PixelProof is an AI cross-device testing monitor built with Next.js 14. It screenshots websites across 10 device/viewport combinations and uses Claude AI to detect visual layout issues.

## Architecture

### Stack
- **Next.js 14** with App Router
- **TypeScript** throughout
- **Tailwind CSS** with custom design system
- **Prisma + Neon PostgreSQL** (uses `@prisma/adapter-neon` driver adapter)
- **Anthropic Claude** (claude-opus-4-5) for AI screenshot analysis
- **Playwright** for browser-based screenshot capture
- **NextAuth.js** for authentication
- **Resend** for email notifications

### Key Design Decisions

1. **Database**: PostgreSQL via Neon. The `DATABASE_URL` is configured in `prisma/config.ts`, NOT in `schema.prisma`. The Prisma schema datasource has no `url` field.

2. **Prisma Client**: Created with `PrismaNeon` adapter from `@prisma/adapter-neon`. See `lib/prisma.ts`.

3. **Scan Processing**: Scans are created immediately and processed in the background (fire and forget). The frontend polls `/api/scans/[scanId]` every 3-4 seconds to check status.

4. **Screenshots**: Saved to `public/screenshots/[scanId]/[device-slug].png`. If Playwright isn't available, a placeholder PNG is created.

5. **AI Analysis**: Uses Anthropic streaming API with vision (base64 image). Returns structured JSON with issues array.

## File Structure
```
app/
  api/
    auth/
      [...nextauth]/route.ts  - NextAuth handler
      signup/route.ts         - User registration
    projects/
      route.ts                - CRUD for projects
      [projectId]/route.ts    - Project detail/delete
    scans/
      route.ts                - Create scan + background processing
      [scanId]/route.ts       - Fetch scan results
  dashboard/
    layout.tsx                - Auth-protected layout with DashboardNav
    page.tsx                  - Main dashboard
    scan/new/page.tsx         - New scan form with progress
    scans/[scanId]/page.tsx   - Scan results with device grid
    projects/[projectId]/page.tsx - Project detail with scan history
  login/page.tsx
  signup/page.tsx
  page.tsx                    - Landing page
  layout.tsx                  - Root layout with SessionProvider + Google Fonts

lib/
  prisma.ts                   - Prisma client with Neon adapter
  auth.ts                     - NextAuth authOptions
  devices.ts                  - 10 device presets with market share
  screenshot.ts               - Playwright screenshot capture
  analysis.ts                 - Anthropic AI analysis
  email.ts                    - Resend email alerts

components/
  SessionProvider.tsx         - Client wrapper for NextAuth
  DashboardNav.tsx            - Navigation component

middleware.ts                 - Protects /dashboard/* routes
prisma/
  schema.prisma               - PostgreSQL schema
  config.ts                   - Prisma config with DATABASE_URL
```

## Design System
Colors:
- Background: `#0f1117` (primary), `#1a1d27` (secondary), `#242838` (tertiary)
- Accent: `#00d4ff` (cyan), `#0891b2` (cyan-dark)
- Text: `#e8eaf6` (primary), `#8892a4` (secondary)
- Status: `#10b981` (success), `#f59e0b` (warning), `#ef4444` (error)

Fonts: Syne (headings) + DM Sans (body) from Google Fonts

## Environment Variables Required
```
DATABASE_URL      - Neon PostgreSQL connection string
AUTH_SECRET       - NextAuth secret
NEXTAUTH_URL      - App URL
ANTHROPIC_API_KEY - Anthropic API key
RESEND_API_KEY    - (Optional) for email alerts
```

## Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npx prisma db push   # Push schema to database
npx prisma studio    # Open Prisma Studio
npx playwright install chromium --with-deps  # Install browsers
```

## AI Model
Uses `claude-opus-4-5` (not OpenAI). The model analyzes screenshots with vision and returns structured JSON with issues categorized by severity (critical/major/minor/info).

## Notes for Maintenance
- Never add `url = env("DATABASE_URL")` to schema.prisma datasource
- The Prisma preview feature `driverAdapters` must be enabled for Neon adapter
- Screenshots are stored in `public/screenshots/` and served statically
- The scan API background processing uses fire-and-forget (no edge runtime)
