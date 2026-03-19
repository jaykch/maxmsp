import type { BackgroundConfig } from '../../shared/types'

export const PRESET_BACKGROUNDS: { name: string; config: BackgroundConfig }[] = [
  {
    name: 'Purple Haze',
    config: { type: 'gradient', gradientStart: '#667eea', gradientEnd: '#764ba2', gradientAngle: 135 }
  },
  {
    name: 'Ocean Blue',
    config: { type: 'gradient', gradientStart: '#2193b0', gradientEnd: '#6dd5ed', gradientAngle: 135 }
  },
  {
    name: 'Sunset',
    config: { type: 'gradient', gradientStart: '#f83600', gradientEnd: '#f9d423', gradientAngle: 135 }
  },
  {
    name: 'Emerald',
    config: { type: 'gradient', gradientStart: '#11998e', gradientEnd: '#38ef7d', gradientAngle: 135 }
  },
  {
    name: 'Midnight',
    config: { type: 'gradient', gradientStart: '#0f0c29', gradientEnd: '#302b63', gradientAngle: 135 }
  },
  {
    name: 'Rose',
    config: { type: 'gradient', gradientStart: '#ee9ca7', gradientEnd: '#ffdde1', gradientAngle: 135 }
  },
  {
    name: 'Dark',
    config: { type: 'solid', color: '#1a1a2e' }
  },
  {
    name: 'White',
    config: { type: 'solid', color: '#ffffff' }
  }
]

export function backgroundToCSS(bg: BackgroundConfig): string {
  if (bg.type === 'solid') {
    return bg.color || '#000000'
  }
  if (bg.type === 'gradient') {
    return `linear-gradient(${bg.gradientAngle || 135}deg, ${bg.gradientStart || '#667eea'}, ${bg.gradientEnd || '#764ba2'})`
  }
  return '#000000'
}
