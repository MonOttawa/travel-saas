import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { scrapeKilometricRates } from './appendixB.js';
import { scrapeDomesticAllowances } from './appendixC.js';
import { scrapeInternationalAllowances } from './appendixD.js';
import { scrapeCityRateLimits } from './cityRateLimits.js';
import { scrapeCarRentalRates } from './carRental.js';
import { scrapeExchangeRates } from './exchangeRates.js';
import { ScrapeManifestSchema } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.resolve(__dirname, '../../data/official-rates');
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'manifest.json');

const SCRAPERS = [
  {
    id: 'kilometricRates',
    output: 'kilometric-rates.json',
    runner: scrapeKilometricRates,
  },
  {
    id: 'domesticAllowances',
    output: 'domestic-allowances.json',
    runner: scrapeDomesticAllowances,
  },
  {
    id: 'internationalAllowances',
    output: 'international-allowances.json',
    runner: scrapeInternationalAllowances,
  },
  {
    id: 'cityRateLimits',
    output: 'city-rate-limits.json',
    runner: scrapeCityRateLimits,
  },
  {
    id: 'carRentalRates',
    output: 'car-rental-rates.json',
    runner: scrapeCarRentalRates,
    optional: true,
  },
  {
    id: 'exchangeRates',
    output: 'exchange-rates.json',
    runner: scrapeExchangeRates,
    optional: true,
  },
];

async function ensureOutputDir() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
}

async function writeJson(filePath, payload) {
  await fs.writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf-8');
}

function isMissingConfigError(error) {
  return /missing.*URL/i.test(error.message);
}

export async function scrapeAll({ verbose = true } = {}) {
  await ensureOutputDir();
  const manifestEntries = [];

  for (const scraper of SCRAPERS) {
    try {
      const data = await scraper.runner({});
      const validated = data; // already validated by buildTableData
      const outputPath = path.join(OUTPUT_DIR, scraper.output);
      await writeJson(outputPath, validated);
      manifestEntries.push({
        id: scraper.id,
        hash: validated.hash,
        recordCount: validated.rows.length,
        source: validated.source,
        effectiveDate: validated.metadata?.effectiveDate,
      });
      if (verbose) {
        console.log(`✔︎ ${scraper.id}: ${validated.rows.length} rows → ${scraper.output}`);
      }
    } catch (error) {
      if (scraper.optional && isMissingConfigError(error)) {
        if (verbose) {
          console.warn(`⚠︎ Skipping ${scraper.id}: ${error.message}`);
        }
        continue;
      }
      console.error(`✖︎ ${scraper.id} failed:`, error.message);
      throw error;
    }
  }

  const manifest = ScrapeManifestSchema.parse({
    generatedAt: new Date().toISOString(),
    sources: manifestEntries,
  });

  await writeJson(MANIFEST_PATH, manifest);

  if (verbose) {
    console.log(`Manifest written to ${MANIFEST_PATH}`);
  }

  return manifest;
}

if (import.meta.url === `file://${__filename}`) {
  scrapeAll().catch((error) => {
    console.error('Scrape run failed.', error);
    process.exitCode = 1;
  });
}
