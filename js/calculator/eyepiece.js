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
    };

    const inputClass = "astro-input p-1 text-xs";
    const labelClass = "astro-label text-[10px]";

    card.innerHTML = `
        <h3 class="font-bold uppercase text-xs mb-4 ${isNightMode ? 'text-red-500' : 'text-blue-300'}">Okulár Kalkulátor</h3>
        <div class="space-y-3 mb-4 flex-grow">
            <div>
                <label class="${labelClass}">Okulár fókusz (e) mm ${createInfoBtn('Okulár Fókusztávolsága', 'Az okulár fókusztávolsága milliméterben. Meghatározza a nagyítást.')}</label>
                <input type="number" id="ep-e" value="${data.e}" class="${inputClass}">
            </div>
            
            <details class="mt-4 border border-white/10 rounded overflow-hidden">
                <summary class="bg-black/20 px-3 py-2 text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:bg-black/40 transition-colors ${isNightMode ? 'text-red-400' : 'text-blue-300'}">
                    Haladó beállítások
                </summary>
                <div class="p-3 space-y-3 bg-black/10">
                    <div>
                        <label class="${labelClass}">Mezőrekesz (b) mm ${createInfoBtn('Mezőrekesz (Field Stop)', 'Az okulár belsejében lévő fizikai gyűrű átmérője.')}</label>
                        <input type="number" id="ep-b" value="${data.b}" class="${inputClass}">
                    </div>
                    <div>
                        <label class="${labelClass}">Deklináció (Dec) ° ${createInfoBtn('Deklináció', 'Az égitest égi egyenlítőtől mért távolsága fokban.')}</label>
                        <input type="number" id="ep-dec" value="${data.dec}" class="${inputClass}">
                    </div>
                </div>
            </details>
        </div>
        <div class="grid grid-cols-2 gap-y-3 gap-x-2 pt-3 border-t border-white/10 mt-auto">
            <div>
                <div class="${labelClass}">Nagyítás ${createInfoBtn('Nagyítás', 'Hányszorosára nagyítja a távcső a képet. Képlet: Távcső fókusz / Okulár fókusz * Barlow.')}</div>
                <div id="mag-res" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div>
                <div class="${labelClass}">Kilépő Pupilla ${createInfoBtn('Kilépő Pupilla', 'A távcsőből kilépő fénynyaláb átmérője. Ha nagyobb, mint a szemed pupillája (kb. 7mm), fényt veszítesz. Ha túl kicsi (<0.5mm), a kép nagyon sötét lesz.')}</div>
                <div id="ep-res" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div>
                <div class="${labelClass}">Valós Látómező ${createInfoBtn('Valós Látómező (TFOV)', 'Az égboltnak az a része fokban, amit ténylegesen látsz a távcsőben. A Hold kb. 0.5 fok.')}</div>
                <div id="fov-res" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div>
                <div class="${labelClass}">Max Látómező ${createInfoBtn('Maximális Látómező', 'A távcső és az okulár mezőrekesze által fizikailag megengedett legnagyobb látómező.')}</div>
                <div id="maxfov-res" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div class="col-span-2">
                <div class="${labelClass}">Drift Idő (Átvonulás) ${createInfoBtn('Drift Idő', 'Mennyi idő alatt vonul át egy égitest a látómezőn kikapcsolt óragép (motor) esetén.')}</div>
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
