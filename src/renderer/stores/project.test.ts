import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('uuid', () => ({
  v4: () => 'mock-uuid'
}))

import { useProjectStore } from './project'
import { DEFAULT_BACKGROUND, DEFAULT_PADDING, DEFAULT_BORDER_RADIUS } from '../../shared/constants'

describe('useProjectStore', () => {
  beforeEach(() => {
    useProjectStore.getState().reset()
  })

  describe('initial state', () => {
    it('has default values', () => {
      const state = useProjectStore.getState()
      expect(state.name).toBe('Untitled')
      expect(state.clips).toEqual([])
      expect(state.zoomKeyframes).toEqual([])
      expect(state.background).toEqual(DEFAULT_BACKGROUND)
      expect(state.deviceFrame).toBeNull()
      expect(state.padding).toBe(DEFAULT_PADDING)
      expect(state.borderRadius).toBe(DEFAULT_BORDER_RADIUS)
      expect(state.shadow).toBe(true)
      expect(state.resolution).toEqual({ width: 1920, height: 1080 })
    })
  })

  describe('setName', () => {
    it('updates project name', () => {
      useProjectStore.getState().setName('My Project')
      expect(useProjectStore.getState().name).toBe('My Project')
    })
  })

  describe('clips management', () => {
    it('adds a clip', () => {
      useProjectStore.getState().addClip('/path/to/video.webm', 10)
      const clips = useProjectStore.getState().clips
      expect(clips).toHaveLength(1)
      expect(clips[0].filePath).toBe('/path/to/video.webm')
      expect(clips[0].duration).toBe(10)
      expect(clips[0].startTime).toBe(0)
      expect(clips[0].endTime).toBe(10)
      expect(clips[0].offset).toBe(0)
    })

    it('calculates offset for subsequent clips', () => {
      useProjectStore.getState().addClip('/video1.webm', 10)
      useProjectStore.getState().addClip('/video2.webm', 5)
      const clips = useProjectStore.getState().clips
      expect(clips[1].offset).toBe(10) // offset = duration of first clip
    })

    it('removes a clip', () => {
      useProjectStore.getState().addClip('/video.webm', 10)
      const clipId = useProjectStore.getState().clips[0].id
      useProjectStore.getState().removeClip(clipId)
      expect(useProjectStore.getState().clips).toHaveLength(0)
    })

    it('updates a clip', () => {
      useProjectStore.getState().addClip('/video.webm', 10)
      const clipId = useProjectStore.getState().clips[0].id
      useProjectStore.getState().updateClip(clipId, { startTime: 2, endTime: 8 })
      const clip = useProjectStore.getState().clips[0]
      expect(clip.startTime).toBe(2)
      expect(clip.endTime).toBe(8)
    })
  })

  describe('zoom keyframes management', () => {
    it('adds a zoom keyframe', () => {
      useProjectStore.getState().addZoomKeyframe({
        time: 5,
        x: 0.3,
        y: 0.4,
        scale: 2,
        easing: 'ease-in-out'
      })
      const keyframes = useProjectStore.getState().zoomKeyframes
      expect(keyframes).toHaveLength(1)
      expect(keyframes[0].time).toBe(5)
      expect(keyframes[0].scale).toBe(2)
    })

    it('removes a zoom keyframe', () => {
      useProjectStore.getState().addZoomKeyframe({
        time: 5,
        x: 0.3,
        y: 0.4,
        scale: 2,
        easing: 'ease-in-out'
      })
      const id = useProjectStore.getState().zoomKeyframes[0].id
      useProjectStore.getState().removeZoomKeyframe(id)
      expect(useProjectStore.getState().zoomKeyframes).toHaveLength(0)
    })

    it('updates a zoom keyframe', () => {
      useProjectStore.getState().addZoomKeyframe({
        time: 5,
        x: 0.3,
        y: 0.4,
        scale: 2,
        easing: 'ease-in-out'
      })
      const id = useProjectStore.getState().zoomKeyframes[0].id
      useProjectStore.getState().updateZoomKeyframe(id, { scale: 3, time: 10 })
      const kf = useProjectStore.getState().zoomKeyframes[0]
      expect(kf.scale).toBe(3)
      expect(kf.time).toBe(10)
    })
  })

  describe('visual settings', () => {
    it('sets background', () => {
      const bg = { type: 'solid' as const, color: '#ff0000' }
      useProjectStore.getState().setBackground(bg)
      expect(useProjectStore.getState().background).toEqual(bg)
    })

    it('sets device frame', () => {
      const frame = {
        id: 'macbook',
        name: 'MacBook Pro',
        imagePath: 'frames/macbook.png',
        padding: { top: 24, right: 16, bottom: 48, left: 16 }
      }
      useProjectStore.getState().setDeviceFrame(frame)
      expect(useProjectStore.getState().deviceFrame).toEqual(frame)
    })

    it('clears device frame', () => {
      useProjectStore.getState().setDeviceFrame(null)
      expect(useProjectStore.getState().deviceFrame).toBeNull()
    })

    it('sets padding', () => {
      useProjectStore.getState().setPadding(60)
      expect(useProjectStore.getState().padding).toBe(60)
    })

    it('sets border radius', () => {
      useProjectStore.getState().setBorderRadius(20)
      expect(useProjectStore.getState().borderRadius).toBe(20)
    })

    it('sets shadow', () => {
      useProjectStore.getState().setShadow(false)
      expect(useProjectStore.getState().shadow).toBe(false)
    })

    it('sets resolution', () => {
      useProjectStore.getState().setResolution({ width: 3840, height: 2160 })
      expect(useProjectStore.getState().resolution).toEqual({ width: 3840, height: 2160 })
    })
  })

  describe('project data', () => {
    it('returns serializable project data', () => {
      useProjectStore.getState().setName('Test Project')
      useProjectStore.getState().addClip('/video.webm', 10)
      const data = useProjectStore.getState().getProjectData()
      expect(data.name).toBe('Test Project')
      expect(data.clips).toHaveLength(1)
      expect(data.id).toBeTruthy()
      // Should not include store actions
      expect((data as unknown as Record<string, unknown>).setName).toBeUndefined()
    })

    it('loads a project', () => {
      const project = {
        id: 'proj-1',
        name: 'Loaded Project',
        clips: [],
        zoomKeyframes: [],
        background: { type: 'solid' as const, color: '#000' },
        deviceFrame: null,
        padding: 20,
        borderRadius: 8,
        shadow: false,
        resolution: { width: 1280, height: 720 }
      }
      useProjectStore.getState().loadProject(project)
      const state = useProjectStore.getState()
      expect(state.id).toBe('proj-1')
      expect(state.name).toBe('Loaded Project')
      expect(state.padding).toBe(20)
    })
  })

  describe('reset', () => {
    it('resets to initial state', () => {
      useProjectStore.getState().setName('Modified')
      useProjectStore.getState().setPadding(100)
      useProjectStore.getState().addClip('/video.webm', 10)
      useProjectStore.getState().reset()

      const state = useProjectStore.getState()
      expect(state.name).toBe('Untitled')
      expect(state.clips).toEqual([])
      expect(state.padding).toBe(DEFAULT_PADDING)
    })
  })
})
