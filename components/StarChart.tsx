
import React, { useState, useEffect, useRef } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { useSkyPosition } from '../hooks/useSkyPosition';
import { allDeepSkyObjects } from '../data/deepsky';
import { constellationLines } from '../data/constellations';
import { AstroObject, LocationData } from '../types';

interface StarChartProps {
  isNightMode: boolean;
}

const polarToCartesian = (az: number, alt: number, size: number) => {
    const r = (90 - alt) / 90 * (size / 2);
    const angle = (az) * (Math.PI / 180);
    const x = size / 2 + r * Math.sin(angle);
    const y = size / 2 - r * Math.cos(angle);
    return { x, y };
};

const ChartObject = ({ obj, location, size }: { obj: AstroObject; location: LocationData | null; size: number }) => {
    const { alt, az } = useSkyPosition(obj.ra, obj.dec, location);
    if (alt === null || az === null || alt < 0) return null;

    const { x, y } = polarToCartesian(az, alt, size);
    const magSize = Math.max(0.5, 4 - obj.magnitude);

    return (
        <g transform={`translate(${x}, ${y})`}>
            <circle r={magSize} fill="white" opacity="0.8" />
            <text x={magSize + 2} y="3" fill="gray" fontSize="8">{obj.id}</text>
        </g>
    );
};

const Constellation = ({ lines, location, size }: { lines: number[][]; location: LocationData | null; size: number }) => {
    return (
        <g>
            {lines.map((line, i) => {
                const { alt: alt1, az: az1 } = useSkyPosition(line[0], line[1], location);
                const { alt: alt2, az: az2 } = useSkyPosition(line[2], line[3], location);

                if (alt1 === null || az1 === null || alt1 < 0 || alt2 === null || az2 === null || alt2 < 0) return null;

                const p1 = polarToCartesian(az1, alt1, size);
                const p2 = polarToCartesian(az2, alt2, size);

                return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.5" />;
            })}
        </g>
    );
};

export const StarChart: React.FC<StarChartProps> = ({ isNightMode }) => {
    const { location } = useGeolocation();
    const [viewBox, setViewBox] = useState('0 0 500 500');
    const [size, setSize] = useState(500);
    const svgRef = useRef<SVGSVGElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const updateSize = () => {
            const container = document.getElementById('chart-container');
            if (container) {
                const s = Math.min(container.clientWidth, window.innerHeight * 0.7) - 20;
                setSize(s);
                setViewBox(`0 0 ${s} ${s}`);
            }
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const [vx, vy, vw, vh] = viewBox.split(' ').map(Number);
        const scale = e.deltaY > 0 ? 1.1 : 0.9;
        const newWidth = vw * scale;
        const newHeight = vh * scale;
        const newX = vx + (vw - newWidth) / 2;
        const newY = vy + (vh - newHeight) / 2;
        setViewBox(`${newX} ${newY} ${newWidth} ${newHeight}`);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartPoint({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !svgRef.current) return;
        e.preventDefault();
        const [vx, vy, vw, vh] = viewBox.split(' ').map(Number);
        const scale = vw / svgRef.current.clientWidth;
        const dx = (startPoint.x - e.clientX) * scale;
        const dy = (startPoint.y - e.clientY) * scale;
        setViewBox(`${vx + dx} ${vy + dy} ${vw} ${vh}`);
        setStartPoint({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => setIsDragging(false);

    const cardBg = isNightMode ? 'bg-black border-red-800/50' : 'bg-gray-900 border-gray-700';
    const textColor = isNightMode ? 'text-red-500' : 'text-gray-400';

    return (
        <div className="animate-fade-in flex flex-col h-full">
            <h2 className={`text-3xl font-bold mb-6 ${isNightMode ? 'text-red-400' : 'text-white'}`}>Interaktív Csillagtérkép</h2>
            <div id="chart-container" className={`w-full flex-grow p-2 rounded-lg border ${cardBg} flex justify-center items-center cursor-grab active:cursor-grabbing`}>
                <svg ref={svgRef} width="100%" height="100%" viewBox={viewBox} onWheel={handleWheel} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                    <g>
                        <circle cx={size / 2} cy={size / 2} r={size / 2} fill={isNightMode ? '#1a0000' : '#0c1421'} />
                        {[30, 60].map(alt => {
                            const r = (90 - alt) / 90 * (size / 2);
                            return <circle key={alt} cx={size/2} cy={size/2} r={r} stroke={isNightMode ? 'rgba(255,0,0,0.1)' : 'rgba(255,255,255,0.1)'} strokeWidth="0.5" fill="none" />
                        })}
                        <text x={size / 2} y={15} textAnchor="middle" fill={textColor} fontSize="10">É</text>
                        <text x={size / 2} y={size - 5} textAnchor="middle" fill={textColor} fontSize="10">D</text>
                        <text x={10} y={size / 2} dominantBaseline="middle" fill={textColor} fontSize="10">K</text>
                        <text x={size - 10} y={size / 2} textAnchor="end" dominantBaseline="middle" fill={textColor} fontSize="10">Ny</text>
                        
                        <circle cx={size/2} cy={size/2} r="1" fill="white" />
                        <text x={size/2 + 3} y={size/2 - 3} fill="white" fontSize="8">Zenit</text>

                        {location && Object.values(constellationLines).map((lines, i) => (
                           <Constellation key={i} lines={lines} location={location} size={size} />
                        ))}

                        {location && allDeepSkyObjects.map(obj => (
                            <ChartObject key={obj.id} obj={obj} location={location} size={size} />
                        ))}
                    </g>
                </svg>
            </div>
            <p className={`text-xs text-center mt-2 ${textColor}`}>
                Görgővel zoomolj, egérrel mozgasd. A térkép a zenitet ábrázolja, a kör széle a horizont.
            </p>
        </div>
    );
};
