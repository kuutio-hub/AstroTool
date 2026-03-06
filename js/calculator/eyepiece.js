import { storage } from '../utils.js';

export function createEyepieceCalc(isNightMode) {
    const card = document.createElement('div');
    card.className = "astro-card";
    
    let data = {
        F: storage.get('F', 1000),
        A: storage.get('A', 200),
        e: storage.get('e', 25),
        a: storage.get('a', 50),
        B: storage.get('B', 1)
    };

    const update = () => {
        const mag = (data.F / data.e) * data.B;
        const fov = (data.a * data.e) / (data.F * data.B);
        const ep = (data.A * data.e) / data.F; // Exit pupil

        card.querySelector('#mag-res').textContent = mag.toFixed(1) + 'x';
        card.querySelector('#fov-res').textContent = fov.toFixed(2) + '°';
        card.querySelector('#ep-res').textContent = ep.toFixed(2) + ' mm';
    };

    const inputClass = "astro-input";
    const labelClass = "astro-label";

    card.innerHTML = `
        <h3 class="font-bold uppercase text-xs mb-4 ${isNightMode ? 'text-red-500' : 'text-blue-300'}">Okulár Kalkulátor</h3>
        <div class="space-y-3 mb-4">
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="${labelClass}">Távcső Fókusz (F) mm</label>
                    <input type="number" id="ep-F" value="${data.F}" class="${inputClass}">
                </div>
                <div>
                    <label class="${labelClass}">Apertúra (A) mm</label>
                    <input type="number" id="ep-A" value="${data.A}" class="${inputClass}">
                </div>
            </div>
            <div class="grid grid-cols-3 gap-2">
                <div>
                    <label class="${labelClass}">Okulár (e) mm</label>
                    <input type="number" id="ep-e" value="${data.e}" class="${inputClass}">
                </div>
                <div>
                    <label class="${labelClass}">AFoV (a) °</label>
                    <input type="number" id="ep-a" value="${data.a}" class="${inputClass}">
                </div>
                <div>
                    <label class="${labelClass}">Barlow (B) x</label>
                    <input type="number" id="ep-B" value="${data.B}" class="${inputClass}">
                </div>
            </div>
        </div>
        <div class="grid grid-cols-3 gap-2 pt-3 border-t border-white/10">
            <div>
                <div class="${labelClass}">Nagyítás</div>
                <div id="mag-res" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div>
                <div class="${labelClass}">Látómező</div>
                <div id="fov-res" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div>
                <div class="${labelClass}">Kilépő Pupilla</div>
                <div id="ep-res" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
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
