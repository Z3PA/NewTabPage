(() => {
  'use strict';

  // --- helpers ---
  const fav = d => `https://www.google.com/s2/favicons?domain=${encodeURIComponent(d)}&sz=128`;

  // If running as a Chrome extension and icon is packaged (icons/...),
  // map to the real extension URL. Otherwise return as-is.
  const ext = p => (p && p.startsWith('icons/') && globalThis.chrome?.runtime?.getURL)
    ? chrome.runtime.getURL(p)
    : p;

  // Parse domain from a URL to request Google favicon if custom icon fails/missing
  function domainFrom(url) {
    try { return new URL(url).hostname; } catch { return ''; }
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn, { once: true });
  }

  async function loadConfig() {
    // Cache-bust so config edits reflect immediately
    const url = `config.json?v=${Date.now()}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`config.json HTTP ${res.status}`);
    return res.json();
  }

  function addTile(grid, name, url, icon) {
    const imgSrc = icon ? ext(icon) : fav(domainFrom(url));
    const a = document.createElement('a');
    a.className = 'app';
    a.href = url;
    a.target = '_top';
    a.rel = 'noopener';

    a.innerHTML = `
      <div class="iconWrap"><img alt="" src="${imgSrc}"></div>
      <span>${name}</span>
    `;

    // fallback to site favicon if icon fails
    const img = a.querySelector('img');
    img.addEventListener('error', () => {
      const d = domainFrom(url);
      if (d) img.src = fav(d);
    }, { once: true });

    grid.appendChild(a);
  }

  function renderSectionTitle(el, text) {
    if (el && text) el.textContent = text;
  }

  function renderGrid(gridEl, items) {
    if (!gridEl || !Array.isArray(items)) return;
    gridEl.innerHTML = '';
    for (const it of items) {
      // Accept either {name,url,icon} or [name,url,icon]
      const name = it?.name ?? it?.[0];
      const url  = it?.url  ?? it?.[1];
      const icon = it?.icon ?? it?.[2];
      if (!name || !url) continue;
      addTile(gridEl, name, url, icon);
    }
  }

  ready(async () => {
    const g1 = document.getElementById('grid1');
    const g2 = document.getElementById('grid2');
    const t1 = document.getElementById('linksTitle1');
    const t2 = document.getElementById('linksTitle2');

    if (!g1 || !g2) {
      console.error('[links] Missing grid containers #grid1 and/or #grid2');
      return;
    }

    const FALLBACK = {
      linksTitle1: 'linksTitle1',
      linksTitle2: 'linksTitle2',
      container1: [
        { name: 'Account',   url: 'https://myaccount.google.com', icon: 'icons/apps/account.png' },
        { name: 'YouTube',   url: 'https://www.youtube.com',      icon: 'icons/apps/youtube.png' },
        { name: 'Gmail',     url: 'https://mail.google.com',      icon: 'icons/apps/gmail.png' },
        { name: 'Translate', url: 'https://translate.google.com', icon: 'icons/apps/translate.png' },
        { name: 'Docs',      url: 'https://docs.google.com',      icon: 'https://www.computerhope.com/jargon/g/google-docs.png' },
        { name: 'Drive',     url: 'https://drive.google.com',     icon: 'icons/apps/drive.png' }
      ],
      container2: []
    };

    try {
      const cfg = await loadConfig();

      renderSectionTitle(t1, cfg.linksTitle1 || FALLBACK.linksTitle1);
      renderSectionTitle(t2, cfg.linksTitle2 || FALLBACK.linksTitle2);

      renderGrid(g1, Array.isArray(cfg.container1)  ? cfg.container1  : FALLBACK.container1);
      renderGrid(g2, Array.isArray(cfg.container2) ? cfg.container2 : FALLBACK.container2);
    } catch (e) {
      console.warn('[links] config.json failed, using fallback:', e);
      renderSectionTitle(t1, FALLBACK.linksTitle1);
      renderSectionTitle(t2, FALLBACK.linksTitle2);
      renderGrid(g1, FALLBACK.container1);
      renderGrid(g2, FALLBACK.container2);
    }
  });
})();
