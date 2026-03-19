import { create } from 'zustand'
import type { ExportState } from '../../shared/types'

interface UIState {
  currentTime: number
  isPlaying: boolean
  playbackSpeed: number
  selectedKeyframeId: string | null
  selectedClipId: string | null
  showExportDialog: boolean
  exportState: ExportState
  exportProgress: number
  activePanel: 'inspector' | 'backgrounds' | 'frames'
  timelineZoom: number

  // Actions
  setCurrentTime: (time: number) => void
  setIsPlaying: (playing: boolean) => void
  setPlaybackSpeed: (speed: number) => void
  setSelectedKeyframeId: (id: string | null) => void
  setSelectedClipId: (id: string | null) => void
  setShowExportDialog: (show: boolean) => void
  setExportState: (state: ExportState) => void
  setExportProgress: (progress: number) => void
  setActivePanel: (panel: 'inspector' | 'backgrounds' | 'frames') => void
  setTimelineZoom: (zoom: number) => void
  togglePlayback: () => void
}

export const useUIStore = create<UIState>((set, get) => ({
  currentTime: 0,
  isPlaying: false,
  playbackSpeed: 1,
  selectedKeyframeId: null,
  selectedClipId: null,
  showExportDialog: false,
  exportState: 'idle',
  exportProgress: 0,
  activePanel: 'inspector',
  timelineZoom: 1,

  setCurrentTime: (currentTime) => set({ currentTime }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),
  setSelectedKeyframeId: (selectedKeyframeId) => set({ selectedKeyframeId }),
  setSelectedClipId: (selectedClipId) => set({ selectedClipId }),
  setShowExportDialog: (showExportDialog) => set({ showExportDialog }),
  setExportState: (exportState) => set({ exportState }),
  setExportProgress: (exportProgress) => set({ exportProgress }),
  setActivePanel: (activePanel) => set({ activePanel }),
  setTimelineZoom: (timelineZoom) => set({ timelineZoom }),
  togglePlayback: () => set({ isPlaying: !get().isPlaying })
}))
