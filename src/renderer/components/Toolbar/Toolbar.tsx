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
    <div className="h-12 bg-surface-light border-b border-white/10 flex items-center justify-between px-4 -webkit-app-region-drag">
      {/* Left: Project name */}
      <div className="flex items-center gap-3">
        <span className="text-accent font-bold text-sm tracking-wider">CLIPSTUDIO</span>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setName(e.target.value)}
          className="bg-transparent border border-white/10 rounded px-2 py-1 text-sm text-white/80 w-40 focus:outline-none focus:border-accent"
        />
      </div>

      {/* Center: Recording controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleRecord}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            recordingState === 'recording'
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
              : 'bg-accent hover:bg-accent-hover text-white'
          }`}
        >
          {recordingState === 'recording' ? 'Stop Recording' : 'Record'}
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          className="px-3 py-1.5 rounded text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          Save
        </button>
        <button
          onClick={handleLoad}
          className="px-3 py-1.5 rounded text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          Open
        </button>
        <button
          onClick={() => setShowExportDialog(true)}
          className="px-4 py-1.5 rounded bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
        >
          Export
        </button>
      </div>
    </div>
  )
}
