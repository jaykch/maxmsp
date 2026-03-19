import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

// Mock electron modules
vi.mock('electron', () => ({
  BrowserWindow: vi.fn(),
  screen: {
    getCursorScreenPoint: vi.fn(() => ({ x: 100, y: 200 }))
  }
}))

import { startTracking, stopTracking, getInputEvents } from './input-tracker'
import { screen } from 'electron'

describe('input-tracker', () => {
  let mockWindow: { webContents: { on: ReturnType<typeof vi.fn>; send: ReturnType<typeof vi.fn> } }

  beforeEach(() => {
    vi.useFakeTimers()
    mockWindow = {
      webContents: {
        on: vi.fn(),
        send: vi.fn()
      }
    }
    // Reset tracked events by stopping any existing tracking
    stopTracking()
  })

  afterEach(() => {
    stopTracking()
    vi.useRealTimers()
  })

  it('starts tracking and records mouse positions', () => {
    startTracking(mockWindow as never)

    // Advance timers to trigger polling
    vi.advanceTimersByTime(16 * 3) // 3 poll intervals

    const events = getInputEvents()
    // Should have at least one move event (position 100,200)
    expect(events.length).toBeGreaterThan(0)
    expect(events[0].type).toBe('move')
    expect(events[0].x).toBe(100)
    expect(events[0].y).toBe(200)
  })

  it('does not record duplicate positions', () => {
    // First start+stop to set lastMousePos to 100,200
    startTracking(mockWindow as never)
    vi.advanceTimersByTime(16)
    stopTracking()

    // Now start again - lastMousePos is already 100,200
    // and getCursorScreenPoint still returns 100,200
    startTracking(mockWindow as never)
    vi.advanceTimersByTime(16 * 5)

    const events = getInputEvents()
    // Should record zero new move events since position hasn't changed
    const moveEvents = events.filter((e) => e.type === 'move')
    expect(moveEvents).toHaveLength(0)
  })

  it('records position changes', () => {
    const mockGetCursor = vi.mocked(screen.getCursorScreenPoint)
    mockGetCursor.mockReturnValueOnce({ x: 100, y: 200 } as Electron.Point)
    mockGetCursor.mockReturnValueOnce({ x: 150, y: 250 } as Electron.Point)
    mockGetCursor.mockReturnValueOnce({ x: 200, y: 300 } as Electron.Point)

    startTracking(mockWindow as never)
    vi.advanceTimersByTime(16 * 3)

    const events = getInputEvents()
    const moveEvents = events.filter((e) => e.type === 'move')
    expect(moveEvents.length).toBeGreaterThanOrEqual(2)
  })

  it('stops tracking and returns events', () => {
    startTracking(mockWindow as never)
    vi.advanceTimersByTime(16 * 2)

    const events = stopTracking()
    expect(Array.isArray(events)).toBe(true)
    expect(events.length).toBeGreaterThan(0)
  })

  it('registers input-event listener on window', () => {
    startTracking(mockWindow as never)
    expect(mockWindow.webContents.on).toHaveBeenCalledWith(
      'input-event',
      expect.any(Function)
    )
  })

  it('getInputEvents returns copy of events', () => {
    startTracking(mockWindow as never)
    vi.advanceTimersByTime(16)

    const events1 = getInputEvents()
    const events2 = getInputEvents()
    expect(events1).toEqual(events2)
    expect(events1).not.toBe(events2) // different references
  })
})
