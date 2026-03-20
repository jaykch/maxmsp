# MaxMSP Handoff

## Context

The `maxmsp` folder is a small Electron + React app named `ClipStudio`. The user reported:

- the play button is not working
- recording does not load after capture

I reviewed the local codebase, ran tests, and checked type safety.

## Current Status

- `npm test`: passing
- `npm run typecheck`: clean
- git worktree: clean

These checks do not cover the real Electron media path, so they do not rule out runtime capture/playback bugs.

## Primary Findings

### 1. Recording save race

The strongest bug is in the recording completion flow:

- File: `src/renderer/stores/recording.ts`
- In `recorder.onstop`, the blob is converted to an `ArrayBuffer`
- `window.api.saveRecordingChunk(filePath, buffer)` is called
- That IPC call is fire-and-forget
- The code immediately calls `projectStore.addClip(filePath, duration)`

This means the preview can try to load the recorded `.webm` before the main process has finished writing it to disk.

Relevant files:

- `src/renderer/stores/recording.ts`
- `src/preload/index.ts`
- `src/main/capture/recorder.ts`

### 2. Bad local file URL construction

Preview video loading is fragile:

- File: `src/renderer/components/Preview/Preview.tsx`
- Source path is built with manual string concatenation:
  - ``file://${clips[0].filePath}``

This is unsafe for paths with spaces or special characters. On macOS the app data path commonly contains `Application Support`, so this can easily break local video loading.

The fix should use a proper file URL conversion, not manual string building.

### 3. Play button likely fails because media never becomes playable

The timeline play button itself is simple:

- File: `src/renderer/components/Timeline/Timeline.tsx`
- It only toggles `isPlaying`

Preview reacts to that state here:

- File: `src/renderer/components/Preview/Preview.tsx`
- Calls `video.play()` when `isPlaying === true`

Problems:

- no handling for `video.play()` rejection
- no `onerror` handling
- no `onended` handling
- no visible failure state if media fails to load

So if the recording file is invalid, missing, or not yet written, the UI just looks like a broken play button.

### 4. Recording pipeline is partially wired

There are signs this code path is incomplete:

- `startRecording(...)` passes `audio: true`
- the actual renderer `getUserMedia(...)` call uses `audio: false`
- main process creates a hidden `recordingWindow`, but recording still happens in the main renderer

This inconsistency is not necessarily the immediate bug, but it suggests the capture path was not fully finished.

## Recommended Fix Order

### Step 1. Make recording save awaitable

Change the save IPC from one-way event to request/response:

- preload should expose `saveRecordingChunk(...): Promise<void>`
- main process should handle it with `ipcMain.handle(...)`
- renderer `onstop` should `await` that save before calling `addClip(...)`

Goal:

- the clip should only be added after the `.webm` exists on disk

### Step 2. Use proper file URL encoding

In preview loading:

- replace manual `file://` construction
- use `pathToFileURL(...)` in a safe place, or otherwise ensure the local path is converted to a valid encoded file URL

If this must stay renderer-side, confirm the chosen approach works in the Electron renderer with context isolation.

### Step 3. Harden playback behavior

Add explicit media handling in `Preview.tsx`:

- log or surface `video.onerror`
- handle `video.onended` by resetting `isPlaying`
- catch `video.play()` promise rejection
- consider clearing the current clip or showing a visible error when media cannot load

### Step 4. Verify end-to-end in the actual app

After the code fix, test this manually:

1. Run `npm run dev`
2. Start a screen recording
3. Stop recording
4. Confirm a clip appears and preview renders first frame
5. Click play
6. Confirm timeline time advances and playback stops correctly at end

## Key Files

- `src/renderer/stores/recording.ts`
- `src/renderer/components/Preview/Preview.tsx`
- `src/renderer/components/Timeline/Timeline.tsx`
- `src/preload/index.ts`
- `src/main/ipc/handlers.ts`
- `src/main/capture/recorder.ts`

## Notes For The Next Agent

- Start with the recording save flow first. That is the most credible root cause.
- Do not assume passing tests mean the issue is fixed.
- Be careful not to overfit on the play button UI. The play control is probably only exposing the failed recording load.
