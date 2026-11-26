// Indonesia in Numbers — the router. Hash routes, one page each:
//
//   #/                  home: headline indicators and growth chart
//   #/population        provinces, age structure, population trend
//   #/economy           GDP, growth, inflation, trade
//   #/social            poverty, jobs, education, health
//   #/province/<slug>   one province's figures
//
// window.__shotReady is false while a page renders and true once it is
// on screen, so a screenshot script knows when to capture. The province
// search box (on the population page) filters that page's table live.

import { provinces } from './data.js';
import { home, population, economy, socialView, provinceDetail, missing } from './views.js';

const app = document.getElementById('app');
const navLinks = [...document.querySelectorAll('[data-nav]')];

function wireProvinceSearch() {
  const input = document.getElementById('prov-search');
  const table = document.getElementById('prov-table');
  const count = document.getElementById('prov-count');
  if (!input || !table) return;
  const rows = [...table.querySelectorAll('tbody tr')];
  const apply = () => {
    const q = input.value.trim().toLowerCase();
    let shown = 0;
    rows.forEach((row) => {
      const hit = q === '' || row.textContent.toLowerCase().includes(q);
      row.style.display = hit ? '' : 'none';
      if (hit) shown += 1;
    });
    if (count) count.textContent = q === '' ? '' : `${shown} of ${rows.length} provinces`;
  };
  input.addEventListener('input', apply);
  apply();
}

function render() {
  window.__shotReady = false;
  const hash = location.hash || '#/';
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  let title = 'Indonesia in Numbers';
  let html;
  let section = 'home';

  if (parts.length === 0) {
    html = home();
  } else if (parts[0] === 'population') {
    section = 'population';
    title = 'Population | Indonesia in Numbers';
    html = population();
  } else if (parts[0] === 'economy') {
    section = 'economy';
    title = 'Economy | Indonesia in Numbers';
    html = economy();
  } else if (parts[0] === 'social') {
    section = 'social';
    title = 'Social | Indonesia in Numbers';
    html = socialView();
  } else if (parts[0] === 'province' && parts[1]) {
    const found = provinces.find((p) => p.slug === decodeURIComponent(parts[1]));
    if (found) {
      section = 'population';
      title = `${found.name} | Indonesia in Numbers`;
      html = provinceDetail(found);
    } else {
      html = missing();
      title = 'Page not found | Indonesia in Numbers';
    }
  } else {
    html = missing();
    title = 'Page not found | Indonesia in Numbers';
  }

  document.title = title;
  navLinks.forEach((a) => a.classList.toggle('active', a.dataset.nav === section));
  app.innerHTML = html;
  wireProvinceSearch();
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener('hashchange', render);
render();
