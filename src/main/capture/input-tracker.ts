import { BrowserWindow, screen } from 'electron'
import type { InputEvent } from '../../shared/types'

let trackingInterval: ReturnType<typeof setInterval> | null = null
let lastMousePos = { x: 0, y: 0 }
const inputEvents: InputEvent[] = []
let startTime = 0

// Click detection: cursor stops after moving at least MIN_MOVE pixels
const DWELL_MS = 100
const DWELL_RADIUS = 3
const MIN_MOVE = 20

let dwellStart = 0
let dwellPos = { x: 0, y: 0 }
let moveAccum = 0
let clickEmitted = false

export function startTracking(_mainWindow: BrowserWindow): void {
  inputEvents.length = 0
  startTime = Date.now()
  lastMousePos = { x: 0, y: 0 }
  dwellStart = 0
  moveAccum = 0
  clickEmitted = false

  trackingInterval = setInterval(() => {
    const point = screen.getCursorScreenPoint()
    const now = Date.now()
    const dist = Math.hypot(point.x - lastMousePos.x, point.y - lastMousePos.y)

    if (dist > 1) {
      moveAccum += dist
      clickEmitted = false
      inputEvents.push({
        type: 'move',
        x: point.x,
        y: point.y,
        timestamp: now - startTime
      })
      lastMousePos = { x: point.x, y: point.y }
      dwellStart = now
      dwellPos = { x: point.x, y: point.y }
    } else if (!clickEmitted && moveAccum >= MIN_MOVE) {
      if (Math.hypot(point.x - dwellPos.x, point.y - dwellPos.y) <= DWELL_RADIUS && now - dwellStart >= DWELL_MS) {
        inputEvents.push({
          type: 'click',
          x: point.x,
          y: point.y,
          timestamp: dwellStart - startTime
        })
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
