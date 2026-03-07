import { SunIcon } from '../icons.js';
import { formatDate, formatTime, TimeService } from '../utils.js';

export function createAnalemma(location, isNightMode) {
    const container = document.createElement('div');
    container.className = "w-full overflow-hidden flex flex-col items-center py-4 relative";

    // Analemma settings
    let useLocalTime = false;
    
    // Calculate initial offset for local solar noon in UTC (rounded to whole hour)
    const getSolarNoonOffset = () => {
        const now = TimeService.now();
        const sc = window.SunCalc;
        if (!sc) return 0;
        const times = sc.getTimes(now, location.latitude, location.longitude);
        const noon = times.solarNoon;
        // Offset from 12:00 UTC base, rounded to whole hour
        const exactOffset = (noon.getUTCHours() + noon.getUTCMinutes() / 60 + noon.getUTCSeconds() / 3600) - 12;
        return Math.round(exactOffset);
    };

    let timeOffsetHours = getSolarNoonOffset();

    const render = () => {
        container.innerHTML = '';
        
        const headerColor = isNightMode ? "text-red-500" : "text-blue-300";
        const textColor = isNightMode ? "#ff4d4d" : "#ffffff";
        const pathColor = isNightMode ? "#ff4d4d" : "#fbbf24";
        const gridColor = isNightMode ? "rgba(255, 77, 77, 0.15)" : "rgba(255, 255, 255, 0.15)";

        // Controls
        const controls = document.createElement('div');
        controls.className = "flex flex-wrap gap-4 items-center justify-center mb-6 z-10 w-full px-4";
        
        const displayHours = (12 + timeOffsetHours + 24) % 24;
        const h = Math.floor(displayHours);
        const timeStr = `${h.toString().padStart(2, '0')}:00`;

        controls.innerHTML = `
            <div class="flex items-center gap-2">
                <span class="text-[10px] font-bold uppercase ${headerColor}">Idő (UTC):</span>
                <div class="flex items-center bg-black/20 rounded-lg p-1 border border-white/5">
                    <button id="offset-down" class="p-1 hover:bg-white/10 rounded transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    <span class="font-mono text-sm font-bold w-16 text-center ${isNightMode ? 'text-red-400' : 'text-white'}">${timeStr}</span>
                    <button id="offset-up" class="p-1 hover:bg-white/10 rounded transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
                    </button>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <span class="text-[10px] font-bold uppercase ${headerColor}">Mód:</span>
                <button id="mode-toggle" class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border border-white/10 ${useLocalTime ? (isNightMode ? 'bg-red-900/40 text-red-500' : 'bg-blue-600 text-white') : 'bg-black/20 text-white/50'}">
                    ${useLocalTime ? 'Helyi Idő' : 'UTC'}
                </button>
            </div>
        `;
        
        controls.querySelector('#offset-down').onclick = () => { timeOffsetHours -= 1; render(); };
        controls.querySelector('#offset-up').onclick = () => { timeOffsetHours += 1; render(); };
        controls.querySelector('#mode-toggle').onclick = () => { useLocalTime = !useLocalTime; render(); };
        
        container.appendChild(controls);

        const svgNS = "http://www.w3.org/2000/svg";
        const viewBox = { w: 500, h: 400 };
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("viewBox", `0 0 ${viewBox.w} ${viewBox.h}`);
        svg.setAttribute("class", "w-full max-w-2xl h-auto overflow-visible");

        const year = new Date().getFullYear();
        const points = [];
        const monthMarkers = [];
        
        // Significant points (approximate dates)
        const events = [
            { name: "Tavaszi Napéjegyenlőség", month: 2, day: 20 },
            { name: "Nyári Napforduló", month: 5, day: 21 },
            { name: "Őszi Napéjegyenlőség", month: 8, day: 22 },
            { name: "Téli Napforduló", month: 11, day: 21 }
        ];

        // Generate points for each day
        for (let d = 0; d < 365; d++) {
            const date = new Date(Date.UTC(year, 0, d + 1, 12, 0, 0));
            // Apply offset
            const calcDate = new Date(date.getTime() + timeOffsetHours * 3600000);
            
            // If local time mode, we need to adjust for TZ and DST
            let finalDate = calcDate;
            if (useLocalTime) {
                // This is a bit tricky, but we want to see how the analemma shifts with local time
                // We'll just use the local time equivalent of that UTC moment
                const offset = new Date().getTimezoneOffset() * 60000;
                finalDate = new Date(calcDate.getTime() - offset);
            }

            const sunCalc = window.SunCalc;
            if (!sunCalc) return;
            const pos = sunCalc.getPosition(finalDate, location.latitude, location.longitude);
            
            let az = pos.azimuth * 180 / Math.PI;
            let alt = pos.altitude * 180 / Math.PI;

            const p = { az, alt, date: finalDate, originalDate: date };
            points.push(p);

            if (date.getUTCDate() === 1) {
                monthMarkers.push(p);
            }
        }

        // Bounds
        let minAz = Math.min(...points.map(p => p.az));
        let maxAz = Math.max(...points.map(p => p.az));
        let minAlt = Math.min(...points.map(p => p.alt));
        let maxAlt = Math.max(...points.map(p => p.alt));

        const padAz = (maxAz - minAz) * 0.2 || 15;
        const padAlt = (maxAlt - minAlt) * 0.15 || 15;
        minAz -= padAz; maxAz += padAz;
        minAlt -= padAlt; maxAlt += padAlt;

        const mapX = (az) => ((az - minAz) / (maxAz - minAz)) * viewBox.w;
        const mapY = (alt) => viewBox.h - (((alt - minAlt) / (maxAlt - minAlt)) * viewBox.h);

        // Draw Curved Grid Lines
        // Altitude arcs
        for (let a = Math.floor(minAlt / 10) * 10; a <= maxAlt; a += 10) {
            if (a < -10) continue;
            const path = document.createElementNS(svgNS, "path");
            let d = "";
            for (let az = minAz; az <= maxAz; az += 2) {
                const x = mapX(az);
                const y = mapY(a);
                d += (az === minAz ? "M" : "L") + ` ${x} ${y}`;
            }
            path.setAttribute("d", d);
            path.setAttribute("fill", "none");
            path.setAttribute("stroke", gridColor);
            path.setAttribute("stroke-width", "0.5");
            path.setAttribute("stroke-dasharray", "2,4");
            svg.appendChild(path);
            
            const text = document.createElementNS(svgNS, "text");
            text.setAttribute("x", 5);
            text.setAttribute("y", mapY(a) - 2);
            text.setAttribute("fill", textColor);
            text.setAttribute("font-size", "8");
            text.setAttribute("opacity", "0.3");
            text.textContent = `${a}°`;
            svg.appendChild(text);
        }

        // Azimuth arcs (vertical-ish)
        for (let az = Math.floor(minAz / 10) * 10; az <= maxAz; az += 10) {
            const path = document.createElementNS(svgNS, "path");
            let d = "";
            for (let a = minAlt; a <= maxAlt; a += 2) {
                const x = mapX(az);
                const y = mapY(a);
                d += (a === minAlt ? "M" : "L") + ` ${x} ${y}`;
            }
            path.setAttribute("d", d);
            path.setAttribute("fill", "none");
            path.setAttribute("stroke", gridColor);
            path.setAttribute("stroke-width", "0.5");
            path.setAttribute("stroke-dasharray", "2,4");
            svg.appendChild(path);
        }

        // Draw Analemma Path
        const path = document.createElementNS(svgNS, "path");
        let dStr = "";
        points.forEach((p, i) => {
            const x = mapX(p.az);
            const y = mapY(p.alt);
            if (i === 0) dStr += `M ${x} ${y} `;
            else dStr += `L ${x} ${y} `;
        });
        dStr += "Z";
        path.setAttribute("d", dStr);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", pathColor);
        path.setAttribute("stroke-width", "1.5");
        path.setAttribute("opacity", "0.8");
        svg.appendChild(path);

        // Month Markers (Small lines)
        monthMarkers.forEach(m => {
            const x = mapX(m.az);
            const y = mapY(m.alt);
            
            const line = document.createElementNS(svgNS, "line");
            line.setAttribute("x1", x - 4);
            line.setAttribute("y1", y);
            line.setAttribute("x2", x + 4);
            line.setAttribute("y2", y);
            line.setAttribute("stroke", textColor);
            line.setAttribute("stroke-width", "1");
            svg.appendChild(line);

            const text = document.createElementNS(svgNS, "text");
            text.setAttribute("x", x);
            text.setAttribute("y", y - 6);
            text.setAttribute("fill", textColor);
            text.setAttribute("font-size", "10");
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("font-weight", "bold");
            text.textContent = m.originalDate.toLocaleString('hu-HU', { month: 'short' });
            svg.appendChild(text);
        });

        // Significant Points (Faint suns)
        const now = TimeService.now();
        let nextEvent = null;
        let minDays = Infinity;

        events.forEach(ev => {
            const evDate = new Date(Date.UTC(year, ev.month, ev.day, 12, 0, 0));
            const calcDate = new Date(evDate.getTime() + timeOffsetHours * 3600000);
            
            let finalDate = calcDate;
            if (useLocalTime) {
                const offset = new Date().getTimezoneOffset() * 60000;
                finalDate = new Date(calcDate.getTime() - offset);
            }

            const pos = window.SunCalc.getPosition(finalDate, location.latitude, location.longitude);
            const x = mapX(pos.azimuth * 180 / Math.PI);
            const y = mapY(pos.altitude * 180 / Math.PI);

            const sun = document.createElementNS(svgNS, "circle");
            sun.setAttribute("cx", x);
            sun.setAttribute("cy", y);
            sun.setAttribute("r", "4");
            sun.setAttribute("fill", pathColor);
            sun.setAttribute("opacity", "0.2");
            svg.appendChild(sun);

            // Calculate days to next
            let daysTo = (evDate.getTime() - now.getTime()) / 86400000;
            if (daysTo < 0) {
                const nextYearDate = new Date(Date.UTC(year + 1, ev.month, ev.day, 12, 0, 0));
                daysTo = (nextYearDate.getTime() - now.getTime()) / 86400000;
            }

            if (daysTo < minDays) {
                minDays = daysTo;
                nextEvent = { ...ev, days: Math.ceil(daysTo), date: evDate };
            }
        });

        // Current Day Marker (Glowing Sun)
        const todayIdx = Math.floor((now.getTime() - new Date(Date.UTC(year, 0, 1)).getTime()) / 86400000);
        const todayPoint = points[todayIdx % 365];
        if (todayPoint) {
            const tx = mapX(todayPoint.az);
            const ty = mapY(todayPoint.alt);

            // Glow
            const glow = document.createElementNS(svgNS, "circle");
            glow.setAttribute("cx", tx);
            glow.setAttribute("cy", ty);
            glow.setAttribute("r", "8");
            glow.setAttribute("fill", pathColor);
            glow.setAttribute("opacity", "0.4");
            const animate = document.createElementNS(svgNS, "animate");
            animate.setAttribute("attributeName", "r");
            animate.setAttribute("values", "6;10;6");
            animate.setAttribute("dur", "2s");
            animate.setAttribute("repeatCount", "indefinite");
            glow.appendChild(animate);
            svg.appendChild(glow);

            const sun = document.createElementNS(svgNS, "circle");
            sun.setAttribute("cx", tx);
            sun.setAttribute("cy", ty);
            sun.setAttribute("r", "4");
            sun.setAttribute("fill", pathColor);
            svg.appendChild(sun);
        }

        container.appendChild(svg);

        // Info footer
        if (nextEvent) {
            const footer = document.createElement('div');
            footer.className = `mt-4 text-[10px] uppercase tracking-widest font-bold ${headerColor} text-center`;
            footer.innerHTML = `Következő: ${nextEvent.name} • ${nextEvent.days} nap múlva`;
            container.appendChild(footer);
        }
    };

    render();
    return container;
}
