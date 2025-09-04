(async () => {
    try {
        const res = await fetch("config.json");
        
        if (!res.ok) throw new Error(`Config load failed: HTTP ${res.status}`);
        const cfg = await res.json();

        if (cfg.titleText) document.title = cfg.titleText;
        const brand = document.getElementById("brand");

        if (brand && cfg.brandText) brand.textContent = cfg.brandText;
        const favicon = document.getElementById("favicon");

        if (favicon && cfg.favicon) favicon.href = cfg.favicon;

        if (cfg.backgroundImage) {
            document.body.style.backgroundImage = `url("${cfg.backgroundImage}")`;
            document.body.style.backgroundSize = "cover";
            document.body.style.backgroundPosition = "center";
        }
    } catch (e) {
        console.error("Failed to load config.json:", e);
    }
})();
