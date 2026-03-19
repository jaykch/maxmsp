import { create } from 'zustand'
import type { DesktopSource, RecordingState, InputEvent } from '../../shared/types'

interface RecordingStore {
  state: RecordingState
  sources: DesktopSource[]
  selectedSource: DesktopSource | null
  filePath: string | null
  duration: number
  inputEvents: InputEvent[]
  showSourcePicker: boolean

  // Actions
  setState: (state: RecordingState) => void
  setSources: (sources: DesktopSource[]) => void
  setSelectedSource: (source: DesktopSource | null) => void
  setFilePath: (path: string | null) => void
  setDuration: (duration: number) => void
  setInputEvents: (events: InputEvent[]) => void
  setShowSourcePicker: (show: boolean) => void
  fetchSources: () => Promise<void>
  startRecording: () => Promise<void>
  stopRecording: () => Promise<void>
}

export const useRecordingStore = create<RecordingStore>((set, get) => ({
  state: 'idle',
  sources: [],
  selectedSource: null,
  filePath: null,
  duration: 0,
  inputEvents: [],
  showSourcePicker: false,

  setState: (state) => set({ state }),
  setSources: (sources) => set({ sources }),
  setSelectedSource: (source) => set({ selectedSource: source }),
  setFilePath: (path) => set({ filePath: path }),
  setDuration: (duration) => set({ duration }),
  setInputEvents: (events) => set({ inputEvents: events }),
  setShowSourcePicker: (show) => set({ showSourcePicker: show }),

  fetchSources: async () => {
    const sources = await window.api.getSources()
    set({ sources })
  },

  startRecording: async () => {
    const { selectedSource } = get()
    if (!selectedSource) return

    set({ state: 'preparing' })

    const filePath = await window.api.startRecording({
      sourceId: selectedSource.id,
      sourceName: selectedSource.name,
      audio: true,
      frameRate: 30,
      resolution: { width: 1920, height: 1080 }
    })

    set({ state: 'recording', filePath })
  },

  stopRecording: async () => {
    set({ state: 'stopping' })
    const { inputEvents } = await window.api.stopRecording()
    set({ state: 'idle', inputEvents })
  }
}))
