export default function StoryProgressBar({ storyCount, currentIndex, progress }) {
  return (
    <div className="story-progress">
      {Array.from({ length: storyCount }, (_, index) => {
        let fill = 0
        if (index < currentIndex) fill = 1
        else if (index === currentIndex) fill = progress

        return (
          <div key={index} className="story-progress-segment">
            <div
              className="story-progress-fill"
              style={{ width: `${fill * 100}%` }}
            />
          </div>
        )
      })}
    </div>
  )
}
