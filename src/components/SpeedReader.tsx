import { useState, useEffect, useRef, useCallback } from 'react'
import { ReaderSettings } from '../App'
import WordDisplay from './WordDisplay'
import ControlBar from './ControlBar'
import SettingsPanel from './SettingsPanel'
import './SpeedReader.css'

interface Props {
  words: string[]
  currentWordIndex: number
  onWordIndexChange: (index: number) => void
  settings: ReaderSettings
  onSettingsChange: (s: ReaderSettings) => void
  onOpenChapters: () => void
  onOpenUpload: () => void
}

export default function SpeedReader({
  words,
  currentWordIndex,
  onWordIndexChange,
  settings,
  onSettingsChange,
  onOpenChapters,
  onOpenUpload,
}: Props) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const indexRef = useRef(currentWordIndex)

  // Keep ref in sync with prop
  useEffect(() => {
    indexRef.current = currentWordIndex
  }, [currentWordIndex])

  const activeRef = useRef(false)

  const clearTimer = useCallback(() => {
    activeRef.current = false
    if (intervalRef.current !== null) {
      clearTimeout(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const settingsRef = useRef(settings)
  useEffect(() => {
    settingsRef.current = settings
  }, [settings])

  const wordsRef = useRef(words)
  useEffect(() => {
    wordsRef.current = words
  }, [words])

  const onWordIndexChangeRef = useRef(onWordIndexChange)
  useEffect(() => {
    onWordIndexChangeRef.current = onWordIndexChange
  }, [onWordIndexChange])

  const scheduleNext = useCallback(() => {
    if (!activeRef.current) return
    const { wpm, punctuationPause } = settingsRef.current
    const baseMs = Math.round(60000 / wpm)
    const word = wordsRef.current[indexRef.current] ?? ''
    const hasPunctuation = /[.!?;:,\u2014\u2013]$/.test(word)
    const delay = hasPunctuation ? Math.round(baseMs * punctuationPause) : baseMs

    intervalRef.current = setTimeout(() => {
      if (!activeRef.current) return
      const next = indexRef.current + 1
      if (next >= wordsRef.current.length) {
        activeRef.current = false
        setIsPlaying(false)
        return
      }
      indexRef.current = next
      onWordIndexChangeRef.current(next)
      scheduleNext()
    }, delay)
  }, [])

  const startPlaying = useCallback(() => {
    clearTimer()
    activeRef.current = true
    scheduleNext()
  }, [clearTimer, scheduleNext])

  useEffect(() => {
    if (isPlaying) {
      startPlaying()
    } else {
      clearTimer()
    }
    return clearTimer
  }, [isPlaying, startPlaying, clearTimer])

  // Restart when WPM changes while playing
  useEffect(() => {
    if (isPlaying) {
      startPlaying()
    }
  }, [settings.wpm, settings.punctuationPause]) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePlayPause = useCallback(() => {
    setIsPlaying((p) => !p)
  }, [])

  const handleSeek = useCallback(
    (index: number) => {
      onWordIndexChange(index)
    },
    [onWordIndexChange],
  )

  const handleWpmChange = useCallback(
    (delta: number) => {
      onSettingsChange({
        ...settings,
        wpm: Math.max(50, Math.min(1500, settings.wpm + delta)),
      })
    },
    [settings, onSettingsChange],
  )

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (showSettings) return
      if (e.code === 'Space') {
        e.preventDefault()
        setIsPlaying((p) => !p)
      } else if (e.code === 'ArrowRight') {
        e.preventDefault()
        onWordIndexChange(Math.min(words.length - 1, indexRef.current + 1))
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault()
        onWordIndexChange(Math.max(0, indexRef.current - 1))
      } else if (e.code === 'ArrowUp') {
        e.preventDefault()
        handleWpmChange(10)
      } else if (e.code === 'ArrowDown') {
        e.preventDefault()
        handleWpmChange(-10)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [showSettings, words.length, onWordIndexChange, handleWpmChange])

  const currentWord = words[currentWordIndex] ?? ''
  const progress = words.length > 1 ? currentWordIndex / (words.length - 1) : 0

  return (
    <div className="speed-reader">
      {/* Top bar */}
      <div className="reader-topbar">
        <button className="topbar-btn" onClick={onOpenUpload} title="Open new PDF">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span>Open PDF</span>
        </button>

        <div className="reader-title">SpeedReader</div>

        <div className="topbar-right">
          <button className="topbar-btn" onClick={onOpenChapters} title="Chapters & word selection">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            <span>Chapters</span>
          </button>
          <button
            className={`topbar-btn ${showSettings ? 'active' : ''}`}
            onClick={() => setShowSettings((s) => !s)}
            title="Settings"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Main reading area */}
      <div className="reader-main">
        <WordDisplay
          word={currentWord}
          fontSize={settings.fontSize}
          fontFamily={settings.fontFamily}
        />

        {/* Word counter */}
        <div className="word-counter">
          {currentWordIndex + 1} / {words.length}
        </div>
      </div>

      {/* Settings panel (overlay) */}
      {showSettings && (
        <SettingsPanel
          settings={settings}
          onSettingsChange={onSettingsChange}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Control bar */}
      <ControlBar
        isPlaying={isPlaying}
        wpm={settings.wpm}
        progress={progress}
        totalWords={words.length}
        currentIndex={currentWordIndex}
        onPlayPause={handlePlayPause}
        onWpmChange={handleWpmChange}
        onSeek={handleSeek}
      />
    </div>
  )
}
