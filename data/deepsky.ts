
import { AstroObject } from '../types';

export const allDeepSkyObjects: AstroObject[] = [
  // Messier Objects
  { id: 'M1', name: 'Rák-köd', type: 'Szupernóva-maradvány', constellation: 'Bika', ra: 5.575, dec: 22.01, magnitude: 8.4, distance_ly: 6500, size_arcmin: 6, description: 'Az 1054-es szupernóva maradványa.', catalog: 'Messier' },
  { id: 'M2', name: '', type: 'Gömbhalmaz', constellation: 'Vízöntő', ra: 21.558, dec: -0.82, magnitude: 6.3, distance_ly: 37500, size_arcmin: 16, description: 'Fényes, sűrű gömbhalmaz.', catalog: 'Messier' },
  { id: 'M3', name: '', type: 'Gömbhalmaz', constellation: 'Vadászebek', ra: 13.703, dec: 28.38, magnitude: 6.2, distance_ly: 33900, size_arcmin: 18, description: 'Több mint 500 000 csillagot tartalmaz.', catalog: 'Messier' },
  { id: 'M4', name: '', type: 'Gömbhalmaz', constellation: 'Skorpió', ra: 16.393, dec: -26.52, magnitude: 5.6, distance_ly: 7200, size_arcmin: 36, description: 'Az Antares csillag közelében található.', catalog: 'Messier' },
  { id: 'M5', name: '', type: 'Gömbhalmaz', constellation: 'Kígyó', ra: 15.309, dec: 2.08, magnitude: 5.6, distance_ly: 24500, size_arcmin: 23, description: 'Az egyik legnagyobb ismert gömbhalmaz.', catalog: 'Messier' },
  { id: 'M13', name: 'Herkules-halmaz', type: 'Gömbhalmaz', constellation: 'Herkules', ra: 16.695, dec: 36.46, magnitude: 5.8, distance_ly: 25100, size_arcmin: 20, description: 'Az északi égbolt legismertebb gömbhalmaza.', catalog: 'Messier' },
  { id: 'M27', name: 'Súlyzó-köd', type: 'Planetáris köd', constellation: 'Kis róka', ra: 19.993, dec: 22.72, magnitude: 7.5, distance_ly: 1360, size_arcmin: 8, description: 'Az első felfedezett planetáris köd.', catalog: 'Messier' },
  { id: 'M31', name: 'Androméda-galaxis', type: 'Spirálgalaxis', constellation: 'Androméda', ra: 0.712, dec: 41.28, magnitude: 3.4, distance_ly: 2540000, size_arcmin: 190, description: 'A hozzánk legközelebbi nagy spirálgalaxis.', catalog: 'Messier' },
  { id: 'M42', name: 'Orion-köd', type: 'Diffúz köd', constellation: 'Orion', ra: 5.588, dec: -5.40, magnitude: 4, distance_ly: 1344, size_arcmin: 65, description: 'Aktív csillagkeletkezési régió.', catalog: 'Messier' },
  { id: 'M45', name: 'Fiastyúk (Plejádok)', type: 'Nyílthalmaz', constellation: 'Bika', ra: 3.799, dec: 24.11, magnitude: 1.6, distance_ly: 444, size_arcmin: 110, description: 'Fiatal, forró csillagok halmaza.', catalog: 'Messier' },
  { id: 'M51', name: 'Örvény-köd', type: 'Spirálgalaxis', constellation: 'Vadászebek', ra: 13.497, dec: 47.19, magnitude: 8.4, distance_ly: 23000000, size_arcmin: 11.2, description: 'Kölcsönható galaxispár.', catalog: 'Messier' },
  { id: 'M57', name: 'Gyűrűs-köd', type: 'Planetáris köd', constellation: 'Lant', ra: 18.892, dec: 33.03, magnitude: 8.8, distance_ly: 2300, size_arcmin: 1.5, description: 'Haldokló csillag által ledobott gázburok.', catalog: 'Messier' },
  { id: 'M81', name: 'Bode-galaxis', type: 'Spirálgalaxis', constellation: 'Nagy Medve', ra: 9.927, dec: 69.06, magnitude: 6.9, distance_ly: 12000000, size_arcmin: 26.9, description: 'Nagy, majdnem tökéletes spirálgalaxis.', catalog: 'Messier' },
  { id: 'M82', name: 'Szivar-galaxis', type: 'Irreguláris galaxis', constellation: 'Nagy Medve', ra: 9.931, dec: 69.68, magnitude: 8.4, distance_ly: 12000000, size_arcmin: 11.2, description: 'Heves csillagkeletkezés zajlik benne.', catalog: 'Messier' },
  { id: 'M101', name: 'Szélkerék-galaxis', type: 'Spirálgalaxis', constellation: 'Nagy Medve', ra: 14.054, dec: 54.35, magnitude: 7.9, distance_ly: 21000000, size_arcmin: 28.8, description: 'Látványos, szemből látszó spirálgalaxis.', catalog: 'Messier' },
  { id: 'M104', name: 'Sombrero-galaxis', type: 'Spirálgalaxis', constellation: 'Szűz', ra: 12.665, dec: -11.62, magnitude: 8, distance_ly: 29000000, size_arcmin: 8.7, description: 'Éléről látszó galaxis sötét porsávval.', catalog: 'Messier' },
  // ... (All 110 Messier objects should be listed here)

  // Caldwell Objects
  { id: 'C1', name: 'NGC 188', type: 'Nyílthalmaz', constellation: 'Cefeusz', ra: 0.822, dec: 85.26, magnitude: 8.1, distance_ly: 5000, size_arcmin: 15, description: 'Az egyik legidősebb ismert nyílthalmaz.', catalog: 'Caldwell' },
  { id: 'C2', name: 'NGC 40 (Bow-Tie Nebula)', type: 'Planetáris köd', constellation: 'Cefeusz', ra: 0.22, dec: 72.52, magnitude: 10.7, distance_ly: 3500, size_arcmin: 1.2, description: 'Csokornyakkendőre emlékeztető planetáris köd.', catalog: 'Caldwell' },
  { id: 'C4', name: 'Írisz-köd (NGC 7023)', type: 'Reflexiós köd', constellation: 'Cefeusz', ra: 21.011, dec: 68.17, magnitude: 6.8, distance_ly: 1300, size_arcmin: 18, description: 'Fényes csillagot körülvevő porköd.', catalog: 'Caldwell' },
  { id: 'C7', name: 'NGC 2403', type: 'Spirálgalaxis', constellation: 'Zsiráf', ra: 7.615, dec: 65.60, magnitude: 8.9, distance_ly: 8000000, size_arcmin: 21.9, description: 'A Tejútrendszerünkhöz hasonló spirálgalaxis.', catalog: 'Caldwell' },
  { id: 'C14', name: 'Dupla Halmaz (NGC 869 & 884)', type: 'Nyílthalmaz', constellation: 'Perzeusz', ra: 2.367, dec: 57.14, magnitude: 4.3, distance_ly: 7500, size_arcmin: 60, description: 'Két, egymáshoz közel látszó, fényes nyílthalmaz.', catalog: 'Caldwell' },
  { id: 'C20', name: 'Észak-Amerika-köd (NGC 7000)', type: 'Emissziós köd', constellation: 'Hattyú', ra: 20.98, dec: 44.33, magnitude: 4, distance_ly: 1600, size_arcmin: 120, description: 'Hatalmas gázköd.', catalog: 'Caldwell' },
  { id: 'C33', name: 'Fátyol-köd (NGC 6960)', type: 'Szupernóva-maradvány', constellation: 'Hattyú', ra: 20.825, dec: 30.71, magnitude: 7, distance_ly: 1470, size_arcmin: 70, description: 'Egy felrobbant csillag táguló maradványa.', catalog: 'Caldwell' },
  { id: 'C41', name: 'Hyadok', type: 'Nyílthalmaz', constellation: 'Bika', ra: 4.45, dec: 15.86, magnitude: 0.5, distance_ly: 153, size_arcmin: 330, description: 'A Földhöz legközelebbi nyílthalmaz.', catalog: 'Caldwell' },
  { id: 'C49', name: 'NGC 2237 (Rozetta-köd)', type: 'Emissziós köd', constellation: 'Egyszarvú', ra: 6.538, dec: 5.05, magnitude: 9, distance_ly: 5200, size_arcmin: 80, description: 'Hatalmas, kör alakú csillagkeletkezési régió.', catalog: 'Caldwell' },
  { id: 'C63', name: 'Hélix-köd (NGC 7293)', type: 'Planetáris köd', constellation: 'Vízöntő', ra: 22.495, dec: -20.83, magnitude: 7.6, distance_ly: 650, size_arcmin: 25, description: 'A Földhöz egyik legközelebbi planetáris köd.', catalog: 'Caldwell' },
  // ... (All 109 Caldwell objects should be listed here)

  // Herschel 400 Objects
  { id: 'H-4-1', name: 'NGC 7009 (Szaturnusz-köd)', type: 'Planetáris köd', constellation: 'Vízöntő', ra: 21.07, dec: -11.36, magnitude: 8.0, distance_ly: 3000, size_arcmin: 0.5, description: 'Jellegzetes, gyűrűs bolygóra emlékeztető kinézete van.', catalog: 'Herschel 400'},
  { id: 'H-1-1', name: 'NGC 2024 (Láng-köd)', type: 'Emissziós köd', constellation: 'Orion', ra: 5.69, dec: -1.84, magnitude: 10.0, distance_ly: 1500, size_arcmin: 30, description: 'Az Orion-öv Alnitak csillaga mellett található fényes köd.', catalog: 'Herschel 400'},
  { id: 'H-3-1', name: 'NGC 2359 (Thor sisakja)', type: 'Emissziós köd', constellation: 'Nagy Kutya', ra: 7.31, dec: -13.22, magnitude: 11.45, distance_ly: 15000, size_arcmin: 10, description: 'Egy Wolf-Rayet csillag által fújt buborék.', catalog: 'Herschel 400'},
  { id: 'H-7-1', name: 'NGC 253 (Sculptor-galaxis)', type: 'Spirálgalaxis', constellation: 'Szobrász', ra: 0.79, dec: -25.29, magnitude: 8.0, distance_ly: 11400000, size_arcmin: 27.5, description: 'Az egyik legfényesebb galaxis az égbolton.', catalog: 'Herschel 400'},
  { id: 'H-18-4', name: 'NGC 891', type: 'Spirálgalaxis', constellation: 'Androméda', ra: 2.39, dec: 42.35, magnitude: 10.8, distance_ly: 30000000, size_arcmin: 13.5, description: 'Tökéletesen éléről látszó galaxis, porsávval.', catalog: 'Herschel 400'},
  // ... (A selection of the most prominent Herschel 400 objects)
];
