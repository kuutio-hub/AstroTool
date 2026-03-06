export function createAnalemma(location, isNightMode) {
    const container = document.createElement('div');
    container.className = "w-full overflow-hidden flex flex-col items-center py-4 relative";

    // Analemma settings
    let timeOffsetHours = 0;

    const render = () => {
        container.innerHTML = '';
        
        // Controls
        const controls = document.createElement('div');
        controls.className = "flex gap-2 items-center mb-4 z-10";
        controls.innerHTML = `
            <span class="text-xs font-bold uppercase ${isNightMode ? 'text-red-500' : 'text-white'}">Időeltolás (UTC):</span>
            <button id="offset-minus" class="px-2 py-1 bg-black/20 rounded hover:bg-black/40">-30m</button>
            <span class="font-mono text-sm font-bold w-16 text-center">${timeOffsetHours > 0 ? '+' : ''}${timeOffsetHours.toFixed(1)}h</span>
            <button id="offset-plus" class="px-2 py-1 bg-black/20 rounded hover:bg-black/40">+30m</button>
        `;
        
        controls.querySelector('#offset-minus').onclick = () => { timeOffsetHours -= 0.5; render(); };
        controls.querySelector('#offset-plus').onclick = () => { timeOffsetHours += 0.5; render(); };
        
        container.appendChild(controls);

        const svgNS = "http://www.w3.org/2000/svg";
        const viewBox = { w: 400, h: 400 };
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("viewBox", `0 0 ${viewBox.w} ${viewBox.h}`);
        svg.setAttribute("class", "w-full max-w-md h-auto");

        const year = new Date().getFullYear();
        const points = [];
        const months = [];

        // Generate points for each day at 12:00 UTC + offset
        for (let d = 0; d < 365; d++) {
            // 12:00 UTC is base. We add offset in hours.
            const date = new Date(Date.UTC(year, 0, d, 12 + Math.floor(timeOffsetHours), (timeOffsetHours % 1) * 60, 0));
            const pos = SunCalc.getPosition(date, location.latitude, location.longitude);
            
            // Convert azimuth to degrees (-180 to 180 from South)
            let az = pos.azimuth * 180 / Math.PI;
            // Convert altitude to degrees
            let alt = pos.altitude * 180 / Math.PI;

            points.push({ az, alt, date });

            // Save first day of month for labels
            if (date.getDate() === 1) {
                months.push({ az, alt, label: date.toLocaleString('hu-HU', { month: 'short' }) });
            }
        }

        // Find bounds
        let minAz = Math.min(...points.map(p => p.az));
        let maxAz = Math.max(...points.map(p => p.az));
        let minAlt = Math.min(...points.map(p => p.alt));
        let maxAlt = Math.max(...points.map(p => p.alt));

        // Add padding
        const padAz = (maxAz - minAz) * 0.2 || 10;
        const padAlt = (maxAlt - minAlt) * 0.1 || 10;
        
        minAz -= padAz; maxAz += padAz;
        minAlt -= padAlt; maxAlt += padAlt;

        // Map function
        const mapX = (az) => ((az - minAz) / (maxAz - minAz)) * viewBox.w;
        const mapY = (alt) => viewBox.h - (((alt - minAlt) / (maxAlt - minAlt)) * viewBox.h);

        // Colors
        const gridColor = isNightMode ? "rgba(255, 77, 77, 0.2)" : "rgba(255, 255, 255, 0.2)";
        const textColor = isNightMode ? "#ff4d4d" : "#ffffff";
        const pathColor = isNightMode ? "#ff4d4d" : "#fbbf24"; // Red or Amber

        // Draw Grid (Altitude lines)
        for (let a = Math.floor(minAlt / 10) * 10; a <= maxAlt; a += 10) {
            if (a < 0) continue;
            const y = mapY(a);
            const line = document.createElementNS(svgNS, "line");
            line.setAttribute("x1", 0);
            line.setAttribute("y1", y);
            line.setAttribute("x2", viewBox.w);
            line.setAttribute("y2", y);
            line.setAttribute("stroke", gridColor);
            line.setAttribute("stroke-width", "1");
            line.setAttribute("stroke-dasharray", "4,4");
            svg.appendChild(line);

            const text = document.createElementNS(svgNS, "text");
            text.setAttribute("x", 5);
            text.setAttribute("y", y - 5);
            text.setAttribute("fill", textColor);
            text.setAttribute("font-size", "12");
            text.setAttribute("opacity", "0.5");
            text.textContent = `${a}°`;
            svg.appendChild(text);
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
        dStr += "Z"; // Close loop
        path.setAttribute("d", dStr);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", pathColor);
        path.setAttribute("stroke-width", "2");
        svg.appendChild(path);

        // Draw Month Labels
        months.forEach(m => {
            const x = mapX(m.az);
            const y = mapY(m.alt);
            
            const circle = document.createElementNS(svgNS, "circle");
            circle.setAttribute("cx", x);
            circle.setAttribute("cy", y);
            circle.setAttribute("r", "3");
            circle.setAttribute("fill", textColor);
            svg.appendChild(circle);

            const text = document.createElementNS(svgNS, "text");
            text.setAttribute("x", x);
            text.setAttribute("y", y - 8);
            text.setAttribute("fill", textColor);
            text.setAttribute("font-size", "14"); // Larger font as requested
            text.setAttribute("font-weight", "bold");
            text.setAttribute("text-anchor", "middle");
            text.textContent = m.label;
            svg.appendChild(text);
        });

        // Draw Current Sun Position
        const now = new Date();
        const currentPos = SunCalc.getPosition(now, location.latitude, location.longitude);
        const currAz = currentPos.azimuth * 180 / Math.PI;
        const currAlt = currentPos.altitude * 180 / Math.PI;
        
        if (currAlt >= minAlt && currAlt <= maxAlt) {
            const cx = mapX(currAz);
            const cy = mapY(currAlt);
            
            const sunDot = document.createElementNS(svgNS, "circle");
            sunDot.setAttribute("cx", cx);
            sunDot.setAttribute("cy", cy);
            sunDot.setAttribute("r", "6");
            sunDot.setAttribute("fill", pathColor);
            sunDot.setAttribute("filter", "drop-shadow(0 0 4px currentColor)");
            svg.appendChild(sunDot);
        }

        container.appendChild(svg);
    };

    render();
    return container;
}
