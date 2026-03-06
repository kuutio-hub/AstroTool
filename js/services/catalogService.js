export const catalogService = {
    _cache: {},

    async loadCatalog(name) {
        const lowerName = name.toLowerCase();
        if (this._cache[lowerName]) {
            return this._cache[lowerName];
        }

        try {
            const response = await fetch(`data/catalogs/${lowerName}.json`);
            if (!response.ok) throw new Error(`Failed to load ${name}`);
            const data = await response.json();
            this._cache[lowerName] = data;
            return data;
        } catch (error) {
            console.error(`Error loading catalog ${name}:`, error);
            return [];
        }
    },

    async searchByConstellation(constellationCode) {
        const code = this._normalizeConstellation(constellationCode);
        if (!code) return [];

        const catalogs = ['messier', 'ngc', 'ic', 'melotte', 'caldwell', 'wds', 'hr'];
        let results = [];

        for (const cat of catalogs) {
            const data = await this.loadCatalog(cat);
            const matches = data.filter(obj => obj.constellation.toLowerCase() === code.toLowerCase());
            results = results.concat(matches);
        }

        return results;
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
            "coma berenices": "Com", "com": "Com"
            // Add more as needed
        };
        return map[input.toLowerCase()] || input;
    }
};
