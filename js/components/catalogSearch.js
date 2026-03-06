import { catalogService } from '../services/catalogService.js';

export function createCatalogSearch(isNightMode) {
    const container = document.createElement('div');
    container.className = "astro-card col-span-1 md:col-span-2 lg:col-span-3";

    const headerColor = isNightMode ? "text-red-500" : "text-blue-300";
    const inputClass = "astro-input";
    const btnClass = `px-4 py-2 rounded font-bold text-xs uppercase tracking-wider transition-all ${isNightMode ? 'bg-red-900/50 hover:bg-red-800 text-red-500' : 'bg-blue-600 hover:bg-blue-700 text-white'}`;

    container.innerHTML = `
        <h3 class="font-bold uppercase text-xs mb-4 ${headerColor}">Katalógus Kereső</h3>
        <div class="flex gap-2 mb-4">
            <input type="text" id="search-input" placeholder="Csillagkép (pl. Ori, Boötes)" class="${inputClass} flex-1">
            <button id="search-btn" class="${btnClass}">Keresés</button>
        </div>
        <div id="search-results" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto no-scrollbar">
            <div class="text-sm opacity-50 col-span-full text-center py-4">Írj be egy csillagképet a kereséshez...</div>
        </div>
    `;

    const searchInput = container.querySelector('#search-input');
    const searchBtn = container.querySelector('#search-btn');
    const resultsDiv = container.querySelector('#search-results');

    const renderResults = (results) => {
        resultsDiv.innerHTML = '';
        if (results.length === 0) {
            resultsDiv.innerHTML = '<div class="text-sm opacity-50 col-span-full text-center py-4">Nincs találat.</div>';
            return;
        }

        results.forEach(obj => {
            const card = document.createElement('div');
            card.className = `p-3 rounded border ${isNightMode ? 'bg-black/40 border-red-900/30' : 'bg-slate-800/50 border-white/10'}`;
            
            let extraInfo = '';
            if (obj.type === 'Double Star') {
                extraInfo = `
                    <div class="flex justify-between mt-1">
                        <span class="opacity-70">Mag 1/2:</span>
                        <span class="font-mono">${obj.mag_primary} / ${obj.mag_secondary}</span>
                    </div>
                    <div class="flex justify-between mt-1">
                        <span class="opacity-70">Sep/PA:</span>
                        <span class="font-mono">${obj.separation_arcsec}" / ${obj.position_angle}°</span>
                    </div>
                `;
            } else {
                extraInfo = `
                    <div class="flex justify-between mt-1">
                        <span class="opacity-70">Méret:</span>
                        <span class="font-mono">${obj.size || '-'}</span>
                    </div>
                    <div class="flex justify-between mt-1">
                        <span class="opacity-70">Távolság:</span>
                        <span class="font-mono">${obj.distance_ly ? obj.distance_ly + ' ly' : '-'}</span>
                    </div>
                `;
            }

            card.innerHTML = `
                <div class="flex justify-between items-start mb-2 border-b border-white/10 pb-2">
                    <div class="font-bold text-lg ${isNightMode ? 'text-red-400' : 'text-white'}">${obj.id}</div>
                    <div class="text-[10px] uppercase font-bold tracking-wider opacity-70 bg-white/10 px-2 py-1 rounded">${obj.catalog}</div>
                </div>
                <div class="text-xs space-y-1">
                    <div class="flex justify-between">
                        <span class="opacity-70">Típus:</span>
                        <span class="font-mono">${obj.type} (${obj.subtype})</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="opacity-70">Csillagkép:</span>
                        <span class="font-mono font-bold">${obj.constellation}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="opacity-70">Fényesség:</span>
                        <span class="font-mono">${obj.magnitude} mag</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="opacity-70">RA/Dec:</span>
                        <span class="font-mono">${obj.ra} / ${obj.dec}</span>
                    </div>
                    ${extraInfo}
                    <div class="mt-2 pt-2 border-t border-white/10 italic opacity-80 text-[10px]">
                        ${obj.notes || ''}
                    </div>
                </div>
            `;
            resultsDiv.appendChild(card);
        });
    };

    const performSearch = async () => {
        const query = searchInput.value.trim();
        if (!query) return;
        
        searchBtn.textContent = "Keresés...";
        searchBtn.disabled = true;
        
        try {
            const results = await catalogService.searchByConstellation(query);
            renderResults(results);
        } catch (e) {
            resultsDiv.innerHTML = '<div class="text-sm text-red-500 col-span-full text-center py-4">Hiba történt a keresés során.</div>';
        } finally {
            searchBtn.textContent = "Keresés";
            searchBtn.disabled = false;
        }
    };

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    return container;
}
