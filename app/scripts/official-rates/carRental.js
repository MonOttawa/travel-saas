import fetch from 'node-fetch';
import { URLSearchParams } from 'url';

import { buildTableData } from './types.js';
import { loadHtml, parseTable, normalizeTextNode } from './tableParser.js';

const DEFAULT_URL = 'https://rehelv-acrd.tpsgc-pwgsc.gc.ca/rechercher-search-4-eng.aspx';

const DEFAULT_CONFIG = {
  country: '1', // Canada
  province: 'ON',
  city: '398', // Ottawa
  location: 'X',
  rateType: 'X',
  sort: 'R',
  carTypes: ['B'],
};

const CURRENCY_BY_COUNTRY = {
  '1': 'CAD',
  '2': 'USD',
};

const toMoney = (value) => {
  if (!value) return null;
  const numeric = Number.parseFloat(value.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(numeric) ? Number(numeric.toFixed(2)) : null;
};

const toPercent = (value) => {
  if (!value) return null;
  const numeric = Number.parseFloat(value.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(numeric) ? Number(numeric.toFixed(4)) : null;
};

const cleanLocationLabel = (value) => {
  if (!value) return null;
  return value.replace(/Locations?$/i, '').trim() || null;
};

function parseJsonParams(rawValue) {
  if (!rawValue) return {};
  try {
    const parsed = JSON.parse(rawValue);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    console.warn('Unable to parse OFFICIAL_RATES_CAR_SEARCH_PARAMS, expected JSON object');
  }
  return {};
}

function getOptionLabel($, selector, value) {
  if (!value) return null;
  const option = $(selector).find(`option[value="${value}"]`).first();
  return option.length ? normalizeTextNode(option.text()) : null;
}

async function fetchCarRates(baseUrl, searchOptions) {
  const initialResponse = await fetch(baseUrl);
  if (!initialResponse.ok) {
    throw new Error(`Failed to load car rental search page: ${initialResponse.status}`);
  }

  const cookies = initialResponse.headers.raw()['set-cookie'] || [];
  const cookieHeader = cookies.map((cookie) => cookie.split(';')[0]).join('; ');
  const initialHtml = await initialResponse.text();
  const $ = loadHtml(initialHtml);

  const hiddenFields = {};
  $('input[type="hidden"]').each((_, el) => {
    const name = $(el).attr('name');
    if (name) {
      hiddenFields[name] = $(el).attr('value') ?? '';
    }
  });

  const optionLabels = {
    country: getOptionLabel($, '#ContentMain_ddlCountry', searchOptions.country),
    province: getOptionLabel($, '#ContentMain_ddlProvince', searchOptions.province),
    city: getOptionLabel($, '#ContentMain_ddlCity', searchOptions.city),
    location: getOptionLabel($, '#ContentMain_ddlLocation', searchOptions.location),
    rateType: getOptionLabel($, '#ContentMain_ddlRateType', searchOptions.rateType),
    carType: getOptionLabel($, '#ContentMain_ddlCarType', searchOptions.carType),
  };

  const form = new URLSearchParams();
  form.append('__EVENTTARGET', '');
  form.append('__EVENTARGUMENT', '');
  form.append('__LASTFOCUS', '');

  Object.entries(hiddenFields).forEach(([key, value]) => {
    form.append(key, value ?? '');
  });

  form.append('ctl00$ContentMain$ddlCountry', searchOptions.country);
  form.append('ctl00$ContentMain$ddlProvince', searchOptions.province ?? '0');
  form.append('ctl00$ContentMain$ddlCity', searchOptions.city ?? '0');
  form.append('ctl00$ContentMain$ddlLocation', searchOptions.location ?? 'X');
  form.append('ctl00$ContentMain$ddlRateType', searchOptions.rateType ?? 'X');
  form.append('ctl00$ContentMain$ddlCarType', searchOptions.carType);
  form.append('ctl00$ContentMain$lbSort', searchOptions.sort ?? 'R');
  form.append('ctl00$ContentMain$btnSearch', 'Search');

  const postResponse = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Referer: baseUrl,
      Cookie: cookieHeader,
    },
    body: form.toString(),
  });

  if (!postResponse.ok) {
    throw new Error(`Car rental search failed with status ${postResponse.status}`);
  }

  const responseHtml = await postResponse.text();
  const $$ = loadHtml(responseHtml);
  const resultsTable = $$('table.gatherMenu').first();

  if (!resultsTable.length) {
    return { rows: [], optionLabels, notes: [] };
  }

  const { rows: rawRows } = parseTable($$, resultsTable, {
    headerRows: 1,
    mapHeader: (label) => label.replace(/\s+/g, ' ').trim(),
    mapCell: (value) => value.replace(/\u00a0/g, ' ').trim(),
  });

  const parsedRows = [];
  let currentLocationType = null;

  rawRows.forEach((row) => {
    const hasRates = [row.dailyRate, row.weeklyRate, row.monthlyRate, row.longTermRate, row.subTotal]
      .some((value) => value && value !== '');

    if (!hasRates) {
      if (row.company) {
        const label = cleanLocationLabel(row.company);
        if (label) {
          currentLocationType = label;
        }
      }
      return;
    }

    parsedRows.push({
      company: row.company,
      locationType: currentLocationType || optionLabels.location || 'All',
      carType: searchOptions.carType,
      carTypeLabel: optionLabels.carType || searchOptions.carType,
      dailyRate: toMoney(row.dailyRate),
      weeklyRate: toMoney(row.weeklyRate),
      monthlyRate: toMoney(row.monthlyRate),
      longTermRate: toMoney(row.longTermRate),
      vlf: toMoney(row.vlf),
      acrfPercent: toPercent(row.acrf),
      acsrf: toMoney(row.acsrf),
      subTotal: toMoney(row.subTotal),
      cdi: toMoney(row.cdi),
      currency: CURRENCY_BY_COUNTRY[searchOptions.country] || 'CAD',
    });
  });

  const notes = $$('p')
    .map((_, el) => normalizeTextNode($$(el).text()))
    .get()
    .filter((text) => text && /NOTE/i.test(text));

  return { rows: parsedRows, optionLabels, notes };
}

export async function scrapeCarRentalRates({ params: overrideParams } = {}) {
  const baseUrl = process.env.OFFICIAL_RATES_CAR_SEARCH_URL || DEFAULT_URL;
  const envParams = parseJsonParams(process.env.OFFICIAL_RATES_CAR_SEARCH_PARAMS);
  const input = { ...DEFAULT_CONFIG, ...envParams, ...overrideParams };

  const carTypes = Array.isArray(input.carTypes)
    ? input.carTypes
    : [input.carType ?? DEFAULT_CONFIG.carTypes[0]];

  const combinedRows = [];
  const combinedNotes = new Set();
  const context = {
    country: null,
    province: null,
    city: null,
    location: null,
    rateType: null,
    carTypes: {},
  };

  for (const carType of carTypes) {
    const searchOptions = {
      country: input.country ?? DEFAULT_CONFIG.country,
      province: input.province ?? DEFAULT_CONFIG.province,
      city: input.city ?? DEFAULT_CONFIG.city,
      location: input.location ?? DEFAULT_CONFIG.location,
      rateType: input.rateType ?? DEFAULT_CONFIG.rateType,
      sort: input.sort ?? DEFAULT_CONFIG.sort,
      carType,
    };

    const { rows, optionLabels, notes } = await fetchCarRates(baseUrl, searchOptions);

    rows.forEach((row) => combinedRows.push(row));
    notes.forEach((note) => combinedNotes.add(note));

    if (optionLabels.country) context.country = { value: searchOptions.country, label: optionLabels.country };
    if (optionLabels.province) context.province = { value: searchOptions.province, label: optionLabels.province };
    if (optionLabels.city) context.city = { value: searchOptions.city, label: optionLabels.city };
    if (optionLabels.location) context.location = { value: searchOptions.location, label: optionLabels.location };
    if (optionLabels.rateType) context.rateType = { value: searchOptions.rateType, label: optionLabels.rateType };
    context.carTypes[carType] = optionLabels.carType || carType;
  }

  if (!combinedRows.length) {
    throw new Error('No car rental rates returned for the requested parameters.');
  }

  const headers = [
    { label: 'Company', key: 'company' },
    { label: 'Location Type', key: 'locationType' },
    { label: 'Car Type', key: 'carType' },
    { label: 'Car Type Label', key: 'carTypeLabel' },
    { label: 'Daily Rate', key: 'dailyRate' },
    { label: 'Weekly Rate', key: 'weeklyRate' },
    { label: 'Monthly Rate', key: 'monthlyRate' },
    { label: 'Long Term Rate', key: 'longTermRate' },
    { label: 'Vehicle Licensing Fee', key: 'vlf' },
    { label: 'Airport Concession Fee (%)', key: 'acrfPercent' },
    { label: 'Additional Charges (ACSRF)', key: 'acsrf' },
    { label: 'Subtotal', key: 'subTotal' },
    { label: 'Collision Damage Insurance', key: 'cdi' },
    { label: 'Currency', key: 'currency' },
  ];

  const rows = combinedRows.map((row) => {
    const normalized = {};
    headers.forEach(({ key }) => {
      normalized[key] = row[key] ?? null;
    });
    return normalized;
  });

  const carTypeLabels = [...new Set(Object.values(context.carTypes))].join(', ');
  const cityLabel = context.city?.label || 'Selected city';

  return buildTableData({
    source: baseUrl,
    headers,
    rows,
    metadata: {
      description: `Government car rental rates for ${cityLabel} (${carTypeLabels})`,
      notes: combinedNotes.size ? Array.from(combinedNotes) : undefined,
      context,
    },
  });
}
