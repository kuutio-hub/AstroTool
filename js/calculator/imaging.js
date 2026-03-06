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
    };

    const inputClass = "astro-input";
    const labelClass = "astro-label";

    card.innerHTML = `
        <h3 class="font-bold uppercase text-xs mb-4 ${isNightMode ? 'text-red-500' : 'text-blue-300'}">Fotós Kalkulátor</h3>
        <div class="space-y-3 mb-4 flex-grow">
            <div>
                <label class="${labelClass}">Seeing (Légköri nyugodtság) " ${createInfoBtn('Seeing', 'A légkör nyugodtságát jelzi ívmásodpercben. Átlagos éjszakákon 2.0" - 3.0" közötti. Meghatározza, hogy milyen felbontású képet érdemes készíteni (Nyquist-kritérium).')}</label>
                <input type="number" id="img-seeing" value="${data.seeing}" class="${inputClass}" step="0.1">
            </div>
            
            <details class="mt-4 border border-white/10 rounded overflow-hidden">
                <summary class="bg-black/20 px-3 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-black/40 transition-colors ${isNightMode ? 'text-red-400' : 'text-blue-300'}">
                    Haladó beállítások (Szenzor)
                </summary>
                <div class="p-3 space-y-3 bg-black/10">
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="${labelClass}">Szenzor W (mm) ${createInfoBtn('Szenzor Szélesség', 'A kamera szenzorának fizikai szélessége milliméterben. Pl. APS-C esetén kb. 22.3 mm.')}</label>
                            <input type="number" id="img-w" value="${data.w}" class="${inputClass}" step="0.1">
                        </div>
                        <div>
                            <label class="${labelClass}">Szenzor H (mm) ${createInfoBtn('Szenzor Magasság', 'A kamera szenzorának fizikai magassága milliméterben. Pl. APS-C esetén kb. 14.9 mm.')}</label>
                            <input type="number" id="img-h" value="${data.h}" class="${inputClass}" step="0.1">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="${labelClass}">Pixel (µm) ${createInfoBtn('Pixel Méret', 'A kamera egyetlen pixelének mérete mikrométerben. Pl. 3.76 vagy 4.3. Kisebb pixel = nagyobb felbontás, de kevesebb fény.')}</label>
                            <input type="number" id="img-p" value="${data.p}" class="${inputClass}" step="0.1">
                        </div>
                        <div>
                            <label class="${labelClass}">Binning ${createInfoBtn('Binning', 'Több pixel összevonása egy nagyobb pixellé (pl. 2x2). Növeli az érzékenységet, de csökkenti a felbontást.')}</label>
                            <input type="number" id="img-bin" value="${data.bin}" class="${inputClass}" min="1" step="1">
                        </div>
                    </div>
                </div>
            </details>
        </div>
        <div class="grid grid-cols-2 gap-y-3 gap-x-2 pt-3 border-t border-white/10 mt-auto">
            <div>
                <div class="${labelClass}">Effektív Fókusz ${createInfoBtn('Effektív Fókusz', 'A távcső és a Barlow/Reducer együttes fókusztávolsága.')}</div>
                <div id="img-effF" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div>
                <div class="${labelClass}">Felbontás (Arcsec/px) ${createInfoBtn('Képpont Felbontás', 'Egy pixel hány ívmásodpercnyi területet fed le az égen. Ideális esetben a Seeing értékének harmada (Nyquist).')}</div>
                <div id="img-res" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div>
                <div class="${labelClass}">Látómező (Fok) ${createInfoBtn('Látómező (Fok)', 'A kamera által rögzített terület mérete az égen fokban.')}</div>
                <div id="img-fov" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div>
                <div class="${labelClass}">Látómező (Ívperc) ${createInfoBtn('Látómező (Ívperc)', 'A kamera által rögzített terület mérete az égen ívpercben (1 fok = 60 ívperc).')}</div>
                <div id="img-fov-arcmin" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div>
                <div class="${labelClass}">Szenzor Átló ${createInfoBtn('Szenzor Átló', 'A szenzor átlója milliméterben. Fontos a megfelelő korrektor vagy flattener kiválasztásához.')}</div>
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
