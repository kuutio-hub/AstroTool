
import { createDashboard } from './components/dashboard.js';
import { createAnalemma } from './components/analemma.js';
import { createCalculator } from './components/calculator.js';
import { getGeolocation, storage, formatTime } from './utils.js';
import { DashboardIcon, TelescopeIcon, GlobeIcon, LightbulbIcon } from './icons.js';

// State
const state = {
    activeTab: 'dashboard', // dashboard, analemma, calculator
    isNightMode: storage.get('isNightMode', true),
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
    renderHeader(); // Re-render header to update icon colors
    renderContent(); // Re-render content to pass new mode
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

    // Moon Distance (approximate calculation as SunCalc doesn't provide it directly in simple getMoonPosition)
    // Actually SunCalc.getMoonPosition returns distance in km? No, it returns distance in Earth radii?
    // Let's check SunCalc docs or source.
    // SunCalc.getMoonPosition(date, lat, lng) -> { azimuth, altitude, distance, parallacticAngle }
    // distance is in kilometers.
    const moonPos = window.SunCalc.getMoonPosition(now, state.location.latitude, state.location.longitude);

    // Moon Age (approximate)
    // Synodic month is 29.53 days. Phase is 0..1.
    // Age = phase * 29.53
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
            <button id="gps-btn" class="${btnClass} ${state.geoLoading ? 'animate-pulse' : ''}" title="Helyzet frissítése">
                ${GlobeIcon("w-5 h-5")}
            </button>
            <button id="theme-btn" class="${btnClass}" title="Éjszakai mód">
                ${LightbulbIcon("w-5 h-5")}
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
}

// Render Footer (Navigation)
function renderFooter() {
    const navItems = [
        { id: 'dashboard', icon: DashboardIcon, label: 'Műszerfal' },
        { id: 'analemma', icon: GlobeIcon, label: 'Analemma' },
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
    } else if (state.activeTab === 'analemma') {
        component = createAnalemma(state.location, state.isNightMode);
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
