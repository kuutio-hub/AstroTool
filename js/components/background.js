import { TimeService, storage } from '../utils.js';

export function createBackground() {
    const container = document.createElement('div');
    container.id = 'dynamic-bg';
    container.className = 'fixed inset-0 z-[-1] pointer-events-none transition-colors duration-[5000ms]';
    
    // Sky Gradient Layer
    const skyLayer = document.createElement('div');
    skyLayer.className = 'absolute inset-0 transition-all duration-[5000ms]';
    container.appendChild(skyLayer);

    // Stars Layer (Canvas)
    const canvas = document.createElement('canvas');
    canvas.className = 'absolute inset-0 opacity-0 transition-opacity duration-[2000ms]';
    container.appendChild(canvas);

    // City Glow Layer
    const cityGlow = document.createElement('div');
    cityGlow.className = 'absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-orange-500/20 to-transparent opacity-0 transition-opacity duration-[2000ms]';
    container.appendChild(cityGlow);

    // Sun Glow (simulated sun outside frame)
    const sunGlow = document.createElement('div');
    sunGlow.className = 'absolute w-[100vw] h-[100vh] rounded-full blur-[100px] opacity-0 transition-all duration-[5000ms]';
    container.appendChild(sunGlow);

    let stars = [];
    let width, height;

    function initStars() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        stars = [];
        const count = Math.floor((width * height) / 2000); // Density
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 1.5 + 0.5,
                opacity: Math.random(),
                twinkleSpeed: Math.random() * 0.05 + 0.01
            });
        }
    }

    function drawStars() {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);
        
        // Rotation simulation (very slow)
        const time = Date.now() * 0.00005;
        
        ctx.fillStyle = '#FFFFFF';
        stars.forEach(star => {
            // Twinkle
            const twinkle = Math.sin(Date.now() * star.twinkleSpeed) * 0.3 + 0.7;
            
            // Rotate around center (approx North Celestial Pole)
            // Simplified: just rotate around center of screen for effect
            const cx = width / 2;
            const cy = height / 2;
            const x = star.x - cx;
            const y = star.y - cy;
            const rotX = x * Math.cos(time) - y * Math.sin(time);
            const rotY = x * Math.sin(time) + y * Math.cos(time);
            
            ctx.globalAlpha = star.opacity * twinkle;
            ctx.beginPath();
            ctx.arc(cx + rotX, cy + rotY, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        requestAnimationFrame(drawStars);
    }

    window.addEventListener('resize', initStars);
    initStars();
    drawStars();

    function updateSky() {
        const isNightMode = document.body.classList.contains('night-mode');
        
        if (isNightMode) {
            skyLayer.style.background = '#000000';
            canvas.style.opacity = 1;
            cityGlow.style.opacity = 0.3;
            sunGlow.style.opacity = 0;
            return;
        }

        const now = TimeService.now();
        const loc = storage.get('location', { latitude: 47.4979, longitude: 19.0402 });
        
        // Get Sun Altitude
        const sunPos = window.SunCalc ? window.SunCalc.getPosition(now, loc.latitude, loc.longitude) : { altitude: 0, azimuth: 0 };
        const altDeg = sunPos.altitude * (180 / Math.PI);
        const azDeg = (sunPos.azimuth * (180 / Math.PI)) + 180; // SunCalc Azimuth: South=0, West=90, East=-90. +180 makes North=0, East=90, South=180, West=270

        let skyGradient;
        let starOpacity;
        let cityOpacity;
        let sunGlowOpacity;
        let sunGlowColor = 'white';

        // Day: Alt > 6
        if (altDeg > 6) {
            // Blue Sky
            skyGradient = 'linear-gradient(to bottom, #4ca1af, #c4e0e5)'; // Nice blue
            starOpacity = 0;
            cityOpacity = 0;
            sunGlowOpacity = 0.6;
            sunGlowColor = 'rgba(255, 255, 255, 0.4)';
        } 
        // Golden Hour / Sunrise / Sunset: Alt 6 to -6
        else if (altDeg <= 6 && altDeg > -6) {
            // Orange/Pink/Red mix
            skyGradient = 'linear-gradient(to bottom, #2c3e50, #fd746c, #ff9068)';
            starOpacity = Math.max(0, (6 - altDeg) / 12); // Fade in stars as it gets darker
            cityOpacity = 0.2;
            sunGlowOpacity = 0.4;
            sunGlowColor = 'rgba(255, 100, 50, 0.3)';
        }
        // Twilight / Nautical: Alt -6 to -12
        else if (altDeg <= -6 && altDeg > -12) {
            // Deep Blue / Purple
            skyGradient = 'linear-gradient(to bottom, #0f2027, #203a43, #2c5364)';
            starOpacity = 0.5 + ((-6 - altDeg) / 12);
            cityOpacity = 0.4;
            sunGlowOpacity = 0.1;
        }
        // Night: Alt < -12
        else {
            // Black / Deep Space
            skyGradient = 'linear-gradient(to bottom, #000000, #0a0a0a)';
            starOpacity = 1;
            cityOpacity = 0.5; // More visible contrast at night
            sunGlowOpacity = 0;
        }

        // Apply
        skyLayer.style.background = skyGradient;
        canvas.style.opacity = starOpacity;
        cityGlow.style.opacity = cityOpacity;
        
        // Sun Glow Position Calculation
        // We want the glow to follow the sun.
        // Azimuth: 0 (North) -> 90 (East) -> 180 (South) -> 270 (West) -> 360 (North)
        // Screen X: 0% (Left/East) -> 50% (South) -> 100% (Right/West)
        // Let's map Azimuth 90 (East) to 0% and 270 (West) to 100%.
        // South (180) is 50%.
        // Formula: (Azimuth - 90) / 180 * 100
        
        let sunX = ((azDeg - 90) / 180) * 100;
        
        // Clamp X to keep it somewhat on screen or just off screen
        // If it's night (North side), it might be way off.
        
        // Altitude: -90 (Nadir) -> 0 (Horizon) -> 90 (Zenith)
        // Screen Y: 100% (Bottom) -> 0% (Top)
        // Map Alt -10 to 100% (just below horizon), Alt 90 to 0% (top)
        
        let sunY = 100 - ((altDeg + 10) / 100) * 100;
        
        sunGlow.style.background = `radial-gradient(circle, ${sunGlowColor} 0%, transparent 70%)`;
        sunGlow.style.left = `${sunX - 50}%`; // Center the glow div
        sunGlow.style.top = `${sunY - 50}%`;
        sunGlow.style.opacity = sunGlowOpacity;

        // Easter Eggs
        checkEasterEggs(now, container);
    }

    function checkEasterEggs(date, container) {
        const month = date.getMonth() + 1; // 1-12
        const day = date.getDate();
        
        // Check if we already have the correct egg
        const existing = container.querySelector('.easter-egg');
        let shouldHaveEgg = false;
        let eggContent = '';
        let eggClass = '';
        let eggStyle = '';

        // Christmas (Dec 24-26) - Santa
        if (month === 12 && (day >= 24 && day <= 26)) {
            shouldHaveEgg = true;
            eggClass = 'easter-egg absolute text-4xl animate-fly-across pointer-events-none';
            eggStyle = 'top: 20%;';
            eggContent = '🎅🛷🦌';
        }
        // New Year (Dec 31 - Jan 1) - Fireworks
        else if ((month === 12 && day === 31) || (month === 1 && day === 1)) {
            shouldHaveEgg = true;
            eggClass = 'easter-egg absolute inset-0 pointer-events-none';
            eggContent = '<div class="absolute bottom-0 left-1/4 text-4xl animate-bounce">🎆</div><div class="absolute bottom-10 left-3/4 text-4xl animate-bounce" style="animation-delay:0.5s">🎇</div>';
        }
        // Easter (Approximate - hardcoded for 2026)
        else if (month === 4 && day === 5) { // 2026 Easter
             shouldHaveEgg = true;
             eggClass = 'easter-egg absolute bottom-0 w-full text-center text-4xl pointer-events-none';
             eggContent = '🐇 🥚 🐇';
        }
        // Aug 20 - Fireworks (Hungary)
        else if (month === 8 && day === 20) {
            shouldHaveEgg = true;
            eggClass = 'easter-egg absolute inset-0 pointer-events-none';
            eggContent = '<div class="absolute top-1/4 left-1/4 text-4xl animate-pulse">🎆</div><div class="absolute top-1/3 right-1/4 text-4xl animate-pulse" style="animation-delay:0.5s">🇭🇺</div>';
        }

        if (shouldHaveEgg) {
            if (!existing || existing.innerHTML !== eggContent) {
                if (existing) existing.remove();
                const egg = document.createElement('div');
                egg.className = eggClass;
                if (eggStyle) egg.style.cssText = eggStyle;
                egg.innerHTML = eggContent;
                container.appendChild(egg);
            }
        } else if (existing) {
            existing.remove();
        }
    }

    // Update every 5 seconds for smoother movement
    updateSky();
    setInterval(updateSky, 5000);

    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fly-across {
            0% { left: -10%; transform: scaleX(1); }
            100% { left: 110%; transform: scaleX(1); }
        }
        .animate-fly-across {
            animation: fly-across 20s linear infinite;
        }
    `;
    document.head.appendChild(style);

    return container;
}
