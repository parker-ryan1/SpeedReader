import './WordDisplay.css'

interface Props {
  word: string
  fontSize: number
  fontFamily: string
  lineGap: number
}

function getOptimalLetterIndex(word: string): number {
  const clean = word.replace(/[^a-zA-Z]/g, '')
  const len = clean.length
  if (len <= 1) return 0
  if (len <= 5) return 1
  if (len <= 9) return 2
  if (len <= 13) return 3
  return Math.floor(len / 4)
}

function splitWord(word: string): { before: string; pivot: string; after: string } {
  if (!word) return { before: '', pivot: '', after: '' }
  const idx = getOptimalLetterIndex(word)
  return {
    before: word.slice(0, idx),
    pivot: word[idx] ?? '',
    after: word.slice(idx + 1),
  }
}

export default function WordDisplay({ word, fontSize, fontFamily, lineGap }: Props) {
  const { before, pivot, after } = splitWord(word)
  const gapValue = `calc(50% + ${lineGap}em)`

  return (
    <div className="word-display-wrapper">
      {/* Single vertical line split by the pivot letter: top half + bottom half */}
      <div className="guide-line top" style={{ bottom: gapValue }} />
      <div className="guide-line bottom" style={{ top: gapValue }} />

      {/* The word */}
      <div
        className="word-display"
        style={{ fontSize: `${fontSize}px`, fontFamily }}
      >
        <span className="word-before">{before}</span>
        <span className="word-pivot">{pivot}</span>
        <span className="word-after">{after}</span>
      </div>
    </div>
  )
}
