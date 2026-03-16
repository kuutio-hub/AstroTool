import { storage, createInfoBtn } from '../utils.js';

export function createEyepieceCalc(isNightMode) {
    const card = document.createElement('div');
    card.className = "astro-card h-full flex flex-col";
    
    let data = {
        F: storage.get('F', 1000),
        A: storage.get('A', 200),
        a: storage.get('a', 50),
        B: storage.get('B', 1),
        e: storage.get('e', 25), // Eyepiece focal length
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

        let epWarning = '';
        let epColor = isNightMode ? 'text-red-400' : 'text-white';
        if (ep > 7) {
            epWarning = 'Túl nagy kilépő pupilla – fényveszteség.';
            epColor = 'text-yellow-500';
        } else if (ep < 0.5) {
            epWarning = 'Túl kicsi kilépő pupilla – diffrakció dominál.';
            epColor = 'text-yellow-500';
        } else {
            epWarning = 'Optimális tartomány.';
            epColor = 'text-green-500';
        }
        card.querySelector('#ep-res').className = `font-mono font-bold text-lg ${epColor}`;
        card.querySelector('#ep-warning').textContent = epWarning;
        card.querySelector('#ep-warning').className = `text-[9px] mt-1 ${epColor} opacity-80`;
    };

    const inputClass = "astro-input p-1 text-xs w-full";
    const labelClass = "astro-label text-[10px] block truncate";

    card.innerHTML = `
        <h3 class="font-bold uppercase text-xs mb-4 ${isNightMode ? 'text-red-500' : 'text-blue-300'}">Okulár Kalkulátor</h3>
        <div class="space-y-3 mb-4 flex-grow custom-scrollbar overflow-y-auto pr-1">
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="${labelClass}">Fókusztávolság (mm) ${createInfoBtn('Okulár Fókusztávolsága', 'Az okulár fókusztávolsága milliméterben (e). Meghatározza a nagyítást. Kisebb szám = nagyobb nagyítás.')}</label>
                    <input type="number" id="ep-e" value="${data.e}" class="${inputClass}">
                </div>
                <div>
                    <label class="${labelClass}">Látszólagos látómező (°) ${createInfoBtn('Látszólagos Látómező', 'Az okulár látszólagos látómezeje fokban (AFoV). Ezt a gyártó adja meg. Példa: Plössl 50°, UWA 82°.')}</label>
                    <input type="number" id="ep-a" value="${data.a}" class="${inputClass}">
                </div>
            </div>
            
            <details class="mt-4 border border-white/10 rounded overflow-hidden group">
                <summary class="bg-black/20 px-3 py-2 text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:bg-black/40 transition-colors flex justify-between items-center ${isNightMode ? 'text-red-400' : 'text-blue-300'}">
                    <span>Haladó</span>
                    <svg class="w-3 h-3 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </summary>
                <div class="p-3 space-y-3 bg-black/10">
                    <div>
                        <label class="${labelClass}">Mezőrekesz (mm) ${createInfoBtn('Mezőrekesz (Field Stop)', 'Az okulár belsejében lévő fizikai gyűrű átmérője (b), amely korlátozza a maximális látómezőt.')}</label>
                        <input type="number" id="ep-b" value="${data.b}" class="${inputClass}">
                    </div>
                    <div>
                        <label class="${labelClass}">Deklináció (°) ${createInfoBtn('Deklináció', 'Az égitest égi egyenlítőtől mért távolsága fokban (Dec). Szükséges az átvonulási (drift) idő pontos kiszámításához.')}</label>
                        <input type="number" id="ep-dec" value="${data.dec}" class="${inputClass}">
                    </div>
                </div>
            </details>
        </div>
        <div class="grid grid-cols-2 gap-y-3 gap-x-2 pt-3 border-t border-white/10 mt-auto">
            <div>
                <div class="${labelClass}">Nagyítás ${createInfoBtn('Nagyítás', '<div class="text-center text-lg font-mono mb-4">M = (<div class="inline-block align-middle text-center"><div class="border-b border-current">F</div><div>e</div></div>) &times; B</div><div class="text-xs text-left space-y-1"><div><strong>M:</strong> Nagyítás (x)</div><div><strong>F:</strong> Távcső fókusz</div><div><strong>e:</strong> Okulár fókusz</div><div><strong>B:</strong> Barlow/Reducer</div></div>')}</div>
                <div id="mag-res" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div>
                <div class="${labelClass}">Kilépő Pupilla ${createInfoBtn('Kilépő Pupilla', '<div class="text-center text-lg font-mono mb-4">EP = <div class="inline-block align-middle text-center"><div class="border-b border-current">A</div><div>M</div></div></div><div class="text-xs text-left space-y-1"><div><strong>EP:</strong> Kilépő pupilla (mm)</div><div><strong>A:</strong> Apertúra</div><div><strong>M:</strong> Nagyítás</div></div>')}</div>
                <div id="ep-res" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
                <div id="ep-warning" class="text-[9px] mt-1"></div>
            </div>
            <div>
                <div class="${labelClass}">Valós Látómező ${createInfoBtn('Valós Látómező', '<div class="text-center text-lg font-mono mb-4">TFoV = <div class="inline-block align-middle text-center"><div class="border-b border-current">AFoV</div><div>M</div></div></div><div class="text-xs text-left space-y-1"><div><strong>TFoV:</strong> Valós látómező (°)</div><div><strong>AFoV:</strong> Látszólagos látómező</div><div><strong>M:</strong> Nagyítás</div></div>')}</div>
                <div id="fov-res" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div>
                <div class="${labelClass}">Max Látómező ${createInfoBtn('Max Látómező', '<div class="text-center text-lg font-mono mb-4">FoV<sub>max</sub> = (<div class="inline-block align-middle text-center"><div class="border-b border-current">b</div><div>F</div></div>) &times; 57.3</div><div class="text-xs text-left space-y-1"><div><strong>FoV<sub>max</sub>:</strong> Max látómező (°)</div><div><strong>b:</strong> Mezőrekesz (mm)</div><div><strong>F:</strong> Távcső fókusz</div></div>')}</div>
                <div id="maxfov-res" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div class="col-span-2">
                <div class="${labelClass}">Drift Idő (Átvonulás) ${createInfoBtn('Drift Idő', '<div class="text-center text-lg font-mono mb-4">T = <div class="inline-block align-middle text-center"><div class="border-b border-current">TFoV &times; 4</div><div>cos(Dec)</div></div></div><div class="text-xs text-left space-y-1"><div><strong>T:</strong> Átvonulási idő (perc)</div><div><strong>TFoV:</strong> Valós látómező</div><div><strong>Dec:</strong> Deklináció</div></div>')}</div>
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
