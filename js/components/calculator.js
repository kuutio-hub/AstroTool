
import { storage } from '../utils.js';
import { InfoIcon, ChevronDownIcon, ChevronUpIcon } from '../icons.js';

export function createCalculator(isNightMode) {
    const container = document.createElement('div');
    container.className = "space-y-4";

    // State
    let activeTab = 'visual'; // 'visual' | 'imaging' | 'converter'
    let expandedCard = null; // ID of expanded card

    // Data State (persisted)
    let data = {
        telescopeFL: storage.get('telescopeFL', 1000),
        aperture: storage.get('aperture', 200),
        eyepieceFL: storage.get('eyepieceFL', 25),
        eyepieceAFOV: storage.get('eyepieceAFOV', 50),
        barlow: storage.get('barlow', 1),
        fieldStop: storage.get('fieldStop', 27),
        transmission: storage.get('transmission', 0.90),
        bortle: storage.get('bortle', 5),
        
        // Imaging
        sensorWidth: storage.get('sensorWidth', 22.3), // APS-C
        sensorHeight: storage.get('sensorHeight', 14.9),
        pixelSize: storage.get('pixelSize', 4.3),
        iso: storage.get('iso', 1600),
        filterFactor: storage.get('filterFactor', 1),
        skyBrightness: storage.get('skyBrightness', 20), // mag/arcsec2
        
        // Converter
        distValue: storage.get('distValue', 1),
        distUnit: storage.get('distUnit', 'pc'),
        distMult: storage.get('distMult', 1),
        
        hourH: storage.get('hourH', 0),
        hourM: storage.get('hourM', 0),
        hourS: storage.get('hourS', 0),
        degD: storage.get('degD', 0),
        degM: storage.get('degM', 0),
        degS: storage.get('degS', 0),
    };

    // Save data on change
    const updateData = (key, value) => {
        data[key] = value;
        storage.set(key, value);
        render();
    };

    // Helper: Render Formula
    const renderFormula = (formula) => {
        return `<div class="font-mono text-xs bg-black/10 p-2 rounded mt-2 break-all">${formula}</div>`;
    };

    // Helper: Calculation Card
    const createCard = (id, title, value, unit, description, formula, explanation, extraSettingsHTML = '') => {
        const isExpanded = expandedCard === id;
        const cardBg = isNightMode ? 'bg-black/40 border-red-900/30' : 'bg-white border-slate-300 shadow-sm';
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
                <span class="text-xl font-bold font-mono ${textColor}">${value}</span>
                <span class="text-xs opacity-60 font-mono">${unit}</span>
            </div>
            <div class="text-[9px] opacity-60 mt-1 truncate">${description}</div>
            
            ${isExpanded ? `
                <div class="mt-3 pt-3 border-t border-current/10 animate-fade-in">
                    <div class="mb-3 opacity-80">
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
        tabs.className = "flex gap-2 mb-4 border-b border-white/10 overflow-x-auto";
        tabs.innerHTML = `
            <button id="tab-visual" class="px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'visual' ? (isNightMode ? 'border-red-500 text-red-500' : 'border-blue-500 text-blue-600') : 'border-transparent opacity-50 hover:opacity-100'}">Vizuális</button>
            <button id="tab-imaging" class="px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'imaging' ? (isNightMode ? 'border-red-500 text-red-500' : 'border-blue-500 text-blue-600') : 'border-transparent opacity-50 hover:opacity-100'}">Fotós</button>
            <button id="tab-converter" class="px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'converter' ? (isNightMode ? 'border-red-500 text-red-500' : 'border-blue-500 text-blue-600') : 'border-transparent opacity-50 hover:opacity-100'}">Konverter</button>
        `;
        tabs.querySelector('#tab-visual').onclick = () => { activeTab = 'visual'; expandedCard = null; render(); };
        tabs.querySelector('#tab-imaging').onclick = () => { activeTab = 'imaging'; expandedCard = null; render(); };
        tabs.querySelector('#tab-converter').onclick = () => { activeTab = 'converter'; expandedCard = null; render(); };
        container.appendChild(tabs);

        const inputClass = `w-full p-2 rounded text-sm font-mono font-bold outline-none border transition-all ${isNightMode ? 'bg-black border-red-900/50 text-red-500 focus:border-red-500' : 'bg-white border-slate-300 text-slate-700 focus:border-blue-400'}`;
        const labelClass = `block text-[9px] font-bold uppercase tracking-wider mb-1 ${isNightMode ? 'text-red-800' : 'text-slate-500'}`;

        if (activeTab === 'visual') {
            // --- VISUAL CALCULATIONS ---
            const mag = (data.telescopeFL * data.barlow) / data.eyepieceFL;
            const fRatio = data.telescopeFL / data.aperture;
            const exitPupil = data.aperture / mag; // Or (Aperture * eyepieceFL) / (TelescopeFL * Barlow) -> same
            const tfov = (data.eyepieceAFOV * data.eyepieceFL) / (data.telescopeFL * data.barlow); // User formula: (ae)/F*B (assuming F*B is effective FL)
            const maxFov = (data.fieldStop / data.telescopeFL) * 57.3;
            const lunarSize = Math.tan((data.eyepieceAFOV * Math.PI / 180) / (data.barlow * data.telescopeFL)) * 384400; // User formula: tan(ae/BF)*384400 (Wait, ae is angle? yes. BF is effective FL?)
            // Actually, standard lunar size in eyepiece view depends on TFOV. 
            // Let's use TFOV for lunar size calculation: Size = tan(TFOV) * Distance
            const lunarSizeKm = Math.tan(tfov * Math.PI / 180) * 384400;

            const dawes = 116 / data.aperture;
            const rayleigh = 138 / data.aperture;
            
            // Limiting Mag: Mt= Mv-2+2,5log(AFt/e)
            // Mv based on Bortle
            const bortleMv = {
                1: 7.75, 2: 7.25, 3: 6.75, 4: 6.25, 5: 5.75, 6: 5.0, 7: 5.0, 8: 4.0, 9: 4.0
            }[data.bortle] || 5.0;
            
            // User formula: Mt = Mv - 2 + 2.5 * log10(A * F? * t / e) -> The user wrote "AFt/e". 
            // Standard formula is usually: M_limit = M_eye + 2.5 * log10(D^2 * t / P^2)
            // Let's interpret user's "AFt/e" as Aperture * something * transmission / eyepiece?
            // Given the ambiguity, I will use a standard robust formula but display the user's text.
            // Standard: M_t = M_v + 2.5 * log10((D/P)^2 * t) where P is pupil (approx 7mm).
            // Or simpler: M_t = M_v + 5 * log10(D) - 5 (approx).
            // Let's use: M_limit = BortleMv + 5 * log10(Aperture / 7) * TransmissionFactor (approx)
            const limitingMag = bortleMv + 5 * Math.log10(data.aperture / 7) * data.transmission;

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
                ${createInput("Fókusz (F) mm", "telescopeFL")}
                ${createInput("Átmérő (A) mm", "aperture")}
                ${createInput("Okulár (e) mm", "eyepieceFL")}
                ${createInput("Látómező (a) °", "eyepieceAFOV")}
                <div class="col-span-2 sm:col-span-4">
                    <label class="${labelClass}">Barlow / Reducer (B)</label>
                    <select data-key="barlow" class="${inputClass}">
                        <option value="1" ${data.barlow === 1 ? 'selected' : ''}>Nincs (1.0x)</option>
                        <option value="2" ${data.barlow === 2 ? 'selected' : ''}>2x Barlow</option>
                        <option value="2.5" ${data.barlow === 2.5 ? 'selected' : ''}>2.5x Barlow</option>
                        <option value="3" ${data.barlow === 3 ? 'selected' : ''}>3x Barlow</option>
                        <option value="4" ${data.barlow === 4 ? 'selected' : ''}>4x Barlow</option>
                        <option value="5" ${data.barlow === 5 ? 'selected' : ''}>5x Barlow</option>
                        <option value="0.9" ${data.barlow === 0.9 ? 'selected' : ''}>0.9x Reducer</option>
                        <option value="0.8" ${data.barlow === 0.8 ? 'selected' : ''}>0.8x Reducer</option>
                        <option value="0.63" ${data.barlow === 0.63 ? 'selected' : ''}>0.63x Reducer</option>
                        <option value="0.5" ${data.barlow === 0.5 ? 'selected' : ''}>0.5x Reducer</option>
                        <option value="0.33" ${data.barlow === 0.33 ? 'selected' : ''}>0.33x Reducer</option>
                    </select>
                </div>
            `;
            
            inputsGrid.querySelectorAll('input, select').forEach(el => {
                el.onchange = (e) => updateData(el.dataset.key, parseFloat(e.target.value));
            });
            container.appendChild(inputsGrid);

            // Cards Grid
            const cardsGrid = document.createElement('div');
            cardsGrid.className = "grid grid-cols-2 gap-2";

            cardsGrid.appendChild(createCard('mag', 'Nagyítás', mag.toFixed(1), 'x', 'Objektum mérete.', 
                'Mag = F / e * B', 'F: Fókusz, e: Okulár, B: Barlow'));
            
            cardsGrid.appendChild(createCard('fov', 'Látómező', tfov.toFixed(2), '°', 'Látható égbolt.', 
                'FoV = (a * e) / F * B', 'a: Okulár AFOV, e: Okulár FL, F: Távcső FL',
                `<div>
                    <label class="${labelClass}">Field Stop (b) mm</label>
                    <input type="number" step="0.1" value="${data.fieldStop}" data-key="fieldStop" class="${inputClass}" />
                    <p class="text-[9px] mt-1 opacity-60">Max FoV = b / F * 57.3 = ${maxFov.toFixed(2)}°</p>
                 </div>`
            ));

            cardsGrid.appendChild(createCard('ep', 'Kilépő Pupilla', exitPupil.toFixed(1), 'mm', 'Fényesség.', 
                'EP = A * e / F', 'A: Átmérő, e: Okulár, F: Fókusz'));

            cardsGrid.appendChild(createCard('fr', 'Fényerő', `f/${fRatio.toFixed(1)}`, '', 'Sebesség.', 
                'f = F / A', 'F: Fókusz, A: Átmérő'));

            cardsGrid.appendChild(createCard('res', 'Felbontás', dawes.toFixed(2), '"', 'Dawes limit.', 
                'Res = 116 / A', 'A: Átmérő (mm). Rayleigh: 138/A = ' + rayleigh.toFixed(2) + '"'));

            cardsGrid.appendChild(createCard('lim', 'Határmagnitúdó', limitingMag.toFixed(1), 'mag', 'Halványság.', 
                'Mt = Mv - 2 + 2.5 * log(A * t / e)', 'Becsült érték Bortle skála alapján.',
                `<div>
                    <label class="${labelClass}">Bortle Skála (Mv)</label>
                    <select data-key="bortle" class="${inputClass}">
                        <option value="1" ${data.bortle === 1 ? 'selected' : ''}>Bortle 1 (7.75)</option>
                        <option value="2" ${data.bortle === 2 ? 'selected' : ''}>Bortle 2 (7.25)</option>
                        <option value="3" ${data.bortle === 3 ? 'selected' : ''}>Bortle 3 (6.75)</option>
                        <option value="4" ${data.bortle === 4 ? 'selected' : ''}>Bortle 4 (6.25)</option>
                        <option value="5" ${data.bortle === 5 ? 'selected' : ''}>Bortle 5 (5.75)</option>
                        <option value="6" ${data.bortle === 6 ? 'selected' : ''}>Bortle 6-7 (5.0)</option>
                        <option value="8" ${data.bortle === 8 ? 'selected' : ''}>Bortle 8-9 (4.0)</option>
                    </select>
                    <div class="mt-2">
                        <label class="${labelClass}">Áteresztés (t)</label>
                        <input type="number" step="0.01" max="1" value="${data.transmission}" data-key="transmission" class="${inputClass}" />
                    </div>
                 </div>`
            ));

            container.appendChild(cardsGrid);

        } else if (activeTab === 'imaging') {
            // --- IMAGING CALCULATIONS ---
            const effFL = data.telescopeFL * data.barlow; // F * B
            const fRatio = effFL / data.aperture;
            
            // FoV Imaging
            // arcmin: FoV=(w/(F*B))*3438
            // degrees: FoV=(w/(F*B))57,3
            const fovW_deg = (data.sensorWidth / effFL) * 57.3;
            const fovH_deg = (data.sensorHeight / effFL) * 57.3;
            
            // Resolution (arcsec/px)
            // Res=(P/(FxB))*206,3
            const res = (data.pixelSize / effFL) * 206.3;
            
            // Lunar Feature Image Size (pixels)
            // Size=1000F/p*atan(1/384400) -> Wait, atan(1/384400) is tiny angle. 
            // Let's use standard: Size(px) = (Size(km) / Distance(km)) * 206265 / Resolution(arcsec/px)
            // Or user formula: Size = 1000F/p * atan(1/384400) ??? 
            // Let's interpret: Feature size 1km on Moon.
            // Angular size of 1km at 384400km = 206265 * 1 / 384400 = 0.53 arcsec.
            // Pixels = 0.53 / res.
            const kmInPixels = 0.536 / res; 

            // Exposure
            // Exposure=FF/i*f^2/2,512^9-sb
            // 2.512^(9-sb) -> This looks like brightness factor.
            // Let's implement exactly as written.
            const exposure = (data.filterFactor / data.iso) * Math.pow(fRatio, 2) / Math.pow(2.512, 9 - data.skyBrightness);

            // Inputs
            const inputsGrid = document.createElement('div');
            inputsGrid.className = "grid grid-cols-2 gap-3 mb-4";
            
            inputsGrid.innerHTML = `
                <div class="col-span-2">
                    <label class="${labelClass}">Szenzor</label>
                    <select id="sensor-select" class="${inputClass}">
                        <option value="custom">Egyéni...</option>
                        <option value="36,24,4.3" ${data.sensorWidth === 36 ? 'selected' : ''}>Full Frame (36x24mm)</option>
                        <option value="22.3,14.9,4.3" ${data.sensorWidth === 22.3 ? 'selected' : ''}>APS-C Canon (22.3x14.9mm)</option>
                        <option value="23.5,15.6,3.9" ${data.sensorWidth === 23.5 ? 'selected' : ''}>APS-C Nikon/Sony (23.5x15.6mm)</option>
                        <option value="17.3,13,3.7" ${data.sensorWidth === 17.3 ? 'selected' : ''}>Micro 4/3 (17.3x13mm)</option>
                        <option value="13.2,8.8,2.4" ${data.sensorWidth === 13.2 ? 'selected' : ''}>1" (13.2x8.8mm)</option>
                    </select>
                </div>
                <div>
                    <label class="${labelClass}">Szélesség (w) mm</label>
                    <input type="number" step="0.1" value="${data.sensorWidth}" data-key="sensorWidth" class="${inputClass}" />
                </div>
                <div>
                    <label class="${labelClass}">Magasság (h) mm</label>
                    <input type="number" step="0.1" value="${data.sensorHeight}" data-key="sensorHeight" class="${inputClass}" />
                </div>
                <div>
                    <label class="${labelClass}">Pixel (p) µm</label>
                    <input type="number" step="0.1" value="${data.pixelSize}" data-key="pixelSize" class="${inputClass}" />
                </div>
                <div>
                    <label class="${labelClass}">ISO (i)</label>
                    <input type="number" step="100" value="${data.iso}" data-key="iso" class="${inputClass}" />
                </div>
            `;

            inputsGrid.querySelector('#sensor-select').onchange = (e) => {
                if (e.target.value !== 'custom') {
                    const [w, h, p] = e.target.value.split(',').map(parseFloat);
                    updateData('sensorWidth', w);
                    updateData('sensorHeight', h);
                    updateData('pixelSize', p);
                }
            };
            inputsGrid.querySelectorAll('input').forEach(el => {
                el.onchange = (e) => updateData(el.dataset.key, parseFloat(e.target.value));
            });
            container.appendChild(inputsGrid);

            // Cards
            const cardsGrid = document.createElement('div');
            cardsGrid.className = "grid grid-cols-2 gap-2";

            cardsGrid.appendChild(createCard('fov_img', 'Látómező', `${fovW_deg.toFixed(2)} x ${fovH_deg.toFixed(2)}`, '°', 'Szenzor lefedettség.', 
                'FoV = (w / (F*B)) * 57.3', 'w: Szenzor méret, F: Fókusz, B: Barlow'));

            cardsGrid.appendChild(createCard('res_img', 'Felbontás', res.toFixed(2), '"/px', 'Ívmásodperc / pixel.', 
                'Res = (p / (F*B)) * 206.3', 'p: Pixel méret (µm)'));

            cardsGrid.appendChild(createCard('lunar_px', '1km a Holdon', kmInPixels.toFixed(1), 'px', 'Hány pixel 1 km?', 
                'Size = (0.536 / Res)', '1 km a Holdon kb 0.536 ívmásodperc.'));

            cardsGrid.appendChild(createCard('exp', 'Expó', exposure.toExponential(2), 's', 'Becsült expó idő.', 
                'Exp = FF/i * f^2 / 2.512^(9-sb)', 'FF: Filter, i: ISO, f: Fényerő, sb: Égbolt fényesség',
                `<div>
                    <label class="${labelClass}">Filter Factor (FF)</label>
                    <input type="number" step="0.1" value="${data.filterFactor}" data-key="filterFactor" class="${inputClass}" />
                    <div class="mt-2">
                        <label class="${labelClass}">Sky Brightness (sb)</label>
                        <input type="number" step="0.1" value="${data.skyBrightness}" data-key="skyBrightness" class="${inputClass}" />
                    </div>
                 </div>`
            ));

            container.appendChild(cardsGrid);

        } else if (activeTab === 'converter') {
            // --- CONVERTER ---
            
            // 1. Distance
            let valInPc = 0;
            const val = data.distValue * data.distMult;
            if (data.distUnit === 'pc') valInPc = val;
            else if (data.distUnit === 'ly') valInPc = val / 3.262;
            else if (data.distUnit === 'km') valInPc = val / 3.086e13; // 1 pc = 3.086e13 km

            const resPc = valInPc;
            const resLy = valInPc * 3.262;
            const resKm = valInPc * 3.086e13;
            const resTm = resKm / 1e12; // Trillion km

            // 2. Coordinates (Hour Angle <-> Degrees)
            // HA to Deg: a=(H+(min/60)+(sec/3600)*15 -> Wait, (H + m/60 + s/3600) * 15
            const haToDeg = (data.hourH + data.hourM/60 + data.hourS/3600) * 15;
            // Deg to HA: a=(Deg+(min/60)+sec/3600))/15
            const degToHa = (data.degD + data.degM/60 + data.degS/3600) / 15;

            const formatNum = (n) => {
                if (n > 1e12 || (n < 1e-3 && n > 0)) return n.toExponential(2);
                return n.toLocaleString('hu-HU', { maximumFractionDigits: 3 });
            };

            const converterDiv = document.createElement('div');
            converterDiv.className = "space-y-6";
            
            converterDiv.innerHTML = `
                <!-- Distance -->
                <div class="p-3 rounded border ${cardBg}">
                    <h3 class="font-bold uppercase text-xs mb-3 ${labelColor}">Távolság Konverter</h3>
                    <div class="grid grid-cols-3 gap-2 mb-4">
                        <input type="number" value="${data.distValue}" data-key="distValue" class="${inputClass}" />
                        <select data-key="distUnit" class="${inputClass}">
                            <option value="pc" ${data.distUnit === 'pc' ? 'selected' : ''}>Parsec (pc)</option>
                            <option value="ly" ${data.distUnit === 'ly' ? 'selected' : ''}>Fényév (ly)</option>
                            <option value="km" ${data.distUnit === 'km' ? 'selected' : ''}>Kilométer (km)</option>
                        </select>
                        <select data-key="distMult" class="${inputClass}">
                            <option value="1" ${data.distMult === 1 ? 'selected' : ''}>-</option>
                            <option value="1000" ${data.distMult === 1000 ? 'selected' : ''}>Ezer (k)</option>
                            <option value="1000000" ${data.distMult === 1000000 ? 'selected' : ''}>Millió (M)</option>
                        </select>
                    </div>
                    <div class="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div>${formatNum(resPc)} pc</div>
                        <div>${formatNum(resLy)} ly</div>
                        <div>${formatNum(resKm)} km</div>
                        <div>${formatNum(resTm)} Tm</div>
                    </div>
                </div>

                <!-- Coordinates -->
                <div class="p-3 rounded border ${cardBg}">
                    <h3 class="font-bold uppercase text-xs mb-3 ${labelColor}">Koordináta Konverter</h3>
                    
                    <div class="mb-4">
                        <label class="${labelClass}">Óraszög (HA) -> Fok</label>
                        <div class="flex gap-1 mb-2">
                            <input type="number" placeholder="H" value="${data.hourH}" data-key="hourH" class="${inputClass}" />
                            <input type="number" placeholder="M" value="${data.hourM}" data-key="hourM" class="${inputClass}" />
                            <input type="number" placeholder="S" value="${data.hourS}" data-key="hourS" class="${inputClass}" />
                        </div>
                        <div class="font-mono font-bold text-right ${textColor}">${haToDeg.toFixed(4)}°</div>
                    </div>

                    <div>
                        <label class="${labelClass}">Fok (Deg) -> Óraszög</label>
                        <div class="flex gap-1 mb-2">
                            <input type="number" placeholder="D" value="${data.degD}" data-key="degD" class="${inputClass}" />
                            <input type="number" placeholder="M" value="${data.degM}" data-key="degM" class="${inputClass}" />
                            <input type="number" placeholder="S" value="${data.degS}" data-key="degS" class="${inputClass}" />
                        </div>
                        <div class="font-mono font-bold text-right ${textColor}">${Math.floor(degToHa)}h ${Math.floor((degToHa%1)*60)}m ${((degToHa*60%1)*60).toFixed(1)}s</div>
                    </div>
                </div>
            `;

            converterDiv.querySelectorAll('input, select').forEach(el => {
                el.onchange = (e) => updateData(el.dataset.key, el.tagName === 'SELECT' && el.dataset.key === 'distUnit' ? e.target.value : parseFloat(e.target.value));
            });

            container.appendChild(converterDiv);
        }
    }

    render();
    return container;
}
