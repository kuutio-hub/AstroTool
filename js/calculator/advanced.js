import { TimeService, safeFixed } from '../utils.js';

export function renderAdvancedCalculators(globalParams, userLocation, isNightMode) {
    const container = document.createElement('div');
    container.className = 'space-y-2';
    
    const resultBoxClass = isNightMode ? 'bg-red-900/10 border-red-900/30' : 'bg-slate-50 border-slate-200';
    const mutedTextClass = isNightMode ? 'text-slate-400' : 'text-slate-600';

    // RA/DEC to Alt/Az
    container.appendChild(createAccordion('RA/DEC → Alt/Az', 'CompassIcon', `
        <div class="grid grid-cols-2 gap-3 mb-4">
            <div>
                <label class="astro-label">Rektaszcenzió (h)</label>
                <input type="number" inputmode="decimal" id="coord-ra" class="astro-input" value="12.0">
            </div>
            <div>
                <label class="astro-label">Deklináció (°)</label>
                <input type="number" inputmode="decimal" id="coord-dec" class="astro-input" value="45.0">
            </div>
        </div>
        <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="p-4 ${resultBoxClass} rounded-xl border">
                <div class="text-[10px] ${mutedTextClass} uppercase font-extrabold mb-1">Magasság (Alt)</div>
                <div class="text-xl font-mono" id="coord-alt">--</div>
            </div>
            <div class="p-4 ${resultBoxClass} rounded-xl border">
                <div class="text-[10px] ${mutedTextClass} uppercase font-extrabold mb-1">Azimut (Az)</div>
                <div class="text-xl font-mono" id="coord-az">--</div>
            </div>
        </div>
    `));

    // Timezones & LST
    container.appendChild(createAccordion('Időzónák & LST', 'ClockIcon', `
        <div class="p-4 ${resultBoxClass} rounded-xl border mb-3">
            <div class="text-[10px] ${mutedTextClass} uppercase font-extrabold mb-1">Helyi idő</div>
            <div class="text-xl font-mono" id="time-local">--</div>
        </div>
        <div class="p-4 ${resultBoxClass} rounded-xl border mb-3">
            <div class="text-[10px] ${mutedTextClass} uppercase font-extrabold mb-1">UTC (Világidő)</div>
            <div class="text-xl font-mono" id="time-utc">--</div>
        </div>
        <div class="p-4 ${resultBoxClass} rounded-xl border">
            <div class="text-[10px] ${mutedTextClass} uppercase font-extrabold mb-1">Helyi Sziderikus Idő (LST)</div>
            <div class="text-xl font-mono" id="time-lst">--</div>
        </div>
    `));

    // Sun/Moon Geometry
    container.appendChild(createAccordion('Nap/Hold Geometria', 'PlanetIcon', `
        <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="p-4 ${resultBoxClass} rounded-xl border">
                <div class="text-[10px] ${mutedTextClass} uppercase font-extrabold mb-1">Nap távolság (AU)</div>
                <div class="text-xl font-mono" id="geom-sun-dist">--</div>
            </div>
            <div class="p-4 ${resultBoxClass} rounded-xl border">
                <div class="text-[10px] ${mutedTextClass} uppercase font-extrabold mb-1">Hold távolság (km)</div>
                <div class="text-xl font-mono" id="geom-moon-dist">--</div>
            </div>
        </div>
    `));

    // Analemma
    container.appendChild(createAccordion('Analemma', 'ActivityIcon', `
        <div class="p-4 ${resultBoxClass} rounded-xl border">
            <div class="text-[10px] ${mutedTextClass} uppercase font-extrabold mb-1">Időegyenlet (EqT)</div>
            <div class="text-2xl font-mono" id="analemma-eqt">--</div>
            <div class="text-xs mt-1 ${mutedTextClass}">A Nap "késése" vagy "sietése" a középidőhöz képest.</div>
        </div>
    `));

    // Logic
    setTimeout(() => {
        // Coordinate Conversion
        const coordRa = container.querySelector('#coord-ra');
        const coordDec = container.querySelector('#coord-dec');
        const coordAlt = container.querySelector('#coord-alt');
        const coordAz = container.querySelector('#coord-az');

        const updateCoords = () => {
            const ra = parseFloat(coordRa.value) || 0;
            const dec = parseFloat(coordDec.value) || 0;
            const lat = userLocation.latitude;
            const lon = userLocation.longitude;
            
            const now = TimeService.now();
            // Calculate LST
            const d = (now.getTime() / 86400000) - 10957.5;
            let lst = 18.697374558 + 24.06570982441908 * d + (lon / 15);
            lst = lst % 24;
            if (lst < 0) lst += 24;
            
            const ha = (lst - ra) * 15; // Hour angle in degrees
            const haRad = ha * Math.PI / 180;
            const decRad = dec * Math.PI / 180;
            const latRad = lat * Math.PI / 180;
            
            const sinAlt = Math.sin(decRad) * Math.sin(latRad) + Math.cos(decRad) * Math.cos(latRad) * Math.cos(haRad);
            const altRad = Math.asin(sinAlt);
            const alt = altRad * 180 / Math.PI;
            
            const cosAz = (Math.sin(decRad) - Math.sin(altRad) * Math.sin(latRad)) / (Math.cos(altRad) * Math.cos(latRad));
            let azRad = Math.acos(Math.max(-1, Math.min(1, cosAz)));
            let az = azRad * 180 / Math.PI;
            if (Math.sin(haRad) > 0) az = 360 - az;
            
            coordAlt.textContent = safeFixed(alt, 2, '°');
            coordAz.textContent = safeFixed(az, 2, '°');
        };

        coordRa.addEventListener('input', updateCoords);
        coordDec.addEventListener('input', updateCoords);
        
        // Time & LST
        const timeLocal = container.querySelector('#time-local');
        const timeUtc = container.querySelector('#time-utc');
        const timeLst = container.querySelector('#time-lst');
        
        const updateTime = () => {
            const now = TimeService.now();
            timeLocal.textContent = now.toLocaleTimeString('hu-HU');
            timeUtc.textContent = now.toISOString().substr(11, 8);
            
            const d = (now.getTime() / 86400000) - 10957.5;
            let lst = 18.697374558 + 24.06570982441908 * d + (userLocation.longitude / 15);
            lst = lst % 24;
            if (lst < 0) lst += 24;
            
            const h = Math.floor(lst);
            const m = Math.floor((lst - h) * 60);
            const s = Math.floor(((lst - h) * 60 - m) * 60);
            timeLst.textContent = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        };
        
        // Geometry & Analemma
        const geomSun = container.querySelector('#geom-sun-dist');
        const geomMoon = container.querySelector('#geom-moon-dist');
        const analemmaEqt = container.querySelector('#analemma-eqt');
        
        const updateGeom = () => {
            const now = TimeService.now();
            if (window.SunCalc) {
                const moonPos = window.SunCalc.getMoonPosition(now, userLocation.latitude, userLocation.longitude);
                geomMoon.textContent = Math.round(moonPos.distance).toLocaleString('hu-HU') + ' km';
                
                // Simple Sun distance approximation
                const d = (now.getTime() / 86400000) - 10957.5;
                const g = (357.529 + 0.98560028 * d) % 360;
                const gRad = g * Math.PI / 180;
                const distAU = 1.00014 - 0.01671 * Math.cos(gRad) - 0.00014 * Math.cos(2 * gRad);
                geomSun.textContent = safeFixed(distAU, 4, ' AU');
                
                // Equation of Time approximation
                const L0 = 280.4665 + 36000.7698 * (d / 36525);
                const L0Rad = L0 * Math.PI / 180;
                const eqt = -7.659 * Math.sin(L0Rad) + 9.863 * Math.sin(2 * L0Rad + 3.5932);
                const eqtMin = Math.floor(eqt);
                const eqtSec = Math.abs(Math.round((eqt - eqtMin) * 60));
                analemmaEqt.textContent = `${eqtMin}m ${eqtSec}s`;
            }
        };

        const intervalId = setInterval(() => {
            if (!document.body.contains(container)) {
                clearInterval(intervalId);
                return;
            }
            updateCoords();
            updateTime();
        }, 1000);
        updateCoords();
        updateTime();
        updateGeom();

    }, 0);

    return container;
}

function createAccordion(title, iconName, contentHtml) {
    const wrapper = document.createElement('div');
    wrapper.className = 'astro-accordion-wrapper';
    wrapper.innerHTML = `
        <details class="astro-card group p-0 overflow-hidden mb-2">
            <summary class="flex items-center justify-between p-4 cursor-pointer list-none font-bold uppercase tracking-wider text-sm">
                <div class="flex items-center gap-3">
                    <span class="icon-placeholder" data-icon="${iconName}"></span>
                    <span>${title}</span>
                </div>
                <span class="transform group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div class="p-4 pt-0 border-t border-divider mt-2">
                ${contentHtml}
            </div>
        </details>
    `;
    return wrapper;
}