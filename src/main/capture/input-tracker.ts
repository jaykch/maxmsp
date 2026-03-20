import { BrowserWindow, screen } from 'electron'
import type { InputEvent } from '../../shared/types'
import { IPC } from '../../shared/constants'

let trackingInterval: ReturnType<typeof setInterval> | null = null
let lastMousePos = { x: 0, y: 0 }
const inputEvents: InputEvent[] = []
let startTime = 0

// Click detection: detect cursor pauses (dwell) and direction reversals.
// Since Electron has no global mouse-click API without native modules,
// we detect clicks heuristically from cursor movement patterns.
const DWELL_THRESHOLD_MS = 80
const DWELL_RADIUS_PX = 3
const MIN_MOVE_BEFORE_DWELL = 15 // Must have moved at least this many pixels before a dwell counts

let dwellStart = 0
let dwellPos = { x: 0, y: 0 }
let moveAccum = 0 // accumulated movement since last dwell/click
let clickEmitted = false

export function startTracking(mainWindow: BrowserWindow): void {
  inputEvents.length = 0
  startTime = Date.now()
  dwellStart = 0
  moveAccum = 0
  clickEmitted = false
  lastMousePos = { x: 0, y: 0 }

  trackingInterval = setInterval(() => {
    const point = screen.getCursorScreenPoint()
    const now = Date.now()
    const dx = point.x - lastMousePos.x
    const dy = point.y - lastMousePos.y
    const dist = Math.hypot(dx, dy)
    const moved = dist > 1

    if (moved) {
      moveAccum += dist
      clickEmitted = false

      const event: InputEvent = {
        type: 'move',
        x: point.x,
        y: point.y,
        timestamp: now - startTime
      }
      inputEvents.push(event)
      lastMousePos = { x: point.x, y: point.y }

      // Reset dwell tracking
      dwellStart = now
      dwellPos = { x: point.x, y: point.y }
    } else if (!clickEmitted && moveAccum >= MIN_MOVE_BEFORE_DWELL) {
      // Cursor stopped after significant movement
      const dwellDist = Math.hypot(point.x - dwellPos.x, point.y - dwellPos.y)
      if (dwellDist <= DWELL_RADIUS_PX && now - dwellStart >= DWELL_THRESHOLD_MS) {
        const event: InputEvent = {
          type: 'click',
          x: point.x,
          y: point.y,
          timestamp: dwellStart - startTime
        }
        inputEvents.push(event)
        mainWindow.webContents.send(IPC.INPUT_EVENT, event)
        clickEmitted = true
        moveAccum = 0
      }
    }
  }, 16)
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
