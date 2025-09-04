(() => {
  'use strict';

  const ICON_FILE = 'icons/favicon.png';
  const LINKS_URL = chrome.runtime.getURL('links.html');
  const SERVICES_URL = chrome.runtime.getURL('services.html');

  const DEFAULT_SHORTCUTS = [
    { label: "Jellyfin Hub", url: "http://z3pasjellyfinserver.online/" },
    { label: "ChatGPT", url: "https://chatgpt.com/" },
    { label: "Jellyfin", url: "http://jellyfin.z3pasjellyfinserver.online/" },
    { label: "Twitch", url: "https://www.twitch.tv/wZ3PA" },
    { label: "TikTok", url: "https://www.tiktok.com/@w.z3pa" },
    { label: "Fortnite Tracker", url: "https://fortnitetracker.com/" },
    { label: "Epic Games", url: "https://epicgames.com/" }
  ];

  const $ = (s, r = document) => r.querySelector(s);
  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);
  const css = (el, o) => el && Object.assign(el.style, o);

  function renderShortcuts(list) {
    const el = document.getElementById('shortcuts');
    if (!el) return;
    el.innerHTML = (list || []).map(s =>
      `<a class="chip" href="${s.url}" target="_self" rel="noopener">${s.label}</a>`
    ).join('');
  }
  function initShortcuts() {
    try {
      chrome.storage.sync.get({ shortcuts: DEFAULT_SHORTCUTS }, ({ shortcuts }) => {
        renderShortcuts(shortcuts);
      });
      chrome.storage.onChanged.addListener((chg, area) => {
        if (area === 'sync' && chg.shortcuts) renderShortcuts(chg.shortcuts.newValue || DEFAULT_SHORTCUTS);
      });
    } catch {
      renderShortcuts(DEFAULT_SHORTCUTS);
    }
  }

  function ensureLauncher() {
    let btn = $('#svcFab') || $('#svcBtn');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'svcBtn';
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Open panel');
      document.body.appendChild(btn);
    }
    const iconURL = chrome.runtime.getURL(ICON_FILE);
    btn.innerHTML = `<img alt="Z3PA" src="${iconURL}">`;
    css(btn, {
      position: 'fixed', top: '16px', right: '16px',
      width: '44px', height: '44px', padding: '0',
      borderRadius: '50%', border: '2px solid #fff',
      background: 'rgba(255,255,255,.06)',
      cursor: 'pointer', display: 'grid', placeItems: 'center',
      overflow: 'hidden', isolation: 'isolate', zIndex: 1001
    });
    css(btn.querySelector('img'), {
      width: '100%', height: '100%', display: 'block', borderRadius: '50%'
    });
    return btn;
  }

  function buildPanelMarkup(panel) {
    panel.innerHTML = `
      <header id="panelHeader">
        <nav id="tabs">
          <button class="tab active" data-tab="links"    type="button" id="tabLinks">Links</button>
          <button class="tab"         data-tab="services" type="button" id="tabServices">Services</button>
        </nav>
        <button id="panelClose" class="close" type="button" aria-label="Close">✕</button>
      </header>
      <div class="panelBody">
        <iframe id="svcFrame" title="Panel" allow="clipboard-read; clipboard-write"></iframe>
        <div id="clickShield" aria-hidden="true"></div>
      </div>
    `;
  }

  function ensurePanel() {
    let backdrop = $('#panelBackdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'panelBackdrop';
      document.body.appendChild(backdrop);
    }
    css(backdrop, {
      position: 'fixed', inset: '0', background: 'rgba(0,0,0,.35)',
      opacity: '0', pointerEvents: 'none', transition: 'opacity .18s ease', zIndex: 999
    });

    let panel = $('#panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'panel';
      panel.setAttribute('tabindex', '-1');
      buildPanelMarkup(panel);
      document.body.appendChild(panel);
    } else {
      const needRebuild = !$('#tabLinks', panel) || !$('#tabServices', panel) || !$('#svcFrame', panel) || !$('#panelClose', panel) || !$('#panelHeader', panel);
      if (needRebuild) buildPanelMarkup(panel);
    }

    css(panel, {
      position: 'fixed',
      top: '10px', right: '76px',
      width: '340px', height: '460px',
      maxWidth: 'calc(100vw - 96px)', maxHeight: 'calc(100vh - 20px)',
      background: 'rgba(28,28,30,.85)',
      border: '1px solid rgba(255,255,255,.16)',
      borderRadius: '18px',
      boxShadow: '0 10px 30px rgba(0,0,0,.45)',
      backdropFilter: 'blur(10px)',
      transform: 'translateY(-8px) scale(.98)',
      opacity: '0', pointerEvents: 'none',
      transition: 'transform .18s ease, opacity .18s ease',
      display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 1000
    });

    const header = $('#panelHeader', panel);
    const tabs = $('#tabs', panel);
    const tabL = $('#tabLinks', panel);
    const tabS = $('#tabServices', panel);
    const iframe = $('#svcFrame', panel);
    const close = $('#panelClose', panel);
    const body = $('.panelBody', panel);
    const shield = $('#clickShield', panel);

    css(header, {
      position: 'relative', zIndex: 3,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,.12)',
      background: 'rgba(28,28,30,.92)',
      pointerEvents: 'auto'
    });
    css(tabs, { display: 'flex', gap: '6px' });
    [tabL, tabS].forEach(b => b && css(b, {
      border: '1px solid rgba(255,255,255,.18)',
      background: 'rgba(255,255,255,.06)',
      color: '#e8e8e8', padding: '6px 10px',
      borderRadius: '999px', cursor: 'pointer', fontSize: '12px', fontWeight: '700'
    }));
    css(close, { border: '0', background: 'transparent', color: '#ddd', fontSize: '18px', cursor: 'pointer' });

    css(body, { position: 'relative', zIndex: 1, flex: '1', overflow: 'hidden' });
    css(iframe, { position: 'relative', zIndex: 1, display: 'block', border: '0', width: '100%', height: '100%', pointerEvents: 'auto' });
    css(shield, { position: 'absolute', inset: '0', zIndex: 2, display: 'none', background: 'transparent', pointerEvents: 'auto' });

    return { backdrop, panel, header, tabs, tabL, tabS, iframe, close, shield };
  }

  function setOpen(ui, open) {
    if (open) {
      ui.backdrop.style.opacity = '1';
      ui.backdrop.style.pointerEvents = 'auto';
      ui.panel.style.transform = 'translateY(0) scale(1)';
      ui.panel.style.opacity = '1';
      ui.panel.style.pointerEvents = 'auto';
      ui.panel.classList.add('open');
      ui.panel.focus();
    } else {
      ui.panel.classList.remove('open');
      ui.backdrop.style.opacity = '0';
      ui.backdrop.style.pointerEvents = 'none';
      ui.panel.style.transform = 'translateY(-8px) scale(.98)';
      ui.panel.style.opacity = '0';
      ui.panel.style.pointerEvents = 'none';
    }
  }

  function setActiveTab(ui, which) {
    if (!ui.tabL || !ui.tabS || !ui.iframe) {
      const rebuilt = ensurePanel();
      Object.assign(ui, rebuilt);
      if (!ui.tabL || !ui.tabS || !ui.iframe) {
        console.warn('[Z3PA] tabs/iframe still missing; aborting setActiveTab');
        return;
      }
    }
    const url = which === 'services' ? SERVICES_URL : LINKS_URL;

    ui.tabL.classList.toggle('active', which === 'links');
    ui.tabS.classList.toggle('active', which === 'services');

    ui.iframe.src = url + `#t=${Date.now()}`;

    try { chrome.storage.local.set({ lastPanelTab: which }); } catch { }
    console.log('[Z3PA] tab ->', which, 'url:', url);
  }

  function guardHeader(ui) {
    const arm = () => { ui.shield.style.display = 'block'; };
    const dis = () => { ui.shield.style.display = 'none'; };
    on(ui.header, 'pointerenter', arm);
    on(ui.header, 'pointerleave', dis);
    on(ui.header, 'mousedown', () => { arm(); setTimeout(dis, 220); });
  }

  function wire(launcher, ui) {
    on(launcher, 'click', () => {
      const open = ui.panel.classList.contains('open');
      if (open) return setOpen(ui, false);
      try {
        chrome.storage.local.get({ lastPanelTab: 'links' }, ({ lastPanelTab }) => {
          setActiveTab(ui, lastPanelTab || 'links');
          setOpen(ui, true);
        });
      } catch {
        setActiveTab(ui, 'links');
        setOpen(ui, true);
      }
    });
    on(ui.backdrop, 'click', () => setOpen(ui, false));
    on(ui.close, 'click', () => setOpen(ui, false));
    on(document, 'keydown', (e) => { if (e.key === 'Escape') setOpen(ui, false); });

    on(ui.tabL, 'click', (e) => { e.stopPropagation(); e.stopImmediatePropagation(); setActiveTab(ui, 'links'); });
    on(ui.tabS, 'click', (e) => { e.stopPropagation(); e.stopImmediatePropagation(); setActiveTab(ui, 'services'); });

    document.addEventListener('click', (e) => {
      if (!ui.panel.classList.contains('open')) return;
      const b = e.target.closest('#panel .tab');
      if (!b) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      const t = b.getAttribute('data-tab');
      if (t) setActiveTab(ui, t);
    }, true);

    on(ui.panel, 'wheel', (e) => {
      if (!ui.panel.classList.contains('open')) return;
      const cw = ui.iframe?.contentWindow;
      if (!cw) return;
      e.preventDefault();
      cw.scrollBy({ top: e.deltaY, behavior: 'auto' });
    }, { passive: false });

    on(ui.panel, 'keydown', (e) => {
      if (!ui.panel.classList.contains('open')) return;
      const cw = ui.iframe?.contentWindow;
      if (!cw) return;
      let dy = 0;
      switch (e.key) {
        case 'ArrowDown': case 'j': dy = 40; break;
        case 'ArrowUp': case 'k': dy = -40; break;
        case 'PageDown': case ' ': dy = ui.panel.clientHeight * 0.9; break;
        case 'PageUp': dy = -ui.panel.clientHeight * 0.9; break;
        default: return;
      }
      e.preventDefault();
      cw.scrollBy({ top: dy, behavior: 'auto' });
    });

    guardHeader(ui);
  }

  function init() {
    initShortcuts();
    const launcher = ensureLauncher();
    const ui = ensurePanel();
    wire(launcher, ui);
    console.log('[Z3PA newtab] ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
