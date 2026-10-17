export default function StoryTapZones({
  onPrevious,
  onNext,
  onPauseStart,
  onPauseEnd,
}) {
  return (
    <div className="story-tap-zones" aria-hidden="true">
      <button
        type="button"
        className="story-tap-zone story-tap-zone--left"
        aria-label="Previous story"
        onClick={onPrevious}
      />
      <button
        type="button"
        className="story-tap-zone story-tap-zone--center"
        aria-label="Pause story"
        onPointerDown={onPauseStart}
        onPointerUp={onPauseEnd}
        onPointerLeave={onPauseEnd}
        onPointerCancel={onPauseEnd}
      />
      <button
        type="button"
        className="story-tap-zone story-tap-zone--right"
        aria-label="Next story"
        onClick={onNext}
      />
    </div>
  )
}
