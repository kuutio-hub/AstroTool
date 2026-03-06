import { storage } from '../utils.js';

export function createLunarCalc(isNightMode) {
    const card = document.createElement('div');
    card.className = "astro-card";
    
    let data = {
        F: storage.get('F', 1000),
        B: storage.get('B', 1),
        a: storage.get('a', 50),
        e: storage.get('e', 25),
        p: storage.get('p', 4.3)
    };

    const update = () => {
        // Visual Lunar Size
        const tfov = (data.a * data.e) / (data.F * data.B);
        const lunarSizeKm = 2 * Math.tan((tfov * Math.PI / 180) / 2) * 384400;

        // Imaging Lunar Pixel Size (1km on moon = ~0.536 arcsec)
        const effF = data.F * data.B;
        const res = (data.p / effF) * 206.3;
        const kmInPixels = 0.536 / res;

        card.querySelector('#lun-vis').textContent = lunarSizeKm.toFixed(0) + ' km';
        card.querySelector('#lun-img').textContent = kmInPixels.toFixed(1) + ' px';
    };

    const inputClass = "astro-input";
    const labelClass = "astro-label";

    card.innerHTML = `
        <h3 class="font-bold uppercase text-xs mb-4 ${isNightMode ? 'text-red-500' : 'text-blue-300'}">Hold Geometria</h3>
        <div class="space-y-3 mb-4">
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="${labelClass}">Fókusz (F) mm</label>
                    <input type="number" id="lun-F" value="${data.F}" class="${inputClass}">
                </div>
                <div>
                    <label class="${labelClass}">Barlow (B) x</label>
                    <input type="number" id="lun-B" value="${data.B}" class="${inputClass}">
                </div>
            </div>
            <div class="grid grid-cols-3 gap-2">
                <div>
                    <label class="${labelClass}">AFoV (a) °</label>
                    <input type="number" id="lun-a" value="${data.a}" class="${inputClass}">
                </div>
                <div>
                    <label class="${labelClass}">Okulár (e) mm</label>
                    <input type="number" id="lun-e" value="${data.e}" class="${inputClass}">
                </div>
                <div>
                    <label class="${labelClass}">Pixel (p) µm</label>
                    <input type="number" id="lun-p" value="${data.p}" class="${inputClass}">
                </div>
            </div>
        </div>
        <div class="grid grid-cols-2 gap-2 pt-3 border-t border-white/10">
            <div>
                <div class="${labelClass}">Vizuális Látómező (Hold felszín)</div>
                <div id="lun-vis" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div>
                <div class="${labelClass}">1 km a Holdon (Fotós)</div>
                <div id="lun-img" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
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
