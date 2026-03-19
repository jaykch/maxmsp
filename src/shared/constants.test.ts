import { describe, it, expect } from 'vitest'
import {
  IPC,
  DEFAULT_BACKGROUND,
  RESOLUTION_PRESETS,
  DEFAULT_FPS,
  DEFAULT_PADDING,
  DEFAULT_BORDER_RADIUS,
  AUTO_ZOOM_SCALE,
  AUTO_ZOOM_DURATION_MS,
  ZOOM_EASE_DURATION_MS
} from './constants'

describe('IPC constants', () => {
  it('defines all required IPC channels', () => {
    expect(IPC.GET_SOURCES).toBe('get-sources')
    expect(IPC.START_RECORDING).toBe('start-recording')
    expect(IPC.STOP_RECORDING).toBe('stop-recording')
    expect(IPC.RECORDING_STARTED).toBe('recording-started')
    expect(IPC.RECORDING_STOPPED).toBe('recording-stopped')
    expect(IPC.INPUT_EVENT).toBe('input-event')
    expect(IPC.EXPORT_VIDEO).toBe('export-video')
    expect(IPC.EXPORT_PROGRESS).toBe('export-progress')
    expect(IPC.EXPORT_DONE).toBe('export-done')
    expect(IPC.EXPORT_ERROR).toBe('export-error')
    expect(IPC.SAVE_PROJECT).toBe('save-project')
    expect(IPC.LOAD_PROJECT).toBe('load-project')
  })
})

describe('DEFAULT_BACKGROUND', () => {
  it('is a gradient type', () => {
    expect(DEFAULT_BACKGROUND.type).toBe('gradient')
  })

  it('has gradient colors defined', () => {
    expect(DEFAULT_BACKGROUND.gradientStart).toBeTruthy()
    expect(DEFAULT_BACKGROUND.gradientEnd).toBeTruthy()
  })

  it('has gradient angle', () => {
    expect(DEFAULT_BACKGROUND.gradientAngle).toBe(135)
  })
})

describe('RESOLUTION_PRESETS', () => {
  it('defines 720p', () => {
    expect(RESOLUTION_PRESETS['720p']).toEqual({ width: 1280, height: 720 })
  })

  it('defines 1080p', () => {
    expect(RESOLUTION_PRESETS['1080p']).toEqual({ width: 1920, height: 1080 })
  })

  it('defines 1440p', () => {
    expect(RESOLUTION_PRESETS['1440p']).toEqual({ width: 2560, height: 1440 })
  })

  it('defines 4K', () => {
    expect(RESOLUTION_PRESETS['4K']).toEqual({ width: 3840, height: 2160 })
  })
})

describe('default values', () => {
  it('has reasonable defaults', () => {
    expect(DEFAULT_FPS).toBe(30)
    expect(DEFAULT_PADDING).toBe(40)
    expect(DEFAULT_BORDER_RADIUS).toBe(12)
    expect(AUTO_ZOOM_SCALE).toBe(2.0)
    expect(AUTO_ZOOM_DURATION_MS).toBe(800)
    expect(ZOOM_EASE_DURATION_MS).toBe(300)
  })
})
