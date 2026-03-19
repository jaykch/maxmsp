import ffmpeg from 'fluent-ffmpeg'
import type { ExportSettings } from '../../shared/types'

// FFmpeg binary is expected on PATH or can be configured via FFMPEG_PATH env var
// For production builds, bundle ffmpeg-static and set the path here
if (process.env.FFMPEG_PATH) {
  ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH)
}

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
