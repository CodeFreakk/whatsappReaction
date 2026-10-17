import { useCallback, useEffect, useRef, useState } from 'react'
import StoryProgressBar from './StoryProgressBar'
import StoryHeader from './StoryHeader'
import StoryBottomBar from './StoryBottomBar'
import StoryTapZones from './StoryTapZones'
import ReactionFlyEmoji from './ReactionFlyEmoji'
import {
  IMAGE_STORY_DURATION_MS,
  INITIAL_STORY_INDEX,
  STORIES,
} from '../data/stories'

const RESTART_THRESHOLD = 0.05

export default function StoryViewer() {
  const avatarRef = useRef(null)
  const videoRef = useRef(null)
  const [currentStoryIndex, setCurrentStoryIndex] = useState(INITIAL_STORY_INDEX)
  const [progress, setProgress] = useState(0)
  const [playbackKey, setPlaybackKey] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [hasVideo, setHasVideo] = useState(false)
  const [flyState, setFlyState] = useState(null)
  const [sendingToast, setSendingToast] = useState(null)
  const flyStateRef = useRef(flyState)
  const sendingToastRef = useRef(sendingToast)
  const pendingAdvanceRef = useRef(false)

  flyStateRef.current = flyState
  sendingToastRef.current = sendingToast

  const currentStory = STORIES[currentStoryIndex]

  const clearInteractionState = useCallback(() => {
    setFlyState(null)
    setSendingToast(null)
  }, [])

  const restartCurrentStory = useCallback(() => {
    setProgress(0)
    setPlaybackKey((key) => key + 1)
  }, [])

  const goToStory = useCallback((index) => {
    pendingAdvanceRef.current = false
    clearInteractionState()
    setCurrentStoryIndex(index)
    setProgress(0)
    setIsPaused(false)
    setPlaybackKey((key) => key + 1)
  }, [clearInteractionState])

  const advanceStoryMedia = useCallback(() => {
    setCurrentStoryIndex((index) => (index + 1) % STORIES.length)
    setProgress(0)
    setIsPaused(false)
    setPlaybackKey((key) => key + 1)
  }, [])

  const requestStoryAdvance = useCallback(() => {
    if (flyStateRef.current || sendingToastRef.current) {
      pendingAdvanceRef.current = true
      setProgress(1)
      return
    }

    pendingAdvanceRef.current = false
    advanceStoryMedia()
  }, [advanceStoryMedia])

  const goToNext = useCallback(() => {
    goToStory((currentStoryIndex + 1) % STORIES.length)
  }, [currentStoryIndex, goToStory])

  const goToPrevious = useCallback(() => {
    if (progress > RESTART_THRESHOLD) {
      restartCurrentStory()
      return
    }

    if (currentStoryIndex > 0) {
      goToStory(currentStoryIndex - 1)
    }
  }, [progress, currentStoryIndex, goToStory, restartCurrentStory])

  const handlePauseStart = useCallback(() => {
    setIsPaused(true)
  }, [])

  const handlePauseEnd = useCallback(() => {
    setIsPaused(false)
  }, [])

  useEffect(() => {
    if (!pendingAdvanceRef.current || flyState || sendingToast) return undefined

    pendingAdvanceRef.current = false
    advanceStoryMedia()

    return undefined
  }, [flyState, sendingToast, advanceStoryMedia])

  useEffect(() => {
    if (currentStory.type !== 'video') {
      setHasVideo(false)
      return undefined
    }

    const video = videoRef.current
    if (!video) return undefined

    setHasVideo(false)
    video.load()
    video.currentTime = 0
    video.play().catch(() => {})

    const handleTimeUpdate = () => {
      if (video.duration && Number.isFinite(video.duration)) {
        setProgress(video.currentTime / video.duration)
      }
    }

    const handleEnded = () => {
      requestStoryAdvance()
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
      video.pause()
    }
  }, [currentStory, playbackKey, requestStoryAdvance])

  useEffect(() => {
    const video = videoRef.current
    if (!video || currentStory.type !== 'video' || !hasVideo) return undefined

    if (isPaused) {
      video.pause()
    } else {
      video.play().catch(() => {})
    }

    return undefined
  }, [isPaused, currentStory.type, hasVideo])

  useEffect(() => {
    if (currentStory.type !== 'image') return undefined

    let elapsed = 0
    let lastTick = performance.now()
    let frameId
    let hasRequestedAdvance = false

    const tick = (now) => {
      if (hasRequestedAdvance) return

      if (!isPaused) {
        elapsed += now - lastTick
        const nextProgress = Math.min(elapsed / IMAGE_STORY_DURATION_MS, 1)
        setProgress(nextProgress)

        if (nextProgress >= 1) {
          hasRequestedAdvance = true
          requestStoryAdvance()
          return
        }
      }

      lastTick = now
      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frameId)
  }, [currentStory, playbackKey, isPaused, requestStoryAdvance])

  const handleReaction = useCallback((emoji, buttonEl) => {
    if (flyState || sendingToast || !avatarRef.current) return

    setFlyState({
      emoji,
      startRect: buttonEl.getBoundingClientRect(),
      endRect: avatarRef.current.getBoundingClientRect(),
    })
  }, [flyState, sendingToast])

  const handleFlyComplete = useCallback(() => {
    setFlyState((current) => {
      if (current) {
        setSendingToast({
          emoji: current.emoji,
          startRect: current.startRect,
          endRect: current.endRect,
        })
      }
      return null
    })
  }, [])

  const handleCancelSending = useCallback(() => {
    setSendingToast((current) => {
      if (current) {
        setFlyState({
          emoji: current.emoji,
          startRect: current.startRect,
          endRect: current.endRect,
          reverse: true,
        })
      }
      return null
    })
  }, [])

  const handleReverseFlyComplete = useCallback(() => {
    setFlyState(null)
  }, [])

  const handleSendingComplete = useCallback(() => {
    setSendingToast(null)
  }, [])

  return (
    <div className="story-viewer" data-name="WhatsApp Status Reaction">
      <div className="story-media">
        {currentStory.type === 'video' && (
          <video
            ref={videoRef}
            key={`${currentStory.src}-${playbackKey}`}
            className={`story-video${hasVideo ? ' story-video--visible' : ''}`}
            src={currentStory.src}
            autoPlay
            muted
            playsInline
            onLoadedData={() => setHasVideo(true)}
            onError={() => setHasVideo(false)}
          />
        )}
        {currentStory.type === 'image' && (
          <img
            key={`${currentStory.src}-${playbackKey}`}
            className="story-image"
            src={currentStory.src}
            alt=""
          />
        )}
        <div className="story-media-overlay" aria-hidden="true" />
        <StoryTapZones
          onPrevious={goToPrevious}
          onNext={goToNext}
          onPauseStart={handlePauseStart}
          onPauseEnd={handlePauseEnd}
        />
      </div>

      <div className="story-top">
        <StoryProgressBar
          storyCount={STORIES.length}
          currentIndex={currentStoryIndex}
          progress={progress}
        />
        <StoryHeader ref={avatarRef} userName="Samuel Ayo" timeAgo="23m" />
      </div>

      <StoryBottomBar
        onReaction={handleReaction}
        sendingToast={sendingToast}
        onCancelSending={handleCancelSending}
        onSendingComplete={handleSendingComplete}
        isReactionLocked={Boolean(flyState)}
      />

      {flyState && (
        <ReactionFlyEmoji
          emoji={flyState.emoji}
          startRect={flyState.startRect}
          endRect={flyState.endRect}
          reverse={flyState.reverse}
          onComplete={flyState.reverse ? handleReverseFlyComplete : handleFlyComplete}
        />
      )}
    </div>
  )
}
