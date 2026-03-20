export const IPC = {
  GET_SOURCES: 'get-sources',
  START_RECORDING: 'start-recording',
  STOP_RECORDING: 'stop-recording',
  RECORDING_STARTED: 'recording-started',
  RECORDING_STOPPED: 'recording-stopped',
  INPUT_EVENT: 'input-event',
  EXPORT_VIDEO: 'export-video',
  EXPORT_PROGRESS: 'export-progress',
  EXPORT_DONE: 'export-done',
  EXPORT_ERROR: 'export-error',
  GET_RECORDING_PATH: 'get-recording-path',
  SAVE_PROJECT: 'save-project',
  LOAD_PROJECT: 'load-project'
} as const

// Default is a solid dark — the wallpaper images are set at runtime via the UI
export const DEFAULT_BACKGROUND: import('./types').BackgroundConfig = {
  type: 'solid',
  color: '#0c0c14'
}

export const RESOLUTION_PRESETS = {
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
  '1440p': { width: 2560, height: 1440 },
  '4K': { width: 3840, height: 2160 }
} as const

export const DEFAULT_FPS = 30
export const DEFAULT_PADDING = 40
export const DEFAULT_BORDER_RADIUS = 12
export const AUTO_ZOOM_SCALE = 2.0
export const AUTO_ZOOM_DURATION_MS = 800
export const ZOOM_EASE_DURATION_MS = 300
