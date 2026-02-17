const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const PORT = process.env.PORT || 3000;
const API_BASE = 'https://discordstatus.com/api/v2';

const app = express();

// Serve static site from current directory
app.use(express.static(path.join(__dirname)));

// Simple proxy for Statuspage API to avoid CORS issues
app.get('/api/*', async (req, res) => {
  try {
    const apiPath = req.path.replace(/^\/api/, '');
    const search = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    const url = `${API_BASE}${apiPath}${search}`;
    const r = await fetch(url);
    const body = await r.text();
    res.status(r.status);
    const contentType = r.headers.get('content-type') || 'application/json';
    res.set('Content-Type', contentType);
    // allow cross-origin when serving proxy
    res.set('Access-Control-Allow-Origin', '*');
    res.send(body);
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
