import { SunIcon, MoonIcon, GlobeIcon, InfoIcon } from './icons.js';
import { storage, TimeService, showInfoModal, createInfoBtn } from './utils.js';
import { createDashboard } from './dashboard.js';
import { createCalculator } from './calculator/index.js';
import { createCatalog } from './components/catalog.js';
import { createDropdown } from './components/dropdown.js';

const app = document.getElementById('app');
let isNightMode = storage.get('nightMode', false);
let activeTab = storage.get('activeTab', 'dashboard');
let userLocation = storage.get('location', { latitude: 47.4979, longitude: 19.0402 }); // Default Budapest

window.showInfo = (title, content) => showInfoModal(title, content, isNightMode);

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
    title.className = `text-2xl font-black tracking-tighter uppercase ${isNightMode ? 'text-red-500' : 'text-white'}`;
    title.textContent = "AstroTool";
    
    const controls = document.createElement('div');
    controls.className = "flex gap-2 items-center";

    // Wiki Button
    const wikiBtn = document.createElement('button');
    wikiBtn.className = `p-2 rounded astro-card hover:bg-opacity-80 transition-all ${isNightMode ? 'text-red-500' : 'text-white'}`;
    wikiBtn.innerHTML = InfoIcon("w-5 h-5");
    wikiBtn.title = "Információ & Wiki";
    wikiBtn.onclick = () => showWiki();

    // Theme Toggle
    const themeBtn = document.createElement('button');
    themeBtn.className = `px-4 py-2 rounded astro-card font-bold text-xs uppercase tracking-wider hover:bg-opacity-80 transition-all ${isNightMode ? 'text-red-500' : 'text-white'}`;
    themeBtn.textContent = isNightMode ? 'Nappali Mód' : 'Éjszakai Mód';
    themeBtn.onclick = () => {
        isNightMode = !isNightMode;
        storage.set('nightMode', isNightMode);
        render();
    };

    controls.appendChild(wikiBtn);
    controls.appendChild(themeBtn);
    
    header.appendChild(title);
    header.appendChild(controls);
    app.appendChild(header);

    // Global Settings Bar (Only on Calculator tab)
    if (activeTab === 'calculator') {
        const globalSettings = document.createElement('div');
        globalSettings.className = `astro-card mb-4 p-3 animate-fade-in`;
        
        let gData = {
            F: storage.get('F', 1000),
            A: storage.get('A', 200),
            B: storage.get('B', 1)
        };

        const updateGlobal = (key, val) => {
            gData[key] = val;
            storage.set(key, val);
            window.dispatchEvent(new CustomEvent('astro-settings-changed', { detail: gData }));
        };

        globalSettings.innerHTML = `
            <div class="flex items-center gap-2 mb-2 ${isNightMode ? 'text-red-500' : 'text-blue-300'} font-bold uppercase tracking-wider text-[10px]">
                Globális Paraméterek
            </div>
            <div class="grid grid-cols-3 gap-2">
                <div>
                    <label class="astro-label text-[9px] block truncate">Fókusztávolság (mm) ${createInfoBtn('Távcső Fókusztávolsága', 'A távcső objektívjének vagy főtükrének fókusztávolsága milliméterben (F).')}</label>
                    <input type="number" id="g-F" value="${gData.F}" class="astro-input p-1 text-xs w-full">
                </div>
                <div>
                    <label class="astro-label text-[9px] block truncate">Apertúra (mm) ${createInfoBtn('Távcső Apertúrája', 'A távcső objektívjének vagy főtükrének átmérője milliméterben (A).')}</label>
                    <input type="number" id="g-A" value="${gData.A}" class="astro-input p-1 text-xs w-full">
                </div>
                <div>
                    <label class="astro-label text-[9px] block truncate">Barlow / Reducer (x) ${createInfoBtn('Barlow vagy Reducer', 'A fókusznyújtó vagy fókuszcsökkentő szorzója (B).')}</label>
                    <input type="number" id="g-B" value="${gData.B}" class="astro-input p-1 text-xs w-full" step="0.1">
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
    }

    // Navigation
    const nav = document.createElement('nav');
    nav.className = "flex gap-2 mb-6 overflow-x-auto no-scrollbar border-b border-white/10 pb-2";
    
    const tabs = [
        { id: 'dashboard', label: 'Műszerfal' },
        { id: 'calculator', label: 'Kalkulátorok' },
        { id: 'catalog', label: 'Katalógus' }
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
        const sunCalc = window.SunCalc || { getTimes: () => ({}), getMoonIllumination: () => ({}), getMoonPosition: () => ({}) };
        const sunData = sunCalc.getTimes(now, userLocation.latitude, userLocation.longitude);
        const moonData = sunCalc.getMoonIllumination(now);
        const moonPos = sunCalc.getMoonPosition(now, userLocation.latitude, userLocation.longitude);
        
        content.appendChild(createDashboard(userLocation, sunData, { ...moonData, ...moonPos }, isNightMode));
    } else if (activeTab === 'calculator') {
        content.appendChild(createCalculator(isNightMode));
    } else if (activeTab === 'catalog') {
        content.appendChild(createCatalog(isNightMode));
    }

    app.appendChild(content);

    // Footer
    const footer = document.createElement('footer');
    footer.className = "mt-12 py-6 border-t border-white/10 text-center opacity-40 text-[10px] uppercase tracking-widest";
    footer.innerHTML = `&copy; ${new Date().getFullYear()} AstroTool • Minden jog fenntartva`;
    app.appendChild(footer);
}

function showWiki() {
    const content = `
        <div class="space-y-4">
            <p>Az <b>AstroTool</b> egy amatőrcsillagászok számára készült segédeszköz, amely segít a megfigyelések tervezésében és a technikai számításokban.</p>
            
            <section>
                <h4 class="font-bold text-xs uppercase mb-1">Funkciók:</h4>
                <ul class="list-disc list-inside space-y-1">
                    <li><b>Műszerfal:</b> Valós idejű Nap és Hold adatok, analemma és katalógus kereső.</li>
                    <li><b>Kalkulátorok:</b> Távcső, okulár és asztrofotós paraméterek számítása.</li>
                    <li><b>Katalógus:</b> Messier, Melotte és NGC objektumok adatbázisa.</li>
                </ul>
            </section>

            <section class="border-t border-white/10 pt-3">
                <h4 class="font-bold text-xs uppercase mb-2">Egyedi Helyzet:</h4>
                <p class="mb-2">Ha az automatikus helymeghatározás nem megfelelő, itt megadhatod manuálisan:</p>
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="astro-label">Lat</label>
                        <input type="number" id="wiki-lat" value="${userLocation.latitude}" step="0.0001" class="astro-input">
                    </div>
                    <div>
                        <label class="astro-label">Lon</label>
                        <input type="number" id="wiki-lon" value="${userLocation.longitude}" step="0.0001" class="astro-input">
                    </div>
                </div>
                <button id="wiki-save-loc" class="w-full mt-2 px-4 py-2 rounded bg-blue-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-700 transition-all ${isNightMode ? 'bg-red-900 hover:bg-red-800 text-red-500' : ''}">
                    Helyzet Mentése
                </button>
            </section>

            <section class="border-t border-white/10 pt-3">
                <h4 class="font-bold text-xs uppercase mb-1">Támogatás:</h4>
                <p>Hamarosan...</p>
            </section>
        </div>
    `;
    showInfoModal('AstroTool Wiki', content, isNightMode);
    
    // Attach save listener
    setTimeout(() => {
        const btn = document.getElementById('wiki-save-loc');
        if (btn) {
            btn.onclick = () => {
                const lat = parseFloat(document.getElementById('wiki-lat').value);
                const lon = parseFloat(document.getElementById('wiki-lon').value);
                if (!isNaN(lat) && !isNaN(lon)) {
                    userLocation = { latitude: lat, longitude: lon };
                    storage.set('location', userLocation);
                    const modal = document.getElementById('info-modal');
                    if (modal) modal.remove();
                    render();
                }
            };
        }
    }, 0);
}

// Initialize
async function init() {
    await TimeService.sync();
    
    // Try to get location if not set
    if (!storage.get('location')) {
        showInfoModal('Helymeghatározás', `
            <div class="space-y-3">
                <p>Az AstroTool-nak szüksége van a földrajzi helyzetedre a pontos Nap és Hold adatok kiszámításához.</p>
                <p>Kérlek, engedélyezd a hozzáférést a következő ablakban!</p>
                <button id="allow-geo" class="w-full px-4 py-2 rounded bg-blue-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-700 transition-all ${isNightMode ? 'bg-red-900 hover:bg-red-800 text-red-500' : ''}">
                    Értettem, engedélyezem
                </button>
            </div>
        `, isNightMode);

        document.getElementById('allow-geo').onclick = () => {
            const modal = document.getElementById('info-modal');
            if (modal) modal.remove();
            
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        userLocation = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
                        storage.set('location', userLocation);
                        render();
                    },
                    (err) => {
                        console.warn('Geolocation failed', err);
                        render(); // Fallback to default
                    },
                    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
                );
            } else {
                render();
            }
        };
    } else {
        render();
    }
}

init();
