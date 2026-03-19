import React, { useRef, useEffect, useCallback } from 'react'
import { PreviewRenderer } from '../../canvas/renderer'
import { useProjectStore } from '../../stores/project'
import { useUIStore } from '../../stores/ui'

export const Preview: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const rendererRef = useRef<PreviewRenderer | null>(null)
  const animFrameRef = useRef<number>(0)

  const clips = useProjectStore((s) => s.clips)
  const keyframes = useProjectStore((s) => s.zoomKeyframes)
  const background = useProjectStore((s) => s.background)
  const padding = useProjectStore((s) => s.padding)
  const borderRadius = useProjectStore((s) => s.borderRadius)
  const shadow = useProjectStore((s) => s.shadow)
  const currentTime = useUIStore((s) => s.currentTime)
  const isPlaying = useUIStore((s) => s.isPlaying)
  const setCurrentTime = useUIStore((s) => s.setCurrentTime)

  // Initialize renderer
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

  // Load video when clips change
  useEffect(() => {
    if (clips.length === 0 || !videoRef.current) return
    const video = videoRef.current
    video.src = `file://${clips[0].filePath}`
    video.load()
    rendererRef.current?.setVideo(video)
  }, [clips])

  // Render loop
  const renderFrame = useCallback(() => {
    if (!rendererRef.current) return

    rendererRef.current.render(
      currentTime,
      keyframes,
      background,
      padding,
      borderRadius,
      shadow
    )

    if (isPlaying && videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }

    animFrameRef.current = requestAnimationFrame(renderFrame)
  }, [currentTime, keyframes, background, padding, borderRadius, shadow, isPlaying, setCurrentTime])

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(renderFrame)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [renderFrame])

  // Sync video playback
  useEffect(() => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.play()
    } else {
      videoRef.current.pause()
      videoRef.current.currentTime = currentTime
    }
  }, [isPlaying, currentTime])

  return (
    <div className="flex-1 relative bg-surface flex items-center justify-center p-4">
      {clips.length === 0 ? (
        <div className="text-white/30 text-center">
          <div className="text-4xl mb-3">&#127916;</div>
          <p className="text-lg">No recording yet</p>
          <p className="text-sm mt-1">Click "Record" to capture your screen</p>
        </div>
      ) : null}
      <canvas ref={canvasRef} className="max-w-full max-h-full" />
      <video ref={videoRef} className="hidden" muted playsInline />
    </div>
  )
}
