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
    
    // Terminator shift from center: d = (2 * ill - 1) * r
    // If ill = 0, d = -r
    // If ill = 0.5, d = 0
    // If ill = 1, d = r
    const d = (2 * ill - 1) * r;
    
    // The terminator is an ellipse with radii rx = Math.abs(d) and ry = r
    const rx = Math.abs(d).toFixed(3);
    
    let lightPath = "";
    
    if (isWaxing) {
        // Waxing: Light from RIGHT
        // Base right half circle: M 50,5 A 45,45 0 0,1 50,95
        // Terminator goes from bottom to top.
        // If ill > 0.5, light extends into the left half -> sweep left (1)
        // If ill < 0.5, light is only a crescent on the right -> sweep right (0)
        const sweep = ill > 0.5 ? 1 : 0;
        lightPath = `M ${cx},${topY} A ${r},${r} 0 0,1 ${cx},${botY} A ${rx},${r} 0 0,${sweep} ${cx},${topY} Z`;
    } else {
        // Waning: Light from LEFT
        // Base left half circle: M 50,5 A 45,45 0 0,0 50,95
        // Terminator goes from bottom to top.
        // If ill > 0.5, light extends into the right half -> sweep right (0)
        // If ill < 0.5, light is only a crescent on the left -> sweep left (1)
        const sweep = ill > 0.5 ? 0 : 1;
        lightPath = `M ${cx},${topY} A ${r},${r} 0 0,0 ${cx},${botY} A ${rx},${r} 0 0,${sweep} ${cx},${topY} Z`;
    }

    // Special cases for almost new or almost full moon to avoid rendering glitches
    if (ill < 0.001) {
        lightPath = ""; // No light part
    } else if (ill > 0.999) {
        lightPath = `M ${cx},${topY} A ${r},${r} 0 1,1 ${cx},${botY} A ${r},${r} 0 1,1 ${cx},${topY} Z`; // Full light circle
    }
    
    // Colors
    const lightColor = isNightMode ? '#ff4d4d' : '#ffffff';
    const darkColor = isNightMode ? '#1a0000' : '#0f172a';
    const glowColor = isNightMode ? 'rgba(255, 77, 77, 0.4)' : 'rgba(255, 255, 255, 0.4)';
    
    return `
    <svg viewBox="0 0 100 100" class="w-full h-full" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 8px ${glowColor});">
        <!-- Base Moon (Dark part) -->
        <circle cx="50" cy="50" r="45" fill="${darkColor}" />
        
        <!-- Light part (Dynamic SVG Path) -->
        <path d="${lightPath}" fill="${lightColor}" />
        
        <!-- Subtle outline for better definition -->
        <circle cx="50" cy="50" r="45" fill="none" stroke="${lightColor}" stroke-width="0.5" opacity="0.3" />
    </svg>
    `;
}
