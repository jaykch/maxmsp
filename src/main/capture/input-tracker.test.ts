import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

vi.mock('electron', () => ({
  BrowserWindow: vi.fn(),
  screen: {
    getCursorScreenPoint: vi.fn(() => ({ x: 100, y: 200 }))
  }
}))

import { startTracking, stopTracking, getInputEvents } from './input-tracker'
import { screen } from 'electron'

describe('input-tracker', () => {
  const mockWindow = { webContents: { send: vi.fn() } }

  beforeEach(() => {
    vi.useFakeTimers()
    stopTracking()
  })

  afterEach(() => {
    stopTracking()
    vi.useRealTimers()
  })

  it('records mouse move events', () => {
    startTracking(mockWindow as never)
    vi.advanceTimersByTime(16 * 3)

    const events = getInputEvents()
    expect(events.length).toBeGreaterThan(0)
    expect(events[0].type).toBe('move')
    expect(events[0].x).toBe(100)
    expect(events[0].y).toBe(200)
  })

  it('does not record when cursor is stationary', () => {
    startTracking(mockWindow as never)
    vi.advanceTimersByTime(16) // first poll records initial position
    stopTracking()

    // Same position — should not add more events
    startTracking(mockWindow as never)
    vi.advanceTimersByTime(16 * 5)

    const events = getInputEvents()
    const moveEvents = events.filter((e) => e.type === 'move')
    expect(moveEvents.length).toBeLessThanOrEqual(1)
  })

  it('records position changes', () => {
    const mockGetCursor = vi.mocked(screen.getCursorScreenPoint)
    mockGetCursor
      .mockReturnValueOnce({ x: 100, y: 200 } as Electron.Point)
      .mockReturnValueOnce({ x: 200, y: 300 } as Electron.Point)
      .mockReturnValueOnce({ x: 300, y: 400 } as Electron.Point)

    startTracking(mockWindow as never)
    vi.advanceTimersByTime(16 * 3)

    const events = getInputEvents()
    expect(events.filter((e) => e.type === 'move').length).toBeGreaterThanOrEqual(2)
  })

  it('detects click when cursor dwells after movement', () => {
    const mockGetCursor = vi.mocked(screen.getCursorScreenPoint)
    // Move far enough to exceed MIN_MOVE threshold
    mockGetCursor
      .mockReturnValueOnce({ x: 100, y: 200 } as Electron.Point)
      .mockReturnValueOnce({ x: 130, y: 230 } as Electron.Point)
      .mockReturnValue({ x: 130, y: 230 } as Electron.Point) // dwell

    startTracking(mockWindow as never)
    vi.advanceTimersByTime(16 * 2 + 200) // move + dwell

    const events = getInputEvents()
    const clicks = events.filter((e) => e.type === 'click')
    expect(clicks.length).toBe(1)
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
