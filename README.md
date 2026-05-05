# Fonts.pace

An automated Instagram carousel generator that discovers new fonts and color palettes, renders them as beautiful 1080×1080 slides, and publishes them as Instagram carousels — all on a daily schedule.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Slide rendering | Satori + @resvg/resvg-js |
| Image storage | Vercel Blob |
| State / dedup | Vercel KV (Redis) |
| Font discovery | Google Fonts API, Fontshare API |
| Palette discovery | ColorHunt |
| Publishing | Instagram Graph API (Carousel) |
| Scheduling | Vercel Cron + GitHub Actions |

## How the Pipeline Works

1. **Discover** — The cron job hits `/api/cron`. It calls Google Fonts and Fontshare to find recently added fonts, and scrapes ColorHunt for popular palettes. Already-seen items are filtered out via a Redis set.
2. **Render** — Each item is rendered to a 1080×1080 PNG using Satori (JSX → SVG) and resvg-js (SVG → PNG). Slides are uploaded to Vercel Blob.
3. **Stage** — A `Post` record (with slide URLs and a draft caption) is saved to Vercel KV with `status: pending`.
4. **Review** — The dashboard at `/dashboard` shows all pending posts. You can preview the slides, edit the caption, then **Publish now** or **Reject**.
5. **Publish** — Clicking Publish calls `/api/publish`, which uploads slides to Instagram as carousel items, creates a carousel container, and publishes it. The post status is updated to `published`.

## Setup

### 1. Clone & install

\`\`\`bash
git clone https://github.com/RealNickey/-fonts.pace.git
cd -fonts.pace
npm install
\`\`\`

### 2. Environment variables

Copy `.env.local.example` to `.env.local` and fill in every value:

\`\`\`bash
cp .env.local.example .env.local
\`\`\`

| Variable | Description |
|---|---|
| `GOOGLE_FONTS_API_KEY` | Google Fonts Developer API key |
| `IG_ACCESS_TOKEN` | Instagram Graph API long-lived access token |
| `IG_USER_ID` | Your Instagram Business / Creator account ID |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob read/write token |
| `KV_URL` | Vercel KV connection URL |
| `KV_REST_API_URL` | Vercel KV REST API base URL |
| `KV_REST_API_TOKEN` | Vercel KV REST API token |
| `KV_REST_API_READ_ONLY_TOKEN` | Vercel KV REST API read-only token |
| `CRON_SECRET` | Random secret to protect the `/api/cron` endpoint |
| `NEXT_PUBLIC_BRAND_HANDLE` | Your Instagram handle (e.g. `@fonts.pace`) |
| `NEXT_PUBLIC_BASE_URL` | Full origin URL of your deployment |

### 3. Run locally

\`\`\`bash
npm run dev
\`\`\`

Open http://localhost:3000 — it redirects to `/dashboard`.

## Deploy to Vercel

1. Push the repo to GitHub.
2. Import the project in the Vercel dashboard.
3. Add all environment variables in **Project → Settings → Environment Variables**.
4. Create a **Vercel Blob** store and a **Vercel KV** store and link them to the project.
5. Deploy. The `vercel.json` cron triggers `/api/cron` every day at 05:00 UTC.

## Triggering the Pipeline

### Manually from the dashboard

Click **Run Pipeline** in the top-right of `/dashboard`.

### Via Vercel Cron (automatic)

`vercel.json` schedules `/api/cron` at `0 5 * * *` (05:00 UTC daily).

### Via GitHub Actions (backup)

Add two repository secrets: `VERCEL_CRON_URL` and `CRON_SECRET`. The workflow in `.github/workflows/pipeline.yml` runs daily at 05:00 UTC and can be triggered manually from the Actions tab.

## Instagram Token Refresh

Instagram long-lived tokens expire after **60 days**. Refresh before expiry:

\`\`\`bash
curl -X GET "https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=YOUR_TOKEN"
\`\`\`

Update `IG_ACCESS_TOKEN` in your Vercel environment variables and redeploy.
