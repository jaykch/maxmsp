import React, { useRef, useCallback, useState } from 'react'
import { useProjectStore } from '../../stores/project'
import { useUIStore } from '../../stores/ui'
import { formatTimecode } from '../../utils/time'
import { AUTO_ZOOM_SCALE } from '../../../shared/constants'

export const Timeline: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  const clips = useProjectStore((s) => s.clips)
  const zoomSegments = useProjectStore((s) => s.zoomSegments)
  const addZoomSegment = useProjectStore((s) => s.addZoomSegment)
  const removeZoomSegment = useProjectStore((s) => s.removeZoomSegment)
  const updateZoomSegment = useProjectStore((s) => s.updateZoomSegment)
  const currentTime = useUIStore((s) => s.currentTime)
  const setCurrentTime = useUIStore((s) => s.setCurrentTime)
  const isPlaying = useUIStore((s) => s.isPlaying)
  const togglePlayback = useUIStore((s) => s.togglePlayback)
  const timelineZoom = useUIStore((s) => s.timelineZoom)

  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const totalDuration = clips.reduce(
    (acc, c) => Math.max(acc, c.offset + (c.endTime - c.startTime)),
    0
  )

  const pixelsPerSecond = 80 * timelineZoom

  // Find the bounds a segment can occupy without overlapping neighbors
  const getSegmentBounds = (segId: string) => {
    const sorted = [...zoomSegments].sort((a, b) => a.startTime - b.startTime)
    const idx = sorted.findIndex((s) => s.id === segId)
    const minStart = idx > 0 ? sorted[idx - 1].endTime + 0.05 : 0
    const maxEnd = idx < sorted.length - 1 ? sorted[idx + 1].startTime - 0.05 : totalDuration
    return { minStart, maxEnd }
  }

  const handleTimelineClick = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) return
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left + containerRef.current.scrollLeft
      const time = x / pixelsPerSecond
      setCurrentTime(Math.max(0, Math.min(time, totalDuration)))
      setSelectedSegmentId(null)
    },
    [pixelsPerSecond, totalDuration, setCurrentTime, isDragging]
  )

  const handleDeleteSegment = () => {
    if (selectedSegmentId) {
      removeZoomSegment(selectedSegmentId)
      setSelectedSegmentId(null)
    }
  }

  const handleAddZoomSegment = () => {
    if (totalDuration === 0) return

    // Find a gap at the current playhead, or append at the end
    const segDuration = 1.0
    let start = currentTime
    let end = start + segDuration

    // Sort existing segments
    const sorted = [...zoomSegments].sort((a, b) => a.startTime - b.startTime)

    // Check for overlap and adjust
    for (const seg of sorted) {
      if (start < seg.endTime && end > seg.startTime) {
        // Overlaps — push start to after this segment
        start = seg.endTime + 0.05
        end = start + segDuration
      }
    }

    // Clamp to total duration
    if (end > totalDuration) {
      end = totalDuration
      start = Math.max(0, end - segDuration)
    }

    // Final overlap check — if still overlapping, don't add
    const wouldOverlap = sorted.some(
      (seg) => start < seg.endTime && end > seg.startTime
    )
    if (wouldOverlap || end - start < 0.1) return

    addZoomSegment({
      startTime: start,
      endTime: end,
      scale: AUTO_ZOOM_SCALE,
      clickX: 0.5,
      clickY: 0.5
    })
  }

  // Drag to resize/move segments with overlap prevention.
  // Only starts dragging after mouse moves 3px — otherwise it's treated as a click.
  const handleSegmentMouseDown = (e: React.MouseEvent, id: string, edge: 'left' | 'right' | 'body') => {
    e.stopPropagation()
    const seg = zoomSegments.find((s) => s.id === id)
    if (!seg) return

    const origStart = seg.startTime
    const origEnd = seg.endTime
    const startX = e.clientX
    const bounds = getSegmentBounds(id)
    let didDrag = false

    const handleMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX
      if (!didDrag && Math.abs(dx) < 3) return // Dead zone — don't start dragging yet
      didDrag = true
      setIsDragging(true)

      const dt = dx / pixelsPerSecond

      if (edge === 'left') {
        const newStart = Math.max(bounds.minStart, Math.min(origStart + dt, origEnd - 0.1))
        updateZoomSegment(id, { startTime: newStart })
      } else if (edge === 'right') {
        const newEnd = Math.min(bounds.maxEnd, Math.max(origEnd + dt, origStart + 0.1))
        updateZoomSegment(id, { endTime: newEnd })
      } else {
        const duration = origEnd - origStart
        let newStart = origStart + dt
        newStart = Math.max(bounds.minStart, Math.min(newStart, bounds.maxEnd - duration))
        updateZoomSegment(id, { startTime: newStart, endTime: newStart + duration })
      }
    }

    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)

      if (!didDrag) {
        // Was a click, not a drag — toggle selection
        setSelectedSegmentId(selectedSegmentId === id ? null : id)
      }
      // Delay clearing so the timeline click handler doesn't also fire
      setTimeout(() => setIsDragging(false), 0)
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
  }

  const selectedSeg = zoomSegments.find((s) => s.id === selectedSegmentId)

  return (
    <div className="h-48 bg-surface-light border-t border-surface-border flex flex-col">
      {/* Controls */}
      <div className="h-8 flex items-center px-3 gap-3 border-b border-surface-border shrink-0">
        <button
          onClick={togglePlayback}
          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/5 text-white/50 hover:text-white/80 transition-colors"
        >
          {isPlaying ? (
            <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor"><rect x="0" y="0" width="3" height="12" rx="1" /><rect x="7" y="0" width="3" height="12" rx="1" /></svg>
          ) : (
            <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor"><polygon points="0,0 10,6 0,12" /></svg>
          )}
        </button>
        <span className="text-[11px] text-white/30 font-mono tabular-nums">
          {formatTimecode(currentTime)} / {formatTimecode(totalDuration)}
        </span>

        <div className="flex items-center gap-2 ml-auto">
          {selectedSeg && (
            <>
              <span className="text-[10px] text-white/30">
                {selectedSeg.scale.toFixed(1)}x &middot; {(selectedSeg.endTime - selectedSeg.startTime).toFixed(1)}s
              </span>
              <button
                onClick={handleDeleteSegment}
                className="text-[11px] text-danger/70 hover:text-danger transition-colors"
              >
                Delete
              </button>
              <div className="w-px h-3 bg-white/10" />
            </>
          )}
          <button
            onClick={handleAddZoomSegment}
            className="text-[11px] text-accent hover:text-accent-hover transition-colors flex items-center gap-1"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="5" y1="1" x2="5" y2="9" />
              <line x1="1" y1="5" x2="9" y2="5" />
            </svg>
            Add Zoom
          </button>
        </div>
      </div>

      {/* Tracks */}
      <div
        ref={containerRef}
        className="flex-1 overflow-x-auto overflow-y-hidden relative cursor-crosshair"
        onClick={handleTimelineClick}
      >
        {/* Ruler */}
        <div className="h-5 border-b border-surface-border relative" style={{ width: totalDuration * pixelsPerSecond }}>
          {Array.from({ length: Math.ceil(totalDuration) }, (_, i) => (
            <div
              key={i}
              className="absolute top-0 h-full border-l border-white/[0.06] text-[9px] text-white/20 pl-1 pt-0.5 font-mono"
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
              className="absolute top-1 h-8 bg-accent/10 border border-accent/20 rounded-md text-[10px] flex items-center px-2 text-white/40"
              style={{
                left: clip.offset * pixelsPerSecond,
                width: (clip.endTime - clip.startTime) * pixelsPerSecond
              }}
            >
              Recording
            </div>
          ))}
        </div>

        {/* Zoom segment track */}
        <div className="h-10 relative border-t border-surface-border" style={{ width: totalDuration * pixelsPerSecond }}>
          <span className="absolute left-1.5 top-0.5 text-[9px] text-white/15 font-mono z-0">ZOOM</span>
          {zoomSegments.map((seg) => {
            const isSelected = selectedSegmentId === seg.id
            const left = seg.startTime * pixelsPerSecond
            const segWidth = (seg.endTime - seg.startTime) * pixelsPerSecond

            return (
              <div
                key={seg.id}
                className={`absolute top-1.5 h-7 rounded-md cursor-grab flex items-center transition-colors group ${
                  isSelected
                    ? 'bg-amber-500/30 border border-amber-400/60 shadow-[0_0_8px_rgba(251,191,36,0.2)]'
                    : 'bg-accent/20 border border-accent/30 hover:bg-accent/30'
                }`}
                style={{ left, width: Math.max(segWidth, 12) }}
                onMouseDown={(e) => handleSegmentMouseDown(e, seg.id, 'body')}
              >
                {/* Left resize handle */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize z-10 flex items-center justify-center"
                  onMouseDown={(e) => handleSegmentMouseDown(e, seg.id, 'left')}
                >
                  <div className="w-0.5 h-3 bg-white/30 rounded-full group-hover:bg-white/50" />
                </div>
                {/* Label */}
                {segWidth > 30 && (
                  <span className="text-[9px] text-white/50 px-3 truncate select-none pointer-events-none">
                    {seg.scale.toFixed(1)}x
                  </span>
                )}
                {/* Right resize handle */}
                <div
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize z-10 flex items-center justify-center"
                  onMouseDown={(e) => handleSegmentMouseDown(e, seg.id, 'right')}
                >
                  <div className="w-0.5 h-3 bg-white/30 rounded-full group-hover:bg-white/50" />
                </div>
              </div>
            )
          })}
        </div>

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-px bg-white/40 z-10 pointer-events-none"
          style={{ left: currentTime * pixelsPerSecond }}
        >
          <div className="w-2 h-2 bg-white rounded-full -ml-[3px] -mt-px" />
        </div>
      </div>
    </div>
  )
}
