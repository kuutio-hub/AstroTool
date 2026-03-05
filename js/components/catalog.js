
import { catalogs, constellations, objectTypes } from '../catalogs.js';
import { CatalogIcon, InfoIcon, ChevronDownIcon, ChevronUpIcon } from '../icons.js';

export function createCatalog(isNightMode) {
    const container = document.createElement('div');
    container.className = "space-y-4";

    // State
    let searchTerm = '';
    let selectedConst = 'ALL';
    let selectedType = 'ALL';
    let expandedItem = null;

    // Render Function
    function render() {
        container.innerHTML = '';
        
        const inputBg = isNightMode ? 'bg-black border-red-900/50 text-red-600' : 'bg-white border-slate-200 text-slate-700';
        const cardBg = isNightMode ? 'bg-black/40 border-red-900/30' : 'bg-white border-slate-300 shadow-sm';
        const textColor = isNightMode ? 'text-red-500' : 'text-slate-700';
        const labelColor = isNightMode ? 'text-red-800' : 'text-slate-500';

        // Filters
        const filtersDiv = document.createElement('div');
        filtersDiv.className = "space-y-2 mb-4";
        filtersDiv.innerHTML = `
            <input type="text" placeholder="Keresés (pl. M42, Orion)..." class="w-full p-2 rounded text-sm font-bold outline-none border ${inputBg}" value="${searchTerm}">
            <div class="flex gap-2">
                <select id="const-filter" class="w-1/2 p-2 rounded text-xs font-bold outline-none border ${inputBg}">
                    <option value="ALL">Minden csillagkép</option>
                    ${Object.entries(constellations).sort((a,b) => a[1].localeCompare(b[1])).map(([code, name]) => `<option value="${code}" ${selectedConst === code ? 'selected' : ''}>${name} (${code})</option>`).join('')}
                </select>
                <select id="type-filter" class="w-1/2 p-2 rounded text-xs font-bold outline-none border ${inputBg}">
                    <option value="ALL">Minden típus</option>
                    ${Object.entries(objectTypes).map(([code, name]) => `<option value="${code}" ${selectedType === code ? 'selected' : ''}>${name}</option>`).join('')}
                </select>
            </div>
        `;

        filtersDiv.querySelector('input').oninput = (e) => { searchTerm = e.target.value; renderList(); };
        filtersDiv.querySelector('#const-filter').onchange = (e) => { selectedConst = e.target.value; renderList(); };
        filtersDiv.querySelector('#type-filter').onchange = (e) => { selectedType = e.target.value; renderList(); };

        container.appendChild(filtersDiv);

        // List Container
        const listDiv = document.createElement('div');
        listDiv.className = "space-y-2";
        container.appendChild(listDiv);

        function renderList() {
            listDiv.innerHTML = '';
            
            const filtered = catalogs.filter(item => {
                const matchSearch = item.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    item.desc.toLowerCase().includes(searchTerm.toLowerCase());
                const matchConst = selectedConst === 'ALL' || item.const === selectedConst;
                const matchType = selectedType === 'ALL' || item.type === selectedType;
                return matchSearch && matchConst && matchType;
            });

            if (filtered.length === 0) {
                listDiv.innerHTML = `<div class="text-center opacity-50 text-xs py-4">Nincs találat.</div>`;
                return;
            }

            // Limit to 50 items for performance if search is empty
            const displayList = (searchTerm === '' && selectedConst === 'ALL' && selectedType === 'ALL') ? filtered.slice(0, 50) : filtered;

            displayList.forEach(item => {
                const isExpanded = expandedItem === item.id;
                const itemEl = document.createElement('div');
                itemEl.className = `p-3 rounded border transition-all ${cardBg}`;
                
                itemEl.innerHTML = `
                    <div class="flex justify-between items-center cursor-pointer">
                        <div class="flex items-center gap-3">
                            <div class="font-mono font-bold text-lg ${textColor}">${item.id}</div>
                            <div>
                                <div class="font-bold text-xs uppercase tracking-wider">${item.name}</div>
                                <div class="text-[10px] opacity-60">${objectTypes[item.type] || item.type} • ${constellations[item.const] || item.const}</div>
                            </div>
                        </div>
                        <div class="${isNightMode ? 'text-red-800' : 'text-slate-400'}">
                            ${isExpanded ? ChevronUpIcon("w-4 h-4") : ChevronDownIcon("w-4 h-4")}
                        </div>
                    </div>
                    ${isExpanded ? `
                        <div class="mt-3 pt-3 border-t border-current/10 text-xs space-y-1 animate-fade-in">
                            <div class="flex justify-between"><span class="opacity-60">NGC:</span> <span class="font-mono">${item.ngc}</span></div>
                            <div class="flex justify-between"><span class="opacity-60">Fényesség:</span> <span class="font-mono">${item.mag} mag</span></div>
                            <div class="flex justify-between"><span class="opacity-60">Méret:</span> <span class="font-mono">${item.size}'</span></div>
                            <div class="mt-2 italic opacity-80">${item.desc}</div>
                        </div>
                    ` : ''}
                `;

                itemEl.querySelector('.cursor-pointer').onclick = () => {
                    expandedItem = isExpanded ? null : item.id;
                    renderList();
                };

                listDiv.appendChild(itemEl);
            });
            
            if (displayList.length < filtered.length) {
                const moreDiv = document.createElement('div');
                moreDiv.className = "text-center text-[10px] opacity-50 pt-2";
                moreDiv.innerText = `...és még ${filtered.length - displayList.length} találat (szűkítsd a keresést)`;
                listDiv.appendChild(moreDiv);
            }
        }

        renderList();
    }

    render();
    return container;
}
