import fetch from 'node-fetch';

import { buildTableData } from './types.js';

const DEFAULT_URL = 'https://www.njc-cnm.gc.ca/xe/en';

const DEFAULT_CONFIG = {
  currencies: ['USD'],
  days: 30,
};

const toDateInput = (date) => date.toISOString().slice(0, 10);

const parseJsonParams = (raw) => {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    console.warn('Unable to parse OFFICIAL_RATES_EXCHANGE_PARAMS, expected JSON object');
  }
  return {};
};

const normalizeRate = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number.parseFloat(value);
  return Number.isFinite(numeric) ? Number(numeric.toFixed(8)) : null;
};

const sortDates = (dates) => [...dates].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

async function requestRates(baseUrl, { currency, startDate, endDate }) {
  const url = new URL(baseUrl);
  url.searchParams.set('c', currency);
  url.searchParams.set('s', startDate);
  url.searchParams.set('e', endDate);
  url.searchParams.set('flush', '1');

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Exchange rate request failed: ${response.status}`);
  }

  const payload = await response.json();
  return payload;
}

async function fetchCurrencyRates(baseUrl, currency, startDate, endDate) {
  const attempts = [];
  let currentStart = startDate;
  let currentEnd = endDate;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const result = await requestRates(baseUrl, {
      currency,
      startDate: currentStart,
      endDate: currentEnd,
    });

    attempts.push({ start: currentStart, end: currentEnd, result });

    if (result.start && result.end && result.dates) {
      return { ...result, attempts };
    }

    if (result.new_dates && result.new_dates.start && result.new_dates.end) {
      currentStart = result.new_dates.start;
      currentEnd = result.new_dates.end;
      continue;
    }

    if (result.dates && Object.keys(result.dates).length > 0) {
      return { ...result, attempts };
    }

    break;
  }

  throw new Error(`No exchange rates available for ${currency} between ${startDate} and ${endDate}.`);
}

export async function scrapeExchangeRates({ params: overrideParams } = {}) {
  const baseUrl = process.env.OFFICIAL_RATES_EXCHANGE_URL || DEFAULT_URL;
  const envParams = parseJsonParams(process.env.OFFICIAL_RATES_EXCHANGE_PARAMS);
  const input = { ...DEFAULT_CONFIG, ...envParams, ...overrideParams };

  const currencies = Array.isArray(input.currencies) && input.currencies.length > 0
    ? input.currencies
    : [DEFAULT_CONFIG.currencies[0]];

  const daysBack = Number.isFinite(Number(input.days)) && Number(input.days) > 0
    ? Number(input.days)
    : DEFAULT_CONFIG.days;

  const endDate = input.endDate || toDateInput(new Date());
  const startDate = input.startDate || toDateInput(new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000));

  const rows = [];
  const notes = new Set();
  const context = {
    range: { start: startDate, end: endDate },
    currencies: {},
    attempts: {},
  };

  for (const currency of currencies) {
    const result = await fetchCurrencyRates(baseUrl, currency, startDate, endDate);

    const orderedDates = sortDates(Object.keys(result.dates || {}));
    orderedDates.forEach((date) => {
      rows.push({
        currencyCode: currency,
        currencyName: result.name || null,
        date,
        rate: normalizeRate(result.dates[date]),
        startRate: normalizeRate(result.start),
        endRate: normalizeRate(result.end),
      });
    });

    if (result.error) {
      notes.add(result.error);
    }

    if (result.new_dates) {
      context.range.adjusted = result.new_dates;
    }

    context.currencies[currency] = {
      name: result.name || null,
      startRate: normalizeRate(result.start),
      endRate: normalizeRate(result.end),
      totalDays: orderedDates.length,
    };

    context.attempts[currency] = result.attempts;
  }

  if (!rows.length) {
    throw new Error('No exchange rate data retrieved for the requested parameters.');
  }

  const headers = [
    { label: 'Currency Code', key: 'currencyCode' },
    { label: 'Currency Name', key: 'currencyName' },
    { label: 'Date', key: 'date' },
    { label: 'Rate', key: 'rate' },
    { label: 'Start Rate', key: 'startRate' },
    { label: 'End Rate', key: 'endRate' },
  ];

  const normalizedRows = rows.map((row) => {
    const normalized = {};
    headers.forEach(({ key }) => {
      normalized[key] = row[key] ?? null;
    });
    return normalized;
  });

  return buildTableData({
    source: baseUrl,
    headers,
    rows: normalizedRows,
    metadata: {
      description: `NJC exchange rates (${currencies.join(', ')})`,
      notes: notes.size ? Array.from(notes) : undefined,
      context,
    },
  });
}
