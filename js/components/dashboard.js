
import { SunIcon, MoonIcon, ChevronDownIcon, ChevronUpIcon, MoonPhaseIcon, GlobeIcon } from '../icons.js';
import { formatTime, formatDate } from '../utils.js';
import { createAnalemma } from './analemma.js';

export function createDashboard(location, sunData, moonData, isNightMode) {
    const container = document.createElement('div');
    container.className = "space-y-6";

    let activeSection = 'sun'; // 'sun' or 'moon'
    let analemmaOpen = false;
    let monthlyAvgOpen = false;
    let solarActivityOpen = false;

    // Helper to create data row
    const createDataRow = (label, value) => `
        <div class="flex justify-between items-center text-xs py-1 border-b border-current/5 last:border-0">
            <span class="${isNightMode ? 'text-red-800' : 'text-slate-600'} font-bold uppercase tracking-wider text-[10px]">${label}</span>
            <span class="${isNightMode ? 'text-red-500' : 'text-slate-900'} font-mono font-bold">${value}</span>
        </div>
    `;

    // Render Function
    function render() {
        container.innerHTML = '';

        const cardBg = isNightMode ? 'bg-black/40 border-red-900/30' : 'bg-white border-slate-300 shadow-md';
        const dropdownBg = isNightMode ? 'bg-red-950/20' : 'bg-slate-50 border border-slate-200';
        const headerText = isNightMode ? 'text-red-600' : 'text-slate-800';

        // 1. Info Header (GPS, Time)
        const infoHeader = document.createElement('div');
        infoHeader.className = `p-3 rounded-lg border flex justify-between items-center text-xs ${cardBg}`;
        
        const now = new Date();
        const utc = `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}`;
        const local = formatTime(now);
        const lat = location.latitude.toFixed(4);
        const lon = location.longitude.toFixed(4);

        infoHeader.innerHTML = `
            <div class="flex flex-col gap-1">
                <div class="flex items-center gap-1 font-bold ${headerText}">
                    ${GlobeIcon("w-3 h-3")}
                    <span>${lat}, ${lon}</span>
                </div>
                <div class="opacity-60 text-[10px] uppercase tracking-wider">GPS Koordináták</div>
            </div>
            <div class="text-right flex flex-col gap-1">
                <div class="font-mono font-bold ${headerText}">Helyi: ${local}</div>
                <div class="font-mono opacity-60 text-[10px]">UTC: ${utc}</div>
            </div>
        `;
        container.appendChild(infoHeader);

        // 3. Sun & Moon Grid
        const headersGrid = document.createElement('div');
        headersGrid.className = "grid grid-cols-2 gap-4";

        // Sun Header
        const sunHeader = document.createElement('div');
        sunHeader.className = `flex items-center justify-between px-3 py-2 rounded-t-lg cursor-pointer transition-colors ${activeSection === 'sun' ? (isNightMode ? 'bg-red-950/30 border-b-2 border-red-600' : 'bg-yellow-50 border-b-2 border-yellow-500') : 'opacity-50 hover:opacity-100'}`;
        sunHeader.innerHTML = `
            <div class="flex items-center gap-2 ${isNightMode ? 'text-red-600' : 'text-yellow-600'}">
                ${SunIcon("w-5 h-5")}
                <span class="font-bold uppercase text-xs">Nap</span>
            </div>
        `;
        sunHeader.onclick = () => { activeSection = 'sun'; render(); };

        // Moon Header
        const moonHeader = document.createElement('div');
        moonHeader.className = `flex items-center justify-between px-3 py-2 rounded-t-lg cursor-pointer transition-colors ${activeSection === 'moon' ? (isNightMode ? 'bg-red-950/30 border-b-2 border-red-600' : 'bg-slate-100 border-b-2 border-slate-500') : 'opacity-50 hover:opacity-100'}`;
        moonHeader.innerHTML = `
            <div class="flex items-center gap-2 ${isNightMode ? 'text-red-600' : 'text-slate-600'}">
                ${MoonIcon("w-5 h-5")}
                <span class="font-bold uppercase text-xs">Hold</span>
            </div>
        `;
        moonHeader.onclick = () => { activeSection = 'moon'; render(); };

        headersGrid.appendChild(sunHeader);
        headersGrid.appendChild(moonHeader);
        container.appendChild(headersGrid);

        // Content Area
        const contentArea = document.createElement('div');
        contentArea.className = `p-4 rounded-b-lg border-x border-b -mt-4 pt-6 ${cardBg}`;

        if (activeSection === 'sun') {
            if (location && sunData) {
                contentArea.innerHTML = `
                    <div class="space-y-1">
                        ${createDataRow("Első fények", formatTime(sunData.dawn))}
                        ${createDataRow("Napkelte", formatTime(sunData.sunrise))}
                        ${createDataRow("Delel", formatTime(sunData.solarNoon))}
                        ${createDataRow("Napnyugta", formatTime(sunData.sunset))}
                        ${createDataRow("Utolsó fények", formatTime(sunData.dusk))}
                        <div class="my-3 border-t border-current opacity-20"></div>
                        ${createDataRow("Nappal hossza", sunData.daylightDuration)}
                        ${createDataRow("Hátralévő fény", sunData.remainingDaylight)}
                    </div>
                `;

                // Monthly Averages
                const monthlyDiv = document.createElement('div');
                monthlyDiv.className = `mt-4 rounded ${dropdownBg}`;
                monthlyDiv.innerHTML = `
                    <button id="monthly-btn" class="w-full p-2 text-[10px] font-bold uppercase flex justify-between items-center ${isNightMode ? 'text-red-700' : 'text-slate-600 hover:bg-slate-200'} transition-colors rounded">
                        Havi Átlagok
                        ${monthlyAvgOpen ? ChevronUpIcon("w-3 h-3") : ChevronDownIcon("w-3 h-3")}
                    </button>
                    ${monthlyAvgOpen ? `
                        <div class="p-2 space-y-1 border-t border-current/10">
                            ${getMonthlyAverages(location).map(m => `
                                <div class="flex justify-between text-[9px] opacity-80">
                                    <span class="w-20 font-bold">${m.month}</span>
                                    <span class="text-right font-mono">${m.sunrise} - ${m.sunset}</span>
                                    <span class="font-mono">(${m.duration})</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                `;
                monthlyDiv.querySelector('#monthly-btn').onclick = () => {
                    monthlyAvgOpen = !monthlyAvgOpen;
                    render();
                };
                contentArea.appendChild(monthlyDiv);

            } else {
                contentArea.innerHTML = `<p class="text-[10px] opacity-50 text-center">Nincs adat</p>`;
            }
        } else if (activeSection === 'moon') {
            if (location && moonData) {
                const phaseName = getMoonPhaseName(moonData.phase);
                
                contentArea.innerHTML = `
                    <div class="space-y-1">
                        ${createDataRow("Kelte", formatTime(moonData.rise))}
                        ${createDataRow("Nyugta", formatTime(moonData.set))}
                        ${createDataRow("Fény", `${(moonData.fraction * 100).toFixed(1)}%`)}
                        ${createDataRow("Távolság", `${Math.round(moonData.distance).toLocaleString()} km`)}
                        ${createDataRow("Kor", `${moonData.age.toFixed(1)} nap`)}
                        
                        <div class="flex justify-center my-6 text-${isNightMode ? 'red-500' : 'yellow-500'} filter drop-shadow-lg">
                            ${MoonPhaseIcon(moonData.phase, isNightMode)}
                        </div>
                        <div class="text-center font-bold uppercase tracking-widest text-sm ${isNightMode ? 'text-red-500' : 'text-slate-800'}">
                            ${phaseName}
                        </div>
                    </div>
                `;
            } else {
                contentArea.innerHTML = `<p class="text-[10px] opacity-50 text-center">Nincs adat</p>`;
            }
        }

        container.appendChild(contentArea);

        // 2. Analemma Widget (Collapsible) - Moved below Sun/Moon
        const analemmaWidget = document.createElement('div');
        analemmaWidget.className = `rounded-lg border overflow-hidden transition-all duration-300 ${isNightMode ? 'border-red-900/30' : 'border-blue-900/30'}`;
        
        // Header
        const analemmaHeader = document.createElement('div');
        analemmaHeader.className = `p-3 flex justify-between items-center cursor-pointer ${isNightMode ? 'bg-red-950/40 hover:bg-red-900/20' : 'bg-blue-900 text-white hover:bg-blue-800'}`;
        analemmaHeader.innerHTML = `
            <span class="font-bold uppercase tracking-widest text-xs">Analemma</span>
            ${analemmaOpen ? ChevronUpIcon("w-4 h-4") : ChevronDownIcon("w-4 h-4")}
        `;
        analemmaHeader.onclick = () => {
            analemmaOpen = !analemmaOpen;
            render();
        };
        analemmaWidget.appendChild(analemmaHeader);

        // Content
        if (analemmaOpen) {
            const analemmaContent = document.createElement('div');
            // Dark blue background requested for Analemma
            analemmaContent.className = "p-2 bg-[#0f172a]"; 
            analemmaContent.appendChild(createAnalemma(location, isNightMode));
            analemmaWidget.appendChild(analemmaContent);
        }
        container.appendChild(analemmaWidget);
    }

    render();
    return container;
}

// Helper for Monthly Averages
function getMonthlyAverages(location) {
    const averages = [];
    const year = new Date().getFullYear();
    const monthNames = ['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'];

    for (let m = 0; m < 12; m++) {
        const date = new Date(year, m, 15);
        const times = window.SunCalc.getTimes(date, location.latitude, location.longitude);
        
        const durationMs = times.sunset - times.sunrise;
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

        averages.push({
            month: monthNames[m],
            sunrise: formatTime(times.sunrise),
            sunset: formatTime(times.sunset),
            duration: `${hours}ó ${minutes}p`
        });
    }
    return averages;
}

function getMoonPhaseName(phase) {
    if (phase < 0.03 || phase > 0.97) return "Újhold";
    if (phase < 0.22) return "Növekvő Sarló";
    if (phase < 0.28) return "Első Negyed";
    if (phase < 0.47) return "Növekvő Hold";
    if (phase < 0.53) return "Telihold";
    if (phase < 0.72) return "Fogyó Hold";
    if (phase < 0.78) return "Utolsó Negyed";
    return "Fogyó Sarló";
}
