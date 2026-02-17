# Discord Status Checker (static site)

Open `index.html` in a browser to see Discord status fetched from `https://discordstatus.com` (Statuspage API).

Files:
- `index.html` — main page
- `script.js` — client-side fetch and UI logic
- `style.css` — styles

Notes:
- The site calls the public Statuspage API endpoints at `https://discordstatus.com/api/v2`. If your browser blocks the requests due to CORS, host the page on a simple static host (GitHub Pages or similar) or use a small proxy.

- The page now includes a collapsible "Raw status.json" viewer which shows the JSON payload fetched from `https://discordstatus.com/api/v2/status.json`.

Quick start options

**Easiest: No dependencies (Windows batch file)**

Double-click `open-site.bat` to open the site in your browser. Uses a free CORS proxy fallback — no installation needed.

**Simple Node.js server (lightweight, no npm install)**

If Node.js is installed:

```bash
node server.mjs
```

Runs on http://localhost:3000 with built-in API proxy. Uses native Node APIs (no external dependencies).

**Full setup with Express (recommended if you have Node.js + npm)**

1. Install dependencies:

```bash
npm install
npm start
```

Opens http://localhost:3000. More robust than `server.mjs`.

Notes and automatic fallbacks:
- The client tries these sources (in order):
	1. Local proxy at `/api` (when you run `server.js`).
 2. Direct API at `https://discordstatus.com/api/v2` (may be blocked by CORS in some browsers/origins).
 3. Public CORS proxy `https://api.allorigins.win/raw` as a last-resort fallback so the page can still load status data without running the local server.

If you prefer not to run a proxy, deploy the static files to a hosting provider that supports server-side fetching or provides a proxy (Netlify, Vercel, GitHub Pages with functions, etc.).

Quick helper (Windows PowerShell)

If you're on Windows and have Node.js installed, run the bundled `start-server.ps1` helper to install dependencies, start the proxy in a new PowerShell window, and open the site in your browser:

```powershell
# from this folder
.\start-server.ps1
# optionally specify a port
.\start-server.ps1 -Port 3000
```

The script will check for `node`/`npm`, run `npm install`, spawn `npm start` in a new PowerShell window, and open http://localhost:3000.

Automatic Node installation (Windows)

If `node` is not found, `start-server.ps1` now attempts to install Node.js LTS automatically using `winget` (it will prompt for administrator permission). If `winget` is not available or the automatic install fails, the script will open the Node.js download page so you can install manually.

Note: `winget` is available on recent Windows 10/11 builds. If you don't have `winget`, install Node.js manually from the Node.js website.
