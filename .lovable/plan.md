

# LandingCraft AI — Implementation Plan

## Overview
A web app that generates modern, production-ready landing pages with Anime.js animations using AI. Built with React, Vite, TypeScript, TailwindCSS, and Shadcn UI.

---

## Page 1: Home / Generator Page (`/`)

**Hero Section**
- App branding "LandingCraft AI" with animated gradient text
- Tagline explaining the tool's purpose
- Dark mode toggle in the top-right corner

**Generator Form**
- **Project Type** — dropdown: Portfolio, Startup, Product Landing Page, Personal Profile
- **Title** — text input
- **Description** — textarea
- **Style Preference** — toggle group: Minimal, Dark, Colorful
- **Primary Color** — color picker with preset swatches
- **"Generate Landing Page"** button with loading state + animation

**Design**
- Clean, modern SaaS aesthetic with Inter font
- Subtle floating background shapes animated with Anime.js
- Card-based form layout, generous spacing

---

## Page 2: Result Page (`/result`)

**Live Preview Panel**
- Sandboxed iframe rendering the full generated landing page (HTML + TailwindCSS + Anime.js)
- Desktop/tablet/mobile viewport toggle buttons above the preview

**Code Panel**
- Syntax-highlighted code view (using a lightweight highlighter)
- "Copy Code" button — copies full HTML to clipboard
- "Download HTML" button — exports as a standalone `.html` file

**Actions**
- "Back to Generator" button
- "Save to History" — auto-saves on generation

---

## Page 3: History Page (`/history`)

- List of previously generated landing pages stored in localStorage
- Each entry shows: title, project type, date, style preference
- Click to re-open the result (preview + code)
- Delete individual entries or clear all

---

## AI Generation Logic (Lovable AI via Edge Function)

**Backend edge function** (`supabase/functions/generate-landing/index.ts`):
- Receives project type, title, description, style, and primary color
- Sends a carefully crafted prompt to Lovable AI (Gemini model)
- Instructs the AI to return a **complete, self-contained HTML file** including:
  - Semantic HTML5 structure
  - TailwindCSS via CDN
  - Anime.js via CDN
  - Inline `<script>` with scroll-reveal, hero animations, staggered cards, floating shapes
  - Responsive design with mobile-first approach
  - Realistic content (no lorem ipsum)
  - User's chosen primary color applied throughout
  - Gradient backgrounds and modern typography
- Returns the generated HTML as a string (non-streaming, since we need the full page)

---

## Animations (Anime.js in the App Itself)

- Hero text fade-in + slide-up on page load
- Form card scale-in entrance
- Staggered animation on style preference options
- Generate button pulse/scale on hover
- Background floating shapes (subtle, decorative)
- Page transitions with fade effects

---

## Features Summary

| Feature | Details |
|---|---|
| Dark mode | Toggle via `next-themes`, persisted |
| Live preview | Sandboxed iframe with viewport switching |
| Code view | Syntax highlighted, copyable |
| Export | Download as standalone HTML file |
| History | localStorage, browse/delete past generations |
| Responsive | Fully responsive app UI |

---

## Infrastructure Needed

- **Lovable Cloud** — to host the edge function
- **Lovable AI** — built-in AI gateway (no API key setup required)
- **npm packages to add**: `animejs` for app animations, a lightweight syntax highlighter

