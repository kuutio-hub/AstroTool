import { storage, createInfoBtn } from '../utils.js';

export function createExposureCalc(isNightMode) {
    const card = document.createElement('div');
    card.className = "astro-card h-full flex flex-col";
    
    let data = {
        F: storage.get('F', 1000),
        A: storage.get('A', 200),
        iso: storage.get('iso', 1600),
        ff: storage.get('ff', 1), // Filter factor
        sb: storage.get('sb', 20) // Sky brightness
    };

    const update = () => {
        const fRatio = data.F / data.A;
        const exposure = (data.ff / data.iso) * Math.pow(fRatio, 2) * Math.pow(2.512, data.sb);

        card.querySelector('#exp-res').textContent = exposure.toExponential(2) + ' s';
    };

    const inputClass = "astro-input p-1 text-xs";
    const labelClass = "astro-label text-[10px]";

    card.innerHTML = `
        <h3 class="font-bold uppercase text-xs mb-4 ${isNightMode ? 'text-red-500' : 'text-blue-300'}">Expó Kalkulátor</h3>
        <div class="space-y-3 mb-4 flex-grow">
            <div class="grid grid-cols-3 gap-2">
                <div>
                    <label class="${labelClass}">ISO ${createInfoBtn('ISO / Gain', 'A kamera érzékenysége.')}</label>
                    <input type="number" id="exp-iso" value="${data.iso}" class="${inputClass}">
                </div>
                <div>
                    <label class="${labelClass}">Filter ${createInfoBtn('Szűrő Faktor', 'A használt szűrő fényelnyelési tényezője.')}</label>
                    <input type="number" id="exp-ff" value="${data.ff}" class="${inputClass}">
                </div>
                <div>
                    <label class="${labelClass}">Sky Br. ${createInfoBtn('Égbolt Fényessége', 'Az égbolt háttérfényessége magnitúdó/ívmásodperc²-ben.')}</label>
                    <input type="number" id="exp-sb" value="${data.sb}" class="${inputClass}">
                </div>
            </div>
        </div>
        <div class="pt-3 border-t border-white/10 mt-auto">
            <div class="${labelClass}">Becsült Expó Idő ${createInfoBtn('Becsült Expozíciós Idő', 'A megadott paraméterek alapján számított ideális expozíciós idő másodpercben (tájékoztató jellegű).')}</div>
            <div id="exp-res" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
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
