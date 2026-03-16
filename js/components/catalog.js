import { catalogService } from '../services/catalogService.js';
import { constellations, objectTypes } from '../catalogs.js';
import { CatalogIcon, InfoIcon, ChevronDownIcon, ChevronUpIcon } from '../icons.js';
import { storage, TimeService, calculateAltAz, formatNum } from '../utils.js';

window.updateCatalogDistance = (id, distanceLy, unit) => {
    const distValEl = document.getElementById(`modal-dist-val-${id}`);
    if (!distValEl) return;
    
    let val = distanceLy;
    let suffix = ' fényév';
    
    if (unit === 'pc') {
        val = val / 3.26156;
        if (val >= 1e9) { val = val / 1e9; suffix = ' Gpc'; }
        else if (val >= 1e6) { val = val / 1e6; suffix = ' Mpc'; }
        else if (val >= 1e3) { val = val / 1e3; suffix = ' kpc'; }
        else { suffix = ' pc'; }
    } else if (unit === 'km') {
        val = val * 9.461e12;
        const exp = Math.floor(Math.log10(val));
        const mantissa = (val / Math.pow(10, exp)).toFixed(2).replace('.', ',');
        distValEl.innerHTML = `${mantissa} &times; 10<sup>${exp}</sup> km`;
        return;
    }
    
    distValEl.textContent = val.toLocaleString('hu-HU', { maximumFractionDigits: 2 }) + suffix;
};

const TypeIcons = {
    'GAL': `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8 3.582-8 8-8zm0 0c1.5 0 2.5 2 2.5 4 0 1.5-1 3-2.5 3s-2.5-1.5-2.5-3c0-2 1-4 2.5-4zm0 16c-1.5 0-2.5-2-2.5-4 0-1.5 1-3 2.5-3s2.5 1.5 2.5 3c0 2-1 4-2.5 4z"></path></svg>`,
    'PN': `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="7" stroke-width="1.5" stroke-dasharray="3 3"></circle><circle cx="12" cy="12" r="2" fill="currentColor"></circle></svg>`,
    'NB': `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path></svg>`,
    'OC': `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="8" cy="8" r="1.5" fill="currentColor"/><circle cx="16" cy="7" r="1.5" fill="currentColor"/><circle cx="12" cy="15" r="1.5" fill="currentColor"/><circle cx="5" cy="14" r="1.5" fill="currentColor"/><circle cx="19" cy="13" r="1.5" fill="currentColor"/><circle cx="13" cy="5" r="1" fill="currentColor"/></svg>`,
    'GC': `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" stroke-width="1.5" opacity="0.3"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="8" r="1" fill="currentColor"/><circle cx="12" cy="16" r="1" fill="currentColor"/><circle cx="8" cy="12" r="1" fill="currentColor"/><circle cx="16" cy="12" r="1" fill="currentColor"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="15" r="1" fill="currentColor"/><circle cx="9" cy="15" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/></svg>`,
    'SNR': `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 2l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1 2-4z M12 22c-4 0-7-3-7-7s3-7 7-7 7 3 7 7-3 7-7 7z" opacity="0.7"></path></svg>`,
    'DS': `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2-3 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1 2-4z" fill="currentColor" transform="scale(0.6) translate(4,4)"/><path d="M18 18l1.5-2 2.5 0.5-2 2 0.5 2.5-2.5-1-2.5 1 0.5-2.5-2-2 2.5-0.5 1.5-2z" fill="currentColor" transform="scale(0.5) translate(20,20)"/></svg>`,
    'STAR': `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>`
};

export function createCatalog(isNightMode) {
    const container = document.createElement('div');
    container.className = "space-y-4";

    // State
    let searchTerm = '';
    let selectedCatalog = ''; // No default catalog
    let selectedConst = 'ALL';
    let selectedType = 'ALL';
    let sortBy = 'default'; // 'default' or 'altitude'
    let expandedItem = null;
    let currentPage = 1;
    const itemsPerPage = 25;
    let currentResults = [];
    let isLoading = false;
    
    // Distance unit state for expanded items
    const distanceUnits = {}; // { itemId: 'ly' | 'pc' | 'km' }

    // Render Function
    async function render() {
        container.innerHTML = '';
        
        const textColor = isNightMode ? 'text-red-500' : 'text-white';

        // Filters
        const filtersDiv = document.createElement('div');
        filtersDiv.className = "space-y-2 mb-4 animate-fade-in";
        filtersDiv.innerHTML = `
            <div class="flex gap-2">
                <select id="cat-filter" class="astro-input text-xs flex-1">
                    <option value="" ${!selectedCatalog ? 'selected' : ''}>-- Válassz katalógust --</option>
                    <option value="messier" ${selectedCatalog === 'messier' ? 'selected' : ''}>Messier Katalógus</option>
                    <option value="caldwell" ${selectedCatalog === 'caldwell' ? 'selected' : ''}>Caldwell Katalógus</option>
                    <option value="melotte" ${selectedCatalog === 'melotte' ? 'selected' : ''}>Melotte Katalógus</option>
                    <option value="ngc" ${selectedCatalog === 'ngc' ? 'selected' : ''}>NGC Katalógus (Kiemelt)</option>
                    <option value="ic" ${selectedCatalog === 'ic' ? 'selected' : ''}>IC Katalógus (Kiemelt)</option>
                    <option value="hr" ${selectedCatalog === 'hr' ? 'selected' : ''}>Fényes csillagok (HR)</option>
                    <option value="wds" ${selectedCatalog === 'wds' ? 'selected' : ''}>Kettőscsillagok (WDS)</option>
                </select>
                <input type="text" id="cat-search" placeholder="Keresés..." class="astro-input flex-[2]" value="${searchTerm}">
            </div>
            <div class="flex gap-2">
                <select id="const-filter" class="astro-input text-xs flex-1">
                    <option value="ALL">Minden csillagkép</option>
                    ${Object.entries(constellations).sort((a,b) => a[1].localeCompare(b[1])).map(([code, name]) => `<option value="${code}" ${selectedConst === code ? 'selected' : ''}>${name}</option>`).join('')}
                </select>
                <select id="type-filter" class="astro-input text-xs flex-1">
                    <option value="ALL">Minden típus</option>
                    ${Object.entries(objectTypes).map(([code, name]) => `<option value="${code}" ${selectedType === code ? 'selected' : ''}>${name}</option>`).join('')}
                </select>
            </div>
            <div class="flex gap-2">
                <select id="sort-filter" class="astro-input text-xs flex-1">
                    <option value="default" ${sortBy === 'default' ? 'selected' : ''}>Alapértelmezett sorrend</option>
                    <option value="altitude" ${sortBy === 'altitude' ? 'selected' : ''}>Láthatóság szerint (Zenittől lefelé)</option>
                    <option value="distance" ${sortBy === 'distance' ? 'selected' : ''}>Távolság szerint (Növekvő)</option>
                </select>
            </div>
        `;

        const triggerSearch = () => {
            currentPage = 1;
            fetchAndRender();
        };

        filtersDiv.querySelector('#cat-filter').onchange = (e) => { selectedCatalog = e.target.value; triggerSearch(); };
        filtersDiv.querySelector('#cat-search').oninput = (e) => { searchTerm = e.target.value; triggerSearch(); };
        filtersDiv.querySelector('#const-filter').onchange = (e) => { selectedConst = e.target.value; triggerSearch(); };
        filtersDiv.querySelector('#type-filter').onchange = (e) => { selectedType = e.target.value; triggerSearch(); };
        filtersDiv.querySelector('#sort-filter').onchange = (e) => { sortBy = e.target.value; triggerSearch(); };

        container.appendChild(filtersDiv);

        // List Container
        const listDiv = document.createElement('div');
        listDiv.className = "space-y-2";
        container.appendChild(listDiv);

        async function fetchAndRender() {
            if (isLoading) return;
            
            // If no filter selected, don't load anything
            if (!selectedCatalog && searchTerm.length < 2 && selectedConst === 'ALL') {
                listDiv.innerHTML = `<div class="text-center opacity-50 text-xs py-8">Válassz egy katalógust vagy keress rá egy objektumra a kezdéshez.</div>`;
                return;
            }

            isLoading = true;
            listDiv.innerHTML = `<div class="text-center opacity-50 text-xs py-8 animate-pulse">Adatok lekérése...</div>`;

            try {
                // Fetch from server
                let results = [];
                if (searchTerm.length >= 2) {
                    results = await catalogService.search(searchTerm);
                } else if (selectedConst !== 'ALL') {
                    results = await catalogService.searchByConstellation(selectedConst);
                } else if (selectedCatalog) {
                    results = await catalogService.getByCatalog(selectedCatalog);
                }

                // Client-side type filtering
                if (selectedType !== 'ALL') {
                    const typeLabel = objectTypes[selectedType].toLowerCase();
                    results = results.filter(item => {
                        const itemType = (item.type || '').toLowerCase();
                        const itemSubtype = (item.subtype || '').toLowerCase();
                        const searchType = selectedType.toLowerCase();
                        
                        return itemType.includes(typeLabel) || 
                               itemSubtype === searchType || 
                               itemSubtype.includes(typeLabel);
                    });
                }
                
                // Pre-calculate AltAz for sorting and displaying
                const loc = storage.get('location', { latitude: 47.4979, longitude: 19.0402 });
                const now = TimeService.now();
                
                results = results.map(item => {
                    const pos = calculateAltAz(item.ra, item.dec, loc.latitude, loc.longitude, now);
                    return { ...item, pos };
                });

                if (sortBy === 'altitude') {
                    results.sort((a, b) => {
                        const altA = a.pos ? a.pos.alt : -90;
                        const altB = b.pos ? b.pos.alt : -90;
                        return altB - altA; // Descending (Zenith to Horizon)
                    });
                } else if (sortBy === 'distance') {
                    results.sort((a, b) => {
                        const distA = a.distance_ly || 999999999;
                        const distB = b.distance_ly || 999999999;
                        return distA - distB; // Ascending
                    });
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
                const itemEl = document.createElement('div');
                itemEl.className = `astro-card transition-all cursor-pointer hover:bg-white/5`;
                
                const commonName = item.common_name || item.name || item.id;
                const otherIds = item.other_ids ? ` • ${item.other_ids}` : '';
                
                const typeIcon = TypeIcons[item.type] || TypeIcons['STAR'];
                const typeName = objectTypes[item.type] || item.type;
                
                let visibilityHtml = '';
                if (item.pos) {
                    if (item.pos.alt > 0) {
                        visibilityHtml = `<span class="${isNightMode ? 'text-red-500 glow-text' : 'text-green-500'} font-bold ml-2">Látható (${item.pos.alt.toFixed(1)}°)</span>`;
                    } else {
                        visibilityHtml = `<span class="text-red-500 opacity-70 ml-2">Horizont alatt</span>`;
                    }
                }

                itemEl.innerHTML = `
                    <div class="flex justify-between items-center p-2">
                        <div class="flex items-center gap-3">
                            <div class="font-mono font-bold text-lg ${textColor}">${item.id}</div>
                            <div>
                                <div class="font-bold text-sm uppercase tracking-wider ${isNightMode ? 'glow-text' : ''}">${commonName}${otherIds}</div>
                                <div class="flex items-center gap-1 mt-1 text-sm opacity-90">
                                    ${typeIcon} <span class="font-bold">${typeName}</span> <span class="opacity-70 mx-1">•</span> ${constellations[item.constellation] || item.constellation}
                                </div>
                            </div>
                        </div>
                        <div class="${isNightMode ? 'text-red-800' : 'text-slate-400'}">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                        </div>
                    </div>
                `;

                itemEl.onclick = () => {
                    const detailsHtml = `
                        <div class="space-y-3 text-sm">
                            <div class="flex justify-between border-b border-white/10 pb-1"><span class="opacity-70 uppercase text-[10px] font-bold">Katalógus:</span> <span class="font-mono">${item.catalog}</span></div>
                            <div class="flex justify-between border-b border-white/10 pb-1"><span class="opacity-70 uppercase text-[10px] font-bold">Típus:</span> <span>${typeName}</span></div>
                            <div class="flex justify-between border-b border-white/10 pb-1"><span class="opacity-70 uppercase text-[10px] font-bold">Csillagkép:</span> <span>${constellations[item.constellation] || item.constellation}</span></div>
                            <div class="flex justify-between border-b border-white/10 pb-1"><span class="opacity-70 uppercase text-[10px] font-bold">RA:</span> <span class="font-mono">${item.ra || '-'}</span></div>
                            <div class="flex justify-between border-b border-white/10 pb-1"><span class="opacity-70 uppercase text-[10px] font-bold">Dec:</span> <span class="font-mono">${item.dec || '-'}</span></div>
                            <div class="flex justify-between border-b border-white/10 pb-1"><span class="opacity-70 uppercase text-[10px] font-bold">Fényesség:</span> <span class="font-mono">${item.magnitude ? item.magnitude + ' mag' : '-'}</span></div>
                            <div class="flex justify-between border-b border-white/10 pb-1">
                                <span class="opacity-70 uppercase text-[10px] font-bold">Méret:</span> 
                                <span class="font-mono">${item.size || '-'}</span>
                            </div>
                            <div class="flex justify-between items-center border-b border-white/10 pb-1">
                                <span class="opacity-70 uppercase text-[10px] font-bold">Távolság:</span> 
                                <div class="flex items-center gap-2">
                                    <span class="font-mono" id="modal-dist-val-${item.id}">${item.distance_ly ? item.distance_ly.toLocaleString('hu-HU') + ' fényév' : '-'}</span>
                                    ${item.distance_ly ? `
                                    <select id="modal-dist-unit-${item.id}" class="astro-input p-0 text-[10px] w-auto bg-transparent border-none" onchange="window.updateCatalogDistance('${item.id}', ${item.distance_ly}, this.value)">
                                        <option value="ly">Fényév</option>
                                        <option value="pc">Parsec</option>
                                        <option value="km">Kilométer</option>
                                    </select>
                                    ` : ''}
                                </div>
                            </div>
                            <div class="flex justify-between border-b border-white/10 pb-1">
                                <span class="opacity-70 uppercase text-[10px] font-bold">Jelenlegi Helyzet:</span> 
                                <span class="font-mono">${item.pos ? `Alt: ${item.pos.alt.toFixed(1)}° | Az: ${item.pos.az.toFixed(1)}°` : '-'}${visibilityHtml}</span>
                            </div>
                            
                            ${item.description ? `<div class="mt-4 p-3 rounded-lg bg-black/20 text-xs leading-relaxed border-l-2 ${isNightMode ? 'border-red-500' : 'border-blue-500'}">${item.description}</div>` : ''}
                            ${item.notes ? `<div class="mt-2 text-[10px] italic opacity-60">${item.notes}</div>` : ''}

                            <div class="pt-4 mt-4 border-t border-white/10">
                                <button id="btn-vis-${item.id}" class="w-full py-3 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold uppercase tracking-wider transition-colors border border-white/20">
                                    Láthatósági Grafikon Mutatása
                                </button>
                            </div>
                        </div>
                    `;
                    
                    // We need to use a custom modal or the existing showInfoModal
                    // Since showInfoModal doesn't easily let us attach event listeners to buttons inside it AFTER it's created (unless we use setTimeout or global functions),
                    // Let's use the global window.showVisibility function.
                    
                    const finalHtml = detailsHtml.replace(`id="btn-vis-${item.id}"`, `onclick="document.getElementById('info-modal').remove(); window.showVisibility('${item.ra}', '${item.dec}')"`);
                    
                    window.showInfo(item.id + (commonName !== item.id ? ` - ${commonName}` : ''), finalHtml);
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
