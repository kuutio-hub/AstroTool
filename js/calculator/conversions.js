import { storage, formatNum, TimeService, createInfoBtn } from '../utils.js';

export function createConversionsCalc(isNightMode) {
    const card = document.createElement('div');
    card.className = "astro-card h-full flex flex-col";
    
    let data = {
        H: storage.get('H', 0),
        M: storage.get('M', 0),
        S: storage.get('S', 0),
        dist: storage.get('dist', 1), // Unified distance value (stored as parsec internally)
        raH: storage.get('raH', 0),
        raM: storage.get('raM', 0),
        raS: storage.get('raS', 0),
        decD: storage.get('decD', 0),
        decM: storage.get('decM', 0),
        decS: storage.get('decS', 0)
    };

    const updateAstro = () => {
        // Hour Angle to Degrees
        const deg = (data.H + data.M/60 + data.S/3600) * 15;
        
        // RA/DEC to Alt/Az
        const loc = storage.get('location', { latitude: 47.4979, longitude: 19.0402 });
        const now = TimeService.now();
        
        // Calculate Julian Date
        const jd = (now.getTime() / 86400000) + 2440587.5;
        const d = jd - 2451545.0;
        
        // Local Sidereal Time (approximate)
        let lst = (100.46 + 0.985647 * d + loc.longitude + 15 * (now.getUTCHours() + now.getUTCMinutes()/60 + now.getUTCSeconds()/3600)) % 360;
        if (lst < 0) lst += 360;
        
        const raDeg = (data.raH + data.raM/60 + data.raS/3600) * 15;
        const decDeg = data.decD + (data.decD >= 0 ? 1 : -1) * (data.decM/60 + data.decS/3600);
        
        const haDeg = (lst - raDeg + 360) % 360;
        
        const haRad = haDeg * Math.PI / 180;
        const decRad = decDeg * Math.PI / 180;
        const latRad = loc.latitude * Math.PI / 180;
        
        const sinAlt = Math.sin(decRad) * Math.sin(latRad) + Math.cos(decRad) * Math.cos(latRad) * Math.cos(haRad);
        const altRad = Math.asin(sinAlt);
        const altDeg = altRad * 180 / Math.PI;
        
        const cosAz = (Math.sin(decRad) - Math.sin(altRad) * Math.sin(latRad)) / (Math.cos(altRad) * Math.cos(latRad));
        let azRad = Math.acos(Math.max(-1, Math.min(1, cosAz)));
        let azDeg = azRad * 180 / Math.PI;
        
        if (Math.sin(haRad) > 0) azDeg = 360 - azDeg;

        card.querySelector('#conv-deg').textContent = deg.toFixed(4) + '°';
        card.querySelector('#conv-alt').textContent = altDeg.toFixed(2) + '°';
        card.querySelector('#conv-az').textContent = azDeg.toFixed(2) + '°';
    };

    const updateAll = (sourceKey, value) => {
        if (isNaN(value) || value === null) return;
        
        // Convert source to meters first
        let meters = 0;
        switch(sourceKey) {
            case 'm': meters = value; break;
            case 'km': meters = value * 1000; break;
            case 'au': meters = value * 1.495978707e11; break;
            case 'ly': meters = value * 9.4607304725808e15; break;
            case 'pc': meters = value * 3.08567758149137e16; break;
        }

        // Update all other fields
        const units = {
            m: meters,
            km: meters / 1000,
            au: meters / 1.495978707e11,
            ly: meters / 9.4607304725808e15,
            pc: meters / 3.08567758149137e16
        };

        Object.keys(units).forEach(key => {
            const input = card.querySelector(`#conv-${key}`);
            if (input && document.activeElement !== input) {
                const val = units[key];
                if (val === 0) {
                    input.value = "0";
                } else if (val > 1e9 || (val < 0.0001 && val > 0)) {
                    input.value = val.toExponential(4);
                } else {
                    input.value = val.toFixed(6).replace(/\.?0+$/, ""); // Remove trailing zeros
                }
            }
        });
    };

    const inputClass = "astro-input p-1 text-xs";
    const labelClass = "astro-label text-[9px]";

    card.innerHTML = `
        <h3 class="font-bold uppercase text-xs mb-4 ${isNightMode ? 'text-red-500' : 'text-blue-300'}">Astrometria / Konverziók</h3>
        <div class="space-y-4 mb-4 flex-grow">
            <div>
                <label class="${labelClass}">Óraszög (RA) -> Fok ${createInfoBtn('Óraszög', 'Az égi koordinátákat gyakran órában, percben és másodpercben adják meg (1 óra = 15 fok).')}</label>
                <div class="grid grid-cols-3 gap-2">
                    <input type="number" id="conv-H" value="${data.H}" class="${inputClass}" placeholder="h">
                    <input type="number" id="conv-M" value="${data.M}" class="${inputClass}" placeholder="m">
                    <input type="number" id="conv-S" value="${data.S}" class="${inputClass}" placeholder="s">
                </div>
            </div>
            
            <div class="pt-2 border-t border-white/10">
                <label class="${labelClass}">Távolság Konverzió ${createInfoBtn('Távolság', 'Írj be egy értéket bármelyik mezőbe, a többi automatikusan frissül.')}</label>
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <div class="text-[9px] uppercase opacity-50 mb-1">Méter</div>
                        <input type="number" id="conv-m" class="${inputClass}">
                    </div>
                    <div>
                        <div class="text-[9px] uppercase opacity-50 mb-1">Kilométer</div>
                        <input type="number" id="conv-km" class="${inputClass}">
                    </div>
                    <div>
                        <div class="text-[9px] uppercase opacity-50 mb-1">AU</div>
                        <input type="number" id="conv-au" class="${inputClass}">
                    </div>
                    <div>
                        <div class="text-[9px] uppercase opacity-50 mb-1">Fényév</div>
                        <input type="number" id="conv-ly" class="${inputClass}">
                    </div>
                    <div class="col-span-2">
                        <div class="text-[9px] uppercase opacity-50 mb-1">Parsec</div>
                        <input type="number" id="conv-pc" class="${inputClass}">
                    </div>
                </div>
            </div>

            <div class="pt-2 border-t border-white/10">
                <label class="${labelClass}">RA/DEC -> Alt/Az (Aktuális idő/hely) ${createInfoBtn('Alt/Az Konverzió', 'Kiszámítja egy égitest aktuális magasságát (Alt) és irányszögét (Az) a megadott RA/DEC koordináták és a te jelenlegi helyzeted alapján.')}</label>
                <div class="grid grid-cols-3 gap-2 mb-2">
                    <input type="number" id="conv-raH" value="${data.raH}" class="${inputClass}" placeholder="RA h">
                    <input type="number" id="conv-raM" value="${data.raM}" class="${inputClass}" placeholder="RA m">
                    <input type="number" id="conv-raS" value="${data.raS}" class="${inputClass}" placeholder="RA s">
                </div>
                <div class="grid grid-cols-3 gap-2">
                    <input type="number" id="conv-decD" value="${data.decD}" class="${inputClass}" placeholder="DEC °">
                    <input type="number" id="conv-decM" value="${data.decM}" class="${inputClass}" placeholder="DEC '">
                    <input type="number" id="conv-decS" value="${data.decS}" class="${inputClass}" placeholder="DEC &quot;">
                </div>
            </div>
        </div>
        <div class="grid grid-cols-2 gap-y-3 gap-x-2 pt-3 border-t border-white/10 mt-auto">
            <div>
                <div class="${labelClass}">Fok (Óraszög)</div>
                <div id="conv-deg" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div></div>
            <div>
                <div class="${labelClass}">Magasság (Alt)</div>
                <div id="conv-alt" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div>
                <div class="${labelClass}">Azimut (Az)</div>
                <div id="conv-az" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
        </div>
    `;

    card.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', (e) => {
            const id = e.target.id;
            const val = parseFloat(e.target.value) || 0;
            
            if (id.startsWith('conv-m') || id.startsWith('conv-km') || id.startsWith('conv-au') || id.startsWith('conv-ly') || id.startsWith('conv-pc')) {
                const key = id.split('-')[1];
                updateAll(key, val);
            } else {
                const key = id.split('-')[1];
                data[key] = val;
                // Save other keys
                ['H', 'M', 'S', 'raH', 'raM', 'raS', 'decD', 'decM', 'decS'].forEach(k => storage.set(k, data[k]));
                updateAstro();
            }
        });
    });

    // Update Alt/Az periodically since it depends on time
    setInterval(updateAstro, 1000);

    updateAstro();
    return card;
}
