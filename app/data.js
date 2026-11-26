// The figures behind Indonesia in Numbers. Every number carries its year
// and its source; the site shows those labels next to the figure so a
// visitor can see where each one comes from. Sources are BPS — Statistics
// Indonesia unless a different source is named. Figures are the published
// ones; where a value is rounded, the label says so.

export const meta = {
  country: 'Indonesia',
  updated: 'November 2026',
  attribution: 'BPS — Statistics Indonesia',
};

// Headline numbers for the home page hero strip.
export const headline = [
  { label: 'Population', value: '284.4m', note: '2025 · BPS', detail: 'Fourth most populous country in the world' },
  { label: 'GDP', value: 'US$1.40tn', note: '2024 · BPS', detail: 'Rp 22,139 trillion at current prices' },
  { label: 'Economic growth', value: '5.03%', note: '2024 · BPS', detail: '5.11% in 2025' },
  { label: 'GDP per capita', value: 'US$4,960', note: '2024 · BPS', detail: 'Rp 78.6 million per person' },
  { label: 'Poverty rate', value: '8.57%', note: 'Sep 2024 · BPS', detail: '24.06 million people below the poverty line' },
  { label: 'Unemployment', value: '4.91%', note: 'Aug 2024 · BPS', detail: '7.47 million people unemployed' },
];

// The country at a glance: geography and demography.
export const country = {
  provinces: 38,
  regenciesCities: 514,
  islands: 17508,
  landAreaKm2: 1900000,
  population2025: 284.4,
  populationGrowth: 0.8,
  density: 149,
  medianAge: 30.7,
  lifeExpectancy: 73.9,
};

// Age structure, percent of population, 2024 (BPS).
export const ageGroups = [
  { group: '0–14 years', share: 24.7 },
  { group: '15–64 years', share: 68.9 },
  { group: '65 years and over', share: 6.4 },
];

// Population by year, millions (BPS).
export const populationTrend = [
  { year: 2019, pop: 268.1 },
  { year: 2020, pop: 270.2 },
  { year: 2021, pop: 273.3 },
  { year: 2022, pop: 276.4 },
  { year: 2023, pop: 279.4 },
  { year: 2024, pop: 282.0 },
  { year: 2025, pop: 284.4 },
];

// The ten most populous provinces. Population is the BPS 2024 mid-year
// estimate in millions; area is the province's land area in square
// kilometres; density is computed from the two. Capitals are the
// provincial capitals.
export const provinces = [
  { slug: 'west-java', name: 'West Java', capital: 'Bandung', pop: 50.35, area: 37040, share: 17.8 },
  { slug: 'east-java', name: 'East Java', capital: 'Surabaya', pop: 41.81, area: 47800, share: 14.8 },
  { slug: 'central-java', name: 'Central Java', capital: 'Semarang', pop: 37.89, area: 32801, share: 13.4 },
  { slug: 'north-sumatra', name: 'North Sumatra', capital: 'Medan', pop: 16.02, area: 72981, share: 5.7 },
  { slug: 'banten', name: 'Banten', capital: 'Serang', pop: 12.43, area: 9663, share: 4.4 },
  { slug: 'jakarta', name: 'Jakarta', capital: 'Jakarta', pop: 10.68, area: 664, share: 3.8 },
  { slug: 'south-sulawesi', name: 'South Sulawesi', capital: 'Makassar', pop: 9.46, area: 46717, share: 3.4 },
  { slug: 'lampung', name: 'Lampung', capital: 'Bandar Lampung', pop: 9.42, area: 34624, share: 3.3 },
  { slug: 'south-sumatra', name: 'South Sumatra', capital: 'Palembang', pop: 8.92, area: 91592, share: 3.2 },
  { slug: 'riau', name: 'Riau', capital: 'Pekanbaru', pop: 6.97, area: 87024, share: 2.5 },
];

// Economic growth, percent per year (BPS).
export const growthTrend = [
  { year: 2019, growth: 5.02 },
  { year: 2020, growth: -2.07 },
  { year: 2021, growth: 3.69 },
  { year: 2022, growth: 5.31 },
  { year: 2023, growth: 5.05 },
  { year: 2024, growth: 5.03 },
  { year: 2025, growth: 5.11 },
];

// Consumer price inflation, calendar year, percent (BPS).
export const inflationTrend = [
  { year: 2019, rate: 2.72 },
  { year: 2020, rate: 1.68 },
  { year: 2021, rate: 1.87 },
  { year: 2022, rate: 5.51 },
  { year: 2023, rate: 2.61 },
  { year: 2024, rate: 1.57 },
];

// GDP by sector, share of GDP, 2024 (BPS, rounded).
export const gdpSectors = [
  { sector: 'Manufacturing', share: 18.9 },
  { sector: 'Trade, hotels and restaurants', share: 12.9 },
  { sector: 'Agriculture, forestry and fishing', share: 12.5 },
  { sector: 'Construction', share: 10.2 },
  { sector: 'Mining and quarrying', share: 10.0 },
  { sector: 'All other sectors', share: 35.5 },
];

// Trade in goods, 2024, US$ billion (BPS).
export const trade = {
  year: 2024,
  exports: 264.7,
  imports: 233.7,
  surplus: 31.0,
  topExports: ['Coal', 'Palm oil', 'Iron and steel', 'Natural gas', 'Rubber'],
  topPartners: ['China', 'United States', 'Japan', 'India', 'Singapore'],
};

// Other economy indicators.
export const economyExtra = [
  { label: 'Foreign exchange reserves', value: 'US$155.7bn', note: 'End of 2024 · Bank Indonesia' },
  { label: 'Rupiah per US dollar', value: 'Rp 15,855', note: '2024 average · Bank Indonesia' },
  { label: 'GDP (PPP)', value: 'US$4.67tn', note: '2024 · World Bank' },
  { label: 'GDP per capita (PPP)', value: 'US$16,515', note: '2024 · World Bank' },
];

// Poverty rate, September of each year, percent (BPS).
export const povertyTrend = [
  { year: 2019, rate: 9.22 },
  { year: 2020, rate: 10.19 },
  { year: 2021, rate: 10.14 },
  { year: 2022, rate: 9.57 },
  { year: 2023, rate: 9.36 },
  { year: 2024, rate: 8.57 },
];

// Social indicators, each with its year and source.
export const social = [
  { label: 'Poverty rate', value: '8.57%', note: 'Sep 2024 · BPS', detail: '24.06 million people; urban 6.66%, rural 11.34%. Poverty line Rp 595,242 per person per month.' },
  { label: 'Open unemployment rate', value: '4.91%', note: 'Aug 2024 · BPS', detail: '7.47 million people unemployed, out of a labour force of about 153 million.' },
  { label: 'Human Development Index', value: '75.02', note: '2024 · BPS', detail: 'On a scale of 0 to 100; up from 74.39 in 2023.' },
  { label: 'Life expectancy at birth', value: '73.9 years', note: '2024 · BPS', detail: 'Up from 73.5 years in 2023.' },
  { label: 'Literacy rate (age 15+)', value: '96.5%', note: '2023 · BPS', detail: 'Share of people aged 15 and over who can read and write.' },
  { label: 'Mean years of schooling', value: '8.9 years', note: '2024 · BPS', detail: 'Average years of formal schooling completed by people aged 25 and over.' },
  { label: 'Internet users', value: '213 million', note: '2025 · APJII', detail: 'About 75% of the population uses the internet.' },
  { label: 'Population with electricity', value: '99.4%', note: '2024 · BPS', detail: 'Share of households with access to electricity.' },
];
