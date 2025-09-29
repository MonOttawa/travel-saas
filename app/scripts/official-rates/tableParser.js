import cheerio from 'cheerio';

const toKey = (label) => {
  const cleaned = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+(.)/g, (_, chr) => chr.toUpperCase());
  return cleaned || 'column';
};

const normalizeText = (value) =>
  value
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const loadHtml = (html) => cheerio.load(html, { decodeEntities: true });

export function parseTable($, tableEl, options = {}) {
  const {
    headerRows = 1,
    headerSelector,
    filterRow,
    mapHeader,
    mapCell,
    includeEmpty = false,
  } = options;

  const rows = [];
  const headers = [];
  const $table = $(tableEl);
  const $rows = $table.find('tr');

  $rows.each((rowIndex, rowEl) => {
    const $row = $(rowEl);
    const cells = [];
    const isHeaderRow = rowIndex < headerRows;
    const cellSelector = isHeaderRow ? headerSelector || 'th,td' : 'td,th';

    $row.find(cellSelector).each((cellIndex, cellEl) => {
      const $cell = $(cellEl);
      const text = normalizeText($cell.text());
      const cellInfo = {
        text,
        colspan: Number($cell.attr('colspan') || 1),
        rowspan: Number($cell.attr('rowspan') || 1),
      };
      cells.push(cellInfo);
      if (isHeaderRow && rowIndex === headerRows - 1) {
        const headerText = mapHeader
          ? mapHeader(text, { rowIndex, cellIndex, cell: $cell })
          : text;
        const finalLabel = normalizeText(headerText);
        if (!finalLabel && !includeEmpty) {
          return;
        }
        headers.push({
          label: finalLabel,
          key: toKey(finalLabel) || `column${cellIndex}`,
        });
      }
    });

    if (isHeaderRow) {
      return;
    }

    if (filterRow && filterRow(cells, { rowIndex }) === false) {
      return;
    }

    const record = {};
    let headerIdx = 0;

    cells.forEach((cell, cellIndex) => {
      const header = headers[headerIdx];
      if (!header) {
        headerIdx += cell.colspan || 1;
        return;
      }
      const value = mapCell
        ? mapCell(cell.text, { header, cell, rowIndex, cellIndex })
        : cell.text;
      record[header.key] = value;
      headerIdx += cell.colspan || 1;
    });

    if (includeEmpty || Object.values(record).some((val) => val !== '')) {
      rows.push(record);
    }
  });

  return {
    headers,
    rows,
  };
}

export function extractTextSections($, selector) {
  return $(selector)
    .toArray()
    .map((el) => normalizeText($(el).text()))
    .filter(Boolean);
}

export function normalizeTextNode(text) {
  return normalizeText(text);
}
