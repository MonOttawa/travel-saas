import { fetchHtml } from './fetchHtml.js';
import { buildTableData } from './types.js';
import { loadHtml, parseTable, normalizeTextNode } from './tableParser.js';

const DEFAULT_URL = 'https://www.njc-cnm.gc.ca/directive/d10/v238/s658/en';

export async function scrapeKilometricRates() {
  const source = process.env.OFFICIAL_RATES_KILOMETRIC_URL || DEFAULT_URL;
  const html = await fetchHtml(source);
  const $ = loadHtml(html);

  const table = $('table').first();
  if (!table.length) {
    throw new Error('Kilometric rates table not found');
  }

  const effectiveDateText = $('strong')
    .filter((_, el) => normalizeTextNode($(el).text()).startsWith('Effective Date'))
    .first()
    .text();

  const effectiveDate = effectiveDateText
    ? normalizeTextNode(effectiveDateText).replace('Effective Date:', '').trim()
    : undefined;

  const { headers, rows } = parseTable($, table, {
    mapHeader: (label) => label.replace(/\(.*?\)/g, '').trim(),
  });

  return buildTableData({
    source,
    headers,
    rows,
    metadata: {
      description: 'Kilometric reimbursement rates (Appendix B)',
      effectiveDate,
    },
  });
}
