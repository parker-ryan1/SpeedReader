import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

export interface Chapter {
  title: string
  startWordIndex: number
  pageNumber: number
}

export interface ParsedPdf {
  words: string[]
  chapters: Chapter[]
  pageBreaks: number[]
}

export async function parsePdf(file: File): Promise<ParsedPdf> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  const allWords: string[] = []
  const pageBreaks: number[] = []
  const chapters: Chapter[] = []

  let outline: { title: string; dest: unknown }[] = []
  try {
    const rawOutline = await pdf.getOutline()
    if (rawOutline) {
      outline = rawOutline as typeof outline
    }
  } catch {
    // no outline
  }

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const textContent = await page.getTextContent()

    const pageText = textContent.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')

    const pageWords = pageText
      .split(/\s+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 0)

    if (pageNum > 1) {
      pageBreaks.push(allWords.length)
    }

    allWords.push(...pageWords)
  }

  // Build chapters from outline if available, resolving dest → page → word index
  if (outline.length > 0) {
    for (let i = 0; i < outline.length; i++) {
      const item = outline[i]
      let wordIndex = 0
      try {
        let dest = item.dest
        if (typeof dest === 'string') {
          dest = await pdf.getDestination(dest)
        }
        if (Array.isArray(dest) && dest[0]) {
          const pageIndex = await pdf.getPageIndex(dest[0] as Parameters<typeof pdf.getPageIndex>[0])
          // pageBreaks[n] = word index where page n+2 starts (0-based page index)
          wordIndex = pageIndex === 0 ? 0 : (pageBreaks[pageIndex - 1] ?? 0)
        }
      } catch {
        // leave wordIndex as 0
      }
      chapters.push({
        title: item.title || `Chapter ${i + 1}`,
        startWordIndex: wordIndex,
        pageNumber: i + 1,
      })
    }
  }

  // Always add a default chapter
  if (chapters.length === 0) {
    chapters.push({
      title: 'Full Document',
      startWordIndex: 0,
      pageNumber: 1,
    })
  }

  return { words: allWords, chapters, pageBreaks }
}
