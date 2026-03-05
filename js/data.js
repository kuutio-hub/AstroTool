
// Messier Catalog (Sample of common objects, full list would be too long for this snippet but structure allows expansion)
export const messierCatalog = [
    { id: 'M1', ngc: 'NGC 1952', const: 'Tau', type: 'SNR', mag: 8.4, size: '6x4', name: 'Rák-köd', desc: 'Szupernóva-maradvány' },
    { id: 'M13', ngc: 'NGC 6205', const: 'Her', type: 'GC', mag: 5.8, size: '20', name: 'Herkules-halmaz', desc: 'Nagy gömbhalmaz' },
    { id: 'M31', ngc: 'NGC 224', const: 'And', type: 'GAL', mag: 3.4, size: '178x63', name: 'Androméda-galaxis', desc: 'Legközelebbi spirálgalaxis' },
    { id: 'M42', ngc: 'NGC 1976', const: 'Ori', type: 'NB', mag: 4.0, size: '85x60', name: 'Orion-köd', desc: 'Fényes emissziós köd' },
    { id: 'M45', ngc: '-', const: 'Tau', type: 'OC', mag: 1.6, size: '110', name: 'Fiastyúk', desc: 'Nyílthalmaz (Pleiades)' },
    { id: 'M51', ngc: 'NGC 5194', const: 'CVn', type: 'GAL', mag: 8.4, size: '11x7', name: 'Örvény-köd', desc: 'Spirálgalaxis kísérővel' },
    { id: 'M57', ngc: 'NGC 6720', const: 'Lyr', type: 'PN', mag: 8.8, size: '1.4x1', name: 'Gyűrűs-köd', desc: 'Planetáris köd' },
    { id: 'M81', ngc: 'NGC 3031', const: 'UMa', type: 'GAL', mag: 6.9, size: '21x10', name: 'Bode-galaxis', desc: 'Spirálgalaxis' },
    { id: 'M82', ngc: 'NGC 3034', const: 'UMa', type: 'GAL', mag: 8.4, size: '9x4', name: 'Szivar-galaxis', desc: 'Starburst galaxis' },
    { id: 'M104', ngc: 'NGC 4594', const: 'Vir', type: 'GAL', mag: 8.0, size: '9x4', name: 'Sombrero-galaxis', desc: 'Spirálgalaxis' }
];

// Constellations map for filtering
export const constellations = {
    'And': 'Andromeda', 'Ant': 'Antlia', 'Aps': 'Apus', 'Aql': 'Aquila', 'Aqr': 'Aquarius', 'Ara': 'Ara',
    'Ari': 'Aries', 'Aur': 'Auriga', 'Boo': 'Boötes', 'Cae': 'Caelum', 'Cam': 'Camelopardalis', 'Cnc': 'Cancer',
    'CVn': 'Canes Venatici', 'CMa': 'Canis Major', 'CMi': 'Canis Minor', 'Cap': 'Capricornus', 'Car': 'Carina',
    'Cas': 'Cassiopeia', 'Cen': 'Centaurus', 'Cep': 'Cepheus', 'Cet': 'Cetus', 'Cha': 'Chamaeleon', 'Cir': 'Circinus',
    'Col': 'Columba', 'Com': 'Coma Berenices', 'CrA': 'Corona Australis', 'CrB': 'Corona Borealis', 'Crv': 'Corvus',
    'Crt': 'Crater', 'Cru': 'Crux', 'Cyg': 'Cygnus', 'Del': 'Delphinus', 'Dor': 'Dorado', 'Dra': 'Draco',
    'Equ': 'Equuleus', 'Eri': 'Eridanus', 'For': 'Fornax', 'Gem': 'Gemini', 'Gru': 'Grus', 'Her': 'Hercules',
    'Hor': 'Horologium', 'Hya': 'Hydra', 'Hyi': 'Hydrus', 'Ind': 'Indus', 'Lac': 'Lacerta', 'Leo': 'Leo',
    'LMi': 'Leo Minor', 'Lep': 'Lepus', 'Lib': 'Libra', 'Lup': 'Lupus', 'Lyn': 'Lynx', 'Lyr': 'Lyra',
    'Men': 'Mensa', 'Mic': 'Microscopium', 'Mon': 'Monoceros', 'Mus': 'Musca', 'Nor': 'Norma', 'Oct': 'Octans',
    'Oph': 'Ophiuchus', 'Ori': 'Orion', 'Pav': 'Pavo', 'Peg': 'Pegasus', 'Per': 'Perseus', 'Phe': 'Phoenix',
    'Pic': 'Pictor', 'Psc': 'Pisces', 'PsA': 'Piscis Austrinus', 'Pup': 'Puppis', 'Pyx': 'Pyxis', 'Ret': 'Reticulum',
    'Sge': 'Sagitta', 'Sgr': 'Sagittarius', 'Sco': 'Scorpius', 'Scl': 'Sculptor', 'Sct': 'Scutum', 'Ser': 'Serpens',
    'Sex': 'Sextans', 'Tau': 'Taurus', 'Tel': 'Telescopium', 'Tri': 'Triangulum', 'TrA': 'Triangulum Australe',
    'Tuc': 'Tucana', 'UMa': 'Ursa Major', 'UMi': 'Ursa Minor', 'Vel': 'Vela', 'Vir': 'Virgo', 'Vol': 'Volans', 'Vul': 'Vulpecula'
};

// Object Types
export const objectTypes = {
    'GAL': 'Galaxis',
    'PN': 'Planetáris köd',
    'NB': 'Köd',
    'OC': 'Nyílthalmaz',
    'GC': 'Gömbhalmaz',
    'SNR': 'Szupernóva-maradvány',
    'DS': 'Kettőscsillag'
};
