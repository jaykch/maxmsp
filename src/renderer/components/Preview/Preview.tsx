import React, { useRef, useEffect, useCallback } from 'react'
import { PreviewRenderer } from '../../canvas/renderer'
import { useProjectStore } from '../../stores/project'
import { useUIStore } from '../../stores/ui'
import { useRecordingStore } from '../../stores/recording'

export const Preview: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const rendererRef = useRef<PreviewRenderer | null>(null)
  const animFrameRef = useRef<number>(0)

  const clips = useProjectStore((s) => s.clips)
  const keyframes = useProjectStore((s) => s.zoomKeyframes)
  const zoomSegments = useProjectStore((s) => s.zoomSegments)
  const projectInputEvents = useProjectStore((s) => s.inputEvents)
  const background = useProjectStore((s) => s.background)
  const padding = useProjectStore((s) => s.padding)
  const borderRadius = useProjectStore((s) => s.borderRadius)
  const shadow = useProjectStore((s) => s.shadow)
  const currentTime = useUIStore((s) => s.currentTime)
  const isPlaying = useUIStore((s) => s.isPlaying)
  const setCurrentTime = useUIStore((s) => s.setCurrentTime)
  const recordingState = useRecordingStore((s) => s.state)

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const container = canvas.parentElement!
    canvas.width = container.clientWidth * window.devicePixelRatio
    canvas.height = container.clientHeight * window.devicePixelRatio
    canvas.style.width = `${container.clientWidth}px`
    canvas.style.height = `${container.clientHeight}px`
    rendererRef.current = new PreviewRenderer(canvas)

    const resizeObserver = new ResizeObserver(() => {
      canvas.width = container.clientWidth * window.devicePixelRatio
      canvas.height = container.clientHeight * window.devicePixelRatio
      canvas.style.width = `${container.clientWidth}px`
      canvas.style.height = `${container.clientHeight}px`
    })
    resizeObserver.observe(container)
    return () => {
      resizeObserver.disconnect()
      rendererRef.current?.destroy()
    }
  }, [])

  useEffect(() => {
    if (clips.length === 0 || !videoRef.current) return
    const video = videoRef.current
    const filePath = clips[0].filePath
    const src = 'clip://' + encodeURI(filePath).replace(/#/g, '%23').replace(/\?/g, '%3F')
    console.log('[preview] loading video:', src)
    video.src = src
    video.load()
    video.onloadedmetadata = () => {
      console.log('[preview] video loaded:', video.videoWidth, 'x', video.videoHeight, 'duration:', video.duration)
      rendererRef.current?.setVideo(video)
    }
    video.onerror = () => {
      console.error('[preview] Failed to load video:', src, video.error)
    }
    video.onended = () => {
      console.log('[preview] video ended')
      useUIStore.getState().setIsPlaying(false)
    }
  }, [clips])

  const renderFrame = useCallback(() => {
    if (!rendererRef.current) return
    rendererRef.current.render(currentTime, keyframes, zoomSegments, projectInputEvents, background, padding, borderRadius, shadow)
    if (isPlaying && videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
    animFrameRef.current = requestAnimationFrame(renderFrame)
  }, [currentTime, keyframes, zoomSegments, projectInputEvents, background, padding, borderRadius, shadow, isPlaying, setCurrentTime])

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(renderFrame)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [renderFrame])

  useEffect(() => {
    if (!videoRef.current) return
    if (isPlaying) {
      console.log('[preview] play requested, readyState:', videoRef.current.readyState)
      videoRef.current.play().catch((err) => {
        console.error('[preview] play() rejected:', err)
      })
    } else {
      videoRef.current.pause()
    }
  }, [isPlaying])

  useEffect(() => {
    if (!videoRef.current || isPlaying) return
    videoRef.current.currentTime = currentTime
  }, [currentTime, isPlaying])

  const hasClips = clips.length > 0
  const isRecording = recordingState === 'recording'

  return (
    <div className="flex-1 relative bg-surface overflow-hidden">
      {/* Canvas always visible — renders background + video */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Overlay: empty state or recording indicator */}
      {!hasClips && !isRecording ? (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-black/20 backdrop-blur-sm border border-white/[0.08] flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10,8 16,12 10,16" fill="currentColor" />
              </svg>
            </div>
            <p className="text-[13px] text-white/40">No recording yet</p>
            <p className="text-[11px] text-white/20 mt-1">Click Record to capture your screen</p>
          </div>
        </div>
      ) : null}
      {isRecording ? (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-black/20 backdrop-blur-sm border border-danger/20 flex items-center justify-center">
              <span className="w-4 h-4 rounded-full bg-danger animate-pulse" />
            </div>
            <p className="text-[13px] text-white/70">Recording...</p>
            <p className="text-[11px] text-white/30 mt-1">Click Stop when done</p>
          </div>
        </div>
      ) : null}

      <video ref={videoRef} className="hidden" muted playsInline />
    </div>
  )
}
