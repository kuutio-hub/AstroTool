
import { storage } from '../utils.js';
import { InfoIcon, ChevronDownIcon, ChevronUpIcon } from '../icons.js';

export function createCalculator(isNightMode) {
    const container = document.createElement('div');
    container.className = "space-y-4";

    // State
    let activeTab = 'visual'; // 'visual' | 'converter'
    let expandedCard = null; // ID of expanded card

    // Data State (persisted)
    let data = {
        telescopeFL: storage.get('telescopeFL', 1000),
        aperture: storage.get('aperture', 200),
        eyepieceFL: storage.get('eyepieceFL', 25),
        eyepieceAFOV: storage.get('eyepieceAFOV', 50),
        barlow: storage.get('barlow', 1),
        fieldStop: storage.get('fieldStop', 27), // Default for 25mm Plossl
        limitingMag: storage.get('limitingMag', 6.5),
        transmission: storage.get('transmission', 0.95),
        dawesConst: storage.get('dawesConst', 116),
        rayleighConst: storage.get('rayleighConst', 138),
        
        // Converter
        distValue: storage.get('distValue', 1),
        distUnit: storage.get('distUnit', 'pc'), // 'pc', 'ly', 'km'
        distMult: storage.get('distMult', 1), // 1, 1000 (k), 1000000 (M)
    };

    // Save data on change
    const updateData = (key, value) => {
        data[key] = value;
        storage.set(key, value);
        render();
    };

    // Helper: Render Formula
    const renderFormula = (formula) => {
        const eqParts = formula.split(' = ');
        
        const renderPart = (part) => {
            const fracParts = part.split(' / ');
            if (fracParts.length === 2 && !part.includes(') *') && !part.includes('+') && !part.includes('-')) {
                const num = fracParts[0].replace(/[()]/g, '').trim();
                const den = fracParts[1].replace(/[()]/g, '').trim();
                return `
                    <div class="fraction">
                        <span class="fraction-num font-serif italic">${num}</span>
                        <span class="fraction-den font-serif italic">${den}</span>
                    </div>
                `;
            }
            return `<span class="font-serif italic text-lg tracking-wide">${part}</span>`;
        };

        if (eqParts.length === 2) {
            return `
                <div class="flex items-center justify-center gap-2 flex-wrap">
                    <span class="font-serif italic text-lg tracking-wide">${eqParts[0]} =</span>
                    ${renderPart(eqParts[1])}
                </div>
            `;
        }
        return renderPart(formula);
    };

    // Helper: Calculation Card
    const createCard = (id, title, value, unit, description, formula, explanation, extraSettingsHTML = '') => {
        const isExpanded = expandedCard === id;
        const cardBg = isNightMode ? 'bg-black/40 border-red-900/30' : 'bg-white/60 border-white/40 shadow-sm';
        const textColor = isNightMode ? 'text-red-500' : 'text-slate-700';
        const labelColor = isNightMode ? 'text-red-800' : 'text-slate-500';
        const infoBg = isNightMode ? 'bg-red-950/20' : 'bg-slate-100/50';

        const card = document.createElement('div');
        card.className = `p-3 rounded border ${cardBg} transition-all duration-300 ${isExpanded ? 'col-span-2 sm:col-span-2' : ''}`;
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-1">
                <span class="${labelColor} text-[10px] font-bold uppercase tracking-wider">${title}</span>
                <button class="info-btn p-1 rounded-full hover:bg-black/10 transition-colors ${isNightMode ? 'text-red-800' : 'text-slate-400'}">
                    ${InfoIcon("w-3 h-3")}
                </button>
            </div>
            <div class="flex items-baseline gap-1">
                <span class="text-2xl font-bold font-mono ${textColor}">${value}</span>
                <span class="text-xs opacity-60 font-mono">${unit}</span>
            </div>
            <div class="text-[9px] opacity-60 mt-1 truncate">${description}</div>
            
            ${isExpanded ? `
                <div class="mt-3 pt-3 border-t border-current/10 animate-fade-in">
                    <div class="mb-3 text-center opacity-80">
                        ${renderFormula(formula)}
                    </div>
                    <p class="text-[10px] opacity-70 mb-3 italic">${explanation}</p>
                    ${extraSettingsHTML ? `
                        <div class="rounded p-2 ${infoBg}">
                            <div class="text-[9px] font-bold uppercase mb-2 opacity-70">Beállítások</div>
                            ${extraSettingsHTML}
                        </div>
                    ` : ''}
                </div>
            ` : ''}
        `;

        card.querySelector('.info-btn').onclick = () => {
            expandedCard = isExpanded ? null : id;
            render();
        };

        // Attach listeners for extra settings inputs if they exist
        if (isExpanded && extraSettingsHTML) {
            const inputs = card.querySelectorAll('input, select');
            inputs.forEach(input => {
                input.onchange = (e) => {
                    const key = input.dataset.key;
                    const val = input.type === 'number' ? parseFloat(e.target.value) : e.target.value;
                    updateData(key, val);
                };
            });
        }

        return card;
    };

    function render() {
        container.innerHTML = '';

        // Tabs
        const tabs = document.createElement('div');
        tabs.className = "flex gap-2 mb-4 border-b border-white/10";
        tabs.innerHTML = `
            <button id="tab-visual" class="px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'visual' ? (isNightMode ? 'border-red-500 text-red-500' : 'border-blue-500 text-blue-600') : 'border-transparent opacity-50 hover:opacity-100'}">Vizuális</button>
            <button id="tab-converter" class="px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'converter' ? (isNightMode ? 'border-red-500 text-red-500' : 'border-blue-500 text-blue-600') : 'border-transparent opacity-50 hover:opacity-100'}">Konverter</button>
        `;
        tabs.querySelector('#tab-visual').onclick = () => { activeTab = 'visual'; expandedCard = null; render(); };
        tabs.querySelector('#tab-converter').onclick = () => { activeTab = 'converter'; expandedCard = null; render(); };
        container.appendChild(tabs);

        const inputClass = `w-full p-2 rounded text-sm font-mono font-bold outline-none border transition-all ${isNightMode ? 'bg-black border-red-900/50 text-red-500 focus:border-red-500' : 'bg-white border-slate-200 text-slate-700 focus:border-blue-400'}`;
        const labelClass = `block text-[9px] font-bold uppercase tracking-wider mb-1 ${isNightMode ? 'text-red-800' : 'text-slate-400'}`;

        if (activeTab === 'visual') {
            // Calculations
            const mag = data.telescopeFL * data.barlow / data.eyepieceFL;
            const fRatio = data.telescopeFL / data.aperture;
            const exitPupil = data.aperture / mag;
            const tfov = (data.eyepieceAFOV / mag); // Simplified
            const tfov_stop = (data.fieldStop / data.telescopeFL) * 57.3; // More accurate if field stop known
            const dawes = data.dawesConst / data.aperture;
            const rayleigh = data.rayleighConst / data.aperture;
            const limitingMag = data.limitingMag + 5 * Math.log10(data.aperture / 7); // Approx formula
            const lightGrasp = Math.pow(data.aperture / 7, 2) * data.transmission;

            // Inputs Grid
            const inputsGrid = document.createElement('div');
            inputsGrid.className = "grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4";
            
            const createInput = (label, key, step = 1) => `
                <div>
                    <label class="${labelClass}">${label}</label>
                    <input type="number" step="${step}" value="${data[key]}" data-key="${key}" class="${inputClass}" />
                </div>
            `;

            inputsGrid.innerHTML = `
                ${createInput("Fókusz (mm)", "telescopeFL")}
                ${createInput("Átmérő (mm)", "aperture")}
                ${createInput("Okulár (mm)", "eyepieceFL")}
                ${createInput("Látómező (°)", "eyepieceAFOV")}
                <div class="col-span-2 sm:col-span-4">
                    <label class="${labelClass}">Barlow / Reducer (x)</label>
                    <select data-key="barlow" class="${inputClass}">
                        <option value="0.5" ${data.barlow === 0.5 ? 'selected' : ''}>0.5x (Reducer)</option>
                        <option value="0.63" ${data.barlow === 0.63 ? 'selected' : ''}>0.63x (Reducer)</option>
                        <option value="0.8" ${data.barlow === 0.8 ? 'selected' : ''}>0.8x (Reducer)</option>
                        <option value="1" ${data.barlow === 1 ? 'selected' : ''}>1x (Nincs)</option>
                        <option value="1.5" ${data.barlow === 1.5 ? 'selected' : ''}>1.5x (Barlow)</option>
                        <option value="2" ${data.barlow === 2 ? 'selected' : ''}>2x (Barlow)</option>
                        <option value="2.5" ${data.barlow === 2.5 ? 'selected' : ''}>2.5x (Barlow)</option>
                        <option value="3" ${data.barlow === 3 ? 'selected' : ''}>3x (Barlow)</option>
                        <option value="4" ${data.barlow === 4 ? 'selected' : ''}>4x (Barlow)</option>
                        <option value="5" ${data.barlow === 5 ? 'selected' : ''}>5x (Barlow)</option>
                    </select>
                </div>
            `;
            
            // Attach listeners
            inputsGrid.querySelectorAll('input, select').forEach(el => {
                el.onchange = (e) => updateData(el.dataset.key, parseFloat(e.target.value));
            });
            container.appendChild(inputsGrid);

            // Cards Grid
            const cardsGrid = document.createElement('div');
            cardsGrid.className = "grid grid-cols-2 gap-2";

            cardsGrid.appendChild(createCard('mag', 'Nagyítás', mag.toFixed(1), 'x', 'Objektum mérete.', 
                'M = (F * B) / e', 'M: Nagyítás, F: Távcső fókusz, B: Barlow, e: Okulár fókusz'));
            
            cardsGrid.appendChild(createCard('fov', 'Látómező', tfov.toFixed(2), '°', 'Látható égbolt.', 
                'TFOV = AFOV / M', 'TFOV: Valós látómező, AFOV: Okulár látómező, M: Nagyítás',
                `<div>
                    <label class="${labelClass}">Field Stop (mm)</label>
                    <input type="number" step="0.1" value="${data.fieldStop}" data-key="fieldStop" class="${inputClass}" />
                    <p class="text-[9px] mt-1 opacity-60">Pontosabb képlet: TFOV = (FS / F) * 57.3 = ${tfov_stop.toFixed(2)}°</p>
                 </div>`
            ));

            cardsGrid.appendChild(createCard('ep', 'Kilépő Pupilla', exitPupil.toFixed(1), 'mm', 'Fényesség.', 
                'EP = D / M', 'EP: Kilépő pupilla, D: Átmérő, M: Nagyítás'));

            cardsGrid.appendChild(createCard('fr', 'Fényerő', `f/${fRatio.toFixed(1)}`, '', 'Sebesség.', 
                'f = F / D', 'f: Fényerő, F: Fókusz, D: Átmérő'));

            cardsGrid.appendChild(createCard('res', 'Felbontás', dawes.toFixed(2), '"', 'Részletesség.', 
                'R = 116 / D', 'R: Felbontás (arcsec), D: Átmérő (mm)',
                `<div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="${labelClass}">Dawes konst.</label>
                        <input type="number" value="${data.dawesConst}" data-key="dawesConst" class="${inputClass}" />
                    </div>
                    <div>
                        <label class="${labelClass}">Rayleigh konst.</label>
                        <input type="number" value="${data.rayleighConst}" data-key="rayleighConst" class="${inputClass}" />
                    </div>
                    <div class="col-span-2 text-[9px] opacity-60">Rayleigh limit: ${(data.rayleighConst/data.aperture).toFixed(2)}"</div>
                 </div>`
            ));

            cardsGrid.appendChild(createCard('lim', 'Határmagnitúdó', limitingMag.toFixed(1), 'mag', 'Halványság.', 
                'LM = 6.5 + 5 * log(D / 7)', 'LM: Határmagnitúdó, D: Átmérő (mm)',
                `<div>
                    <label class="${labelClass}">Alap LM (szabad szemmel)</label>
                    <input type="number" step="0.1" value="${data.limitingMag}" data-key="limitingMag" class="${inputClass}" />
                 </div>`
            ));
            
            cardsGrid.appendChild(createCard('lg', 'Fénygyűjtés', lightGrasp.toFixed(0), 'x', 'Emberi szemhez képest.', 
                'LG = (D / 7)^2 * t', 'LG: Fénygyűjtés, D: Átmérő (mm), t: Áteresztés',
                `<div>
                    <label class="${labelClass}">Fényáteresztés (0-1)</label>
                    <input type="number" step="0.01" max="1" value="${data.transmission}" data-key="transmission" class="${inputClass}" />
                 </div>`
            ));

            container.appendChild(cardsGrid);

        } else if (activeTab === 'converter') {
            // Converter Logic
            const distInput = document.createElement('div');
            distInput.className = "space-y-4";
            
            // Calculate conversions
            let valInPc = 0;
            const val = data.distValue * data.distMult;

            if (data.distUnit === 'pc') valInPc = val;
            else if (data.distUnit === 'ly') valInPc = val / 3.262;
            else if (data.distUnit === 'km') valInPc = val / 3.086e13;

            const resPc = valInPc;
            const resLy = valInPc * 3.262;
            const resKm = valInPc * 3.086e13;
            const resAu = valInPc * 206265;

            const formatNum = (n) => {
                if (n > 1e9) return n.toExponential(2);
                return n.toLocaleString('hu-HU', { maximumFractionDigits: 2 });
            };

            distInput.innerHTML = `
                <div class="grid grid-cols-3 gap-2">
                    <div class="col-span-1">
                        <label class="${labelClass}">Érték</label>
                        <input type="number" value="${data.distValue}" data-key="distValue" class="${inputClass}" />
                    </div>
                    <div class="col-span-1">
                        <label class="${labelClass}">Mértékegység</label>
                        <select data-key="distUnit" class="${inputClass}">
                            <option value="pc" ${data.distUnit === 'pc' ? 'selected' : ''}>Parsec (pc)</option>
                            <option value="ly" ${data.distUnit === 'ly' ? 'selected' : ''}>Fényév (ly)</option>
                            <option value="km" ${data.distUnit === 'km' ? 'selected' : ''}>Kilométer (km)</option>
                        </select>
                    </div>
                    <div class="col-span-1">
                        <label class="${labelClass}">Szorzó</label>
                        <select data-key="distMult" class="${inputClass}">
                            <option value="1" ${data.distMult === 1 ? 'selected' : ''}>-</option>
                            <option value="1000" ${data.distMult === 1000 ? 'selected' : ''}>Ezer (k)</option>
                            <option value="1000000" ${data.distMult === 1000000 ? 'selected' : ''}>Millió (M)</option>
                            <option value="1000000000" ${data.distMult === 1000000000 ? 'selected' : ''}>Milliárd (G)</option>
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-1 gap-2 mt-4">
                    <div class="p-3 rounded border ${isNightMode ? 'bg-red-950/20 border-red-900/30' : 'bg-blue-50 border-blue-100'}">
                        <div class="text-[10px] uppercase opacity-60 mb-1">Eredmények</div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <div class="text-xs opacity-50">Parsec</div>
                                <div class="font-mono font-bold text-lg">${formatNum(resPc)} pc</div>
                            </div>
                            <div>
                                <div class="text-xs opacity-50">Fényév</div>
                                <div class="font-mono font-bold text-lg">${formatNum(resLy)} ly</div>
                            </div>
                            <div>
                                <div class="text-xs opacity-50">Kilométer</div>
                                <div class="font-mono font-bold text-lg">${formatNum(resKm)} km</div>
                            </div>
                            <div>
                                <div class="text-xs opacity-50">Csillagászati Egység</div>
                                <div class="font-mono font-bold text-lg">${formatNum(resAu)} AU</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Attach listeners
            distInput.querySelectorAll('input, select').forEach(el => {
                el.onchange = (e) => updateData(el.dataset.key, el.tagName === 'SELECT' && el.dataset.key === 'distUnit' ? e.target.value : parseFloat(e.target.value));
            });

            container.appendChild(distInput);
        }
    }

    render();
    return container;
}
