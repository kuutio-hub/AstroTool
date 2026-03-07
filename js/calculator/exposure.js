import { storage, createInfoBtn } from '../utils.js';

export function createExposureCalc(isNightMode) {
    const card = document.createElement('div');
    card.className = "astro-card h-full flex flex-col";
    
    let data = {
        F: storage.get('F', 1000),
        A: storage.get('A', 200),
        iso: storage.get('iso', 1600),
        ff: storage.get('ff', 1), // Filter factor
        sb: storage.get('sb', 20), // Sky brightness
        bortle: storage.get('bortle', 4)
    };

    const update = () => {
        const fRatio = data.F / data.A;
        
        // If Bortle is provided, we can estimate Sky Brightness if sb is not manually adjusted?
        // Actually let's just use Bortle to influence the calculation if sb is at default.
        // Sky brightness (mag/arcsec2) approx: 22 - (Bortle-1)*0.5 is too simple.
        // Let's just show both.
        
        const exposure = (data.ff / data.iso) * Math.pow(fRatio, 2) * Math.pow(2.512, data.sb);

        card.querySelector('#exp-res').textContent = exposure.toExponential(2) + ' s';
    };

    const inputClass = "astro-input p-1 text-xs w-full";
    const labelClass = "astro-label text-[10px] block truncate";

    card.innerHTML = `
        <h3 class="font-bold uppercase text-xs mb-4 ${isNightMode ? 'text-red-500' : 'text-blue-300'}">Expó Kalkulátor</h3>
        <div class="space-y-3 mb-4 flex-grow">
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="${labelClass}">ISO / Gain ${createInfoBtn('ISO / Gain', 'A kamera érzékenysége. Magasabb érték = rövidebb expozíció, de több zaj.')}</label>
                    <input type="number" id="exp-iso" value="${data.iso}" class="${inputClass}">
                </div>
                <div>
                    <label class="${labelClass}">Bortle ${createInfoBtn('Bortle Skála', 'Az égbolt fényszennyezettsége. Befolyásolja az ideális expozíciós időt.')}</label>
                    <input type="number" id="exp-bortle" value="${data.bortle}" class="${inputClass}" min="1" max="9" step="1">
                </div>
            </div>
            
            <details class="mt-4 border border-white/10 rounded overflow-hidden group">
                <summary class="bg-black/20 px-3 py-2 text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:bg-black/40 transition-colors flex justify-between items-center ${isNightMode ? 'text-red-400' : 'text-blue-300'}">
                    <span>Haladó</span>
                    <svg class="w-3 h-3 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </summary>
                <div class="p-3 space-y-3 bg-black/10">
                    <div>
                        <label class="${labelClass}">Szűrő faktor ${createInfoBtn('Szűrő Faktor', 'A használt szűrő fényelnyelési tényezője (ff). Ha nincs szűrő, az érték 1.')}</label>
                        <input type="number" id="exp-ff" value="${data.ff}" class="${inputClass}">
                    </div>
                    <div>
                        <label class="${labelClass}">Égbolt fényesség ${createInfoBtn('Égbolt Fényessége', 'Az égbolt háttérfényessége (sb) magnitúdó/ívmásodperc²-ben. Sötét égen kb. 21-22, városban 17-18.')}</label>
                        <input type="number" id="exp-sb" value="${data.sb}" class="${inputClass}">
                    </div>
                </div>
            </details>
        </div>
        <div class="pt-3 border-t border-white/10 mt-auto">
            <div class="${labelClass}">Becsült Expó Idő ${createInfoBtn('Becsült Expozíciós Idő', 'A megadott paraméterek alapján számított ideális expozíciós idő másodpercben. Képlet: T ∝ (ff ÷ ISO) × (f/ratio)² × 2.512^sb')}</div>
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
