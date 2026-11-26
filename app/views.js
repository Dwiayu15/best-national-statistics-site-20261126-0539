// Page views for Indonesia in Numbers. Every view is a function that
// returns an HTML string; main.js drops it into #app. Charts are plain
// inline SVG drawn from the numbers in data.js — no library, no network.

import {
  headline, country, ageGroups, populationTrend, provinces,
  growthTrend, inflationTrend, gdpSectors, trade, economyExtra,
  povertyTrend, social,
} from './data.js';

function esc(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function fmt(n, digits = 2) {
  return n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

// A vertical bar chart as SVG. values: [{label, value}]; the value axis
// is labelled, negative bars are drawn below the zero line.
function barChart(values, { width = 640, height = 260, unit = '', min = null } = {}) {
  const padL = 44;
  const padB = 26;
  const padT = 22;
  const innerW = width - padL - 8;
  const innerH = height - padT - padB;
  let lo = min !== null ? min : Math.min(0, ...values.map((v) => v.value));
  let hi = Math.max(...values.map((v) => v.value));
  if (hi === lo) hi = lo + 1;
  const y = (v) => padT + ((hi - v) / (hi - lo)) * innerH;
  const zeroY = y(0);
  const step = innerW / values.length;
  const barW = Math.min(44, step * 0.62);
  let bars = '';
  let labels = '';
  values.forEach((v, i) => {
    const x = padL + i * step + (step - barW) / 2;
    const top = Math.min(y(v.value), zeroY);
    const h = Math.abs(zeroY - y(v.value));
    bars += `<rect class="bar${v.value < 0 ? ' neg' : ''}" x="${x.toFixed(1)}" y="${top.toFixed(1)}" width="${barW.toFixed(1)}" height="${Math.max(h, 1).toFixed(1)}"/>`;
    bars += `<text class="val" x="${(x + barW / 2).toFixed(1)}" y="${(top - 5).toFixed(1)}" text-anchor="middle">${fmt(v.value, 2)}${unit}</text>`;
    labels += `<text class="tick" x="${(padL + i * step + step / 2).toFixed(1)}" y="${(height - 8).toFixed(1)}" text-anchor="middle">${esc(v.label)}</text>`;
  });
  const grid = [0, 0.5, 1].map((f) => {
    const gv = lo + (hi - lo) * f;
    return `<line class="grid" x1="${padL}" y1="${y(gv).toFixed(1)}" x2="${width - 8}" y2="${y(gv).toFixed(1)}"/><text class="tick" x="${padL - 6}" y="${(y(gv) + 4).toFixed(1)}" text-anchor="end">${fmt(gv, 0)}</text>`;
  }).join('');
  return `<svg class="chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Bar chart">${grid}<line class="axis" x1="${padL}" y1="${zeroY.toFixed(1)}" x2="${width - 8}" y2="${zeroY.toFixed(1)}"/>${bars}${labels}</svg>`;
}

// A line chart as SVG with labelled points.
function lineChart(values, { width = 640, height = 260, unit = '%' } = {}) {
  const padL = 44;
  const padB = 26;
  const padT = 22;
  const innerW = width - padL - 8;
  const innerH = height - padT - padB;
  const lo = Math.min(...values.map((v) => v.value));
  const hi = Math.max(...values.map((v) => v.value));
  const span = hi - lo || 1;
  const x = (i) => padL + (i / (values.length - 1)) * innerW;
  const y = (v) => padT + ((hi - v) / span) * innerH;
  const pts = values.map((v, i) => `${x(i).toFixed(1)},${y(v.value).toFixed(1)}`).join(' ');
  const dots = values.map((v, i) => `<circle class="dot" cx="${x(i).toFixed(1)}" cy="${y(v.value).toFixed(1)}" r="3.5"/><text class="val" x="${x(i).toFixed(1)}" y="${(y(v.value) - 9).toFixed(1)}" text-anchor="middle">${fmt(v.value, 2)}${unit}</text>`).join('');
  const labels = values.map((v, i) => `<text class="tick" x="${x(i).toFixed(1)}" y="${height - 8}" text-anchor="middle">${esc(v.label)}</text>`).join('');
  const grid = [0, 0.5, 1].map((f) => {
    const gv = lo + span * f;
    return `<line class="grid" x1="${padL}" y1="${y(gv).toFixed(1)}" x2="${width - 8}" y2="${y(gv).toFixed(1)}"/><text class="tick" x="${padL - 6}" y="${(y(gv) + 4).toFixed(1)}" text-anchor="end">${fmt(gv, 1)}</text>`;
  }).join('');
  return `<svg class="chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Line chart">${grid}<polyline class="line" points="${pts}"/>${dots}${labels}</svg>`;
}

function heroCards() {
  return `<section class="hero-cards" aria-label="Headline indicators">${headline.map((h) => `
    <article class="stat-card">
      <div class="label">${esc(h.label)}</div>
      <div class="value">${esc(h.value)}</div>
      <div class="src">${esc(h.note)}</div>
      <p class="detail">${esc(h.detail)}</p>
    </article>`).join('')}
  </section>`;
}

export function home() {
  return `
  <h1>Indonesia in Numbers</h1>
  <p class="lede">The national statistics of Indonesia in one place — how many people live here,
  how the economy is doing, and how life is changing — with every figure sourced and dated.</p>
  ${heroCards()}
  <section class="panel">
    <h2>Economic growth, 2019–2025</h2>
    <p>Real GDP growth, percent per year. The economy shrank in 2020, then grew about 5% a year.
    <span class="note">Source: BPS — Statistics Indonesia.</span></p>
    ${barChart(growthTrend.map((g) => ({ label: String(g.year), value: g.growth })), { unit: '%' })}
  </section>
  <div class="two-col">
    <section class="panel">
      <h2>The country at a glance</h2>
      <table><tbody>
        <tr><th scope="row">Provinces</th><td class="num">${country.provinces}</td></tr>
        <tr><th scope="row">Regencies and cities</th><td class="num">${country.regenciesCities}</td></tr>
        <tr><th scope="row">Islands</th><td class="num">${country.islands.toLocaleString('en-US')}</td></tr>
        <tr><th scope="row">Land area</th><td class="num">1.9 million km²</td></tr>
        <tr><th scope="row">Population density</th><td class="num">~${country.density} people per km²</td></tr>
        <tr><th scope="row">Median age</th><td class="num">${country.medianAge} years</td></tr>
        <tr><th scope="row">Life expectancy</th><td class="num">${country.lifeExpectancy} years (2024)</td></tr>
      </tbody></table>
      <p class="note">Sources: BPS — Statistics Indonesia, 2024–2025.</p>
    </section>
    <section class="panel">
      <h2>Explore the data</h2>
      <p>Every section is a page of its own, reached from the navigation above:</p>
      <ul>
        <li><a href="#/population">Population</a> — provinces, age structure and the growth trend.</li>
        <li><a href="#/economy">Economy</a> — GDP, growth, inflation and trade.</li>
        <li><a href="#/social">Social</a> — poverty, jobs, education and health.</li>
      </ul>
      <div class="callout"><strong>Newest figures:</strong> population 284.4 million (2025),
      economic growth 5.11% (2025), poverty 8.57% (September 2024).</div>
    </section>
  </div>`;
}

export function population() {
  const maxPop = Math.max(...provinces.map((p) => p.pop));
  return `
  <h1>Population</h1>
  <p class="lede">Indonesia had <strong>284.4 million people in 2025</strong> (BPS), the fourth largest
  population in the world, growing about 0.8% a year. More than half live on Java.</p>
  <section class="panel">
    <h2>Population, 2019–2025</h2>
    <p>Millions of people, mid-year estimates. <span class="note">Source: BPS — Statistics Indonesia.</span></p>
    ${lineChart(populationTrend.map((p) => ({ label: String(p.year), value: p.pop })), { unit: 'm' })}
  </section>
  <section class="panel">
    <h2>Age structure, 2024</h2>
    <p>Share of the population by age group. <span class="note">Source: BPS — Statistics Indonesia.</span></p>
    <div class="stack-bar" role="img" aria-label="Age structure: 24.7 percent aged 0 to 14, 68.9 percent aged 15 to 64, 6.4 percent aged 65 and over">
      ${ageGroups.map((g, i) => `<span class="s${i + 1}" style="width:${g.share}%">${g.share}%</span>`).join('')}
    </div>
    <table><tbody>
      ${ageGroups.map((g) => `<tr><th scope="row">${esc(g.group)}</th><td class="num">${g.share}%</td></tr>`).join('')}
    </tbody></table>
    <p>Two in three Indonesians are of working age — the demographic dividend the economy is built on.</p>
  </section>
  <section class="panel">
    <h2>Most populous provinces, 2024</h2>
    <p>Population in millions, BPS 2024 mid-year estimates. Select a province for its own page.</p>
    <div class="search-row">
      <label for="prov-search">Find a province</label>
      <input type="search" id="prov-search" placeholder="Type a name, e.g. Java…" autocomplete="off">
      <span class="search-count" id="prov-count"></span>
    </div>
    <table id="prov-table">
      <thead><tr><th>Province</th><th>Capital</th><th class="num">Population</th><th class="num">Share</th><th>Share of Indonesia</th></tr></thead>
      <tbody>
      ${provinces.map((p) => `<tr>
        <td><a href="#/province/${p.slug}">${esc(p.name)}</a></td>
        <td>${esc(p.capital)}</td>
        <td class="num">${fmt(p.pop, 2)}m</td>
        <td class="num">${fmt(p.share, 1)}%</td>
        <td class="bar-cell"><div class="bar-track"><div class="bar-fill" style="width:${(p.pop / maxPop * 100).toFixed(1)}%"></div></div></td>
      </tr>`).join('')}
      </tbody>
    </table>
    <p class="note">The ten provinces above hold about 72% of the country's population.</p>
  </section>`;
}

export function economy() {
  return `
  <h1>Economy</h1>
  <p class="lede">Indonesia is Southeast Asia's largest economy. GDP reached <strong>Rp 22,139 trillion
  (US$1.40 trillion) in 2024</strong>, growing 5.03% — and 5.11% in 2025.</p>
  <section class="panel">
    <h2>Economic growth, 2019–2025</h2>
    <p>Real GDP growth, percent per year. <span class="note">Source: BPS — Statistics Indonesia.</span></p>
    ${barChart(growthTrend.map((g) => ({ label: String(g.year), value: g.growth })), { unit: '%' })}
  </section>
  <div class="two-col">
    <section class="panel">
      <h2>Inflation, 2019–2024</h2>
      <p>Consumer price inflation, calendar year, percent. It peaked at 5.51% in 2022 and fell to 1.57% in 2024.
      <span class="note">Source: BPS — Statistics Indonesia.</span></p>
      ${lineChart(inflationTrend.map((g) => ({ label: String(g.year), value: g.rate })), { unit: '%' })}
    </section>
    <section class="panel">
      <h2>What the economy makes</h2>
      <p>Share of GDP by sector, 2024. <span class="note">Source: BPS — Statistics Indonesia (rounded).</span></p>
      <table><tbody>
        ${gdpSectors.map((s) => `<tr><th scope="row">${esc(s.sector)}</th><td class="num">${fmt(s.share, 1)}%</td></tr>`).join('')}
      </tbody></table>
    </section>
  </div>
  <section class="panel">
    <h2>Trade in goods, 2024</h2>
    <p>Indonesia exported <strong>US$${trade.exports} billion</strong> of goods and imported
    <strong>US$${trade.imports} billion</strong>, a surplus of <strong>US$${trade.surplus} billion</strong>.
    <span class="note">Source: BPS — Statistics Indonesia.</span></p>
    <div class="two-col">
      <div>
        <h3>Top exports</h3>
        <ul class="tag-list">${trade.topExports.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      </div>
      <div>
        <h3>Top trading partners</h3>
        <ul class="tag-list">${trade.topPartners.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      </div>
    </div>
  </section>
  <section class="panel">
    <h2>More economy indicators</h2>
    <div class="indicator-list">
      ${economyExtra.map((e) => `<article class="indicator">
        <div class="label">${esc(e.label)}</div>
        <div class="value">${esc(e.value)}</div>
        <div class="src">${esc(e.note)}</div>
      </article>`).join('')}
    </div>
  </section>`;
}

export function socialView() {
  return `
  <h1>Social</h1>
  <p class="lede">How Indonesians live: poverty and jobs, education, health and getting online.
  Every figure is dated and sourced.</p>
  <section class="panel">
    <h2>Poverty rate, 2019–2024</h2>
    <p>Percent of the population below the poverty line, September of each year. The lowest level ever
    recorded was 8.57% in September 2024. <span class="note">Source: BPS — Statistics Indonesia.</span></p>
    ${lineChart(povertyTrend.map((p) => ({ label: String(p.year), value: p.rate })), { unit: '%' })}
  </section>
  <section class="panel">
    <h2>Indicators</h2>
    <div class="indicator-list">
      ${social.map((s) => `<article class="indicator">
        <div class="label">${esc(s.label)}</div>
        <div class="value">${esc(s.value)}</div>
        <div class="src">${esc(s.note)}</div>
        <p class="detail">${esc(s.detail)}</p>
      </article>`).join('')}
    </div>
  </section>
  <div class="callout"><strong>Reading the poverty line:</strong> BPS counts a person as poor when
  their spending falls below the cost of basic needs — Rp 595,242 per person per month in September 2024.
  The World Bank's international line gives a higher figure; the two lines measure different things.</div>`;
}

export function provinceDetail(p) {
  const density = Math.round((p.pop * 1000000) / p.area);
  const national = 284.4;
  return `
  <h1>${esc(p.name)}</h1>
  <p class="lede">Capital: <strong>${esc(p.capital)}</strong> · Population <strong>${fmt(p.pop, 2)} million
  (2024)</strong> — ${fmt(p.share, 1)}% of Indonesia.</p>
  <div class="hero-cards">
    <article class="stat-card">
      <div class="label">Population</div>
      <div class="value">${fmt(p.pop, 2)}m</div>
      <div class="src">2024 · BPS</div>
      <p class="detail">${fmt(p.share, 1)}% of Indonesia's ${national} million people.</p>
    </article>
    <article class="stat-card">
      <div class="label">Land area</div>
      <div class="value">${p.area.toLocaleString('en-US')} km²</div>
      <div class="src">BPS</div>
      <p class="detail">About ${fmt((p.area / 1900000) * 100, 2)}% of Indonesia's land area.</p>
    </article>
    <article class="stat-card">
      <div class="label">Density</div>
      <div class="value">${density.toLocaleString('en-US')}/km²</div>
      <div class="src">Computed from BPS figures</div>
      <p class="detail">Indonesia averages about 149 people per km².</p>
    </article>
  </div>
  <section class="panel">
    <h2>Where it stands</h2>
    <p>${esc(p.name)} is the ${['West Java', 'East Java', 'Central Java'].includes(p.name) ? 'one of the three most populous provinces — all on Java, the island where more than half of Indonesians live' : 'one of Indonesia’s ten most populous provinces'}. Its capital, ${esc(p.capital)}, is the province's administrative and economic centre.</p>
    <p><a href="#/population">← Back to all provinces</a></p>
  </section>`;
}

export function missing() {
  return `<div class="not-found">
    <h1>Page not found</h1>
    <p>That page is not part of this site. Try one of the sections above.</p>
    <p><a href="#/">Back to the home page</a></p>
  </div>`;
}
