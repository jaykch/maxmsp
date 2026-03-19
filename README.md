# ClipStudio

Cross-platform screen recorder and video editor with auto-zoom, customizable backgrounds, and polished export — a Screen Studio alternative for Mac and Windows.

## Features

- **Screen Recording** — Capture any screen, window, or region
- **Auto-Zoom** — Automatically zoom into mouse clicks and keyboard activity
- **Backgrounds** — Gradient, solid color, and image backgrounds
- **Device Frames** — MacBook, iPhone, and browser window overlays
- **Timeline Editor** — Trim, cut, and adjust zoom keyframes
- **Export** — MP4/WebM with configurable resolution, quality, and frame rate

## Tech Stack

- Electron + electron-vite
- React 18 + TypeScript
- Tailwind CSS
- Zustand (state management)
- Canvas/WebGL (preview rendering)
- FFmpeg (video export)

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build:mac    # macOS
npm run build:win    # Windows
npm run build:linux  # Linux
```

## Project Structure

```
src/
├── main/          # Electron main process (capture, FFmpeg, IPC)
├── preload/       # Preload script (API bridge)
├── renderer/      # React app (UI, canvas, stores)
└── shared/        # Shared types and constants
```
