import type { ZoomKeyframe, InputEvent } from '../../shared/types'
import { AUTO_ZOOM_SCALE, AUTO_ZOOM_DURATION_MS } from '../../shared/constants'
import { easeInOutCubic } from './time'
import { v4 as uuid } from 'uuid'

export function interpolateKeyframes(
  keyframes: ZoomKeyframe[],
  time: number
): { x: number; y: number; scale: number } {
  if (keyframes.length === 0) return { x: 0.5, y: 0.5, scale: 1 }

  const sorted = [...keyframes].sort((a, b) => a.time - b.time)

  if (time <= sorted[0].time) {
    return { x: sorted[0].x, y: sorted[0].y, scale: sorted[0].scale }
  }

  if (time >= sorted[sorted.length - 1].time) {
    const last = sorted[sorted.length - 1]
    return { x: last.x, y: last.y, scale: last.scale }
  }

  for (let i = 0; i < sorted.length - 1; i++) {
    if (time >= sorted[i].time && time <= sorted[i + 1].time) {
      const t = (time - sorted[i].time) / (sorted[i + 1].time - sorted[i].time)
      const eased = easeInOutCubic(t)
      return {
        x: sorted[i].x + (sorted[i + 1].x - sorted[i].x) * eased,
        y: sorted[i].y + (sorted[i + 1].y - sorted[i].y) * eased,
        scale: sorted[i].scale + (sorted[i + 1].scale - sorted[i].scale) * eased
      }
    }
  }

  return { x: 0.5, y: 0.5, scale: 1 }
}

export function generateAutoZoomKeyframes(
  inputEvents: InputEvent[],
  videoWidth: number,
  videoHeight: number
): ZoomKeyframe[] {
  // Filter to just clicks
  const clicks = inputEvents.filter((e) => e.type === 'click')
  if (clicks.length === 0) return []

  const keyframes: ZoomKeyframe[] = []

  // Add initial zoom-out keyframe
  keyframes.push({
    id: uuid(),
    time: 0,
    x: 0.5,
    y: 0.5,
    scale: 1,
    easing: 'ease-in-out'
  })

  for (const click of clicks) {
    const timeSeconds = click.timestamp / 1000
    const normalizedX = click.x / videoWidth
    const normalizedY = click.y / videoHeight

    // Zoom in on click
    keyframes.push({
      id: uuid(),
      time: timeSeconds,
      x: normalizedX,
      y: normalizedY,
      scale: AUTO_ZOOM_SCALE,
      easing: 'ease-in-out'
    })

    // Zoom back out after duration
    keyframes.push({
      id: uuid(),
      time: timeSeconds + AUTO_ZOOM_DURATION_MS / 1000,
      x: 0.5,
      y: 0.5,
      scale: 1,
      easing: 'ease-in-out'
    })
  }

  return keyframes
}
