import { storage } from '../utils.js';

export function createTelescopeCalc(isNightMode) {
    const card = document.createElement('div');
    card.className = "astro-card";
    
    let data = {
        F: storage.get('F', 1000),
        A: storage.get('A', 200),
        b: storage.get('b', 27) // Field stop
    };

    const update = () => {
        const fRatio = data.F / data.A;
        const maxFov = (data.b / data.F) * 57.3;
        const dawes = 116 / data.A;
        const rayleigh = 138 / data.A;

        card.querySelector('#fratio-res').textContent = 'f/' + fRatio.toFixed(1);
        card.querySelector('#maxfov-res').textContent = maxFov.toFixed(2) + '°';
        card.querySelector('#res-res').textContent = dawes.toFixed(2) + '"';
    };

    const inputClass = "astro-input";
    const labelClass = "astro-label";

    card.innerHTML = `
        <h3 class="font-bold uppercase text-xs mb-4 ${isNightMode ? 'text-red-500' : 'text-blue-300'}">Teleszkóp Kalkulátor</h3>
        <div class="space-y-3 mb-4">
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="${labelClass}">Fókusz (F) mm</label>
                    <input type="number" id="tel-F" value="${data.F}" class="${inputClass}">
                </div>
                <div>
                    <label class="${labelClass}">Apertúra (A) mm</label>
                    <input type="number" id="tel-A" value="${data.A}" class="${inputClass}">
                </div>
            </div>
            <div>
                <label class="${labelClass}">Mezőrekesz (b) mm</label>
                <input type="number" id="tel-b" value="${data.b}" class="${inputClass}">
            </div>
        </div>
        <div class="grid grid-cols-3 gap-2 pt-3 border-t border-white/10">
            <div>
                <div class="${labelClass}">Fényerő</div>
                <div id="fratio-res" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div>
                <div class="${labelClass}">Max FoV</div>
                <div id="maxfov-res" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div>
                <div class="${labelClass}">Felbontás</div>
                <div id="res-res" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
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
