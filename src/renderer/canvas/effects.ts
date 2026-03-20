import type { BackgroundConfig } from '../../shared/types'

// Import wallpaper images — Vite resolves these to URLs
import gradientMesh from '../assets/wallpapers/gradient-mesh.jpg'
import purpleGradient from '../assets/wallpapers/purple-gradient.jpg'
import blueAbstract from '../assets/wallpapers/blue-abstract.jpg'
import pastelSwirl from '../assets/wallpapers/pastel-swirl.jpg'
import pinkWave from '../assets/wallpapers/pink-wave.jpg'
import ocean from '../assets/wallpapers/ocean.jpg'
import sunsetSky from '../assets/wallpapers/sunset-sky.jpg'
import darkGradient from '../assets/wallpapers/dark-gradient.jpg'
import auroraBorealis from '../assets/wallpapers/aurora-borealis.jpg'
import warmAbstract from '../assets/wallpapers/warm-abstract.jpg'
import neonAbstract from '../assets/wallpapers/neon-abstract.jpg'
import tealGradient from '../assets/wallpapers/teal-gradient.jpg'
import cloudBook from '../assets/wallpapers/cloud-book.png'

export interface WallpaperPreset {
  name: string
  config: BackgroundConfig
  thumbnailUrl: string
}

export const PRESET_BACKGROUNDS: WallpaperPreset[] = [
  { name: 'Gradient Mesh', config: { type: 'image', imagePath: gradientMesh, sourceFileName: 'gradient-mesh.jpg' }, thumbnailUrl: gradientMesh },
  { name: 'Purple Haze', config: { type: 'image', imagePath: purpleGradient, sourceFileName: 'purple-gradient.jpg' }, thumbnailUrl: purpleGradient },
  { name: 'Blue Abstract', config: { type: 'image', imagePath: blueAbstract, sourceFileName: 'blue-abstract.jpg' }, thumbnailUrl: blueAbstract },
  { name: 'Pastel Swirl', config: { type: 'image', imagePath: pastelSwirl, sourceFileName: 'pastel-swirl.jpg' }, thumbnailUrl: pastelSwirl },
  { name: 'Pink Wave', config: { type: 'image', imagePath: pinkWave, sourceFileName: 'pink-wave.jpg' }, thumbnailUrl: pinkWave },
  { name: 'Ocean', config: { type: 'image', imagePath: ocean, sourceFileName: 'ocean.jpg' }, thumbnailUrl: ocean },
  { name: 'Sunset Sky', config: { type: 'image', imagePath: sunsetSky, sourceFileName: 'sunset-sky.jpg' }, thumbnailUrl: sunsetSky },
  { name: 'Dark Gradient', config: { type: 'image', imagePath: darkGradient, sourceFileName: 'dark-gradient.jpg' }, thumbnailUrl: darkGradient },
  { name: 'Aurora', config: { type: 'image', imagePath: auroraBorealis, sourceFileName: 'aurora-borealis.jpg' }, thumbnailUrl: auroraBorealis },
  { name: 'Warm Abstract', config: { type: 'image', imagePath: warmAbstract, sourceFileName: 'warm-abstract.jpg' }, thumbnailUrl: warmAbstract },
  { name: 'Neon', config: { type: 'image', imagePath: neonAbstract, sourceFileName: 'neon-abstract.jpg' }, thumbnailUrl: neonAbstract },
  { name: 'Teal Gradient', config: { type: 'image', imagePath: tealGradient, sourceFileName: 'teal-gradient.jpg' }, thumbnailUrl: tealGradient },
  { name: 'Cloud Book', config: { type: 'image', imagePath: cloudBook, sourceFileName: 'cloud-book.png' }, thumbnailUrl: cloudBook },
  // Solids
  { name: 'Void', config: { type: 'solid', color: '#000000' }, thumbnailUrl: '' },
  { name: 'Obsidian', config: { type: 'solid', color: '#0c0c14' }, thumbnailUrl: '' },
  { name: 'Graphite', config: { type: 'solid', color: '#1c1c1c' }, thumbnailUrl: '' },
  { name: 'Snow', config: { type: 'solid', color: '#f8fafc' }, thumbnailUrl: '' },
]

export function backgroundToCSS(bg: BackgroundConfig): string {
  if (bg.type === 'solid') {
    return bg.color || '#000000'
  }
  if (bg.type === 'gradient') {
    return `linear-gradient(${bg.gradientAngle || 135}deg, ${bg.gradientStart || '#667eea'}, ${bg.gradientEnd || '#764ba2'})`
  }
  if (bg.type === 'image' && bg.imagePath) {
    return `url(${bg.imagePath}) center/cover no-repeat`
  }
  return '#000000'
}

// Cache loaded wallpaper images for the canvas renderer
const imageCache = new Map<string, HTMLImageElement>()

export function loadBackgroundImage(src: string): Promise<HTMLImageElement> {
  if (imageCache.has(src)) return Promise.resolve(imageCache.get(src)!)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      imageCache.set(src, img)
      resolve(img)
    }
    img.onerror = reject
    img.src = src
  })
}

export function getCachedBackgroundImage(src: string): HTMLImageElement | null {
  return imageCache.get(src) || null
}
