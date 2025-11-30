// Vercel serverless function (ESM) to mock Volet createCryptoCurrencyInvoice
// Accepts POST with: amount, currency, coinName, sciName, orderId, note

export const config = {
  runtime: 'nodejs18.x',
}

function parseNumber(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function json(res, status, data) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('X-Volet-Mock', 'true')
  res.end(JSON.stringify(data))
}

async function readBody(req) {
  return new Promise((resolve) => {
    let raw = ''
    req.on('data', (chunk) => (raw += chunk))
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch {
        resolve({})
      }
    })
  })
}

// Static demo rates to keep responses deterministic (TEST ONLY)
const usdPerCrypto = {
  BTC: 425.25, // keep aligned with sample
  ETH: 225.0,
  USDT: 1.0,
}

const fxToUsd = {
  USD: 1,
  EUR: 1.08,
  UZS: 0.000079, // ~ 1 USD = 12,700 UZS
}

function makeAddress(coin) {
  // Simple deterministic mock address
  const base = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
  const prefix = coin.toUpperCase() === 'ETH' ? '0x' : ''
  let addr = prefix
  for (let i = 0; i < 34; i++) {
    addr += base[(i * 7) % base.length]
  }
  return addr
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method Not Allowed', allow: ['POST'] })
  }

  const body = await readBody(req)
  const amount = parseNumber(body.amount, 0)
  const currency = (body.currency || '').toString()
  const coinName = (body.coinName || '').toString()
  const sciName = (body.sciName || '').toString()
  const orderId = (body.orderId || '').toString()
  const note = (body.note || '').toString()

  if (!amount || !currency || !coinName || !sciName || !orderId) {
    return json(res, 400, {
      error: 'Missing required parameters',
      required: ['amount', 'currency', 'coinName', 'sciName', 'orderId'],
    })
  }

  const usdRate = fxToUsd[currency.toUpperCase()]
  const cryptoRateUsd = usdPerCrypto[coinName.toUpperCase()]
  if (!usdRate || !cryptoRateUsd) {
    return json(res, 400, { error: 'Unsupported currency or coin', currency, coinName })
  }

  const amountInUsd = amount * usdRate
  const cryptoAmount = amountInUsd / cryptoRateUsd

  const response = {
    address: makeAddress(coinName),
    cryptoCurrencyAmount: Number(cryptoAmount.toFixed(6)),
    coinName: coinName.toUpperCase(),
    amount: Number(amount.toFixed(2)),
    currency: currency.toUpperCase(),
    sciName,
    orderId,
    note,
    mock: true,
  }

  return json(res, 200, response)
}

