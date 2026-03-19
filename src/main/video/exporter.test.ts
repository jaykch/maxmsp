import { describe, it, expect, vi } from 'vitest'

// Mock electron
vi.mock('electron', () => ({
  BrowserWindow: vi.fn()
}))

// Mock fs/promises
vi.mock('fs/promises', async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>
  return {
    ...actual,
    mkdir: vi.fn(() => Promise.resolve())
  }
})

// Mock fluent-ffmpeg
const mockFfmpegChain = {
  complexFilter: vi.fn().mockReturnThis(),
  size: vi.fn().mockReturnThis(),
  fps: vi.fn().mockReturnThis(),
  videoCodec: vi.fn().mockReturnThis(),
  addOption: vi.fn().mockReturnThis(),
  seekInput: vi.fn().mockReturnThis(),
  duration: vi.fn().mockReturnThis(),
  on: vi.fn().mockReturnThis(),
  save: vi.fn().mockReturnThis()
}

vi.mock('fluent-ffmpeg', () => {
  const ffmpeg = vi.fn(() => mockFfmpegChain) as unknown as Record<string, unknown>
  ffmpeg.setFfmpegPath = vi.fn()
  return { default: ffmpeg }
})

import { exportVideo } from './exporter'
import type { ProjectData, ExportSettings } from '../../shared/types'

describe('exportVideo', () => {
  const mockWindow = {
    webContents: {
      send: vi.fn()
    }
  }

  const baseProject: ProjectData = {
    id: 'test-project',
    name: 'Test',
    clips: [
      {
        id: 'clip-1',
        filePath: '/path/to/video.webm',
        startTime: 0,
        endTime: 10,
        duration: 10,
        offset: 0
      }
    ],
    zoomKeyframes: [],
    background: { type: 'solid', color: '#000000' },
    deviceFrame: null,
    padding: 40,
    borderRadius: 12,
    shadow: true,
    resolution: { width: 1920, height: 1080 }
  }

  const baseSettings: ExportSettings = {
    format: 'mp4',
    resolution: { width: 1920, height: 1080 },
    fps: 30,
    quality: 'high',
    codec: 'h264'
  }

  it('throws error when no clips exist', async () => {
    const emptyProject = { ...baseProject, clips: [] }
    await expect(
      exportVideo(mockWindow as never, emptyProject, baseSettings, '/output.mp4')
    ).rejects.toThrow('No clips to export')
  })

  it('sets up ffmpeg with correct codec for h264', async () => {
    // Make on('end') resolve
    mockFfmpegChain.on.mockImplementation(function (this: typeof mockFfmpegChain, event: string, callback: () => void) {
      if (event === 'end') {
        setTimeout(() => callback(), 0)
      }
      return this
    })

    const promise = exportVideo(mockWindow as never, baseProject, baseSettings, '/output.mp4')
    await promise

    expect(mockFfmpegChain.videoCodec).toHaveBeenCalledWith('libx264')
    expect(mockFfmpegChain.fps).toHaveBeenCalledWith(30)
  })

  it('sets up ffmpeg with h265 codec', async () => {
    mockFfmpegChain.on.mockImplementation(function (this: typeof mockFfmpegChain, event: string, callback: () => void) {
      if (event === 'end') {
        setTimeout(() => callback(), 0)
      }
      return this
    })

    const settings = { ...baseSettings, codec: 'h265' as const }
    await exportVideo(mockWindow as never, baseProject, settings, '/output.mp4')
    expect(mockFfmpegChain.videoCodec).toHaveBeenCalledWith('libx265')
  })

  it('sets up ffmpeg with vp9 codec', async () => {
    mockFfmpegChain.on.mockImplementation(function (this: typeof mockFfmpegChain, event: string, callback: () => void) {
      if (event === 'end') {
        setTimeout(() => callback(), 0)
      }
      return this
    })

    const settings = { ...baseSettings, codec: 'vp9' as const }
    await exportVideo(mockWindow as never, baseProject, settings, '/output.mp4')
    expect(mockFfmpegChain.videoCodec).toHaveBeenCalledWith('libvpx-vp9')
  })

  it('applies correct CRF for quality levels', async () => {
    mockFfmpegChain.on.mockImplementation(function (this: typeof mockFfmpegChain, event: string, callback: () => void) {
      if (event === 'end') {
        setTimeout(() => callback(), 0)
      }
      return this
    })

    for (const [quality, crf] of [
      ['low', '28'],
      ['medium', '23'],
      ['high', '18'],
      ['lossless', '0']
    ] as const) {
      mockFfmpegChain.addOption.mockClear()
      const settings = { ...baseSettings, quality }
      await exportVideo(mockWindow as never, baseProject, settings, '/output.mp4')
      expect(mockFfmpegChain.addOption).toHaveBeenCalledWith('-crf', crf)
    }
  })

  it('applies seek for clips with startTime > 0', async () => {
    mockFfmpegChain.on.mockImplementation(function (this: typeof mockFfmpegChain, event: string, callback: () => void) {
      if (event === 'end') {
        setTimeout(() => callback(), 0)
      }
      return this
    })

    const project = {
      ...baseProject,
      clips: [{ ...baseProject.clips[0], startTime: 5, endTime: 15 }]
    }
    await exportVideo(mockWindow as never, project, baseSettings, '/output.mp4')
    expect(mockFfmpegChain.seekInput).toHaveBeenCalledWith(5)
    expect(mockFfmpegChain.duration).toHaveBeenCalledWith(10)
  })
})
