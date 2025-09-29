import { fetchHtml } from './fetchHtml.js';
import { buildTableData } from './types.js';
import { loadHtml, parseTable, extractTextSections, normalizeTextNode } from './tableParser.js';

const DEFAULT_URL = 'https://www.njc-cnm.gc.ca/directive/d10/v238/s659/en';

export async function scrapeDomesticAllowances() {
  const source = process.env.OFFICIAL_RATES_MEALS_CANADA_URL || DEFAULT_URL;
  const html = await fetchHtml(source);
  const $ = loadHtml(html);

  const table = $('table').first();
  if (!table.length) {
    throw new Error('Domestic allowances table not found');
  }

  const effectiveDateText = $('strong')
    .filter((_, el) => normalizeTextNode($(el).text()).startsWith('Effective Date'))
    .first()
    .text();

  const effectiveDate = effectiveDateText
    ? normalizeTextNode(effectiveDateText).replace('Effective Date:', '').trim()
    : undefined;

  const notes = extractTextSections($, 'div[style*="border"]');

  const { headers, rows } = parseTable($, table, {
    headerRows: 2,
    mapHeader: (label, { cellIndex }) => {
      if (!label) {
        if (cellIndex === 0) {
          return 'Category';
        }
        return label;
      }
      return label
        .replace(/Canadian \$/i, 'CAD')
        .replace(/\(taxes included\)/i, '')
        .trim();
    },
    mapCell: (value) => value.replace(/^\$/, ''),
  });

  return buildTableData({
    source,
    headers,
    rows,
    metadata: {
      description: 'Domestic meal and incidental rates (Appendix C)',
      effectiveDate,
      notes: notes.length ? notes : undefined,
    },
  });
}
