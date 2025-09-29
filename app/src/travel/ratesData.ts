import kilometricRaw from '../../data/official-rates/kilometric-rates.json';
import domesticAllowancesRaw from '../../data/official-rates/domestic-allowances.json';
import cityRateLimitsRaw from '../../data/official-rates/city-rate-limits.json';
import carRentalRaw from '../../data/official-rates/car-rental-rates.json';
import exchangeRaw from '../../data/official-rates/exchange-rates.json';

const kilometricRows = kilometricRaw?.rows ?? [];
const domesticRows = domesticAllowancesRaw?.rows ?? [];
const cityRateRows = cityRateLimitsRaw?.rows ?? [];
const carRentalRows = carRentalRaw?.rows ?? [];

const PROVINCE_ABBREVIATIONS: Record<string, string> = {
  Alberta: 'AB',
  'British Columbia': 'BC',
  Manitoba: 'MB',
  'New Brunswick': 'NB',
  'Newfoundland and Labrador': 'NL',
  'Northwest Territories': 'NT',
  'Nova Scotia': 'NS',
  Nunavut: 'NU',
  Ontario: 'ON',
  'Prince Edward Island': 'PE',
  Quebec: 'QC',
  Saskatchewan: 'SK',
  Yukon: 'YT',
};

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
] as const;

const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const parseMoney = (value?: string | number | null): number | null => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number(value);
  const numeric = Number.parseFloat(value.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(numeric) ? Number(numeric.toFixed(2)) : null;
};

// Kilometric rates ----------------------------------------------------------

export interface KilometricRateOption {
  code: string;
  label: string;
  abbreviation?: string;
  centsPerKm: number;
  formattedRate: string;
}

const kilometricRateOptionsInternal: KilometricRateOption[] = kilometricRows
  .map((row: any) => {
    const label = row.provinceTerritory as string;
    const cents = parseMoney(row.centsKm) ?? 0;
    return {
      code: slugify(label),
      label,
      abbreviation: PROVINCE_ABBREVIATIONS[label],
      centsPerKm: cents,
      formattedRate: (cents / 100).toFixed(2),
    };
  })
  .sort((a, b) => a.label.localeCompare(b.label));

const kilometricRateByCode = new Map(kilometricRateOptionsInternal.map((opt) => [opt.code, opt]));

export const kilometricRateOptions = kilometricRateOptionsInternal;
export const kilometricRatesEffectiveDate = kilometricRaw?.metadata?.effectiveDate ?? null;

export function getKilometricRate(code: string | null | undefined): KilometricRateOption {
  if (code && kilometricRateByCode.has(code)) {
    return kilometricRateByCode.get(code)!;
  }
  return (
    kilometricRateOptionsInternal[0] || {
      code: 'not-available',
      label: 'Not available',
      centsPerKm: 0,
      formattedRate: '0.00',
    }
  );
}

// Meal allowances -----------------------------------------------------------

export const mealAllowanceDatasetAvailable = domesticRows.length > 0;

const findDomesticRow = (needle: string) =>
  domesticRows.find(
    (row: any) => typeof row.category === 'string' && row.category.toLowerCase() === needle.toLowerCase(),
  ) ?? null;

const mealFull = parseMoney(findDomesticRow('Meal allowance total – 100% (up to 30th day)')?.canadaUsa) ?? 0;
const mealSeventyFive =
  parseMoney(findDomesticRow('Meal allowance total – 75% (31st to 120th day)')?.canadaUsa) ?? 0;
const mealFifty =
  parseMoney(findDomesticRow('Meal allowance total – 50% (121st day onward)')?.canadaUsa) ?? 0;
const incidentalFull = parseMoney(findDomesticRow('1.3 Incidental allowance – 100%')?.canadaUsa) ?? 0;
const incidentalReduced =
  parseMoney(findDomesticRow('Incidental allowance – 75% (31st day onward)')?.canadaUsa) ?? incidentalFull;

export interface MealAllowanceSegment {
  label: string;
  days: number;
  rate: number;
  total: number;
}

export interface MealAllowanceSummary {
  total: number;
  segments: MealAllowanceSegment[];
}

export const mealAllowanceRates = {
  full: mealFull,
  seventyFive: mealSeventyFive,
  fifty: mealFifty,
  incidentalFull,
  incidentalReduced,
  effectiveDate: domesticAllowancesRaw?.metadata?.effectiveDate ?? null,
  notes: domesticAllowancesRaw?.metadata?.notes ?? [],
};

export function calculateMealAllowance(days: number): MealAllowanceSummary {
  const safeDays = Number.isFinite(days) && days > 0 ? Math.floor(days) : 0;
  const firstSegmentDays = Math.min(safeDays, 30);
  const secondSegmentDays = Math.min(Math.max(safeDays - 30, 0), 90);
  const thirdSegmentDays = Math.max(safeDays - 120, 0);

  const segments: MealAllowanceSegment[] = [
    {
      label: 'Days 1-30',
      days: firstSegmentDays,
      rate: mealFull,
      total: firstSegmentDays * mealFull,
    },
    {
      label: 'Days 31-120',
      days: secondSegmentDays,
      rate: mealSeventyFive,
      total: secondSegmentDays * mealSeventyFive,
    },
    {
      label: 'Day 121+',
      days: thirdSegmentDays,
      rate: mealFifty,
      total: thirdSegmentDays * mealFifty,
    },
  ].filter((segment) => segment.days > 0);

  const total = segments.reduce((sum, segment) => sum + segment.total, 0);

  return { total, segments };
}

export function calculateIncidentalAllowance(days: number): MealAllowanceSummary {
  const safeDays = Number.isFinite(days) && days > 0 ? Math.floor(days) : 0;
  const firstSegmentDays = Math.min(safeDays, 30);
  const remainingDays = Math.max(safeDays - 30, 0);

  const segments: MealAllowanceSegment[] = [
    {
      label: 'Days 1-30',
      days: firstSegmentDays,
      rate: incidentalFull,
      total: firstSegmentDays * incidentalFull,
    },
    {
      label: 'Day 31+',
      days: remainingDays,
      rate: incidentalReduced,
      total: remainingDays * incidentalReduced,
    },
  ].filter((segment) => segment.days > 0);

  const total = segments.reduce((sum, segment) => sum + segment.total, 0);

  return { total, segments };
}

// City rate limits ----------------------------------------------------------

const monthKeyForDate = (date: Date) => MONTH_KEYS[date.getMonth()];
const monthLabelForDate = (date: Date) => MONTH_LABELS[date.getMonth()];

export const cityRateDatasetAvailable = cityRateRows.length > 0;

export interface CityRateResult {
  amount: number | null;
  currency: string | null;
  monthKey: string;
  monthLabel: string;
}

export function getCityRateFor(
  city: string,
  region?: string,
  date: Date = new Date(),
): CityRateResult {
  const cityLower = city.trim().toLowerCase();
  const regionUpper = region?.toUpperCase();
  const monthKey = monthKeyForDate(date);
  const monthLabel = monthLabelForDate(date);

  const match = cityRateRows.find((row: any) => {
    if (!row.city) return false;
    const matchesCity = String(row.city).trim().toLowerCase() === cityLower;
    const matchesRegion = regionUpper ? String(row.region).toUpperCase() === regionUpper : true;
    return matchesCity && matchesRegion;
  });

  const rawAmount = match ? match[monthKey] : null;
  const amount = parseMoney(rawAmount);
  const currency = match?.currency ?? null;

  return { amount, currency, monthKey, monthLabel };
}

const defaultHotelRateInfo = getCityRateFor('Ottawa', 'ON');
export const defaultHotelRate = defaultHotelRateInfo.amount ?? 175;
export const defaultHotelRateContext = {
  city: 'Ottawa',
  region: 'ON',
  month: defaultHotelRateInfo.monthLabel,
  currency: defaultHotelRateInfo.currency ?? 'CAD',
};

export const cityRateLimitsEffectiveDate = cityRateLimitsRaw?.metadata?.effectiveDate ?? null;

// Car rental reference ------------------------------------------------------

type CarRentalRow = typeof carRentalRaw.rows[number];

export const carRentalDatasetAvailable = carRentalRows.length > 0;

const carRentalGroupsMap = new Map<string, CarRentalRow[]>();
for (const row of carRentalRows) {
  if (!row || typeof row !== 'object') continue;
  const locationType = row.locationType ?? 'All Locations';
  if (!carRentalGroupsMap.has(locationType)) {
    carRentalGroupsMap.set(locationType, []);
  }
  carRentalGroupsMap.get(locationType)!.push(row);
}

const carRentalGroups = Array.from(carRentalGroupsMap.entries()).map(([locationType, rows]) => ({
  locationType,
  rows,
}));

const carRentalAverageDailyRate = (() => {
  const allRows = carRentalRows;
  if (!allRows.length) return null;
  const sum = allRows.reduce((acc: number, row: any) => acc + (row.dailyRate ?? 0), 0);
  return sum / allRows.length;
})();

export const carRentalReference = {
  fetchedAt: carRentalRaw?.fetchedAt ?? null,
  context: carRentalRaw?.metadata?.context ?? {},
  groups: carRentalGroups,
  averageDailyRate: carRentalAverageDailyRate,
};

// Exchange rate reference ---------------------------------------------------

export const exchangeRateReference = {
  fetchedAt: exchangeRaw?.fetchedAt ?? null,
  range: exchangeRaw?.metadata?.context?.range ?? null,
  currencies: exchangeRaw?.metadata?.context?.currencies ?? {},
};

export const defaultIncidentalRate = incidentalFull;
