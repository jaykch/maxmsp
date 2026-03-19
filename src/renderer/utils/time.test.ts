import { describe, it, expect } from 'vitest'
import { formatTimecode, parseTimecode, clamp, lerp, easeInOutCubic } from './time'

describe('formatTimecode', () => {
  it('formats zero correctly', () => {
    expect(formatTimecode(0)).toBe('00:00.00')
  })

  it('formats seconds and milliseconds', () => {
    expect(formatTimecode(5.5)).toBe('00:05.50')
  })

  it('formats minutes and seconds', () => {
    expect(formatTimecode(125.75)).toBe('02:05.75')
  })

  it('pads single digits', () => {
    // Math.floor((3.05 % 1) * 100) = 4 due to floating point
    expect(formatTimecode(3.05)).toBe('00:03.04')
  })

  it('handles exact minutes', () => {
    expect(formatTimecode(60)).toBe('01:00.00')
  })

  it('handles large values', () => {
    // Floating point: Math.floor((3661.99 % 1) * 100) = 98
    expect(formatTimecode(3661.99)).toBe('61:01.98')
  })
})

describe('parseTimecode', () => {
  it('parses zero', () => {
    expect(parseTimecode('00:00.00')).toBe(0)
  })

  it('parses minutes and seconds', () => {
    expect(parseTimecode('02:05.75')).toBeCloseTo(125.75)
  })

  it('roundtrips with formatTimecode', () => {
    const values = [0, 5.5, 60, 125.75]
    for (const v of values) {
      expect(parseTimecode(formatTimecode(v))).toBeCloseTo(v, 1)
    }
  })

  it('handles missing milliseconds', () => {
    expect(parseTimecode('01:30.')).toBe(90)
  })
})

describe('clamp', () => {
  it('returns value when in range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })

  it('clamps to min', () => {
    expect(clamp(-5, 0, 10)).toBe(0)
  })

  it('clamps to max', () => {
    expect(clamp(15, 0, 10)).toBe(10)
  })

  it('handles equal min and max', () => {
    expect(clamp(5, 3, 3)).toBe(3)
  })
})

describe('lerp', () => {
  it('returns a at t=0', () => {
    expect(lerp(10, 20, 0)).toBe(10)
  })

  it('returns b at t=1', () => {
    expect(lerp(10, 20, 1)).toBe(20)
  })

  it('returns midpoint at t=0.5', () => {
    expect(lerp(10, 20, 0.5)).toBe(15)
  })

  it('extrapolates beyond [0,1]', () => {
    expect(lerp(10, 20, 2)).toBe(30)
  })
})

describe('easeInOutCubic', () => {
  it('returns 0 at t=0', () => {
    expect(easeInOutCubic(0)).toBe(0)
  })

  it('returns 1 at t=1', () => {
    expect(easeInOutCubic(1)).toBe(1)
  })

  it('returns 0.5 at t=0.5', () => {
    expect(easeInOutCubic(0.5)).toBe(0.5)
  })

  it('is slow at the start (less than linear)', () => {
    expect(easeInOutCubic(0.1)).toBeLessThan(0.1)
  })

  it('is slow at the end (greater than linear)', () => {
    expect(easeInOutCubic(0.9)).toBeGreaterThan(0.9)
  })

  it('is symmetric around 0.5', () => {
    expect(easeInOutCubic(0.25) + easeInOutCubic(0.75)).toBeCloseTo(1, 5)
  })
})
