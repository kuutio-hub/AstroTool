import { safeFixed } from '../utils.js';

export function renderPhotoCalculators(globalParams, isNightMode) {
    const container = document.createElement('div');
    container.className = 'space-y-2';
    
    const resultBoxClass = isNightMode ? 'bg-red-900/10 border-red-900/30' : 'bg-slate-50 border-slate-200';
    const mutedTextClass = isNightMode ? 'text-slate-400' : 'text-slate-600';

    // FOV
    container.appendChild(createAccordion('Látómező (FOV)', 'FrameIcon', `
        <div class="grid grid-cols-2 gap-3 mb-4">
            <div>
                <label class="astro-label">Szenzor Szélesség (mm)</label>
                <input type="number" inputmode="decimal" id="fov-w" class="astro-input" value="23.5">
            </div>
            <div>
                <label class="astro-label">Szenzor Magasság (mm)</label>
                <input type="number" inputmode="decimal" id="fov-h" class="astro-input" value="15.6">
            </div>
        </div>
        <div class="astro-radio-group mb-4">
            <input type="radio" id="fov-deg" name="fov-unit" value="deg" class="astro-radio-input hidden" checked>
            <label for="fov-deg" class="astro-radio-label">Fok (°)</label>
            
            <input type="radio" id="fov-arcmin" name="fov-unit" value="arcmin" class="astro-radio-input hidden">
            <label for="fov-arcmin" class="astro-radio-label">Ívperc (')</label>
            
            <input type="radio" id="fov-arcsec" name="fov-unit" value="arcsec" class="astro-radio-input hidden">
            <label for="fov-arcsec" class="astro-radio-label">Ívmásodperc (")</label>
        </div>
        <div class="p-4 ${resultBoxClass} rounded-xl border">
            <div class="text-[10px] ${mutedTextClass} uppercase font-extrabold mb-1">Látómező (Sz × M)</div>
            <div class="text-2xl font-mono" id="fov-result">--</div>
        </div>
    `));

    // Pixel Scale & Sampling
    container.appendChild(createAccordion('Pixel skála & Mintavételezés', 'GridIcon', `
        <div class="grid grid-cols-2 gap-3 mb-4">
            <div>
                <label class="astro-label">Pixelméret (µm)</label>
                <input type="number" inputmode="decimal" id="ps-p" class="astro-input" value="3.76">
            </div>
            <div>
                <label class="astro-label">Seeing (")</label>
                <input type="number" inputmode="decimal" id="ps-seeing" class="astro-input" value="2.0">
            </div>
        </div>
        <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="p-4 ${resultBoxClass} rounded-xl border">
                <div class="text-[10px] ${mutedTextClass} uppercase font-extrabold mb-1">Pixel skála ("/px)</div>
                <div class="text-xl font-mono" id="ps-result">--</div>
            </div>
            <div class="p-4 ${resultBoxClass} rounded-xl border">
                <div class="text-[10px] ${mutedTextClass} uppercase font-extrabold mb-1">Ideális skála ("/px)</div>
                <div class="text-xl font-mono" id="ps-ideal">--</div>
            </div>
        </div>
        <div class="text-xs mt-1" id="ps-warning"></div>
    `));

    // Exposure Time
    container.appendChild(createAccordion('Expozíciós idő', 'CameraIcon', `
        <div class="astro-radio-group mb-4">
            <input type="radio" id="exp-stat" name="exp-mode" value="stat" class="astro-radio-input hidden" checked>
            <label for="exp-stat" class="astro-radio-label">Statív (500-as)</label>
            
            <input type="radio" id="exp-obj" name="exp-mode" value="obj" class="astro-radio-input hidden">
            <label for="exp-obj" class="astro-radio-label">Objektív</label>
        </div>
        
        <div class="p-4 ${resultBoxClass} rounded-xl border">
            <div class="text-[10px] ${mutedTextClass} uppercase font-extrabold mb-1">Max expozíció (s)</div>
            <div class="text-2xl font-mono" id="exp-result">--</div>
            <div class="text-[10px] ${mutedTextClass} mt-1" id="exp-formula"></div>
        </div>
    `));

    // Logic
    setTimeout(() => {
        const F = globalParams.F;
        const B = globalParams.B;

        // FOV Logic
        const fovW = container.querySelector('#fov-w');
        const fovH = container.querySelector('#fov-h');
        const fovRadios = container.querySelectorAll('input[name="fov-unit"]');
        const fovResult = container.querySelector('#fov-result');

        const updateFOV = () => {
            const w = parseFloat(fovW.value) || 0;
            const h = parseFloat(fovH.value) || 0;
            const unit = container.querySelector('input[name="fov-unit"]:checked').value;
            
            if (w > 0 && h > 0 && F > 0) {
                let mult = 57.3;
                let suffix = '°';
                if (unit === 'arcmin') { mult = 3438; suffix = "'"; }
                if (unit === 'arcsec') { mult = 206265; suffix = '"'; }
                
                const fovX = (w / (F * B)) * mult;
                const fovY = (h / (F * B)) * mult;
                
                fovResult.textContent = `${safeFixed(fovX, 2)}${suffix} × ${safeFixed(fovY, 2)}${suffix}`;
            } else {
                fovResult.textContent = '--';
            }
        };

        fovW.addEventListener('input', updateFOV);
        fovH.addEventListener('input', updateFOV);
        fovRadios.forEach(r => r.addEventListener('change', updateFOV));
        updateFOV();

        // Pixel Scale Logic
        const psP = container.querySelector('#ps-p');
        const psSeeing = container.querySelector('#ps-seeing');
        const psResult = container.querySelector('#ps-result');
        const psIdeal = container.querySelector('#ps-ideal');
        const psWarning = container.querySelector('#ps-warning');

        const updatePS = () => {
            const p = parseFloat(psP.value) || 0;
            const seeing = parseFloat(psSeeing.value) || 0;
            
            if (p > 0 && F > 0) {
                const scale = 206.3 * p / (F * B);
                psResult.textContent = safeFixed(scale, 2, '"');
                
                if (seeing > 0) {
                    const ideal = seeing / 2; // Nyquist
                    psIdeal.textContent = safeFixed(ideal, 2, '"');
                    
                    if (scale > ideal * 1.5) {
                        psWarning.textContent = 'Alulmintavételezett (kockás csillagok).';
                        psWarning.className = 'text-xs mt-1 text-yellow-500';
                    } else if (scale < ideal * 0.5) {
                        psWarning.textContent = 'Túlmintavételezett (felesleges fókusznyújtás).';
                        psWarning.className = 'text-xs mt-1 text-yellow-500';
                    } else {
                        psWarning.textContent = 'Ideális mintavételezés.';
                        psWarning.className = 'text-xs mt-1 text-green-500';
                    }
                }
            } else {
                psResult.textContent = '--';
                psIdeal.textContent = '--';
                psWarning.textContent = '';
            }
        };

        psP.addEventListener('input', updatePS);
        psSeeing.addEventListener('input', updatePS);
        updatePS();

        // Exposure Logic
        const expRadios = container.querySelectorAll('input[name="exp-mode"]');
        const expResult = container.querySelector('#exp-result');
        const expFormula = container.querySelector('#exp-formula');

        const updateExp = () => {
            const mode = container.querySelector('input[name="exp-mode"]:checked').value;
            
            if (mode === 'stat') {
                const t = 500 / (F * B);
                expResult.textContent = safeFixed(t, 1, ' s');
                expFormula.textContent = 'Képlet: T = 500 / (F * B)';
            } else {
                // Simplified for lens only
                const t = 500 / F;
                expResult.textContent = safeFixed(t, 1, ' s');
                expFormula.textContent = 'Képlet: T = 500 / F';
            }
        };
        expRadios.forEach(r => r.addEventListener('change', updateExp));
        updateExp();
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