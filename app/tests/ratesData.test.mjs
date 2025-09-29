import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadRatesDataModule() {
  const sourcePath = path.resolve(__dirname, '../src/travel/ratesData.ts');
  const source = readFileSync(sourcePath, 'utf8');

  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
      resolveJsonModule: true,
    },
    fileName: 'ratesData.ts',
  }).outputText;

  const module = { exports: {} };
  const exports = module.exports;
  const require = createRequire(sourcePath);
  const context = {
    require,
    module,
    exports,
    __filename: sourcePath,
    __dirname: path.dirname(sourcePath),
    process,
    console,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
  };

  vm.runInNewContext(transpiled, context, { filename: sourcePath });
  return module.exports;
}

const ratesData = loadRatesDataModule();

const {
  getKilometricRate,
  calculateMealAllowance,
  calculateIncidentalAllowance,
  mealAllowanceRates,
  getCityRateFor,
} = ratesData;

const localRequire = createRequire(__filename);
const kilometricRaw = localRequire('../data/official-rates/kilometric-rates.json');
const cityRatesRaw = localRequire('../data/official-rates/city-rate-limits.json');

describe('ratesData helpers', () => {
  test('getKilometricRate returns province data by slug', () => {
    const ontario = getKilometricRate('ontario');
    assert.equal(ontario.label, 'Ontario');
    assert.equal(ontario.abbreviation, 'ON');
    assert.ok(ontario.centsPerKm > 0);
    assert.match(ontario.formattedRate, /^0\.\d{2}$/);

    const fallback = getKilometricRate('not-real-province');
    const knownLabels = new Set(kilometricRaw.rows.map((row) => row.provinceTerritory));
    assert.ok(knownLabels.has(fallback.label), 'fallback returns first available kilometric option');
  });

  test('calculateMealAllowance segments by tiered day ranges', () => {
    const result = calculateMealAllowance(45);
    assert.equal(result.segments.length, 2);
    assert.equal(result.segments[0]?.label, 'Days 1-30');
    assert.equal(result.segments[1]?.label, 'Days 31-120');

    const expectedTotal = mealAllowanceRates.full * 30 + mealAllowanceRates.seventyFive * 15;
    assert.equal(result.total, expectedTotal);
  });

  test('calculateMealAllowance guards against non-positive input', () => {
    const zeroResult = calculateMealAllowance(0);
    assert.equal(zeroResult.total, 0);
    assert.equal(zeroResult.segments.length, 0);

    const negativeResult = calculateMealAllowance(-10);
    assert.equal(negativeResult.total, 0);
    assert.equal(negativeResult.segments.length, 0);
  });

  test('calculateIncidentalAllowance reduces rate after day 30', () => {
    const incidental = calculateIncidentalAllowance(50);
    assert.equal(incidental.segments.length, 2);
    assert.equal(incidental.segments[0]?.label, 'Days 1-30');
    assert.equal(incidental.segments[1]?.label, 'Day 31+');

    const expected =
      mealAllowanceRates.incidentalFull * 30 + mealAllowanceRates.incidentalReduced * 20;
    assert.equal(incidental.total, expected);
  });

  test('getCityRateFor returns monthly limit for specified city and region', () => {
    const sampleDate = new Date('2024-03-15T00:00:00Z');
    const ottawa = getCityRateFor('Ottawa', 'ON', sampleDate);
    const marchKey = 'mar';
    const ottawaRow = cityRatesRaw.rows.find(
      (row) => row.city === 'Ottawa' && row.region === 'ON',
    );

    assert.ok(ottawaRow, 'expected reference row for Ottawa, ON');
    assert.equal(ottawa.amount, ottawaRow ? ottawaRow[marchKey] : null);
    assert.equal(ottawa.currency, ottawaRow?.currency ?? null);
    assert.equal(ottawa.monthLabel, 'March');
  });

  test('getCityRateFor returns nulls for unknown cities', () => {
    const result = getCityRateFor('Atlantis', 'ZZ', new Date('2024-01-01T00:00:00Z'));
    assert.equal(result.amount, null);
    assert.equal(result.currency, null);
  });
});
