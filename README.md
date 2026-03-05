# AstroTool (Vanilla JS)

Ez a projekt egy csillagászati segédeszköz, amely tisztán HTML, CSS (Tailwind) és JavaScript alapokon működik, build lépés nélkül.

## Futtatás

Egyszerűen nyisd meg az `index.html` fájlt egy böngészőben.

Mivel a JavaScript modulokat (`type="module"`) használ, előfordulhat, hogy a böngésző biztonsági okokból nem engedi a helyi fájlok betöltését (`file://` protokoll). Ebben az esetben egy egyszerű helyi szerverre van szükség.

### Helyi szerver indítása (opcionális)

Ha van telepítve Node.js:
```bash
npx serve .
```

Vagy Python-nal:
```bash
python3 -m http.server
```

## Funkciók

- **Műszerfal:** Nap és Hold kelte/nyugta, fázisok, naptevékenység.
- **Analemma:** A Nap pozíciójának éves változása az égen (interaktív diagram).
- **Kalkulátor:** Távcső vizuális teljesítményének számítása és mértékegység átváltó.

## Technológia

- **Nyelv:** Vanilla JavaScript (ES6 Modules)
- **Stílus:** Tailwind CSS (CDN)
- **Könyvtárak:** SunCalc (CDN)
- **Ikonok:** Egyedi SVG (Lucide stílus)

## GitHub Pages

A projekt közvetlenül feltölthető GitHub Pages-re, mivel nem igényel fordítást.
