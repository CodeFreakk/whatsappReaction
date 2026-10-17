import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const CURSOR_SIZE = 30
const CURSOR_PRESSED_SIZE = 22

export default function DesktopCursor() {
  const [isDesktop, setIsDesktop] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isPressed, setIsPressed] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)')
    const updateDesktop = () => setIsDesktop(mediaQuery.matches)

    updateDesktop()
    mediaQuery.addEventListener('change', updateDesktop)

    return () => mediaQuery.removeEventListener('change', updateDesktop)
  }, [])

  useEffect(() => {
    if (!isDesktop) return undefined

    document.documentElement.classList.add('desktop-cursor-active')

    const handleMove = (event) => {
      setPosition({ x: event.clientX, y: event.clientY })
      setIsVisible(true)
    }

    const handleDown = () => setIsPressed(true)
    const handleUp = () => setIsPressed(false)
    const handleLeave = () => setIsVisible(false)

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mousedown', handleDown)
    window.addEventListener('mouseup', handleUp)
    document.documentElement.addEventListener('mouseleave', handleLeave)

    return () => {
      document.documentElement.classList.remove('desktop-cursor-active')
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mousedown', handleDown)
      window.removeEventListener('mouseup', handleUp)
      document.documentElement.removeEventListener('mouseleave', handleLeave)
    }
  }, [isDesktop])

  if (!isDesktop || !isVisible) return null

  const size = isPressed ? CURSOR_PRESSED_SIZE : CURSOR_SIZE

  return createPortal(
    <div
      className="desktop-cursor"
      style={{
        width: size,
        height: size,
        left: position.x,
        top: position.y,
      }}
      aria-hidden="true"
    />,
    document.body,
  )
}
