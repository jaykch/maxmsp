import { describe, it, expect, beforeEach } from 'vitest'
import { useUIStore } from './ui'

describe('useUIStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useUIStore.setState({
      currentTime: 0,
      isPlaying: false,
      playbackSpeed: 1,
      selectedKeyframeId: null,
      selectedClipId: null,
      showExportDialog: false,
      exportState: 'idle',
      exportProgress: 0,
      activePanel: 'inspector',
      timelineZoom: 1
    })
  })

  describe('playback controls', () => {
    it('sets current time', () => {
      useUIStore.getState().setCurrentTime(5.5)
      expect(useUIStore.getState().currentTime).toBe(5.5)
    })

    it('sets playing state', () => {
      useUIStore.getState().setIsPlaying(true)
      expect(useUIStore.getState().isPlaying).toBe(true)
    })

    it('toggles playback', () => {
      expect(useUIStore.getState().isPlaying).toBe(false)
      useUIStore.getState().togglePlayback()
      expect(useUIStore.getState().isPlaying).toBe(true)
      useUIStore.getState().togglePlayback()
      expect(useUIStore.getState().isPlaying).toBe(false)
    })

    it('sets playback speed', () => {
      useUIStore.getState().setPlaybackSpeed(2)
      expect(useUIStore.getState().playbackSpeed).toBe(2)
    })
  })

  describe('selection', () => {
    it('selects a keyframe', () => {
      useUIStore.getState().setSelectedKeyframeId('kf-1')
      expect(useUIStore.getState().selectedKeyframeId).toBe('kf-1')
    })

    it('clears keyframe selection', () => {
      useUIStore.getState().setSelectedKeyframeId('kf-1')
      useUIStore.getState().setSelectedKeyframeId(null)
      expect(useUIStore.getState().selectedKeyframeId).toBeNull()
    })

    it('selects a clip', () => {
      useUIStore.getState().setSelectedClipId('clip-1')
      expect(useUIStore.getState().selectedClipId).toBe('clip-1')
    })
  })

  describe('export state', () => {
    it('sets export dialog visibility', () => {
      useUIStore.getState().setShowExportDialog(true)
      expect(useUIStore.getState().showExportDialog).toBe(true)
    })

    it('sets export state', () => {
      useUIStore.getState().setExportState('exporting')
      expect(useUIStore.getState().exportState).toBe('exporting')
    })

    it('sets export progress', () => {
      useUIStore.getState().setExportProgress(75)
      expect(useUIStore.getState().exportProgress).toBe(75)
    })
  })

  describe('UI panels', () => {
    it('sets active panel', () => {
      useUIStore.getState().setActivePanel('backgrounds')
      expect(useUIStore.getState().activePanel).toBe('backgrounds')
    })

    it('sets timeline zoom', () => {
      useUIStore.getState().setTimelineZoom(2.5)
      expect(useUIStore.getState().timelineZoom).toBe(2.5)
    })
  })
})
