import { storage, formatNum } from '../utils.js';

export function createConversionsCalc(isNightMode) {
    const card = document.createElement('div');
    card.className = "astro-card";
    
    let data = {
        H: storage.get('H', 0),
        M: storage.get('M', 0),
        S: storage.get('S', 0),
        pc: storage.get('pc', 1)
    };

    const update = () => {
        // Hour Angle to Degrees
        const deg = (data.H + data.M/60 + data.S/3600) * 15;
        
        // Parsec to Light Years
        const ly = data.pc * 3.26;
        const km = ly * 9.461e12;

        card.querySelector('#conv-deg').textContent = deg.toFixed(4) + '°';
        card.querySelector('#conv-ly').textContent = formatNum(ly) + ' ly';
        card.querySelector('#conv-km').textContent = km.toExponential(2) + ' km';
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
        </div>
        <div class="grid grid-cols-2 gap-2 pt-3 border-t border-white/10">
            <div>
                <div class="${labelClass}">Fok</div>
                <div id="conv-deg" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div>
                <div class="${labelClass}">Fényév</div>
                <div id="conv-ly" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div class="col-span-2">
                <div class="${labelClass}">Kilométer</div>
                <div id="conv-km" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
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

    update();
    return card;
}
