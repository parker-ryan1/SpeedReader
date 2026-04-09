import { useState, useCallback, useEffect } from 'react'
import { parsePdf, ParsedPdf } from './utils/pdfParser'
import UploadScreen from './components/UploadScreen'
import SpeedReader from './components/SpeedReader'
import ChapterView from './components/ChapterView'
import './App.css'

export type View = 'upload' | 'reader' | 'chapters'

export interface ReaderSettings {
  wpm: number
  fontSize: number
  fontFamily: string
  theme: 'dark' | 'light' | 'sepia'
  punctuationPause: number
  lineGap: number  // em units: gap on each side of the pivot letter
}

const DEFAULT_SETTINGS: ReaderSettings = {
  wpm: 300,
  fontSize: 64,
  fontFamily: 'Georgia, serif',
  theme: 'dark',
  punctuationPause: 2.0,
  lineGap: 1.1,
}

export default function App() {
  const [view, setView] = useState<View>('upload')
  const [parsedPdf, setParsedPdf] = useState<ParsedPdf | null>(null)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement
    if (settings.theme === 'light') {
      root.style.setProperty('--bg', '#f0f0ec')
      root.style.setProperty('--surface', '#e4e4de')
      root.style.setProperty('--surface2', '#d8d8d0')
      root.style.setProperty('--border', '#c8c8c0')
      root.style.setProperty('--text', '#1a1a24')
      root.style.setProperty('--text-muted', '#666677')
    } else if (settings.theme === 'sepia') {
      root.style.setProperty('--bg', '#f4ecd8')
      root.style.setProperty('--surface', '#ede0c4')
      root.style.setProperty('--surface2', '#e4d4b0')
      root.style.setProperty('--border', '#c8a97a')
      root.style.setProperty('--text', '#3d2b1f')
      root.style.setProperty('--text-muted', '#7a5c40')
    } else {
      root.style.setProperty('--bg', '#0f0f13')
      root.style.setProperty('--surface', '#1a1a24')
      root.style.setProperty('--surface2', '#22222f')
      root.style.setProperty('--border', '#2e2e3e')
      root.style.setProperty('--text', '#e8e8f0')
      root.style.setProperty('--text-muted', '#888899')
    }
  }, [settings.theme])

  const handleFileAccepted = useCallback(async (file: File) => {
    setLoading(true)
    setError(null)
    try {
      const result = await parsePdf(file)
      setParsedPdf(result)
      setCurrentWordIndex(0)
      setView('reader')
    } catch (err) {
      setError('Failed to parse PDF. Please try another file.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleJumpToWord = useCallback((index: number) => {
    setCurrentWordIndex(index)
    setView('reader')
  }, [])

  return (
    <div className="app">
      {view === 'upload' && (
        <UploadScreen
          onFileAccepted={handleFileAccepted}
          loading={loading}
          error={error}
        />
      )}
      {view === 'reader' && parsedPdf && (
        <SpeedReader
          words={parsedPdf.words}
          currentWordIndex={currentWordIndex}
          onWordIndexChange={setCurrentWordIndex}
          settings={settings}
          onSettingsChange={setSettings}
          onOpenChapters={() => setView('chapters')}
          onOpenUpload={() => setView('upload')}
        />
      )}
      {view === 'chapters' && parsedPdf && (
        <ChapterView
          words={parsedPdf.words}
          chapters={parsedPdf.chapters}
          pageBreaks={parsedPdf.pageBreaks}
          currentWordIndex={currentWordIndex}
          onJumpToWord={handleJumpToWord}
          onBack={() => setView('reader')}
        />
      )}
    </div>
  )
}
