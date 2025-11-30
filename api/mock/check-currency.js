// Vercel serverless function (ESM) to mock Volet checkCurrencyExchange
// Accepts GET or POST with: from, to, action (SELL|BUY), amount

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
  BTC: 425.25, // matches doc sample for USD->BTC SELL 100 -> ~0.235158
  ETH: 225.0,
  USDT: 1.0,
}

const fxToUsd = {
  USD: 1,
  EUR: 1.08,
  UZS: 0.000079, // ~ 1 USD = 12,700 UZS
}

function getRate(from, to) {
  const F = from?.toUpperCase()
  const T = to?.toUpperCase()
  if (!F || !T) return null
  // Fiat -> Crypto: rate is USD per 1 crypto
  if (fxToUsd[F] && usdPerCrypto[T]) {
    // normalize from->USD first
    const usdAmountPerFrom = fxToUsd[F]
    return usdPerCrypto[T] / usdAmountPerFrom
  }
  // Crypto -> Fiat: rate is USD per 1 crypto, then to target fiat
  if (usdPerCrypto[F] && fxToUsd[T]) {
    const usdPerFromCrypto = usdPerCrypto[F]
    const usdToTarget = fxToUsd[T]
    return usdPerFromCrypto * usdToTarget
  }
  // Crypto -> Crypto: convert via USD
  if (usdPerCrypto[F] && usdPerCrypto[T]) {
    return usdPerCrypto[F] / usdPerCrypto[T]
  }
  // Fiat -> Fiat: convert via USD
  if (fxToUsd[F] && fxToUsd[T]) {
    return fxToUsd[T] / fxToUsd[F]
  }
  return null
}

export default async function handler(req, res) {
  const method = req.method || 'GET'
  const isPost = method === 'POST'
  const body = isPost ? await readBody(req) : {}
  const params = isPost ? body : req.query || {}

  const from = (params.from || '').toString()
  const to = (params.to || '').toString()
  const action = ((params.action || 'SELL').toString()).toUpperCase()
  const amount = parseNumber(params.amount, 0)

  if (!from || !to || !amount) {
    return json(res, 400, {
      error: 'Missing required parameters',
      required: ['from', 'to', 'action', 'amount'],
    })
  }

  const rate = getRate(from, to)
  if (!rate) {
    return json(res, 400, { error: 'Unsupported currency pair', from, to })
  }

  // Mocked conversion rule aligned with doc sample:
  // If from is fiat and to is crypto, SELL: amountExchanged = amount / rate
  // If from is crypto and to is fiat, SELL: amountExchanged = amount * rate
  // BUY acts the same in this mock to keep simple (TEST ONLY)
  const isFromFiat = Boolean(fxToUsd[from.toUpperCase()])
  const isToCrypto = Boolean(usdPerCrypto[to.toUpperCase()])
  let amountExchanged
  if (isFromFiat && isToCrypto) {
    amountExchanged = amount / rate
  } else {
    amountExchanged = amount * rate
  }

  const result = {
    from,
    to,
    action,
    amount: Number(amount.toFixed(2)),
    amountExchanged: Number(amountExchanged.toFixed(6)),
    rate: Number(rate.toFixed(2)),
    mock: true,
  }

  return json(res, 200, result)
}

