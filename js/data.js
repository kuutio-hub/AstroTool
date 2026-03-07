
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
    'And': 'Androméda (Andromeda, And)', 'Ant': 'Légszivattyú (Antlia, Ant)', 'Aps': 'Paradicsommadár (Apus, Aps)', 'Aql': 'Sas (Aquila, Aql)', 'Aqr': 'Vízöntő (Aquarius, Aqr)', 'Ara': 'Oltár (Ara, Ara)',
    'Ari': 'Kos (Aries, Ari)', 'Aur': 'Szekeres (Auriga, Aur)', 'Boo': 'Ökörhajcsár (Boötes, Boo)', 'Cae': 'Véső (Caelum, Cae)', 'Cam': 'Zsiráf (Camelopardalis, Cam)', 'Cnc': 'Rák (Cancer, Cnc)',
    'CVn': 'Vadászebek (Canes Venatici, CVn)', 'CMa': 'Nagy Kutya (Canis Major, CMa)', 'CMi': 'Kis Kutya (Canis Minor, CMi)', 'Cap': 'Bak (Capricornus, Cap)', 'Car': 'Hajógerinc (Carina, Car)',
    'Cas': 'Kassziopeia (Cassiopeia, Cas)', 'Cen': 'Kentaur (Centaurus, Cen)', 'Cep': 'Cefeusz (Cepheus, Cep)', 'Cet': 'Cethal (Cetus, Cet)', 'Cha': 'Kaméleon (Chamaeleon, Cha)', 'Cir': 'Körző (Circinus, Cir)',
    'Col': 'Galamb (Columba, Col)', 'Com': 'Bereniké Haja (Coma Berenices, Com)', 'CrA': 'Déli Korona (Corona Australis, CrA)', 'CrB': 'Északi Korona (Corona Borealis, CrB)', 'Crv': 'Holló (Corvus, Crv)',
    'Crt': 'Serleg (Crater, Crt)', 'Cru': 'Dél Keresztje (Crux, Cru)', 'Cyg': 'Hattyú (Cygnus, Cyg)', 'Del': 'Delfin (Delphinus, Del)', 'Dor': 'Aranyhal (Dorado, Dor)', 'Dra': 'Sárkány (Draco, Dra)',
    'Equ': 'Csikó (Equuleus, Equ)', 'Eri': 'Eridánusz (Eridanus, Eri)', 'For': 'Kemence (Fornax, For)', 'Gem': 'Ikrek (Gemini, Gem)', 'Gru': 'Daru (Grus, Gru)', 'Her': 'Herkules (Hercules, Her)',
    'Hor': 'Ingaóra (Horologium, Hor)', 'Hya': 'Északi Vízikígyó (Hydra, Hya)', 'Hyi': 'Déli Vízikígyó (Hydrus, Hyi)', 'Ind': 'Indián (Indus, Ind)', 'Lac': 'Gyík (Lacerta, Lac)', 'Leo': 'Oroszlán (Leo, Leo)',
    'LMi': 'Kis Oroszlán (Leo Minor, LMi)', 'Lep': 'Nyúl (Lepus, Lep)', 'Lib': 'Mérleg (Libra, Lib)', 'Lup': 'Farkas (Lupus, Lup)', 'Lyn': 'Hiúz (Lynx, Lyn)', 'Lyr': 'Lant (Lyra, Lyr)',
    'Men': 'Táblahegy (Mensa, Men)', 'Mic': 'Mikroszkóp (Microscopium, Mic)', 'Mon': 'Egyszarvú (Monoceros, Mon)', 'Mus': 'Légy (Musca, Mus)', 'Nor': 'Szögmérő (Norma, Nor)', 'Oct': 'Oktáns (Octans, Oct)',
    'Oph': 'Kígyótartó (Ophiuchus, Oph)', 'Ori': 'Orion (Orion, Ori)', 'Pav': 'Páva (Pavo, Pav)', 'Peg': 'Pegazus (Pegasus, Peg)', 'Per': 'Perzeusz (Perseus, Per)', 'Phe': 'Főnix (Phoenix, Phe)',
    'Pic': 'Festő (Pictor, Pic)', 'Psc': 'Halak (Pisces, Psc)', 'PsA': 'Déli Hal (Piscis Austrinus, PsA)', 'Pup': 'Hajófara (Puppis, Pup)', 'Pyx': 'Tájoló (Pyxis, Pyx)', 'Ret': 'Háló (Reticulum, Ret)',
    'Sge': 'Nyíl (Sagitta, Sge)', 'Sgr': 'Nyilas (Sagittarius, Sgr)', 'Sco': 'Skorpió (Scorpius, Sco)', 'Scl': 'Szobrász (Sculptor, Scl)', 'Sct': 'Pajzs (Scutum, Sct)', 'Ser': 'Kígyó (Serpens, Ser)',
    'Sex': 'Szextáns (Sextans, Sex)', 'Tau': 'Bika (Taurus, Tau)', 'Tel': 'Távcső (Telescopium, Tel)', 'Tri': 'Háromszög (Triangulum, Tri)', 'TrA': 'Déli Háromszög (Triangulum Australe, TrA)',
    'Tuc': 'Tukán (Tucana, Tuc)', 'UMa': 'Nagy Medve (Ursa Major, UMa)', 'UMi': 'Kis Medve (Ursa Minor, UMi)', 'Vel': 'Vitorla (Vela, Vel)', 'Vir': 'Szűz (Virgo, Vir)', 'Vol': 'Repülőhal (Volans, Vol)', 'Vul': 'Kis Róka (Vulpecula, Vul)'
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
