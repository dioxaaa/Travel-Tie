import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { logger } from 'firebase-functions';

const EXCHANGE_KEY = defineSecret('EXCHANGE_KEY');

const SUPPORTED = new Set([
  'USD','EUR','GBP','JPY','AUD','CAD','CHF','CNY','HKD','NZD','SGD','KRW',
  'MXN','BRL','INR','THB','IDR','MYR','PHP','VND','TRY','ZAR','AED','SAR',
  'EGP','MAD','NOK','SEK','DKK','PLN','CZK','HUF','RON','RUB','PKR','BDT',
  'LKR','NPR','PEN','COP','CLP','ARS','CUP','JOD','ILS','OMR','FJD',
]);

const MAX_AMOUNT = 1e12;
const MIN_CACHE_MS = 10 * 60 * 1000;
const MAX_CACHE_MS = 24 * 60 * 60 * 1000;
const RATE_WINDOW_MS = 60 * 1000;
const RATE_LIMIT = 30;

// One USD-based table serves every pair, so visitors cannot drive extra upstream calls.
let ratesCache = null;
let inFlight = null;
const hits = new Map();

async function getUsdRates() {
  if (ratesCache && Date.now() < ratesCache.expires) return ratesCache.rates;
  if (!inFlight) {
    inFlight = (async () => {
      const res = await fetch(`https://v6.exchangerate-api.com/v6/${EXCHANGE_KEY.value()}/latest/USD`);
      const data = await res.json();
      if (data.result !== 'success') throw new Error(data['error-type'] || 'upstream-error');
      const nextUpdate = Number(data.time_next_update_unix) * 1000 - Date.now();
      const ttl = Math.min(MAX_CACHE_MS, Math.max(MIN_CACHE_MS, nextUpdate || 0));
      ratesCache = { rates: data.conversion_rates, expires: Date.now() + ttl };
      return ratesCache.rates;
    })().finally(() => { inFlight = null; });
  }
  return inFlight;
}

function rateLimited(ip) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW_MS) {
    hits.set(ip, { start: now, count: 1 });
    if (hits.size > 10000) {
      for (const [key, value] of hits) {
        if (now - value.start > RATE_WINDOW_MS) hits.delete(key);
      }
    }
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

export const convert = onRequest(
  { secrets: [EXCHANGE_KEY], maxInstances: 2, cors: false },
  async (req, res) => {
    res.set('Cache-Control', 'no-store');
    if (req.method !== 'GET') {
      res.status(405).json({ result: 'error', 'error-type': 'method-not-allowed' });
      return;
    }
    if (rateLimited(req.ip || 'unknown')) {
      res.status(429).json({ result: 'error', 'error-type': 'too-many-requests' });
      return;
    }

    const from = String(req.query.from || '').toUpperCase();
    const to = String(req.query.to || '').toUpperCase();
    const amount = Number(req.query.amount);
    if (!SUPPORTED.has(from) || !SUPPORTED.has(to)) {
      res.status(400).json({ result: 'error', 'error-type': 'unsupported-code' });
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_AMOUNT) {
      res.status(400).json({ result: 'error', 'error-type': 'invalid-amount' });
      return;
    }

    try {
      const rates = await getUsdRates();
      if (!rates[from] || !rates[to]) {
        res.status(400).json({ result: 'error', 'error-type': 'unsupported-code' });
        return;
      }
      const rate = rates[to] / rates[from];
      res.json({ result: 'success', conversion_rate: rate, conversion_result: amount * rate });
    } catch (e) {
      logger.error('Exchange rate lookup failed', e);
      res.status(502).json({ result: 'error', 'error-type': 'rates-unavailable' });
    }
  },
);
