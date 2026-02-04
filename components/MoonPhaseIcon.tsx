
import React from 'react';

interface MoonPhaseIconProps {
  phase: number; // 0 (new) to 1 (new)
  isNightMode: boolean;
}

export const MoonPhaseIcon: React.FC<MoonPhaseIconProps> = ({ phase, isNightMode }) => {
  const size = 64;
  const r = size / 2 - 2;
  const cx = size / 2;
  const cy = size / 2;

  const fgColor = isNightMode ? '#fca5a5' : '#e5e7eb'; // red-300 or gray-200
  const bgColor = isNightMode ? 'rgba(127, 29, 29, 0.5)' : '#374151'; // red-900/50 or gray-700

  // The terminator is an ellipse. Its horizontal radius is `r * cos(angle)`.
  const angle = phase * 2 * Math.PI; // angle in radians from new moon
  const terminatorX = cx - r * Math.cos(angle);
  
  let litPath;
  const terminatorRx = Math.abs(r * Math.cos(angle));

  if (phase <= 0.5) { // Waxing
    const sweep = 1;
    litPath = `M${terminatorX},${cy-r*Math.sin(angle)} 
               A${terminatorRx},${r} 0 1,${sweep} ${terminatorX},${cy+r*Math.sin(angle)} 
               A${r},${r} 0 1,${sweep} ${terminatorX},${cy-r*Math.sin(angle)} Z`;
  } else { // Waning
    const sweep = 0;
    litPath = `M${terminatorX},${cy-r*Math.sin(angle)} 
               A${terminatorRx},${r} 0 1,${sweep} ${terminatorX},${cy+r*Math.sin(angle)} 
               A${r},${r} 0 1,${sweep} ${terminatorX},${cy-r*Math.sin(angle)} Z`;
  }

  // Determine which half is fully lit as a base
  let baseLitPath;
  if (phase < 0.25 || phase > 0.75) { // Crescent phases - right or left limb is lit
      if(phase < 0.25) { // Waxing crescent
          baseLitPath = `M${cx}, ${cy-r} A${r},${r} 0 0,1 ${cx},${cy+r} L${cx},${cy-r} Z`;
      } else { // Waning crescent
          baseLitPath = `M${cx}, ${cy-r} A${r},${r} 0 0,0 ${cx},${cy+r} L${cx},${cy-r} Z`;
      }
  } else { // Gibbous phases - a full half + terminator part
      if(phase <= 0.5) { // Waxing gibbous
          baseLitPath = `M${cx}, ${cy-r} A${r},${r} 0 0,0 ${cx},${cy+r} L${cx},${cy-r} Z`;
      } else { // Waning gibbous
          baseLitPath = `M${cx}, ${cy-r} A${r},${r} 0 0,1 ${cx},${cy+r} L${cx},${cy-r} Z`;
      }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Base dark circle */}
      <circle cx={cx} cy={cy} r={r} fill={bgColor} />
      
      {/* Full moon background for gibbous phases */}
      {phase > 0.25 && phase < 0.75 && <path d={baseLitPath} fill={fgColor}/>}
      
      {/* The dynamic terminator part */}
      <path d={litPath} fill={fgColor} />

      {/* Edge case for nearly new/full moons */}
      {phase > 0.99 && <circle cx={cx} cy={cy} r={r} fill={bgColor} />}
      {Math.abs(phase - 0.5) < 0.01 && <circle cx={cx} cy={cy} r={r} fill={fgColor} />}
    </svg>
  );
};
