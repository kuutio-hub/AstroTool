export const InfoIcon = (classes = "w-5 h-5") => `<svg class="${classes}" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;

export function showInfoModal(title, content, isNightMode) {
    const existing = document.getElementById('info-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'info-modal';
    modal.className = "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4";
    
    const bgClass = isNightMode ? "bg-black border border-red-600" : "bg-slate-900 border border-white/10";
    const textClass = isNightMode ? "text-red-600" : "text-white";
    const btnClass = isNightMode ? "bg-red-600/20 hover:bg-red-600/40 text-red-600 border border-red-600" : "bg-blue-600 hover:bg-blue-700 text-white";

    modal.innerHTML = `
        <div class="${bgClass} rounded-2xl p-6 max-w-md w-full shadow-2xl transform transition-all backdrop-blur-xl">
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
    return `<button type="button" class="inline-block ml-1 p-1 -m-1 opacity-60 hover:opacity-100 transition-opacity focus:outline-none" onclick="window.showInfo('${title}', '${content.replace(/'/g, "\\'")}')">${InfoIcon("w-5 h-5")}</button>`;
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
    if (num === undefined || num === null || isNaN(num)) return '-';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'k';
    return num.toFixed(2);
}

export const TimeService = {
    offset: 0,
    async sync() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            const res = await fetch('https://worldtimeapi.org/api/timezone/Etc/UTC', { signal: controller.signal });
            clearTimeout(timeoutId);
            const data = await res.json();
            if (data && data.utc_datetime) {
                const serverTime = new Date(data.utc_datetime).getTime();
                const localTime = Date.now();
                if (!isNaN(serverTime)) {
                    this.offset = serverTime - localTime;
                }
            }
        } catch (e) {
            console.warn('Time sync failed', e);
        }
    },
    now() {
        const t = Date.now() + (isNaN(this.offset) ? 0 : this.offset);
        return new Date(t);
    }
};

export function calculateAltAz(raStr, decStr, lat, lon, date) {
    function parseRA(str) {
        if (!str) return null;
        const match = str.match(/(\d+)h\s*(\d+\.?\d*)m/);
        if (!match) return null;
        const h = parseFloat(match[1]);
        const m = parseFloat(match[2]);
        return (h + m / 60) * 15; // to degrees
    }

    function parseDec(str) {
        if (!str) return null;
        const match = str.match(/([+-]?\d+)°\s*(\d+\.?\d*)'/);
        if (!match) return null;
        const dStr = match[1];
        const d = parseFloat(dStr);
        const m = parseFloat(match[2]);
        const sign = dStr.startsWith('-') ? -1 : 1;
        return sign * (Math.abs(d) + m / 60);
    }

    const raVal = parseRA(raStr);
    const decVal = parseDec(decStr);
    
    if (raVal === null || decVal === null) return null;

    const d2r = Math.PI / 180;
    const r2d = 180 / Math.PI;

    // Calculate LST (approximate)
    const d = (date - new Date(Date.UTC(2000, 0, 1, 12, 0, 0))) / (1000 * 60 * 60 * 24);
    const ut = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
    let lst = (100.46061837 + 0.9856473662862 * d + lon + 15 * ut) % 360;
    if (lst < 0) lst += 360;

    const ha = (lst - raVal + 360) % 360;

    const sinAlt = Math.sin(decVal * d2r) * Math.sin(lat * d2r) + 
                   Math.cos(decVal * d2r) * Math.cos(lat * d2r) * Math.cos(ha * d2r);
    const alt = Math.asin(sinAlt) * r2d;

    const cosAz = (Math.sin(decVal * d2r) - Math.sin(alt * d2r) * Math.sin(lat * d2r)) / 
                  (Math.cos(alt * d2r) * Math.cos(lat * d2r));
    let az = Math.acos(Math.max(-1, Math.min(1, cosAz))) * r2d;
    
    if (Math.sin(ha * d2r) > 0) az = 360 - az;

    return { alt, az };
}
