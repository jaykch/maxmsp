import { BrowserWindow } from 'electron'
import { join } from 'path'
import { app } from 'electron'
import { writeFile, mkdir } from 'fs/promises'
import { IPC } from '../../shared/constants'

let recordingWindow: BrowserWindow | null = null

function getRecordingsDir(): string {
  return join(app.getPath('userData'), 'recordings')
}

export async function startRecording(
  mainWindow: BrowserWindow,
  sourceId: string,
  _options: { audio: boolean; frameRate: number }
): Promise<string> {
  const recordingsDir = getRecordingsDir()
  await mkdir(recordingsDir, { recursive: true })

  const filePath = join(recordingsDir, `recording-${Date.now()}.webm`)

  // Create a hidden window to handle the actual MediaRecorder
  // This keeps recording stable even if the main UI is manipulated
  recordingWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  // The actual recording happens in the renderer process via desktopCapturer
  // We send the source ID to the main renderer which handles MediaRecorder
  mainWindow.webContents.send(IPC.RECORDING_STARTED, { filePath, sourceId })

  return filePath
}

export async function stopRecording(mainWindow: BrowserWindow): Promise<void> {
  mainWindow.webContents.send(IPC.RECORDING_STOPPED)

  if (recordingWindow) {
    recordingWindow.close()
    recordingWindow = null
  }
}

export async function saveRecordingChunk(
  filePath: string,
  data: Buffer
): Promise<void> {
  await writeFile(filePath, data)
}
