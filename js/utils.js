export const InfoIcon = (classes = "w-4 h-4") => `<svg class="${classes}" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;

export function showInfoModal(title, content, isNightMode) {
    const existing = document.getElementById('info-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'info-modal';
    modal.className = "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4";
    
    const bgClass = isNightMode ? "bg-black border border-red-900" : "bg-slate-900 border border-white/10";
    const textClass = isNightMode ? "text-red-500" : "text-white";
    const btnClass = isNightMode ? "bg-red-900/50 hover:bg-red-800 text-red-500" : "bg-blue-600 hover:bg-blue-700 text-white";

    modal.innerHTML = `
        <div class="${bgClass} rounded-xl p-6 max-w-md w-full shadow-2xl transform transition-all">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-bold uppercase tracking-wider ${textClass}">${title}</h3>
                <button id="close-modal" class="opacity-50 hover:opacity-100 ${textClass}">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            <div class="text-sm opacity-80 space-y-3 ${textClass}">
                ${content}
            </div>
            <div class="mt-6 flex justify-end">
                <button id="close-modal-btn" class="px-4 py-2 rounded font-bold text-xs uppercase tracking-wider transition-all ${btnClass}">Rendben</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const close = () => modal.remove();
    modal.querySelector('#close-modal').onclick = close;
    modal.querySelector('#close-modal-btn').onclick = close;
    modal.onclick = (e) => { if (e.target === modal) close(); };
}

export function createInfoBtn(title, content) {
    return `<button type="button" class="inline-block ml-1 opacity-50 hover:opacity-100 transition-opacity focus:outline-none" onclick="window.showInfo('${title}', '${content.replace(/'/g, "\\'")}')">${InfoIcon("w-3 h-3")}</button>`;
}

export const storage = {
    get: (key, defaultValue) => {
        try {
            const val = localStorage.getItem('astro_' + key);
            return val !== null ? JSON.parse(val) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    },
    set: (key, value) => {
        try {
            localStorage.setItem('astro_' + key, JSON.stringify(value));
        } catch (e) {}
    }
};

export function formatTime(date) {
    return date.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function formatDate(date) {
    return date.toLocaleDateString('hu-HU', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatNum(num) {
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'k';
    return num.toFixed(2);
}

export const TimeService = {
    offset: 0,
    async sync() {
        try {
            const res = await fetch('https://worldtimeapi.org/api/timezone/Etc/UTC');
            const data = await res.json();
            const serverTime = new Date(data.utc_datetime).getTime();
            const localTime = Date.now();
            this.offset = serverTime - localTime;
        } catch (e) {
            console.warn('Time sync failed', e);
        }
    },
    now() {
        return new Date(Date.now() + this.offset);
    }
};
