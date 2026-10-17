import { forwardRef } from 'react'

const StoryHeader = forwardRef(function StoryHeader({ userName, timeAgo }, avatarRef) {
  return (
    <header className="story-header">
      <div className="story-user-details">
        <img
          ref={avatarRef}
          className="story-avatar"
          src="/assets/avatar.png"
          alt=""
          width={42}
          height={42}
        />

        <div className="story-user">
          <p className="story-user-name">{userName}</p>
          <p className="story-user-time">{timeAgo}</p>
        </div>
      </div>

      <button type="button" className="story-menu-btn" aria-label="More options">
        <img src="/assets/menu-icon.svg" alt="" width={22} height={22} />
      </button>
    </header>
  )
})

StoryHeader.displayName = 'StoryHeader'

export default StoryHeader
