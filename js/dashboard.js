import { SunIcon, MoonIcon, GlobeIcon } from './icons.js';
import { formatTime, formatDate, formatNum, TimeService } from './utils.js';
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
    
    // Sun distance and size
    const sunDistKm = 149597870.7; // Approx 1 AU
    const sunSizeDeg = 0.533; // Approx
    
    // Ecliptic longitude approximation
    const daysSinceJ2000 = (TimeService.now().getTime() - new Date('2000-01-01T12:00:00Z').getTime()) / 86400000;
    const meanAnomaly = (357.529 + 0.98560028 * daysSinceJ2000) % 360;
    const equationOfCenter = 1.9148 * Math.sin(meanAnomaly * Math.PI / 180) + 0.02 * Math.sin(2 * meanAnomaly * Math.PI / 180);
    const eclipticLong = (280.466 + 0.98564736 * daysSinceJ2000 + equationOfCenter) % 360;

    sunCard.innerHTML = `
        <div>
            <div class="flex items-center gap-2 mb-4 ${headerColor} font-bold uppercase tracking-wider text-xs">
                ${SunIcon("w-4 h-4")} Nap Adatok
            </div>
            <div class="space-y-3">
                <div class="flex justify-between items-center border-b border-white/5 pb-2">
                    <span class="astro-label mb-0">Napkelte / Napnyugta</span>
                    <span class="font-mono font-bold ${valueColor}">${sunrise} / ${sunset}</span>
                </div>
                <div class="flex justify-between items-center border-b border-white/5 pb-2">
                    <span class="astro-label mb-0">Delelés / Nadir</span>
                    <span class="font-mono font-bold ${valueColor}">${solarNoon} / ${nadir}</span>
                </div>
                <div class="flex justify-between items-center border-b border-white/5 pb-2">
                    <span class="astro-label mb-0">Távolság / Látszó méret</span>
                    <span class="font-mono font-bold ${valueColor}">${formatNum(sunDistKm)} km / ${sunSizeDeg.toFixed(2)}°</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="astro-label mb-0">Ekliptikai hosszúság</span>
                    <span class="font-mono font-bold ${valueColor}">${(eclipticLong < 0 ? eclipticLong + 360 : eclipticLong).toFixed(2)}°</span>
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
    
    const moonTimes = window.SunCalc ? window.SunCalc.getMoonTimes(TimeService.now(), location.latitude, location.longitude) : { rise: null, set: null };
    const moonRise = moonTimes.rise ? formatTime(moonTimes.rise) : '-';
    const moonSet = moonTimes.set ? formatTime(moonTimes.set) : '-';
    
    // Moon transit (meridian)
    const moonTransit = moonTimes.main ? formatTime(moonTimes.main) : (moonTimes.transit ? formatTime(moonTimes.transit) : '-');

    const moonPos = window.SunCalc ? window.SunCalc.getMoonPosition(TimeService.now(), location.latitude, location.longitude) : { distance: 384400 };
    const moonDistKm = moonPos.distance; // SunCalc.getMoonPosition returns distance in km
    const moonSizeDeg = (3474 / moonDistKm) * (180 / Math.PI); // Simplified angular size
    
    // Elongation
    const elongation = moonData.phase * 360;

    // Find next major phases
    const getNextPhases = (count = 4) => {
        const now = TimeService.now();
        const sc = window.SunCalc;
        if (!sc) return [];
        
        const targets = [0, 0.25, 0.5, 0.75];
        const targetNames = ["Újhold", "Első Negyed", "Telihold", "Utolsó Negyed"];
        
        const results = [];
        let searchDate = new Date(now.getTime());
        
        // Find the very next phase first
        let firstPhase = null;
        let minDiff = Infinity;
        
        for (let i = 0; i < 30; i++) {
            const d = new Date(now.getTime() + i * 86400000);
            for (let h = 0; h < 24; h++) {
                const dh = new Date(d.getTime() + h * 3600000);
                if (dh <= now) continue;
                const ph = sc.getMoonIllumination(dh).phase;
                for (let j = 0; j < 4; j++) {
                    const diff = Math.abs(ph - targets[j]);
                    if (diff < 0.005) {
                        firstPhase = { name: targetNames[j], date: dh, targetIdx: j };
                        break;
                    }
                }
                if (firstPhase) break;
            }
            if (firstPhase) break;
        }

        if (!firstPhase) return [];

        results.push(firstPhase);
        
        // Now find the next 3 in sequence
        let currentIdx = firstPhase.targetIdx;
        let lastDate = firstPhase.date;

        for (let k = 1; k < count; k++) {
            currentIdx = (currentIdx + 1) % 4;
            const targetP = targets[currentIdx];
            
            // Search starting from last found date
            let found = false;
            for (let i = 1; i < 15; i++) { // Next phase is roughly 7 days away
                const d = new Date(lastDate.getTime() + i * 86400000);
                for (let h = 0; h < 24; h++) {
                    const dh = new Date(d.getTime() + h * 3600000);
                    const ph = sc.getMoonIllumination(dh).phase;
                    if (Math.abs(ph - targetP) < 0.005) {
                        results.push({ name: targetNames[currentIdx], date: dh });
                        lastDate = dh;
                        found = true;
                        break;
                    }
                }
                if (found) break;
            }
        }
        
        return results;
    };

    const nextPhases = getNextPhases(4);
    const nextPhase = nextPhases[0];
    const nextPhaseStr = nextPhase ? `${nextPhase.name}: ${formatDate(nextPhase.date)}` : '';
    
    const morePhasesContent = nextPhases.map(p => `
        <div class="flex justify-between border-b border-white/5 py-2">
            <span class="font-bold">${p.name}</span>
            <span class="font-mono text-xs">${formatDate(p.date)} ${formatTime(p.date)}</span>
        </div>
    `).join('');

    window.showMorePhases = () => {
        window.showInfo('Következő Holdfázisok', `<div class="space-y-1">${morePhasesContent}</div>`);
    };

    moonCard.innerHTML = `
        <div>
            <div class="flex items-center gap-2 mb-2 ${headerColor} font-bold uppercase tracking-wider text-xs">
                ${MoonIcon("w-4 h-4")} Hold Adatok
            </div>
            <div class="flex justify-between items-center mb-4">
                <div class="w-1/3">
                    <div class="flex justify-center my-2">
                        ${renderMoonPhaseIcon(moonData.fraction, isWaxing, isNightMode)}
                    </div>
                    <div class="text-center font-bold uppercase tracking-widest text-[10px] ${valueColor}">
                        ${phaseName}
                    </div>
                </div>
                <div class="w-2/3 pl-4 grid grid-cols-2 gap-2">
                    <div>
                        <div class="astro-label">Kel / Nyug</div>
                        <div class="font-mono font-bold text-xs ${valueColor}">${moonRise} / ${moonSet}</div>
                    </div>
                    <div>
                        <div class="astro-label">Delelés</div>
                        <div class="font-mono font-bold text-xs ${valueColor}">${moonTransit}</div>
                    </div>
                    <div>
                        <div class="astro-label">Megvilágítás</div>
                        <div class="font-mono font-bold text-xs ${valueColor}">${illumPercent}%</div>
                    </div>
                    <div>
                        <div class="astro-label">Távolság ${createInfoBtn('Hold Távolság', 'A Hold aktuális távolsága a Föld középpontjától. Perigeum (közelpont): ~356,400 km. Apogeum (távolpont): ~406,700 km.')}</div>
                        <div class="font-mono font-bold text-xs ${valueColor}">${formatNum(moonDistKm)} km</div>
                    </div>
                </div>
            </div>
            <div class="border-t border-white/5 pt-2 mt-2">
                <div class="flex justify-between items-center">
                    <span class="astro-label mb-0">Következő esemény</span>
                    <button onclick="window.showMorePhases()" class="font-mono font-bold text-[10px] ${valueColor} hover:underline decoration-dotted underline-offset-2">${nextPhaseStr} ▾</button>
                </div>
                <div class="flex justify-between items-center mt-1">
                    <span class="astro-label mb-0">Elongáció / Méret</span>
                    <span class="font-mono font-bold text-[10px] ${valueColor}">${elongation.toFixed(1)}° / ${moonSizeDeg.toFixed(2)}°</span>
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
