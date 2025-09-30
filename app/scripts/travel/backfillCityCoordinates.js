#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const GEONAMES_URL = 'http://download.geonames.org/export/dump/CA.zip';
const ADMIN1_TO_PROVINCE = {
  '01': 'AB',
  '02': 'BC',
  '03': 'MB',
  '04': 'NB',
  '05': 'NL',
  '07': 'NS',
  '08': 'ON',
  '09': 'PE',
  '10': 'QC',
  '11': 'SK',
  '12': 'YT',
  '13': 'NT',
  '14': 'NU',
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '../..');
const cityDataPath = path.join(projectRoot, 'data/canadian-cities.json');

const coordinateOverrides = new Map([
  ['Toronto|ON', { lat: 43.6532, lon: -79.3832 }],
  ['Ottawa|ON', { lat: 45.4215, lon: -75.6972 }],
  ['Montreal|QC', { lat: 45.5019, lon: -73.5674 }],
  ['Vancouver|BC', { lat: 49.2827, lon: -123.1207 }],
  ['Calgary|AB', { lat: 51.0447, lon: -114.0719 }],
  ['Edmonton|AB', { lat: 53.5461, lon: -113.4938 }],
  ['Winnipeg|MB', { lat: 49.8954, lon: -97.1385 }],
  ['Halifax|NS', { lat: 44.6488, lon: -63.5752 }],
  ['St. John\'s|NL', { lat: 47.5615, lon: -52.7126 }],
  ['Whitehorse|YT', { lat: 60.7212, lon: -135.0568 }],
  ['Yellowknife|NT', { lat: 62.454, lon: -114.3718 }],
  ['Iqaluit|NU', { lat: 63.7467, lon: -68.5168 }],
  ['Deschambeault|QC', { lat: 46.64802, lon: -71.9268 }],
]);

function normalizeName(raw) {
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/gi, ' ')
    .toLowerCase()
    .trim();
}

function expandVariants(normalized) {
  const variants = new Set([normalized]);
  if (normalized.includes('saint ')) {
    variants.add(normalized.replace(/saint /g, 'st '));
    variants.add(normalized.replace(/saint /g, 'sainte '));
  }
  if (normalized.includes('sainte ')) {
    variants.add(normalized.replace(/sainte /g, 'ste '));
    variants.add(normalized.replace(/sainte /g, 'saint '));
  }
  if (normalized.includes('st ')) {
    variants.add(normalized.replace(/st /g, 'saint '));
  }
  if (normalized.includes('ste ')) {
    variants.add(normalized.replace(/ste /g, 'sainte '));
  }
  if (normalized.includes('ft ')) {
    variants.add(normalized.replace(/ft /g, 'fort '));
  }
  if (normalized.includes('fort ')) {
    variants.add(normalized.replace(/fort /g, 'ft '));
  }
  const words = normalized.split(' ');
  words.forEach((word, idx) => {
    if (word.length > 3 && /s$/.test(word)) {
      const clone = [...words];
      clone[idx] = `${word.slice(0, -1)} s`;
      variants.add(clone.join(' ').replace(/\s+/g, ' ').trim());
    }
  });
  return Array.from(variants);
}

async function downloadGeonamesZip(targetPath) {
  const response = await fetch(GEONAMES_URL);
  if (!response.ok) {
    throw new Error(`Failed to download GeoNames dataset: ${response.status} ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  fs.writeFileSync(targetPath, Buffer.from(arrayBuffer));
}

function loadGeonamesRecords(zipPath) {
  const output = execFileSync('unzip', ['-p', zipPath], {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 128,
  });
  const lines = output.split('\n');
  const index = new Map();

  for (const line of lines) {
    if (!line) continue;
    const parts = line.split('\t');
    if (parts.length < 19) continue;

    const name = parts[1];
    const asciiName = parts[2];
    const altNamesRaw = parts[3];
    const lat = Number.parseFloat(parts[4]);
    const lon = Number.parseFloat(parts[5]);
    const featureClass = parts[6];
    const featureCode = parts[7];
    const country = parts[8];
    const admin1Code = parts[10];
    const population = Number.parseInt(parts[14] || '0', 10);

    if (country !== 'CA') continue;
    if (!ADMIN1_TO_PROVINCE[admin1Code]) continue;
    if (!['P', 'A', 'L', 'T'].includes(featureClass)) continue;
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

    const province = ADMIN1_TO_PROVINCE[admin1Code];
    const candidateNames = new Set([name, asciiName]);
    if (altNamesRaw) {
      for (const alt of altNamesRaw.split(',')) {
        candidateNames.add(alt);
      }
    }

    for (const candidateName of candidateNames) {
      const normalized = normalizeName(candidateName);
      if (!normalized) continue;
      for (const variant of expandVariants(normalized)) {
        const key = `${province}|${variant}`;
        const rank = featureClass === 'P' ? 3 : featureClass === 'A' ? 2 : 1;
        const existing = index.get(key);
        if (!existing || rank > existing.rank || (rank === existing.rank && population > existing.population)) {
          index.set(key, {
            lat,
            lon,
            population,
            name,
            featureCode,
            rank,
          });
        }
      }
    }
  }

  return index;
}

async function main() {
  if (!fs.existsSync(cityDataPath)) {
    console.error(`Cannot find ${cityDataPath}. Run the city generator first.`);
    process.exit(1);
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'geonames-ca-'));
  const zipPath = path.join(tmpDir, 'CA.zip');
  await downloadGeonamesZip(zipPath);

  const index = loadGeonamesRecords(zipPath);
  const cityData = JSON.parse(fs.readFileSync(cityDataPath, 'utf8'));

  let updatedCount = 0;
  const stillMissing = [];

  for (const entry of cityData.cities) {
    const normalized = normalizeName(entry.city);
    const province = (entry.province || '').toUpperCase();
    const overrideKey = `${entry.city}|${province}`;
    if (coordinateOverrides.has(overrideKey)) {
      const override = coordinateOverrides.get(overrideKey);
      if (override && (entry.lat !== override.lat || entry.lon !== override.lon)) {
        entry.lat = override.lat;
        entry.lon = override.lon;
        updatedCount += 1;
      }
      continue;
    }
    const variants = expandVariants(normalized);

    let match = null;
    for (const variant of variants) {
      const key = `${province}|${variant}`;
      if (index.has(key)) {
        match = index.get(key);
        break;
      }
    }

    if (!match) {
      stillMissing.push(`${entry.city}, ${province}`);
      continue;
    }

    if (entry.lat !== match.lat || entry.lon !== match.lon) {
      entry.lat = match.lat;
      entry.lon = match.lon;
      updatedCount += 1;
    }
  }

  cityData.updatedAt = new Date().toISOString();
  fs.writeFileSync(cityDataPath, JSON.stringify(cityData, null, 2));

  console.log(`Updated coordinates for ${updatedCount} cities.`);
  if (stillMissing.length) {
    console.log(`Could not find coordinates for ${stillMissing.length} cities:`);
    console.log(stillMissing.join('\n'));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
