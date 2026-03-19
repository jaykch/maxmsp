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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-surface-light rounded-xl border border-white/10 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Select Source</h2>
          <button
            onClick={() => setShowSourcePicker(false)}
            className="text-white/40 hover:text-white text-xl"
          >
            &#x2715;
          </button>
        </div>

        {sources.length === 0 ? (
          <div className="text-white/40 text-center py-12">Loading sources...</div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {sources.map((source) => (
              <button
                key={source.id}
                onClick={() => handleSelect(source)}
                className="group relative rounded-lg overflow-hidden border-2 border-transparent hover:border-accent transition-colors"
              >
                <img
                  src={source.thumbnailDataUrl}
                  alt={source.name}
                  className="w-full aspect-video object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1">
                  <span className="text-xs text-white/80 truncate block">
                    {source.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
