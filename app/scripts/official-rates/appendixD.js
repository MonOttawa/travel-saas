import { fetchHtml } from './fetchHtml.js';
import { buildTableData } from './types.js';
import { loadHtml, parseTable, normalizeTextNode } from './tableParser.js';

const DEFAULT_URL = 'https://www.njc-cnm.gc.ca/directive/app_d/en';

const COLUMN_NAMES = [
  'Accommodation tier',
  'City',
  'Breakfast',
  'Lunch',
  'Dinner',
  'Meal total',
  'Incidental amount',
  'Grand total',
];

function parseHeadingMetadata(rawHeading) {
  const text = normalizeTextNode(rawHeading);
  const [countryPart, currencyPart] = text.split(' - ');
  const country = countryPart?.trim() ?? text;
  let currency;
  if (currencyPart) {
    currency = currencyPart.replace(/^Currency:\s*/i, '').trim();
  }
  return { country, currency };
}

function sanitizeMoney(value) {
  return value
    .replace(/\s*CAD$/i, '')
    .replace(/\$/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function scrapeInternationalAllowances() {
  const baseUrl = process.env.OFFICIAL_RATES_MEALS_INTL_URL || DEFAULT_URL;
  const url = new URL(baseUrl);
  if (!url.searchParams.has('lang')) {
    url.searchParams.set('lang', 'en');
  }

  const initialHtml = await fetchHtml(url.toString());
  const initialDom = loadHtml(initialHtml);

  const selectedOption = initialDom('select[name="drv_id"] option[selected]');
  const effectiveDate = selectedOption.length
    ? normalizeTextNode(selectedOption.text())
    : undefined;

  const archiveOptions = initialDom('select[name="drv_id"] option')
    .toArray()
    .map((el) => normalizeTextNode(initialDom(el).text()))
    .filter(Boolean);

  const letters = Array.from(
    new Set(
      initialDom('nav .page-link')
        .toArray()
        .map((el) => normalizeTextNode(initialDom(el).text()))
        .filter((val) => /^[A-Z]$/.test(val)),
    ),
  );

  const drvId = selectedOption.attr('value') || initialDom('select[name="drv_id"] option').first().attr('value');

  const aggregatedRows = [];
  let baseHeaders = null;

  const processPage = (letter, html) => {
    const $ = loadHtml(html);

    $('.table-responsive')
      .has('table')
      .each((_, container) => {
        const $container = $(container);
        const headingEl = $container.prevAll('h3').first();
        if (!headingEl.length) {
          return;
        }
        const { country, currency } = parseHeadingMetadata(headingEl.text());
        const tableEl = $container.find('table').first();
        if (!tableEl.length) {
          return;
        }

        const { headers, rows } = parseTable($, tableEl, {
          headerRows: 2,
          mapHeader: (_label, { cellIndex }) => COLUMN_NAMES[cellIndex] || `Column ${cellIndex + 1}`,
          mapCell: (value) => sanitizeMoney(value),
        });

        if (!baseHeaders && headers.length) {
          baseHeaders = headers;
        }

        rows.forEach((row) => {
          aggregatedRows.push({
            letter,
            country,
            currency,
            ...row,
          });
        });
      });
  };

  processPage('A', initialHtml);

  for (const letter of letters.filter((ltr) => ltr !== 'A')) {
    const pageUrl = new URL(baseUrl);
    if (!pageUrl.searchParams.has('lang')) {
      pageUrl.searchParams.set('lang', 'en');
    }
    if (drvId) {
      pageUrl.searchParams.set('drv_id', drvId);
    }
    pageUrl.searchParams.set('let', letter);
    const html = await fetchHtml(pageUrl.toString());
    processPage(letter, html);
  }

  if (!baseHeaders) {
    throw new Error('No headers extracted from international allowances');
  }

  const headers = [
    { label: 'Letter', key: 'letter' },
    { label: 'Country', key: 'country' },
    { label: 'Currency', key: 'currency' },
    ...baseHeaders,
  ];

  const rows = aggregatedRows.map((row) => {
    // Ensure all keys exist for consistency
    const normalized = {};
    headers.forEach((header) => {
      normalized[header.key] = row[header.key] ?? '';
    });
    return normalized;
  });

  return buildTableData({
    source: baseUrl,
    headers,
    rows,
    metadata: {
      description: 'International meal and incidental rates (Appendix D)',
      effectiveDate,
      context: {
        archiveDates: archiveOptions,
        letters,
        drvId,
      },
    },
  });
}
