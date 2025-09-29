#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '../..');
const sourcePath = path.join(projectRoot, 'data/official-rates/city-rate-limits.json');
const outputPath = path.join(projectRoot, 'data/canadian-cities.json');

const coordinateOverrides = new Map([
  ['Toronto|ON', { lat: 43.6532, lon: -79.3832 }],
  ['Ottawa|ON', { lat: 45.4215, lon: -75.6972 }],
  ['Montreal|QC', { lat: 45.5019, lon: -73.5674 }],
  ['Quebec|QC', { lat: 46.8139, lon: -71.208 }],
  ['Vancouver|BC', { lat: 49.2827, lon: -123.1207 }],
  ['Victoria|BC', { lat: 48.4284, lon: -123.3656 }],
  ['Calgary|AB', { lat: 51.0447, lon: -114.0719 }],
  ['Edmonton|AB', { lat: 53.5461, lon: -113.4938 }],
  ['Winnipeg|MB', { lat: 49.8954, lon: -97.1385 }],
  ['Regina|SK', { lat: 50.4452, lon: -104.6189 }],
  ['Saskatoon|SK', { lat: 52.1332, lon: -106.67 }],
  ['Halifax|NS', { lat: 44.6488, lon: -63.5752 }],
  ['Fredericton|NB', { lat: 45.9636, lon: -66.6431 }],
  ["Charlottetown|PE", { lat: 46.2382, lon: -63.1311 }],
  ["St. John's|NL", { lat: 47.5615, lon: -52.7126 }],
  ['Yellowknife|NT', { lat: 62.454, lon: -114.3718 }],
  ['Whitehorse|YT', { lat: 60.7212, lon: -135.0568 }],
  ['Iqaluit|NU', { lat: 63.7467, lon: -68.5168 }],
  ['Mississauga|ON', { lat: 43.589, lon: -79.6441 }],
  ['Brampton|ON', { lat: 43.7315, lon: -79.7624 }],
  ['Hamilton|ON', { lat: 43.2557, lon: -79.8711 }],
  ['Waterloo|ON', { lat: 43.4643, lon: -80.5204 }],
  ['Kitchener|ON', { lat: 43.4516, lon: -80.4925 }],
  ['London|ON', { lat: 42.9849, lon: -81.2453 }],
  ['Windsor|ON', { lat: 42.3149, lon: -83.0364 }],
  ['Kingston|ON', { lat: 44.2312, lon: -76.486 }],
  ['Thunder Bay|ON', { lat: 48.3809, lon: -89.2477 }],
  ['Sudbury|ON', { lat: 46.4917, lon: -80.993 }],
  ['Guelph|ON', { lat: 43.5448, lon: -80.2482 }],
  ['Barrie|ON', { lat: 44.3894, lon: -79.6903 }],
  ['Oshawa|ON', { lat: 43.8971, lon: -78.8658 }],
  ['Niagara Falls|ON', { lat: 43.0896, lon: -79.0849 }],
  ['St. Catharines|ON', { lat: 43.1594, lon: -79.2469 }],
  ['Saint John|NB', { lat: 45.2733, lon: -66.0633 }],
  ['Moncton|NB', { lat: 46.0878, lon: -64.7782 }],
  ['Trois-Rivières|QC', { lat: 46.3498, lon: -72.549 }],
  ['Sherbrooke|QC', { lat: 45.4042, lon: -71.8929 }],
  ['Laval|QC', { lat: 45.6066, lon: -73.7124 }],
  ['Longueuil|QC', { lat: 45.5312, lon: -73.5181 }],
  ['Gatineau|QC', { lat: 45.4765, lon: -75.7013 }],
  ['Saguenay|QC', { lat: 48.4281, lon: -71.0685 }],
  ['Drummondville|QC', { lat: 45.8833, lon: -72.4833 }],
  ['Rouyn-Noranda|QC', { lat: 48.2369, lon: -79.023 }],
  ['Kelowna|BC', { lat: 49.888, lon: -119.496 }],
  ['Kamloops|BC', { lat: 50.6745, lon: -120.3273 }],
  ['Prince George|BC', { lat: 53.9171, lon: -122.7497 }],
  ['Nanaimo|BC', { lat: 49.1659, lon: -123.9401 }],
  ['Abbotsford|BC', { lat: 49.05, lon: -122.3 }],
  ['Red Deer|AB', { lat: 52.2681, lon: -113.8112 }],
  ['Lethbridge|AB', { lat: 49.6956, lon: -112.8451 }],
  ['Medicine Hat|AB', { lat: 50.041, lon: -110.6775 }],
  ['Grande Prairie|AB', { lat: 55.1707, lon: -118.7947 }],
  ['Fort McMurray|AB', { lat: 56.7267, lon: -111.381 }],
  ['Brandon|MB', { lat: 49.8442, lon: -99.961 }],
  ['Thompson|MB', { lat: 55.7435, lon: -97.8558 }],
  ['Estevan|SK', { lat: 49.139, lon: -102.9868 }],
  ['Moose Jaw|SK', { lat: 50.3933, lon: -105.551 }],
  ['Prince Albert|SK', { lat: 53.2001, lon: -105.7506 }],
  ['Lloydminster|SK', { lat: 53.2775, lon: -110.0055 }],
  ['Corner Brook|NL', { lat: 48.9514, lon: -57.9484 }],
  ['Gander|NL', { lat: 48.9565, lon: -54.6089 }],
  ['Goose Bay|NL', { lat: 53.3019, lon: -60.3269 }],
  ['Summerside|PE', { lat: 46.3934, lon: -63.7902 }],
  ['Sydney|NS', { lat: 46.1368, lon: -60.1942 }],
  ['Truro|NS', { lat: 45.3643, lon: -63.2818 }],
  ['New Glasgow|NS', { lat: 45.589, lon: -62.6453 }],
  ['Dartmouth|NS', { lat: 44.6713, lon: -63.5772 }],
  ['Bathurst|NB', { lat: 47.6186, lon: -65.6504 }],
  ['Miramichi|NB', { lat: 47.03, lon: -65.5067 }],
  ['Dieppe|NB', { lat: 46.097, lon: -64.7242 }],
  ['Edmundston|NB', { lat: 47.3743, lon: -68.3256 }],
  ['Rimouski|QC', { lat: 48.4508, lon: -68.523 }],
  ['Drayton Valley|AB', { lat: 53.2202, lon: -114.9854 }],
]);

const manualAdditions = [
  { city: 'Waterloo', province: 'ON', lat: 43.4643, lon: -80.5204 },
  { city: 'Mississauga', province: 'ON', lat: 43.589, lon: -79.6441 },
  { city: 'Hamilton', province: 'ON', lat: 43.2557, lon: -79.8711 },
  { city: 'Burlington', province: 'ON', lat: 43.3255, lon: -79.7990 },
  { city: 'Oakville', province: 'ON', lat: 43.4675, lon: -79.6877 },
  { city: 'Cambridge', province: 'ON', lat: 43.3601, lon: -80.3127 },
  { city: 'Whitby', province: 'ON', lat: 43.8976, lon: -78.9429 },
  { city: 'Pickering', province: 'ON', lat: 43.8384, lon: -79.0868 },
  { city: 'Markham', province: 'ON', lat: 43.8561, lon: -79.3370 },
  { city: 'Richmond Hill', province: 'ON', lat: 43.8828, lon: -79.4403 },
  { city: 'Vaughan', province: 'ON', lat: 43.8361, lon: -79.4983 },
  { city: 'Brampton', province: 'ON', lat: 43.7315, lon: -79.7624 },
  { city: 'Ajax', province: 'ON', lat: 43.8509, lon: -79.0204 },
  { city: 'Milton', province: 'ON', lat: 43.5183, lon: -79.8774 },
  { city: 'Newmarket', province: 'ON', lat: 44.0592, lon: -79.4613 },
  { city: 'Waterloo', province: 'QC', lat: 45.35, lon: -72.5167 },
  { city: 'Kelowna', province: 'BC', lat: 49.888, lon: -119.496 },
  { city: 'Chilliwack', province: 'BC', lat: 49.1579, lon: -121.9515 },
  { city: 'Maple Ridge', province: 'BC', lat: 49.2193, lon: -122.6019 },
  { city: 'Langley', province: 'BC', lat: 49.1044, lon: -122.5827 },
  { city: 'Surrey', province: 'BC', lat: 49.1913, lon: -122.8490 },
  { city: 'Burnaby', province: 'BC', lat: 49.2488, lon: -122.9805 },
  { city: 'Coquitlam', province: 'BC', lat: 49.2827, lon: -122.7934 },
  { city: 'Delta', province: 'BC', lat: 49.0955, lon: -123.0265 },
  { city: 'North Vancouver', province: 'BC', lat: 49.3200, lon: -123.0726 },
  { city: 'Saint-Laurent', province: 'QC', lat: 45.5000, lon: -73.6658 },
  { city: 'Brossard', province: 'QC', lat: 45.4613, lon: -73.4659 },
  { city: 'Terrebonne', province: 'QC', lat: 45.7000, lon: -73.6333 },
  { city: 'Repentigny', province: 'QC', lat: 45.7420, lon: -73.4501 },
  { city: 'Levis', province: 'QC', lat: 46.8033, lon: -71.1779 },
  { city: 'Saint-Jean-sur-Richelieu', province: 'QC', lat: 45.3071, lon: -73.2626 },
  { city: 'Blainville', province: 'QC', lat: 45.6722, lon: -73.8713 },
  { city: 'Granby', province: 'QC', lat: 45.4001, lon: -72.7341 },
  { city: 'Trois-Rivières', province: 'QC', lat: 46.3498, lon: -72.5490 },
  { city: 'Saguenay', province: 'QC', lat: 48.4281, lon: -71.0685 },
  { city: 'Moncton', province: 'NB', lat: 46.0878, lon: -64.7782 },
  { city: 'Charlottetown', province: 'PE', lat: 46.2382, lon: -63.1311 },
  { city: 'Corner Brook', province: 'NL', lat: 48.9514, lon: -57.9484 },
];

const content = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const canadianRows = content.rows.filter((row) => row.category === 'Canada');
const entries = new Map();

for (const row of canadianRows) {
  const city = (row.city || '').replace(/\s+/g, ' ').trim();
  const province = (row.region || '').replace(/\s+/g, ' ').trim();
  if (!city || !province) continue;
  const key = `${city}|${province}`;
  if (entries.has(key)) continue;
  const coords = coordinateOverrides.get(key) || { lat: null, lon: null };
  entries.set(key, { city, province, lat: coords.lat, lon: coords.lon });
}

for (const addition of manualAdditions) {
  const key = `${addition.city}|${addition.province}`;
  if (entries.has(key)) continue;
  entries.set(key, addition);
}

const data = {
  updatedAt: new Date().toISOString(),
  cities: Array.from(entries.values()).sort((a, b) => a.city.localeCompare(b.city)),
};

fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
console.log(`Saved ${data.cities.length} Canadian cities to ${path.relative(projectRoot, outputPath)}`);
