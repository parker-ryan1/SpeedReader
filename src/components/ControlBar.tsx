import './ControlBar.css'

interface Props {
  isPlaying: boolean
  wpm: number
  progress: number
  totalWords: number
  currentIndex: number
  onPlayPause: () => void
  onWpmChange: (delta: number) => void
  onSeek: (index: number) => void
}

export default function ControlBar({
  isPlaying,
  wpm,
  progress,
  totalWords,
  currentIndex,
  onPlayPause,
  onWpmChange,
  onSeek,
}: Props) {
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const idx = Math.round((parseFloat(e.target.value) / 100) * (totalWords - 1))
    onSeek(idx)
  }

  const progressPercent = progress * 100

  return (
    <div className="control-bar">
      {/* Progress slider */}
      <div className="progress-row">
        <span className="progress-label">{formatTime(currentIndex, wpm)}</span>
        <div className="slider-track">
          <div className="slider-fill" style={{ width: `${progressPercent}%` }} />
          <input
            type="range"
            className="progress-slider"
            min={0}
            max={100}
            step={0.01}
            value={progressPercent}
            onChange={handleSeekChange}
          />
        </div>
        <span className="progress-label">{formatTime(totalWords - 1, wpm)}</span>
      </div>

      {/* Buttons row */}
      <div className="buttons-row">
        {/* WPM controls */}
        <div className="wpm-group">
          <button
            className="ctrl-btn wpm-btn"
            onClick={() => onWpmChange(-50)}
            title="-50 WPM"
          >
            −50
          </button>
          <button
            className="ctrl-btn wpm-btn"
            onClick={() => onWpmChange(-10)}
            title="-10 WPM"
          >
            −10
          </button>
          <div className="wpm-display">
            <span className="wpm-value">{wpm}</span>
            <span className="wpm-unit">WPM</span>
          </div>
          <button
            className="ctrl-btn wpm-btn"
            onClick={() => onWpmChange(10)}
            title="+10 WPM"
          >
            +10
          </button>
          <button
            className="ctrl-btn wpm-btn"
            onClick={() => onWpmChange(50)}
            title="+50 WPM"
          >
            +50
          </button>
        </div>

        {/* Play/Pause */}
        <button
          className={`ctrl-btn play-btn ${isPlaying ? 'playing' : ''}`}
          onClick={onPlayPause}
          title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        >
          {isPlaying ? (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>

        {/* Skip controls */}
        <div className="skip-group">
          <button
            className="ctrl-btn skip-btn"
            onClick={() => onSeek(Math.max(0, currentIndex - 100))}
            title="Back 100 words"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="11 17 6 12 11 7" />
              <polyline points="18 17 13 12 18 7" />
            </svg>
          </button>
          <button
            className="ctrl-btn skip-btn"
            onClick={() => onSeek(Math.max(0, currentIndex - 10))}
            title="Back 10 words"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            className="ctrl-btn skip-btn"
            onClick={() => onSeek(Math.min(totalWords - 1, currentIndex + 10))}
            title="Forward 10 words"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          <button
            className="ctrl-btn skip-btn"
            onClick={() => onSeek(Math.min(totalWords - 1, currentIndex + 100))}
            title="Forward 100 words"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="13 17 18 12 13 7" />
              <polyline points="6 17 11 12 6 7" />
            </svg>
          </button>
        </div>
      </div>

      <p className="keyboard-hint">Space: play/pause · ←→: step word · ↑↓: ±10 WPM</p>
    </div>
  )
}

function formatTime(wordIndex: number, wpm: number): string {
  const seconds = Math.round((wordIndex / wpm) * 60)
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
