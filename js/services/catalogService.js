export const catalogService = {
    async search(query) {
        if (!query || query.length < 2) return [];
        try {
            const response = await fetch(`/api/catalog/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Search failed');
            return await response.json();
        } catch (error) {
            console.error('Error searching catalog:', error);
            return [];
        }
    },

    async searchByConstellation(constellationCode) {
        const code = this._normalizeConstellation(constellationCode);
        if (!code) return [];
        try {
            const response = await fetch(`/api/catalog/search?constellation=${encodeURIComponent(code)}`);
            if (!response.ok) throw new Error('Constellation search failed');
            return await response.json();
        } catch (error) {
            console.error('Error searching by constellation:', error);
            return [];
        }
    },

    async getByCatalog(catalogName) {
        try {
            const response = await fetch(`/api/catalog/search?catalog=${encodeURIComponent(catalogName.toLowerCase())}`);
            if (!response.ok) throw new Error('Catalog fetch failed');
            return await response.json();
        } catch (error) {
            console.error('Error fetching catalog:', error);
            return [];
        }
    },

    _normalizeConstellation(input) {
        const map = {
            "andromeda": "And", "and": "And",
            "boötes": "Boo", "bootes": "Boo", "boo": "Boo",
            "cygnus": "Cyg", "cyg": "Cyg",
            "orion": "Ori", "ori": "Ori",
            "taurus": "Tau", "tau": "Tau",
            "lyra": "Lyr", "lyr": "Lyr",
            "ursa minor": "UMi", "umi": "UMi",
            "perseus": "Per", "per": "Per",
            "coma berenices": "Com", "com": "Com",
            "ursa major": "UMa", "uma": "UMa"
            // Add more as needed
        };
        return map[input.toLowerCase()] || input;
    }
};
