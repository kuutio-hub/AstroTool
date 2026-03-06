import { storage } from '../utils.js';

export function createImagingCalc(isNightMode) {
    const card = document.createElement('div');
    card.className = "astro-card";
    
    let data = {
        F: storage.get('F', 1000),
        B: storage.get('B', 1),
        w: storage.get('w', 22.3), // Sensor width
        h: storage.get('h', 14.9), // Sensor height
        p: storage.get('p', 4.3)   // Pixel size
    };

    const update = () => {
        const effF = data.F * data.B;
        const fovW = (data.w / effF) * 57.3;
        const fovH = (data.h / effF) * 57.3;
        const res = (data.p / effF) * 206.3;

        card.querySelector('#img-fov').textContent = `${fovW.toFixed(2)}° x ${fovH.toFixed(2)}°`;
        card.querySelector('#img-res').textContent = res.toFixed(2) + '"/px';
    };

    const inputClass = "astro-input";
    const labelClass = "astro-label";

    card.innerHTML = `
        <h3 class="font-bold uppercase text-xs mb-4 ${isNightMode ? 'text-red-500' : 'text-blue-300'}">Fotós Kalkulátor</h3>
        <div class="space-y-3 mb-4">
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="${labelClass}">Fókusz (F) mm</label>
                    <input type="number" id="img-F" value="${data.F}" class="${inputClass}">
                </div>
                <div>
                    <label class="${labelClass}">Barlow (B) x</label>
                    <input type="number" id="img-B" value="${data.B}" class="${inputClass}">
                </div>
            </div>
            <div class="grid grid-cols-3 gap-2">
                <div>
                    <label class="${labelClass}">Szenzor W (mm)</label>
                    <input type="number" id="img-w" value="${data.w}" class="${inputClass}">
                </div>
                <div>
                    <label class="${labelClass}">Szenzor H (mm)</label>
                    <input type="number" id="img-h" value="${data.h}" class="${inputClass}">
                </div>
                <div>
                    <label class="${labelClass}">Pixel (µm)</label>
                    <input type="number" id="img-p" value="${data.p}" class="${inputClass}">
                </div>
            </div>
        </div>
        <div class="grid grid-cols-2 gap-2 pt-3 border-t border-white/10">
            <div>
                <div class="${labelClass}">Látómező (FoV)</div>
                <div id="img-fov" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div>
                <div class="${labelClass}">Felbontás</div>
                <div id="img-res" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
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
