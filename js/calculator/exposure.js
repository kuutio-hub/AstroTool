import { storage } from '../utils.js';

export function createExposureCalc(isNightMode) {
    const card = document.createElement('div');
    card.className = "astro-card";
    
    let data = {
        F: storage.get('F', 1000),
        A: storage.get('A', 200),
        iso: storage.get('iso', 1600),
        ff: storage.get('ff', 1), // Filter factor
        sb: storage.get('sb', 20) // Sky brightness
    };

    const update = () => {
        const fRatio = data.F / data.A;
        const exp = (data.ff / data.iso) * Math.pow(fRatio, 2) * Math.pow(2.512, (9 - data.sb));
        
        // Let's adjust the formula slightly to give reasonable seconds.
        // The user formula: Exposure = FF / i * f^2 * 2.512^(sb)
        // Wait, the user formula in prompt: Exposure = FF / i * f^2 * 2.512^(sb)
        // Actually, typical formula is: t = (f^2 * FF) / (ISO * 2.512^(SB - 9)) or something.
        // Let's just use exactly what user provided: Exposure = FF / i * f^2 * 2.512^(sb)
        const exposure = (data.ff / data.iso) * Math.pow(fRatio, 2) * Math.pow(2.512, data.sb);

        card.querySelector('#exp-res').textContent = exposure.toExponential(2) + ' s';
    };

    const inputClass = "astro-input";
    const labelClass = "astro-label";

    card.innerHTML = `
        <h3 class="font-bold uppercase text-xs mb-4 ${isNightMode ? 'text-red-500' : 'text-blue-300'}">Expó Kalkulátor</h3>
        <div class="space-y-3 mb-4">
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="${labelClass}">Fókusz (F) mm</label>
                    <input type="number" id="exp-F" value="${data.F}" class="${inputClass}">
                </div>
                <div>
                    <label class="${labelClass}">Apertúra (A) mm</label>
                    <input type="number" id="exp-A" value="${data.A}" class="${inputClass}">
                </div>
            </div>
            <div class="grid grid-cols-3 gap-2">
                <div>
                    <label class="${labelClass}">ISO (i)</label>
                    <input type="number" id="exp-iso" value="${data.iso}" class="${inputClass}">
                </div>
                <div>
                    <label class="${labelClass}">Filter (FF)</label>
                    <input type="number" id="exp-ff" value="${data.ff}" class="${inputClass}">
                </div>
                <div>
                    <label class="${labelClass}">Sky Brightness (sb)</label>
                    <input type="number" id="exp-sb" value="${data.sb}" class="${inputClass}">
                </div>
            </div>
        </div>
        <div class="pt-3 border-t border-white/10">
            <div class="${labelClass}">Becsült Expó Idő</div>
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

    update();
    return card;
}
