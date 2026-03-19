import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock uuid
vi.mock('uuid', () => ({
  v4: () => 'mock-uuid'
}))

// Mock window.api
const mockApi = {
  getSources: vi.fn(() => Promise.resolve([
    { id: 'screen:0', name: 'Screen 1', thumbnailDataUrl: 'data:image/png;base64,test', displayId: '0' }
  ])),
  startRecording: vi.fn(() => Promise.resolve('/path/to/recording.webm')),
  stopRecording: vi.fn(() => Promise.resolve({ inputEvents: [] })),
  saveRecordingChunk: vi.fn()
}
Object.defineProperty(globalThis, 'window', {
  value: { api: mockApi },
  writable: true
})

import { useRecordingStore } from './recording'

describe('useRecordingStore', () => {
  beforeEach(() => {
    useRecordingStore.setState({
      state: 'idle',
      sources: [],
      selectedSource: null,
      filePath: null,
      duration: 0,
      inputEvents: [],
      showSourcePicker: false,
      _mediaRecorder: null,
      _recordedChunks: [],
      _stream: null,
      _recordingStartTime: 0
    })
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('has correct defaults', () => {
      const state = useRecordingStore.getState()
      expect(state.state).toBe('idle')
      expect(state.sources).toEqual([])
      expect(state.selectedSource).toBeNull()
      expect(state.filePath).toBeNull()
      expect(state.showSourcePicker).toBe(false)
    })
  })

  describe('simple setters', () => {
    it('sets recording state', () => {
      useRecordingStore.getState().setState('recording')
      expect(useRecordingStore.getState().state).toBe('recording')
    })

    it('sets show source picker', () => {
      useRecordingStore.getState().setShowSourcePicker(true)
      expect(useRecordingStore.getState().showSourcePicker).toBe(true)
    })

    it('sets selected source', () => {
      const source = { id: 'screen:0', name: 'Screen 1', thumbnailDataUrl: '', displayId: '0' }
      useRecordingStore.getState().setSelectedSource(source)
      expect(useRecordingStore.getState().selectedSource).toEqual(source)
    })

    it('sets file path', () => {
      useRecordingStore.getState().setFilePath('/path/to/file.webm')
      expect(useRecordingStore.getState().filePath).toBe('/path/to/file.webm')
    })

    it('sets duration', () => {
      useRecordingStore.getState().setDuration(30.5)
      expect(useRecordingStore.getState().duration).toBe(30.5)
    })

    it('sets input events', () => {
      const events = [{ type: 'click' as const, x: 100, y: 200, timestamp: 1000 }]
      useRecordingStore.getState().setInputEvents(events)
      expect(useRecordingStore.getState().inputEvents).toEqual(events)
    })
  })

  describe('fetchSources', () => {
    it('calls window.api.getSources and updates store', async () => {
      await useRecordingStore.getState().fetchSources()
      expect(mockApi.getSources).toHaveBeenCalled()
      expect(useRecordingStore.getState().sources).toHaveLength(1)
      expect(useRecordingStore.getState().sources[0].id).toBe('screen:0')
    })
  })

  describe('startRecording', () => {
    it('does nothing without a selected source', async () => {
      await useRecordingStore.getState().startRecording()
      expect(mockApi.startRecording).not.toHaveBeenCalled()
      expect(useRecordingStore.getState().state).toBe('idle')
    })
  })
})
