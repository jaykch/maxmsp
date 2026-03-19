export interface DesktopSource {
  id: string
  name: string
  thumbnailDataUrl: string
  displayId: string
  appIcon?: string
}

export interface RecordingOptions {
  sourceId: string
  sourceName: string
  audio: boolean
  frameRate: number
  resolution: { width: number; height: number }
}

export interface InputEvent {
  type: 'click' | 'move' | 'keydown' | 'keyup' | 'scroll'
  x: number
  y: number
  timestamp: number
  button?: number
  key?: string
  delta?: number
}

export interface ZoomKeyframe {
  id: string
  time: number
  x: number
  y: number
  scale: number
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'
}

export interface Clip {
  id: string
  filePath: string
  startTime: number
  endTime: number
  duration: number
  offset: number
}

export interface BackgroundConfig {
  type: 'solid' | 'gradient' | 'image'
  color?: string
  gradientStart?: string
  gradientEnd?: string
  gradientAngle?: number
  imagePath?: string
}

export interface DeviceFrame {
  id: string
  name: string
  imagePath: string
  padding: { top: number; right: number; bottom: number; left: number }
}

export interface ProjectData {
  id: string
  name: string
  clips: Clip[]
  zoomKeyframes: ZoomKeyframe[]
  background: BackgroundConfig
  deviceFrame: DeviceFrame | null
  padding: number
  borderRadius: number
  shadow: boolean
  resolution: { width: number; height: number }
}

export interface ExportSettings {
  format: 'mp4' | 'webm'
  resolution: { width: number; height: number }
  fps: number
  quality: 'low' | 'medium' | 'high' | 'lossless'
  codec: 'h264' | 'h265' | 'vp9'
}

export type RecordingState = 'idle' | 'preparing' | 'recording' | 'stopping'
export type ExportState = 'idle' | 'exporting' | 'done' | 'error'
