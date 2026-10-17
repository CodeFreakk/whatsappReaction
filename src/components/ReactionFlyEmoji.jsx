import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const BASE_SIZE = 25
const TARGET_SIZE = 54
const POP_OFFSET = 24
const POP_DURATION = 220
const FLY_DURATION = 720
const FORWARD_SPEED = 0.8
const REVERSE_SPEED = 0.5
const SCALE_DOWN_START = 0.85
const FADE_OUT_START = 0.9
const STRAIGHT_TO_CENTER_END = 0.42
const FLY_KEYFRAME_STEPS = 32

export default function ReactionFlyEmoji({
  emoji,
  startRect,
  endRect,
  reverse = false,
  onComplete,
}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !startRect || !endRect) return

    const startX = startRect.left + startRect.width / 2
    const startY = startRect.top + startRect.height / 2
    const popY = startY - POP_OFFSET
    const endX = endRect.left + endRect.width / 2
    const endY = endRect.top + endRect.height / 2

    const popScale = TARGET_SIZE / BASE_SIZE
    const endScale = 0.2

    const toTransform = (x, y, scale) =>
      `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale})`

    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2

    const curveControl = () => {
      const dx = endX - centerX
      const dy = endY - centerY
      const len = Math.hypot(dx, dy) || 1
      const perpX = -dy / len
      const perpY = dx / len
      const bulge = Math.min(130, len * 0.4)

      return {
        x: (centerX + endX) / 2 + perpX * bulge,
        y: (centerY + endY) / 2 + perpY * bulge,
      }
    }

    const positionAt = (progress) => {
      if (progress <= STRAIGHT_TO_CENTER_END) {
        const t = progress / STRAIGHT_TO_CENTER_END
        return {
          x: startX + (centerX - startX) * t,
          y: popY + (centerY - popY) * t,
        }
      }

      const t = (progress - STRAIGHT_TO_CENTER_END) / (1 - STRAIGHT_TO_CENTER_END)
      const control = curveControl()
      const u = 1 - t

      return {
        x: u * u * centerX + 2 * u * t * control.x + t * t * endX,
        y: u * u * centerY + 2 * u * t * control.y + t * t * endY,
      }
    }

    const scaleAt = (progress) => {
      if (progress <= SCALE_DOWN_START) return popScale
      const t = (progress - SCALE_DOWN_START) / (1 - SCALE_DOWN_START)
      return popScale + (endScale - popScale) * t
    }

    const opacityAt = (progress) => {
      if (progress <= FADE_OUT_START) return 1
      return 1 - (progress - FADE_OUT_START) / (1 - FADE_OUT_START)
    }

    let popAnim
    let flyAnim

    if (reverse) {
      const reverseFlyDuration = FLY_DURATION * REVERSE_SPEED
      const reversePopDuration = POP_DURATION * REVERSE_SPEED
      const totalReverseDuration = reverseFlyDuration + reversePopDuration
      const flyPortion = reverseFlyDuration / totalReverseDuration

      const flyKeyframes = Array.from({ length: FLY_KEYFRAME_STEPS + 1 }, (_, step) => {
        const progress = step / FLY_KEYFRAME_STEPS
        const forwardProgress = 1 - progress
        const { x, y } = positionAt(forwardProgress)

        return {
          transform: toTransform(x, y, scaleAt(forwardProgress)),
          opacity: opacityAt(forwardProgress),
          offset: (step / FLY_KEYFRAME_STEPS) * flyPortion,
        }
      })

      const reverseKeyframes = [
        ...flyKeyframes,
        {
          transform: toTransform(startX, startY, 1),
          opacity: 0,
          offset: 1,
        },
      ]

      flyAnim = el.animate(reverseKeyframes, {
        duration: totalReverseDuration,
        easing: 'linear',
        fill: 'forwards',
      })

      flyAnim.onfinish = () => onComplete?.()
    } else {
      const popDuration = POP_DURATION * FORWARD_SPEED
      const flyDuration = FLY_DURATION * FORWARD_SPEED

      popAnim = el.animate(
        [
          { transform: toTransform(startX, startY, 1), opacity: 1 },
          { transform: toTransform(startX, popY, popScale), opacity: 1 },
        ],
        { duration: popDuration, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' },
      )

      popAnim.onfinish = () => {
        const flyKeyframes = Array.from({ length: FLY_KEYFRAME_STEPS + 1 }, (_, step) => {
          const progress = step / FLY_KEYFRAME_STEPS
          const { x, y } = positionAt(progress)

          return {
            transform: toTransform(x, y, scaleAt(progress)),
            opacity: opacityAt(progress),
            offset: progress,
          }
        })

        flyAnim = el.animate(flyKeyframes, {
          duration: flyDuration,
          easing: 'linear',
          fill: 'forwards',
        })

        flyAnim.onfinish = () => onComplete?.()
      }
    }

    return () => {
      popAnim?.cancel()
      flyAnim?.cancel()
    }
  }, [emoji, startRect, endRect, reverse, onComplete])

  return createPortal(
    <div
      ref={ref}
      className="reaction-fly-emoji"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        fontSize: BASE_SIZE,
        lineHeight: 1,
        zIndex: 9999,
        pointerEvents: 'none',
        willChange: 'transform, opacity',
      }}
    >
      {emoji}
    </div>,
    document.body,
  )
}
