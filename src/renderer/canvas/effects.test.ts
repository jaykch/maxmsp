import { describe, it, expect, vi } from 'vitest'

// Mock image imports so vitest doesn't choke on .jpg/.png
vi.mock('../assets/wallpapers/gradient-mesh.jpg', () => ({ default: '/mock/gradient-mesh.jpg' }))
vi.mock('../assets/wallpapers/purple-gradient.jpg', () => ({ default: '/mock/purple-gradient.jpg' }))
vi.mock('../assets/wallpapers/blue-abstract.jpg', () => ({ default: '/mock/blue-abstract.jpg' }))
vi.mock('../assets/wallpapers/pastel-swirl.jpg', () => ({ default: '/mock/pastel-swirl.jpg' }))
vi.mock('../assets/wallpapers/pink-wave.jpg', () => ({ default: '/mock/pink-wave.jpg' }))
vi.mock('../assets/wallpapers/ocean.jpg', () => ({ default: '/mock/ocean.jpg' }))
vi.mock('../assets/wallpapers/sunset-sky.jpg', () => ({ default: '/mock/sunset-sky.jpg' }))
vi.mock('../assets/wallpapers/dark-gradient.jpg', () => ({ default: '/mock/dark-gradient.jpg' }))
vi.mock('../assets/wallpapers/aurora-borealis.jpg', () => ({ default: '/mock/aurora-borealis.jpg' }))
vi.mock('../assets/wallpapers/warm-abstract.jpg', () => ({ default: '/mock/warm-abstract.jpg' }))
vi.mock('../assets/wallpapers/neon-abstract.jpg', () => ({ default: '/mock/neon-abstract.jpg' }))
vi.mock('../assets/wallpapers/teal-gradient.jpg', () => ({ default: '/mock/teal-gradient.jpg' }))
vi.mock('../assets/wallpapers/cloud-book.png', () => ({ default: '/mock/cloud-book.png' }))

import { PRESET_BACKGROUNDS, backgroundToCSS } from './effects'
import type { BackgroundConfig } from '../../shared/types'

describe('PRESET_BACKGROUNDS', () => {
  it('has correct number of presets', () => {
    expect(PRESET_BACKGROUNDS.length).toBeGreaterThanOrEqual(16)
  })

  it('each preset has name, config, and thumbnailUrl', () => {
    for (const preset of PRESET_BACKGROUNDS) {
      expect(preset.name).toBeTruthy()
      expect(preset.config).toBeDefined()
      expect(preset.config.type).toMatch(/^(solid|gradient|image)$/)
      expect(preset).toHaveProperty('thumbnailUrl')
    }
  })

  it('image presets have imagePath', () => {
    const images = PRESET_BACKGROUNDS.filter((p) => p.config.type === 'image')
    expect(images.length).toBeGreaterThan(0)
    for (const img of images) {
      expect(img.config.imagePath).toBeTruthy()
      expect(img.thumbnailUrl).toBeTruthy()
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
    expect(names).toContain('Gradient Mesh')
    expect(names).toContain('Cloud Book')
    expect(names).toContain('Void')
    expect(names).toContain('Snow')
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

  it('returns url() for image type', () => {
    const bg: BackgroundConfig = { type: 'image', imagePath: '/path/to/image.jpg' }
    const css = backgroundToCSS(bg)
    expect(css).toContain('url(/path/to/image.jpg)')
    expect(css).toContain('cover')
  })

  it('returns black for image with no path', () => {
    const bg: BackgroundConfig = { type: 'image' }
    expect(backgroundToCSS(bg)).toBe('#000000')
  })
})
