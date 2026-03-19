import { describe, it, expect } from 'vitest'
import { PRESET_BACKGROUNDS, backgroundToCSS } from './effects'
import type { BackgroundConfig } from '../../shared/types'

describe('PRESET_BACKGROUNDS', () => {
  it('has 8 presets', () => {
    expect(PRESET_BACKGROUNDS).toHaveLength(8)
  })

  it('each preset has name and config', () => {
    for (const preset of PRESET_BACKGROUNDS) {
      expect(preset.name).toBeTruthy()
      expect(preset.config).toBeDefined()
      expect(preset.config.type).toMatch(/^(solid|gradient)$/)
    }
  })

  it('gradient presets have start and end colors', () => {
    const gradients = PRESET_BACKGROUNDS.filter((p) => p.config.type === 'gradient')
    expect(gradients.length).toBeGreaterThan(0)
    for (const g of gradients) {
      expect(g.config.gradientStart).toBeTruthy()
      expect(g.config.gradientEnd).toBeTruthy()
      expect(g.config.gradientAngle).toBeDefined()
    }
  })

  it('solid presets have color', () => {
    const solids = PRESET_BACKGROUNDS.filter((p) => p.config.type === 'solid')
    expect(solids.length).toBeGreaterThan(0)
    for (const s of solids) {
      expect(s.config.color).toBeTruthy()
    }
  })

  it('includes expected preset names', () => {
    const names = PRESET_BACKGROUNDS.map((p) => p.name)
    expect(names).toContain('Purple Haze')
    expect(names).toContain('Dark')
    expect(names).toContain('White')
  })
})

describe('backgroundToCSS', () => {
  it('returns solid color', () => {
    const bg: BackgroundConfig = { type: 'solid', color: '#ff0000' }
    expect(backgroundToCSS(bg)).toBe('#ff0000')
  })

  it('returns default color for solid with no color', () => {
    const bg: BackgroundConfig = { type: 'solid' }
    expect(backgroundToCSS(bg)).toBe('#000000')
  })

  it('returns gradient CSS', () => {
    const bg: BackgroundConfig = {
      type: 'gradient',
      gradientStart: '#aaa',
      gradientEnd: '#bbb',
      gradientAngle: 90
    }
    expect(backgroundToCSS(bg)).toBe('linear-gradient(90deg, #aaa, #bbb)')
  })

  it('uses default values for gradient with missing fields', () => {
    const bg: BackgroundConfig = { type: 'gradient' }
    const css = backgroundToCSS(bg)
    expect(css).toContain('135deg')
    expect(css).toContain('#667eea')
    expect(css).toContain('#764ba2')
  })

  it('returns black for image type (not supported in CSS)', () => {
    const bg: BackgroundConfig = { type: 'image', imagePath: '/some/path.png' }
    expect(backgroundToCSS(bg)).toBe('#000000')
  })
})
