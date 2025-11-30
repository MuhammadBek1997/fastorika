const fs = require('fs')
const path = require('path')
const PDFParser = require('pdf2json')

const inputArg = process.argv[2]
const outputArg = process.argv[3]
const inputPath = inputArg || 'volet-merchant-api-v1.0-en.pdf'
const absPath = path.resolve(inputPath)

function pageToText(page) {
  // pdf2json provides page.Texts[], each with R[0].T which is URI-encoded
  // We loosely group by Y (vertical) to reconstruct lines.
  const linesMap = new Map()
  for (const t of page.Texts || []) {
    const y = Math.round(t.y)
    const text = decodeURIComponent((t.R && t.R[0] && t.R[0].T) || '')
    const existing = linesMap.get(y) || []
    existing.push({ x: t.x, text })
    linesMap.set(y, existing)
  }
  const lines = Array.from(linesMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([_, parts]) => parts.sort((p1, p2) => p1.x - p2.x).map(p => p.text).join(' '))
  return lines.join('\n')
}

;(async () => {
  try {
    const pdfParser = new PDFParser()
    pdfParser.on('pdfParser_dataError', err => {
      console.error('Failed to parse PDF:', err && err.parserError ? err.parserError : err)
      process.exit(1)
    })
    pdfParser.on('pdfParser_dataReady', _pdfData => {
      try {
        // Use built-in aggregated raw text when available
        const text = pdfParser.getRawTextContent() || ''
        if (outputArg) {
          const outPath = path.resolve(outputArg)
          fs.mkdirSync(path.dirname(outPath), { recursive: true })
          fs.writeFileSync(outPath, text, 'utf8')
          console.error('Written text to:', outPath)
        } else {
          console.log(text)
        }
      } catch (e) {
        console.error('Failed to construct text:', e && e.message ? e.message : e)
        process.exit(1)
      }
    })
    pdfParser.loadPDF(absPath)
  } catch (err) {
    console.error('Unexpected error:', err && err.message ? err.message : err)
    process.exit(1)
  }
})()
