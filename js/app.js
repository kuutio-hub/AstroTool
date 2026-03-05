
import { createDashboard } from './components/dashboard.js';
import { createCalculator } from './components/calculator.js';
import { createCatalog } from './components/catalog.js';
import { getGeolocation, storage } from './utils.js';
import { DashboardIcon, TelescopeIcon, GlobeIcon, NightModeIcon, CatalogIcon } from './icons.js';

// State
const state = {
    activeTab: 'dashboard', // dashboard, catalog, calculator
    isNightMode: storage.get('isNightMode', true),
    dimLevel: storage.get('dimLevel', 0), // 0 to 0.8
    location: storage.get('location', { latitude: 47.4979, longitude: 19.0402 }), // Default Budapest
    sunData: null,
    moonData: null,
    geoLoading: false
};

// DOM Elements
const app = document.getElementById('app');
const header = document.getElementById('header');
const mainContent = document.getElementById('main-content');
const footer = document.getElementById('footer');

// Dimmer Overlay
const dimmer = document.createElement('div');
dimmer.className = "fixed inset-0 pointer-events-none z-[100] bg-black transition-opacity duration-300";
document.body.appendChild(dimmer);

// Update Theme
function updateTheme() {
    if (state.isNightMode) {
        document.body.classList.add('bg-slate-950', 'text-red-600');
        document.body.classList.remove('bg-slate-100', 'text-slate-900');
        document.documentElement.classList.add('night-mode');
    } else {
        document.body.classList.add('bg-slate-100', 'text-slate-900');
        document.body.classList.remove('bg-slate-950', 'text-red-600');
        document.documentElement.classList.remove('night-mode');
    }
    
    // Apply Dimming
    dimmer.style.opacity = state.isNightMode ? state.dimLevel : 0;

    renderHeader(); // Re-render header to update icon colors
    renderContent(); // Re-render content to pass new mode
    renderFooter();
}

// Calculate Data
function calculateData() {
    if (!window.SunCalc) return;
    
    const now = new Date();
    const times = window.SunCalc.getTimes(now, state.location.latitude, state.location.longitude);
    const moonIllum = window.SunCalc.getMoonIllumination(now);
    const moonTimes = window.SunCalc.getMoonTimes(now, state.location.latitude, state.location.longitude);
    
    // Calculate daylight duration
    const durationMs = times.sunset - times.sunrise;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    // Calculate remaining daylight
    let remaining = "0ó 0p";
    if (now < times.sunset && now > times.sunrise) {
        const remMs = times.sunset - now;
        const remH = Math.floor(remMs / (1000 * 60 * 60));
        const remM = Math.floor((remMs % (1000 * 60 * 60)) / (1000 * 60));
        remaining = `${remH}ó ${remM}p`;
    } else if (now < times.sunrise) {
        remaining = "Még nem kelt fel";
    } else {
        remaining = "Már lement";
    }

    // Moon Distance (approximate calculation)
    const moonPos = window.SunCalc.getMoonPosition(now, state.location.latitude, state.location.longitude);
    const moonAge = moonIllum.phase * 29.53;

    state.sunData = {
        ...times,
        daylightDuration: `${hours}ó ${minutes}p`,
        remainingDaylight: remaining
    };

    state.moonData = {
        rise: moonTimes.rise,
        set: moonTimes.set,
        fraction: moonIllum.fraction,
        phase: moonIllum.phase,
        distance: moonPos.distance,
        age: moonAge
    };
    
    renderContent();
}

// Render Header
function renderHeader() {
    const btnClass = `p-2 rounded-full transition-all ${state.isNightMode ? 'hover:bg-red-900/20 text-red-500' : 'hover:bg-slate-200 text-slate-600'}`;
    
    header.innerHTML = `
        <div class="flex items-center gap-2">
            <h1 class="text-lg font-bold tracking-widest uppercase ${state.isNightMode ? 'text-red-600' : 'text-slate-800'}">AstroTool</h1>
        </div>
        <div class="flex items-center gap-2">
            ${state.isNightMode ? `
                <div class="flex items-center gap-1 mr-2">
                    <span class="text-[10px] font-bold opacity-60">DIM</span>
                    <input type="range" min="0" max="0.8" step="0.1" value="${state.dimLevel}" class="w-16 h-1 bg-red-900 rounded-lg appearance-none cursor-pointer accent-red-500" id="dim-slider">
                </div>
            ` : ''}
            <button id="gps-btn" class="${btnClass} ${state.geoLoading ? 'animate-pulse' : ''}" title="Helyzet frissítése">
                ${GlobeIcon("w-5 h-5")}
            </button>
            <button id="theme-btn" class="${btnClass}" title="Éjszakai mód">
                ${NightModeIcon("w-5 h-5")}
            </button>
        </div>
    `;

    header.querySelector('#gps-btn').onclick = () => {
        state.geoLoading = true;
        renderHeader();
        getGeolocation((pos, err) => {
            state.geoLoading = false;
            if (pos) {
                state.location = pos;
                storage.set('location', pos);
                calculateData();
            } else {
                alert("Helymeghatározás sikertelen: " + err.message);
            }
            renderHeader();
        });
    };

    header.querySelector('#theme-btn').onclick = () => {
        state.isNightMode = !state.isNightMode;
        storage.set('isNightMode', state.isNightMode);
        updateTheme();
    };

    if (state.isNightMode) {
        header.querySelector('#dim-slider').oninput = (e) => {
            state.dimLevel = parseFloat(e.target.value);
            storage.set('dimLevel', state.dimLevel);
            dimmer.style.opacity = state.dimLevel;
        };
    }
}

// Render Footer (Navigation)
function renderFooter() {
    const navItems = [
        { id: 'dashboard', icon: DashboardIcon, label: 'Műszerfal' },
        { id: 'catalog', icon: CatalogIcon, label: 'Katalógus' },
        { id: 'calculator', icon: TelescopeIcon, label: 'Kalkulátor' }
    ];

    const navHtml = navItems.map(item => {
        const isActive = state.activeTab === item.id;
        const activeClass = state.isNightMode ? 'text-red-500 bg-red-950/30' : 'text-blue-600 bg-blue-100';
        const inactiveClass = state.isNightMode ? 'text-red-900 hover:text-red-700' : 'text-slate-400 hover:text-slate-600';
        
        return `
            <button data-tab="${item.id}" class="flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${isActive ? activeClass : inactiveClass}">
                ${item.icon("w-5 h-5")}
                <span class="text-[9px] font-bold uppercase tracking-wider">${item.label}</span>
            </button>
        `;
    }).join('');

    footer.innerHTML = `<div class="flex justify-around items-center max-w-md mx-auto">${navHtml}</div>`;

    footer.querySelectorAll('button').forEach(btn => {
        btn.onclick = () => {
            state.activeTab = btn.dataset.tab;
            renderFooter();
            renderContent();
        };
    });
}

// Render Main Content
function renderContent() {
    mainContent.innerHTML = '';
    
    let component;
    if (state.activeTab === 'dashboard') {
        component = createDashboard(state.location, state.sunData, state.moonData, state.isNightMode);
    } else if (state.activeTab === 'catalog') {
        component = createCatalog(state.isNightMode);
    } else if (state.activeTab === 'calculator') {
        component = createCalculator(state.isNightMode);
    }

    if (component) {
        mainContent.appendChild(component);
    }
}

// Init
function init() {
    updateTheme();
    renderHeader();
    renderFooter();
    
    // Initial calculation
    if (window.SunCalc) {
        calculateData();
    } else {
        // Wait for script to load
        const check = setInterval(() => {
            if (window.SunCalc) {
                clearInterval(check);
                calculateData();
            }
        }, 100);
    }

    // Refresh data every minute
    setInterval(calculateData, 60000);
}

init();
