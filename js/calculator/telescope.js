import { storage, createInfoBtn } from '../utils.js';

export function createTelescopeCalc(isNightMode) {
    const card = document.createElement('div');
    card.className = "astro-card h-full flex flex-col";
    
    let data = {
        F: storage.get('F', 1000),
        A: storage.get('A', 200),
        bortle: storage.get('bortle', 4),
        obs: storage.get('obs', 0), // Obstruction %
        trans: storage.get('trans', 90) // Transmission %
    };

    const update = () => {
        const fRatio = data.F / data.A;
        const dawes = 116 / data.A;
        const rayleigh = 138 / data.A;
        
        // Effective aperture considering obstruction
        const effA = Math.sqrt(Math.pow(data.A, 2) - Math.pow(data.A * (data.obs / 100), 2));
        
        // Light gathering power compared to 7mm eye pupil, with transmission
        const lightGathering = Math.pow(effA / 7, 2) * (data.trans / 100);
        
        // Limiting magnitude based on Bortle
        // NELM approx: B1=7.8, B2=7.3, B3=6.8, B4=6.3, B5=5.8, B6=5.3, B7=4.8, B8=4.3, B9=3.8
        const nelm = 8.3 - (data.bortle * 0.5);
        const limitingMag = nelm + 5 * Math.log10(effA / 7) + 2.5 * Math.log10(data.trans / 100);

        card.querySelector('#fratio-res').textContent = 'f/' + fRatio.toFixed(1);
        card.querySelector('#dawes-res').textContent = dawes.toFixed(2) + '"';
        card.querySelector('#rayleigh-res').textContent = rayleigh.toFixed(2) + '"';
        card.querySelector('#mag-res').textContent = limitingMag.toFixed(1) + ' mag';
        card.querySelector('#light-res').textContent = Math.round(lightGathering) + 'x';
    };

    const inputClass = "astro-input p-1 text-xs";
    const labelClass = "astro-label text-[10px]";

    card.innerHTML = `
        <h3 class="font-bold uppercase text-xs mb-4 ${isNightMode ? 'text-red-500' : 'text-blue-300'}">Teleszkóp Kalkulátor</h3>
        <div class="space-y-3 mb-4 flex-grow">
            <div>
                <label class="${labelClass}">Bortle Skála (1-9) ${createInfoBtn('Bortle Skála', 'Az égbolt fényszennyezettségét mérő skála. 1: tökéletesen sötét, 9: belváros. Meghatározza a határmagnitúdót.')}</label>
                <input type="number" id="tel-bortle" value="${data.bortle}" class="${inputClass}" min="1" max="9" step="0.1">
            </div>
            
            <details class="mb-4 border border-white/10 rounded overflow-hidden group">
                <summary class="bg-black/20 px-3 py-2 text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:bg-black/40 transition-colors flex justify-between items-center ${isNightMode ? 'text-red-400' : 'text-blue-300'}">
                    <span>Paraméterek</span>
                    <svg class="w-3 h-3 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </summary>
                <div class="p-3 space-y-3 bg-black/10">
                    <div>
                        <label class="${labelClass}">Központi kitakarás % ${createInfoBtn('Központi kitakarás', 'Tükrös távcsöveknél a segédtükör által kitakart terület százalékos aránya az átmérőhöz képest. Csökkenti a kontrasztot.')}</label>
                        <input type="number" id="tel-obs" value="${data.obs}" class="${inputClass}" min="0" max="100">
                    </div>
                    <div>
                        <label class="${labelClass}">Transzmisszió % ${createInfoBtn('Transzmisszió', 'A lencsék és tükrök fényáteresztő/visszaverő képessége. Általában 85-95%.')}</label>
                        <input type="number" id="tel-trans" value="${data.trans}" class="${inputClass}" min="1" max="100">
                    </div>
                </div>
            </details>
        </div>
        <div class="grid grid-cols-2 gap-y-3 gap-x-2 pt-3 border-t border-white/10 mt-auto">
            <div>
                <div class="${labelClass}">Fényerő ${createInfoBtn('Fényerő (F-szám)', 'A fókusztávolság és az apertúra hányadosa. Kisebb szám = "gyorsabb" távcső, ami rövidebb expozíciós időt igényel fotózásnál.')}</div>
                <div id="fratio-res" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div>
                <div class="${labelClass}">Határmagnitúdó ${createInfoBtn('Határmagnitúdó', 'A leghalványabb csillag, amit még éppen meg lehet pillantani a távcsővel. Függ a távcső átmérőjétől, a transzmissziótól és az égbolt sötétségétől (Bortle).')}</div>
                <div id="mag-res" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div>
                <div class="${labelClass}">Dawes Határ ${createInfoBtn('Dawes Határ', 'A távcső elméleti felbontóképessége ívmásodpercben. Két egyforma fényességű csillag minimális távolsága, amit még különállónak látunk.')}</div>
                <div id="dawes-res" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div>
                <div class="${labelClass}">Rayleigh Határ ${createInfoBtn('Rayleigh Határ', 'Egy másik, szigorúbb elméleti felbontási határ. Általában ezt használják a kontrasztos részletek felbontásának meghatározására.')}</div>
                <div id="rayleigh-res" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div class="col-span-2">
                <div class="${labelClass}">Fénygyűjtő Képesség ${createInfoBtn('Fénygyűjtő Képesség', 'Megmutatja, hogy a távcső hányszor több fényt gyűjt össze, mint egy átlagos emberi szem (7mm-es pupillával számolva).')}</div>
                <div id="light-res" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
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
