import { storage } from '../utils.js';

export function createTelescopeCalc(isNightMode) {
    const card = document.createElement('div');
    card.className = "astro-card";
    
    let data = {
        F: storage.get('F', 1000),
        A: storage.get('A', 200)
    };

    const update = () => {
        const fRatio = data.F / data.A;
        const dawes = 116 / data.A;
        const rayleigh = 138 / data.A;
        const limitingMag = 7.5 + 5 * Math.log10(data.A / 10); // Approximation
        const lightGathering = Math.pow(data.A / 7, 2); // Compared to 7mm human eye pupil

        card.querySelector('#fratio-res').textContent = 'f/' + fRatio.toFixed(1);
        card.querySelector('#dawes-res').textContent = dawes.toFixed(2) + '"';
        card.querySelector('#rayleigh-res').textContent = rayleigh.toFixed(2) + '"';
        card.querySelector('#mag-res').textContent = limitingMag.toFixed(1) + ' mag';
        card.querySelector('#light-res').textContent = Math.round(lightGathering) + 'x';
    };

    const labelClass = "astro-label";

    card.innerHTML = `
        <h3 class="font-bold uppercase text-xs mb-4 ${isNightMode ? 'text-red-500' : 'text-blue-300'}">Teleszkóp Kalkulátor</h3>
        <div class="text-xs opacity-70 mb-4 italic">A paraméterek a globális beállításokból jönnek.</div>
        <div class="grid grid-cols-2 gap-y-3 gap-x-2 pt-3 border-t border-white/10">
            <div>
                <div class="${labelClass}">Fényerő</div>
                <div id="fratio-res" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div>
                <div class="${labelClass}">Határmagnitúdó</div>
                <div id="mag-res" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div>
                <div class="${labelClass}">Dawes Határ</div>
                <div id="dawes-res" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div>
                <div class="${labelClass}">Rayleigh Határ</div>
                <div id="rayleigh-res" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div class="col-span-2">
                <div class="${labelClass}">Fénygyűjtő Képesség (szemhez)</div>
                <div id="light-res" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
        </div>
    `;

    window.addEventListener('astro-settings-changed', (e) => {
        data = { ...data, ...e.detail };
        update();
    });

    update();
    return card;
}
