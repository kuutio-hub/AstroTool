import { storage } from '../utils.js';

export function createImagingCalc(isNightMode) {
    const card = document.createElement('div');
    card.className = "astro-card";
    
    let data = {
        F: storage.get('F', 1000),
        B: storage.get('B', 1),
        w: storage.get('w', 22.3), // Sensor width
        h: storage.get('h', 14.9), // Sensor height
        p: storage.get('p', 4.3),   // Pixel size
        seeing: storage.get('seeing', 2.0) // Seeing limit in arcsec
    };

    const update = () => {
        const effF = data.F * data.B;
        const fovW = (data.w / effF) * 57.3;
        const fovH = (data.h / effF) * 57.3;
        const fovWArcmin = fovW * 60;
        const fovHArcmin = fovH * 60;
        const res = (data.p / effF) * 206.3;
        
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
    };

    const inputClass = "astro-input";
    const labelClass = "astro-label";

    card.innerHTML = `
        <h3 class="font-bold uppercase text-xs mb-4 ${isNightMode ? 'text-red-500' : 'text-blue-300'}">Fotós Kalkulátor</h3>
        <div class="space-y-3 mb-4">
            <div>
                <label class="${labelClass}">Seeing (Légköri nyugodtság) "</label>
                <input type="number" id="img-seeing" value="${data.seeing}" class="${inputClass}" step="0.1">
            </div>
            <div>
                <label class="${labelClass}">Szenzor Magasság (h) mm</label>
                <input type="number" id="img-h" value="${data.h}" class="${inputClass}" step="0.1">
            </div>
        </div>
        <div class="grid grid-cols-2 gap-y-3 gap-x-2 pt-3 border-t border-white/10">
            <div>
                <div class="${labelClass}">Effektív Fókusz</div>
                <div id="img-effF" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div>
                <div class="${labelClass}">Felbontás (Arcsec/px)</div>
                <div id="img-res" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div>
                <div class="${labelClass}">Látómező (Fok)</div>
                <div id="img-fov" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div>
                <div class="${labelClass}">Látómező (Ívperc)</div>
                <div id="img-fov-arcmin" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div class="col-span-2">
                <div class="${labelClass}">Nyquist Mintavételezés</div>
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
