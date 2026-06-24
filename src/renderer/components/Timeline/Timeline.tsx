import React, { useRef, useCallback } from 'react'
import { useProjectStore } from '../../stores/project'
import { useUIStore } from '../../stores/ui'
import { formatTimecode } from '../../utils/time'
import { AUTO_ZOOM_SCALE, AUTO_ZOOM_DURATION_MS } from '../../../shared/constants'

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
  const selectedSegmentId = useUIStore((s) => s.selectedZoomSegmentId)
  const setSelectedSegmentId = useUIStore((s) => s.setSelectedZoomSegmentId)
  const setActivePanel = useUIStore((s) => s.setActivePanel)

  const totalDuration = clips.reduce(
    (acc, c) => Math.max(acc, c.offset + (c.endTime - c.startTime)),
    0
  )

  const pixelsPerSecond = 80 * timelineZoom

  const getSegmentBounds = (segId: string) => {
    const sorted = [...zoomSegments].sort((a, b) => a.startTime - b.startTime)
    const idx = sorted.findIndex((s) => s.id === segId)
    const minStart = idx > 0 ? sorted[idx - 1].endTime + 0.05 : 0
    const maxEnd = idx < sorted.length - 1 ? sorted[idx + 1].startTime - 0.05 : totalDuration
    return { minStart, maxEnd }
  }

  // Seek when clicking empty track space
  const handleTrackClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('[data-zoom-segment]')) return
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left + containerRef.current.scrollLeft
      const time = x / pixelsPerSecond
      setCurrentTime(Math.max(0, Math.min(time, totalDuration)))
      setSelectedSegmentId(null)
    },
    [pixelsPerSecond, totalDuration, setCurrentTime, setSelectedSegmentId]
  )

  const handleDeleteSegment = () => {
    if (selectedSegmentId) {
      removeZoomSegment(selectedSegmentId)
      setSelectedSegmentId(null)
    }
  }

  const handleAddZoomSegment = () => {
    if (totalDuration === 0) return
    const segDuration = AUTO_ZOOM_DURATION_MS / 1000
    let start = currentTime
    let end = start + segDuration
    const sorted = [...zoomSegments].sort((a, b) => a.startTime - b.startTime)

    for (const seg of sorted) {
      if (start < seg.endTime && end > seg.startTime) {
        start = seg.endTime + 0.05
        end = start + segDuration
      }
    }

    if (end > totalDuration) {
      end = totalDuration
      start = Math.max(0, end - segDuration)
    }

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

  // Click to select a segment
  const handleSegmentClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (selectedSegmentId === id) {
      setSelectedSegmentId(null)
    } else {
      setSelectedSegmentId(id)
      setActivePanel('zoom')
    }
  }

  // Drag handles for resizing only — segment body uses normal click selection.
  const handleDragStart = (e: React.PointerEvent, id: string, edge: 'left' | 'right') => {
    e.stopPropagation()
    e.preventDefault()

    const seg = zoomSegments.find((s) => s.id === id)
    if (!seg) return

    const origStart = seg.startTime
    const origEnd = seg.endTime
    const startX = e.clientX
    const bounds = getSegmentBounds(id)

    const handleMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX
      if (Math.abs(dx) < 3) return

      const dt = dx / pixelsPerSecond
      if (edge === 'left') {
        updateZoomSegment(id, {
          startTime: Math.max(bounds.minStart, Math.min(origStart + dt, origEnd - 0.1))
        })
      } else {
        updateZoomSegment(id, {
          endTime: Math.min(bounds.maxEnd, Math.max(origEnd + dt, origStart + 0.1))
        })
      }
    }

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
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
              <span className="text-[10px] text-white/30 font-mono">
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
        onClick={handleTrackClick}
      >
        {/* Ruler */}
        <div className="h-5 border-b border-surface-border relative" style={{ width: Math.max(totalDuration * pixelsPerSecond, 1) }}>
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
        <div className="h-10 relative" style={{ width: Math.max(totalDuration * pixelsPerSecond, 1) }}>
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
        <div className="h-12 relative border-t border-surface-border overflow-visible" style={{ width: Math.max(totalDuration * pixelsPerSecond, 1) }}>
          <span className="absolute left-1.5 top-0.5 text-[9px] text-white/15 font-mono">ZOOM</span>
          {zoomSegments.map((seg) => {
            const isSelected = selectedSegmentId === seg.id
            const left = seg.startTime * pixelsPerSecond
            const segWidth = (seg.endTime - seg.startTime) * pixelsPerSecond

            return (
              <div
                key={seg.id}
                data-zoom-segment="true"
                data-segment-id={seg.id}
                className={`absolute top-2 h-8 rounded-md cursor-pointer flex items-center select-none ${
                  isSelected
                    ? 'bg-amber-500/30 border-2 border-amber-400/70 shadow-[0_0_10px_rgba(251,191,36,0.25)] z-30'
                    : 'bg-accent/25 border border-accent/40 hover:bg-accent/35 hover:border-accent/60 z-20'
                }`}
                style={{ left, width: Math.max(segWidth, 20) }}
              >
                <button
                  type="button"
                  aria-label={`Select zoom segment ${seg.scale.toFixed(1)}x`}
                  className="absolute inset-y-0 left-3 right-3 z-20 cursor-pointer bg-transparent"
                  onClick={(e) => handleSegmentClick(e, seg.id)}
                />

                {/* Left resize handle */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-3 cursor-col-resize z-30 flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => handleDragStart(e, seg.id, 'left')}
                >
                  <div className={`w-[3px] h-4 rounded-full ${isSelected ? 'bg-amber-400' : 'bg-white/25'}`} />
                </div>

                {/* Label */}
                {segWidth > 40 && (
                  <span className={`text-[10px] px-4 truncate pointer-events-none ${isSelected ? 'text-amber-300/80' : 'text-white/40'}`}>
                    {seg.scale.toFixed(1)}x
                  </span>
                )}

                {/* Right resize handle */}
                <div
                  className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize z-30 flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => handleDragStart(e, seg.id, 'right')}
                >
                  <div className={`w-[3px] h-4 rounded-full ${isSelected ? 'bg-amber-400' : 'bg-white/25'}`} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-px bg-white/50 z-20 pointer-events-none"
          style={{ left: currentTime * pixelsPerSecond }}
        >
          <div className="w-2.5 h-2.5 bg-white rounded-full -ml-[4px] -mt-px shadow-sm" />
        </div>
      </div>
    </div>
  )
}
