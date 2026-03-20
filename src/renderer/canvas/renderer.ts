import type { BackgroundConfig, ZoomKeyframe, ZoomSegment, InputEvent } from '../../shared/types'
import { computeCameraState, interpolateKeyframes } from '../utils/keyframes'
import { getCachedBackgroundImage, loadBackgroundImage } from './effects'

export class PreviewRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private videoElement: HTMLVideoElement | null = null

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
  }

  setVideo(video: HTMLVideoElement): void {
    this.videoElement = video
  }

  render(
    currentTime: number,
    keyframes: ZoomKeyframe[],
    zoomSegments: ZoomSegment[],
    inputEvents: InputEvent[],
    background: BackgroundConfig,
    padding: number,
    borderRadius: number,
    shadow: boolean
  ): void {
    const { width, height } = this.canvas
    const ctx = this.ctx

    ctx.clearRect(0, 0, width, height)

    // Draw background
    this.drawBackground(ctx, width, height, background)

    if (!this.videoElement) return

    // Get camera state — use zoom-follow if segments exist, otherwise legacy keyframes
    const videoW = this.videoElement.videoWidth || 1920
    const videoH = this.videoElement.videoHeight || 1080
    const zoom = zoomSegments.length > 0
      ? computeCameraState(currentTime, zoomSegments, inputEvents, videoW, videoH)
      : interpolateKeyframes(keyframes, currentTime)

    // Calculate video dimensions with padding
    const videoAreaWidth = width - padding * 2
    const videoAreaHeight = height - padding * 2
    const videoAspect = this.videoElement.videoWidth / this.videoElement.videoHeight
    const areaAspect = videoAreaWidth / videoAreaHeight

    let drawWidth: number, drawHeight: number
    if (videoAspect > areaAspect) {
      drawWidth = videoAreaWidth
      drawHeight = videoAreaWidth / videoAspect
    } else {
      drawHeight = videoAreaHeight
      drawWidth = videoAreaHeight * videoAspect
    }

    // Round to whole pixels to prevent sub-pixel gaps
    const drawX = Math.round((width - drawWidth) / 2)
    const drawY = Math.round((height - drawHeight) / 2)
    drawWidth = Math.round(drawWidth)
    drawHeight = Math.round(drawHeight)

    // Draw shadow outside the clip region so it doesn't peek through
    if (shadow) {
      ctx.save()
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'
      ctx.shadowBlur = 30
      ctx.shadowOffsetY = 10
      if (borderRadius > 0) {
        this.roundedRect(ctx, drawX, drawY, drawWidth, drawHeight, borderRadius)
      } else {
        ctx.beginPath()
        ctx.rect(drawX, drawY, drawWidth, drawHeight)
      }
      ctx.fillStyle = '#000'
      ctx.fill()
      ctx.restore()
    }

    ctx.save()

    // Apply border radius clipping
    if (borderRadius > 0) {
      this.roundedRect(ctx, drawX, drawY, drawWidth, drawHeight, borderRadius)
      ctx.clip()
    }

    // Apply zoom transform
    const centerX = drawX + drawWidth * zoom.x
    const centerY = drawY + drawHeight * zoom.y

    ctx.translate(centerX, centerY)
    ctx.scale(zoom.scale, zoom.scale)
    ctx.translate(-centerX, -centerY)

    // Draw video frame
    ctx.drawImage(this.videoElement, drawX, drawY, drawWidth, drawHeight)

    ctx.restore()
  }

  private drawBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    bg: BackgroundConfig
  ): void {
    if (bg.type === 'solid') {
      ctx.fillStyle = bg.color || '#000000'
      ctx.fillRect(0, 0, width, height)
    } else if (bg.type === 'gradient') {
      const angle = ((bg.gradientAngle || 135) * Math.PI) / 180
      const x1 = width / 2 - (Math.cos(angle) * width) / 2
      const y1 = height / 2 - (Math.sin(angle) * height) / 2
      const x2 = width / 2 + (Math.cos(angle) * width) / 2
      const y2 = height / 2 + (Math.sin(angle) * height) / 2
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
      gradient.addColorStop(0, bg.gradientStart || '#667eea')
      gradient.addColorStop(1, bg.gradientEnd || '#764ba2')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
    } else if (bg.type === 'image' && bg.imagePath) {
      const img = getCachedBackgroundImage(bg.imagePath)
      if (img) {
        const imgAspect = img.width / img.height
        const canvasAspect = width / height
        let sx = 0, sy = 0, sw = img.width, sh = img.height
        if (imgAspect > canvasAspect) {
          sw = img.height * canvasAspect
          sx = (img.width - sw) / 2
        } else {
          sh = img.width / canvasAspect
          sy = (img.height - sh) / 2
        }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height)
      } else {
        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, width, height)
        loadBackgroundImage(bg.imagePath)
      }
    }
  }

  private roundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ): void {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  destroy(): void {
    this.videoElement = null
  }
}
