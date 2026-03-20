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
  let mockWindow: { webContents: { send: ReturnType<typeof vi.fn> } }

  beforeEach(() => {
    vi.useFakeTimers()
    mockWindow = {
      webContents: {
        send: vi.fn()
      }
    }
    stopTracking()
  })

  afterEach(() => {
    stopTracking()
    vi.useRealTimers()
  })

  it('starts tracking and records mouse positions', () => {
    startTracking(mockWindow as never)
    vi.advanceTimersByTime(16 * 3)

    const events = getInputEvents()
    expect(events.length).toBeGreaterThan(0)
    expect(events[0].type).toBe('move')
    expect(events[0].x).toBe(100)
    expect(events[0].y).toBe(200)
  })

  it('does not record move events when cursor is stationary', () => {
    // First start to register initial position
    startTracking(mockWindow as never)
    vi.advanceTimersByTime(16)
    stopTracking()

    // Mock returns same position — no movement above threshold
    const mockGetCursor = vi.mocked(screen.getCursorScreenPoint)
    mockGetCursor.mockReturnValue({ x: 100, y: 200 } as Electron.Point)

    startTracking(mockWindow as never)
    // Advance enough that dwell detection runs but cursor hasn't moved significantly
    vi.advanceTimersByTime(16 * 5)

    const events = getInputEvents()
    // First poll may detect the initial position as a move from 0,0 → 100,200
    // After that, no new move events because position is stationary
    const moveEvents = events.filter((e) => e.type === 'move')
    expect(moveEvents.length).toBeLessThanOrEqual(1)
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

  it('detects click via cursor dwell after movement', () => {
    const mockGetCursor = vi.mocked(screen.getCursorScreenPoint)

    // Simulate: move to 300,400, then stop (dwell)
    mockGetCursor
      .mockReturnValueOnce({ x: 100, y: 200 } as Electron.Point)  // initial move
      .mockReturnValueOnce({ x: 200, y: 300 } as Electron.Point)  // moving
      .mockReturnValueOnce({ x: 300, y: 400 } as Electron.Point)  // moving
      // Then stationary for dwell threshold
      .mockReturnValue({ x: 300, y: 400 } as Electron.Point)

    startTracking(mockWindow as never)
    // Move phase
    vi.advanceTimersByTime(16 * 3)
    // Dwell phase — needs to exceed DWELL_THRESHOLD_MS (150ms)
    vi.advanceTimersByTime(200)

    const events = getInputEvents()
    const clickEvents = events.filter((e) => e.type === 'click')
    expect(clickEvents.length).toBe(1)
    expect(clickEvents[0].x).toBe(300)
    expect(clickEvents[0].y).toBe(400)
  })

  it('sends click event to renderer via IPC', () => {
    const mockGetCursor = vi.mocked(screen.getCursorScreenPoint)
    mockGetCursor
      .mockReturnValueOnce({ x: 100, y: 200 } as Electron.Point)
      .mockReturnValueOnce({ x: 300, y: 400 } as Electron.Point)
      .mockReturnValue({ x: 300, y: 400 } as Electron.Point)

    startTracking(mockWindow as never)
    vi.advanceTimersByTime(16 * 2 + 200)

    expect(mockWindow.webContents.send).toHaveBeenCalledWith(
      'input-event',
      expect.objectContaining({ type: 'click', x: 300, y: 400 })
    )
  })

  it('stops tracking and returns events', () => {
    startTracking(mockWindow as never)
    vi.advanceTimersByTime(16 * 2)

    const events = stopTracking()
    expect(Array.isArray(events)).toBe(true)
    expect(events.length).toBeGreaterThan(0)
  })

  it('getInputEvents returns copy of events', () => {
    startTracking(mockWindow as never)
    vi.advanceTimersByTime(16)

    const events1 = getInputEvents()
    const events2 = getInputEvents()
    expect(events1).toEqual(events2)
    expect(events1).not.toBe(events2)
  })
})
