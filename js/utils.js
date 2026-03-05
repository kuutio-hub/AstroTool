
// Utility functions

export const formatTime = (date) => {
    if (!date || isNaN(date.getTime())) return '--:--';
    return date.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
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

// Math Helpers
export const toRad = (deg) => deg * (Math.PI / 180);
export const toDeg = (rad) => rad * (180 / Math.PI);
