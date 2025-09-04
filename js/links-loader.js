(async () => {
    try {
        const res = await fetch("config.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`Config load failed: HTTP ${res.status}`);
        const cfg = await res.json();

        const title1 = document.getElementById("linksTitle1");
        const title2 = document.getElementById("linksTitle2");

        if (title1 && cfg.linksTitle1) title1.textContent = cfg.linksTitle1;
        if (title2 && cfg.linksTitle2) title2.textContent = cfg.linksTitle2;

        if (cfg.linksPageTitle) document.title = cfg.linksPageTitle;
    } catch (e) {
        console.error("Failed to load config.json for links page:", e);
    }
})();
