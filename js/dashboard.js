import { SunIcon, MoonIcon, GlobeIcon } from './icons.js';
import { formatTime, formatDate, TimeService } from './utils.js';
import { createAnalemma } from './components/analemma.js';
import { renderMoonPhaseIcon } from './components/moonphase.js';

export function createDashboard(location, sunData, moonData, isNightMode) {
    const container = document.createElement('div');
    container.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6";

    const cardClass = "astro-card flex flex-col justify-between";
    const headerColor = isNightMode ? "text-red-500" : "text-blue-300";
    const valueColor = isNightMode ? "text-red-400" : "text-white";

    // 1. Time & Location Card
    const timeCard = document.createElement('div');
    timeCard.className = cardClass;
    timeCard.id = "time-card";
    
    const lat = location.latitude;
    const lon = location.longitude;
    
    const toDMS = (deg) => {
        const d = Math.floor(Math.abs(deg));
        const minFloat = (Math.abs(deg) - d) * 60;
        const m = Math.floor(minFloat);
        const s = ((minFloat - m) * 60).toFixed(1);
        return `${d}° ${m}' ${s}"`;
    };

    const latStr = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'É' : 'D'}`;
    const lonStr = `${Math.abs(lon).toFixed(4)}° ${lon >= 0 ? 'K' : 'Ny'}`;
    const latDMS = `${toDMS(lat)} ${lat >= 0 ? 'É' : 'D'}`;
    const lonDMS = `${toDMS(lon)} ${lon >= 0 ? 'K' : 'Ny'}`;

    const updateTime = () => {
        const now = TimeService.now();
        const local = formatTime(now);
        const utc = now.toISOString().split('T')[1].split('.')[0];
        
        timeCard.innerHTML = `
            <div>
                <div class="flex items-center gap-2 mb-2 ${headerColor} font-bold uppercase tracking-wider text-xs">
                    ${GlobeIcon("w-4 h-4")} Helyzet & Idő
                </div>
                <div class="grid grid-cols-2 gap-2 text-sm mb-4">
                    <div>
                        <div class="astro-label">Szélesség</div>
                        <div class="font-mono font-bold text-lg ${valueColor}">${latStr}</div>
                        <div class="font-mono text-xs opacity-70">${latDMS}</div>
                    </div>
                    <div>
                        <div class="astro-label">Hosszúság</div>
                        <div class="font-mono font-bold text-lg ${valueColor}">${lonStr}</div>
                        <div class="font-mono text-xs opacity-70">${lonDMS}</div>
                    </div>
                </div>
            </div>
            <div class="border-t border-white/10 pt-3">
                <div class="flex justify-between items-end">
                    <div>
                        <div class="astro-label">Helyi Idő</div>
                        <div class="font-mono text-2xl font-bold ${valueColor}">${local}</div>
                    </div>
                    <div class="text-right">
                        <div class="astro-label">UTC</div>
                        <div class="font-mono text-sm opacity-70">${utc}</div>
                    </div>
                </div>
            </div>
        `;
    };
    updateTime();
    setInterval(updateTime, 1000); // 1 Hz update

    // 2. Sun Card
    const sunCard = document.createElement('div');
    sunCard.className = cardClass;
    
    const sunrise = formatTime(sunData.sunrise);
    const sunset = formatTime(sunData.sunset);
    const solarNoon = formatTime(sunData.solarNoon);
    const nadir = formatTime(sunData.nadir);

    sunCard.innerHTML = `
        <div>
            <div class="flex items-center gap-2 mb-4 ${headerColor} font-bold uppercase tracking-wider text-xs">
                ${SunIcon("w-4 h-4")} Nap Adatok
            </div>
            <div class="space-y-3">
                <div class="flex justify-between items-center border-b border-white/5 pb-2">
                    <span class="astro-label mb-0">Napkelte</span>
                    <span class="font-mono font-bold ${valueColor}">${sunrise}</span>
                </div>
                <div class="flex justify-between items-center border-b border-white/5 pb-2">
                    <span class="astro-label mb-0">Delelés</span>
                    <span class="font-mono font-bold ${valueColor}">${solarNoon}</span>
                </div>
                <div class="flex justify-between items-center border-b border-white/5 pb-2">
                    <span class="astro-label mb-0">Napnyugta</span>
                    <span class="font-mono font-bold ${valueColor}">${sunset}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="astro-label mb-0">Éjfél (Nadir)</span>
                    <span class="font-mono font-bold ${valueColor}">${nadir}</span>
                </div>
            </div>
        </div>
    `;

    // 3. Moon Card
    const moonCard = document.createElement('div');
    moonCard.className = cardClass;
    
    // Calculate phase name
    const phaseNames = [
        "Újhold", "Növekvő sarló", "Első negyed", "Növekvő hold",
        "Telihold", "Fogyó hold", "Utolsó negyed", "Fogyó sarló"
    ];
    const phaseIndex = Math.floor((moonData.phase + 0.0625) * 8) % 8;
    const phaseName = phaseNames[phaseIndex];
    
    const isWaxing = moonData.phase < 0.5;
    const illumPercent = (moonData.fraction * 100).toFixed(1);

    moonCard.innerHTML = `
        <div>
            <div class="flex items-center gap-2 mb-2 ${headerColor} font-bold uppercase tracking-wider text-xs">
                ${MoonIcon("w-4 h-4")} Hold Adatok
            </div>
            <div class="flex justify-between items-center">
                <div class="w-1/2">
                    <div class="flex justify-center my-4">
                        ${renderMoonPhaseIcon(moonData.fraction, isWaxing, isNightMode)}
                    </div>
                    <div class="text-center font-bold uppercase tracking-widest text-xs ${valueColor}">
                        ${phaseName}
                    </div>
                </div>
                <div class="w-1/2 pl-4 space-y-3">
                    <div>
                        <div class="astro-label">Megvilágítás</div>
                        <div class="font-mono font-bold text-lg ${valueColor}">${illumPercent}%</div>
                    </div>
                    <div>
                        <div class="astro-label">Kor</div>
                        <div class="font-mono font-bold ${valueColor}">${(moonData.phase * 29.53).toFixed(1)} nap</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    container.appendChild(timeCard);
    container.appendChild(sunCard);
    container.appendChild(moonCard);

    // Analemma Full Width
    const analemmaContainer = document.createElement('div');
    analemmaContainer.className = "astro-card col-span-1 md:col-span-2 lg:col-span-3 mt-4";
    analemmaContainer.innerHTML = `
        <div class="flex items-center gap-2 mb-4 ${headerColor} font-bold uppercase tracking-wider text-xs">
            Analemma (Éves Napút)
        </div>
    `;
    analemmaContainer.appendChild(createAnalemma(location, isNightMode));
    
    const wrapper = document.createElement('div');
    wrapper.appendChild(container);
    wrapper.appendChild(analemmaContainer);

    return wrapper;
}
