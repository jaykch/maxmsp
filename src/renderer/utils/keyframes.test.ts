import { describe, it, expect, vi } from 'vitest'
import { interpolateKeyframes, generateAutoZoomKeyframes } from './keyframes'
import type { ZoomKeyframe, InputEvent } from '../../shared/types'
import { AUTO_ZOOM_SCALE, AUTO_ZOOM_DURATION_MS } from '../../shared/constants'

vi.mock('uuid', () => ({
  v4: () => 'test-uuid'
}))

describe('interpolateKeyframes', () => {
  it('returns default values for empty keyframes', () => {
    expect(interpolateKeyframes([], 0)).toEqual({ x: 0.5, y: 0.5, scale: 1 })
  })

  it('returns first keyframe values before first keyframe time', () => {
    const keyframes: ZoomKeyframe[] = [
      { id: '1', time: 5, x: 0.3, y: 0.4, scale: 2, easing: 'ease-in-out' }
    ]
    expect(interpolateKeyframes(keyframes, 0)).toEqual({ x: 0.3, y: 0.4, scale: 2 })
  })

  it('returns last keyframe values after last keyframe time', () => {
    const keyframes: ZoomKeyframe[] = [
      { id: '1', time: 0, x: 0.1, y: 0.1, scale: 1, easing: 'ease-in-out' },
      { id: '2', time: 5, x: 0.8, y: 0.9, scale: 3, easing: 'ease-in-out' }
    ]
    expect(interpolateKeyframes(keyframes, 10)).toEqual({ x: 0.8, y: 0.9, scale: 3 })
  })

  it('returns exact keyframe values at keyframe time', () => {
    const keyframes: ZoomKeyframe[] = [
      { id: '1', time: 0, x: 0.0, y: 0.0, scale: 1, easing: 'ease-in-out' },
      { id: '2', time: 10, x: 1.0, y: 1.0, scale: 2, easing: 'ease-in-out' }
    ]
    const result = interpolateKeyframes(keyframes, 0)
    expect(result).toEqual({ x: 0, y: 0, scale: 1 })
  })

  it('interpolates between two keyframes at midpoint', () => {
    const keyframes: ZoomKeyframe[] = [
      { id: '1', time: 0, x: 0, y: 0, scale: 1, easing: 'ease-in-out' },
      { id: '2', time: 10, x: 1, y: 1, scale: 2, easing: 'ease-in-out' }
    ]
    const result = interpolateKeyframes(keyframes, 5)
    // At midpoint with ease-in-out cubic, t=0.5 maps to 0.5
    expect(result.x).toBeCloseTo(0.5, 1)
    expect(result.y).toBeCloseTo(0.5, 1)
    expect(result.scale).toBeCloseTo(1.5, 1)
  })

  it('sorts keyframes by time', () => {
    const keyframes: ZoomKeyframe[] = [
      { id: '2', time: 10, x: 1, y: 1, scale: 2, easing: 'ease-in-out' },
      { id: '1', time: 0, x: 0, y: 0, scale: 1, easing: 'ease-in-out' }
    ]
    const result = interpolateKeyframes(keyframes, 5)
    expect(result.x).toBeCloseTo(0.5, 1)
  })

  it('handles multiple keyframes correctly', () => {
    const keyframes: ZoomKeyframe[] = [
      { id: '1', time: 0, x: 0, y: 0, scale: 1, easing: 'ease-in-out' },
      { id: '2', time: 5, x: 0.5, y: 0.5, scale: 2, easing: 'ease-in-out' },
      { id: '3', time: 10, x: 1, y: 1, scale: 1, easing: 'ease-in-out' }
    ]
    // At time 5 (exactly at second keyframe)
    const result = interpolateKeyframes(keyframes, 5)
    expect(result.x).toBeCloseTo(0.5)
    expect(result.scale).toBeCloseTo(2)
  })
})

describe('generateAutoZoomKeyframes', () => {
  it('returns empty array for no clicks', () => {
    const events: InputEvent[] = [
      { type: 'move', x: 100, y: 200, timestamp: 1000 }
    ]
    expect(generateAutoZoomKeyframes(events, 1920, 1080)).toEqual([])
  })

  it('generates keyframes for a single click', () => {
    const events: InputEvent[] = [
      { type: 'click', x: 960, y: 540, timestamp: 2000 }
    ]
    const keyframes = generateAutoZoomKeyframes(events, 1920, 1080)

    // Should have: initial zoom-out + zoom-in at click + zoom-out after duration
    expect(keyframes).toHaveLength(3)

    // Initial keyframe
    expect(keyframes[0]).toMatchObject({ time: 0, x: 0.5, y: 0.5, scale: 1 })

    // Zoom-in keyframe at click time
    expect(keyframes[1]).toMatchObject({
      time: 2,
      x: 0.5, // 960/1920
      y: 0.5, // 540/1080
      scale: AUTO_ZOOM_SCALE
    })

    // Zoom-out keyframe after duration
    expect(keyframes[2]).toMatchObject({
      time: 2 + AUTO_ZOOM_DURATION_MS / 1000,
      x: 0.5,
      y: 0.5,
      scale: 1
    })
  })

  it('generates keyframes for multiple clicks', () => {
    const events: InputEvent[] = [
      { type: 'click', x: 192, y: 108, timestamp: 1000 },
      { type: 'click', x: 1728, y: 972, timestamp: 5000 }
    ]
    const keyframes = generateAutoZoomKeyframes(events, 1920, 1080)

    // 1 initial + 2 per click (zoom-in + zoom-out) = 5
    expect(keyframes).toHaveLength(5)

    // First click zoom-in
    expect(keyframes[1].x).toBeCloseTo(0.1) // 192/1920
    expect(keyframes[1].y).toBeCloseTo(0.1) // 108/1080

    // Second click zoom-in
    expect(keyframes[3].x).toBeCloseTo(0.9) // 1728/1920
    expect(keyframes[3].y).toBeCloseTo(0.9) // 972/1080
  })

  it('filters out non-click events', () => {
    const events: InputEvent[] = [
      { type: 'move', x: 100, y: 200, timestamp: 500 },
      { type: 'click', x: 960, y: 540, timestamp: 1000 },
      { type: 'keydown', x: 0, y: 0, timestamp: 1500, key: 'a' },
      { type: 'scroll', x: 100, y: 200, timestamp: 2000, delta: 10 }
    ]
    const keyframes = generateAutoZoomKeyframes(events, 1920, 1080)
    expect(keyframes).toHaveLength(3) // initial + 1 click pair
  })

  it('normalizes coordinates to [0,1] range', () => {
    const events: InputEvent[] = [
      { type: 'click', x: 0, y: 0, timestamp: 1000 },
      { type: 'click', x: 1920, y: 1080, timestamp: 3000 }
    ]
    const keyframes = generateAutoZoomKeyframes(events, 1920, 1080)

    expect(keyframes[1].x).toBe(0)
    expect(keyframes[1].y).toBe(0)
    expect(keyframes[3].x).toBe(1)
    expect(keyframes[3].y).toBe(1)
  })
})
