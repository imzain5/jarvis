# ZAYN // JARVIS UI

A cinematic, futuristic web app built as a portfolio-worthy MVP that turns the browser into a holographic command room. The experience is hand-first: users arm the interface with an open palm, pinch to grab floating panels, swipe between panel constellations, and use face and eye-region estimation as intelligent focus assistance instead of a fake gaze cursor.

## What It Is

`ZAYN // JARVIS UI` is a browser-native immersive interface concept built for:

- hand-controlled panel interaction
- attention-reactive UI focus
- premium sci-fi motion design
- a Vercel-friendly deployment model with no backend, auth, or database

The app opens into a full-screen dark command room with:

- a glowing central reactor core
- floating holographic panels
- cinematic bloom, scan lines, glow, and depth
- onboarding for camera control and calibration
- real-time MediaPipe-driven gesture and face focus assistance

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- React Three Fiber
- `motion` for UI animation
- MediaPipe Tasks Vision in the browser
- Zustand for interaction state

## Features

- Open-palm arming mode for interaction readiness
- Pinch selection and drag for floating cards
- Swipe left and right to cycle panel groups
- Grab / long pinch-hold expansion into a full immersive panel
- Two-hand spread assist when tracking is stable
- Face and eye-region based focus estimation with dwell lock
- Blink-to-confirm fallback for locked panels when confidence is high
- Lightweight calibration flow to bias focus estimation
- Graceful fallback to hand-first interaction when eye confidence drops

## Local Setup

1. Install Node.js 20.10+.
2. Clone the repo.
3. Install dependencies:

```bash
npm install
```

## Run The Dev Server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Build For Production

```bash
npm run build
npm run start
```

## Deploy To Vercel

1. Push the repository to GitHub.
2. Import the repo into Vercel.
3. Use the default Next.js framework detection.
4. Deploy without extra environment variables.

This MVP does not require a database, auth provider, or custom backend infrastructure.

## Camera + Vision Notes

- The app uses browser webcam access only after the user explicitly enables camera control.
- MediaPipe models are loaded client-side in the browser.
- No camera data is sent to a backend by this project.

## Known Limitations

- Eye tracking is focus assistance, not a true gaze cursor.
- Webcam lighting and framing strongly affect tracking quality.
- Blink and gaze-assisted behavior vary by device, camera quality, and browser performance.
- Two-hand expansion is opportunistic and gracefully falls back to long pinch-hold expansion when confidence is weaker.

## Project Structure

```text
app/
  globals.css
  layout.tsx
  page.tsx
src/
  components/
  hooks/
  lib/
  store/
  types/
```

## Interaction Summary

- Open palm: arm the system and wake nearby panels
- Pinch: select and begin direct manipulation
- Pinch + move: drag a panel with smoothed motion
- Swipe left/right: rotate to the next panel constellation
- Grab or long hold: pull a panel into expanded mode
- Focus dwell: bias targeting toward the panel you are likely looking at

## Environment Variables

None required for the MVP.
