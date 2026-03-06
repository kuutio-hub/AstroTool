/**
 * Moon Phase Icon Generator
 * 
 * @param {number} illumination - 0.0 to 1.0 (0% to 100% illuminated)
 * @param {boolean} isWaxing - true if waxing (light from right), false if waning (light from left)
 * @param {boolean} isNightMode - true if night mode is active
 * @returns {string} - SVG string
 */
export function renderMoonPhaseIcon(illumination, isWaxing, isNightMode = false) {
    // Clamp illumination between 0 and 1
    const ill = Math.max(0, Math.min(1, illumination));
    
    const r = 45;
    const cx = 50;
    const topY = 5;
    const botY = 95;
    
    // Calculate terminator horizontal radius
    // When ill = 0.5, rx = 0 (straight line)
    // When ill = 0 or 1, rx = r (full circle)
    const rx = +(r * Math.abs(1 - 2 * ill)).toFixed(3);
    
    let darkPath = "";
    
    // The base dark half-circle
    // For waxing, the dark half is on the left (A r r 0 0 0 cx botY)
    // For waning, the dark half is on the right (A r r 0 0 1 cx botY)
    const baseSweep = isWaxing ? 0 : 1;
    
    // The terminator ellipse
    // If ill < 0.5, the terminator curves into the light side (adding to the dark half)
    // If ill > 0.5, the terminator curves into the dark side (subtracting from the dark half)
    // The sweep flag for the terminator depends on both waxing/waning and illumination level
    let termSweep;
    if (isWaxing) {
        termSweep = ill < 0.5 ? 0 : 1;
    } else {
        termSweep = ill < 0.5 ? 1 : 0;
    }

    // Special cases for almost new or almost full moon to avoid rendering glitches
    if (ill < 0.001) {
        darkPath = `M ${cx},${topY} A ${r},${r} 0 1,0 ${cx},${botY} A ${r},${r} 0 1,0 ${cx},${topY} Z`; // Full dark circle
    } else if (ill > 0.999) {
        darkPath = ""; // No dark part
    } else {
        // SVG Arc command: A rx ry x-axis-rotation large-arc-flag sweep-flag x y
        // We use two arcs to draw the dark region.
        // Arc 1: The outer edge of the dark region (always a semicircle with radius r)
        // Arc 2: The terminator line (an ellipse with radii rx and r)
        darkPath = `M ${cx},${topY} A ${r},${r} 0 0,${baseSweep} ${cx},${botY} A ${rx},${r} 0 0,${termSweep} ${cx},${topY} Z`;
    }
    
    // Colors
    const lightColor = isNightMode ? '#ef4444' : '#e2e8f0'; // red-500 or slate-200
    const darkColor = isNightMode ? '#1a0505' : '#0f172a'; // very dark red or slate-900
    const glowColor = isNightMode ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.8)';
    
    return `
    <svg viewBox="0 0 100 100" class="w-20 h-20" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 8px ${glowColor});">
        <!-- Base Moon (Light part) -->
        <circle cx="50" cy="50" r="45" fill="${lightColor}" />
        
        <!-- Dark part (Dynamic SVG Path) -->
        <path d="${darkPath}" fill="${darkColor}" />
        
        <!-- Subtle outline for better definition -->
        <circle cx="50" cy="50" r="45" fill="none" stroke="${lightColor}" stroke-width="0.5" opacity="0.3" />
    </svg>
    `;
}
