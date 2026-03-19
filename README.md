# ClipStudio

Free, open-source screen recorder with auto-zoom, beautiful backgrounds, and polished export. A Screen Studio alternative for Mac, Windows, and Linux.

## Features

- **Screen Recording** - Capture any screen or window via Electron's desktopCapturer
- **Auto-Zoom** - Automatically generates smooth zoom keyframes on mouse clicks
- **Backgrounds** - 8 preset gradients and solid colors, with custom gradient support
- **Device Frames** - MacBook, iPhone, and browser window overlays (coming soon)
- **Timeline Editor** - Visual timeline with clip tracks, zoom keyframe editing, and playhead
- **Canvas Preview** - Real-time preview with zoom interpolation, padding, rounded corners, and shadows
- **Export** - MP4/WebM via FFmpeg with configurable resolution (720p-4K), quality, and frame rate

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [FFmpeg](https://ffmpeg.org/) installed and on your PATH (or set `FFMPEG_PATH` env var)

### Install & Run

```bash
git clone https://github.com/jaykch/clipstudio.git
cd clipstudio
npm install
npm run dev
```

### Build for Distribution

```bash
# macOS
npm run build:mac

# Windows
npm run build:win

# Linux
npm run build:linux
```

### Run Tests

```bash
npm test              # single run
npm run test:watch    # watch mode
```

## How It Works

1. **Record** - Click "Record", pick a screen/window. ClipStudio captures video via MediaRecorder and tracks mouse/keyboard input at 60fps in parallel.

2. **Auto-Zoom** - After recording, click events are analyzed to generate zoom keyframes. Each click creates a smooth zoom-in (2x) with spring-physics easing, then zooms back out.

3. **Edit** - Use the timeline to trim clips, adjust zoom keyframes, change backgrounds, tweak padding/radius/shadow in the inspector panel.

4. **Export** - FFmpeg composes the final video with background, zoom effects, and your chosen codec/quality settings.

## Architecture

```
src/
├── main/              # Electron main process
│   ├── index.ts       # Window creation, app lifecycle
│   ├── ipc/           # IPC handlers (bridge between main and renderer)
│   ├── capture/       # Screen capture, input tracking
│   └── video/         # FFmpeg encoding, video info
├── preload/           # Secure context bridge (exposes window.api)
├── renderer/          # React app
│   ├── components/    # UI: Toolbar, Preview, Timeline, Inspector, SourcePicker, ExportDialog
│   ├── stores/        # Zustand state: project, recording, UI
│   ├── canvas/        # Canvas 2D preview renderer, backgrounds, device frames
│   └── utils/         # Keyframe interpolation, timecode formatting, easing
└── shared/            # Types and constants shared across processes
```

### Key Design Decisions

- **Two-pass model**: Raw video + input events captured separately. All effects (zoom, background, frame) applied at preview/export time. Raw video is never modified.
- **Cursor is a data layer**: Mouse events stored as timestamped JSON, not baked into capture. Enables post-hoc smoothing and style customization.
- **Canvas 2D preview**: Renders video frames with zoom transforms, backgrounds, shadows in real-time via `requestAnimationFrame`.
- **FFmpeg as child process**: Native FFmpeg for export (not ffmpeg.wasm) for full performance and codec support.

## Tech Stack

| Layer | Tech |
|-------|------|
| Desktop shell | Electron 33 |
| Build tools | electron-vite, Vite, TypeScript |
| UI framework | React 18 |
| State management | Zustand |
| Styling | Tailwind CSS |
| Video export | FFmpeg (fluent-ffmpeg) |
| Preview | Canvas 2D API |
| Testing | Vitest |

## Contributing

1. Fork the repo
2. Create a branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`) and typecheck (`npm run typecheck`)
5. Commit and push
6. Open a PR

### Development Tips

- `npm run dev` starts Electron with hot reload for the renderer
- Main process changes require a restart
- Set `FFMPEG_PATH=/path/to/ffmpeg` if FFmpeg isn't on your PATH
- The project uses strict TypeScript - fix type errors before committing

## Roadmap

- [ ] Audio recording (system audio + microphone)
- [ ] Device frame PNG assets (MacBook, iPhone, browser)
- [ ] Custom image backgrounds
- [ ] Drag-and-drop clip reordering on timeline
- [ ] Undo/redo (Zustand temporal middleware)
- [ ] Keyboard shortcuts (Space for play/pause, S for split, etc.)
- [ ] Native capture addons (ScreenCaptureKit on macOS, WGC on Windows)
- [ ] Region capture (select area of screen)
- [ ] Cursor style customization (size, color, highlight)

## License

[MIT](LICENSE)
