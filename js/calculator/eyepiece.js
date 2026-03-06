import { storage } from '../utils.js';

export function createEyepieceCalc(isNightMode) {
    const card = document.createElement('div');
    card.className = "astro-card";
    
    let data = {
        F: storage.get('F', 1000),
        A: storage.get('A', 200),
        e: storage.get('e', 25),
        a: storage.get('a', 50),
        B: storage.get('B', 1),
        b: storage.get('b', 27), // Field stop
        dec: storage.get('dec', 0) // Declination for drift time
    };

    const update = () => {
        const mag = (data.F / data.e) * data.B;
        const ep = (data.A * data.e) / data.F; // Exit pupil
        const fov = (data.a * data.e) / (data.F * data.B);
        const maxFov = (data.b / data.F) * 57.3;
        const driftTime = (fov * 4) / Math.cos(data.dec * Math.PI / 180); // Drift time in minutes

        card.querySelector('#mag-res').textContent = mag.toFixed(1) + 'x';
        card.querySelector('#ep-res').textContent = ep.toFixed(2) + ' mm';
        card.querySelector('#fov-res').textContent = fov.toFixed(2) + '°';
        card.querySelector('#maxfov-res').textContent = maxFov.toFixed(2) + '°';
        card.querySelector('#drift-res').textContent = driftTime.toFixed(1) + ' min';
    };

    const inputClass = "astro-input";
    const labelClass = "astro-label";

    card.innerHTML = `
        <h3 class="font-bold uppercase text-xs mb-4 ${isNightMode ? 'text-red-500' : 'text-blue-300'}">Okulár Kalkulátor</h3>
        <div class="space-y-3 mb-4">
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="${labelClass}">AFoV (a) °</label>
                    <input type="number" id="ep-a" value="${data.a}" class="${inputClass}">
                </div>
                <div>
                    <label class="${labelClass}">Mezőrekesz (b) mm</label>
                    <input type="number" id="ep-b" value="${data.b}" class="${inputClass}">
                </div>
            </div>
            <div>
                <label class="${labelClass}">Deklináció (Dec) °</label>
                <input type="number" id="ep-dec" value="${data.dec}" class="${inputClass}">
            </div>
        </div>
        <div class="grid grid-cols-2 gap-y-3 gap-x-2 pt-3 border-t border-white/10">
            <div>
                <div class="${labelClass}">Nagyítás</div>
                <div id="mag-res" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div>
                <div class="${labelClass}">Kilépő Pupilla</div>
                <div id="ep-res" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div>
                <div class="${labelClass}">Valós Látómező</div>
                <div id="fov-res" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div>
                <div class="${labelClass}">Max Látómező</div>
                <div id="maxfov-res" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div class="col-span-2">
                <div class="${labelClass}">Drift Idő (Átvonulás)</div>
                <div id="drift-res" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
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

    window.addEventListener('astro-settings-changed', (e) => {
        data = { ...data, ...e.detail };
        update();
    });

    update();
    return card;
}
