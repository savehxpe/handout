# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: Save Hxpe — Handout Remix

A scroll-driven, visual storytelling web experience built with Next.js, React (TypeScript), Tailwind CSS, GSAP (ScrollTrigger), and HTML5 Canvas.

## Build & Dev Commands

```bash
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run lint         # ESLint check
npm run start        # Serve production build
```

## Architecture

- **Framework**: Next.js App Router with TypeScript
- **Styling**: Tailwind CSS (monospace-only typography, monochrome palette)
- **Animation**: GSAP with ScrollTrigger for all scroll-linked animations
- **Rendering**: HTML5 Canvas for background visuals; must maintain `object-fit: cover` equivalent via dynamic aspect ratio calculation on resize
- **Assets**: `public/frames/` contains 122 WebP frame sequences for canvas-based animation

### Z-Index Layers

| Layer | Z-Index | Purpose |
|-------|---------|---------|
| Canvas background | `z-0` | Frame sequences, visual textures |
| UI overlays | `z-10` | Text, buttons, navigation |
| Interactive depths | `z-20`–`z-30` | CTA buttons, video player, forms |

## Design Rules (FIELD MODE)

- **Color**: Strictly monochrome — pure black (`bg-black`), pure white (`text-white`), grayscale only. No vibrant colors.
- **Typography**: Monospace fonts exclusively for all UI elements, headers, and body text.
- **Layout**: Centered, balanced, minimalist. Heavy negative space. Never clutter the viewport.
- **Buttons/Links**: Stark, 1px borders. No square brackets around button text.
- **Interactions**: Mobile touch states and hover states must provide immediate visual feedback (e.g., color inversion).

## Technical Conventions

- Functional React components only; use standard hooks (`useEffect`, `useRef`, `useState`).
- All scroll-linked animations use GSAP ScrollTrigger — do not use CSS scroll-snap or Framer Motion for scroll behavior.
- Canvas rendering must recalculate aspect ratios on every `resize` event to fill the viewport correctly.
- Keep z-index management strict: canvas at `z-0`, UI at `z-10`, no ad-hoc layering.

## DEPLOYMENT

Code must be pushed to the `main` branch of the GitHub repository. Vercel will automatically deploy to https://sh3d-seven.vercel.app/. Do NOT create new Vercel projects.
