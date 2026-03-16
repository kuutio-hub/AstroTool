import { safeFixed } from '../utils.js';

export function renderTelescopeCalculators(globalParams, isNightMode) {
    const container = document.createElement('div');
    container.className = 'space-y-2';
    
    const resultBoxClass = isNightMode ? 'bg-red-900/10 border-red-900/30' : 'bg-slate-50 border-slate-200';
    const mutedTextClass = isNightMode ? 'text-slate-400' : 'text-slate-600';

    // Focal Length <-> Focal Ratio
    container.appendChild(createAccordion('Fókusztávolság ↔ Fókuszarány', 'LensIcon', `
        <div class="astro-radio-group mb-4">
            <input type="radio" id="calc-f" name="tel-calc" value="f" class="astro-radio-input hidden" checked>
            <label for="calc-f" class="astro-radio-label">Fókuszarány (f/)</label>
            
            <input type="radio" id="calc-F" name="tel-calc" value="F" class="astro-radio-input hidden">
            <label for="calc-F" class="astro-radio-label">Fókusztáv (F)</label>
        </div>
        
        <div id="tel-input-container" class="mb-4">
            <label class="astro-label" id="tel-input-label">Fókusztávolság (mm)</label>
            <input type="number" inputmode="decimal" id="tel-input" class="astro-input" value="${globalParams.F}">
        </div>
        
        <div class="p-4 ${resultBoxClass} rounded-xl border">
            <div class="text-[10px] ${mutedTextClass} uppercase font-extrabold mb-1" id="tel-result-label">Eredmény: Fókuszarány</div>
            <div class="text-2xl font-mono" id="tel-result">--</div>
        </div>
    `));

    // Resolution Limits
    container.appendChild(createAccordion('Felbontási határok', 'EyeIcon', `
        <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="p-4 ${resultBoxClass} rounded-xl border">
                <div class="text-[10px] ${mutedTextClass} uppercase font-extrabold mb-1">Dawes-határ</div>
                <div class="text-xl font-mono" id="res-dawes">--</div>
            </div>
            <div class="p-4 ${resultBoxClass} rounded-xl border">
                <div class="text-[10px] ${mutedTextClass} uppercase font-extrabold mb-1">Rayleigh-határ</div>
                <div class="text-xl font-mono" id="res-rayleigh">--</div>
            </div>
        </div>
    `));

    // Limiting Magnitude
    container.appendChild(createAccordion('Határmagnitúdó', 'StarIcon', `
        <div class="p-4 ${resultBoxClass} rounded-xl border">
            <div class="text-[10px] ${mutedTextClass} uppercase font-extrabold mb-1">Elméleti határmagnitúdó</div>
            <div class="text-2xl font-mono" id="lim-mag">--</div>
        </div>
    `));

    // Moon Area
    container.appendChild(createAccordion('Hold terület (FOV %)', 'MoonIcon', `
        <div class="p-4 ${resultBoxClass} rounded-xl border">
            <div class="text-[10px] ${mutedTextClass} uppercase font-extrabold mb-1">Hold területe a látómezőben</div>
            <div class="text-2xl font-mono" id="moon-area">--</div>
            <div class="text-[10px] ${mutedTextClass} mt-1">Képlet: (Hold_Terület / Látómező_Terület) * 100%</div>
        </div>
    `));

    // Logic
    setTimeout(() => {
        const A = globalParams.A;

        // Focal Logic
        const telRadios = container.querySelectorAll('input[name="tel-calc"]');
        const telInputLabel = container.querySelector('#tel-input-label');
        const telInput = container.querySelector('#tel-input');
        const telResultLabel = container.querySelector('#tel-result-label');
        const telResult = container.querySelector('#tel-result');

        const updateTel = () => {
            const mode = container.querySelector('input[name="tel-calc"]:checked').value;
            const val = parseFloat(telInput.value);
            
            if (mode === 'f') {
                telInputLabel.textContent = 'Fókusztávolság (mm)';
                telResultLabel.textContent = 'Eredmény: Fókuszarány';
                telResult.textContent = (val > 0 && A > 0) ? 'f/' + safeFixed(val / A, 1) : '--';
            } else {
                telInputLabel.textContent = 'Fókuszarány (f/)';
                telResultLabel.textContent = 'Eredmény: Fókusztávolság';
                telResult.textContent = (val > 0 && A > 0) ? safeFixed(A * val, 0, ' mm') : '--';
            }
        };

        telRadios.forEach(r => r.addEventListener('change', updateTel));
        telInput.addEventListener('input', updateTel);
        updateTel();

        // Resolution Logic
        const resDawes = container.querySelector('#res-dawes');
        const resRayleigh = container.querySelector('#res-rayleigh');
        if (A > 0) {
            resDawes.textContent = safeFixed(116 / A, 2, '"');
            resRayleigh.textContent = safeFixed(138 / A, 2, '"');
        }

        // Limiting Magnitude Logic
        const limMag = container.querySelector('#lim-mag');
        if (A > 0) {
            limMag.textContent = safeFixed(2 + 5 * Math.log10(A), 1, ' mag');
        }

        // Moon Area Logic
        const moonArea = container.querySelector('#moon-area');
        // Moon angular diameter ~ 0.5 deg
        const moonRadius = 0.25;
        const moonAreaSqDeg = Math.PI * Math.pow(moonRadius, 2);
        moonArea.textContent = safeFixed(moonAreaSqDeg, 4, ' sq deg');

    }, 0);

    return container;
}

function createAccordion(title, iconName, contentHtml) {
    const wrapper = document.createElement('div');
    wrapper.className = 'astro-accordion-wrapper';
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