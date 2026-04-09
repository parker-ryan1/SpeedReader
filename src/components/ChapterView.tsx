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
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<number[]>([])
  const [searchResultIdx, setSearchResultIdx] = useState(0)
  const searchInputRef = useRef<HTMLInputElement>(null)
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

  // Ctrl+F to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        setSearchOpen(true)
        setTimeout(() => searchInputRef.current?.focus(), 50)
      }
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setSearchQuery('')
        setSearchResults([])
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
  }, [searchOpen])

  // Run search across entire document when query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setSearchResultIdx(0)
      return
    }
    const q = searchQuery.toLowerCase()
    const matches: number[] = []
    for (let i = 0; i < words.length; i++) {
      if (words[i].toLowerCase().includes(q)) {
        matches.push(i)
      }
    }
    setSearchResults(matches)
    setSearchResultIdx(0)
  }, [searchQuery, words])

  // Jump to current search result: switch chapter + page then scroll
  useEffect(() => {
    if (searchResults.length === 0) return
    const absIdx = searchResults[searchResultIdx]

    // Find which chapter this word belongs to
    let targetChapter = 0
    for (let i = chapters.length - 1; i >= 0; i--) {
      if (absIdx >= chapters[i].startWordIndex) {
        targetChapter = i
        break
      }
    }
    const tChapterStart = chapters[targetChapter].startWordIndex
    const offsetInChapter = absIdx - tChapterStart
    const targetPage = Math.floor(offsetInChapter / WORDS_PER_PAGE)

    setSelectedChapter(targetChapter)
    setViewPage(targetPage)

    // Scroll after render
    setTimeout(() => {
      const el = wordRefs.current.get(absIdx)
      if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }, 80)
  }, [searchResults, searchResultIdx, chapters])

  // Scroll current word into view when chapter/page changes (non-search)
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

  const goToSearchResult = (delta: number) => {
    if (searchResults.length === 0) return
    setSearchResultIdx((i) => (i + delta + searchResults.length) % searchResults.length)
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
          <div className="chapter-header-right">
            <div className="chapter-stats">
              <span>{chapterWords.length} words</span>
              <span>·</span>
              <span>~{Math.round(chapterWords.length / 250)} min read</span>
            </div>
            <button
              className={`search-toggle-btn ${searchOpen ? 'active' : ''}`}
              onClick={() => {
                setSearchOpen((o) => !o)
                setSearchQuery('')
                setSearchResults([])
              }}
              title="Find word (Ctrl+F)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Find
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="search-bar">
            <div className="search-input-wrap">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={searchInputRef}
                className="search-input"
                type="text"
                placeholder="Search words across document..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') goToSearchResult(e.shiftKey ? -1 : 1)
                  if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery(''); setSearchResults([]) }
                }}
              />
              {searchQuery && (
                <span className="search-count">
                  {searchResults.length === 0
                    ? 'No results'
                    : `${searchResultIdx + 1} / ${searchResults.length}`}
                </span>
              )}
            </div>
            <div className="search-nav">
              <button className="search-nav-btn" onClick={() => goToSearchResult(-1)} disabled={searchResults.length === 0} title="Previous (Shift+Enter)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <button className="search-nav-btn" onClick={() => goToSearchResult(1)} disabled={searchResults.length === 0} title="Next (Enter)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
              <button className="search-nav-btn search-close-btn" onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]) }} title="Close (Esc)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
          </div>
        )}

        <div className="chapter-hint">
          Click any word to start reading from that point
        </div>

        <div className="word-grid-container" ref={containerRef}>
          <div className="word-grid">
            {pageWords.map((word, i) => {
              const absoluteIndex = chapterStart + pageStart + i
              const isCurrent = absoluteIndex === currentWordIndex
              const isHovered = hoveredWord === absoluteIndex
              const isSearchMatch = searchResults.includes(absoluteIndex)
              const isActiveMatch = searchResults[searchResultIdx] === absoluteIndex

              return (
                <span
                  key={absoluteIndex}
                  ref={(el) => {
                    if (el) wordRefs.current.set(absoluteIndex, el)
                    else wordRefs.current.delete(absoluteIndex)
                  }}
                  className={`word-token ${isCurrent ? 'current' : ''} ${isHovered ? 'hovered' : ''} ${isSearchMatch ? 'search-match' : ''} ${isActiveMatch ? 'search-active' : ''}`}
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
