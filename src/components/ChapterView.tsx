import { useState, useRef, useEffect, useCallback } from 'react'
import { Chapter } from '../utils/pdfParser'
import './ChapterView.css'

interface Props {
  words: string[]
  chapters: Chapter[]
  pageBreaks: number[]
  currentWordIndex: number
  onJumpToWord: (index: number) => void
  onBack: () => void
}

const WORDS_PER_PAGE = 200

export default function ChapterView({
  words,
  chapters,
  currentWordIndex,
  onJumpToWord,
  onBack,
}: Props) {
  const [selectedChapter, setSelectedChapter] = useState(0)
  const [viewPage, setViewPage] = useState(0)
  const [hoveredWord, setHoveredWord] = useState<number | null>(null)
  const wordRefs = useRef<Map<number, HTMLSpanElement>>(new Map())
  const containerRef = useRef<HTMLDivElement>(null)

  const chapter = chapters[selectedChapter]
  const chapterStart = chapter?.startWordIndex ?? 0
  const nextChapter = chapters[selectedChapter + 1]
  const chapterEnd = nextChapter ? nextChapter.startWordIndex : words.length

  const chapterWords = words.slice(chapterStart, chapterEnd)
  const totalPages = Math.ceil(chapterWords.length / WORDS_PER_PAGE)
  const pageStart = viewPage * WORDS_PER_PAGE
  const pageEnd = Math.min(pageStart + WORDS_PER_PAGE, chapterWords.length)
  const pageWords = chapterWords.slice(pageStart, pageEnd)

  // Scroll current word into view when chapter changes
  useEffect(() => {
    const el = wordRefs.current.get(currentWordIndex)
    if (el) {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  }, [currentWordIndex, selectedChapter, viewPage])

  const handleWordClick = useCallback(
    (absoluteIndex: number) => {
      onJumpToWord(absoluteIndex)
    },
    [onJumpToWord],
  )

  const handleChapterSelect = (idx: number) => {
    setSelectedChapter(idx)
    setViewPage(0)
  }

  return (
    <div className="chapter-view">
      {/* Sidebar: chapter list */}
      <div className="chapter-sidebar">
        <div className="chapter-sidebar-header">
          <button className="back-btn" onClick={onBack}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Reader
          </button>
          <h3>Chapters</h3>
        </div>
        <div className="chapter-list">
          {chapters.map((ch, idx) => (
            <button
              key={idx}
              className={`chapter-item ${selectedChapter === idx ? 'active' : ''}`}
              onClick={() => handleChapterSelect(idx)}
            >
              <span className="chapter-num">{idx + 1}</span>
              <span className="chapter-title">{ch.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main: word view */}
      <div className="chapter-main">
        <div className="chapter-main-header">
          <h2>{chapter?.title ?? 'Document'}</h2>
          <div className="chapter-stats">
            <span>{chapterWords.length} words</span>
            <span>·</span>
            <span>~{Math.round(chapterWords.length / 250)} min read</span>
          </div>
        </div>

        <div className="chapter-hint">
          Click any word to start reading from that point
        </div>

        <div className="word-grid-container" ref={containerRef}>
          <div className="word-grid">
            {pageWords.map((word, i) => {
              const absoluteIndex = chapterStart + pageStart + i
              const isCurrent = absoluteIndex === currentWordIndex
              const isHovered = hoveredWord === absoluteIndex

              return (
                <span
                  key={absoluteIndex}
                  ref={(el) => {
                    if (el) wordRefs.current.set(absoluteIndex, el)
                    else wordRefs.current.delete(absoluteIndex)
                  }}
                  className={`word-token ${isCurrent ? 'current' : ''} ${isHovered ? 'hovered' : ''}`}
                  onClick={() => handleWordClick(absoluteIndex)}
                  onMouseEnter={() => setHoveredWord(absoluteIndex)}
                  onMouseLeave={() => setHoveredWord(null)}
                  title={`Word ${absoluteIndex + 1}: click to start here`}
                >
                  {word}
                </span>
              )
            })}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="chapter-pagination">
            <button
              className="page-btn"
              disabled={viewPage === 0}
              onClick={() => setViewPage((p) => p - 1)}
            >
              ← Prev
            </button>
            <span className="page-info">
              Page {viewPage + 1} of {totalPages}
            </span>
            <button
              className="page-btn"
              disabled={viewPage >= totalPages - 1}
              onClick={() => setViewPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
