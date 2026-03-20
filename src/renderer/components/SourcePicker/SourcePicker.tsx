import React, { useEffect } from 'react'
import { useRecordingStore } from '../../stores/recording'

export const SourcePicker: React.FC = () => {
  const sources = useRecordingStore((s) => s.sources)
  const showSourcePicker = useRecordingStore((s) => s.showSourcePicker)
  const setShowSourcePicker = useRecordingStore((s) => s.setShowSourcePicker)
  const setSelectedSource = useRecordingStore((s) => s.setSelectedSource)
  const fetchSources = useRecordingStore((s) => s.fetchSources)
  const startRecording = useRecordingStore((s) => s.startRecording)

  useEffect(() => {
    if (showSourcePicker) {
      fetchSources()
    }
  }, [showSourcePicker, fetchSources])

  if (!showSourcePicker) return null

  const handleSelect = (source: (typeof sources)[0]) => {
    setSelectedSource(source)
    setShowSourcePicker(false)
    startRecording()
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-surface-light rounded-xl border border-surface-border p-5 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[14px] font-semibold text-white/90">Select Source</h2>
          <button
            onClick={() => setShowSourcePicker(false)}
            className="w-6 h-6 flex items-center justify-center rounded-md text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 1l10 10M11 1L1 11" />
            </svg>
          </button>
        </div>

        {sources.length === 0 ? (
          <div className="text-white/20 text-[12px] text-center py-12">Loading sources...</div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {sources.map((source) => (
              <button
                key={source.id}
                onClick={() => handleSelect(source)}
                className="group relative rounded-lg overflow-hidden border border-surface-border hover:border-accent/40 transition-all hover:shadow-glow"
              >
                <img
                  src={source.thumbnailDataUrl}
                  alt={source.name}
                  className="w-full aspect-video object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5">
                  <span className="text-[10px] text-white/70 truncate block">{source.name}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
