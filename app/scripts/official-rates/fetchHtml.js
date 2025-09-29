import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_CACHE_ROOT = path.resolve(__dirname, '../../.cache/official-rates');

const DEFAULT_HEADERS = {
  'User-Agent':
    'TravelSaaS-Scraper/1.0 (+https://github.com/your-org/travel-saas; contact: dev@travelsaas.local)',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

const ensureDir = async (dir) => {
  await fs.mkdir(dir, { recursive: true });
};

const cachePathFor = (cacheDir, url) => {
  const hash = createHash('sha1').update(url).digest('hex');
  return path.join(cacheDir, `${hash}.html`);
};

export async function fetchHtml(url, options = {}) {
  const {
    cache = true,
    cacheDir = DEFAULT_CACHE_ROOT,
    maxAgeMs = 1000 * 60 * 60 * 12,
    force = false,
    headers = {},
    signal,
  } = options;

  if (!url) {
    throw new Error('fetchHtml requires a URL');
  }

  let cachePath;
  if (cache) {
    await ensureDir(cacheDir);
    cachePath = cachePathFor(cacheDir, url);
    if (!force) {
      try {
        const stat = await fs.stat(cachePath);
        if (Date.now() - stat.mtimeMs <= maxAgeMs) {
          return fs.readFile(cachePath, 'utf-8');
        }
      } catch (err) {
        if (err.code !== 'ENOENT') {
          throw err;
        }
      }
    }
  }

  const response = await fetch(url, {
    headers: { ...DEFAULT_HEADERS, ...headers },
    redirect: 'follow',
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();

  if (cache && cachePath) {
    await fs.writeFile(cachePath, html, 'utf-8');
  }

  return html;
}

export async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { ...DEFAULT_HEADERS, ...options.headers, Accept: 'application/json' },
    redirect: 'follow',
    signal: options.signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
