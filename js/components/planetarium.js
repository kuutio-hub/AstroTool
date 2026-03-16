import { storage, TimeService, calculateAltAz, formatTime } from '../utils.js';

// Simplified planetary calculation based on Keplerian elements
function getPlanetaryPositions(date, lat, lon) {
    const d = (date.getTime() - new Date('2000-01-01T12:00:00Z').getTime()) / 86400000;
    
    // Orbital elements (J2000)
    const elements = {
        'Merkúr': { N: 48.3313, N_dot: 3.24587E-5, i: 7.0047, i_dot: 5.00E-8, w: 29.1241, w_dot: 1.01444E-5, a: 0.387098, e: 0.205635, e_dot: 5.59E-9, M: 168.6562, M_dot: 4.0923344368 },
        'Vénusz': { N: 76.6799, N_dot: 2.46590E-5, i: 3.3946, i_dot: 2.75E-8, w: 54.8910, w_dot: 1.38374E-5, a: 0.723330, e: 0.006773, e_dot: -1.302E-9, M: 48.0052, M_dot: 1.6021302244 },
        'Mars': { N: 49.5574, N_dot: 2.11081E-5, i: 1.8497, i_dot: -1.78E-8, w: 286.5016, w_dot: 2.92961E-5, a: 1.523688, e: 0.093405, e_dot: 2.516E-9, M: 18.6021, M_dot: 0.5240207666 },
        'Jupiter': { N: 100.4542, N_dot: 2.76854E-5, i: 1.3030, i_dot: -1.557E-7, w: 273.8777, w_dot: 1.64505E-5, a: 5.20256, e: 0.048498, e_dot: 4.469E-9, M: 19.8950, M_dot: 0.0830853001 },
        'Szaturnusz': { N: 113.6634, N_dot: 2.38980E-5, i: 2.4886, i_dot: -1.081E-7, w: 339.3939, w_dot: 2.97661E-5, a: 9.55475, e: 0.055546, e_dot: -9.499E-9, M: 316.9670, M_dot: 0.0334442282 },
        'Uránusz': { N: 74.0005, N_dot: 1.3978E-5, i: 0.7733, i_dot: 1.9E-8, w: 96.6612, w_dot: 3.0565E-5, a: 19.18171, e: 0.047318, e_dot: 7.45E-9, M: 142.5905, M_dot: 0.011725806 },
        'Neptunusz': { N: 131.7806, N_dot: 3.0173E-5, i: 1.7700, i_dot: -2.55E-8, w: 272.8461, w_dot: -6.027E-6, a: 30.05826, e: 0.008606, e_dot: 2.15E-9, M: 260.2471, M_dot: 0.005995147 }
    };

    const earth = { N: 0.0, N_dot: 0.0, i: 0.0, i_dot: 0.0, w: 282.9404, w_dot: 4.70935E-5, a: 1.000000, e: 0.016709, e_dot: -1.151E-9, M: 356.0470, M_dot: 0.9856002585 };

    const d2r = Math.PI / 180;
    const r2d = 180 / Math.PI;

    function calcPos(el, d) {
        const N = (el.N + el.N_dot * d) % 360;
        const i = el.i + el.i_dot * d;
        const w = (el.w + el.w_dot * d) % 360;
        const a = el.a;
        const e = el.e + el.e_dot * d;
        const M = (el.M + el.M_dot * d) % 360;

        let E = M + (180/Math.PI) * e * Math.sin(M * d2r) * (1 + e * Math.cos(M * d2r));
        for(let iter=0; iter<5; iter++) {
            const E_rad = E * d2r;
            E = E - (E - (180/Math.PI) * e * Math.sin(E_rad) - M) / (1 - e * Math.cos(E_rad));
        }

        const x = a * (Math.cos(E * d2r) - e);
        const y = a * Math.sqrt(1 - e*e) * Math.sin(E * d2r);
        
        const v = Math.atan2(y, x) * r2d;
        const r = Math.sqrt(x*x + y*y);

        const xh = r * (Math.cos(N * d2r) * Math.cos((v+w) * d2r) - Math.sin(N * d2r) * Math.sin((v+w) * d2r) * Math.cos(i * d2r));
        const yh = r * (Math.sin(N * d2r) * Math.cos((v+w) * d2r) + Math.cos(N * d2r) * Math.sin((v+w) * d2r) * Math.cos(i * d2r));
        const zh = r * (Math.sin((v+w) * d2r) * Math.sin(i * d2r));

        return { x: xh, y: yh, z: zh, r: r };
    }

    const earthPos = calcPos(earth, d);
    const results = [];

    for (const [name, el] of Object.entries(elements)) {
        const pPos = calcPos(el, d);
        
        const xg = pPos.x - earthPos.x;
        const yg = pPos.y - earthPos.y;
        const zg = pPos.z - earthPos.z;

        // Ecliptic coordinates
        const eclLon = Math.atan2(yg, xg) * r2d;
        const eclLat = Math.atan2(zg, Math.sqrt(xg*xg + yg*yg)) * r2d;
        const dist = Math.sqrt(xg*xg + yg*yg + zg*zg);

        // Equatorial coordinates
        const obl = 23.4393 - 3.563E-7 * d;
        const xeq = Math.cos(eclLon * d2r) * Math.cos(eclLat * d2r);
        const yeq = Math.cos(obl * d2r) * Math.sin(eclLon * d2r) * Math.cos(eclLat * d2r) - Math.sin(obl * d2r) * Math.sin(eclLat * d2r);
        const zeq = Math.sin(obl * d2r) * Math.sin(eclLon * d2r) * Math.cos(eclLat * d2r) + Math.cos(obl * d2r) * Math.sin(eclLat * d2r);

        let ra = Math.atan2(yeq, xeq) * r2d;
        if (ra < 0) ra += 360;
        const dec = Math.asin(zeq) * r2d;

        // Format RA/Dec
        const raH = Math.floor(ra / 15);
        const raM = ((ra / 15) - raH) * 60;
        const decD = Math.floor(Math.abs(dec));
        const decM = (Math.abs(dec) - decD) * 60;
        const decSign = dec < 0 ? '-' : '+';

        const raStr = `${raH}h ${raM.toFixed(1)}m`;
        const decStr = `${decSign}${decD}° ${decM.toFixed(1)}'`;

        const altAz = calculateAltAz(raStr, decStr, lat, lon, date);

        // Approximate magnitude
        let mag = 0;
        const phase = (pPos.r * pPos.r + dist * dist - earthPos.r * earthPos.r) / (2 * pPos.r * dist);
        const phaseAngle = Math.acos(Math.max(-1, Math.min(1, phase))) * r2d;
        
        if (name === 'Vénusz') mag = -4.40 + 5 * Math.log10(pPos.r * dist) + 0.0009 * phaseAngle + 2.39E-4 * phaseAngle * phaseAngle - 6.5E-7 * phaseAngle * phaseAngle * phaseAngle;
        else if (name === 'Mars') mag = -1.52 + 5 * Math.log10(pPos.r * dist) + 0.016 * phaseAngle;
        else if (name === 'Jupiter') mag = -9.40 + 5 * Math.log10(pPos.r * dist) + 0.005 * phaseAngle;
        else if (name === 'Szaturnusz') mag = -8.88 + 5 * Math.log10(pPos.r * dist) + 0.044 * phaseAngle;
        else if (name === 'Merkúr') mag = -0.42 + 5 * Math.log10(pPos.r * dist) + 0.0380 * phaseAngle - 0.000273 * phaseAngle * phaseAngle + 0.000002 * phaseAngle * phaseAngle * phaseAngle;
        else if (name === 'Uránusz') mag = -7.19 + 5 * Math.log10(pPos.r * dist);
        else if (name === 'Neptunusz') mag = -6.87 + 5 * Math.log10(pPos.r * dist);

        results.push({
            name,
            raStr,
            decStr,
            alt: altAz ? altAz.alt : 0,
            az: altAz ? altAz.az : 0,
            mag: mag,
            dist: dist
        });
    }
    return results;
}

// Helper to calculate ecliptic path
function getEclipticPath(date, lat, lon) {
    const points = [];
    const d = (date.getTime() - new Date('2000-01-01T12:00:00Z').getTime()) / 86400000;
    const obl = 23.4393 - 3.563E-7 * d;
    const d2r = Math.PI / 180;
    const r2d = 180 / Math.PI;

    for (let lonEcl = 0; lonEcl < 360; lonEcl += 5) {
        const xeq = Math.cos(lonEcl * d2r);
        const yeq = Math.cos(obl * d2r) * Math.sin(lonEcl * d2r);
        const zeq = Math.sin(obl * d2r) * Math.sin(lonEcl * d2r);

        let ra = Math.atan2(yeq, xeq) * r2d;
        if (ra < 0) ra += 360;
        const dec = Math.asin(zeq) * r2d;

        const raH = Math.floor(ra / 15);
        const raM = ((ra / 15) - raH) * 60;
        const decD = Math.floor(Math.abs(dec));
        const decM = (Math.abs(dec) - decD) * 60;
        const decSign = dec < 0 ? '-' : '+';

        const raStr = `${raH}h ${raM.toFixed(1)}m`;
        const decStr = `${decSign}${decD}° ${decM.toFixed(1)}'`;

        const altAz = calculateAltAz(raStr, decStr, lat, lon, date);
        if (altAz) {
            points.push({ az: altAz.az, alt: altAz.alt });
        }
    }
    // Sort by azimuth to draw a continuous line
    points.sort((a, b) => a.az - b.az);
    return points;
}

export function createPlanetarium(isNightMode) {
    const container = document.createElement('div');
    container.className = "space-y-4";

    const textColor = isNightMode ? 'text-red-500' : 'text-slate-900';
    const cardBg = isNightMode ? 'bg-black/40 border-red-900/30' : 'bg-white border-slate-200';

    const location = storage.get('location', { latitude: 47.4979, longitude: 19.0402 });
    const now = TimeService.now();
    const planetsData = getPlanetaryPositions(now, location.latitude, location.longitude);

    const planetsCard = document.createElement('div');
    planetsCard.className = `astro-card ${cardBg}`;
    
    const tbodyHtml = planetsData.map(p => `
        <tr class="border-b ${isNightMode ? 'border-red-900/20' : 'border-slate-100'}">
            <td class="px-2 py-2 font-bold ${textColor}">${p.name}</td>
            <td class="px-2 py-2 font-mono">${p.raStr}</td>
            <td class="px-2 py-2 font-mono">${p.decStr}</td>
            <td class="px-2 py-2 font-mono ${p.alt > 0 ? 'text-green-400' : 'text-red-400'}">${p.alt.toFixed(1)}°</td>
            <td class="px-2 py-2 font-mono">${p.az.toFixed(1)}°</td>
            <td class="px-2 py-2 font-mono">${p.mag.toFixed(1)}</td>
        </tr>
    `).join('');

    planetsCard.innerHTML = `
        <h2 class="text-lg font-bold uppercase tracking-wider mb-4 ${textColor}">Bolygó Pozíciók</h2>
        <div class="overflow-x-auto">
            <table class="w-full text-sm text-left">
                <thead class="text-xs uppercase ${isNightMode ? 'bg-red-900/20' : 'bg-slate-50'} ${textColor}">
                    <tr>
                        <th class="px-2 py-2">Bolygó</th>
                        <th class="px-2 py-2">RA</th>
                        <th class="px-2 py-2">Dec</th>
                        <th class="px-2 py-2">Alt</th>
                        <th class="px-2 py-2">Az</th>
                        <th class="px-2 py-2">Mag</th>
                    </tr>
                </thead>
                <tbody>
                    ${tbodyHtml}
                </tbody>
            </table>
        </div>
    `;

    // --- Mini Planetarium (180° Panorama) ---
    const skyCard = document.createElement('div');
    skyCard.className = `astro-card ${cardBg}`;
    
    // Y axis: -20 to 90 (range 110)
    // X axis: 90 to 270 (range 180)
    const mapAltToY = (alt) => 100 - ((alt + 20) / 110 * 100);
    const mapAzToX = (az) => ((az - 90) / 180 * 100);

    let skyObjectsHtml = '';
    
    // Draw Ecliptic
    const eclipticPoints = getEclipticPath(now, location.latitude, location.longitude);
    let eclipticPath = '';
    let firstPoint = true;
    eclipticPoints.forEach(p => {
        if (p.az >= 90 && p.az <= 270) {
            const x = mapAzToX(p.az);
            const y = mapAltToY(p.alt);
            if (firstPoint) {
                eclipticPath += `M ${x} ${y} `;
                firstPoint = false;
            } else {
                eclipticPath += `L ${x} ${y} `;
            }
        } else {
            firstPoint = true; // Break line if it goes out of bounds
        }
    });

    const renderObject = (name, alt, az, mag, color, sizeMultiplier = 1) => {
        if (az >= 80 && az <= 280) { // Slightly wider to show objects just entering/leaving
            const x = mapAzToX(az);
            const y = mapAltToY(alt);
            const size = Math.max(2, 6 - mag) * sizeMultiplier;
            const opacity = alt < 0 ? 'opacity-30' : 'opacity-100';
            const glow = alt > 0 ? `box-shadow: 0 0 ${size*2}px ${color};` : '';
            
            return `
                <div class="absolute rounded-full ${opacity}" style="background-color: ${color}; left: ${x}%; top: ${y}%; width: ${size}px; height: ${size}px; transform: translate(-50%, -50%); ${glow}" title="${name} (Alt: ${alt.toFixed(1)}°, Az: ${az.toFixed(1)}°)"></div>
                <div class="absolute text-[9px] ${textColor} ${opacity} font-bold" style="left: ${x}%; top: ${y}%; transform: translate(4px, -50%); text-shadow: 0 0 2px black;">${name}</div>
            `;
        }
        return '';
    };

    planetsData.forEach(p => {
        skyObjectsHtml += renderObject(p.name, p.alt, p.az, p.mag, isNightMode ? '#ef4444' : '#ffffff');
    });

    if (window.SunCalc) {
        const sunPos = window.SunCalc.getPosition(now, location.latitude, location.longitude);
        const sunAlt = sunPos.altitude * 180 / Math.PI;
        const sunAz = sunPos.azimuth * 180 / Math.PI + 180;
        skyObjectsHtml += renderObject('Nap', sunAlt, sunAz, -26, '#eab308', 2);
        
        const moonPos = window.SunCalc.getMoonPosition(now, location.latitude, location.longitude);
        const moonAlt = moonPos.altitude * 180 / Math.PI;
        const moonAz = moonPos.azimuth * 180 / Math.PI + 180;
        skyObjectsHtml += renderObject('Hold', moonAlt, moonAz, -12, '#cbd5e1', 1.5);
    }

    // Selected object from catalog (if any)
    const selectedRa = storage.get('vis-ra', '');
    const selectedDec = storage.get('vis-dec', '');
    if (selectedRa && selectedDec) {
        const selectedPos = calculateAltAz(selectedRa, selectedDec, location.latitude, location.longitude, now);
        if (selectedPos) {
            skyObjectsHtml += renderObject('Célpont', selectedPos.alt, selectedPos.az, 0, '#3b82f6', 1.5);
        }
    }

    const horizonY = mapAltToY(0);

    skyCard.innerHTML = `
        <h2 class="text-lg font-bold uppercase tracking-wider mb-4 ${textColor}">Kiterített Égbolt Térkép</h2>
        <div class="relative w-full h-64 ${isNightMode ? 'bg-black/40 border-red-900/30' : 'bg-slate-900 border-slate-700'} rounded-lg overflow-hidden" style="background: linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) ${horizonY}%, rgba(20,0,0,0.6) ${horizonY}%, rgba(0,0,0,0.9) 100%);">
            
            <!-- Grid lines -->
            <div class="absolute left-0 right-0 border-t border-dashed ${isNightMode ? 'border-red-500/20' : 'border-white/20'}" style="top: ${mapAltToY(60)}%;"></div>
            <div class="absolute left-0 right-0 border-t border-dashed ${isNightMode ? 'border-red-500/20' : 'border-white/20'}" style="top: ${mapAltToY(30)}%;"></div>
            <div class="absolute left-0 right-0 border-t-2 border-green-500/50" style="top: ${horizonY}%;"></div> <!-- Horizon -->
            
            <div class="absolute top-0 bottom-0 border-l border-dashed ${isNightMode ? 'border-red-500/10' : 'border-white/10'}" style="left: ${mapAzToX(135)}%;"></div>
            <div class="absolute top-0 bottom-0 border-l border-dashed ${isNightMode ? 'border-red-500/20' : 'border-white/20'}" style="left: ${mapAzToX(180)}%;"></div> <!-- South -->
            <div class="absolute top-0 bottom-0 border-l border-dashed ${isNightMode ? 'border-red-500/10' : 'border-white/10'}" style="left: ${mapAzToX(225)}%;"></div>
            
            <!-- Labels -->
            <div class="absolute left-2 text-[10px] opacity-50" style="top: ${mapAltToY(90)}%;">Zenit (90°)</div>
            <div class="absolute left-2 text-[10px] opacity-50" style="top: ${mapAltToY(60)}%;">60°</div>
            <div class="absolute left-2 text-[10px] opacity-50" style="top: ${mapAltToY(30)}%;">30°</div>
            <div class="absolute left-2 text-[10px] text-green-500/80" style="top: ${horizonY}%; transform: translateY(-100%);">Horizont (0°)</div>
            
            <div class="absolute bottom-1 text-xs font-bold ${textColor}" style="left: 0%; transform: translateX(4px);">Kelet</div>
            <div class="absolute bottom-1 text-xs font-bold ${textColor}" style="left: 50%; transform: translateX(-50%);">Dél</div>
            <div class="absolute bottom-1 text-xs font-bold ${textColor}" style="right: 0%; transform: translateX(-4px);">Nyugat</div>
            
            <!-- Ecliptic -->
            <svg class="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="${eclipticPath}" fill="none" stroke="rgba(234, 179, 8, 0.3)" stroke-width="0.5" stroke-dasharray="2,2" />
            </svg>
            
            <!-- Objects -->
            ${skyObjectsHtml}
        </div>
        <div class="text-[10px] opacity-60 mt-2 text-center">A sárga szaggatott vonal az ekliptikát (a Nap látszólagos útját) jelöli.</div>
    `;

    // --- Visibility Chart (24h) ---
    const visCard = document.createElement('div');
    visCard.className = `astro-card ${cardBg}`;
    
    const planetOptions = planetsData.map(p => `<option value="${p.raStr}|${p.decStr}">${p.name}</option>`).join('');
    
    const initialRa = storage.get('vis-ra', '05h 35m');
    const initialDec = storage.get('vis-dec', '-05° 23\'');
    const todayStr = new Date(now).toISOString().split('T')[0];

    visCard.innerHTML = `
        <h2 class="text-lg font-bold uppercase tracking-wider mb-4 ${textColor}">Láthatósági Grafikon (24h)</h2>
        <div class="flex flex-col gap-3 mb-6">
            <div class="flex gap-2 items-center">
                <input type="date" id="vis-date" class="astro-input p-2 text-xs w-full" value="${todayStr}">
                <button id="vis-prev-day" class="p-2 rounded ${isNightMode ? 'bg-red-900/20 hover:bg-red-900/40' : 'bg-slate-100 hover:bg-slate-200'} transition-colors">&larr;</button>
                <button id="vis-next-day" class="p-2 rounded ${isNightMode ? 'bg-red-900/20 hover:bg-red-900/40' : 'bg-slate-100 hover:bg-slate-200'} transition-colors">&rarr;</button>
            </div>
            <select id="vis-preset" class="astro-input p-2 text-xs w-full">
                <option value="">-- Egyedi RA/Dec --</option>
                <option value="SUN">Nap</option>
                <option value="MOON">Hold</option>
                ${planetOptions}
            </select>
            <div class="flex gap-2">
                <input type="text" id="vis-ra" placeholder="RA (pl. 05h 35m)" class="astro-input p-2 text-xs w-1/2" value="${initialRa}">
                <input type="text" id="vis-dec" placeholder="Dec (pl. -05° 23')" class="astro-input p-2 text-xs w-1/2" value="${initialDec}">
                <button id="vis-calc-btn" class="px-4 py-2 rounded bg-blue-600 text-white font-bold text-xs uppercase ${isNightMode ? 'bg-red-900 text-red-500' : ''}">Számol</button>
            </div>
        </div>
        
        <div class="relative h-56 border-b border-l ${isNightMode ? 'border-red-900/30' : 'border-slate-300'} mt-4 ml-8 mr-2">
            <!-- Y axis labels -->
            <div class="absolute -left-8 top-0 text-[10px] opacity-70 w-6 text-right">90°</div>
            <div class="absolute -left-8 top-1/3 text-[10px] opacity-70 w-6 text-right">60°</div>
            <div class="absolute -left-8 top-2/3 text-[10px] opacity-70 w-6 text-right">30°</div>
            <div class="absolute -left-8 bottom-0 text-[10px] opacity-70 w-6 text-right">0°</div>
            
            <!-- Grid lines -->
            <div class="absolute left-0 right-0 top-1/3 border-t border-dashed ${isNightMode ? 'border-red-900/20' : 'border-slate-200'}"></div>
            <div class="absolute left-0 right-0 top-2/3 border-t border-dashed ${isNightMode ? 'border-red-900/20' : 'border-slate-200'}"></div>
            
            <!-- Twilight Backgrounds -->
            <div id="twilight-bands" class="absolute inset-0 pointer-events-none"></div>
            
            <!-- Chart area -->
            <svg id="vis-chart-svg" class="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <!-- Path will be drawn here -->
            </svg>
            
            <!-- Markers (Transit, Rise, Set) -->
            <div id="vis-markers" class="absolute inset-0 pointer-events-none"></div>
            
            <!-- X axis labels (Time) -->
            <div id="vis-x-axis" class="absolute left-0 right-0 -bottom-6 flex justify-between text-[10px] opacity-70">
                <span>12:00</span>
                <span>18:00</span>
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
            </div>
        </div>
        
        <div class="flex justify-center flex-wrap gap-4 mt-8 text-[10px] uppercase tracking-wider">
            <div class="flex items-center gap-1"><div class="w-3 h-3 ${isNightMode ? 'bg-[#7f1d1d]' : 'bg-red-500'} rounded"></div> 0-20° (Gyenge)</div>
            <div class="flex items-center gap-1"><div class="w-3 h-3 ${isNightMode ? 'bg-[#dc2626]' : 'bg-yellow-500'} rounded"></div> 20-40° (Jó)</div>
            <div class="flex items-center gap-1"><div class="w-3 h-3 ${isNightMode ? 'bg-[#fca5a5]' : 'bg-green-500'} rounded"></div> 40°+ (Kiváló)</div>
        </div>
        <div class="flex justify-center flex-wrap gap-4 mt-2 text-[9px] opacity-70">
            <div class="flex items-center gap-1"><div class="w-2 h-2 bg-blue-900/50 rounded"></div> Polgári</div>
            <div class="flex items-center gap-1"><div class="w-2 h-2 bg-blue-900/80 rounded"></div> Nautikus</div>
            <div class="flex items-center gap-1"><div class="w-2 h-2 bg-black rounded border ${isNightMode ? 'border-red-900/50' : 'border-slate-400'}"></div> Asztronómiai / Éjszaka</div>
        </div>
    `;

    const updateVisibilityChart = () => {
        const dateInput = visCard.querySelector('#vis-date').value;
        const preset = visCard.querySelector('#vis-preset').value;
        let ra = visCard.querySelector('#vis-ra').value;
        let dec = visCard.querySelector('#vis-dec').value;
        
        if (!dateInput) return;
        
        let targetDate = new Date(dateInput + 'T12:00:00'); // Start at noon
        
        const svg = visCard.querySelector('#vis-chart-svg');
        const twilightBands = visCard.querySelector('#twilight-bands');
        const markers = visCard.querySelector('#vis-markers');
        svg.innerHTML = '';
        twilightBands.innerHTML = '';
        markers.innerHTML = '';

        // Draw Twilight Bands
        if (window.SunCalc) {
            // SunCalc times are for the given date. Since we span noon to noon, we need times for the evening of targetDate and morning of targetDate+1.
            const times1 = window.SunCalc.getTimes(targetDate, location.latitude, location.longitude);
            const nextDay = new Date(targetDate.getTime() + 86400000);
            const times2 = window.SunCalc.getTimes(nextDay, location.latitude, location.longitude);
            
            const getX = (time) => {
                const diffMs = time.getTime() - targetDate.getTime();
                return Math.max(0, Math.min(100, (diffMs / 86400000) * 100));
            };

            const drawBand = (start, end, colorClass) => {
                const x1 = getX(start);
                const x2 = getX(end);
                if (x2 > x1) {
                    twilightBands.innerHTML += `<div class="absolute top-0 bottom-0 ${colorClass}" style="left: ${x1}%; width: ${x2-x1}%;"></div>`;
                }
            };

            // Evening
            drawBand(times1.sunset, times1.dusk, 'bg-blue-900/30'); // Civil
            drawBand(times1.dusk, times1.nauticalDusk, 'bg-blue-900/50'); // Nautical
            drawBand(times1.nauticalDusk, times1.night, 'bg-blue-900/80'); // Astro
            
            // Night
            drawBand(times1.night, times2.nightEnd, 'bg-black/60'); // Full night
            
            // Morning
            drawBand(times2.nightEnd, times2.nauticalDawn, 'bg-blue-900/80'); // Astro
            drawBand(times2.nauticalDawn, times2.dawn, 'bg-blue-900/50'); // Nautical
            drawBand(times2.dawn, times2.sunrise, 'bg-blue-900/30'); // Civil
        }

        let points = [];
        let maxAlt = -90;
        let transitX = 0;
        let transitTime = '';
        let riseX = -1;
        let setX = -1;
        
        // Calculate for 24 hours (12:00 to 12:00), every 10 mins (144 steps)
        for (let i = 0; i <= 144; i++) {
            const t = new Date(targetDate.getTime() + i * 10 * 60000);
            let pos = null;

            if (preset === 'SUN' && window.SunCalc) {
                const sp = window.SunCalc.getPosition(t, location.latitude, location.longitude);
                pos = { alt: sp.altitude * 180 / Math.PI, az: sp.azimuth * 180 / Math.PI + 180 };
            } else if (preset === 'MOON' && window.SunCalc) {
                const mp = window.SunCalc.getMoonPosition(t, location.latitude, location.longitude);
                pos = { alt: mp.altitude * 180 / Math.PI, az: mp.azimuth * 180 / Math.PI + 180 };
            } else if (ra && dec) {
                pos = calculateAltAz(ra, dec, location.latitude, location.longitude, t);
            }
            
            if (pos) {
                const x = (i / 144) * 100;
                const y = 100 - (Math.max(0, Math.min(90, pos.alt)) / 90) * 100;
                points.push({x, y, alt: pos.alt, time: t});
                
                if (pos.alt > maxAlt) {
                    maxAlt = pos.alt;
                    transitX = x;
                    transitTime = formatTime(t);
                }

                if (i > 0) {
                    const prevAlt = points[i-1].alt;
                    if (prevAlt < 0 && pos.alt >= 0) riseX = x;
                    if (prevAlt >= 0 && pos.alt < 0) setX = x;
                }
            }
        }

        if (points.length > 0) {
            // Draw segments with colors based on altitude
            for (let i = 0; i < points.length - 1; i++) {
                const p1 = points[i];
                const p2 = points[i+1];
                
                // Don't draw if both are below horizon
                if (p1.alt < 0 && p2.alt < 0) continue;

                const avgAlt = (p1.alt + p2.alt) / 2;
                
                let color;
                if (isNightMode) {
                    if (avgAlt < 20) color = '#7f1d1d';
                    else if (avgAlt < 40) color = '#dc2626';
                    else color = '#fca5a5';
                } else {
                    if (avgAlt < 20) color = '#ef4444';
                    else if (avgAlt < 40) color = '#eab308';
                    else color = '#22c55e';
                }

                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", p1.x);
                // Clamp Y to 100 (horizon) for drawing
                line.setAttribute("y1", Math.min(100, p1.y));
                line.setAttribute("x2", p2.x);
                line.setAttribute("y2", Math.min(100, p2.y));
                line.setAttribute("stroke", color);
                line.setAttribute("stroke-width", "2.5");
                line.setAttribute("stroke-linecap", "round");
                svg.appendChild(line);
            }

            // Add Markers
            if (maxAlt > 0) {
                markers.innerHTML += `
                    <div class="absolute w-px ${isNightMode ? 'bg-red-500/30 border-red-500/50' : 'bg-slate-400/30 border-slate-400/50'} border-l border-dashed" style="left: ${transitX}%; top: ${100 - (maxAlt/90)*100}%; bottom: 0;"></div>
                    <div class="absolute text-[9px] font-bold ${isNightMode ? 'bg-black/80' : 'bg-white/90 shadow-sm'} px-1 rounded transform -translate-x-1/2 -translate-y-full" style="left: ${transitX}%; top: ${100 - (maxAlt/90)*100}%; color: ${isNightMode ? '#fca5a5' : '#1e40af'};">
                        Transit: ${transitTime} (${maxAlt.toFixed(1)}°)
                    </div>
                `;
            }
            if (riseX >= 0) {
                markers.innerHTML += `<div class="absolute text-[10px] transform -translate-x-1/2 translate-y-2" style="left: ${riseX}%; bottom: 0;" title="Kelés">🌅</div>`;
            }
            if (setX >= 0) {
                markers.innerHTML += `<div class="absolute text-[10px] transform -translate-x-1/2 translate-y-2" style="left: ${setX}%; bottom: 0;" title="Nyugvás">🌇</div>`;
            }
        }
    };

    visCard.querySelector('#vis-calc-btn').onclick = () => {
        const preset = visCard.querySelector('#vis-preset').value;
        if (!preset || preset.includes('|')) {
            storage.set('vis-ra', visCard.querySelector('#vis-ra').value);
            storage.set('vis-dec', visCard.querySelector('#vis-dec').value);
        }
        updateVisibilityChart();
    };
    
    visCard.querySelector('#vis-preset').addEventListener('change', (e) => {
        const val = e.target.value;
        const raInput = visCard.querySelector('#vis-ra');
        const decInput = visCard.querySelector('#vis-dec');
        
        if (val === 'SUN' || val === 'MOON') {
            raInput.disabled = true;
            decInput.disabled = true;
            raInput.value = '';
            decInput.value = '';
        } else if (val) {
            raInput.disabled = false;
            decInput.disabled = false;
            const [ra, dec] = val.split('|');
            raInput.value = ra;
            decInput.value = dec;
        } else {
            raInput.disabled = false;
            decInput.disabled = false;
        }
        updateVisibilityChart();
    });

    visCard.querySelector('#vis-prev-day').onclick = () => {
        const dateInput = visCard.querySelector('#vis-date');
        const d = new Date(dateInput.value);
        d.setDate(d.getDate() - 1);
        dateInput.value = d.toISOString().split('T')[0];
        updateVisibilityChart();
    };

    visCard.querySelector('#vis-next-day').onclick = () => {
        const dateInput = visCard.querySelector('#vis-date');
        const d = new Date(dateInput.value);
        d.setDate(d.getDate() + 1);
        dateInput.value = d.toISOString().split('T')[0];
        updateVisibilityChart();
    };



    container.appendChild(planetsCard);
    container.appendChild(skyCard);
    container.appendChild(visCard);

    // Initial render
    setTimeout(updateVisibilityChart, 100);

    return container;
}
