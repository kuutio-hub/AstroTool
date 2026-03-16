import { renderVisualCalculators } from './visual.js';
import { renderTelescopeCalculators } from './telescope.js';
import { renderPhotoCalculators } from './photo.js';
import { renderAdvancedCalculators } from './advanced.js';
import { storage } from '../utils.js';

export function createCalculator(isNightMode) {
    const container = document.createElement('div');
    container.className = 'animate-fade-in pb-20'; // Add padding for bottom scrolling

    // Category Filter
    const categories = [
        { id: 'visual', label: 'Vizuális' },
        { id: 'telescope', label: 'Távcső' },
        { id: 'photo', label: 'Fotó' },
        { id: 'advanced', label: 'Haladó' }
    ];

    let activeCategory = storage.get('activeCategory', 'visual');

    const filterBar = document.createElement('div');
    filterBar.className = 'flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-2';
    
    const contentArea = document.createElement('div');
    contentArea.id = 'calculator-content';

    const renderCategory = () => {
        contentArea.innerHTML = '';
        const globalParams = {
            A: storage.get('A', 200),
            F: storage.get('F', 1000),
            B: storage.get('B', 1)
        };
        const userLocation = storage.get('location', { latitude: 47.4979, longitude: 19.0402 });

        if (activeCategory === 'visual') {
            contentArea.appendChild(renderVisualCalculators(globalParams, isNightMode));
        } else if (activeCategory === 'telescope') {
            contentArea.appendChild(renderTelescopeCalculators(globalParams, isNightMode));
        } else if (activeCategory === 'photo') {
            contentArea.appendChild(renderPhotoCalculators(globalParams, isNightMode));
        } else if (activeCategory === 'advanced') {
            contentArea.appendChild(renderAdvancedCalculators(globalParams, userLocation, isNightMode));
        }

        // Replace icon placeholders
        import('../icons.js').then(icons => {
            contentArea.querySelectorAll('.icon-placeholder').forEach(el => {
                const iconName = el.getAttribute('data-icon');
                if (icons[iconName]) {
                    el.innerHTML = icons[iconName]("w-5 h-5");
                }
            });
        });
    };

    categories.forEach(cat => {
        const btn = document.createElement('button');
        const isActive = activeCategory === cat.id;
        const activeClass = isNightMode ? 'bg-red-900 text-red-500 border border-red-500/50' : 'bg-blue-600 text-white shadow-md';
        const inactiveClass = isNightMode ? 'bg-red-950/30 text-red-900/60 hover:bg-red-900/20' : 'bg-slate-200 text-slate-600 hover:bg-slate-300';
        
        btn.className = `px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${isActive ? activeClass : inactiveClass}`;
        btn.textContent = cat.label;
        btn.onclick = () => {
            activeCategory = cat.id;
            storage.set('activeCategory', activeCategory);
            // Re-render filter bar buttons
            Array.from(filterBar.children).forEach(child => {
                const isChildActive = child.textContent === cat.label;
                child.className = `px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${isChildActive ? activeClass : inactiveClass}`;
            });
            renderCategory();
        };
        filterBar.appendChild(btn);
    });

    container.appendChild(filterBar);
    container.appendChild(contentArea);

    // Listen for global settings changes
    if (window._astroSettingsListener) {
        window.removeEventListener('astro-settings-changed', window._astroSettingsListener);
    }
    window._astroSettingsListener = () => {
        renderCategory();
    };
    window.addEventListener('astro-settings-changed', window._astroSettingsListener);

    renderCategory();

    return container;
}