import { storage, createInfoBtn } from '../utils.js';

export function createImagingCalc(isNightMode) {
    const card = document.createElement('div');
    card.className = "astro-card h-full flex flex-col";
    
    let data = {
        F: storage.get('F', 1000),
        B: storage.get('B', 1),
        w: storage.get('w', 22.3), // Sensor width
        h: storage.get('h', 14.9), // Sensor height
        p: storage.get('p', 4.3),   // Pixel size
        seeing: storage.get('seeing', 2.0), // Seeing limit in arcsec
        seeingMode: storage.get('seeingMode', 'scale'), // Default to scale
        bin: storage.get('bin', 1) // Binning
    };

    const update = () => {
        const effF = data.F * data.B;
        const fovW = (data.w / effF) * 57.3;
        const fovH = (data.h / effF) * 57.3;
        const fovWArcmin = fovW * 60;
        const fovHArcmin = fovH * 60;
        
        // Effective pixel size with binning
        const effP = data.p * data.bin;
        const res = (effP / effF) * 206.3;
        
        // Sensor diagonal
        const diag = Math.sqrt(Math.pow(data.w, 2) + Math.pow(data.h, 2));
        
        // Nyquist sampling: optimal is seeing / 3
        const optimalRes = data.seeing / 3;
        let samplingStatus = '';
        if (res > optimalRes * 1.2) samplingStatus = 'Alulmintavételezett (Undersampled)';
        else if (res < optimalRes * 0.8) samplingStatus = 'Túlmintavételezett (Oversampled)';
        else samplingStatus = 'Optimális';

        card.querySelector('#img-effF').textContent = effF.toFixed(0) + ' mm';
        card.querySelector('#img-fov').textContent = `${fovW.toFixed(2)}° x ${fovH.toFixed(2)}°`;
        card.querySelector('#img-fov-arcmin').textContent = `${fovWArcmin.toFixed(0)}' x ${fovHArcmin.toFixed(0)}'`;
        card.querySelector('#img-res').textContent = res.toFixed(2) + '"/px';
        card.querySelector('#img-sampling').textContent = samplingStatus;
        card.querySelector('#img-diag').textContent = diag.toFixed(1) + ' mm';
        
        // Update seeing input label/value if in scale mode
        const seeingInput = card.querySelector('#img-seeing');
        const seeingLabel = card.querySelector('#seeing-label-text');
        if (data.seeingMode === 'scale') {
            const scaleVal = (5.5 - data.seeing) / 0.5;
            seeingInput.value = scaleVal.toFixed(1);
            seeingInput.step = "0.5";
            seeingInput.min = "1";
            seeingInput.max = "10";
            seeingLabel.textContent = 'Seeing Skála (1-10)';
        } else {
            seeingInput.value = data.seeing.toFixed(1);
            seeingInput.step = "0.1";
            seeingInput.min = "0.1";
            seeingInput.max = "10";
            seeingLabel.textContent = 'Seeing (Ívmásodperc)';
        }
    };

    const inputClass = "astro-input p-1 text-xs w-full";
    const labelClass = "astro-label text-[10px] block truncate";

    card.innerHTML = `
        <h3 class="font-bold uppercase text-xs mb-4 ${isNightMode ? 'text-red-500' : 'text-blue-300'}">Fotós Kalkulátor</h3>
        <div class="space-y-3 mb-4 flex-grow">
            <div>
                <div class="flex justify-between items-center mb-1">
                    <label class="${labelClass} mb-0"><span id="seeing-label-text">Seeing</span> ${createInfoBtn('Seeing', 'A légkör nyugodtságát jelzi. Átváltható ívmásodperc (arcsec) és 1-10-es skála között. 10: tökéletes, 1: nagyon rossz.')}</label>
                    <button id="toggle-seeing-mode" class="text-[9px] uppercase font-bold opacity-50 hover:opacity-100 transition-all border border-white/10 px-1 rounded">Váltás</button>
                </div>
                <input type="number" id="img-seeing" value="${data.seeing}" class="${inputClass}" step="0.1">
            </div>
            
            <details class="mt-4 border border-white/10 rounded overflow-hidden group">
                <summary class="bg-black/20 px-3 py-2 text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:bg-black/40 transition-colors flex justify-between items-center ${isNightMode ? 'text-red-400' : 'text-blue-300'}">
                    <span>Szenzor Paraméterek</span>
                    <svg class="w-3 h-3 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </summary>
                <div class="p-3 space-y-3 bg-black/10">
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="${labelClass}">Szenzor szélesség (mm) ${createInfoBtn('Szenzor Szélesség', 'A kamera szenzorának fizikai szélessége milliméterben (w).')}</label>
                            <input type="number" id="img-w" value="${data.w}" class="${inputClass}" step="0.1">
                        </div>
                        <div>
                            <label class="${labelClass}">Szenzor magasság (mm) ${createInfoBtn('Szenzor Magasság', 'A kamera szenzorának fizikai magassága milliméterben (h).')}</label>
                            <input type="number" id="img-h" value="${data.h}" class="${inputClass}" step="0.1">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="${labelClass}">Pixelméret (µm) ${createInfoBtn('Pixel Méret', 'A kamera egyetlen pixelének mérete mikrométerben (p).')}</label>
                            <input type="number" id="img-p" value="${data.p}" class="${inputClass}" step="0.1">
                        </div>
                        <div>
                            <label class="${labelClass}">Binning ${createInfoBtn('Binning', 'Több pixel összevonása egy nagyobb pixellé (bin).')} </label>
                            <input type="number" id="img-bin" value="${data.bin}" class="${inputClass}" min="1" step="1">
                        </div>
                    </div>
                </div>
            </details>
        </div>
        <div class="grid grid-cols-2 gap-y-3 gap-x-2 pt-3 border-t border-white/10 mt-auto">
            <div>
                <div class="${labelClass}">Effektív Fókusz ${createInfoBtn('Effektív Fókusz', 'A távcső és a Barlow/Reducer együttes fókusztávolsága. Képlet: F_eff = F * B')}</div>
                <div id="img-effF" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div>
                <div class="${labelClass}">Felbontás ${createInfoBtn('Képpont Felbontás', 'Egy pixel hány ívmásodpercnyi területet fed le az égen. Képlet: R = (p * bin / F_eff) * 206.3. Ideális esetben a Seeing értékének harmada (Nyquist).')}</div>
                <div id="img-res" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div>
                <div class="${labelClass}">Látómező (Fok) ${createInfoBtn('Látómező (Fok)', 'A kamera által rögzített terület mérete az égen fokban. Képlet: FoV = (S / F_eff) * 57.3')}</div>
                <div id="img-fov" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div>
                <div class="${labelClass}">Látómező (Ívperc) ${createInfoBtn('Látómező (Ívperc)', 'A kamera által rögzített terület mérete az égen ívpercben (1 fok = 60 ívperc).')}</div>
                <div id="img-fov-arcmin" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div>
                <div class="${labelClass}">Szenzor Átló ${createInfoBtn('Szenzor Átló', 'A szenzor átlója milliméterben. Képlet: d = sqrt(w^2 + h^2)')}</div>
                <div id="img-diag" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div class="col-span-2">
                <div class="${labelClass}">Nyquist Mintavételezés ${createInfoBtn('Nyquist Mintavételezés', 'Megmutatja, hogy a kamera felbontása (pixelméret) és a távcső fókusza mennyire illeszkedik az aktuális légköri nyugodtsághoz (Seeing).')}</div>
                <div id="img-sampling" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
        </div>
    `;

    card.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', (e) => {
            const key = e.target.id.split('-')[1];
            let val = parseFloat(e.target.value) || 0;
            
            if (key === 'seeing' && data.seeingMode === 'scale') {
                // Convert scale back to arcsec
                val = 5.5 - (val * 0.5);
            }
            
            data[key] = val;
            storage.set(key, data[key]);
            update();
        });
    });

    card.querySelector('#toggle-seeing-mode').onclick = () => {
        data.seeingMode = data.seeingMode === 'arcsec' ? 'scale' : 'arcsec';
        storage.set('seeingMode', data.seeingMode);
        update();
    };

    window.addEventListener('astro-settings-changed', (e) => {
        data = { ...data, ...e.detail };
        update();
    });

    update();
    return card;
}
