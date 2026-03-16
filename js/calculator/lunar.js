import { storage, createInfoBtn, showInfoModal } from '../utils.js';

export function createLunarCalc(isNightMode) {
    const card = document.createElement('div');
    card.className = "astro-card h-full flex flex-col";
    
    let data = {
        F: storage.get('F', 1000),
        B: storage.get('B', 1),
        a: storage.get('a', 50),
        e: storage.get('e', 25),
        p: storage.get('p', 4.3),
        sunspotSize: 10000,
        sunspotUnit: 'km',
        sunspotLat: 15 // Default heliographic latitude
    };

    const update = () => {
        // Visual Lunar Size
        const tfov = (data.a * data.e) / (data.F * data.B);
        const lunarSizeKm = 2 * Math.tan((tfov * Math.PI / 180) / 2) * 384400;

        // Imaging Lunar Pixel Size (1km on moon = ~0.536 arcsec)
        const effF = data.F * data.B;
        const res = (data.p / effF) * 206.3;
        const kmInPixels = 0.536 / res;
        
        // Solar feature pixel size (1 arcsec on sun is approx 725 km)
        const sunKmPerPixel = res * 725;

        // Sunspot calculation
        let sunspotArcsec = 0;
        if (data.sunspotUnit === 'km') {
            sunspotArcsec = data.sunspotSize / 725;
        } else {
            sunspotArcsec = data.sunspotSize;
        }
        
        const sunspotPixels = sunspotArcsec / res;

        card.querySelector('#lun-vis').textContent = lunarSizeKm.toFixed(0) + ' km';
        card.querySelector('#lun-img').textContent = kmInPixels.toFixed(1) + ' px';
        card.querySelector('#sun-img').textContent = sunKmPerPixel.toFixed(0) + ' km/px';
        
        const spotResEl = card.querySelector('#sunspot-res');
        const spotWarnEl = card.querySelector('#sunspot-warning');
        const spotVisEl = card.querySelector('#sunspot-visual');
        
        spotResEl.textContent = sunspotPixels.toFixed(1) + ' px';
        
        if (sunspotPixels < 1) {
            spotWarnEl.textContent = 'Figyelem: A napfolt kisebb mint 1 pixel, nem lesz látható!';
            spotWarnEl.className = 'text-[9px] mt-1 text-yellow-500 opacity-80';
        } else {
            spotWarnEl.textContent = '';
        }

        // Visual representation
        // Sun angular size is ~1900 arcsec
        const sunPixels = 1900 / res;
        const scale = 40 / sunPixels;
        const scaledSun = 40;
        const scaledSpot = Math.max(1, sunspotPixels * scale);
        
        // Calculate Y position based on heliographic latitude (-90 to 90)
        // 0 is equator (center), 90 is north pole (top)
        const latRad = data.sunspotLat * Math.PI / 180;
        // Simple projection: y = R * sin(lat)
        const yOffset = (scaledSun / 2) * Math.sin(latRad);
        const topPos = (scaledSun / 2) - yOffset - (scaledSpot / 2);

        spotVisEl.innerHTML = `
            <div class="relative rounded-full bg-yellow-500/80 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-white/50 transition-all" style="width: ${scaledSun}px; height: ${scaledSun}px;" id="sun-diagram" title="Kattints a nagyításhoz">
                <!-- Equator line -->
                <div class="absolute w-full h-[1px] bg-black/20 top-1/2 transform -translate-y-1/2"></div>
                <!-- Sunspot -->
                <div class="absolute rounded-full bg-black" style="width: ${scaledSpot}px; height: ${scaledSpot}px; top: ${topPos}px;"></div>
            </div>
        `;

        // Add click listener for high-res modal
        card.querySelector('#sun-diagram').onclick = () => {
            const earthSizeKm = 12742;
            const earthArcsec = earthSizeKm / 725;
            const earthPixels = earthArcsec / res;
            
            const highResScale = 300 / sunPixels; // 300px sun
            const hrSun = 300;
            const hrSpot = Math.max(2, sunspotPixels * highResScale);
            const hrEarth = Math.max(2, earthPixels * highResScale);
            
            const hrYOffset = (hrSun / 2) * Math.sin(latRad);
            const hrTopPos = (hrSun / 2) - hrYOffset - (hrSpot / 2);

            const modalContent = `
                <div class="flex flex-col items-center justify-center py-4">
                    <div class="relative rounded-full bg-yellow-500/90 shadow-[0_0_40px_rgba(234,179,8,0.4)]" style="width: ${hrSun}px; height: ${hrSun}px;">
                        <!-- Grid lines -->
                        <div class="absolute w-full h-[1px] bg-black/20 top-1/2 transform -translate-y-1/2"></div>
                        <div class="absolute h-full w-[1px] bg-black/20 left-1/2 transform -translate-x-1/2"></div>
                        <!-- Latitude lines -->
                        <div class="absolute w-[86%] h-[1px] bg-black/10 top-[25%] left-[7%]"></div>
                        <div class="absolute w-[86%] h-[1px] bg-black/10 top-[75%] left-[7%]"></div>
                        
                        <!-- Sunspot -->
                        <div class="absolute rounded-full bg-black shadow-[0_0_5px_rgba(0,0,0,0.8)]" style="width: ${hrSpot}px; height: ${hrSpot}px; top: ${hrTopPos}px; left: calc(50% - ${hrSpot/2}px);"></div>
                    </div>
                    
                    <div class="mt-6 flex items-center gap-4 bg-black/30 p-3 rounded-lg border border-white/10 w-full justify-center">
                        <div class="text-center">
                            <div class="text-[10px] uppercase tracking-wider opacity-70 mb-1">Föld méretarány</div>
                            <div class="rounded-full bg-blue-500 mx-auto" style="width: ${hrEarth}px; height: ${hrEarth}px; min-width: 4px; min-height: 4px;"></div>
                        </div>
                        <div class="text-left text-xs opacity-80 border-l border-white/20 pl-4">
                            <div>Napfolt: <b>${data.sunspotSize} ${data.sunspotUnit}</b></div>
                            <div>Szélesség: <b>${data.sunspotLat}°</b></div>
                            <div>Szenzoron: <b>${sunspotPixels.toFixed(1)} px</b></div>
                        </div>
                    </div>
                </div>
            `;
            showInfoModal('Napfolt Nagyítás', modalContent, isNightMode);
        };
    };

    const labelClass = "astro-label text-[10px] block truncate";
    const inputClass = "astro-input p-1 text-xs w-full";

    card.innerHTML = `
        <h3 class="font-bold uppercase text-xs mb-4 ${isNightMode ? 'text-red-500' : 'text-blue-300'}">Hold/Nap Geometria</h3>
        <div class="space-y-3 mb-4 flex-grow custom-scrollbar overflow-y-auto pr-1">
            <div class="p-3 bg-black/10 rounded border border-white/5">
                <div class="${labelClass} mb-2">Napfolt Méret Kalkulátor</div>
                <div class="grid grid-cols-3 gap-2 items-end mb-2">
                    <div class="col-span-2">
                        <label class="${labelClass}">Méret</label>
                        <input type="number" id="sunspot-size" value="${data.sunspotSize}" class="${inputClass}">
                    </div>
                    <div>
                        <label class="${labelClass}">Egység</label>
                        <select id="sunspot-unit" class="astro-input p-1 text-xs w-full">
                            <option value="km" ${data.sunspotUnit === 'km' ? 'selected' : ''}>km</option>
                            <option value="arcsec" ${data.sunspotUnit === 'arcsec' ? 'selected' : ''}>ívmp</option>
                        </select>
                    </div>
                </div>
                <div class="mb-2">
                    <label class="${labelClass}">Heliografikus Szélesség (°)</label>
                    <input type="number" id="sunspot-lat" value="${data.sunspotLat}" min="-90" max="90" class="${inputClass}">
                </div>
                <div class="flex justify-between items-center mt-2">
                    <div>
                        <div class="${labelClass}">Pixelméret a szenzoron</div>
                        <div id="sunspot-res" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
                        <div id="sunspot-warning"></div>
                    </div>
                    <div id="sunspot-visual" class="flex items-center justify-center w-12 h-12 bg-black/20 rounded"></div>
                </div>
            </div>
        </div>
        <div class="grid grid-cols-2 gap-y-3 gap-x-2 pt-3 border-t border-white/10 mt-auto">
            <div class="col-span-2">
                <div class="${labelClass}">Vizuális Látómező (Hold felszín) ${createInfoBtn('Vizuális Látómező a Holdon', 'Megmutatja, hogy a távcsőbe nézve mekkora területet (kilométerben) látsz a Hold felszínéből egyszerre. Képlet: d = 2 * tan(TFoV/2) * 384400')}</div>
                <div id="lun-vis" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div>
                <div class="${labelClass}">1 km a Holdon (Fotós) ${createInfoBtn('Holdi felbontás', 'Megmutatja, hogy a Hold felszínén egy 1 kilométeres kráter hány pixelt foglal el. Képlet alapja: 0.536" / R (R: felbontás).')}</div>
                <div id="lun-img" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div>
                <div class="${labelClass}">1 pixel a Napon (Fotós) ${createInfoBtn('Nap felbontás', 'Megmutatja, hogy a kamera egyetlen pixele hány kilométeres területet fed le a Nap felszínén. Képlet: R * 725 km.')}</div>
                <div id="sun-img" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
        </div>
    `;

    card.querySelector('#sunspot-size').addEventListener('input', (e) => {
        data.sunspotSize = parseFloat(e.target.value) || 0;
        update();
    });
    
    card.querySelector('#sunspot-unit').addEventListener('change', (e) => {
        data.sunspotUnit = e.target.value;
        update();
    });

    card.querySelector('#sunspot-lat').addEventListener('input', (e) => {
        let val = parseFloat(e.target.value) || 0;
        if (val > 90) val = 90;
        if (val < -90) val = -90;
        data.sunspotLat = val;
        update();
    });

    window.addEventListener('astro-settings-changed', (e) => {
        data = { ...data, ...e.detail };
        update();
    });

    update();
    return card;
}
