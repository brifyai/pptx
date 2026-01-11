import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSwipe, useLongPress, usePinch } from './useSwipe'

describe('useSwipe', () => {
  it('should detect swipe left', () => {
    const onSwipeLeft = vi.fn()
    const { result } = renderHook(() => useSwipe({ onSwipeLeft }))

    // Simular touch start
    act(() => {
      result.current.onTouchStart({
        targetTouches: [{ clientX: 200, clientY: 100 }]
      })
    })

    // Simular touch move (swipe left)
    act(() => {
      result.current.onTouchMove({
        targetTouches: [{ clientX: 100, clientY: 100 }]
      })
    })

    // Simular touch end
    act(() => {
      result.current.onTouchEnd()
    })

    expect(onSwipeLeft).toHaveBeenCalled()
  })

  it('should detect swipe right', () => {
    const onSwipeRight = vi.fn()
    const { result } = renderHook(() => useSwipe({ onSwipeRight }))

    act(() => {
      result.current.onTouchStart({
        targetTouches: [{ clientX: 100, clientY: 100 }]
      })
    })

    act(() => {
      result.current.onTouchMove({
        targetTouches: [{ clientX: 200, clientY: 100 }]
      })
    })

    act(() => {
      result.current.onTouchEnd()
    })

    expect(onSwipeRight).toHaveBeenCalled()
  })

  it('should not trigger swipe if distance is too small', () => {
    const onSwipeLeft = vi.fn()
    const { result } = renderHook(() => useSwipe({ 
      onSwipeLeft,
      minSwipeDistance: 100 
    }))

    act(() => {
      result.current.onTouchStart({
        targetTouches: [{ clientX: 150, clientY: 100 }]
      })
    })

    act(() => {
      result.current.onTouchMove({
        targetTouches: [{ clientX: 100, clientY: 100 }]
      })
    })

    act(() => {
      result.current.onTouchEnd()
    })

    expect(onSwipeLeft).not.toHaveBeenCalled()
  })
})

describe('useLongPress', () => {
  it('should trigger callback after long press', async () => {
    vi.useFakeTimers()
    const callback = vi.fn()
    const { result } = renderHook(() => useLongPress(callback, 500))

    act(() => {
      result.current.onTouchStart({ target: {} })
    })

    // Avanzar tiempo
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(callback).toHaveBeenCalled()

    vi.useRealTimers()
  })

  it('should not trigger if released early', async () => {
    vi.useFakeTimers()
    const callback = vi.fn()
    const { result } = renderHook(() => useLongPress(callback, 500))

    act(() => {
      result.current.onTouchStart({ target: {} })
    })

    // Soltar antes de tiempo
    act(() => {
      vi.advanceTimersByTime(200)
      result.current.onTouchEnd()
    })

    expect(callback).not.toHaveBeenCalled()

    vi.useRealTimers()
  })
})

describe('usePinch', () => {
  it('should detect pinch zoom', () => {
    const onPinchMove = vi.fn()
    const { result } = renderHook(() => usePinch({ onPinchMove }))

    // Simular inicio de pinch (2 dedos)
    act(() => {
      result.current.onTouchStart({
        touches: [
          { clientX: 100, clientY: 100 },
          { clientX: 200, clientY: 100 }
        ]
      })
    })

    // Simular movimiento de pinch (separar dedos)
    act(() => {
      result.current.onTouchMove({
        touches: [
          { clientX: 50, clientY: 100 },
          { clientX: 250, clientY: 100 }
        ]
      })
    })

    expect(onPinchMove).toHaveBeenCalled()
    expect(result.current.scale).toBeGreaterThan(1)
  })

  it('should reset scale', () => {
    const { result } = renderHook(() => usePinch({}))

    act(() => {
      result.current.onTouchStart({
        touches: [
          { clientX: 100, clientY: 100 },
          { clientX: 200, clientY: 100 }
        ]
      })
    })

    act(() => {
      result.current.onTouchMove({
        touches: [
          { clientX: 50, clientY: 100 },
          { clientX: 250, clientY: 100 }
        ]
      })
    })

    expect(result.current.scale).toBeGreaterThan(1)

    act(() => {
      result.current.resetScale()
    })

    expect(result.current.scale).toBe(1)
  })
})
