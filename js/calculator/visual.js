import { safeFixed } from '../utils.js';

export function renderVisualCalculators(globalParams, isNightMode) {
    const container = document.createElement('div');
    container.className = 'space-y-2';
    
    const resultBoxClass = isNightMode ? 'bg-red-900/10 border-red-900/30' : 'bg-slate-50 border-slate-200';
    const mutedTextClass = isNightMode ? 'text-slate-400' : 'text-slate-600';

    // Magnification / Eyepiece
    container.appendChild(createAccordion('Nagyítás / Okulár', 'EyeIcon', `
        <div class="astro-radio-group mb-4">
            <input type="radio" id="calc-m" name="vis-calc" value="M" class="astro-radio-input hidden" checked>
            <label for="calc-m" class="astro-radio-label">Nagyítás (M)</label>
            
            <input type="radio" id="calc-e" name="vis-calc" value="e" class="astro-radio-input hidden">
            <label for="calc-e" class="astro-radio-label">Okulár (e)</label>
            
            <input type="radio" id="calc-mmax" name="vis-calc" value="Mmax" class="astro-radio-input hidden">
            <label for="calc-mmax" class="astro-radio-label">Max M</label>
        </div>
        
        <div id="vis-input-container" class="mb-4">
            <label class="astro-label" id="vis-input-label">Okulár fókusztávolság (mm)</label>
            <input type="number" inputmode="decimal" id="vis-input" class="astro-input" value="10">
        </div>
        
        <div class="p-4 ${resultBoxClass} rounded-xl border">
            <div class="text-[10px] ${mutedTextClass} uppercase font-extrabold mb-1" id="vis-result-label">Eredmény: Nagyítás</div>
            <div class="text-2xl font-mono" id="vis-result">--</div>
        </div>
    `));

    // Exit Pupil
    container.appendChild(createAccordion('Kilépő pupilla', 'EyeIcon', `
        <div class="mb-4">
            <label class="astro-label">Okulár fókusztávolság (mm)</label>
            <input type="number" inputmode="decimal" id="ep-e" class="astro-input" value="10">
        </div>
        <div class="p-4 ${resultBoxClass} rounded-xl border">
            <div class="text-[10px] ${mutedTextClass} uppercase font-extrabold mb-1">Kilépő pupilla (mm)</div>
            <div class="text-2xl font-mono" id="ep-result">--</div>
            <div class="text-xs mt-1" id="ep-warning"></div>
        </div>
    `));

    // True FOV & Drift Time
    container.appendChild(createAccordion('Látómező és Drift idő', 'FrameIcon', `
        <div class="grid grid-cols-2 gap-3 mb-4">
            <div>
                <label class="astro-label">Okulár (mm)</label>
                <input type="number" inputmode="decimal" id="tfov-e" class="astro-input" value="10">
            </div>
            <div>
                <label class="astro-label">Látószög (°)</label>
                <input type="number" inputmode="decimal" id="tfov-a" class="astro-input" value="50">
            </div>
            <div class="col-span-2">
                <label class="astro-label">Deklináció (°)</label>
                <input type="number" inputmode="decimal" id="tfov-dec" class="astro-input" value="0">
            </div>
        </div>
        <div class="p-4 ${resultBoxClass} rounded-xl border mb-3">
            <div class="text-[10px] ${mutedTextClass} uppercase font-extrabold mb-1">Valós Látómező (TFOV)</div>
            <div class="text-2xl font-mono" id="tfov-result">--</div>
        </div>
        <div class="p-4 ${resultBoxClass} rounded-xl border">
            <div class="text-[10px] ${mutedTextClass} uppercase font-extrabold mb-1">Drift idő (átérési idő)</div>
            <div class="text-2xl font-mono" id="drift-result">--</div>
            <div class="text-[10px] ${mutedTextClass} mt-1">Képlet: T = FOV / (15 * cos(Dec))</div>
        </div>
    `));

    // Logic
    setTimeout(() => {
        const A = globalParams.A;
        const F = globalParams.F;
        const B = globalParams.B;

        // Visual Calc Logic
        const visRadios = container.querySelectorAll('input[name="vis-calc"]');
        const visInputContainer = container.querySelector('#vis-input-container');
        const visInputLabel = container.querySelector('#vis-input-label');
        const visInput = container.querySelector('#vis-input');
        const visResultLabel = container.querySelector('#vis-result-label');
        const visResult = container.querySelector('#vis-result');

        const updateVis = () => {
            const mode = container.querySelector('input[name="vis-calc"]:checked').value;
            const val = parseFloat(visInput.value);
            
            if (mode === 'M') {
                visInputContainer.style.display = 'block';
                visInputLabel.textContent = 'Okulár fókusztávolság (mm)';
                visResultLabel.textContent = 'Eredmény: Nagyítás';
                visResult.textContent = (val > 0 && F > 0) ? safeFixed(F / val * B, 1, 'x') : '--';
            } else if (mode === 'e') {
                visInputContainer.style.display = 'block';
                visInputLabel.textContent = 'Kívánt nagyítás (x)';
                visResultLabel.textContent = 'Eredmény: Okulár (mm)';
                visResult.textContent = (val > 0 && F > 0) ? safeFixed(F / val * B, 1, ' mm') : '--';
            } else {
                visInputContainer.style.display = 'none';
                visResultLabel.textContent = 'Eredmény: Max. Nagyítás';
                visResult.textContent = A > 0 ? safeFixed(2 * A, 0, 'x') : '--';
            }
        };

        visRadios.forEach(r => r.addEventListener('change', updateVis));
        visInput.addEventListener('input', updateVis);
        updateVis();

        // Exit Pupil Logic
        const epE = container.querySelector('#ep-e');
        const epResult = container.querySelector('#ep-result');
        const epWarning = container.querySelector('#ep-warning');
        
        const updateEP = () => {
            const e = parseFloat(epE.value);
            if (e > 0 && F > 0 && A > 0) {
                const ep = (A * e) / (F * B);
                epResult.textContent = safeFixed(ep, 2, ' mm');
                if (ep > 7) {
                    epWarning.textContent = 'Túl nagy kilépő pupilla – fényveszteség.';
                    epWarning.className = 'text-xs mt-1 text-yellow-500';
                } else if (ep < 0.5) {
                    epWarning.textContent = 'Túl kicsi kilépő pupilla – diffrakció dominál.';
                    epWarning.className = 'text-xs mt-1 text-yellow-500';
                } else {
                    epWarning.textContent = 'Optimális tartomány.';
                    epWarning.className = 'text-xs mt-1 text-green-500';
                }
            } else {
                epResult.textContent = '--';
                epWarning.textContent = '';
            }
        };
        epE.addEventListener('input', updateEP);
        updateEP();

        // TFOV & Drift Logic
        const tfovE = container.querySelector('#tfov-e');
        const tfovA = container.querySelector('#tfov-a');
        const tfovDec = container.querySelector('#tfov-dec');
        const tfovResult = container.querySelector('#tfov-result');
        const driftResult = container.querySelector('#drift-result');

        const updateTFOV = () => {
            const e = parseFloat(tfovE.value);
            const a = parseFloat(tfovA.value);
            const dec = parseFloat(tfovDec.value) || 0;
            if (e > 0 && a > 0 && F > 0) {
                const M = (F / e * B);
                const tfovDeg = a / M;
                tfovResult.textContent = safeFixed(tfovDeg, 2, '°');
                
                // Drift time calculation
                const fovArcmin = tfovDeg * 60;
                const decRad = dec * (Math.PI / 180);
                const cosDec = Math.cos(decRad);
                const driftTimeSec = cosDec !== 0 ? (fovArcmin / (15 * cosDec) * 60) : 0;
                driftResult.textContent = safeFixed(driftTimeSec, 1, ' s');
            } else {
                tfovResult.textContent = '--';
                driftResult.textContent = '--';
            }
        };
        tfovE.addEventListener('input', updateTFOV);
        tfovA.addEventListener('input', updateTFOV);
        tfovDec.addEventListener('input', updateTFOV);
        updateTFOV();
    }, 0);

    return container;
}

function createAccordion(title, iconName, contentHtml) {
    const wrapper = document.createElement('div');
    wrapper.className = 'astro-accordion-wrapper';
    
    // We will replace iconName with actual SVG in app.js or here if we import icons
    // For now, just use a placeholder or pass the SVG string directly.
    // Assuming icons are handled by the caller or we inject them.
    
    wrapper.innerHTML = `
        <details class="astro-card group p-0 overflow-hidden mb-2">
            <summary class="flex items-center justify-between p-4 cursor-pointer list-none font-bold uppercase tracking-wider text-sm">
                <div class="flex items-center gap-3">
                    <span class="icon-placeholder" data-icon="${iconName}"></span>
                    <span>${title}</span>
                </div>
                <span class="transform group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div class="p-4 pt-0 border-t border-divider mt-2">
                ${contentHtml}
            </div>
        </details>
    `;
    return wrapper;
}