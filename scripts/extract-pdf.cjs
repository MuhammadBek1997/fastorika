const fs = require('fs')
const path = require('path')
const pdfParseModule = require('pdf-parse')
const pdfParse = pdfParseModule.default || pdfParseModule

const inputArg = process.argv[2]
const outputArg = process.argv[3]
const inputPath = inputArg || 'volet-merchant-api-v1.0-en.pdf'
const absPath = path.resolve(inputPath)

;(async () => {
  try {
    const dataBuffer = fs.readFileSync(absPath)
    const data = await pdfParse(dataBuffer)
    const text = data.text || ''
    if (outputArg) {
      const outPath = path.resolve(outputArg)
      fs.mkdirSync(path.dirname(outPath), { recursive: true })
      fs.writeFileSync(outPath, text, 'utf8')
      console.error('Written text to:', outPath)
    } else {
      // Print plain text to stdout so callers can redirect to a file
      console.log(text)
    }
  } catch (err) {
    console.error('Failed to extract PDF:', err && err.message ? err.message : err)
    process.exit(1)
  }
})()
