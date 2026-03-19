import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '../shared/constants'
import type {
  DesktopSource,
  RecordingOptions,
  InputEvent,
  ProjectData,
  ExportSettings
} from '../shared/types'

const api = {
  // Screen capture
  getSources: (): Promise<DesktopSource[]> =>
    ipcRenderer.invoke(IPC.GET_SOURCES),

  startRecording: (options: RecordingOptions): Promise<string> =>
    ipcRenderer.invoke(IPC.START_RECORDING, options),

  stopRecording: (): Promise<{ inputEvents: InputEvent[] }> =>
    ipcRenderer.invoke(IPC.STOP_RECORDING),

  getRecordingPath: (): Promise<string> =>
    ipcRenderer.invoke(IPC.GET_RECORDING_PATH),

  // Export
  exportVideo: (project: ProjectData, settings: ExportSettings): Promise<string | null> =>
    ipcRenderer.invoke(IPC.EXPORT_VIDEO, project, settings),

  // Project
  saveProject: (project: ProjectData): Promise<string | null> =>
    ipcRenderer.invoke(IPC.SAVE_PROJECT, project),

  loadProject: (): Promise<ProjectData | null> =>
    ipcRenderer.invoke(IPC.LOAD_PROJECT),

  // Event listeners
  onRecordingStarted: (callback: (data: { filePath: string; sourceId: string }) => void) => {
    ipcRenderer.on(IPC.RECORDING_STARTED, (_event, data) => callback(data))
  },

  onRecordingStopped: (callback: () => void) => {
    ipcRenderer.on(IPC.RECORDING_STOPPED, () => callback())
  },

  onInputEvent: (callback: (event: InputEvent) => void) => {
    ipcRenderer.on(IPC.INPUT_EVENT, (_event, data) => callback(data))
  },

  onExportProgress: (callback: (percent: number) => void) => {
    ipcRenderer.on(IPC.EXPORT_PROGRESS, (_event, percent) => callback(percent))
  },

  onExportDone: (callback: (filePath: string) => void) => {
    ipcRenderer.on(IPC.EXPORT_DONE, (_event, filePath) => callback(filePath))
  },

  onExportError: (callback: (error: string) => void) => {
    ipcRenderer.on(IPC.EXPORT_ERROR, (_event, error) => callback(error))
  },

  // Save recording data
  saveRecordingChunk: (filePath: string, data: ArrayBuffer): void => {
    ipcRenderer.send('save-recording-chunk', filePath, data)
  }
}

contextBridge.exposeInMainWorld('api', api)

export type ElectronAPI = typeof api
