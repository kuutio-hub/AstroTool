import { createInfoBtn, storage, TimeService } from '../utils.js';

export function createPositionCalc(isNightMode) {
    const card = document.createElement('div');
    card.className = `astro-card flex flex-col h-full animate-fade-in`;
    
    const labelClass = `astro-label mb-1 block truncate`;
    
    // State
    let ra = storage.get('pos-ra', '00h 00m');
    let dec = storage.get('pos-dec', '+00° 00\'');
    
    card.innerHTML = `
        <div class="flex items-center gap-2 mb-4 ${isNightMode ? 'text-red-500' : 'text-blue-400'} font-bold uppercase tracking-wider text-xs">
            Objektum Pozíció
        </div>
        <div class="grid grid-cols-2 gap-3 mb-4">
            <div>
                <label class="${labelClass}">Rektaszcenzió (RA) ${createInfoBtn('Rektaszcenzió', 'Az objektum égi hosszúsága. Formátum: ÓÓh PPm')}</label>
                <input type="text" id="pos-ra-in" value="${ra}" class="astro-input" placeholder="pl. 05h 35m">
            </div>
            <div>
                <label class="${labelClass}">Deklináció (Dec) ${createInfoBtn('Deklináció', 'Az objektum égi szélessége. Formátum: ±FF° PP\'')}</label>
                <input type="text" id="pos-dec-in" value="${dec}" class="astro-input" placeholder="pl. +22° 01'">
            </div>
        </div>
        <div class="grid grid-cols-2 gap-y-3 gap-x-2 pt-3 border-t border-white/10 mt-auto">
            <div>
                <div class="${labelClass}">Magasság (Alt) ${createInfoBtn('Magasság', 'Az objektum horizont feletti magassága fokban. 0° a horizont, 90° a zenit.')}</div>
                <div id="pos-alt" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}">--°</div>
            </div>
            <div>
                <div class="${labelClass}">Azimut (Az) ${createInfoBtn('Azimut', 'Az objektum égtáj szerinti iránya. 0° Észak, 90° Kelet, 180° Dél, 270° Nyugat.')}</div>
                <div id="pos-az" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}">--°</div>
            </div>
            <div class="col-span-2">
                <div class="${labelClass}">Láthatóság</div>
                <div id="pos-status" class="text-xs opacity-60 italic">--</div>
            </div>
        </div>
    `;

    function parseRA(str) {
        const match = str.match(/(\d+)h\s*(\d+\.?\d*)m/);
        if (!match) return null;
        const h = parseFloat(match[1]);
        const m = parseFloat(match[2]);
        return (h + m / 60) * 15; // to degrees
    }

    function parseDec(str) {
        const match = str.match(/([+-]?\d+)°\s*(\d+\.?\d*)'/);
        if (!match) return null;
        const d = parseFloat(match[1]);
        const m = parseFloat(match[2]);
        return d >= 0 ? d + m / 60 : d - m / 60;
    }

    function calculate() {
        const raVal = parseRA(ra);
        const decVal = parseDec(dec);
        const loc = storage.get('location', { latitude: 47.4979, longitude: 19.0402 });
        
        if (raVal === null || decVal === null) {
            card.querySelector('#pos-alt').textContent = '--°';
            card.querySelector('#pos-az').textContent = '--°';
            card.querySelector('#pos-status').textContent = 'Hibás formátum';
            return;
        }

        const now = TimeService.now();
        const lat = loc.latitude;
        const lon = loc.longitude;

        // Simple Alt/Az calculation
        const d2r = Math.PI / 180;
        const r2d = 180 / Math.PI;

        // Calculate LST (approximate)
        // LST = 100.46 + 0.985647 * d + lon + 15 * UT
        const d = (now - new Date(Date.UTC(2000, 0, 1, 12, 0, 0))) / (1000 * 60 * 60 * 24);
        const ut = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
        let lst = (100.46061837 + 0.9856473662862 * d + lon + 15 * ut) % 360;
        if (lst < 0) lst += 360;

        const ha = (lst - raVal + 360) % 360;

        const sinAlt = Math.sin(decVal * d2r) * Math.sin(lat * d2r) + 
                       Math.cos(decVal * d2r) * Math.cos(lat * d2r) * Math.cos(ha * d2r);
        const alt = Math.asin(sinAlt) * r2d;

        const cosAz = (Math.sin(decVal * d2r) - Math.sin(alt * d2r) * Math.sin(lat * d2r)) / 
                      (Math.cos(alt * d2r) * Math.cos(lat * d2r));
        let az = Math.acos(Math.max(-1, Math.min(1, cosAz))) * r2d;
        
        if (Math.sin(ha * d2r) > 0) az = 360 - az;

        card.querySelector('#pos-alt').textContent = alt.toFixed(1) + '°';
        card.querySelector('#pos-az').textContent = az.toFixed(1) + '°';
        
        const status = alt > 0 ? (alt > 10 ? 'Látható' : 'Alacsonyan a horizonton') : 'A horizont alatt';
        card.querySelector('#pos-status').textContent = status;
    }

    card.querySelector('#pos-ra-in').oninput = (e) => {
        ra = e.target.value;
        storage.set('pos-ra', ra);
        calculate();
    };

    card.querySelector('#pos-dec-in').oninput = (e) => {
        dec = e.target.value;
        storage.set('pos-dec', dec);
        calculate();
    };

    // Listen for external updates (from catalog)
    window.addEventListener('astro-set-position', (e) => {
        ra = e.detail.ra;
        dec = e.detail.dec;
        card.querySelector('#pos-ra-in').value = ra;
        card.querySelector('#pos-dec-in').value = dec;
        storage.set('pos-ra', ra);
        storage.set('pos-dec', dec);
        calculate();
    });

    calculate();
    setInterval(calculate, 60000); // Update every minute

    return card;
}
