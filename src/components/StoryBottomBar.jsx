import SendingToast from './SendingToast'

const REACTIONS = ['😍', '😂', '😮']

export default function StoryBottomBar({
  onReaction,
  sendingToast,
  onCancelSending,
  onSendingComplete,
  isReactionLocked,
}) {
  return (
    <footer className={`story-bottom${sendingToast ? ' story-bottom--sending' : ''}`}>
      <div className={`story-bottom-content${sendingToast ? ' story-bottom-content--locked' : ''}`}>
        <div className="story-reply-pill story-glass">
          <span className="story-reply-label">Reply</span>
          <div className="story-reply-emojis">
            {REACTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="story-emoji-btn"
                disabled={isReactionLocked || Boolean(sendingToast)}
                onClick={(event) => onReaction?.(emoji, event.currentTarget)}
                aria-label={`React with ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="story-action-buttons">
          <button type="button" className="story-action-btn story-glass" aria-label="Reshare">
            <img src="/assets/repost-icon.svg" alt="" width={18} height={18} />
          </button>
          <button type="button" className="story-action-btn story-glass" aria-label="Like">
            <img src="/assets/heart-icon.svg" alt="" width={18} height={18} />
          </button>
        </div>
      </div>

      {sendingToast && (
        <div className="story-sending-slot">
          <SendingToast
            emoji={sendingToast.emoji}
            onCancel={onCancelSending}
            onComplete={onSendingComplete}
          />
        </div>
      )}
    </footer>
  )
}
