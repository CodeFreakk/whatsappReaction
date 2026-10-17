import { useEffect, useState } from 'react'

const EXIT_DURATION_MS = 420

export default function SendingToast({ emoji, onCancel, onComplete }) {
  const [secondsLeft, setSecondsLeft] = useState(3)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (isExiting) {
      const timer = window.setTimeout(() => {
        onComplete?.()
      }, EXIT_DURATION_MS)

      return () => window.clearTimeout(timer)
    }

    if (secondsLeft <= 0) return undefined

    const timer = window.setTimeout(() => {
      if (secondsLeft === 1) {
        setIsExiting(true)
      } else {
        setSecondsLeft((value) => value - 1)
      }
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [secondsLeft, isExiting, onComplete])

  return (
    <div
      className={`sending-toast${isExiting ? ' sending-toast--exiting' : ''}`}
      data-name="Message"
    >
      <p className="sending-toast-text">
        Sending {emoji} in{' '}
        <span className="sending-toast-countdown">{secondsLeft}</span>s…
      </p>
      <button type="button" className="sending-toast-cancel" onClick={onCancel}>
        Cancel
      </button>
    </div>
  )
}
