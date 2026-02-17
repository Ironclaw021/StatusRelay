/**
 * Discord Status Engine v2.4.0
 * Features: Adaptive UI coloring, Relative Time, and Component Filtering
 */

const API_BASE = 'https://discordstatus.com/api/v2';
const el = id => document.getElementById(id);

// --- State Management ---
let lastSuccessfulData = null;

// --- Mappings & Theme Sync ---
const STATUS_MAP = {
    none:     { color: 'var(--green)',  glow: 'var(--green-glow)',  text: 'All Systems Operational', icon: '✔' },
    minor:    { color: 'var(--yellow)', glow: 'rgba(240, 178, 50, 0.2)', text: 'Partial System Outage',   icon: '!' },
    major:    { color: 'var(--orange)', glow: 'rgba(249, 115, 22, 0.2)', text: 'Major Service Outage',    icon: '✕' },
    critical: { color: 'var(--red)',    glow: 'var(--red-glow)',    text: 'Critical System Failure',  icon: '☢' },
    unknown:  { color: 'var(--text-muted)', glow: 'transparent',    text: 'Status Unknown',           icon: '?' }
};

const COMP_MAP = {
    operational:          { color: 'var(--green)',  label: 'Operational' },
    degraded_performance: { color: 'var(--yellow)', label: 'Degraded' },
    partial_outage:       { color: 'var(--orange)', label: 'Partial Outage' },
    major_outage:         { color: 'var(--red)',    label: 'Major Outage' },
    under_maintenance:    { color: 'var(--accent-primary)', label: 'Maintenance' }
};

// --- Utilities ---
const escapeHtml = (s) => String(s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]));

function getRelativeTime(timestamp) {
    if (!timestamp) return 'Never';
    const ms = new Date() - new Date(timestamp);
    const sec = Math.floor(ms / 1000);
    if (sec < 60) return 'Just now';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    return `${hr}h ago`;
}

// --- Core Logic ---
async function fetchAPI(endpoint) {
    try {
        const res = await fetch(`${API_BASE}${endpoint}`);
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error(`Failed to fetch ${endpoint}:`, err);
        return null;
    }
}

async function updateAll() {
    const refreshBtn = el('refresh');
    const heroCard = document.querySelector('.status-card');
    
    // UI Feedback: Start loading
    refreshBtn.classList.add('loading');
    refreshBtn.disabled = true;
    refreshBtn.innerHTML = '<span>⌛</span> Syncing...';

    const [statusData, compsData, incData] = await Promise.all([
        fetchAPI('/status.json'),
        fetchAPI('/components.json'),
        fetchAPI('/incidents.json')
    ]);

    if (!statusData) {
        el('description').textContent = "Connection Lost - Retrying...";
        return;
    }

    // 1. Update Hero Card Theme
    const indicator = statusData.status?.indicator || 'none';
    const theme = STATUS_MAP[indicator] || STATUS_MAP.unknown;
    
    el('indicator').style.background = theme.color;
    el('indicator').style.boxShadow = `0 0 20px ${theme.glow}`;
    el('description').textContent = statusData.status?.description || theme.text;
    el('last-updated').textContent = `Refreshed: ${new Date().toLocaleTimeString()}`;
    
    // Update the whole card background glow
    heroCard.style.borderLeft = `6px solid ${theme.color}`;
    heroCard.style.setProperty('--glow-color', theme.glow);

    // 2. Render Components (Filtered to core services)
    renderComponents(compsData?.components || []);

    // 3. Render Incidents
    renderIncidents(incData?.incidents || []);

    // 4. Update Raw JSON
    if (el('raw-json')) {
        el('raw-json').textContent = JSON.stringify({ statusData, compsData }, null, 2);
    }

    // Reset UI Feedback
    setTimeout(() => {
        refreshBtn.classList.remove('loading');
        refreshBtn.disabled = false;
        refreshBtn.innerHTML = '<span>↻</span> Refresh';
    }, 500);
}

function renderComponents(components) {
    const grid = el('components');
    grid.innerHTML = '';
    
    // Filter out sub-components (optional: shows only main categories like "API", "Gateway")
    const mainComponents = components.filter(c => !c.group_id).slice(0, 12);

    mainComponents.forEach(c => {
        const st = COMP_MAP[c.status] || { color: 'gray', label: c.status };
        const card = document.createElement('div');
        card.className = 'component';
        card.innerHTML = `
            <div class="comp-left">
                <div class="comp-indicator" style="background:${st.color}; box-shadow: 0 0 8px ${st.color}44"></div>
                <div class="comp-name">${escapeHtml(c.name)}</div>
            </div>
            <div class="comp-status" style="color:${st.color}">${st.label}</div>
        `;
        grid.appendChild(card);
    });
}

function renderIncidents(incidents) {
    const list = el('incidents');
    list.innerHTML = '';

    if (!incidents || incidents.length === 0) {
        list.innerHTML = `
            <div class="incident-item empty">
                <p style="color:var(--text-muted); text-align:center; padding: 20px;">
                    No active incidents reported. All systems are green.
                </p>
            </div>`;
        return;
    }

    incidents.slice(0, 3).forEach(inc => {
        const item = document.createElement('div');
        item.className = 'incident';
        
        // Only show latest update to keep UI clean
        const latest = inc.incident_updates?.[0];
        const updateHtml = latest ? `
            <div class="update">
                <strong>${latest.status.toUpperCase()}</strong>
                <p>${escapeHtml(latest.body)}</p>
                <div class="muted">${getRelativeTime(latest.created_at)}</div>
            </div>
        ` : '';

        item.innerHTML = `
            <div class="incident-head">
                <a href="${inc.shortlink}" target="_blank">${escapeHtml(inc.name)}</a>
                <span class="badge" style="background: var(--red-glow); color: var(--red)">Active</span>
            </div>
            <div class="incident-body">${updateHtml}</div>
        `;
        list.appendChild(item);
    });
}

// --- Initialization ---
let autoTimer = null;
function setAutoInterval(sec) {
    if (autoTimer) clearInterval(autoTimer);
    if (sec > 0) autoTimer = setInterval(updateAll, sec * 1000);
}

document.addEventListener('DOMContentLoaded', () => {
    // Event Listeners
    el('refresh').addEventListener('click', updateAll);
    el('interval').addEventListener('change', (e) => setAutoInterval(Number(e.target.value)));
    
    // Initial Run
    const initialInterval = Number(el('interval').value);
    if (initialInterval > 0) setAutoInterval(initialInterval);
    updateAll();
});