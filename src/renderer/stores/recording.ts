import { create } from 'zustand'
import type { DesktopSource, RecordingState, InputEvent } from '../../shared/types'
import { useProjectStore } from './project'
import { generateAutoZoomKeyframes, generateZoomSegments } from '../utils/keyframes'

interface RecordingStore {
  state: RecordingState
  sources: DesktopSource[]
  selectedSource: DesktopSource | null
  filePath: string | null
  duration: number
  inputEvents: InputEvent[]
  showSourcePicker: boolean

  // Internal recording state (not serialized)
  _mediaRecorder: MediaRecorder | null
  _recordedChunks: Blob[]
  _stream: MediaStream | null
  _recordingStartTime: number

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
  _mediaRecorder: null,
  _recordedChunks: [],
  _stream: null,
  _recordingStartTime: 0,

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

    try {
      // Tell main process to start input tracking and get file path
      const filePath = await window.api.startRecording({
        sourceId: selectedSource.id,
        sourceName: selectedSource.name,
        audio: true,
        frameRate: 30,
        resolution: { width: 1920, height: 1080 }
      })

      // Get the media stream from desktopCapturer via getUserMedia
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: selectedSource.id,
            minWidth: 1280,
            maxWidth: 3840,
            minHeight: 720,
            maxHeight: 2160,
            maxFrameRate: 30
          }
        } as MediaTrackConstraints
      })

      const chunks: Blob[] = []
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 8000000
      })

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      recorder.onstop = async () => {
        // Assemble blob and save to disk
        const blob = new Blob(chunks, { type: 'video/webm' })
        console.log('[recording] onstop: blob size =', blob.size, 'bytes')
        const buffer = await blob.arrayBuffer()
        console.log('[recording] saving to disk:', filePath)
        await window.api.saveRecordingChunk(filePath, buffer)
        console.log('[recording] file saved successfully')

        const duration = (Date.now() - get()._recordingStartTime) / 1000
        console.log('[recording] duration:', duration, 'seconds')

        // Stop input tracking on main process
        const { inputEvents } = await window.api.stopRecording()
        console.log('[recording] input events:', inputEvents.length)

        // Stop stream tracks
        stream.getTracks().forEach((track) => track.stop())

        // Add clip to project store
        const projectStore = useProjectStore.getState()
        projectStore.addClip(filePath, duration)
        console.log('[recording] clip added to project store')

        // Generate zoom segments + legacy keyframes and store input events for cursor follow
        if (inputEvents.length > 0) {
          const segments = generateZoomSegments(inputEvents, 1920, 1080)
          const keyframes = generateAutoZoomKeyframes(inputEvents, 1920, 1080)

          // Store zoom segments and input events for the camera follow system
          useProjectStore.setState({
            zoomSegments: segments,
            inputEvents: inputEvents
          })

          // Also add legacy keyframes for timeline visualization
          for (const kf of keyframes) {
            projectStore.addZoomKeyframe({
              time: kf.time,
              x: kf.x,
              y: kf.y,
              scale: kf.scale,
              easing: kf.easing
            })
          }
        }

        set({
          state: 'idle',
          inputEvents,
          duration,
          _mediaRecorder: null,
          _recordedChunks: [],
          _stream: null
        })
      }

      // Start recording with 1-second timeslices
      recorder.start(1000)

      set({
        state: 'recording',
        filePath,
        _mediaRecorder: recorder,
        _recordedChunks: chunks,
        _stream: stream,
        _recordingStartTime: Date.now()
      })
    } catch (err) {
      console.error('[recording] Failed to start recording:', err)
      set({ state: 'idle' })
    }
  },

  stopRecording: async () => {
    const { _mediaRecorder } = get()
    if (!_mediaRecorder || _mediaRecorder.state === 'inactive') return

    set({ state: 'stopping' })
    // This triggers the onstop handler above which does the rest
    _mediaRecorder.stop()
  }
}))
