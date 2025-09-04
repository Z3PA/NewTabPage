(() => {
  const $err    = document.getElementById("err");
  const $scList = document.getElementById("scList");
  const $scAdd  = document.getElementById("scAdd");
  const $scSave = document.getElementById("scSave");

  const showErr = m => { if ($err) { $err.textContent = m; $err.style.display = "block"; } };
  const hideErr = () => { if ($err) $err.style.display = "none"; };

  const storage = (() => {
    const sync = globalThis.chrome?.storage?.sync;
    if (sync?.get && sync?.set) {
      return {
        name: "chrome",
        async get(k){ return await sync.get(k); },
        async set(o){ return await sync.set(o); }
      };
    }
    return {
      name: "local",
      async get(k){
        try {
          const raw = localStorage.getItem(k);
          return raw ? { [k]: JSON.parse(raw) } : {};
        } catch { return {}; }
      },
      async set(o){
        for (const [k,v] of Object.entries(o)) {
          localStorage.setItem(k, JSON.stringify(v));
        }
      }
    };
  })();

  function row(label="", url=""){
    const wrap = document.createElement("div");
    wrap.className = "sc-item";
    wrap.innerHTML = `
      <input class="sc-label" placeholder="Label" value="${escapeHtml(label)}">
      <input class="sc-url"   placeholder="https://example.com" value="${escapeHtml(url)}">
      <button class="btn del" type="button" title="Remove">Delete</button>
    `;
    wrap.querySelector(".del").addEventListener("click", () => wrap.remove());
    return wrap;
  }

  function escapeHtml(s=''){
    return s.replace(/[&<>"']/g, c =>
      ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])
    );
  }

  function render(list){
    $scList.innerHTML = "";
    (list || []).forEach(s => $scList.appendChild(row(s.label, s.url)));
  }

  function readUI(){
    const items = [];
    $scList.querySelectorAll(".sc-item").forEach(div => {
      const label = div.querySelector(".sc-label")?.value.trim() || "";
      const url   = div.querySelector(".sc-url")?.value.trim()   || "";
      if (label && url) items.push({ label, url });
    });
    return items;
  }

  async function loadShortcuts(){
    try {
      const got = await storage.get("shortcuts");
      if (Array.isArray(got.shortcuts) && got.shortcuts.length) {
        render(got.shortcuts);
        return;
      }
    } catch (e) {
      console.warn("[shortcuts] storage read failed", e);
    }

    try {
      const res = await fetch("config.json", { cache: "no-store" });
      if (res.ok) {
        const cfg = await res.json();
        if (Array.isArray(cfg.shortcuts) && cfg.shortcuts.length) {
          render(cfg.shortcuts);
          return;
        }
      } else {
        console.warn("config.json HTTP", res.status);
      }
    } catch (e) {
      console.warn("[shortcuts] config.json load failed", e);
    }

    render([]);
  }

  $scAdd.addEventListener("click", () => {
    $scList.appendChild(row());
    $scList.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  $scSave.addEventListener("click", async () => {
    const list = readUI();
    try {
      await storage.set({ shortcuts: list });
      hideErr();
    } catch (e) {
      console.error("Save failed:", e);
      showErr("Failed to save shortcuts.");
    }
  });

  loadShortcuts();
})();
