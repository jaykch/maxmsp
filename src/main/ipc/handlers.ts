import { ipcMain, BrowserWindow, dialog, app } from 'electron'
import { join } from 'path'
import { writeFile, readFile } from 'fs/promises'
import { IPC } from '../../shared/constants'
import { getDesktopSources } from '../capture/sources'
import { startRecording, stopRecording, saveRecordingChunk } from '../capture/recorder'
import { startTracking, stopTracking } from '../capture/input-tracker'
import { exportVideo } from '../video/exporter'
import type { RecordingOptions, ProjectData, ExportSettings } from '../../shared/types'

function getMainWindow(): BrowserWindow {
  const windows = BrowserWindow.getAllWindows()
  if (windows.length === 0) throw new Error('No windows available')
  return windows[0]
}

export function registerIpcHandlers(): void {
  ipcMain.handle(IPC.GET_SOURCES, async () => {
    return await getDesktopSources()
  })

  ipcMain.handle(IPC.START_RECORDING, async (_event, options: RecordingOptions) => {
    const mainWindow = getMainWindow()
    startTracking(mainWindow)
    const filePath = await startRecording(mainWindow, options.sourceId, {
      audio: options.audio,
      frameRate: options.frameRate
    })
    return filePath
  })

  ipcMain.handle(IPC.STOP_RECORDING, async () => {
    const mainWindow = getMainWindow()
    const inputEvents = stopTracking()
    await stopRecording(mainWindow)
    return { inputEvents }
  })

  ipcMain.handle(
    IPC.EXPORT_VIDEO,
    async (_event, project: ProjectData, settings: ExportSettings) => {
      const mainWindow = getMainWindow()
      const { filePath } = await dialog.showSaveDialog(mainWindow, {
        defaultPath: join(app.getPath('documents'), `${project.name}.${settings.format}`),
        filters: [
          settings.format === 'mp4'
            ? { name: 'MP4 Video', extensions: ['mp4'] }
            : { name: 'WebM Video', extensions: ['webm'] }
        ]
      })

      if (!filePath) return null

      await exportVideo(mainWindow, project, settings, filePath)
      return filePath
    }
  )

  ipcMain.handle(IPC.SAVE_PROJECT, async (_event, project: ProjectData) => {
    const mainWindow = getMainWindow()
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      defaultPath: join(app.getPath('documents'), `${project.name}.clipstudio`),
      filters: [{ name: 'ClipStudio Project', extensions: ['clipstudio'] }]
    })

    if (filePath) {
      await writeFile(filePath, JSON.stringify(project, null, 2))
    }
    return filePath
  })

  ipcMain.handle(IPC.LOAD_PROJECT, async () => {
    const mainWindow = getMainWindow()
    const { filePaths } = await dialog.showOpenDialog(mainWindow, {
      filters: [{ name: 'ClipStudio Project', extensions: ['clipstudio'] }],
      properties: ['openFile']
    })

    if (filePaths.length === 0) return null
    const data = await readFile(filePaths[0], 'utf-8')
    return JSON.parse(data) as ProjectData
  })

  // Handle saving recording data from renderer
  ipcMain.handle(
    IPC.GET_RECORDING_PATH,
    async () => {
      return join(app.getPath('userData'), 'recordings', `recording-${Date.now()}.webm`)
    }
  )

  ipcMain.on('save-recording-chunk', async (_event, filePath: string, chunk: ArrayBuffer) => {
    await saveRecordingChunk(filePath, Buffer.from(chunk))
  })
}
