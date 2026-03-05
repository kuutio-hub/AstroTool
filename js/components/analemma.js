
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
    function renderSVG() {
        const lineColor = isNightMode ? '#991b1b' : '#fbbf24';
        const dotColor = isNightMode ? '#ef4444' : '#f59e0b';
        const textColor = isNightMode ? '#ef4444' : '#94a3b8';
        const horizonColor = isNightMode ? '#450a0a' : '#334155';

        svg.setAttribute("viewBox", `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
        
        let html = `
          <line x1="-1000" y1="90" x2="1000" y2="90" stroke="${horizonColor}" stroke-width="${viewBox.w / 400}" />
          
          <text x="100" y="96" font-size="${viewBox.w / 60}" text-anchor="middle" fill="${textColor}" opacity="0.5">DÉL</text>
          <text x="50" y="96" font-size="${viewBox.w / 60}" text-anchor="middle" fill="${textColor}" opacity="0.5">KELET</text>
          <text x="150" y="96" font-size="${viewBox.w / 60}" text-anchor="middle" fill="${textColor}" opacity="0.5">NYUGAT</text>

          <path
            d="M ${points.path.map(p => `${p.x},${p.y}`).join(' L ')} Z"
            fill="none"
            stroke="${lineColor}"
            stroke-width="${viewBox.w / 600}"
            stroke-dasharray="${viewBox.w/200},${viewBox.w/200}"
            opacity="0.5"
          />
        `;

        // Month Separator Dots
        points.monthLabels.forEach((m, i) => {
             html += `<circle cx="${m.x}" cy="${m.y}" r="${viewBox.w / 400}" fill="${textColor}" opacity="0.5" />`;
        });

        // Month Labels
        if (viewBox.w < 100) {
            points.monthLabels.forEach((m, i) => {
                html += `
                <text x="${m.x}" y="${m.y}" dy="${-viewBox.w / 100}" font-size="${viewBox.w / 40}" text-anchor="middle" fill="${textColor}" opacity="0.7" class="font-mono">
                    ${m.name}
                </text>`;
            });
        }

        // Key Points
        points.keyPoints.forEach((p, i) => {
            const r = p.isCurrent ? viewBox.w / 150 : viewBox.w / 300;
            const fill = p.isCurrent ? (isNightMode ? '#ff0000' : '#ffffff') : dotColor;
            const stroke = p.isCurrent ? dotColor : 'none';
            const strokeWidth = viewBox.w / 1000;
            
            html += `
            <g>
              <circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />
              <text x="${p.x}" y="${p.y - viewBox.w / 80}" font-size="${viewBox.w / 50}" text-anchor="middle" fill="${textColor}" class="font-bold uppercase tracking-tighter">
                ${p.name}
              </text>
            </g>`;
        });

        svg.innerHTML = html;
    }

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
