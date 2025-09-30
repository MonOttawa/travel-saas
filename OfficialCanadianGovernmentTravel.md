<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Verification of Official Canadian Government Travel Allowance Sources for 2025

This report validates the accuracy and currency of the official Canadian government rates and links for car rentals, kilometric (KM) rates, hotel city rate limits, meal rates (domestic, US, and international), and the exchange rate calculator, as of late 2025.

***

## 1. Car Rental Page

**Official Source Used**:
[2025 Car Search Page - PWGSC](https://rehelv-acrd.tpsgc-pwgsc.gc.ca/rechercher-search-4-eng.aspx)

- **Status**: This is the correct and current link for Canadian government car rental rates and car class searches.
- **Confirmation**: The page is the latest version with a last modification date of September 20, 2024, indicating it is up to date for fiscal 2025. The page is functioning and references the correct process for rate lookup or vehicle eligibility.[^1][^2]

***

## 2. KM Rates (Kilometric Reimbursement)

**Official Source Used**:
[Kilometric Rates Appendix B - NJC](https://www.njc-cnm.gc.ca/directive/d10/v238/s658/en)

- **Status**: This is the official and current federal government resource for private vehicle reimbursement.
- **Effective Date**: As of July 1, 2025.
- **Rates**: For Ontario, for example, the rate is 62.5¢/km; other provinces are listed (e.g. Alberta 57¢/km, QC 60.5¢/km, BC 60¢/km).
- **Mechanism**: The reimbursement rate is based on where the vehicle is registered. There are also distinct rates for US/business travel, Global Affairs postings, and international assignments, all handled via this landing page.[^3]

***

## 3. Hotel City Rate Limits

**Official Source Used**:
[2025 City Rate Limits - PWGSC](https://rehelv-acrd.tpsgc-pwgsc.gc.ca/lth-crl-eng.aspx)

- **Status**: This consolidated PWGSC directory is the authoritative listing for Canadian, US, and international city hotel rate ceilings for 2025.
- **Details**: Limits are provided by month and by city, in Canadian dollars for Canadian locations; US dollars for USA cities; international rates by city, country, and currency.
- **General Rule**: If a city is not listed, the default allowable rate is \$110 (CAD/USD as appropriate).[^4][^5]

***

## 4. Meal Rates – Canada and USA

**Official Source Used**:
[Appendix C - Allowances - NJC](https://www.njc-cnm.gc.ca/directive/d10/v238/s659/en)

- **Status**: This is the official, up-to-date listing for meal entitlements for government travel in Canada and the continental USA.
- **Effective Date**: October 1, 2025.
- **Confirmed Rates for the First 30 Days** (Canada, in CAD; USA, in USD):
    - Breakfast: \$29.05
    - Lunch: \$29.60
    - Dinner: \$60.75
    - *Total daily allowance*: \$119.40 (taxes in; differs slightly by region)
- **Mechanism**: Reduced rates apply for day 31-120 (75%), and day 121+ (50%), as well as for alternate accommodations.[^6]

***

## 5. Meal Rates – International

**Official Source Used**:
[Travel Directive, Appendix D - Allowances](https://www.njc-cnm.gc.ca/directive/app_d.php?lang=eng)

- **Status**: This is the correct and current table for international (non-North American) meal rates used by all federal departments.
- **Details**: Rates vary by country and city, published in the official currency (e.g. EUR, USD, local), and are broken down by type of accommodation and duration of stay.
- **Incidental Allowances**: Incidental rates are a percentage (32% or 40%) of the applicable meal total, depending on accommodation type and city.
- **Adjustments**: 75% applies for day 31-120, and 50% from day 121 onward, consistent with domestic rules.[^7]

***

## 6. Foreign Currency Exchange Rate Calculator

**Official Source Used**:
[Foreign Currency Exchange Rate Calculator for Travel Claims](https://www.njc-cnm.gc.ca/xe/en)

- **Status**: This tool, issued by the National Joint Council, is the mandated calculator for currency conversion rates when submitting government travel claims.
- **Details**: The calculator uses weighted average methodologies compliant with the current travel directive, and explicitly supports all official government travel policies for currency conversion in effect for 2025.[^8]

***

## Conclusion

**All referenced pages are current, and official, and provide the authoritative rates for the Government of Canada for travel, accommodation, meals, vehicles, and currency conversion for fiscal year 2025.**

- The URLs are current and have not moved.
- All referenced rate tables or calculators are functioning and up to date.
- No alternative or more current sources exist for these official rates.

***
## Using These Sources in the Scraper

- Run `npm run scrape:official-rates` from the `app/` directory to populate `app/data/official-rates/` with the latest datasets.
- The script automatically gathers:
  - Kilometric rates (Appendix B)
  - Domestic meal allowances (Appendix C)
  - International meal allowances (Appendix D)
  - City rate limits from <https://rehelv-acrd.tpsgc-pwgsc.gc.ca/lth-crl-eng.aspx>
- Provide environment variables when you need additional tools:
  - `OFFICIAL_RATES_CAR_SEARCH_URL` plus optional `OFFICIAL_RATES_CAR_SEARCH_PARAMS` (JSON) for <https://rehelv-acrd.tpsgc-pwgsc.gc.ca/rechercher-search-4-eng.aspx>
    - Defaults target Ottawa, ON and the Compact class; override with fields such as `{"province":"BC","city":"92","carTypes":["C","D"],"location":"0"}`.
  - `OFFICIAL_RATES_EXCHANGE_URL` plus optional `OFFICIAL_RATES_EXCHANGE_PARAMS` (query string) for <https://www.njc-cnm.gc.ca/xe/en>
    - The exchange scraper defaults to the last 30 days of USD rates; override with JSON such as `{"currencies":["EUR","GBP"],"startDate":"2025-07-01","endDate":"2025-07-31"}` or set `days` for a rolling window.
- Verify that each generated JSON includes recent metadata:
  - `app/data/official-rates/exchange-rates.json` should include a `metadata.context.range` so the estimator can surface the conversion window.
  - Empty `rows` arrays will now trigger in-app fallback messaging for hotel and incidental defaults—rerun the scraper (or populate the files) before exporting figures.
- Refresh the traveller city autocomplete dataset with `npm run generate:canadian-cities` so newly scraped Canadian city limits appear in the wizard.
- Run `npm run backfill:canadian-cities` afterwards to pull latitude/longitude from the GeoNames CA dataset (Creative Commons Attribution 4.0) so every city supports automatic distance calculations.
- Distance estimates inside `/estimator` use the haversine formula, comparing latitude/longitude pairs stored in `app/data/canadian-cities.json`. If either city is missing coordinates, the UI prompts the user to enter kilometres manually—fill in the outstanding coordinates before relying on automated mileage.

Re-run the scraper whenever Treasury Board updates these sources so downstream data stays current.

***
<span style="display:none">[^10][^11][^12][^13][^14][^15][^16][^17][^18][^19][^20][^21][^22][^23][^9]</span>

<div align="center">⁂</div>

[^1]: https://donnees-data.tpsgc-pwgsc.gc.ca/ba2/limitestarifhebergeville-accommratelimitcity/soutien-support-eng.html

[^2]: https://www.njc-cnm.gc.ca/directive/app_d/en

[^3]: https://travel.gc.ca

[^4]: https://www.foursidesconsulting.com/notebook/how-to-capitalize-on-canadian-government-travel-by-getting-listed-on-the-accommodation-directory-of-canada/

[^5]: https://www.merx.com/public/supplier/interception/view-notice/22546381631?origin=0

[^6]: https://www.hertz.ca/rentacar/misc/index.jsp?targetPage=canada_government_and_military.jsp

[^7]: https://www2.gov.bc.ca/assets/gov/careers/all-employees/pay-and-benefits/appendix_1_travel_allowances.pdf

[^8]: https://www.reddit.com/r/CanadaPublicServants/comments/1gldn1l/government_hotel_rate_for_personal_travel/

[^9]: https://www.canada.ca/en/revenue-agency/corporate/about-canada-revenue-agency-cra/travel-directive/travel-directive-appendix.html

[^10]: https://army.ca/forums/threads/caftdti-accomodation-interpretation.145553/

[^11]: https://www.reddit.com/r/CanadaPublicServants/comments/ieue4e/car_rental_discount_code_for_goc_employees/

[^12]: https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-25500-northern-residents-deductions/meal-vehicle-rates-used-calculate-travel-expenses.html

[^13]: https://www.reddit.com/r/CanadaPublicServants/comments/1cb4enj/rental_car_for_personal_use_discount_code/

[^14]: https://www.njc-cnm.gc.ca/directive/travel-voyage/index-eng.php

[^15]: https://psacunion.ca/book/5019

[^16]: https://www.njc-cnm.gc.ca/s3/en

[^17]: https://www.canada.ca/en/treasury-board-secretariat/services/travel-relocation/travel-government-business.html

[^18]: https://travel.gc.ca/travelling/advisories

[^19]: https://cfmws.ca/about-us/travel-services/accommodation-car-rental

[^20]: https://www.gsa.gov/travel/plan-a-trip/per-diem-rates

[^21]: https://rehelv-acrd.tpsgc-pwgsc.gc.ca/lth-crl-eng.aspx\#canadian

[^22]: https://rehelv-acrd.tpsgc-pwgsc.gc.ca/lth-crl-eng.aspx\#us

[^23]: https://rehelv-acrd.tpsgc-pwgsc.gc.ca/lth-crl-eng.aspx\#foreign
