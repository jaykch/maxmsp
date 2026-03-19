import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import type { Clip, ZoomKeyframe, BackgroundConfig, DeviceFrame, ProjectData } from '../../shared/types'
import { DEFAULT_BACKGROUND, DEFAULT_PADDING, DEFAULT_BORDER_RADIUS } from '../../shared/constants'

interface ProjectState extends ProjectData {
  // Actions
  setName: (name: string) => void
  addClip: (filePath: string, duration: number) => void
  removeClip: (id: string) => void
  updateClip: (id: string, updates: Partial<Clip>) => void
  addZoomKeyframe: (keyframe: Omit<ZoomKeyframe, 'id'>) => void
  removeZoomKeyframe: (id: string) => void
  updateZoomKeyframe: (id: string, updates: Partial<ZoomKeyframe>) => void
  setBackground: (bg: BackgroundConfig) => void
  setDeviceFrame: (frame: DeviceFrame | null) => void
  setPadding: (padding: number) => void
  setBorderRadius: (radius: number) => void
  setShadow: (shadow: boolean) => void
  setResolution: (resolution: { width: number; height: number }) => void
  loadProject: (project: ProjectData) => void
  reset: () => void
  getProjectData: () => ProjectData
}

const initialState: Omit<ProjectData, 'id'> = {
  name: 'Untitled',
  clips: [],
  zoomKeyframes: [],
  background: DEFAULT_BACKGROUND,
  deviceFrame: null,
  padding: DEFAULT_PADDING,
  borderRadius: DEFAULT_BORDER_RADIUS,
  shadow: true,
  resolution: { width: 1920, height: 1080 }
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  id: uuid(),
  ...initialState,

  setName: (name) => set({ name }),

  addClip: (filePath, duration) =>
    set((state) => ({
      clips: [
        ...state.clips,
        {
          id: uuid(),
          filePath,
          startTime: 0,
          endTime: duration,
          duration,
          offset: state.clips.reduce((acc, c) => acc + (c.endTime - c.startTime), 0)
        }
      ]
    })),

  removeClip: (id) =>
    set((state) => ({ clips: state.clips.filter((c) => c.id !== id) })),

  updateClip: (id, updates) =>
    set((state) => ({
      clips: state.clips.map((c) => (c.id === id ? { ...c, ...updates } : c))
    })),

  addZoomKeyframe: (keyframe) =>
    set((state) => ({
      zoomKeyframes: [...state.zoomKeyframes, { ...keyframe, id: uuid() }]
    })),

  removeZoomKeyframe: (id) =>
    set((state) => ({
      zoomKeyframes: state.zoomKeyframes.filter((k) => k.id !== id)
    })),

  updateZoomKeyframe: (id, updates) =>
    set((state) => ({
      zoomKeyframes: state.zoomKeyframes.map((k) =>
        k.id === id ? { ...k, ...updates } : k
      )
    })),

  setBackground: (background) => set({ background }),
  setDeviceFrame: (deviceFrame) => set({ deviceFrame }),
  setPadding: (padding) => set({ padding }),
  setBorderRadius: (borderRadius) => set({ borderRadius }),
  setShadow: (shadow) => set({ shadow }),
  setResolution: (resolution) => set({ resolution }),

  loadProject: (project) => set(project),

  reset: () => set({ id: uuid(), ...initialState }),

  getProjectData: () => {
    const state = get()
    return {
      id: state.id,
      name: state.name,
      clips: state.clips,
      zoomKeyframes: state.zoomKeyframes,
      background: state.background,
      deviceFrame: state.deviceFrame,
      padding: state.padding,
      borderRadius: state.borderRadius,
      shadow: state.shadow,
      resolution: state.resolution
    }
  }
}))
