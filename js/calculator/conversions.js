import { storage, formatNum, TimeService } from '../utils.js';

export function createConversionsCalc(isNightMode) {
    const card = document.createElement('div');
    card.className = "astro-card";
    
    let data = {
        H: storage.get('H', 0),
        M: storage.get('M', 0),
        S: storage.get('S', 0),
        pc: storage.get('pc', 1),
        raH: storage.get('raH', 0),
        raM: storage.get('raM', 0),
        raS: storage.get('raS', 0),
        decD: storage.get('decD', 0),
        decM: storage.get('decM', 0),
        decS: storage.get('decS', 0)
    };

    const update = () => {
        // Hour Angle to Degrees
        const deg = (data.H + data.M/60 + data.S/3600) * 15;
        
        // Parsec to Light Years
        const ly = data.pc * 3.26;
        const km = ly * 9.461e12;

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
        card.querySelector('#conv-ly').textContent = formatNum(ly) + ' ly';
        card.querySelector('#conv-km').textContent = km.toExponential(2) + ' km';
        card.querySelector('#conv-alt').textContent = altDeg.toFixed(2) + '°';
        card.querySelector('#conv-az').textContent = azDeg.toFixed(2) + '°';
    };

    const inputClass = "astro-input";
    const labelClass = "astro-label";

    card.innerHTML = `
        <h3 class="font-bold uppercase text-xs mb-4 ${isNightMode ? 'text-red-500' : 'text-blue-300'}">Konverziók</h3>
        <div class="space-y-4 mb-4">
            <div>
                <label class="${labelClass}">Óraszög (RA) -> Fok</label>
                <div class="grid grid-cols-3 gap-2">
                    <input type="number" id="conv-H" value="${data.H}" class="${inputClass}" placeholder="h">
                    <input type="number" id="conv-M" value="${data.M}" class="${inputClass}" placeholder="m">
                    <input type="number" id="conv-S" value="${data.S}" class="${inputClass}" placeholder="s">
                </div>
            </div>
            <div>
                <label class="${labelClass}">Távolság (Parsec)</label>
                <input type="number" id="conv-pc" value="${data.pc}" class="${inputClass}">
            </div>
            <div>
                <label class="${labelClass}">RA/DEC -> Alt/Az (Aktuális idő/hely)</label>
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
        <div class="grid grid-cols-2 gap-y-3 gap-x-2 pt-3 border-t border-white/10">
            <div>
                <div class="${labelClass}">Fok (Óraszög)</div>
                <div id="conv-deg" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div>
                <div class="${labelClass}">Fényév</div>
                <div id="conv-ly" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div>
                <div class="${labelClass}">Kilométer</div>
                <div id="conv-km" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
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
            const key = e.target.id.split('-')[1];
            data[key] = parseFloat(e.target.value) || 0;
            storage.set(key, data[key]);
            update();
        });
    });

    // Update Alt/Az periodically since it depends on time
    setInterval(update, 1000);

    update();
    return card;
}
