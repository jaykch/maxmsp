import ffmpeg from 'fluent-ffmpeg'
import { join } from 'path'
import { app } from 'electron'
import type { ExportSettings } from '../../shared/types'

// Resolve FFmpeg binary path
// Priority: FFMPEG_PATH env var > @ffmpeg-installer/ffmpeg > system PATH
function resolveFFmpegPath(): void {
  if (process.env.FFMPEG_PATH) {
    ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH)
    return
  }

  try {
    // Try to use @ffmpeg-installer/ffmpeg if available
    const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg')
    if (ffmpegInstaller.path) {
      ffmpeg.setFfmpegPath(ffmpegInstaller.path)
      return
    }
  } catch {
    // Fall through to system PATH
  }

  // In packaged app, check resources folder
  if (app.isPackaged) {
    const platform = process.platform
    const ext = platform === 'win32' ? '.exe' : ''
    const resourcePath = join(process.resourcesPath, 'ffmpeg', `ffmpeg${ext}`)
    ffmpeg.setFfmpegPath(resourcePath)
  }
  // Otherwise, rely on system PATH
}

resolveFFmpegPath()

export function getVideoInfo(
  filePath: string
): Promise<ffmpeg.FfprobeData> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })
}

export function convertVideo(
  inputPath: string,
  outputPath: string,
  settings: ExportSettings,
  onProgress: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    let command = ffmpeg(inputPath)
      .size(`${settings.resolution.width}x${settings.resolution.height}`)
      .fps(settings.fps)

    // Set codec
    switch (settings.codec) {
      case 'h264':
        command = command.videoCodec('libx264')
        break
      case 'h265':
        command = command.videoCodec('libx265')
        break
      case 'vp9':
        command = command.videoCodec('libvpx-vp9')
        break
    }

    // Set quality
    const crfMap = { low: 28, medium: 23, high: 18, lossless: 0 }
    command = command.addOption('-crf', String(crfMap[settings.quality]))

    command
      .on('progress', (progress) => {
        onProgress(progress.percent ?? 0)
      })
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .save(outputPath)
  })
}
