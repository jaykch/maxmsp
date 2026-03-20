import type { ZoomKeyframe, ZoomSegment, InputEvent, CameraState } from '../../shared/types'
import { AUTO_ZOOM_SCALE, AUTO_ZOOM_DURATION_MS, ZOOM_EASE_DURATION_MS } from '../../shared/constants'
import { easeInOutCubic, clamp } from './time'
import { v4 as uuid } from 'uuid'

// ── Legacy keyframe interpolation (still used for manual keyframes on timeline) ──

export function interpolateKeyframes(
  keyframes: ZoomKeyframe[],
  time: number
): CameraState {
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

// ── Zoom-follow system ──

const EASE_IN_SECONDS = ZOOM_EASE_DURATION_MS / 1000
const EASE_OUT_SECONDS = ZOOM_EASE_DURATION_MS / 1000
const FOLLOW_SMOOTHING = 0.08 // Lower = smoother/laggier camera follow

/**
 * Generate zoom segments from click events.
 * Each click creates a zoom window where the camera follows the cursor.
 */
export function generateZoomSegments(
  inputEvents: InputEvent[],
  videoWidth: number,
  videoHeight: number
): ZoomSegment[] {
  const clicks = inputEvents.filter((e) => e.type === 'click')
  if (clicks.length === 0) return []

  const segments: ZoomSegment[] = []
  const durationSeconds = AUTO_ZOOM_DURATION_MS / 1000

  for (const click of clicks) {
    const startTime = click.timestamp / 1000
    let endTime = startTime + durationSeconds

    // Prevent overlap with previous segment — clamp start to after the last segment ends
    if (segments.length > 0) {
      const prev = segments[segments.length - 1]
      if (startTime < prev.endTime) {
        // Shrink previous segment to end before this one starts (with small gap)
        prev.endTime = Math.max(prev.startTime + 0.1, startTime - 0.05)
      }
    }

    // Ensure minimum duration
    if (endTime - startTime < 0.2) endTime = startTime + 0.2

    segments.push({
      id: uuid(),
      startTime,
      endTime,
      scale: AUTO_ZOOM_SCALE,
      clickX: click.x / videoWidth,
      clickY: click.y / videoHeight
    })
  }

  return segments
}

/**
 * Compute the camera state at a given time using zoom segments + move events.
 * This is the core zoom-follow algorithm.
 */
export function computeCameraState(
  time: number,
  segments: ZoomSegment[],
  moveEvents: InputEvent[],
  videoWidth: number,
  videoHeight: number
): CameraState {
  if (segments.length === 0) return { x: 0.5, y: 0.5, scale: 1 }

  // Find the active segment (if any)
  let activeSegment: ZoomSegment | null = null
  for (const seg of segments) {
    if (time >= seg.startTime - EASE_IN_SECONDS && time <= seg.endTime + EASE_OUT_SECONDS) {
      activeSegment = seg
      break
    }
  }

  if (!activeSegment) return { x: 0.5, y: 0.5, scale: 1 }

  // Compute scale with smooth ease-in/ease-out
  let scale: number
  if (time < activeSegment.startTime) {
    // Easing in
    const t = (time - (activeSegment.startTime - EASE_IN_SECONDS)) / EASE_IN_SECONDS
    scale = 1 + (activeSegment.scale - 1) * easeInOutCubic(clamp(t, 0, 1))
  } else if (time > activeSegment.endTime) {
    // Easing out
    const t = (time - activeSegment.endTime) / EASE_OUT_SECONDS
    scale = activeSegment.scale + (1 - activeSegment.scale) * easeInOutCubic(clamp(t, 0, 1))
  } else {
    // Fully zoomed in
    scale = activeSegment.scale
  }

  // Find the cursor position at this time by finding the nearest move event
  let targetX = activeSegment.clickX
  let targetY = activeSegment.clickY

  if (time >= activeSegment.startTime && time <= activeSegment.endTime) {
    // Find move events within this segment and get the smoothed position
    const segmentMoves = moveEvents.filter(
      (e) => e.type === 'move' &&
        e.timestamp / 1000 >= activeSegment!.startTime &&
        e.timestamp / 1000 <= time
    )

    if (segmentMoves.length > 0) {
      // Exponential smoothing over the cursor path
      let smoothX = activeSegment.clickX
      let smoothY = activeSegment.clickY

      for (const move of segmentMoves) {
        const nx = move.x / videoWidth
        const ny = move.y / videoHeight
        smoothX += (nx - smoothX) * FOLLOW_SMOOTHING
        smoothY += (ny - smoothY) * FOLLOW_SMOOTHING
      }

      targetX = smoothX
      targetY = smoothY
    }
  }

  // Clamp camera to safe bounds — prevent viewing outside the source frame
  if (scale > 1) {
    const halfVisible = 0.5 / scale
    targetX = clamp(targetX, halfVisible, 1 - halfVisible)
    targetY = clamp(targetY, halfVisible, 1 - halfVisible)
  }

  return { x: targetX, y: targetY, scale }
}

// ── Legacy: generate old-style keyframes for backward compatibility ──

export function generateAutoZoomKeyframes(
  inputEvents: InputEvent[],
  videoWidth: number,
  videoHeight: number
): ZoomKeyframe[] {
  const clicks = inputEvents.filter((e) => e.type === 'click')
  if (clicks.length === 0) return []

  const keyframes: ZoomKeyframe[] = []

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

    keyframes.push({
      id: uuid(),
      time: timeSeconds,
      x: normalizedX,
      y: normalizedY,
      scale: AUTO_ZOOM_SCALE,
      easing: 'ease-in-out'
    })

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
