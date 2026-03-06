import { storage } from '../utils.js';

export function createLunarCalc(isNightMode) {
    const card = document.createElement('div');
    card.className = "astro-card";
    
    let data = {
        F: storage.get('F', 1000),
        B: storage.get('B', 1),
        a: storage.get('a', 50),
        e: storage.get('e', 25),
        p: storage.get('p', 4.3)
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
        // So 1 pixel = res arcsec = res * 725 km
        const sunKmPerPixel = res * 725;

        card.querySelector('#lun-vis').textContent = lunarSizeKm.toFixed(0) + ' km';
        card.querySelector('#lun-img').textContent = kmInPixels.toFixed(1) + ' px';
        card.querySelector('#sun-img').textContent = sunKmPerPixel.toFixed(0) + ' km/px';
    };

    const labelClass = "astro-label";

    card.innerHTML = `
        <h3 class="font-bold uppercase text-xs mb-4 ${isNightMode ? 'text-red-500' : 'text-blue-300'}">Hold/Nap Geometria</h3>
        <div class="text-xs opacity-70 mb-4 italic">A paraméterek a globális beállításokból jönnek.</div>
        <div class="grid grid-cols-2 gap-y-3 gap-x-2 pt-3 border-t border-white/10">
            <div class="col-span-2">
                <div class="${labelClass}">Vizuális Látómező (Hold felszín)</div>
                <div id="lun-vis" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div>
                <div class="${labelClass}">1 km a Holdon (Fotós)</div>
                <div id="lun-img" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
            </div>
            <div>
                <div class="${labelClass}">1 pixel a Napon (Fotós)</div>
                <div id="sun-img" class="font-mono font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}"></div>
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
