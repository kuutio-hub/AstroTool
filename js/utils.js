
// Utility functions

export const formatTime = (date, withSeconds = false) => {
    if (!date || isNaN(date.getTime())) return '--:--';
    return date.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit', second: withSeconds ? '2-digit' : undefined });
};

export const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
};

// Local Storage Helper
export const storage = {
    get: (key, defaultValue) => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(error);
            return defaultValue;
        }
    },
    set: (key, value) => {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(error);
        }
    }
};

// Geolocation Helper
export const getGeolocation = (callback) => {
    if (!navigator.geolocation) {
        callback(null, new Error("Geolocation not supported"));
        return;
    }
    navigator.geolocation.getCurrentPosition(
        (position) => {
            callback({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            }, null);
        },
        (error) => {
            callback(null, error);
        }
    );
};

// Time Service
export const TimeService = {
    offset: 0,
    synced: false,

    async sync() {
        try {
            const start = Date.now();
            const response = await fetch('https://worldtimeapi.org/api/ip');
            const data = await response.json();
            const end = Date.now();
            const networkDelay = (end - start) / 2;
            
            // data.unixtime is seconds, we need ms
            const serverTime = data.unixtime * 1000 + networkDelay;
            this.offset = serverTime - Date.now();
            this.synced = true;
            console.log("Time synced. Offset:", this.offset, "ms");
        } catch (e) {
            console.warn("Time sync failed, using system time.", e);
            this.synced = false;
            this.offset = 0;
        }
    },

    now() {
        return new Date(Date.now() + this.offset);
    }
};

// Math Helpers
export const toRad = (deg) => deg * (Math.PI / 180);
export const toDeg = (rad) => rad * (180 / Math.PI);
