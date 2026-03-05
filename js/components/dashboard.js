
import { SunIcon, MoonIcon, ChevronDownIcon, ChevronUpIcon, MoonPhaseIcon } from '../icons.js';
import { formatTime } from '../utils.js';

export function createDashboard(location, sunData, moonData, isNightMode) {
    const container = document.createElement('div');
    container.className = "space-y-4";

    let activeSection = 'sun'; // 'sun' or 'moon'
    let monthlyAvgOpen = false;
    let solarActivityOpen = false;

    // Helper to create data row
    const createDataRow = (label, value) => `
        <div class="flex justify-between items-center text-xs">
            <span class="${isNightMode ? 'text-red-800' : 'text-slate-500'} font-medium uppercase tracking-wider text-[10px]">${label}</span>
            <span class="${isNightMode ? 'text-red-500' : 'text-slate-700'} font-mono font-bold">${value}</span>
        </div>
    `;

    // Render Function
    function render() {
        container.innerHTML = '';

        const cardBg = isNightMode ? 'bg-black/40 border-red-900/30' : 'bg-white/60 border-white/40 shadow-sm';
        const dropdownBg = isNightMode ? 'bg-red-950/20' : 'bg-slate-100/50';

        // Headers Grid
        const headersGrid = document.createElement('div');
        headersGrid.className = "grid grid-cols-2 gap-4";

        // Sun Header
        const sunHeader = document.createElement('div');
        sunHeader.className = "flex items-center justify-between px-2 cursor-pointer";
        sunHeader.innerHTML = `
            <div class="p-2 rounded-full ${isNightMode ? 'bg-red-950/30 text-red-600' : 'bg-yellow-500/20 text-yellow-500'}">
                ${SunIcon("w-6 h-6")}
            </div>
            <button class="p-1 rounded border transition-all ${isNightMode ? 'border-red-900 text-red-800 hover:bg-red-950/20' : 'border-blue-800 text-blue-400 hover:bg-blue-900/20'}">
                ${activeSection === 'sun' ? ChevronUpIcon("w-4 h-4") : ChevronDownIcon("w-4 h-4")}
            </button>
        `;
        sunHeader.onclick = () => {
            activeSection = activeSection === 'sun' ? null : 'sun';
            render();
        };

        // Moon Header
        const moonHeader = document.createElement('div');
        moonHeader.className = "flex items-center justify-between px-2 cursor-pointer";
        moonHeader.innerHTML = `
            <div class="p-2 rounded-full ${isNightMode ? 'bg-red-950/30 text-red-900' : 'bg-slate-400/20 text-slate-400'}">
                ${MoonIcon("w-6 h-6")}
            </div>
            <button class="p-1 rounded border transition-all ${isNightMode ? 'border-red-900 text-red-800 hover:bg-red-950/20' : 'border-blue-800 text-blue-400 hover:bg-blue-900/20'}">
                ${activeSection === 'moon' ? ChevronUpIcon("w-4 h-4") : ChevronDownIcon("w-4 h-4")}
            </button>
        `;
        moonHeader.onclick = () => {
            activeSection = activeSection === 'moon' ? null : 'moon';
            render();
        };

        headersGrid.appendChild(sunHeader);
        headersGrid.appendChild(moonHeader);
        container.appendChild(headersGrid);

        // Content Area
        const contentArea = document.createElement('div');
        contentArea.className = "w-full";

        if (activeSection === 'sun') {
            const sunContent = document.createElement('div');
            sunContent.className = `p-3 rounded border ${cardBg} animate-slide-down space-y-3 w-full`;
            
            if (location && sunData) {
                sunContent.innerHTML = `
                    <div class="space-y-0.5">
                        ${createDataRow("Első fények", formatTime(sunData.dawn))}
                        ${createDataRow("Napkelte", formatTime(sunData.sunrise))}
                        ${createDataRow("Delel", formatTime(sunData.solarNoon))}
                        ${createDataRow("Napnyugta", formatTime(sunData.sunset))}
                        ${createDataRow("Utolsó fények", formatTime(sunData.dusk))}
                        <div class="my-2 border-t border-current opacity-20"></div>
                        ${createDataRow("Nappal hossza", sunData.daylightDuration)}
                        ${createDataRow("Hátralévő fény", sunData.remainingDaylight)}
                    </div>
                `;

                // Monthly Averages
                const monthlyDiv = document.createElement('div');
                monthlyDiv.className = `rounded ${dropdownBg}`;
                monthlyDiv.innerHTML = `
                    <button id="monthly-btn" class="w-full p-2 text-[10px] font-bold uppercase flex justify-between items-center ${isNightMode ? 'text-red-700' : 'text-blue-300'}">
                        Havi Átlagok
                        ${monthlyAvgOpen ? ChevronUpIcon("w-3 h-3") : ChevronDownIcon("w-3 h-3")}
                    </button>
                    ${monthlyAvgOpen ? `
                        <div class="p-2 space-y-1">
                            ${getMonthlyAverages(location).map(m => `
                                <div class="flex justify-between text-[9px] opacity-80">
                                    <span class="w-20">${m.month}</span>
                                    <span class="text-right">${m.sunrise} - ${m.sunset}</span>
                                    <span>(${m.duration})</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                `;
                monthlyDiv.querySelector('#monthly-btn').onclick = () => {
                    monthlyAvgOpen = !monthlyAvgOpen;
                    render();
                };
                sunContent.appendChild(monthlyDiv);

                // Solar Activity
                const solarDiv = document.createElement('div');
                solarDiv.className = `rounded ${dropdownBg}`;
                solarDiv.innerHTML = `
                    <button id="solar-btn" class="w-full p-2 text-[10px] font-bold uppercase flex justify-between items-center ${isNightMode ? 'text-red-700' : 'text-blue-300'}">
                        Naptevékenység
                        ${solarActivityOpen ? ChevronUpIcon("w-3 h-3") : ChevronDownIcon("w-3 h-3")}
                    </button>
                    ${solarActivityOpen ? `
                        <div class="p-2 text-[10px] space-y-2">
                            ${createDataRow("Ciklus", "25. napciklus")}
                            ${createDataRow("Maximum", "2025 (várható)")}
                            ${createDataRow("Aktivitás", "Magas")}
                            <p class="opacity-60 italic mt-1">A naptevékenység jelenleg a maximuma felé közelít, gyakori flerekkel és napfoltokkal.</p>
                        </div>
                    ` : ''}
                `;
                solarDiv.querySelector('#solar-btn').onclick = () => {
                    solarActivityOpen = !solarActivityOpen;
                    render();
                };
                sunContent.appendChild(solarDiv);

            } else {
                sunContent.innerHTML = `<p class="text-[10px] opacity-50 text-center">Nincs adat</p>`;
            }
            contentArea.appendChild(sunContent);
        } else if (activeSection === 'moon') {
            const moonContent = document.createElement('div');
            moonContent.className = `p-3 rounded border ${cardBg} animate-slide-down w-full`;
            
            if (location && moonData) {
                // Moon Phase Name
                const phaseName = getMoonPhaseName(moonData.phase);
                
                moonContent.innerHTML = `
                    <div class="space-y-0.5">
                        ${createDataRow("Kelte", formatTime(moonData.rise))}
                        ${createDataRow("Nyugta", formatTime(moonData.set))}
                        ${createDataRow("Fény", `${(moonData.fraction * 100).toFixed(1)}%`)}
                        ${createDataRow("Távolság", `${Math.round(moonData.distance).toLocaleString()} km`)}
                        ${createDataRow("Kor", `${moonData.age.toFixed(1)} nap`)}
                        
                        <div class="flex justify-center my-4 text-${isNightMode ? 'red-500' : 'yellow-500'}">
                            ${MoonPhaseIcon(moonData.phase, isNightMode)}
                        </div>
                        <div class="text-center font-bold uppercase tracking-widest text-xs ${isNightMode ? 'text-red-500' : 'text-blue-200'}">
                            ${phaseName}
                        </div>
                    </div>
                `;
            } else {
                moonContent.innerHTML = `<p class="text-[10px] opacity-50 text-center">Nincs adat</p>`;
            }
            contentArea.appendChild(moonContent);
        }

        container.appendChild(contentArea);
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
