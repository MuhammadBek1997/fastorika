import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import * as pdfjs from 'pdfjs-dist/build/pdf.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const inputArg = process.argv[2]
const outputArg = process.argv[3]
const inputPath = inputArg || 'volet-merchant-api-v1.0-en.pdf'
const absPath = path.resolve(inputPath)

async function extractText(pdfData) {
  const loadingTask = pdfjs.getDocument({ data: pdfData })
  const doc = await loadingTask.promise
  const numPages = doc.numPages
  let fullText = ''
  for (let i = 1; i <= numPages; i++) {
    const page = await doc.getPage(i)
    const textContent = await page.getTextContent()
    const strings = textContent.items.map(it => it.str)
    fullText += strings.join(' ') + '\n\n'
  }
  return fullText
}

;(async () => {
  try {
    const dataBuffer = fs.readFileSync(absPath)
    const text = await extractText(dataBuffer)
    if (outputArg) {
      const outPath = path.resolve(outputArg)
      fs.mkdirSync(path.dirname(outPath), { recursive: true })
      fs.writeFileSync(outPath, text, 'utf8')
      console.error('Written text to:', outPath)
    } else {
      console.log(text)
    }
  } catch (err) {
    console.error('Failed to extract PDF via pdfjs:', err && err.message ? err.message : err)
    process.exit(1)
  }
})()
