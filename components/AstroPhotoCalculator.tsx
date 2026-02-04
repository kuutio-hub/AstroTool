
import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Telescope, Camera } from '../types';
import { presetCameras } from '../data/cameras';

interface AstroPhotoCalculatorProps {
  isNightMode: boolean;
}

const InputField = ({ label, value, onChange, unit }: { label: string; value: number; onChange: (val: number) => void; unit: string; }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <div className="flex items-center space-x-2">
      <input type="number" step="0.01" value={value} onChange={e => onChange(Number(e.target.value))} className="w-full p-2 text-center rounded-md bg-gray-700 border-gray-600 text-white" />
      <span className="w-8 text-sm">{unit}</span>
    </div>
  </div>
);

const ResultField = ({ label, value, unit, isNightMode }: { label: string; value: string; unit: string; isNightMode: boolean; }) => (
    <div className={`p-3 rounded-md mb-2 ${isNightMode ? 'bg-red-900/20' : 'bg-gray-800'}`}>
        <div className="flex justify-between items-baseline">
            <span className={`text-sm font-medium ${isNightMode ? 'text-red-400' : 'text-gray-400'}`}>{label}</span>
            <span className={`text-lg font-bold ${isNightMode ? 'text-red-300' : 'text-white'}`}>{value} {unit}</span>
        </div>
    </div>
);

const RecommendationCard = ({ title, exposure, iso, notes, isNightMode }: { title: string; exposure: string; iso: string; notes: string; isNightMode: boolean; }) => (
    <div className={`p-3 rounded-md ${isNightMode ? 'bg-red-900/20' : 'bg-gray-800'}`}>
        <h4 className={`font-bold ${isNightMode ? 'text-red-300' : 'text-white'}`}>{title}</h4>
        <div className="text-sm mt-1">
            <p><span className="font-semibold">Záridő:</span> {exposure}</p>
            <p><span className="font-semibold">ISO:</span> {iso}</p>
            <p className={`text-xs mt-1 ${isNightMode ? 'text-red-400' : 'text-gray-400'}`}>{notes}</p>
        </div>
    </div>
);


export const AstroPhotoCalculator: React.FC<AstroPhotoCalculatorProps> = ({ isNightMode }) => {
    const [telescopes] = useLocalStorage<Telescope[]>('telescopes', []);
    const [cameras] = useLocalStorage<Camera[]>('cameras', []);

    const [focalLength, setFocalLength] = useState(1000);
    const [cameraLensFocal, setCameraLensFocal] = useState(50);
    const [sensorWidth, setSensorWidth] = useState(23.5);
    const [sensorHeight, setSensorHeight] = useState(15.6);
    const [pixelSize, setPixelSize] = useState(3.92);
    const [cropFactor, setCropFactor] = useState(1.5);
    
    const calculations = useMemo(() => {
        if (focalLength <= 0 || pixelSize <= 0 || sensorWidth <= 0) return {};
        
        const fovWidth = (sensorWidth / focalLength) * (180 / Math.PI) * 60; // arcmin
        const fovHeight = (sensorHeight / focalLength) * (180 / Math.PI) * 60; // arcmin
        const imageScale = (pixelSize / focalLength) * 206.265; // arcsec/pixel
        const untrackedExposure = 500 / (cameraLensFocal * cropFactor); // 500 rule

        return { fovWidth, fovHeight, imageScale, untrackedExposure };
    }, [focalLength, sensorWidth, sensorHeight, pixelSize, cameraLensFocal, cropFactor]);

    const handleTelescopeSelect = (id: string) => {
        const scope = telescopes.find(t => t.id === id);
        if (scope) setFocalLength(scope.focalLength);
    };

    const handleCameraSelect = (id: string) => {
        const cam = cameras.find(c => c.id === id);
        if (cam) {
            setSensorWidth(cam.sensorWidth);
            setSensorHeight(cam.sensorHeight);
            setPixelSize(cam.pixelSize);
            setCropFactor(cam.cropFactor || 1.5);
        }
    };
    
    const handlePresetCameraSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const preset = presetCameras.find(c => c.name === e.target.value);
        if (preset) {
            setSensorWidth(preset.sensorWidth);
            setSensorHeight(preset.sensorHeight);
            setPixelSize(preset.pixelSize);
            setCropFactor(preset.cropFactor || 1.5);
        }
    };

    const containerBg = isNightMode ? 'bg-red-900/20 border-red-800/50' : 'bg-gray-800/50 border-gray-700';
    const selectStyle = "w-full p-2 rounded-md bg-gray-700 border-gray-600 text-white mb-4";
    const subHeading = `text-xl font-semibold mb-4 border-b pb-2 ${isNightMode ? 'border-red-800 text-red-400' : 'border-gray-600 text-white'}`;

    return (
    <div className="animate-fade-in">
      <h2 className={`text-3xl font-bold mb-6 ${isNightMode ? 'text-red-400' : 'text-white'}`}>Asztrofotós Segédlet</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={`p-6 rounded-lg border ${containerBg}`}>
          <h3 className={subHeading}>Felszerelés</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Mentett Távcsövek</label>
                    <select onChange={(e) => handleTelescopeSelect(e.target.value)} className={selectStyle}>
                      <option value="">Válassz...</option>
                      {telescopes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Mentett Kamerák</label>
                    <select onChange={(e) => handleCameraSelect(e.target.value)} className={selectStyle}>
                      <option value="">Válassz...</option>
                      {cameras.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium mb-1">Előre beállított Kamerák</label>
                <select onChange={handlePresetCameraSelect} className={selectStyle}>
                    <option>Válassz...</option>
                    {presetCameras.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
            </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <InputField label="Távcső fókusz" value={focalLength} onChange={setFocalLength} unit="mm" />
            <InputField label="Objektív fókusz" value={cameraLensFocal} onChange={setCameraLensFocal} unit="mm" />
            <InputField label="Pixelméret" value={pixelSize} onChange={setPixelSize} unit="μm" />
            <InputField label="Crop Factor" value={cropFactor} onChange={setCropFactor} unit="x" />
          </div>
        </div>
        <div className={`p-6 rounded-lg border ${containerBg}`}>
          <h3 className={subHeading}>Kép Jellemzői</h3>
           <ResultField isNightMode={isNightMode} label="Látómező" value={`${calculations.fovWidth?.toFixed(1)}' × ${calculations.fovHeight?.toFixed(1)}'`} unit="' (ívperc)" />
           <ResultField isNightMode={isNightMode} label="Látómező" value={`${(calculations.fovWidth / 60)?.toFixed(2)}° × ${(calculations.fovHeight / 60)?.toFixed(2)}°`} unit="° (fok)" />
           <ResultField isNightMode={isNightMode} label="Kép skálázás" value={calculations.imageScale?.toFixed(2) ?? 'N/A'} unit="arcsec/pixel" />
            <div className={`mt-4 text-xs p-3 rounded-md ${isNightMode ? 'bg-red-900/30' : 'bg-gray-900/50'}`}>
                <h4 className="font-bold">Ajánlás:</h4>
                <p>Az ideális kép skálázás seeing-függő. Átlagos seeing (3") mellett 1.0-2.0 arcsec/pixel a javasolt mély-ég fotózáshoz. Kiváló seeing (1") és bolygózás esetén 0.25-0.5 arcsec/pixel a cél.</p>
            </div>
        </div>
        <div className={`p-6 rounded-lg border ${containerBg} lg:col-span-2`}>
            <h3 className={subHeading}>Expozíciós Javaslatok</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RecommendationCard 
                    isNightMode={isNightMode}
                    title="Álló állvány (vezeték nélkül)"
                    exposure={`${calculations.untrackedExposure?.toFixed(1) ?? 'N/A'} s`}
                    iso="1600-6400"
                    notes="500-as szabály alapján, a csillagok bemozdulásának elkerülésére. Tejúthoz, csillagképekhez ideális."
                />
                <RecommendationCard 
                    isNightMode={isNightMode}
                    title="Piggyback (vezetett)"
                    exposure="30-180 s"
                    iso="800-3200"
                    notes="A követés miatt hosszabb expozíció lehetséges. Nagylátószögű mély-ég fotókhoz."
                />
                 <RecommendationCard 
                    isNightMode={isNightMode}
                    title="Primer fókusz (vezetett)"
                    exposure="30-300 s"
                    iso="400-1600"
                    notes="Halvány mély-ég objektumokhoz. A záridőt a fényszennyezés és a vezetés pontossága korlátozza."
                />
                 <RecommendationCard 
                    isNightMode={isNightMode}
                    title="Okulárprojekció (bolygó)"
                    exposure="< 100 ms (video)"
                    iso="Alacsony (100-400)"
                    notes="Bolygók és Hold részleteihez. Rövid, gyors videó (lucky imaging) javasolt, nem hosszú expozíció."
                />
            </div>
        </div>
      </div>
    </div>
  );
};
