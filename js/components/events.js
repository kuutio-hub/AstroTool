import { storage, TimeService, formatDate } from '../utils.js';

export function createEvents(isNightMode) {
    const container = document.createElement('div');
    container.className = "space-y-4";

    const textColor = isNightMode ? 'text-red-500' : 'text-white';
    const cardBg = isNightMode ? 'bg-black/40 border-red-900/30' : 'bg-white/10 border-white/20';

    // Mock events data for now
    const events = [
        { date: '2026-03-20', name: 'Tavaszi napéjegyenlőség', type: 'Napforduló/Napéjegyenlőség' },
        { date: '2026-04-22', name: 'Lyridák meteorraj maximuma', type: 'Meteorraj' },
        { date: '2026-05-05', name: 'Félárnyékos holdfogyatkozás', type: 'Fogyatkozás' },
        { date: '2026-06-21', name: 'Nyári napforduló', type: 'Napforduló/Napéjegyenlőség' },
        { date: '2026-08-12', name: 'Perseidák meteorraj maximuma', type: 'Meteorraj' },
        { date: '2026-09-23', name: 'Őszi napéjegyenlőség', type: 'Napforduló/Napéjegyenlőség' },
        { date: '2026-10-21', name: 'Orionidák meteorraj maximuma', type: 'Meteorraj' },
        { date: '2026-11-17', name: 'Leonidák meteorraj maximuma', type: 'Meteorraj' },
        { date: '2026-12-14', name: 'Geminidák meteorraj maximuma', type: 'Meteorraj' },
        { date: '2026-12-21', name: 'Téli napforduló', type: 'Napforduló/Napéjegyenlőség' },
        { date: '2027-01-03', name: 'Quadrantidák meteorraj maximuma', type: 'Meteorraj' },
        { date: '2027-02-20', name: 'Teljes holdfogyatkozás', type: 'Fogyatkozás' }
    ];

    let selectedType = 'ALL';

    const renderEvents = () => {
        const now = TimeService.now();
        let upcomingEvents = events.filter(e => new Date(e.date) >= now).sort((a, b) => new Date(a.date) - new Date(b.date));
        
        if (selectedType !== 'ALL') {
            upcomingEvents = upcomingEvents.filter(e => e.type === selectedType);
        }

        container.innerHTML = `
            <div class="astro-card ${cardBg}">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-lg font-bold uppercase tracking-wider ${textColor}">Közelgő Csillagászati Események</h2>
                    <select id="event-type-filter" class="astro-input text-xs w-48">
                        <option value="ALL">Minden típus</option>
                        <option value="Meteorraj" ${selectedType === 'Meteorraj' ? 'selected' : ''}>Meteorrajok</option>
                        <option value="Fogyatkozás" ${selectedType === 'Fogyatkozás' ? 'selected' : ''}>Fogyatkozások</option>
                        <option value="Napforduló/Napéjegyenlőség" ${selectedType === 'Napforduló/Napéjegyenlőség' ? 'selected' : ''}>Napfordulók / Napéjegyenlőségek</option>
                    </select>
                </div>
                <div class="space-y-3">
                    ${upcomingEvents.length > 0 ? upcomingEvents.map(event => `
                        <div class="flex justify-between items-center border-b border-white/10 pb-2">
                            <div>
                                <div class="font-bold ${textColor}">${event.name}</div>
                                <div class="text-xs opacity-70">${event.type}</div>
                            </div>
                            <div class="font-mono text-sm">${formatDate(new Date(event.date))}</div>
                        </div>
                    `).join('') : '<div class="text-center opacity-50 text-sm py-4">Nincs közelgő esemény ebben a kategóriában.</div>'}
                </div>
            </div>
        `;

        container.querySelector('#event-type-filter').addEventListener('change', (e) => {
            selectedType = e.target.value;
            renderEvents();
        });
    };

    renderEvents();

    return container;
}
