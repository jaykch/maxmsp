import React, { useRef, useCallback } from 'react'
import { useProjectStore } from '../../stores/project'
import { useUIStore } from '../../stores/ui'
import { formatTimecode } from '../../utils/time'

export const Timeline: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  const clips = useProjectStore((s) => s.clips)
  const keyframes = useProjectStore((s) => s.zoomKeyframes)
  const removeZoomKeyframe = useProjectStore((s) => s.removeZoomKeyframe)
  const currentTime = useUIStore((s) => s.currentTime)
  const setCurrentTime = useUIStore((s) => s.setCurrentTime)
  const isPlaying = useUIStore((s) => s.isPlaying)
  const togglePlayback = useUIStore((s) => s.togglePlayback)
  const timelineZoom = useUIStore((s) => s.timelineZoom)
  const selectedKeyframeId = useUIStore((s) => s.selectedKeyframeId)
  const setSelectedKeyframeId = useUIStore((s) => s.setSelectedKeyframeId)

  const totalDuration = clips.reduce(
    (acc, c) => Math.max(acc, c.offset + (c.endTime - c.startTime)),
    0
  )

  const pixelsPerSecond = 80 * timelineZoom

  const handleTimelineClick = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left + containerRef.current.scrollLeft
      const time = x / pixelsPerSecond
      setCurrentTime(Math.max(0, Math.min(time, totalDuration)))
    },
    [pixelsPerSecond, totalDuration, setCurrentTime]
  )

  const handleKeyframeClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setSelectedKeyframeId(selectedKeyframeId === id ? null : id)
  }

  const handleDeleteKeyframe = () => {
    if (selectedKeyframeId) {
      removeZoomKeyframe(selectedKeyframeId)
      setSelectedKeyframeId(null)
    }
  }

  return (
    <div className="h-48 bg-surface-light border-t border-white/10 flex flex-col">
      {/* Controls bar */}
      <div className="h-8 flex items-center px-3 gap-3 border-b border-white/10 shrink-0">
        <button
          onClick={togglePlayback}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 text-white/70 hover:text-white"
        >
          {isPlaying ? '\u23F8' : '\u25B6'}
        </button>
        <span className="text-xs text-white/50 font-mono">
          {formatTimecode(currentTime)} / {formatTimecode(totalDuration)}
        </span>
        {selectedKeyframeId && (
          <button
            onClick={handleDeleteKeyframe}
            className="text-xs text-red-400 hover:text-red-300 ml-auto"
          >
            Delete Keyframe
          </button>
        )}
      </div>

      {/* Timeline tracks */}
      <div
        ref={containerRef}
        className="flex-1 overflow-x-auto overflow-y-hidden relative cursor-crosshair"
        onClick={handleTimelineClick}
      >
        {/* Time ruler */}
        <div className="h-5 border-b border-white/5 relative" style={{ width: totalDuration * pixelsPerSecond }}>
          {Array.from({ length: Math.ceil(totalDuration) }, (_, i) => (
            <div
              key={i}
              className="absolute top-0 h-full border-l border-white/10 text-[10px] text-white/30 pl-1"
              style={{ left: i * pixelsPerSecond }}
            >
              {i}s
            </div>
          ))}
        </div>

        {/* Clip track */}
        <div className="h-10 relative" style={{ width: totalDuration * pixelsPerSecond }}>
          {clips.map((clip) => (
            <div
              key={clip.id}
              className="absolute top-1 h-8 bg-accent/30 border border-accent/50 rounded text-xs flex items-center px-2 text-white/70"
              style={{
                left: clip.offset * pixelsPerSecond,
                width: (clip.endTime - clip.startTime) * pixelsPerSecond
              }}
            >
              Recording
            </div>
          ))}
        </div>

        {/* Keyframe track */}
        <div className="h-8 relative border-t border-white/5" style={{ width: totalDuration * pixelsPerSecond }}>
          <span className="absolute left-1 top-1 text-[10px] text-white/30">Zoom</span>
          {keyframes.map((kf) => (
            <div
              key={kf.id}
              onClick={(e) => handleKeyframeClick(e, kf.id)}
              className={`absolute top-2 w-3 h-3 rotate-45 cursor-pointer transition-colors ${
                selectedKeyframeId === kf.id
                  ? 'bg-yellow-400 border-yellow-300'
                  : 'bg-blue-400 border-blue-300 hover:bg-blue-300'
              } border`}
              style={{ left: kf.time * pixelsPerSecond - 6 }}
              title={`Zoom: ${kf.scale.toFixed(1)}x at ${kf.time.toFixed(2)}s`}
            />
          ))}
        </div>

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-px bg-accent z-10 pointer-events-none"
          style={{ left: currentTime * pixelsPerSecond }}
        >
          <div className="w-2 h-2 bg-accent rounded-full -ml-[3px] -mt-[1px]" />
        </div>
      </div>
    </div>
  )
}
