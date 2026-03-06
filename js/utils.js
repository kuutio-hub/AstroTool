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
