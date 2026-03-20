import React from 'react'
import { useRecordingStore } from '../../stores/recording'
import { useUIStore } from '../../stores/ui'
import { useProjectStore } from '../../stores/project'

export const Toolbar: React.FC = () => {
  const recordingState = useRecordingStore((s) => s.state)
  const setShowSourcePicker = useRecordingStore((s) => s.setShowSourcePicker)
  const stopRecording = useRecordingStore((s) => s.stopRecording)
  const setShowExportDialog = useUIStore((s) => s.setShowExportDialog)
  const projectName = useProjectStore((s) => s.name)
  const setName = useProjectStore((s) => s.setName)

  const handleRecord = () => {
    if (recordingState === 'recording') {
      stopRecording()
    } else {
      setShowSourcePicker(true)
    }
  }

  const handleSave = async () => {
    const project = useProjectStore.getState().getProjectData()
    await window.api.saveProject(project)
  }

  const handleLoad = async () => {
    const project = await window.api.loadProject()
    if (project) {
      useProjectStore.getState().loadProject(project)
    }
  }

  return (
    <div className="h-11 bg-surface-light/80 backdrop-blur-md border-b border-surface-border flex items-center justify-between px-4 -webkit-app-region-drag">
      {/* Left: Logo + project name */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-bold tracking-[0.2em] text-white/40 uppercase">ClipStudio</span>
        <div className="w-px h-4 bg-white/10" />
        <input
          type="text"
          value={projectName}
          onChange={(e) => setName(e.target.value)}
          className="bg-transparent text-[13px] text-white/70 w-36 focus:outline-none focus:text-white transition-colors"
          spellCheck={false}
        />
      </div>

      {/* Center: Record */}
      <div className="flex items-center">
        <button
          onClick={handleRecord}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-medium transition-all ${
            recordingState === 'recording'
              ? 'bg-danger hover:bg-danger-hover text-white shadow-[0_0_16px_rgba(239,68,68,0.3)]'
              : 'bg-white/10 hover:bg-white/15 text-white/90'
          }`}
        >
          {recordingState === 'recording' ? (
            <>
              <span className="w-2 h-2 rounded-sm bg-white animate-pulse" />
              Stop
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-danger" />
              Record
            </>
          )}
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleSave}
          className="px-3 py-1.5 rounded-md text-[12px] text-white/50 hover:text-white/80 hover:bg-white/5 transition-all"
        >
          Save
        </button>
        <button
          onClick={handleLoad}
          className="px-3 py-1.5 rounded-md text-[12px] text-white/50 hover:text-white/80 hover:bg-white/5 transition-all"
        >
          Open
        </button>
        <button
          onClick={() => setShowExportDialog(true)}
          className="px-4 py-1.5 rounded-md bg-accent hover:bg-accent-hover text-white text-[12px] font-medium transition-all shadow-glow"
        >
          Export
        </button>
      </div>
    </div>
  )
}
