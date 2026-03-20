import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock electron
vi.mock('electron', () => ({
  BrowserWindow: vi.fn(),
  app: { isPackaged: false, getPath: vi.fn(() => '/tmp') }
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
  ffmpeg.ffprobe = vi.fn()
  return { default: ffmpeg }
})

import { exportVideo } from './exporter'
import type { ProjectData, ExportSettings } from '../../shared/types'

function resolveOnEnd() {
  mockFfmpegChain.on.mockImplementation(function (this: typeof mockFfmpegChain, event: string, callback: () => void) {
    if (event === 'end') {
      setTimeout(() => callback(), 0)
    }
    return this
  })
}

function rejectOnError(message: string) {
  mockFfmpegChain.on.mockImplementation(function (this: typeof mockFfmpegChain, event: string, callback: (err: Error) => void) {
    if (event === 'error') {
      setTimeout(() => callback(new Error(message)), 0)
    }
    return this
  })
}

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

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws error when no clips exist', async () => {
    const emptyProject = { ...baseProject, clips: [] }
    await expect(
      exportVideo(mockWindow as never, emptyProject, baseSettings, '/output.mp4')
    ).rejects.toThrow('No clips to export')
  })

  it('sets up ffmpeg with correct codec for h264', async () => {
    resolveOnEnd()
    await exportVideo(mockWindow as never, baseProject, baseSettings, '/output.mp4')

    expect(mockFfmpegChain.videoCodec).toHaveBeenCalledWith('libx264')
    expect(mockFfmpegChain.fps).toHaveBeenCalledWith(30)
  })

  it('sets up ffmpeg with h265 codec', async () => {
    resolveOnEnd()
    const settings = { ...baseSettings, codec: 'h265' as const }
    await exportVideo(mockWindow as never, baseProject, settings, '/output.mp4')
    expect(mockFfmpegChain.videoCodec).toHaveBeenCalledWith('libx265')
  })

  it('sets up ffmpeg with vp9 codec', async () => {
    resolveOnEnd()
    const settings = { ...baseSettings, codec: 'vp9' as const }
    await exportVideo(mockWindow as never, baseProject, settings, '/output.mp4')
    expect(mockFfmpegChain.videoCodec).toHaveBeenCalledWith('libvpx-vp9')
  })

  it('applies correct CRF for quality levels', async () => {
    resolveOnEnd()

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
    resolveOnEnd()
    const project = {
      ...baseProject,
      clips: [{ ...baseProject.clips[0], startTime: 5, endTime: 15 }]
    }
    await exportVideo(mockWindow as never, project, baseSettings, '/output.mp4')
    expect(mockFfmpegChain.seekInput).toHaveBeenCalledWith(5)
    expect(mockFfmpegChain.duration).toHaveBeenCalledWith(10)
  })

  // --- Tests for the bugs we fixed ---

  it('does not use .size() — complexFilter handles scaling (filter conflict fix)', async () => {
    resolveOnEnd()
    await exportVideo(mockWindow as never, baseProject, baseSettings, '/output.mp4')

    // .size() was removed because it adds -vf scale=... which conflicts with -filter_complex
    expect(mockFfmpegChain).not.toHaveProperty('size')
  })

  it('uses complexFilter with correct scale dimensions accounting for padding', async () => {
    resolveOnEnd()

    const project = { ...baseProject, padding: 60 }
    const settings = { ...baseSettings, resolution: { width: 1920, height: 1080 } }
    await exportVideo(mockWindow as never, project, settings, '/output.mp4')

    const filterArg = mockFfmpegChain.complexFilter.mock.calls.at(-1)?.[0] as string
    // Video area = 1920 - 60*2 = 1800 wide, 1080 - 60*2 = 960 tall
    expect(filterArg).toContain('scale=1800:960')
    // Background should be full output resolution
    expect(filterArg).toContain('s=1920x1080')
  })

  it('builds correct filter for solid background', async () => {
    resolveOnEnd()

    const project = { ...baseProject, background: { type: 'solid' as const, color: '#ff0000' } }
    await exportVideo(mockWindow as never, project, baseSettings, '/output.mp4')

    const filterArg = mockFfmpegChain.complexFilter.mock.calls.at(-1)?.[0] as string
    expect(filterArg).toContain('color=c=#ff0000')
  })

  it('builds correct filter for gradient background (falls back to gradientStart color)', async () => {
    resolveOnEnd()

    const project = {
      ...baseProject,
      background: { type: 'gradient' as const, gradientStart: '#11998e', gradientEnd: '#38ef7d', gradientAngle: 135 }
    }
    await exportVideo(mockWindow as never, project, baseSettings, '/output.mp4')

    const filterArg = mockFfmpegChain.complexFilter.mock.calls.at(-1)?.[0] as string
    expect(filterArg).toContain('color=c=#11998e')
  })

  it('sends EXPORT_DONE on successful export', async () => {
    resolveOnEnd()
    await exportVideo(mockWindow as never, baseProject, baseSettings, '/output.mp4')

    expect(mockWindow.webContents.send).toHaveBeenCalledWith('export-done', '/output.mp4')
  })

  it('sends EXPORT_ERROR and rejects on ffmpeg error', async () => {
    rejectOnError('ffmpeg crashed')

    await expect(
      exportVideo(mockWindow as never, baseProject, baseSettings, '/output.mp4')
    ).rejects.toThrow('ffmpeg crashed')

    expect(mockWindow.webContents.send).toHaveBeenCalledWith('export-error', 'ffmpeg crashed')
  })

  it('saves to the specified output path', async () => {
    resolveOnEnd()
    await exportVideo(mockWindow as never, baseProject, baseSettings, '/tmp/test-export/Test.mp4')

    expect(mockFfmpegChain.save).toHaveBeenCalledWith('/tmp/test-export/Test.mp4')
  })

  it('does not seek when clip startTime is 0', async () => {
    resolveOnEnd()
    await exportVideo(mockWindow as never, baseProject, baseSettings, '/output.mp4')

    expect(mockFfmpegChain.seekInput).not.toHaveBeenCalled()
  })
})
