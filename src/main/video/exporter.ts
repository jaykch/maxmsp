import { BrowserWindow, app } from 'electron'
import { join, dirname } from 'path'
import { mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import ffmpeg from 'fluent-ffmpeg'
import type { ProjectData, ExportSettings, ZoomKeyframe, BackgroundConfig } from '../../shared/types'
import { IPC } from '../../shared/constants'

// Import ffmpeg.ts to trigger the FFmpeg path resolver (handles env var, @ffmpeg-installer, bundled, system PATH)
import './ffmpeg'

function buildBackgroundFilter(bg: BackgroundConfig, width: number, height: number): string {
  if (bg.type === 'solid' && bg.color) {
    return `color=c=${bg.color}:s=${width}x${height}:d=1`
  }
  // For gradients, generate a gradient background
  const start = bg.gradientStart || '#667eea'
  const end = bg.gradientEnd || '#764ba2'
  return `gradients=s=${width}x${height}:c0=${start}:c1=${end}:nb_colors=2`
}

function interpolateKeyframes(
  keyframes: ZoomKeyframe[],
  time: number
): { x: number; y: number; scale: number } {
  if (keyframes.length === 0) return { x: 0.5, y: 0.5, scale: 1 }

  const sorted = [...keyframes].sort((a, b) => a.time - b.time)

  // Before first keyframe
  if (time <= sorted[0].time) {
    return { x: sorted[0].x, y: sorted[0].y, scale: sorted[0].scale }
  }

  // After last keyframe
  if (time >= sorted[sorted.length - 1].time) {
    const last = sorted[sorted.length - 1]
    return { x: last.x, y: last.y, scale: last.scale }
  }

  // Find surrounding keyframes
  for (let i = 0; i < sorted.length - 1; i++) {
    if (time >= sorted[i].time && time <= sorted[i + 1].time) {
      const t = (time - sorted[i].time) / (sorted[i + 1].time - sorted[i].time)
      // Simple ease-in-out interpolation
      const eased = t * t * (3 - 2 * t)
      return {
        x: sorted[i].x + (sorted[i + 1].x - sorted[i].x) * eased,
        y: sorted[i].y + (sorted[i + 1].y - sorted[i].y) * eased,
        scale: sorted[i].scale + (sorted[i + 1].scale - sorted[i].scale) * eased
      }
    }
  }

  return { x: 0.5, y: 0.5, scale: 1 }
}

/**
 * Resolve a wallpaper source filename to an absolute filesystem path.
 * Checks dev source path first, then production output path.
 */
function resolveWallpaperPath(sourceFileName: string): string | null {
  const candidates = [
    // Dev mode: source directory
    join(app.getAppPath(), 'src/renderer/assets/wallpapers', sourceFileName),
    // Production: built output
    join(__dirname, '../renderer/assets/wallpapers', sourceFileName),
    join(process.resourcesPath || '', 'app/out/renderer/assets/wallpapers', sourceFileName)
  ]

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate
  }
  return null
}

export async function exportVideo(
  mainWindow: BrowserWindow,
  project: ProjectData,
  settings: ExportSettings,
  outputPath: string
): Promise<void> {
  await mkdir(dirname(outputPath), { recursive: true })

  const { width, height } = settings.resolution
  const clip = project.clips[0]
  if (!clip) throw new Error('No clips to export')

  const bg = project.background
  const padding = project.padding || 0
  const videoWidth = width - padding * 2
  const videoHeight = height - padding * 2

  // Check if we have a wallpaper image to use as background
  const wallpaperPath = bg.type === 'image' && bg.sourceFileName
    ? resolveWallpaperPath(bg.sourceFileName)
    : null

  const filters: string[] = []

  if (wallpaperPath) {
    // Two inputs: [0] = video, [1] = wallpaper image
    // Scale wallpaper to output size, scale video with padding, overlay
    filters.push(`[1:v]scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height}[bg]`)
    filters.push(`[0:v]scale=${videoWidth}:${videoHeight}:force_original_aspect_ratio=decrease[scaled]`)
    filters.push(`[bg][scaled]overlay=(W-w)/2:(H-h)/2[out]`)
  } else {
    // Solid/gradient: use color filter as background
    let bgFilter: string
    if (bg.type === 'solid') {
      bgFilter = `color=c=${bg.color || '#000000'}:s=${width}x${height}`
    } else if (bg.type === 'gradient') {
      bgFilter = `color=c=${bg.gradientStart || '#667eea'}:s=${width}x${height}`
    } else {
      bgFilter = `color=c=#000000:s=${width}x${height}`
    }
    filters.push(`[0:v]scale=${videoWidth}:${videoHeight}:force_original_aspect_ratio=decrease[scaled]`)
    filters.push(`${bgFilter}[bg]`)
    filters.push(`[bg][scaled]overlay=(W-w)/2:(H-h)/2[out]`)
  }

  return new Promise((resolve, reject) => {
    const command = ffmpeg(clip.filePath)

    // Add wallpaper as second input if available
    if (wallpaperPath) {
      command.input(wallpaperPath).inputOptions('-loop', '1')
    }

    command
      .complexFilter(filters.join(';'), 'out')
      .fps(settings.fps)

    // Set codec
    switch (settings.codec) {
      case 'h264':
        command.videoCodec('libx264')
        break
      case 'h265':
        command.videoCodec('libx265')
        break
      case 'vp9':
        command.videoCodec('libvpx-vp9')
        break
    }

    const crfMap = { low: 28, medium: 23, high: 18, lossless: 0 }
    command.addOption('-crf', String(crfMap[settings.quality]))

    if (clip.startTime > 0) {
      command.seekInput(clip.startTime)
    }
    if (clip.endTime > 0) {
      command.duration(clip.endTime - clip.startTime)
    }

    command
      .on('progress', (progress) => {
        mainWindow.webContents.send(IPC.EXPORT_PROGRESS, progress.percent ?? 0)
      })
      .on('end', () => {
        mainWindow.webContents.send(IPC.EXPORT_DONE, outputPath)
        resolve()
      })
      .on('error', (err) => {
        mainWindow.webContents.send(IPC.EXPORT_ERROR, err.message)
        reject(err)
      })
      .save(outputPath)
  })
}
