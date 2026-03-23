import { useEffect, useMemo, useRef, useState } from 'react'
import { Maximize2, RotateCcw } from 'lucide-react'
import { Button } from '../../../components/ui/button.jsx'

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function distanceBetweenTouches(touches) {
  const [first, second] = touches
  return Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY)
}

export function ZoomableImageStage({ src, alt }) {
  const containerRef = useRef(null)
  const panStartRef = useRef(null)
  const pinchStartRef = useRef(null)
  const scaleRef = useRef(1)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const transform = useMemo(
    () => `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
    [offset.x, offset.y, scale],
  )

  useEffect(() => {
    scaleRef.current = scale
  }, [scale])

  function resetView() {
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return undefined
    }

    function handleWheel(event) {
      event.preventDefault()
      const nextScale = clamp(
        scaleRef.current + (event.deltaY > 0 ? -0.12 : 0.12),
        1,
        4,
      )

      if (nextScale === 1) {
        setOffset({ x: 0, y: 0 })
      }

      setScale(nextScale)
    }

    container.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [])

  function handlePointerDown(event) {
    if (scale <= 1) {
      return
    }

    panStartRef.current = {
      x: event.clientX - offset.x,
      y: event.clientY - offset.y,
    }
  }

  function handlePointerMove(event) {
    if (!panStartRef.current || scale <= 1) {
      return
    }

    setOffset({
      x: event.clientX - panStartRef.current.x,
      y: event.clientY - panStartRef.current.y,
    })
  }

  function handlePointerUp() {
    panStartRef.current = null
  }

  function handleTouchStart(event) {
    if (event.touches.length === 2) {
      pinchStartRef.current = {
        distance: distanceBetweenTouches(event.touches),
        scale,
      }
    }
  }

  function handleTouchMove(event) {
    if (event.touches.length === 2 && pinchStartRef.current) {
      const nextScale = clamp(
        pinchStartRef.current.scale
          * (distanceBetweenTouches(event.touches) / pinchStartRef.current.distance),
        1,
        4,
      )

      setScale(nextScale)

      if (nextScale === 1) {
        setOffset({ x: 0, y: 0 })
      }
    }
  }

  function handleTouchEnd() {
    if (!containerRef.current) {
      return
    }

    if (scale === 1) {
      setOffset({ x: 0, y: 0 })
    }

    if (pinchStartRef.current && scale < 1.01) {
      pinchStartRef.current = null
    }
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[28px] border border-stone-200/80 bg-stone-950/96">
      <div className="absolute left-3 top-3 z-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white/70 backdrop-blur-sm">
        <Maximize2 className="size-3.5" />
        Pinch para ampliar
      </div>

      {scale > 1 ? (
        <Button
          variant="secondary"
          size="sm"
          className="absolute right-3 top-3 z-10 h-9 rounded-full border border-white/10 bg-black/35 px-3 text-white hover:bg-black/55"
          onClick={resetView}
        >
          <RotateCcw className="mr-2 size-3.5" />
          Resetar
        </Button>
      ) : null}

      <div
        ref={containerRef}
        className="flex min-h-0 flex-1 items-center justify-center overflow-hidden touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={src}
          alt={alt}
          className="max-h-full w-full select-none object-contain shadow-[0_30px_90px_-55px_rgba(255,255,255,0.35)]"
          style={{ transform, transformOrigin: 'center center', transition: scale === 1 ? 'transform 180ms ease' : 'none' }}
          draggable="false"
        />
      </div>
    </div>
  )
}
