import type { BackgroundConfig } from '../../shared/types'
import { interpolateKeyframes } from '../utils/keyframes'
import type { ZoomKeyframe } from '../../shared/types'

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

    // Get zoom state
    const zoom = interpolateKeyframes(keyframes, currentTime)

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

    const drawX = (width - drawWidth) / 2
    const drawY = (height - drawHeight) / 2

    ctx.save()

    // Apply border radius clipping
    if (borderRadius > 0) {
      this.roundedRect(ctx, drawX, drawY, drawWidth, drawHeight, borderRadius)
      ctx.clip()
    }

    // Apply shadow
    if (shadow) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'
      ctx.shadowBlur = 30
      ctx.shadowOffsetY = 10
      ctx.fillStyle = '#000'
      ctx.fillRect(drawX, drawY, drawWidth, drawHeight)
      ctx.shadowColor = 'transparent'
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
