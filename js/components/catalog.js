import { catalogService } from '../services/catalogService.js';
import { constellations, objectTypes } from '../catalogs.js';
import { CatalogIcon, InfoIcon, ChevronDownIcon, ChevronUpIcon } from '../icons.js';

export function createCatalog(isNightMode) {
    const container = document.createElement('div');
    container.className = "space-y-4";

    // State
    let searchTerm = '';
    let selectedConst = 'ALL';
    let selectedType = 'ALL';
    let expandedItem = null;
    let currentPage = 1;
    const itemsPerPage = 25;
    let currentResults = [];
    let isLoading = false;

    // Render Function
    async function render() {
        container.innerHTML = '';
        
        const textColor = isNightMode ? 'text-red-500' : 'text-white';

        // Filters
        const filtersDiv = document.createElement('div');
        filtersDiv.className = "space-y-2 mb-4 animate-fade-in";
        filtersDiv.innerHTML = `
            <input type="text" id="cat-search" placeholder="Keresés (pl. M42, Orion)..." class="astro-input" value="${searchTerm}">
            <div class="flex gap-2">
                <select id="const-filter" class="astro-input text-xs">
                    <option value="ALL">Minden csillagkép</option>
                    ${Object.entries(constellations).sort((a,b) => a[1].localeCompare(b[1])).map(([code, name]) => `<option value="${code}" ${selectedConst === code ? 'selected' : ''}>${name} (${code})</option>`).join('')}
                </select>
                <select id="type-filter" class="astro-input text-xs">
                    <option value="ALL">Minden típus</option>
                    ${Object.entries(objectTypes).map(([code, name]) => `<option value="${code}" ${selectedType === code ? 'selected' : ''}>${name}</option>`).join('')}
                </select>
            </div>
        `;

        const triggerSearch = () => {
            currentPage = 1;
            fetchAndRender();
        };

        filtersDiv.querySelector('#cat-search').oninput = (e) => { searchTerm = e.target.value; triggerSearch(); };
        filtersDiv.querySelector('#const-filter').onchange = (e) => { selectedConst = e.target.value; triggerSearch(); };
        filtersDiv.querySelector('#type-filter').onchange = (e) => { selectedType = e.target.value; triggerSearch(); };

        container.appendChild(filtersDiv);

        // List Container
        const listDiv = document.createElement('div');
        listDiv.className = "space-y-2";
        container.appendChild(listDiv);

        async function fetchAndRender() {
            if (isLoading) return;
            isLoading = true;
            listDiv.innerHTML = `<div class="text-center opacity-50 text-xs py-8 animate-pulse">Adatok lekérése...</div>`;

            try {
                // Fetch from server
                let results = [];
                if (searchTerm.length >= 2) {
                    results = await catalogService.search(searchTerm);
                } else if (selectedConst !== 'ALL') {
                    results = await catalogService.searchByConstellation(selectedConst);
                } else {
                    // Default to Messier if no filters
                    results = await catalogService.getByCatalog('messier');
                }

                // Client-side type filtering
                if (selectedType !== 'ALL') {
                    results = results.filter(item => item.type === selectedType || item.subtype === selectedType);
                }

                currentResults = results;
                renderList();
            } catch (error) {
                listDiv.innerHTML = `<div class="text-center text-red-500 text-xs py-8">Hiba történt az adatok betöltésekor.</div>`;
            } finally {
                isLoading = false;
            }
        }

        function renderList() {
            listDiv.innerHTML = '';
            
            if (currentResults.length === 0) {
                listDiv.innerHTML = `<div class="text-center opacity-50 text-xs py-4">Nincs találat.</div>`;
                return;
            }

            // Pagination Logic
            const totalPages = Math.ceil(currentResults.length / itemsPerPage);
            const startIndex = (currentPage - 1) * itemsPerPage;
            const displayList = currentResults.slice(startIndex, startIndex + itemsPerPage);

            displayList.forEach(item => {
                const isExpanded = expandedItem === item.id;
                const itemEl = document.createElement('div');
                itemEl.className = `astro-card transition-all`;
                
                itemEl.innerHTML = `
                    <div class="flex justify-between items-center cursor-pointer">
                        <div class="flex items-center gap-3">
                            <div class="font-mono font-bold text-lg ${textColor}">${item.id}</div>
                            <div>
                                <div class="font-bold text-xs uppercase tracking-wider">${item.name || item.id}</div>
                                <div class="text-[10px] opacity-60">${item.type} • ${constellations[item.constellation] || item.constellation}</div>
                            </div>
                        </div>
                        <div class="${isNightMode ? 'text-red-800' : 'text-slate-400'}">
                            ${isExpanded ? ChevronUpIcon("w-4 h-4") : ChevronDownIcon("w-4 h-4")}
                        </div>
                    </div>
                    ${isExpanded ? `
                        <div class="mt-3 pt-3 border-t border-current/10 text-xs space-y-1 animate-fade-in">
                            <div class="flex justify-between"><span class="astro-label mb-0">Katalógus:</span> <span class="font-mono">${item.catalog}</span></div>
                            <div class="flex justify-between"><span class="astro-label mb-0">Fényesség:</span> <span class="font-mono">${item.magnitude} mag</span></div>
                            <div class="flex justify-between"><span class="astro-label mb-0">Méret:</span> <span class="font-mono">${item.size}</span></div>
                            <div class="flex justify-between"><span class="astro-label mb-0">Távolság:</span> <span class="font-mono">${item.distance_ly ? formatNum(item.distance_ly) + ' ly' : '-'}</span></div>
                            <div class="mt-2 italic opacity-80">${item.notes || ''}</div>
                        </div>
                    ` : ''}
                `;

                itemEl.querySelector('.cursor-pointer').onclick = () => {
                    expandedItem = isExpanded ? null : item.id;
                    renderList();
                };

                listDiv.appendChild(itemEl);
            });
            
            // Pagination Controls
            if (totalPages > 1) {
                const paginationDiv = document.createElement('div');
                paginationDiv.className = "flex justify-center items-center gap-4 pt-4 text-xs font-bold";
                
                const btnClass = `px-4 py-2 rounded-lg transition-all uppercase tracking-widest text-[10px] ${isNightMode ? 'bg-red-900/40 text-red-500 hover:bg-red-800/60' : 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50'}`;
                
                paginationDiv.innerHTML = `
                    <button id="prev-btn" class="${btnClass} ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : ''}" ${currentPage === 1 ? 'disabled' : ''}>&lt; Előző</button>
                    <span class="opacity-70 font-mono">${currentPage} / ${totalPages}</span>
                    <button id="next-btn" class="${btnClass} ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : ''}" ${currentPage === totalPages ? 'disabled' : ''}>Következő &gt;</button>
                `;
                
                paginationDiv.querySelector('#prev-btn').onclick = () => {
                    if (currentPage > 1) {
                        currentPage--;
                        renderList();
                        window.scrollTo(0, 0);
                    }
                };
                
                paginationDiv.querySelector('#next-btn').onclick = () => {
                    if (currentPage < totalPages) {
                        currentPage++;
                        renderList();
                        window.scrollTo(0, 0);
                    }
                };
                
                listDiv.appendChild(paginationDiv);
            }
        }

        await fetchAndRender();
    }

    render();
    return container;
}

// Helper for formatting large numbers
function formatNum(num) {
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'k';
    return num.toString();
}
