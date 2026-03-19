import React, { useState, useEffect } from 'react'
import { useUIStore } from '../../stores/ui'
import { useProjectStore } from '../../stores/project'
import type { ExportSettings } from '../../../shared/types'
import { RESOLUTION_PRESETS } from '../../../shared/constants'

export const ExportDialog: React.FC = () => {
  const showExportDialog = useUIStore((s) => s.showExportDialog)
  const setShowExportDialog = useUIStore((s) => s.setShowExportDialog)
  const exportState = useUIStore((s) => s.exportState)
  const setExportState = useUIStore((s) => s.setExportState)
  const exportProgress = useUIStore((s) => s.exportProgress)
  const setExportProgress = useUIStore((s) => s.setExportProgress)

  const [settings, setSettings] = useState<ExportSettings>({
    format: 'mp4',
    resolution: { width: 1920, height: 1080 },
    fps: 30,
    quality: 'high',
    codec: 'h264'
  })

  useEffect(() => {
    if (!showExportDialog) return

    window.api.onExportProgress((percent) => setExportProgress(percent))
    window.api.onExportDone(() => setExportState('done'))
    window.api.onExportError(() => setExportState('error'))
  }, [showExportDialog, setExportProgress, setExportState])

  if (!showExportDialog) return null

  const handleExport = async () => {
    setExportState('exporting')
    setExportProgress(0)
    const project = useProjectStore.getState().getProjectData()
    await window.api.exportVideo(project, settings)
  }

  const handleClose = () => {
    setShowExportDialog(false)
    setExportState('idle')
    setExportProgress(0)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-surface-light rounded-xl border border-white/10 p-6 w-96">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Export Video</h2>
          <button onClick={handleClose} className="text-white/40 hover:text-white text-xl">
            &#x2715;
          </button>
        </div>

        {exportState === 'exporting' ? (
          <div className="py-8">
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-accent transition-all duration-300 rounded-full"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
            <p className="text-sm text-white/50 text-center">
              Exporting... {Math.round(exportProgress)}%
            </p>
          </div>
        ) : exportState === 'done' ? (
          <div className="py-8 text-center">
            <p className="text-green-400 text-lg mb-2">Export complete!</p>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-accent rounded text-white text-sm"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Format */}
            <div>
              <label className="text-xs text-white/50 block mb-1">Format</label>
              <select
                value={settings.format}
                onChange={(e) =>
                  setSettings({ ...settings, format: e.target.value as 'mp4' | 'webm' })
                }
                className="w-full bg-surface border border-white/10 rounded px-2 py-1.5 text-sm text-white/80"
              >
                <option value="mp4">MP4 (H.264)</option>
                <option value="webm">WebM (VP9)</option>
              </select>
            </div>

            {/* Resolution */}
            <div>
              <label className="text-xs text-white/50 block mb-1">Resolution</label>
              <select
                value={`${settings.resolution.width}x${settings.resolution.height}`}
                onChange={(e) => {
                  const [w, h] = e.target.value.split('x').map(Number)
                  setSettings({ ...settings, resolution: { width: w, height: h } })
                }}
                className="w-full bg-surface border border-white/10 rounded px-2 py-1.5 text-sm text-white/80"
              >
                {Object.entries(RESOLUTION_PRESETS).map(([name, res]) => (
                  <option key={name} value={`${res.width}x${res.height}`}>
                    {name} ({res.width}x{res.height})
                  </option>
                ))}
              </select>
            </div>

            {/* Quality */}
            <div>
              <label className="text-xs text-white/50 block mb-1">Quality</label>
              <select
                value={settings.quality}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    quality: e.target.value as ExportSettings['quality']
                  })
                }
                className="w-full bg-surface border border-white/10 rounded px-2 py-1.5 text-sm text-white/80"
              >
                <option value="low">Low (smaller file)</option>
                <option value="medium">Medium</option>
                <option value="high">High (recommended)</option>
                <option value="lossless">Lossless (large file)</option>
              </select>
            </div>

            {/* FPS */}
            <div>
              <label className="text-xs text-white/50 block mb-1">Frame Rate</label>
              <select
                value={settings.fps}
                onChange={(e) => setSettings({ ...settings, fps: Number(e.target.value) })}
                className="w-full bg-surface border border-white/10 rounded px-2 py-1.5 text-sm text-white/80"
              >
                <option value={24}>24 fps</option>
                <option value={30}>30 fps</option>
                <option value={60}>60 fps</option>
              </select>
            </div>

            <button
              onClick={handleExport}
              className="w-full py-2 bg-accent hover:bg-accent-hover rounded text-white font-medium transition-colors"
            >
              Export
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
