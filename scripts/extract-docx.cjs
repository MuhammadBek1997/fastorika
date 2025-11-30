const fs = require('fs')
const path = require('path')
const mammoth = require('mammoth')

const inputArg = process.argv[2]
const outputArg = process.argv[3]
const inputPath = inputArg || 'volet-merchant-api-v1.0-en.docx'
const absPath = path.resolve(inputPath)

;(async () => {
  try {
    const result = await mammoth.extractRawText({ path: absPath })
    const text = (result && result.value) ? result.value : ''
    if (outputArg) {
      const outPath = path.resolve(outputArg)
      fs.mkdirSync(path.dirname(outPath), { recursive: true })
      fs.writeFileSync(outPath, text, 'utf8')
      console.error('Written text to:', outPath)
    } else {
      console.log(text)
    }
  } catch (err) {
    console.error('Failed to extract DOCX:', err && err.message ? err.message : err)
    process.exit(1)
  }
})()

