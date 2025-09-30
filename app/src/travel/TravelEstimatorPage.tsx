
import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from 'wasp/client/auth';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { cn } from '../lib/utils';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { OnboardingMilestones, OnboardingStep } from './OnboardingMilestones';
import { DatePicker } from './components/DatePicker';
import { CityAutocomplete, CitySuggestion } from './components/CityAutocomplete';
import {
  kilometricRateOptions,
  getKilometricRate,
  kilometricRatesEffectiveDate,
  mealAllowanceRates,
  calculateMealAllowance,
  calculateIncidentalAllowance,
  defaultIncidentalRate,
  defaultHotelRate,
  defaultHotelRateContext,
  cityRateLimitsEffectiveDate,
  carRentalReference,
  exchangeRateReference,
  MealAllowanceSummary,
  mealAllowanceDatasetAvailable,
  cityRateDatasetAvailable,
} from './ratesData';

const DEFAULT_HOTEL_BASE_RATE = Math.round(defaultHotelRate);
const DEFAULT_HOTEL_NIGHTLY_RATE = DEFAULT_HOTEL_BASE_RATE.toString();
const DEFAULT_HOTEL_TAX_PERCENT = '13';
const DEFAULT_INCIDENTALS_DAILY_RATE = mealAllowanceDatasetAvailable ? defaultIncidentalRate.toFixed(2) : '';
const DEFAULT_REGION_CODE =
  kilometricRateOptions.find((option) => option.abbreviation === 'ON')?.code ?? kilometricRateOptions[0]?.code ?? 'ontario';
const DEFAULT_RENTAL_DAILY_RATE = carRentalReference.averageDailyRate
  ? carRentalReference.averageDailyRate.toFixed(2)
  : '85';

const ONBOARDING_STEP_INFO = [
  {
    title: 'Trip basics',
    description: 'Enter origin, destination, and travel dates to start the estimate.',
  },
  {
    title: 'Transportation & rates',
    description: 'Choose vehicle mode, mileage, and provincial rates.',
  },
  {
    title: 'Lodging & extras',
    description: 'Configure nightly rates, taxes, and additional extras.',
  },
  {
    title: 'Review & export',
    description: 'Review totals and prepare exports for stakeholders.',
  },
] as const;

type TravelMode = 'personal' | 'rental';

const INITIAL_ESTIMATE = {
  origin: '',
  destination: '',
  startDate: '',
  returnDate: '',
  distance: '',
  region: DEFAULT_REGION_CODE,
  days: '',
  includeHotel: false,
  hotelNights: '',
  hotelNightlyRate: DEFAULT_HOTEL_NIGHTLY_RATE,
  hotelTaxPercent: DEFAULT_HOTEL_TAX_PERCENT,
  includeIncidentals: false,
  incidentalsDailyRate: DEFAULT_INCIDENTALS_DAILY_RATE,
  incidentalsDays: '',
  includeOneTimeExtras: false,
  oneTimeExtrasDescription: '',
  oneTimeExtrasAmount: '',
  travelMode: 'personal' as TravelMode,
  rentalDailyRate: DEFAULT_RENTAL_DAILY_RATE,
  rentalDays: '',
};

type EstimateState = typeof INITIAL_ESTIMATE;

interface LodgingExtrasBreakdown {
  hotelSubtotal: number;
  hotelTaxes: number;
  hotelTotal: number;
  hotelNights: number;
  hotelNightlyRate: number;
  hotelTaxPercent: number;
  incidentalsDailyRate: number;
  incidentalsDays: number;
  extrasPerDiem: number;
  extrasOneTime: number;
  extrasTotal: number;
}

const computeLodgingExtras = (state: EstimateState): LodgingExtrasBreakdown => {
  const nights = Number.parseInt(state.hotelNights || '0', 10);
  const hotelNights = Number.isFinite(nights) && nights > 0 ? nights : 0;

  const nightlyRateRaw = Number.parseFloat(state.hotelNightlyRate || '0');
  const hotelNightlyRate = Number.isFinite(nightlyRateRaw) && nightlyRateRaw > 0 ? nightlyRateRaw : 0;

  const taxPercentRaw = Number.parseFloat(state.hotelTaxPercent || '0');
  const hotelTaxPercent = Number.isFinite(taxPercentRaw) && taxPercentRaw >= 0 ? taxPercentRaw : 0;

  const includeHotel = state.includeHotel && hotelNights > 0 && hotelNightlyRate > 0;
  const hotelSubtotal = includeHotel ? hotelNights * hotelNightlyRate : 0;
  const hotelTaxes = includeHotel ? hotelSubtotal * (hotelTaxPercent / 100) : 0;
  const hotelTotal = hotelSubtotal + hotelTaxes;

  const incidentalsDaysRaw = state.incidentalsDays || state.days || '0';
  const incidentalsDaysParsed = Number.parseInt(incidentalsDaysRaw || '0', 10);
  const incidentalsDays = Number.isFinite(incidentalsDaysParsed) && incidentalsDaysParsed > 0 ? incidentalsDaysParsed : 0;

  const incidentalsDailyRateRaw = Number.parseFloat(state.incidentalsDailyRate || '0');
  const incidentalsDailyRate = Number.isFinite(incidentalsDailyRateRaw) && incidentalsDailyRateRaw >= 0 ? incidentalsDailyRateRaw : 0;

  const includeIncidentals = state.includeIncidentals && incidentalsDays > 0;
  const extrasPerDiem = includeIncidentals ? incidentalsDays * incidentalsDailyRate : 0;

  const oneTimeRaw = Number.parseFloat(state.oneTimeExtrasAmount || '0');
  const extrasOneTime = state.includeOneTimeExtras && Number.isFinite(oneTimeRaw) && oneTimeRaw > 0 ? oneTimeRaw : 0;

  return {
    hotelSubtotal,
    hotelTaxes,
    hotelTotal,
    hotelNights,
    hotelNightlyRate,
    hotelTaxPercent,
    incidentalsDailyRate,
    incidentalsDays,
    extrasPerDiem,
    extrasOneTime,
    extrasTotal: extrasPerDiem + extrasOneTime,
  };
};

interface EstimateResults {
  transportation: number;
  meals: number;
  hotel: number;
  total: number;
  transportationDetail: string;
  travelMode: TravelMode;
  distance: number;
  days: number;
  includeHotel: boolean;
  hotelNights: number;
  hotelNightlyRate: number;
  hotelTaxPercent: number;
  hotelTaxes: number;
  hotelSubtotal: number;
  includeIncidentals: boolean;
  incidentalsDailyRate: number;
  incidentalsDays: number;
  extrasPerDiem: number;
  includeOneTimeExtras: boolean;
  extrasOneTime: number;
  extrasTotal: number;
  oneTimeExtrasDescription: string;
  rentalDailyRate: number;
  rentalDays: number;
  kilometricRateCents: number;
  kilometricRateLabel: string;
  kilometricRateAbbreviation?: string;
  mealBreakdown: MealAllowanceSummary;
  mealEffectiveDate?: string | null;
}

type CityWithCoordinates = CitySuggestion & { lat: number; lon: number };

function hasCityCoordinates(city: CitySuggestion | null): city is CityWithCoordinates {
  return Boolean(city && typeof city.lat === 'number' && typeof city.lon === 'number');
}

function calculateDistanceKm(origin: CityWithCoordinates, destination: CityWithCoordinates): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;

  const lat1 = toRad(origin.lat);
  const lon1 = toRad(origin.lon);
  const lat2 = toRad(destination.lat);
  const lon2 = toRad(destination.lon);

  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

const currencyFormatterCache = new Map<string, Intl.NumberFormat>();

const formatCurrency = (amount: number | null | undefined, currency = 'CAD', fractionDigits = 2) => {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return '—';
  }
  const key = `${currency}-${fractionDigits}`;
  if (!currencyFormatterCache.has(key)) {
    currencyFormatterCache.set(
      key,
      new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      }),
    );
  }
  return currencyFormatterCache.get(key)!.format(amount);
};

const formatNumber = (value: number, fractionDigits = 2) =>
  Number.isFinite(value)
    ? value.toLocaleString('en-CA', {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      })
    : '—';

const formatIsoDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('en-CA', { dateStyle: 'medium' }).format(date);
};

export default function TravelEstimatorPage() {
  const { data: user } = useAuth();
  const [estimate, setEstimate] = useState(() => ({ ...INITIAL_ESTIMATE }));

  const [results, setResults] = useState<EstimateResults | null>(null);
  const [originSuggestion, setOriginSuggestion] = useState<CitySuggestion | null>(null);
  const [destinationSuggestion, setDestinationSuggestion] = useState<CitySuggestion | null>(null);
  const [distanceManuallyEdited, setDistanceManuallyEdited] = useState(false);
  const [rentalDaysManuallyEdited, setRentalDaysManuallyEdited] = useState(false);
  const [incidentalsDaysManuallyEdited, setIncidentalsDaysManuallyEdited] = useState(false);

  const autoDistance = useMemo(() => {
    if (!hasCityCoordinates(originSuggestion) || !hasCityCoordinates(destinationSuggestion)) return null;
    return Math.round(calculateDistanceKm(originSuggestion, destinationSuggestion));
  }, [originSuggestion, destinationSuggestion]);
  const originHasCoordinates = hasCityCoordinates(originSuggestion);
  const destinationHasCoordinates = hasCityCoordinates(destinationSuggestion);
  const requiresManualDistance =
    estimate.travelMode === 'personal' &&
    ((originSuggestion && !originHasCoordinates) || (destinationSuggestion && !destinationHasCoordinates));

  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = ONBOARDING_STEP_INFO.length;

  const lodgingExtrasPreview = useMemo(() => computeLodgingExtras(estimate), [estimate]);

  const basicsValid = Boolean(estimate.origin && estimate.destination && estimate.startDate && estimate.returnDate);
  const distanceValue = parseFloat(estimate.distance || '0');
  const rentalDailyRateValue = parseFloat(estimate.rentalDailyRate || '0');
  const rentalDaysValue = parseInt(estimate.rentalDays || estimate.days || '0', 10);
  const hotelNightsValue = parseInt(estimate.hotelNights || '0', 10);
  const hotelNightlyRateValue = parseFloat(estimate.hotelNightlyRate || '0');
  const hotelTaxPercentValue = parseFloat(estimate.hotelTaxPercent || '0');
  const incidentalsDailyRateValue = parseFloat(estimate.incidentalsDailyRate || '0');
  const incidentalsDaysValue = parseInt(estimate.incidentalsDays || estimate.days || '0', 10);
  const oneTimeExtrasAmountValue = parseFloat(estimate.oneTimeExtrasAmount || '0');
  const selectedKilometricRate = useMemo(() => getKilometricRate(estimate.region), [estimate.region]);
  const tripDays = Number.isFinite(Number(estimate.days)) ? Number.parseInt(estimate.days || '0', 10) : 0;
  const mealAllowancePreview = useMemo(() => calculateMealAllowance(tripDays), [tripDays]);
  const incidentalAllowancePreview = useMemo(() => calculateIncidentalAllowance(tripDays), [tripDays]);
  const kilometricEffectiveLabel = kilometricRatesEffectiveDate ? formatIsoDate(kilometricRatesEffectiveDate) : null;
  const mealEffectiveLabel = mealAllowanceRates.effectiveDate ? formatIsoDate(mealAllowanceRates.effectiveDate) : null;
  const cityRateEffectiveLabel = cityRateLimitsEffectiveDate ? formatIsoDate(cityRateLimitsEffectiveDate) : null;
  const carRentalFetchedLabel = carRentalReference.fetchedAt
    ? formatIsoDate(carRentalReference.fetchedAt) ?? carRentalReference.fetchedAt
    : null;
  const exchangeRangeStart = exchangeRateReference.range?.start
    ? formatIsoDate(exchangeRateReference.range.start) ?? exchangeRateReference.range.start
    : null;
  const exchangeRangeEnd = exchangeRateReference.range?.end
    ? formatIsoDate(exchangeRateReference.range.end) ?? exchangeRateReference.range.end
    : null;
  const exchangeCurrenciesList = Object.keys(exchangeRateReference.currencies ?? {});
  const exchangeRateWindowLabel =
    exchangeRangeStart || exchangeRangeEnd ? `${exchangeRangeStart ?? '—'} – ${exchangeRangeEnd ?? '—'}` : null;
  const exchangeCurrenciesLabel = exchangeCurrenciesList.join(', ');
  const hasExchangeRateContext = Boolean(exchangeRateWindowLabel || exchangeCurrenciesList.length);
  const exchangeRatesSummaryText = hasExchangeRateContext
    ? [
        exchangeRateWindowLabel ? `Window ${exchangeRateWindowLabel}` : null,
        exchangeCurrenciesLabel ? `Currencies ${exchangeCurrenciesLabel}` : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : null;
  const carRentalCarTypeLabels = carRentalReference.context?.carTypes
    ? Array.from(new Set(Object.values(carRentalReference.context.carTypes as Record<string, string>)))
    : [];
  const transportationValid =
    basicsValid &&
    !!selectedKilometricRate &&
    (estimate.travelMode === 'rental'
      ? rentalDailyRateValue > 0 && rentalDaysValue > 0
      : distanceValue > 0);
  const hotelValid =
    !estimate.includeHotel ||
    (hotelNightsValue > 0 && hotelNightlyRateValue > 0 && hotelTaxPercentValue >= 0);
  const incidentalsValid =
    !estimate.includeIncidentals ||
    (incidentalsDaysValue > 0 && incidentalsDailyRateValue >= 0);
  const extrasValid = !estimate.includeOneTimeExtras || oneTimeExtrasAmountValue >= 0;
  const lodgingValid = hotelValid && incidentalsValid && extrasValid;
  const stepReady = [basicsValid, transportationValid, lodgingValid, !!results];
  const isNextDisabled = currentStep < totalSteps - 1 && !stepReady[currentStep];

  useEffect(() => {
    if (autoDistance === null) return;
    const autoString = autoDistance.toString();
    let updated = false;
    setEstimate((prev) => {
      if (distanceManuallyEdited && prev.distance && prev.distance !== autoString) {
        return prev;
      }
      if (prev.distance === autoString) {
        return prev;
      }
      updated = true;
      return { ...prev, distance: autoString };
    });
    if (updated) {
      setDistanceManuallyEdited(false);
    }
  }, [autoDistance, distanceManuallyEdited]);

  useEffect(() => {
    if (!kilometricRateOptions.length) {
      return;
    }
    if (!kilometricRateOptions.some((option) => option.code === estimate.region)) {
      setEstimate((prev) => ({ ...prev, region: kilometricRateOptions[0].code }));
    }
  }, [estimate.region]);

  useEffect(() => {
    if (!estimate.startDate || !estimate.returnDate) {
      return;
    }
    const start = new Date(estimate.startDate);
    const end = new Date(estimate.returnDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return;
    }
    const diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) {
      return;
    }
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
    const diffString = diffDays > 0 ? diffDays.toString() : '1';
    setEstimate((prev) => {
      const next = { ...prev };
      let changed = false;
      if (prev.days !== diffString) {
        next.days = diffString;
        changed = true;
      }
      if (!rentalDaysManuallyEdited && prev.rentalDays !== diffString) {
        next.rentalDays = diffString;
        changed = true;
      }
      return changed ? next : prev;
    });
  }, [estimate.startDate, estimate.returnDate, rentalDaysManuallyEdited]);

  useEffect(() => {
    if (estimate.travelMode !== 'rental') {
      return;
    }
    if (!estimate.days || rentalDaysManuallyEdited) {
      return;
    }
    setEstimate((prev) => {
      if (prev.rentalDays === prev.days) {
        return prev;
      }
      return { ...prev, rentalDays: prev.days };
    });
  }, [estimate.travelMode, estimate.days, rentalDaysManuallyEdited]);

  useEffect(() => {
    if (!estimate.includeHotel) {
      return;
    }
    if (estimate.hotelNights) {
      return;
    }
    const daysValue = Number.parseInt(estimate.days || '0', 10);
    if (!Number.isFinite(daysValue) || daysValue <= 0) {
      return;
    }
    const suggestedNights = Math.max(daysValue - 1, 1).toString();
    setEstimate((prev) => {
      if (prev.hotelNights) {
        return prev;
      }
      return { ...prev, hotelNights: suggestedNights };
    });
  }, [estimate.includeHotel, estimate.days, estimate.hotelNights]);

  useEffect(() => {
    if (!estimate.includeIncidentals || !estimate.days || incidentalsDaysManuallyEdited) {
      return;
    }
    setEstimate((prev) => {
      if (!prev.includeIncidentals || !prev.days || prev.incidentalsDays === prev.days) {
        return prev;
      }
      return { ...prev, incidentalsDays: prev.days };
    });
  }, [estimate.includeIncidentals, estimate.days, incidentalsDaysManuallyEdited]);

  const onboardingSteps = useMemo<OnboardingStep[]>(() =>
    ONBOARDING_STEP_INFO.map((step, idx) => ({
      ...step,
      status: idx < currentStep ? 'complete' : idx === currentStep ? 'current' : 'upcoming',
    })),
  [currentStep]);

  const calculateEstimate = () => {
    const distance = parseFloat(estimate.distance) || 0;
    const days = parseInt(estimate.days) || 0;
    const rentalDays = parseInt(estimate.rentalDays || estimate.days) || days;
    const rentalDailyRate = parseFloat(estimate.rentalDailyRate) || 0;
    const regionRate = getKilometricRate(estimate.region);
    const kilometricRate = regionRate.centsPerKm;

    const isRentalMode = estimate.travelMode === 'rental';

    const transportation = isRentalMode
      ? rentalDays * rentalDailyRate
      : (distance * kilometricRate) / 100;

    const transportationDetail = isRentalMode
      ? `${rentalDays || 0} day${rentalDays === 1 ? '' : 's'} × ${formatCurrency(rentalDailyRate)}/day`
      : `${Math.max(distance, 0).toFixed(0)} km × ${formatCurrency(kilometricRate / 100)}/km`;

    const mealBreakdown = calculateMealAllowance(days);
    const meals = mealBreakdown.total;
    const lodgingExtras = computeLodgingExtras(estimate);
    const hotel = lodgingExtras.hotelTotal;
    const extrasTotal = lodgingExtras.extrasTotal;

    setResults({
      transportation,
      meals,
      hotel,
      total: transportation + meals + hotel + extrasTotal,
      transportationDetail,
      travelMode: isRentalMode ? 'rental' : 'personal',
      distance: distance,
      days,
      includeHotel: estimate.includeHotel && hotel > 0,
      hotelNights: lodgingExtras.hotelNights,
      hotelNightlyRate: lodgingExtras.hotelNightlyRate,
      hotelTaxPercent: lodgingExtras.hotelTaxPercent,
      hotelTaxes: lodgingExtras.hotelTaxes,
      hotelSubtotal: lodgingExtras.hotelSubtotal,
      includeIncidentals: estimate.includeIncidentals && lodgingExtras.extrasPerDiem > 0,
      incidentalsDailyRate: lodgingExtras.incidentalsDailyRate,
      incidentalsDays: lodgingExtras.incidentalsDays,
      extrasPerDiem: lodgingExtras.extrasPerDiem,
      includeOneTimeExtras: estimate.includeOneTimeExtras && lodgingExtras.extrasOneTime > 0,
      extrasOneTime: lodgingExtras.extrasOneTime,
      extrasTotal,
      oneTimeExtrasDescription:
        estimate.includeOneTimeExtras && lodgingExtras.extrasOneTime > 0
          ? estimate.oneTimeExtrasDescription.trim() || 'One-time extras'
          : '',
      rentalDailyRate,
      rentalDays,
      kilometricRateCents: kilometricRate,
      kilometricRateLabel: regionRate.label,
      kilometricRateAbbreviation: regionRate.abbreviation,
      mealBreakdown,
      mealEffectiveDate: mealAllowanceRates.effectiveDate ?? null,
    });
  };

  const needsSubscription = user
    ? !user.subscriptionStatus && (user.credits ?? 0) === 0
    : false;

  const formatDisplayDate = (iso: string) => {
    if (!iso) return '—';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return new Intl.DateTimeFormat('en-CA', { dateStyle: 'medium' }).format(date);
  };

  const summaryRows = useMemo(() => {
    if (!results) return [] as Array<{ label: string; value: string }>;
    const rows: Array<{ label: string; value: string }> = [
      { label: 'Origin city', value: estimate.origin || '—' },
      { label: 'Destination city', value: estimate.destination || '—' },
      {
        label: 'Travel dates',
        value: `${formatDisplayDate(estimate.startDate)} → ${formatDisplayDate(estimate.returnDate)}`,
      },
      { label: 'Travel days', value: results.days.toString() },
      { label: 'Transportation mode', value: results.travelMode === 'rental' ? 'Rental car' : 'Personal vehicle' },
      { label: 'Transportation detail', value: results.transportationDetail },
      { label: 'Transportation cost', value: formatCurrency(results.transportation) },
    ];

    if (results.travelMode === 'personal') {
      const effective = kilometricEffectiveLabel ?? kilometricRatesEffectiveDate ?? null;
      const labelParts = [
        `${results.kilometricRateLabel} — ${formatCurrency(results.kilometricRateCents / 100)}/km`,
        effective ? `effective ${effective}` : null,
      ].filter(Boolean);
      rows.push({ label: 'Kilometric rate', value: labelParts.join(' · ') });
    }

    const mealBreakdownText = results.mealBreakdown.segments
      .map((segment) => `${segment.days} × ${formatCurrency(segment.rate)}`)
      .join(' + ');
    const mealEffective = results.mealEffectiveDate
      ? formatIsoDate(results.mealEffectiveDate) ?? results.mealEffectiveDate
      : mealEffectiveLabel;
    const mealValueParts = [formatCurrency(results.meals), mealBreakdownText || null, mealEffective ? `effective ${mealEffective}` : null]
      .filter(Boolean)
      .join(' · ');
    rows.push({ label: 'Meals per diem', value: mealValueParts });

    rows.push({
      label: 'Exchange rates reference',
      value: exchangeRatesSummaryText ?? 'Dataset unavailable',
    });

    if (results.includeHotel && results.hotel > 0) {
      rows.push({ label: 'Hotel nights', value: results.hotelNights.toString() });
      rows.push({ label: 'Nightly rate', value: formatCurrency(results.hotelNightlyRate) });
      if (results.hotelTaxes > 0) {
        rows.push({
          label: 'Hotel taxes & fees',
          value: `${formatCurrency(results.hotelTaxes)} (${results.hotelTaxPercent.toFixed(1)}%)`,
        });
      }
      rows.push({ label: 'Hotel total', value: formatCurrency(results.hotel) });
    }

    if (results.extrasPerDiem > 0) {
      const incidentalDaysLabel = `${results.incidentalsDays} day${results.incidentalsDays === 1 ? '' : 's'}`;
      rows.push({
        label: 'Per-diem extras',
        value: `${formatCurrency(results.extrasPerDiem)} (${incidentalDaysLabel} × ${formatCurrency(results.incidentalsDailyRate)})`,
      });
    }

    if (results.extrasOneTime > 0) {
      rows.push({
        label: results.oneTimeExtrasDescription || 'One-time extras',
        value: formatCurrency(results.extrasOneTime),
      });
    }

    if (results.extrasTotal > 0) {
      rows.push({ label: 'Extras total', value: formatCurrency(results.extrasTotal) });
    }

    if (results.travelMode === 'rental') {
      rows.push({ label: 'Rental daily rate', value: formatCurrency(results.rentalDailyRate) });
      rows.push({ label: 'Rental days', value: results.rentalDays.toString() });
    }

    rows.push({ label: 'Total estimate', value: formatCurrency(results.total) });
    return rows;
  }, [
    estimate.destination,
    estimate.origin,
    estimate.returnDate,
    estimate.startDate,
    exchangeRatesSummaryText,
    results,
  ]);

  const downloadCsv = () => {
    if (!results) return;
    const rows = [['Item', 'Value'], ...summaryRows.map((row) => [row.label, row.value])];
    const csvContent = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `travel-estimate-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openPdfPreview = () => {
    if (!results) return;
    const escapeHtml = (value: string) =>
      value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const orderedRows = (labels: string[]) =>
      labels
        .map((label) => summaryRows.find((row) => row.label === label))
        .filter((row): row is { label: string; value: string } => Boolean(row));

    const overviewLabels = [
      'Origin city',
      'Destination city',
      'Travel dates',
      'Travel days',
      'Transportation mode',
      'Kilometric rate',
      'Transportation detail',
    ];
    const costDetailLabels = [
      'Transportation cost',
      'Meals per diem',
      'Hotel nights',
      'Nightly rate',
      'Hotel taxes & fees',
      'Hotel total',
      'Per-diem extras',
      'One-time extras',
      'Extras total',
      'Rental daily rate',
      'Rental days',
      'Total estimate',
    ];

    const overviewRows = orderedRows(overviewLabels);
    const costDetailRows = orderedRows(costDetailLabels);
    const usedLabels = new Set([...overviewLabels, ...costDetailLabels]);
    const additionalRows = summaryRows.filter((row) => !usedLabels.has(row.label));

    const generatedOn = new Intl.DateTimeFormat('en-CA', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date());

    const highlightCards = [
      {
        heading: 'Transportation',
        value: formatCurrency(results.transportation),
        detail: results.transportationDetail,
      },
      {
        heading: 'Meals & incidentals',
        value: formatCurrency(results.meals),
      },
      ...(results.hotel > 0
        ? [
            {
              heading: 'Hotel',
              value: formatCurrency(results.hotel),
            },
          ]
        : []),
      ...(results.extrasTotal > 0
        ? [
            {
              heading: 'Extras',
              value: formatCurrency(results.extrasTotal),
            },
          ]
        : []),
      {
        heading: 'Total Estimate',
        value: formatCurrency(results.total),
        accent: true,
      },
    ];

    const renderDefinitionList = (rows: { label: string; value: string }[]) =>
      rows
        .map(
          (row) =>
            `<div class="meta-item"><dt>${escapeHtml(row.label)}</dt><dd>${escapeHtml(row.value)}</dd></div>`
        )
        .join('');

    const renderTableRows = (rows: { label: string; value: string }[]) =>
      rows
        .map(
          (row) =>
            `<tr><th>${escapeHtml(row.label)}</th><td>${escapeHtml(row.value)}</td></tr>`
        )
        .join('');

    const cardHtml = highlightCards
      .map(
        (card) => `
          <article class="cost-card${card.accent ? ' cost-card--accent' : ''}">
            <p class="cost-card__heading">${escapeHtml(card.heading)}</p>
            <p class="cost-card__value">${escapeHtml(card.value)}</p>
            ${card.detail ? `<p class="cost-card__detail">${escapeHtml(card.detail)}</p>` : ''}
          </article>
        `
      )
      .join('');

    const html = `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Travel Cost Estimate</title>
          <style>
            :root {
              color-scheme: light;
              font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
            }
            body {
              background: #edf1f8;
              color: #0f172a;
              margin: 0;
              padding: 40px;
            }
            .report {
              max-width: 960px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 28px;
              overflow: hidden;
              box-shadow: 0 25px 70px -35px rgba(15, 23, 42, 0.4);
            }
            header {
              padding: 32px 36px;
              background: linear-gradient(135deg, #0f172a, #1e3a8a);
              color: #f8fafc;
              display: flex;
              flex-wrap: wrap;
              align-items: baseline;
              gap: 12px;
              justify-content: space-between;
            }
            header h1 {
              margin: 0;
              font-size: 26px;
              font-weight: 600;
            }
            header span {
              font-size: 13px;
              opacity: 0.85;
            }
            section {
              padding: 32px 36px;
            }
            section + section {
              border-top: 1px solid #e2e8f0;
            }
            .section-title {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 18px;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 18px;
            }
            .meta-item dt {
              font-size: 12px;
              letter-spacing: 0.08em;
              text-transform: uppercase;
              color: #6b7280;
              margin-bottom: 6px;
            }
            .meta-item dd {
              margin: 0;
              font-size: 15px;
              font-weight: 500;
            }
            .cost-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
              gap: 16px;
            }
            .cost-card {
              border-radius: 18px;
              background: #f1f5f9;
              padding: 18px 20px;
              border: 1px solid rgba(15, 23, 42, 0.08);
              display: flex;
              flex-direction: column;
              gap: 6px;
            }
            .cost-card--accent {
              background: linear-gradient(135deg, #1d4ed8, #3b82f6);
              color: #f8fafc;
              border: none;
              box-shadow: 0 20px 35px -25px rgba(37, 99, 235, 0.7);
            }
            .cost-card__heading {
              font-size: 13px;
              letter-spacing: 0.08em;
              text-transform: uppercase;
              margin: 0;
            }
            .cost-card__value {
              font-size: 24px;
              font-weight: 600;
              margin: 0;
            }
            .cost-card__detail {
              font-size: 12px;
              margin: 0;
              opacity: 0.8;
            }
            table.detail-table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #e2e8f0;
              border-radius: 16px;
              overflow: hidden;
            }
            table.detail-table th,
            table.detail-table td {
              padding: 14px 18px;
              font-size: 13px;
            }
            table.detail-table th {
              background: #f8fafc;
              text-align: left;
              width: 32%;
              letter-spacing: 0.06em;
              text-transform: uppercase;
              font-weight: 600;
              color: #475569;
            }
            table.detail-table tr + tr th,
            table.detail-table tr + tr td {
              border-top: 1px solid #e2e8f0;
            }
            table.detail-table td {
              color: #0f172a;
              font-weight: 500;
            }
            footer {
              padding: 24px 36px 36px;
              font-size: 12px;
              color: #64748b;
            }
            @media (max-width: 768px) {
              body {
                padding: 16px;
              }
              header,
              section,
              footer {
                padding: 24px 24px;
              }
              .cost-card__value {
                font-size: 20px;
              }
            }
            @media print {
              body {
                background: #ffffff;
                padding: 16px;
              }
              .report {
                box-shadow: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="report">
            <header>
              <h1>Travel Cost Estimate</h1>
              <span>Generated ${escapeHtml(generatedOn)}</span>
            </header>
            ${overviewRows.length
              ? `<section><p class="section-title">Trip overview</p><dl class="meta-grid">${renderDefinitionList(
                  overviewRows,
                )}</dl></section>`
              : ''}
            <section>
              <p class="section-title">Cost highlights</p>
              <div class="cost-grid">${cardHtml}</div>
            </section>
            ${costDetailRows.length
              ? `<section><p class="section-title">Detailed costs</p><table class="detail-table"><tbody>${renderTableRows(
                  costDetailRows,
                )}</tbody></table></section>`
              : ''}
            ${additionalRows.length
              ? `<section><p class="section-title">Additional details</p><table class="detail-table"><tbody>${renderTableRows(
                  additionalRows,
                )}</tbody></table></section>`
              : ''}
            <footer>Verify rates against current Treasury Board directives before submission. Generated by the Travel Cost Estimator.</footer>
          </div>
          <script>window.onload = () => { window.print(); };</script>
        </body>
      </html>`;

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  const showSummaryCard = !!results && currentStep === totalSteps - 1 && !needsSubscription;

  const goNext = () => {
    if (currentStep >= totalSteps - 1 || (currentStep < totalSteps - 1 && isNextDisabled)) {
      return;
    }
    if (currentStep === totalSteps - 2) {
      calculateEstimate();
    }
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  };

  const goBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const resetWizard = () => {
    setEstimate({ ...INITIAL_ESTIMATE });
    setOriginSuggestion(null);
    setDestinationSuggestion(null);
    setDistanceManuallyEdited(false);
    setRentalDaysManuallyEdited(false);
    setIncidentalsDaysManuallyEdited(false);
    setResults(null);
    setCurrentStep(0);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <CityAutocomplete
                id='origin'
                label='Origin city'
                value={estimate.origin}
                onChange={(val) => setEstimate((prev) => ({ ...prev, origin: val }))}
                placeholder='Start typing: Toronto, Ottawa, …'
                onSelectSuggestion={(suggestion) => {
                  setOriginSuggestion(suggestion ?? null);
                  if (suggestion) {
                    setDistanceManuallyEdited(false);
                  }
                }}
              />
              <CityAutocomplete
                id='destination'
                label='Destination city'
                value={estimate.destination}
                onChange={(val) => setEstimate((prev) => ({ ...prev, destination: val }))}
                placeholder='Start typing: Ottawa, Calgary, …'
                onSelectSuggestion={(suggestion) => {
                  setDestinationSuggestion(suggestion ?? null);
                  if (suggestion) {
                    setDistanceManuallyEdited(false);
                  }
                }}
              />
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <DatePicker
                id='start-date'
                label='Start date'
                value={estimate.startDate}
                onChange={(val) => setEstimate((prev) => ({ ...prev, startDate: val }))}
                max={estimate.returnDate || undefined}
              />
              <DatePicker
                id='return-date'
                label='Return date'
                value={estimate.returnDate}
                onChange={(val) => setEstimate((prev) => ({ ...prev, returnDate: val }))}
                min={estimate.startDate || undefined}
              />
            </div>
          </>
        );
      case 1:
        return (
          <>
            <div className='space-y-3'>
              <Label>Transportation mode</Label>
              <div className='grid gap-3 sm:grid-cols-2'>
                {[
                  {
                    id: 'personal' as TravelMode,
                    title: 'Use personal vehicle',
                    description: 'Apply NJC kilometric allowances for mileage reimbursement.',
                  },
                  {
                    id: 'rental' as TravelMode,
                    title: 'Rent a car',
                    description: 'Estimate with daily rental rate and optional extras.',
                  },
                ].map((mode) => {
                  const isActive = estimate.travelMode === mode.id;
                  return (
                    <button
                      type='button'
                      key={mode.id}
                      onClick={() => {
                        setEstimate((prev) => {
                          const next = { ...prev, travelMode: mode.id };
                          if (mode.id === 'rental' && !prev.rentalDays && prev.days) {
                            next.rentalDays = prev.days;
                          }
                          if (mode.id === 'personal') {
                            next.rentalDays = '';
                          }
                          return next;
                        });
                        setDistanceManuallyEdited(false);
                        setRentalDaysManuallyEdited(false);
                      }}
                      className={cn(
                        'flex flex-col items-start rounded-xl border px-4 py-3 text-left transition-colors duration-200',
                        isActive
                          ? 'border-primary bg-primary/5 text-foreground shadow-sm'
                          : 'border-border hover:border-primary/60 hover:bg-muted/40'
                      )}
                    >
                      <span className='text-sm font-semibold'>{mode.title}</span>
                      <span className='mt-1 text-xs leading-5 text-muted-foreground'>{mode.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='distance'>Total distance (km)</Label>
                <Input
                  id='distance'
                  type='number'
                  placeholder={autoDistance !== null ? `${autoDistance}` : 'e.g., 450'}
                  value={estimate.distance}
                  onChange={(e) => {
                    setDistanceManuallyEdited(true);
                    setEstimate({ ...estimate, distance: e.target.value });
                  }}
                  disabled={estimate.travelMode === 'rental'}
                />
                {estimate.travelMode === 'personal' && autoDistance !== null && !distanceManuallyEdited && (
                  <p className='text-xs text-muted-foreground'>Suggested automatically based on selected cities.</p>
                )}
                {requiresManualDistance && (
                  <p className='text-xs text-muted-foreground text-amber-600 dark:text-amber-400'>
                    Enter the total kilometres manually — we do not yet have coordinate data for one of the selected cities.
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <Label htmlFor='days'>Number of travel days</Label>
                <Input
                  id='days'
                  type='number'
                  min='1'
                  placeholder='e.g., 3'
                  value={estimate.days}
                  onChange={(e) => setEstimate({ ...estimate, days: e.target.value })}
                />
              </div>
            </div>
            <div className='rounded-md border border-dashed border-border/60 bg-muted/40 px-3 py-2 text-xs text-muted-foreground space-y-1'>
              <div className='font-semibold text-foreground text-sm'>Meal allowance reference</div>
              <p>
                Days 1-30: {formatCurrency(mealAllowanceRates.full)} · Days 31-120: {formatCurrency(mealAllowanceRates.seventyFive)} · Day 121+: {formatCurrency(mealAllowanceRates.fifty)}
                {mealEffectiveLabel ? ` · effective ${mealEffectiveLabel}` : ''}
              </p>
              <p>
                Incidental: {formatCurrency(mealAllowanceRates.incidentalFull)} (Day 31+: {formatCurrency(mealAllowanceRates.incidentalReduced)})
              </p>
              {mealAllowancePreview.total > 0 && (
                <p className='text-foreground'>
                  Current trip meals estimate: {formatCurrency(mealAllowancePreview.total)}
                  {mealAllowancePreview.segments.length
                    ? ` (${mealAllowancePreview.segments
                        .map((segment) => `${segment.days} × ${formatCurrency(segment.rate)}`)
                        .join(' + ')})`
                    : ''}
                </p>
              )}
            </div>
            {estimate.travelMode === 'rental' && (
              <>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='rental-daily-rate'>Rental daily rate ($)</Label>
                      <Input
                        id='rental-daily-rate'
                      type='number'
                      min='0'
                      step='0.01'
                      value={estimate.rentalDailyRate}
                      onChange={(e) => setEstimate({ ...estimate, rentalDailyRate: e.target.value })}
                    />
                    {carRentalReference.averageDailyRate && (
                      <p className='text-xs text-muted-foreground'>
                        Reference average: {formatCurrency(carRentalReference.averageDailyRate)} per day
                        {carRentalCarTypeLabels.length ? ` (${carRentalCarTypeLabels.join(', ')})` : ''}
                      </p>
                    )}
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='rental-days'>Number of rental days</Label>
                    <Input
                      id='rental-days'
                      type='number'
                      min='1'
                      value={estimate.rentalDays || estimate.days}
                      placeholder={estimate.days || 'e.g., 3'}
                      onChange={(e) => {
                        setRentalDaysManuallyEdited(true);
                        setEstimate({ ...estimate, rentalDays: e.target.value });
                      }}
                    />
                    {!rentalDaysManuallyEdited && estimate.days && (
                      <p className='text-xs text-muted-foreground'>Defaults to the number of travel days.</p>
                    )}
                  </div>
                </div>
                    {carRentalReference.groups.length > 0 && (
                  <div className='rounded-md border border-dashed border-border/60 bg-muted/40 px-3 py-2 text-xs text-muted-foreground space-y-2'>
                    <div className='flex flex-wrap items-center justify-between gap-2 text-foreground'>
                      <span className='font-semibold text-sm'>Scraped rental rates</span>
                      {carRentalFetchedLabel && <span>as of {carRentalFetchedLabel}</span>}
                    </div>
                    {carRentalReference.context?.city?.label && (
                      <p className='text-muted-foreground'>
                        Context: {carRentalReference.context.city.label}
                        {carRentalReference.context?.carTypes
                          ? ` · ${Object.values(carRentalReference.context.carTypes).join(', ')}`
                          : ''}
                      </p>
                    )}
                    {carRentalReference.groups.map((group) => (
                      <div key={group.locationType}>
                        <div className='font-medium text-foreground'>{group.locationType}</div>
                        <div className='grid grid-cols-1 gap-1 sm:grid-cols-2'>
                          {group.rows.slice(0, 3).map((row, idx) => (
                            <div key={`${group.locationType}-${row.company}-${idx}`} className='flex justify-between gap-4'>
                              <span>{row.company}</span>
                              <span>{formatCurrency(row.dailyRate, row.currency ?? 'CAD')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <p>Use these figures as a reference point when budgeting rental vehicles.</p>
                  </div>
                )}
              </>
            )}
            <div className='space-y-2'>
              <Label htmlFor='region'>Region</Label>
              <Select value={estimate.region} onValueChange={(value) => setEstimate({ ...estimate, region: value })}>
                <SelectTrigger id='region'>
                  <SelectValue placeholder='Select a region' />
                </SelectTrigger>
                <SelectContent>
                  {kilometricRateOptions.map((option) => (
                    <SelectItem key={option.code} value={option.code}>
                      {option.label}
                      {option.abbreviation ? ` (${option.abbreviation})` : ''}
                      {` (${formatNumber(option.centsPerKm, 1)}¢/km)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedKilometricRate && (
                <p className='text-xs text-muted-foreground'>
                  {selectedKilometricRate.label}
                  {selectedKilometricRate.abbreviation ? ` (${selectedKilometricRate.abbreviation})` : ''}
                  {' · '}
                  {formatCurrency(selectedKilometricRate.centsPerKm / 100)}
                  {' per km'}
                  {kilometricEffectiveLabel ? ` · effective ${kilometricEffectiveLabel}` : ''}
                </p>
              )}
            </div>
          </>
        );
      case 2:
        return (
          <div className='space-y-6'>
            <div className='space-y-3'>
              <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-center space-x-2'>
                  <Switch
                    id='include-hotel'
                    checked={estimate.includeHotel}
                    onCheckedChange={(checked) =>
                      setEstimate((prev) => {
                        const next = { ...prev, includeHotel: checked };
                        if (checked) {
                          if (!prev.hotelNightlyRate) {
                            next.hotelNightlyRate = DEFAULT_HOTEL_NIGHTLY_RATE;
                          }
                          if (!prev.hotelTaxPercent) {
                            next.hotelTaxPercent = DEFAULT_HOTEL_TAX_PERCENT;
                          }
                          if (!prev.hotelNights && prev.days) {
                            const daysValue = Number.parseInt(prev.days, 10);
                            if (!Number.isNaN(daysValue) && daysValue > 0) {
                              next.hotelNights = Math.max(daysValue - 1, 1).toString();
                            }
                          }
                        } else {
                          next.hotelNights = '';
                        }
                        return next;
                      })
                    }
                  />
                  <Label htmlFor='include-hotel'>Include hotel accommodation</Label>
                </div>
                <p className='text-xs text-muted-foreground sm:max-w-xs'>Plan nightly stays, taxes, and per diem extras in one place.</p>
              </div>
              {estimate.includeHotel && (
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
                  <div className='space-y-2'>
                    <Label htmlFor='hotel-nights'>Number of nights</Label>
                    <Input
                      id='hotel-nights'
                      type='number'
                      min='1'
                      placeholder='e.g., 2'
                      value={estimate.hotelNights}
                      onChange={(e) => setEstimate({ ...estimate, hotelNights: e.target.value })}
                    />
                    <p className='text-xs text-muted-foreground'>Defaults to the number of trip nights.</p>
                  </div>
                  <div className='space-y-2'>
                  <Label htmlFor='hotel-nightly-rate'>Nightly rate ($)</Label>
                  <Input
                    id='hotel-nightly-rate'
                    type='number'
                    min='0'
                    step='0.01'
                    value={estimate.hotelNightlyRate}
                    onChange={(e) => setEstimate({ ...estimate, hotelNightlyRate: e.target.value })}
                  />
                  <p className='text-xs text-muted-foreground'>
                    {cityRateDatasetAvailable && defaultHotelRateContext
                      ? `Default uses ${defaultHotelRateContext.city}, ${defaultHotelRateContext.region} city limit for ${defaultHotelRateContext.month} (${formatCurrency(
                          defaultHotelRate,
                          defaultHotelRateContext.currency ?? 'CAD',
                        )})${cityRateEffectiveLabel ? ` · updated ${cityRateEffectiveLabel}` : ''}`
                      : `City rate limits unavailable — default nightly rate set to ${formatCurrency(
                          defaultHotelRate,
                        )}. Refresh the scraped dataset for official guidance.`}
                  </p>
                </div>
                  <div className='space-y-2'>
                    <Label htmlFor='hotel-tax-percent'>Estimated taxes & fees (%)</Label>
                    <Input
                      id='hotel-tax-percent'
                      type='number'
                      min='0'
                      step='0.1'
                      value={estimate.hotelTaxPercent}
                      onChange={(e) => setEstimate({ ...estimate, hotelTaxPercent: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className='space-y-3'>
              <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-center space-x-2'>
                  <Switch
                    id='include-incidentals'
                    checked={estimate.includeIncidentals}
                    onCheckedChange={(checked) => {
                      setEstimate((prev) => {
                        const next = { ...prev, includeIncidentals: checked };
                        if (checked) {
                          if (!prev.incidentalsDailyRate) {
                            next.incidentalsDailyRate = mealAllowanceDatasetAvailable
                              ? DEFAULT_INCIDENTALS_DAILY_RATE
                              : '';
                          }
                          if (!prev.incidentalsDays && prev.days) {
                            next.incidentalsDays = prev.days;
                          }
                        } else {
                          next.incidentalsDays = '';
                        }
                        return next;
                      });
                      setIncidentalsDaysManuallyEdited(false);
                    }}
                  />
                  <Label htmlFor='include-incidentals'>Track daily incidentals</Label>
                </div>
                <p className='text-xs text-muted-foreground sm:max-w-xs'>Add per-diem extras like parking, tips, or shared meals.</p>
              </div>
              {estimate.includeIncidentals && (
                <>
                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                    <div className='space-y-2'>
                      <Label htmlFor='incidentals-rate'>Daily amount ($)</Label>
                      <Input
                        id='incidentals-rate'
                        type='number'
                        min='0'
                        step='0.01'
                        value={estimate.incidentalsDailyRate}
                        onChange={(e) => setEstimate({ ...estimate, incidentalsDailyRate: e.target.value })}
                      />
                      <p className='text-xs text-muted-foreground'>
                        {mealAllowanceDatasetAvailable
                          ? `Reference: ${formatCurrency(mealAllowanceRates.incidentalFull)} (Days 1-30) · ${formatCurrency(
                              mealAllowanceRates.incidentalReduced,
                            )} (Day 31+)`
                          : 'Official incidental allowances unavailable — enter your policy amount manually.'}
                      </p>
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='incidentals-days'>Number of eligible days</Label>
                      <Input
                        id='incidentals-days'
                        type='number'
                        min='1'
                        value={estimate.incidentalsDays}
                        onChange={(e) => {
                          setIncidentalsDaysManuallyEdited(true);
                          setEstimate({ ...estimate, incidentalsDays: e.target.value });
                        }}
                      />
                      <p className='text-xs text-muted-foreground'>Defaults to your travel days when left blank.</p>
                    </div>
                  </div>
                  {incidentalAllowancePreview.total > 0 && (
                    <p className='text-xs text-muted-foreground'>Projected incidental total: {formatCurrency(incidentalAllowancePreview.total)}</p>
                  )}
                </>
              )}
            </div>

            <div className='space-y-3'>
              <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-center space-x-2'>
                  <Switch
                    id='include-one-time-extras'
                    checked={estimate.includeOneTimeExtras}
                    onCheckedChange={(checked) =>
                      setEstimate((prev) => ({
                        ...prev,
                        includeOneTimeExtras: checked,
                      }))
                    }
                  />
                  <Label htmlFor='include-one-time-extras'>One-time extras</Label>
                </div>
                <p className='text-xs text-muted-foreground sm:max-w-xs'>Capture flat fees such as conference passes or rental equipment.</p>
              </div>
              {estimate.includeOneTimeExtras && (
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='extras-description'>Description (optional)</Label>
                    <Input
                      id='extras-description'
                      value={estimate.oneTimeExtrasDescription}
                      placeholder='e.g., Conference access pass'
                      onChange={(e) => setEstimate({ ...estimate, oneTimeExtrasDescription: e.target.value })}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='extras-amount'>Amount ($)</Label>
                    <Input
                      id='extras-amount'
                      type='number'
                      min='0'
                      step='0.01'
                      value={estimate.oneTimeExtrasAmount}
                      onChange={(e) => setEstimate({ ...estimate, oneTimeExtrasAmount: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className='space-y-2 rounded-lg border border-dashed border-border/70 bg-muted/40 px-4 py-3 text-sm'>
              <div className='flex justify-between'>
                <span>Hotel total (incl. taxes)</span>
                <span className='font-semibold'>{formatCurrency(lodgingExtrasPreview.hotelTotal)}</span>
              </div>
              <div className='flex justify-between'>
                <span>Per-diem extras</span>
                <span className='font-semibold'>{formatCurrency(lodgingExtrasPreview.extrasPerDiem)}</span>
              </div>
              <div className='flex justify-between'>
                <span>One-time extras</span>
                <span className='font-semibold'>{formatCurrency(lodgingExtrasPreview.extrasOneTime)}</span>
              </div>
              <div className='mt-1 flex justify-between border-t border-border/50 pt-2 text-base font-semibold'>
                <span>Lodging & extras subtotal</span>
                <span>{formatCurrency(lodgingExtrasPreview.hotelTotal + lodgingExtrasPreview.extrasTotal)}</span>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className='space-y-3'>
            <p className='text-sm text-muted-foreground'>Review the estimate summary on the right. Use Back to make adjustments or recalculate to refresh totals.</p>
            <div className='rounded-lg border border-border/60 bg-muted/40 px-4 py-3 text-xs text-muted-foreground leading-5'>
              Transportation, meal, and lodging amounts update each time you recalculate.
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className='container mx-auto px-4 py-8 max-w-5xl'>
      <div className='text-center mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2'>Travel Cost Estimator</h1>
        <p className='text-gray-600 dark:text-gray-400'>
          Calculate your travel expenses using official Canadian government rates
        </p>
      </div>

      <div className='mb-10'>
        <OnboardingMilestones steps={onboardingSteps} />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
        <div className='md:col-span-2'>
          <Card>
            <CardHeader>
              <CardTitle>Quick Estimate Calculator</CardTitle>
              <CardDescription>Get an instant estimate for your business travel costs</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>{renderStepContent()}</CardContent>
            <CardFooter className='flex flex-wrap items-center justify-between gap-3'>
              <Button variant='outline' onClick={goBack} disabled={currentStep === 0}>
                Back
              </Button>
              {currentStep < totalSteps - 1 ? (
                <Button onClick={goNext} disabled={isNextDisabled}>
                  Next step
                </Button>
              ) : (
                <div className='flex flex-wrap justify-end gap-3'>
                  <Button variant='outline' onClick={resetWizard}>
                    Start over
                  </Button>
                  <Button onClick={calculateEstimate}>Recalculate estimate</Button>
                </div>
              )}
            </CardFooter>
          </Card>
        </div>

        <div className='space-y-6'>
          {user && (
            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
              </CardHeader>
              <CardContent>
                {user.subscriptionStatus ? (
                  <Badge variant='success'>Pro Subscriber</Badge>
                ) : (
                  <div className='text-sm'>
                    <span className='font-semibold'>{user.credits || 0}</span> free estimates remaining.
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {showSummaryCard ? (
            <Card>
              <CardHeader>
                <CardTitle>Estimate Summary</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-gray-600 dark:text-gray-400'>
                    {results!.travelMode === 'rental' ? 'Car rental:' : 'Kilometric allowance:'}
                  </span>
                  <span className='font-semibold'>{formatCurrency(results!.transportation)}</span>
                </div>
                <p className='text-xs text-muted-foreground'>{results!.transportationDetail}</p>
                <div className='flex justify-between'>
                  <span className='text-gray-600 dark:text-gray-400'>Meals (per diem):</span>
                  <span className='font-semibold'>{formatCurrency(results!.meals)}</span>
                </div>
                <p className='text-xs text-muted-foreground'>
                  {results!.mealBreakdown.segments
                    .map((segment) => `${segment.days} × ${formatCurrency(segment.rate)}`)
                    .join(' + ')}
                  {results!.mealEffectiveDate ? ` · effective ${formatIsoDate(results!.mealEffectiveDate)}` : ''}
                </p>
                {results!.hotel > 0 && (
                  <div className='flex justify-between'>
                    <span className='text-gray-600 dark:text-gray-400'>Hotel:</span>
                    <span className='font-semibold'>{formatCurrency(results!.hotel)}</span>
                  </div>
                )}
                {results!.extrasPerDiem > 0 && (
                  <div className='flex justify-between'>
                    <span className='text-gray-600 dark:text-gray-400'>Per-diem extras:</span>
                    <span className='font-semibold'>{formatCurrency(results!.extrasPerDiem)}</span>
                  </div>
                )}
                {results!.extrasOneTime > 0 && (
                  <div className='flex justify-between'>
                    <span className='text-gray-600 dark:text-gray-400'>
                      {results!.oneTimeExtrasDescription || 'One-time extras'}:
                    </span>
                    <span className='font-semibold'>{formatCurrency(results!.extrasOneTime)}</span>
                  </div>
                )}
                {results!.extrasTotal > 0 && (
                  <div className='flex justify-between'>
                    <span className='text-gray-600 dark:text-gray-400'>Extras total:</span>
                    <span className='font-semibold'>{formatCurrency(results!.extrasTotal)}</span>
                  </div>
                )}
                <p className='mt-2 text-xs text-muted-foreground'>
                  {exchangeRatesSummaryText
                    ? `Exchange rates reference: ${exchangeRatesSummaryText}`
                    : 'Exchange rates dataset unavailable — update the scraped file before relying on conversions.'}
                </p>
                <div className='border-t pt-3 mt-3'>
                  <div className='flex justify-between text-lg'>
                    <span className='font-bold'>Total Estimate:</span>
                    <span className='font-bold text-blue-600'>{formatCurrency(results!.total)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className='flex flex-wrap gap-3'>
                <Button variant='outline' onClick={downloadCsv}>
                  Download CSV
                </Button>
                <Button onClick={openPdfPreview}>Open PDF preview</Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Estimate Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground'>Complete the wizard to generate a travel estimate.</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>About These Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className='text-sm text-gray-600 dark:text-gray-400 space-y-2'>
                <li>
                  • Kilometric allowance — NJC Appendix B
                  {kilometricEffectiveLabel ? ` (effective ${kilometricEffectiveLabel})` : ''}
                </li>
                <li>
                  • Meal allowances —
                  {mealAllowanceDatasetAvailable
                    ? ` NJC Appendix C${mealEffectiveLabel ? ` (effective ${mealEffectiveLabel})` : ''}`
                    : ' dataset unavailable; confirm policy rates manually'}
                </li>
                <li>
                  • City rate limits —
                  {cityRateDatasetAvailable
                    ? ` PWGSC directory${cityRateEffectiveLabel ? ` (updated ${cityRateEffectiveLabel})` : ''}`
                    : ` dataset unavailable; default nightly rate ${formatCurrency(defaultHotelRate)}`}
                </li>
                {carRentalFetchedLabel && (
                  <li>
                    • Car rental sample — {carRentalReference.context?.city?.label ?? 'reference city'}
                    {carRentalCarTypeLabels.length ? ` (${carRentalCarTypeLabels.join(', ')})` : ''}
                    {` (scraped ${carRentalFetchedLabel})`}
                  </li>
                )}
                <li>
                  • Exchange rates —
                  {exchangeRatesSummaryText
                    ? ` ${exchangeRatesSummaryText}`
                    : ' dataset unavailable; refresh the scraped file to add conversion context'}
                </li>
                <li>• Confirm policy updates before filing claims</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
