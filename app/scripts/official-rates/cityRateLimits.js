import { fetchHtml } from './fetchHtml.js';
import { buildTableData } from './types.js';
import { loadHtml, parseTable, normalizeTextNode } from './tableParser.js';

const DEFAULT_URL = 'https://rehelv-acrd.tpsgc-pwgsc.gc.ca/lth-crl-eng.aspx';

const SECTION_CONFIG = [
  {
    id: 'CityLimitTableRepeater',
    category: 'Canada',
    regionKey: 'province',
    currency: 'CAD',
  },
  {
    id: 'USACityLimitTableRepeater',
    category: 'United States',
    regionKey: 'state',
    currency: 'USD',
  },
  {
    id: 'ForeignCityLimitTableRepeater',
    category: 'International',
    regionKey: 'country',
    currency: 'Local',
  },
];

const MONTH_KEYS = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'june',
  'july',
  'aug',
  'sept',
  'oct',
  'nov',
  'dec',
];

const toNumber = (value) => {
  const numeric = Number.parseFloat(value.replace(/[^0-9.]/g, ''));
  return Number.isFinite(numeric) ? numeric : null;
};

const extractMetaContent = ($, name) => {
  const meta = $(`meta[name="${name}"]`);
  return meta.attr('content') || meta.attr('value') || undefined;
};

const parseSectionTables = ($, sectionConfig) => {
  const container = $(`#${sectionConfig.id}`);
  if (!container.length) {
    return [];
  }

  const rows = [];

  container.find('table').each((tableIdx, tableEl) => {
    const $table = $(tableEl);
    const caption = normalizeTextNode($table.find('caption').text());
    const { headers, rows: tableRows } = parseTable($, tableEl, {
      headerRows: 1,
      mapHeader: (label) => label.replace(/\.$/, '').trim(),
      mapCell: (value) => value.replace(/\u00a0/g, ' ').trim(),
    });

    tableRows.forEach((row) => {
      const cityValue = row.city || row.city1 || '';
      const regionValue = row[sectionConfig.regionKey] || '';
      const record = {
        category: sectionConfig.category,
        letter: caption || null,
        city: cityValue,
        region: regionValue,
        currency: sectionConfig.currency,
      };

      MONTH_KEYS.forEach((monthKey) => {
        if (monthKey in row) {
          record[monthKey] = toNumber(row[monthKey]);
        }
      });

      rows.push(record);
    });
  });

  return rows;
};

export async function scrapeCityRateLimits() {
  const source = process.env.OFFICIAL_RATES_CITY_LIMITS_URL || DEFAULT_URL;
  const html = await fetchHtml(source);
  const $ = loadHtml(html);

  const allRows = SECTION_CONFIG.flatMap((section) => parseSectionTables($, section));

  if (!allRows.length) {
    throw new Error('No city rate limit rows were extracted. Verify the page structure.');
  }

  const description = normalizeTextNode($('#ContentMain_LabelResults').text()) ||
    normalizeTextNode($('#CanadianCityLimits h2').first().text()) ||
    'City rate limits';

  const modifiedDate = extractMetaContent($, 'dcterms.modified');

  const headers = [
    { label: 'Category', key: 'category' },
    { label: 'Letter', key: 'letter' },
    { label: 'City', key: 'city' },
    { label: 'Region', key: 'region' },
    { label: 'Currency', key: 'currency' },
    ...MONTH_KEYS.map((month) => ({ label: month.charAt(0).toUpperCase() + month.slice(1), key: month })),
  ];

  const sanitizedRows = allRows.map((row) => {
    const normalized = {};
    headers.forEach((header) => {
      normalized[header.key] = row[header.key] ?? null;
    });
    return normalized;
  });

  return buildTableData({
    source,
    headers,
    rows: sanitizedRows,
    metadata: {
      description,
      effectiveDate: modifiedDate,
      context: {
        sections: SECTION_CONFIG.map((section) => ({
          id: section.id,
          category: section.category,
          currency: section.currency,
        })),
      },
    },
  });
}
