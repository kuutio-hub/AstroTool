import { storage, createInfoBtn, formatDuration } from '../utils.js';

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

        // Tripod Rule (500 Rule & NPF simplified)
        // 500 Rule: 500 / (F * Crop)
        // NPF (approx): (35*A + 30*p) / F  -- we need pixel pitch (p). 
        // Let's use a simplified NPF-like or just 500 rule for now, maybe 400 rule for safety.
        // User asked for "statívon állva".
        
        const crop = data.sensor === 'aps-c' ? 1.5 : (data.sensor === 'mft' ? 2.0 : 1.0);
        const effF = data.F * (data.B || 1);
        const rule500 = 500 / (effF * crop);
        const rule300 = 300 / (effF * crop); // Safer for high res

        card.querySelector('#exp-res').textContent = formatDuration(exposure);
        card.querySelector('#tripod-res').innerHTML = `
            <div class="flex justify-between text-xs">
                <span>500-as szabály:</span> <span class="font-mono font-bold">${rule500.toFixed(1)} s</span>
            </div>
            <div class="flex justify-between text-xs">
                <span>300-as szabály (biztosabb):</span> <span class="font-mono font-bold">${rule300.toFixed(1)} s</span>
            </div>
        `;
    };

    const inputClass = "astro-input p-1 text-xs w-full";
    const labelClass = "astro-label text-[10px] block truncate";

    card.innerHTML = `
        <h3 class="font-bold uppercase text-xs mb-4 ${isNightMode ? 'text-red-500' : 'text-blue-300'}">Expó Kalkulátor</h3>
        <div class="space-y-3 mb-4 flex-grow overflow-y-auto pr-1 custom-scrollbar">
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
            
            <div class="mt-2">
                <label class="${labelClass}">Szenzor Méret (Crop)</label>
                <select id="exp-sensor" class="${inputClass}">
                    <option value="ff" ${data.sensor === 'ff' ? 'selected' : ''}>Full Frame (1.0x)</option>
                    <option value="aps-c" ${data.sensor === 'aps-c' ? 'selected' : ''}>APS-C (1.5x)</option>
                    <option value="mft" ${data.sensor === 'mft' ? 'selected' : ''}>Micro 4/3 (2.0x)</option>
                </select>
            </div>

            <div class="p-3 rounded bg-white/5 border border-white/10 mt-2">
                <div class="${labelClass} mb-1 text-center font-bold">Statív (Tripod) Limit ${createInfoBtn('Statív Szabályok', '<div class="text-center text-lg font-mono mb-4">T<sub>500</sub> = <div class="inline-block align-middle text-center"><div class="border-b border-current">500</div><div>F &times; Crop</div></div></div><div class="text-xs text-left space-y-1"><div><strong>T<sub>500</sub>:</strong> Max expó idő (s)</div><div><strong>F:</strong> Fókusz (mm)</div><div><strong>Crop:</strong> Szenzor szorzó</div></div>')}</div>
                <div id="tripod-res" class="space-y-1 ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
                <div class="text-[9px] opacity-60 text-center mt-1">A csillagok bemozdulása nélküli maximális idő.</div>
            </div>
            
            <details class="mt-4 border border-white/10 rounded overflow-hidden group">
                <summary class="bg-black/20 px-3 py-2 text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:bg-black/40 transition-colors flex justify-between items-center ${isNightMode ? 'text-red-400' : 'text-blue-300'}">
                    <span>Haladó (Követéses)</span>
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
            <div class="${labelClass}">Ideális Expó (Követéssel) ${createInfoBtn('Ideális Expó', '<div class="text-center text-lg font-mono mb-4">T = <div class="inline-block align-middle text-center"><div class="border-b border-current">ff</div><div>ISO</div></div> &times; (f/ratio)<sup>2</sup> &times; 2.512<sup>sb</sup></div><div class="text-xs text-left space-y-1"><div><strong>T:</strong> Expó idő (s)</div><div><strong>ff:</strong> Szűrő faktor</div><div><strong>ISO:</strong> Érzékenység</div><div><strong>f/ratio:</strong> Fényerő</div><div><strong>sb:</strong> Égbolt fényesség</div></div>')}</div>
            <div id="exp-res" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
        </div>
        
    `;

    card.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('input', (e) => {
            const key = e.target.id.split('-')[1];
            data[key] = e.target.type === 'number' ? (parseFloat(e.target.value) || 0) : e.target.value;
            if (key !== 'sensor') storage.set(key, data[key]); // Don't persist sensor yet or add to storage
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
