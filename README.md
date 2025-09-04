Z3PA New Tab – Config-Driven New-Tab Extension

A lightweight, CSP-safe new-tab replacement for Chromium browsers.
It reads a config.json to set your title, brand text, favicon, background, shortcuts editor, and two links grids (apps & apps2). No inline scripts, works great with strict Content-Security-Policy.

✨ Features

Config-first: tweak everything in config.json (no code edits)

Shortcuts editor: add/remove links, saved to chrome.storage.sync (or localStorage)

Two links grids: define apps/apps2 in config.json

CSP-safe: all JS/CSS are external files; no inline JS

Extension-friendly: supports packaged icons via chrome.runtime.getURL

🗂 Project Structure
.
├─ manifest.json
├─ index.html            # main new-tab page (brand, background, shortcuts editor)
├─ links.html            # secondary page that renders two grids from config
├─ config.json           # all configurable content (title, brand, icons, bg, links)
├─ css/
│  ├─ services.css
│  └─ links.css
├─ js/
│  ├─ config-loader.js   # applies title/brand/favicon/background from config.json
│  ├─ services.js        # shortcuts editor (storage → config fallback)
│  └─ links.js           # renders apps/apps2 on links.html
└─ icons/
   ├─ favicon.png
   └─ apps/…             # optional per-app icons


You can rename folders—just keep paths consistent in HTML and manifest.json.

📦 manifest.json (drop-in)
{
  "manifest_version": 3,
  "name": "Z3PA New Tab",
  "version": "1.0.0",
  "description": "Config-driven new tab dashboard with shortcuts and links.",
  "permissions": ["storage"],
  "chrome_url_overrides": {
    "newtab": "index.html"
  },
  "icons": {
    "16": "icons/favicon.png",
    "48": "icons/favicon.png",
    "128": "icons/favicon.png"
  },
  "web_accessible_resources": [{
    "resources": ["icons/*", "images/*"],
    "matches": ["<all_urls>"]
  }]
}

⚙️ Configuration (config.json)
{
  "titleText": "My New Tab",
  "brandText": "Hello Z3PA",
  "favicon": "icons/favicon.png",
  "launcherIcon": "icons/favicon.png",
  "backgroundImage": "images/background.jpg",

  "linksTitle1": "Google apps",
  "linksTitle2": "Z3PA Links",

  "shortcuts": [
    { "label": "Jellyfin Hub",  "url": "http://z3pasjellyfinserver.online/" },
    { "label": "ChatGPT",       "url": "https://chatgpt.com/" },
    { "label": "Download List", "url": "https://list.z3pasjellyfinserver.online/" },
    { "label": "Jellyfin",      "url": "https://jellyfin.z3pasjellyfinserver.online/" },
    { "label": "Prowlarr",      "url": "https://prowlarr.z3pasjellyfinserver.online/" },
    { "label": "CloudFlared",   "url": "https://dash.cloudflare.com/a1c5.../dns/records" },
    { "label": "Radarr",        "url": "http://radarr.z3pasjellyfinserver.online/" },
    { "label": "Sonarr",        "url": "http://sonarr.z3pasjellyfinserver.online/" },
    { "label": "qBittorrent",   "url": "https://qbittorrent.z3pasjellyfinserver.online/" }
  ],

  "apps": [
    { "name": "Account",   "url": "https://myaccount.google.com", "icon": "icons/apps/account.png" },
    { "name": "YouTube",   "url": "https://www.youtube.com",      "icon": "icons/apps/youtube.png" },
    { "name": "Gmail",     "url": "https://mail.google.com",      "icon": "icons/apps/gmail.png" },
    { "name": "Translate", "url": "https://translate.google.com", "icon": "icons/apps/translate.png" },
    { "name": "Docs",      "url": "https://docs.google.com",      "icon": "https://www.computerhope.com/jargon/g/google-docs.png" },
    { "name": "Drive",     "url": "https://drive.google.com",     "icon": "icons/apps/drive.png" }
  ],

  "apps2": [
    { "name": "Jellyfin Hub", "url": "http://z3pasjellyfinserver.online/",            "icon": "icons/favicon.png" },
    { "name": "ChatGPT",      "url": "https://chatgpt.com/",                          "icon": "icons/apps/chatgpt.png" },
    { "name": "DownloadList", "url": "https://list.z3pasjellyfinserver.online/",      "icon": "icons/apps/list.png" },
    { "name": "Jellyfin",     "url": "https://jellyfin.z3pasjellyfinserver.online/",  "icon": "https://cdn.brandfetch.io/idu_b8goqH/w/400/h/400/theme/dark/icon.jpeg" },
    { "name": "Prowlarr",     "url": "https://prowlarr.z3pasjellyfinserver.online/",  "icon": "icons/apps/prowlarr.png" },
    { "name": "CloudFlared",  "url": "https://dash.cloudflare.com/a1c5.../dns/records","icon": "icons/apps/cloudflare.png" },
    { "name": "Radarr",       "url": "http://radarr.z3pasjellyfinserver.online/",     "icon": "https://getumbrel.github.io/umbrel-apps-gallery/radarr/icon.svg" },
    { "name": "Sonarr",       "url": "http://sonarr.z3pasjellyfinserver.online/",     "icon": "https://getumbrel.github.io/umbrel-apps-gallery/sonarr/icon.svg" },
    { "name": "qBittorrent",  "url": "https://qbittorrent.z3pasjellyfinserver.online/","icon": "https://cdn.brandfetch.io/idH7ybm9x8/theme/dark/logo.svg" }
  ]
}


shortcuts power the editor on index.html.

apps & apps2 power the two grids on links.html.

If an icon fails to load, the app will fall back to the site’s favicon.

🧩 How It Works

index.html loads:

js/config-loader.js to apply title/brand/favicon/background

js/services.js to render and edit shortcuts

Load order: storage → config → empty

Save: chrome.storage.sync if available, else localStorage

links.html loads:

js/links.js to render apps and apps2 from config.json

Browsers/extensions cannot write to config.json. “Save” persists to storage so your edits survive refresh/restart. If you want to truly write the JSON on disk, add a tiny backend—see Persist to config.json (Optional) below.

▶️ Install & Run (Chromium browsers)
Chrome / Edge / Brave / Vivaldi / Opera

Clone the repo:

git clone https://github.com/<you>/<repo>.git
cd <repo>


Open the extensions page:

Chrome: chrome://extensions

Edge: edge://extensions

Brave: brave://extensions

Vivaldi: vivaldi://extensions

Opera: opera://extensions

Enable Developer mode (toggle in the top-right).

Click Load unpacked and select the repo folder (where manifest.json lives).

Open a new tab — your page should appear.

To update while editing: hit Reload on the extension card, then open a new tab.

🛠 Development Tips

Keep all JS/CSS external (no inline <script>/handlers) to satisfy strict CSP.

Editing config.json and reloading the new tab should immediately reflect changes.
(The code uses cache: "no-store" / cache-busting where needed.)

If you ship your own icons/*, import them in HTML/JS with relative paths. Inside an extension page, you don’t need to declare them as web_accessible_resources unless they’re loaded by a non-extension page.

🧪 Troubleshooting

“Refused to execute inline script…”
You still have inline JS or inline event handlers. Move all JS into files and reference them with <script src="..." defer></script>.

Shortcuts reset on refresh
Make sure js/services.js loads storage first. The provided file already does this (storage → config → empty). Also confirm the page includes the right element IDs: #scList, #scAdd, #scSave.

Saved shortcuts don’t sync across devices
chrome.storage.sync has quotas and requires a signed-in profile. If unavailable, extension falls back to localStorage (per-device).

Icons not showing
Check the icon path. If an image 404s, links.js falls back to the site favicon automatically.

💾 Persist to config.json (Optional)

Extensions can’t write to packaged files. If you want the Save button to update config.json on disk (for a self-hosted web version), add a tiny API:

Run a small Node server that exposes POST /api/save-shortcuts and writes to public/config.json.

Call that endpoint after saving to storage.

A reference server.js is easy to add later if you want this flow.

🔐 Permissions

"storage" — used by the shortcuts editor to persist your custom list.

No background scripts, content scripts, or host permissions are required.

📝 License

MIT — do what you want. Add your name/year if you’d like.

🙌 Credits

Built by Z3PA. Icons/logos are property of their respective owners.
