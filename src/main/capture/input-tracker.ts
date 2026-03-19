import { BrowserWindow, screen } from 'electron'
import type { InputEvent } from '../../shared/types'
import { IPC } from '../../shared/constants'

let trackingInterval: ReturnType<typeof setInterval> | null = null
let lastMousePos = { x: 0, y: 0 }
const inputEvents: InputEvent[] = []
let startTime = 0

export function startTracking(mainWindow: BrowserWindow): void {
  inputEvents.length = 0
  startTime = Date.now()

  // Poll mouse position at 60fps
  trackingInterval = setInterval(() => {
    const point = screen.getCursorScreenPoint()

    if (point.x !== lastMousePos.x || point.y !== lastMousePos.y) {
      const event: InputEvent = {
        type: 'move',
        x: point.x,
        y: point.y,
        timestamp: Date.now() - startTime
      }
      inputEvents.push(event)
      lastMousePos = { x: point.x, y: point.y }
    }
  }, 16)

  // Listen for mouse clicks via the main window
  mainWindow.webContents.on('input-event' as never, (_e: unknown, inputEvent: { type: string }) => {
    if (inputEvent.type === 'mouseDown') {
      const point = screen.getCursorScreenPoint()
      const event: InputEvent = {
        type: 'click',
        x: point.x,
        y: point.y,
        timestamp: Date.now() - startTime
      }
      inputEvents.push(event)
      mainWindow.webContents.send(IPC.INPUT_EVENT, event)
    }
  })
}

export function stopTracking(): InputEvent[] {
  if (trackingInterval) {
    clearInterval(trackingInterval)
    trackingInterval = null
  }
  return [...inputEvents]
}

export function getInputEvents(): InputEvent[] {
  return [...inputEvents]
}
