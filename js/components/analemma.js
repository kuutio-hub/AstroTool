
export function createAnalemma(location, isNightMode) {
    const container = document.createElement('div');
    container.className = "space-y-4 mt-2";

    // State
    let isUtc = true;
    let hour = 12;
    let viewBox = { x: 0, y: 0, w: 200, h: 100 };
    let isDragging = false;
    let startPan = { x: 0, y: 0 };
    let points = { path: [], keyPoints: [], monthLabels: [] };

    // DOM Elements
    const controlsDiv = document.createElement('div');
    controlsDiv.className = "flex flex-wrap items-center gap-6";
    
    const svgContainer = document.createElement('div');
    svgContainer.className = "relative w-full aspect-[3/4] sm:aspect-[4/3] max-h-[60vh] overflow-hidden border border-current/5 rounded cursor-move bg-black/20";
    
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "w-full h-full overflow-hidden");
    // Prevent default touch actions to allow custom drag/zoom
    svg.style.touchAction = "none"; 

    svgContainer.appendChild(svg);
    container.appendChild(controlsDiv);
    container.appendChild(svgContainer);

    // Calculate Points
    function calculatePoints() {
        const data = [];
        const now = new Date();
        const year = now.getFullYear();
        
        for (let d = 1; d <= 365; d += 2) {
            let date;
            if (isUtc) {
                date = new Date(Date.UTC(year, 0, d, hour, 0, 0));
            } else {
                date = new Date(year, 0, d, hour, 0, 0);
            }
            // SunCalc is global
            const pos = window.SunCalc.getPosition(date, location.latitude, location.longitude);
            data.push({ 
                x: (pos.azimuth / Math.PI) * 100 + 100, 
                y: 100 - (pos.altitude / (Math.PI / 2)) * 100,
                altitude: pos.altitude,
                date: date,
                month: date.getMonth()
            });
        }

        const keyDates = [
            { name: 'Tavaszi napéj.', date: isUtc ? new Date(Date.UTC(year, 2, 20, hour)) : new Date(year, 2, 20, hour) },
            { name: 'Nyári napford.', date: isUtc ? new Date(Date.UTC(year, 5, 21, hour)) : new Date(year, 5, 21, hour) },
            { name: 'Őszi napéj.', date: isUtc ? new Date(Date.UTC(year, 8, 22, hour)) : new Date(year, 8, 22, hour) },
            { name: 'Téli napford.', date: isUtc ? new Date(Date.UTC(year, 11, 21, hour)) : new Date(year, 11, 21, hour) },
            { 
                name: 'Ma', 
                date: isUtc ? new Date(Date.UTC(year, now.getUTCMonth(), now.getUTCDate(), hour)) : new Date(year, now.getMonth(), now.getDate(), hour), 
                isCurrent: true 
            }
        ];

        const keyPoints = keyDates.map(kd => {
            const pos = window.SunCalc.getPosition(kd.date, location.latitude, location.longitude);
            return {
                x: (pos.azimuth / Math.PI) * 100 + 100,
                y: 100 - (pos.altitude / (Math.PI / 2)) * 100,
                altitude: pos.altitude,
                name: kd.name,
                isCurrent: kd.isCurrent
            };
        });

        const monthLabels = [];
        for(let m=0; m<12; m++) {
            const d = isUtc ? new Date(Date.UTC(year, m, 15, hour)) : new Date(year, m, 15, hour);
            const pos = window.SunCalc.getPosition(d, location.latitude, location.longitude);
            monthLabels.push({
                x: (pos.azimuth / Math.PI) * 100 + 100,
                y: 100 - (pos.altitude / (Math.PI / 2)) * 100,
                name: d.toLocaleDateString('hu-HU', { month: 'short' }).replace('.', '')
            });
        }

        points = { path: data, keyPoints, monthLabels };
    }

    // Auto Scale
    function autoScale() {
        if (points.path.length > 0) {
            const xs = points.path.map(p => p.x);
            const ys = points.path.map(p => p.y);
            const minX = Math.min(...xs);
            const maxX = Math.max(...xs);
            const minY = Math.min(...ys);
            const maxY = Math.max(...ys);
            
            const padding = 5;
            const w = maxX - minX + padding * 2;
            const h = maxY - minY + padding * 2;
            
            viewBox = {
                x: minX - padding,
                y: minY - padding,
                w: Math.max(w, 20),
                h: Math.max(h, 10)
            };
        }
    }

    // Render Controls
    function renderControls() {
        const modeColor = isNightMode ? 'text-red-800' : 'text-blue-300/60';
        const btnBg = isNightMode ? 'bg-red-950/20' : 'bg-blue-900/30';
        const activeBtn = isNightMode ? 'bg-red-600 text-black' : 'bg-blue-500 text-white';
        const inactiveBtn = isNightMode ? 'text-red-900' : 'text-blue-300/40';
        const inputBg = isNightMode ? 'bg-black border-red-900/50 text-red-600' : 'bg-blue-950/30 border-blue-900/30 text-blue-100';
        const arrowColor = isNightMode ? 'text-red-700' : 'text-blue-400';

        controlsDiv.innerHTML = `
        <div class="flex items-center gap-3">
          <label class="text-[9px] font-bold uppercase tracking-wider ${modeColor}">Mód:</label>
          <div class="flex rounded p-0.5 ${btnBg}">
            <button id="btn-local" class="px-3 py-1 text-[9px] font-bold rounded transition-all ${!isUtc ? activeBtn : inactiveBtn}">HELYI</button>
            <button id="btn-utc" class="px-3 py-1 text-[9px] font-bold rounded transition-all ${isUtc ? activeBtn : inactiveBtn}">UTC</button>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <label class="text-[9px] font-bold uppercase tracking-wider ${modeColor}">Időpont:</label>
          <div class="flex items-center gap-1">
            <input id="input-hour" type="number" min="0" max="23" step="1" value="${hour}" class="w-12 p-1 text-center text-xs font-bold rounded border outline-none ${inputBg}" />
            <div class="flex flex-col">
              <button id="btn-up" class="p-0.5 hover:opacity-70 ${arrowColor}">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <button id="btn-down" class="p-0.5 hover:opacity-70 ${arrowColor}">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 15l7-7 7 7" /></svg>
              </button>
            </div>
            <span class="text-[10px] font-bold ml-1 ${modeColor}">:00</span>
          </div>
        </div>
        <div class="text-[9px] italic opacity-60 ${isNightMode ? 'text-red-800' : 'text-blue-300'}">
            Használd az egér görgőt a zoomoláshoz, és húzd a mozgatáshoz!
        </div>
        `;

        // Attach listeners
        controlsDiv.querySelector('#btn-local').onclick = () => { isUtc = false; update(); };
        controlsDiv.querySelector('#btn-utc').onclick = () => { isUtc = true; update(); };
        
        const inputHour = controlsDiv.querySelector('#input-hour');
        inputHour.onchange = (e) => { 
            hour = Math.max(0, Math.min(23, parseInt(e.target.value) || 0)); 
            update(); 
        };

        controlsDiv.querySelector('#btn-up').onclick = () => { hour = (hour - 1 + 24) % 24; update(); };
        controlsDiv.querySelector('#btn-down').onclick = () => { hour = (hour + 1) % 24; update(); };
    }

    // Render SVG
    function renderSVG(isFullScreen = false) {
        // Style Config
        const lineColor = '#fbbf24'; // Gold
        const dotColor = '#f59e0b'; // Darker Gold
        const textColor = '#94a3b8'; // Slate 400
        const horizonColor = '#334155'; // Slate 700
        const currentSunColor = '#fcd34d'; // Bright Yellow

        // Clear previous content
        svg.innerHTML = '';

        // ViewBox
        svg.setAttribute("viewBox", `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
        
        // Glow Filter
        let defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        defs.innerHTML = `
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
        `;
        svg.appendChild(defs);

        // Horizon Line
        const horizon = document.createElementNS("http://www.w3.org/2000/svg", "line");
        horizon.setAttribute("x1", "-1000");
        horizon.setAttribute("y1", "90");
        horizon.setAttribute("x2", "1000");
        horizon.setAttribute("y2", "90");
        horizon.setAttribute("stroke", horizonColor);
        horizon.setAttribute("stroke-width", viewBox.w / 400);
        svg.appendChild(horizon);

        // Compass Directions
        const directions = [
            { text: "DÉL", x: 100 },
            { text: "KELET", x: 50 },
            { text: "NYUGAT", x: 150 }
        ];
        directions.forEach(d => {
            const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
            t.setAttribute("x", d.x);
            t.setAttribute("y", 96);
            t.setAttribute("font-size", viewBox.w / 60);
            t.setAttribute("text-anchor", "middle");
            t.setAttribute("fill", textColor);
            t.setAttribute("opacity", "0.5");
            t.setAttribute("font-family", "monospace");
            t.textContent = d.text;
            svg.appendChild(t);
        });

        // Analemma Curve
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", `M ${points.path.map(p => `${p.x},${p.y}`).join(' L ')} Z`);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", lineColor);
        path.setAttribute("stroke-width", viewBox.w / 500);
        path.setAttribute("filter", "url(#glow)");
        path.setAttribute("opacity", "0.8");
        svg.appendChild(path);

        // Month Labels (Larger and Shortened)
        points.monthLabels.forEach((m) => {
            const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
            t.setAttribute("x", m.x);
            t.setAttribute("y", m.y);
            // Offset label slightly
            t.setAttribute("dy", -viewBox.w / 50); 
            t.setAttribute("font-size", viewBox.w / 30); // Larger font
            t.setAttribute("text-anchor", "middle");
            t.setAttribute("fill", textColor);
            t.setAttribute("opacity", "0.8");
            t.setAttribute("font-weight", "bold");
            t.setAttribute("class", "font-mono");
            t.textContent = m.name;
            svg.appendChild(t);
            
            // Dot on curve
            const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            c.setAttribute("cx", m.x);
            c.setAttribute("cy", m.y);
            c.setAttribute("r", viewBox.w / 400);
            c.setAttribute("fill", textColor);
            c.setAttribute("opacity", "0.5");
            svg.appendChild(c);
        });

        // Key Points (Solstices/Equinoxes)
        points.keyPoints.forEach((p) => {
            if (p.isCurrent) return;

            const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
            g.setAttribute("opacity", "0.6");
            
            const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            c.setAttribute("cx", p.x);
            c.setAttribute("cy", p.y);
            c.setAttribute("r", viewBox.w / 300);
            c.setAttribute("fill", dotColor);
            g.appendChild(c);

            // Only show text if zoomed in enough or fullscreen
            if (viewBox.w < 150 || isFullScreen) {
                const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
                t.setAttribute("x", p.x);
                t.setAttribute("y", p.y - viewBox.w / 60);
                t.setAttribute("font-size", viewBox.w / 50);
                t.setAttribute("text-anchor", "middle");
                t.setAttribute("fill", textColor);
                t.setAttribute("class", "font-bold uppercase tracking-tighter");
                t.textContent = p.name;
                g.appendChild(t);
            }
            svg.appendChild(g);
        });

        // Current Sun
        const current = points.keyPoints.find(p => p.isCurrent);
        if (current) {
            const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
            g.setAttribute("filter", "url(#glow)");
            
            const c1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            c1.setAttribute("cx", current.x);
            c1.setAttribute("cy", current.y);
            c1.setAttribute("r", viewBox.w / 100);
            c1.setAttribute("fill", currentSunColor);
            c1.setAttribute("stroke", "white");
            c1.setAttribute("stroke-width", viewBox.w / 600);
            g.appendChild(c1);

            const c2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            c2.setAttribute("cx", current.x);
            c2.setAttribute("cy", current.y);
            c2.setAttribute("r", viewBox.w / 50);
            c2.setAttribute("fill", currentSunColor);
            c2.setAttribute("opacity", "0.3");
            g.appendChild(c2);

            // Crosshairs
            const l1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
            l1.setAttribute("x1", current.x - viewBox.w / 30);
            l1.setAttribute("y1", current.y);
            l1.setAttribute("x2", current.x + viewBox.w / 30);
            l1.setAttribute("y2", current.y);
            l1.setAttribute("stroke", currentSunColor);
            l1.setAttribute("stroke-width", viewBox.w / 800);
            l1.setAttribute("opacity", "0.5");
            g.appendChild(l1);

            const l2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
            l2.setAttribute("x1", current.x);
            l2.setAttribute("y1", current.y - viewBox.w / 30);
            l2.setAttribute("x2", current.x);
            l2.setAttribute("y2", current.y + viewBox.w / 30);
            l2.setAttribute("stroke", currentSunColor);
            l2.setAttribute("stroke-width", viewBox.w / 800);
            l2.setAttribute("opacity", "0.5");
            g.appendChild(l2);

            svg.appendChild(g);
        }
    }

    // Fullscreen Toggle
    svgContainer.onclick = (e) => {
        // Only trigger if not dragging
        if (isDragging || Math.abs(e.clientX - startPan.x) > 5 || Math.abs(e.clientY - startPan.y) > 5) return;

        const modal = document.createElement('div');
        modal.className = "fixed inset-0 z-[200] bg-black flex items-center justify-center p-4 animate-fade-in";
        
        const closeBtn = document.createElement('button');
        closeBtn.className = "absolute top-4 right-4 text-white p-3 bg-white/10 rounded-full hover:bg-white/20 z-[210]";
        closeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;
        
        const fsContainer = document.createElement('div');
        fsContainer.className = "w-full h-full relative";
        
        // Clone SVG logic for fullscreen
        const fsSvg = svg.cloneNode(true);
        fsSvg.setAttribute("class", "w-full h-full");
        fsContainer.appendChild(fsSvg);
        
        modal.appendChild(closeBtn);
        modal.appendChild(fsContainer);
        document.body.appendChild(modal);

        // Close logic
        closeBtn.onclick = () => document.body.removeChild(modal);
    };

    // Event Handlers (Zoom/Pan)
    // ... (rest of event handlers)

    // Event Handlers
    svgContainer.onwheel = (e) => {
        e.preventDefault();
        const scaleFactor = e.deltaY > 0 ? 1.1 : 0.9;
        let newW = viewBox.w * scaleFactor;
        let newH = viewBox.h * scaleFactor;

        if (newW < 5 || newW > 400) return;

        const centerX = viewBox.x + viewBox.w / 2;
        const centerY = viewBox.y + viewBox.h / 2;

        viewBox = {
            x: centerX - newW / 2,
            y: centerY - newH / 2,
            w: newW,
            h: newH
        };
        renderSVG();
    };

    svgContainer.onmousedown = (e) => {
        isDragging = true;
        startPan = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startPan.x;
        const dy = e.clientY - startPan.y;
        
        const { width, height } = svgContainer.getBoundingClientRect();
        const scaleX = viewBox.w / width;
        const scaleY = viewBox.h / height;

        viewBox.x -= dx * scaleX;
        viewBox.y -= dy * scaleY;
        
        startPan = { x: e.clientX, y: e.clientY };
        renderSVG();
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Initial Render
    function update() {
        calculatePoints();
        renderControls();
        renderSVG();
    }

    calculatePoints();
    autoScale();
    renderControls();
    renderSVG();

    return container;
}
