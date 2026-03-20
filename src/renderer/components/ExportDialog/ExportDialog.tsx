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

  const selectClass = "w-full bg-white/[0.04] border border-surface-border rounded-md px-2.5 py-2 text-[12px] text-white/60 focus:outline-none focus:border-white/15 transition-colors"

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-surface-light rounded-xl border border-surface-border p-5 w-80 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[14px] font-semibold text-white/90">Export</h2>
          <button
            onClick={handleClose}
            className="w-6 h-6 flex items-center justify-center rounded-md text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 1l10 10M11 1L1 11" />
            </svg>
          </button>
        </div>

        {exportState === 'exporting' ? (
          <div className="py-8">
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-accent transition-all duration-300 rounded-full"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
            <p className="text-[11px] text-white/30 text-center font-mono">
              {Math.round(exportProgress)}%
            </p>
          </div>
        ) : exportState === 'done' ? (
          <div className="py-8 text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#10b981" strokeWidth="2">
                <polyline points="3,8 7,12 13,4" />
              </svg>
            </div>
            <p className="text-[13px] text-white/70 mb-4">Export complete</p>
            <button
              onClick={handleClose}
              className="px-4 py-1.5 bg-white/10 hover:bg-white/15 rounded-md text-[12px] text-white/70 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1.5">Format</label>
              <select
                value={settings.format}
                onChange={(e) => setSettings({ ...settings, format: e.target.value as 'mp4' | 'webm' })}
                className={selectClass}
              >
                <option value="mp4">MP4 (H.264)</option>
                <option value="webm">WebM (VP9)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1.5">Resolution</label>
              <select
                value={`${settings.resolution.width}x${settings.resolution.height}`}
                onChange={(e) => {
                  const [w, h] = e.target.value.split('x').map(Number)
                  setSettings({ ...settings, resolution: { width: w, height: h } })
                }}
                className={selectClass}
              >
                {Object.entries(RESOLUTION_PRESETS).map(([name, res]) => (
                  <option key={name} value={`${res.width}x${res.height}`}>
                    {name} ({res.width}x{res.height})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1.5">Quality</label>
              <select
                value={settings.quality}
                onChange={(e) => setSettings({ ...settings, quality: e.target.value as ExportSettings['quality'] })}
                className={selectClass}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="lossless">Lossless</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-1.5">Frame Rate</label>
              <select
                value={settings.fps}
                onChange={(e) => setSettings({ ...settings, fps: Number(e.target.value) })}
                className={selectClass}
              >
                <option value={24}>24 fps</option>
                <option value={30}>30 fps</option>
                <option value={60}>60 fps</option>
              </select>
            </div>

            <button
              onClick={handleExport}
              className="w-full py-2 bg-accent hover:bg-accent-hover rounded-md text-white text-[12px] font-medium transition-all shadow-glow mt-2"
            >
              Export
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
