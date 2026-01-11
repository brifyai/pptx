import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSlideOptimization, useDebounce, useThrottle } from './useSlideOptimization'
import { vi } from 'vitest'

describe('useSlideOptimization', () => {
  const mockSlides = [
    { id: 1, name: 'Slide 1', content: { assets: [] } },
    { id: 2, name: 'Slide 2', content: { assets: [{ type: 'image' }] }, preview: 'data:image/png;base64,abc' },
    { id: 3, name: 'Slide 3', content: { assets: [{ type: 'chart' }] }, preview: 'data:image/png;base64,def' }
  ]

  it('should return correct slide count', () => {
    const { result } = renderHook(() => useSlideOptimization(mockSlides))
    expect(result.current.slideCount).toBe(3)
  })

  it('should filter slides with assets', () => {
    const { result } = renderHook(() => useSlideOptimization(mockSlides))
    expect(result.current.slidesWithAssets).toHaveLength(2)
  })

  it('should filter slides with preview', () => {
    const { result } = renderHook(() => useSlideOptimization(mockSlides))
    expect(result.current.slidesWithPreview).toHaveLength(2)
  })

  it('should find slide by id', () => {
    const { result } = renderHook(() => useSlideOptimization(mockSlides))
    const slide = result.current.findSlideById(2)
    expect(slide).toBeDefined()
    expect(slide.name).toBe('Slide 2')
  })

  it('should find slide index', () => {
    const { result } = renderHook(() => useSlideOptimization(mockSlides))
    const index = result.current.findSlideIndex(2)
    expect(index).toBe(1)
  })

  it('should validate if slide can move up', () => {
    const { result } = renderHook(() => useSlideOptimization(mockSlides))
    expect(result.current.canMoveSlide(0, 'up')).toBe(false)
    expect(result.current.canMoveSlide(1, 'up')).toBe(true)
  })

  it('should validate if slide can move down', () => {
    const { result } = renderHook(() => useSlideOptimization(mockSlides))
    expect(result.current.canMoveSlide(2, 'down')).toBe(false)
    expect(result.current.canMoveSlide(1, 'down')).toBe(true)
  })
})

describe('useDebounce', () => {
  it('should debounce value changes', async () => {
    vi.useFakeTimers()
    
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    )

    expect(result.current).toBe('initial')

    // Cambiar valor
    rerender({ value: 'changed' })
    expect(result.current).toBe('initial') // Aún no debounced

    // Avanzar tiempo
    vi.advanceTimersByTime(300)
    
    // Ahora debería estar actualizado
    expect(result.current).toBe('changed')

    vi.useRealTimers()
  })
})

describe('useThrottle', () => {
  it('should throttle function calls', () => {
    vi.useFakeTimers()
    
    const callback = vi.fn()
    const { result } = renderHook(() => useThrottle(callback, 100))

    // Primera llamada - debería ejecutarse
    result.current()
    expect(callback).toHaveBeenCalledTimes(1)

    // Segunda llamada inmediata - no debería ejecutarse
    result.current()
    expect(callback).toHaveBeenCalledTimes(1)

    // Avanzar tiempo
    vi.advanceTimersByTime(100)

    // Tercera llamada - debería ejecutarse
    result.current()
    expect(callback).toHaveBeenCalledTimes(2)

    vi.useRealTimers()
  })
})
