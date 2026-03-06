import { storage, TimeService } from './utils.js';
import { createDashboard } from './dashboard.js';
import { createCalculator } from './calculator/index.js';
import { createDropdown } from './components/dropdown.js';

const app = document.getElementById('app');
let isNightMode = storage.get('nightMode', false);
let activeTab = storage.get('activeTab', 'dashboard');
let userLocation = storage.get('location', { latitude: 47.4979, longitude: 19.0402 }); // Default Budapest

function render() {
    app.innerHTML = '';
    
    // Apply theme
    if (isNightMode) {
        document.body.classList.add('night-mode');
        document.body.classList.remove('day-mode');
    } else {
        document.body.classList.add('day-mode');
        document.body.classList.remove('night-mode');
    }

    // Header
    const header = document.createElement('header');
    header.className = "flex justify-between items-center mb-6";
    
    const title = document.createElement('h1');
    title.className = `text-2xl font-bold tracking-widest uppercase ${isNightMode ? 'text-red-500' : 'text-white'}`;
    title.textContent = "AstroTool 2.0";
    
    const controls = document.createElement('div');
    controls.className = "flex gap-2 items-center";

    // Theme Toggle
    const themeBtn = document.createElement('button');
    themeBtn.className = `px-4 py-2 rounded astro-card font-bold text-xs uppercase tracking-wider hover:bg-opacity-80 transition-all ${isNightMode ? 'text-red-500' : 'text-white'}`;
    themeBtn.textContent = isNightMode ? 'Nappali Mód' : 'Éjszakai Mód';
    themeBtn.onclick = () => {
        isNightMode = !isNightMode;
        storage.set('nightMode', isNightMode);
        render();
    };

    // Location Settings Dropdown
    const locHtml = `
        <div class="p-4 w-64">
            <h3 class="font-bold uppercase text-xs mb-3 ${isNightMode ? 'text-red-500' : 'text-white'}">Helyzet Beállítása</h3>
            <div class="space-y-3">
                <div>
                    <label class="astro-label">Szélesség (Lat)</label>
                    <input type="number" id="loc-lat" value="${userLocation.latitude}" step="0.0001" class="astro-input">
                </div>
                <div>
                    <label class="astro-label">Hosszúság (Lon)</label>
                    <input type="number" id="loc-lon" value="${userLocation.longitude}" step="0.0001" class="astro-input">
                </div>
                <button id="loc-save" class="w-full mt-2 px-4 py-2 rounded bg-blue-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-700 transition-all ${isNightMode ? 'bg-red-900 hover:bg-red-800 text-red-500' : ''}">
                    Mentés
                </button>
            </div>
        </div>
    `;
    const locDropdown = createDropdown('Helyzet', locHtml, isNightMode);
    
    // Attach event listener to the save button inside the dropdown
    // We need to do this after the dropdown is added to the DOM, or we can just query it from the created element.
    setTimeout(() => {
        const saveBtn = document.getElementById('loc-save');
        if (saveBtn) {
            saveBtn.onclick = () => {
                const lat = parseFloat(document.getElementById('loc-lat').value);
                const lon = parseFloat(document.getElementById('loc-lon').value);
                if (!isNaN(lat) && !isNaN(lon)) {
                    userLocation = { latitude: lat, longitude: lon };
                    storage.set('location', userLocation);
                    render();
                }
            };
        }
    }, 0);

    controls.appendChild(locDropdown);
    controls.appendChild(themeBtn);
    
    header.appendChild(title);
    header.appendChild(controls);
    app.appendChild(header);

    // Global Settings Bar
    const globalSettings = document.createElement('div');
    globalSettings.className = `astro-card mb-6 p-4`;
    
    let gData = {
        F: storage.get('F', 1000),
        A: storage.get('A', 200),
        B: storage.get('B', 1),
        e: storage.get('e', 25),
        p: storage.get('p', 4.3),
        w: storage.get('w', 22.3)
    };

    const updateGlobal = (key, val) => {
        gData[key] = val;
        storage.set(key, val);
        window.dispatchEvent(new CustomEvent('astro-settings-changed', { detail: gData }));
    };

    globalSettings.innerHTML = `
        <div class="flex items-center gap-2 mb-3 ${isNightMode ? 'text-red-500' : 'text-blue-300'} font-bold uppercase tracking-wider text-xs">
            Globális Távcső Beállítások
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div>
                <label class="astro-label">Fókusz (F) mm</label>
                <input type="number" id="g-F" value="${gData.F}" class="astro-input">
            </div>
            <div>
                <label class="astro-label">Apertúra (A) mm</label>
                <input type="number" id="g-A" value="${gData.A}" class="astro-input">
            </div>
            <div>
                <label class="astro-label">Barlow (B) x</label>
                <input type="number" id="g-B" value="${gData.B}" class="astro-input" step="0.1">
            </div>
            <div>
                <label class="astro-label">Okulár (e) mm</label>
                <input type="number" id="g-e" value="${gData.e}" class="astro-input" step="0.1">
            </div>
            <div>
                <label class="astro-label">Pixel (p) µm</label>
                <input type="number" id="g-p" value="${gData.p}" class="astro-input" step="0.1">
            </div>
            <div>
                <label class="astro-label">Szenzor W (w) mm</label>
                <input type="number" id="g-w" value="${gData.w}" class="astro-input" step="0.1">
            </div>
        </div>
    `;

    globalSettings.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', (e) => {
            const key = e.target.id.split('-')[1];
            updateGlobal(key, parseFloat(e.target.value) || 0);
        });
    });

    app.appendChild(globalSettings);

    // Navigation
    const nav = document.createElement('nav');
    nav.className = "flex gap-2 mb-6 overflow-x-auto no-scrollbar border-b border-white/10 pb-2";
    
    const tabs = [
        { id: 'dashboard', label: 'Műszerfal' },
        { id: 'calculator', label: 'Kalkulátorok' }
    ];

    tabs.forEach(tab => {
        const btn = document.createElement('button');
        const isActive = activeTab === tab.id;
        btn.className = `px-4 py-2 rounded-t-lg font-bold text-sm uppercase tracking-wider transition-all ${isActive ? (isNightMode ? 'bg-red-900/30 text-red-500 border-b-2 border-red-500' : 'bg-blue-900/30 text-white border-b-2 border-blue-400') : 'text-white/50 hover:text-white/80'}`;
        btn.textContent = tab.label;
        btn.onclick = () => {
            activeTab = tab.id;
            storage.set('activeTab', activeTab);
            render();
        };
        nav.appendChild(btn);
    });
    app.appendChild(nav);

    // Content
    const content = document.createElement('main');
    
    if (activeTab === 'dashboard') {
        const now = TimeService.now();
        const sunData = SunCalc.getTimes(now, userLocation.latitude, userLocation.longitude);
        const moonData = SunCalc.getMoonIllumination(now);
        const moonPos = SunCalc.getMoonPosition(now, userLocation.latitude, userLocation.longitude);
        
        content.appendChild(createDashboard(userLocation, sunData, { ...moonData, ...moonPos }, isNightMode));
    } else if (activeTab === 'calculator') {
        content.appendChild(createCalculator(isNightMode));
    }

    app.appendChild(content);
}

// Initialize
async function init() {
    await TimeService.sync();
    
    // Try to get location if not set
    if (!storage.get('location')) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    userLocation = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
                    storage.set('location', userLocation);
                    render();
                },
                (err) => console.warn('Geolocation failed', err)
            );
        }
    }
    
    render();
}

init();
