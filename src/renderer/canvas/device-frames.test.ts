import { describe, it, expect } from 'vitest'
import { DEVICE_FRAMES } from './device-frames'

describe('DEVICE_FRAMES', () => {
  it('has 4 frame options', () => {
    expect(DEVICE_FRAMES).toHaveLength(4)
  })

  it('first option is "No Frame"', () => {
    expect(DEVICE_FRAMES[0]).toMatchObject({
      id: 'none',
      name: 'No Frame',
      imagePath: ''
    })
  })

  it('each frame has required properties', () => {
    for (const frame of DEVICE_FRAMES) {
      expect(frame.id).toBeTruthy()
      expect(frame.name).toBeTruthy()
      expect(frame.padding).toBeDefined()
      expect(frame.padding).toHaveProperty('top')
      expect(frame.padding).toHaveProperty('right')
      expect(frame.padding).toHaveProperty('bottom')
      expect(frame.padding).toHaveProperty('left')
    }
  })

  it('"No Frame" has zero padding', () => {
    const none = DEVICE_FRAMES[0]
    expect(none.padding.top).toBe(0)
    expect(none.padding.right).toBe(0)
    expect(none.padding.bottom).toBe(0)
    expect(none.padding.left).toBe(0)
  })

  it('device frames have non-zero padding', () => {
    const framesWithPadding = DEVICE_FRAMES.filter((f) => f.id !== 'none')
    for (const frame of framesWithPadding) {
      const totalPadding =
        frame.padding.top + frame.padding.right + frame.padding.bottom + frame.padding.left
      expect(totalPadding).toBeGreaterThan(0)
    }
  })

  it('includes MacBook, Browser, and iPhone', () => {
    const ids = DEVICE_FRAMES.map((f) => f.id)
    expect(ids).toContain('macbook')
    expect(ids).toContain('browser')
    expect(ids).toContain('iphone')
  })
})
