# Snake Game (Next.js + Supabase)

A retro-modern Snake game built with **Next.js**, **TailwindCSS**, and **Supabase**.

---

## Features
- Smooth arcade Snake gameplay.
- Real-time online Leaderboard powered by Supabase.
- Google Authentication, custom profile & avatars.
- **Settings Modal**: 5 Retro color themes, 8-Bit Web Audio sound effects, volume slider & background music.
- **Supabase Keep-Alive Mechanism**: Automatically prevents Supabase Free Tier from pausing due to inactivity.

---

## Getting Started Locally

1. **Install dependencies**:
   ```bash
   cd snake-game
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env.local` file inside the `snake-game` folder:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Supabase Keep-Alive Mechanism

Supabase Free Tier automatically pauses inactive projects after 7 days without queries. This repository includes two mechanisms to keep your database active:

### 1. GitHub Actions Cron Job (Recommended)
- Workflow file: `.github/workflows/supabase-keep-alive.yml`
- Runs automatically every 2 days (`0 0 */2 * *`) to ping the Supabase REST API directly.
- **Setup in GitHub**:
  Navigate to your GitHub Repository ➡️ **Settings** ➡️ **Secrets and variables** ➡️ **Actions** ➡️ Add 2 Repository secrets:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- You can also trigger it manually anytime via the **Actions** tab with **"Run workflow"**.

### 2. Next.js API Route + Vercel Cron
- Endpoint: `/api/keep-alive`
- Configured in `vercel.json` to automatically trigger every 2 days when deployed on Vercel.
- Can also be pinged by external free webhook services such as [cron-job.org](https://cron-job.org) or [UptimeRobot](https://uptimerobot.com).

---

## Build & Test
```bash
npm run build
```
