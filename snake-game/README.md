<div align="center">
  <img src="https://res.cloudinary.com/det724qml/image/upload/v1779598010/SnakeGame_logo_tbbt6c.png" alt="Snake Game Logo" width="380" />

  <p align="center">
    <strong>A modern retro-arcade Snake web game with real-time leaderboard, custom avatar head, and 8-bit audio.</strong>
  </p>

  <p align="center">
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" /></a>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /></a>
    <a href="https://supabase.com/"><img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" /></a>
    <a href="https://vercel.com/"><img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" /></a>
  </p>
</div>

---

## 🎮 Features

- **Arcade Gameplay**: Smooth snake movement with keyboard controls (Arrow Keys, WASD) and touch-friendly on-screen D-Pad.
- **Custom Snake Head**: Personalized snake head displays your chosen profile avatar when logged in.
- **Online Leaderboard**: Real-time Top 10 global leaderboard powered by Supabase.
- **User Profiles & Authentication**: Google OAuth sign-in, nickname management, and avatar customization.
- **Color Themes**: 5 curated retro themes (Classic, Cyberpunk, GameBoy, Matcha, Sunset).
- **8-Bit Web Audio Synthesizer**: Pure browser-synthesized chiptune sound effects (eating, moving, game over) and background music with a live volume slider.
- **Supabase Keep-Alive**: Built-in automated GitHub Actions and Vercel cron mechanisms to prevent Supabase Free Tier inactivity pauses.

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Frontend Framework** | [Next.js 16 (App Router)](https://nextjs.org/), [React 19](https://react.dev/) |
| **Language & Styling** | [TypeScript](https://www.typescriptlang.org/), [TailwindCSS v4](https://tailwindcss.com/) |
| **Backend & Auth** | [Supabase Database & Authentication](https://supabase.com/) |
| **Audio Engine** | Native Web Audio API (Chiptune Synthesizer) |
| **CI/CD & Hosting** | [Vercel](https://vercel.com/), [GitHub Actions](https://github.com/features/actions) |

---

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   cd snake-game
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env.local` file inside the `snake-game/` directory:
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

## 🛡️ Supabase Keep-Alive Mechanism

Supabase Free Tier pauses inactive databases after 7 days without requests. This project includes two automated keep-alive methods:

1. **GitHub Actions Workflow** (`.github/workflows/supabase-keep-alive.yml`):
   - Automatically pings the Supabase REST API every 2 days (`0 0 */2 * *`).
   - Requires repository secrets `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` configured under **Settings ➡️ Secrets and variables ➡️ Actions**.
2. **Next.js Keep-Alive Route** (`/api/keep-alive`):
   - Configured in `vercel.json` for Vercel Cron deployments, or can be triggered via free webhook services (e.g. cron-job.org).

---

## 📦 Build & Production

```bash
npm run build
npm run start
```
