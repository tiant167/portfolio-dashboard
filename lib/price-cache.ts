import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'price-cache.json');
const DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes

type CacheRecord = {
  price: number;
  ts: number; // timestamp when cached
};

function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    try {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    } catch (e) {
      // ignore
    }
  }
}

function readCache(): { [symbol: string]: CacheRecord } {
  try {
    if (!fs.existsSync(CACHE_FILE)) return {};
    const raw = fs.readFileSync(CACHE_FILE, 'utf8');
    return JSON.parse(raw) as { [symbol: string]: CacheRecord };
  } catch (e) {
    return {};
  }
}

function writeCache(cache: { [symbol: string]: CacheRecord }) {
  try {
    ensureCacheDir();
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache), 'utf8');
  } catch (e) {
    // ignore write errors
  }
}

export async function getCachedPrice(symbol: string, ttl = DEFAULT_TTL): Promise<number | null> {
  try {
    const cache = readCache();
    const rec = cache[symbol];
    if (!rec) return null;
    const age = Date.now() - rec.ts;
    if (age > ttl) return null;
    return rec.price;
  } catch (e) {
    return null;
  }
}

export async function setCachedPrice(symbol: string, price: number): Promise<void> {
  try {
    const cache = readCache();
    cache[symbol] = { price, ts: Date.now() };
    writeCache(cache);
  } catch (e) {
    // ignore
  }
}

export default { getCachedPrice, setCachedPrice };
