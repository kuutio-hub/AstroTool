
import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Telescope, Eyepiece } from '../types';
import { InfoIcon } from './Icons';

interface TelescopeCalculatorProps {
  isNightMode: boolean;
}

const InputField = ({ label, value, onChange, unit, min = 1, max = 9999, step = 1 }: { label: string; value: number; onChange: (val: number) => void; unit: string; min?: number; max?: number; step?: number; }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <div className="flex items-center space-x-2">
       <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
            const val = parseFloat(e.target.value);
            if (!isNaN(val)) onChange(val);
        }}
        className="w-full p-2 text-center rounded-md bg-gray-700 border-gray-600 text-white"
      />
      <span className="w-8 text-sm">{unit}</span>
    </div>
  </div>
);

const Recommendation = ({ text, isNightMode }: { text: string; isNightMode: boolean }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="relative inline-block ml-2">
            <button onClick={() => setShow(!show)} className={`p-1 rounded-full ${isNightMode ? 'text-red-400 hover:bg-red-900/50' : 'text-blue-400 hover:bg-gray-700'}`}>
                <InfoIcon className="w-4 h-4" />
            </button>
            {show && (
                <div className={`absolute z-10 w-64 p-3 text-xs rounded-lg shadow-lg bottom-full mb-2 -ml-32 ${isNightMode ? 'bg-red-800 text-red-200' : 'bg-gray-600 text-white'}`}>
                    {text}
                    <button onClick={() => setShow(false)} className="absolute top-1 right-1 font-bold">×</button>
                </div>
            )}
        </div>
    );
};

const ResultField = ({ label, value, unit, description, isNightMode, recommendation }: { label: string; value: string; unit?: string; description: string; isNightMode: boolean; recommendation?: string }) => (
    <div className={`p-3 rounded-md mb-2 ${isNightMode ? 'bg-red-900/20' : 'bg-gray-800'}`}>
        <div className="flex justify-between items-center">
            <div className="flex items-center">
                <span className={`text-sm font-medium ${isNightMode ? 'text-red-400' : 'text-gray-400'}`}>{label}</span>
                {recommendation && <Recommendation text={recommendation} isNightMode={isNightMode} />}
            </div>
            <span className={`text-lg font-bold ${isNightMode ? 'text-red-300' : 'text-white'}`}>{value} {unit}</span>
        </div>
        <p className={`text-xs mt-1 ${isNightMode ? 'text-red-500' : 'text-gray-500'}`}>{description}</p>
    </div>
);

export const TelescopeCalculator: React.FC<TelescopeCalculatorProps> = ({ isNightMode }) => {
  const [telescopes] = useLocalStorage<Telescope[]>('telescopes', []);
  const [eyepieces] = useLocalStorage<Eyepiece[]>('eyepieces', []);
  
  const [aperture, setAperture] = useState(150);
  const [focalLength, setFocalLength] = useState(750);
  const [eyepieceFocalLength, setEyepieceFocalLength] = useState(10);
  const [eyepieceAFOV, setEyepieceAFOV] = useState(52);

  const calculations = useMemo(() => {
    if (aperture <= 0 || focalLength <= 0 || eyepieceFocalLength <= 0) return {};
    const focalRatio = focalLength / aperture;
    const magnification = focalLength / eyepieceFocalLength;
    const exitPupil = aperture / magnification;
    const trueFOV = eyepieceAFOV / magnification;
    const maxMagnification = aperture * 2;
    const minMagnification = aperture / 7;
    const dawesLimit = 116 / aperture;
    const limitingMagnitude = 7.7 + 5 * Math.log10(aperture / 10);
    
    // Recommendations
    const recEyepieceForMaxMag = focalLength / maxMagnification;
    const recEyepieceForMinMag = focalLength / minMagnification;
    const recEyepieceForDeepSky = focalLength / (aperture / 6); // ~6mm exit pupil
    const recEyepieceForPlanets = focalLength / (aperture / 2); // ~2mm exit pupil

    return {
      focalRatio, magnification, exitPupil, trueFOV, maxMagnification, minMagnification, dawesLimit, limitingMagnitude,
      recEyepieceForMaxMag, recEyepieceForMinMag, recEyepieceForDeepSky, recEyepieceForPlanets
    };
  }, [aperture, focalLength, eyepieceFocalLength, eyepieceAFOV]);
  
  const handleTelescopeSelect = (id: string) => {
    const scope = telescopes.find(t => t.id === id);
    if (scope) {
      setAperture(scope.aperture);
      setFocalLength(scope.focalLength);
    }
  };

  const handleEyepieceSelect = (id: string) => {
    const ep = eyepieces.find(e => e.id === id);
    if (ep) {
      setEyepieceFocalLength(ep.focalLength);
      setEyepieceAFOV(ep.afov);
    }
  };

  const containerBg = isNightMode ? 'bg-red-900/20 border-red-800/50' : 'bg-gray-800/50 border-gray-700';
  const selectStyle = "w-full p-2 rounded-md bg-gray-700 border-gray-600 text-white mb-4";

  return (
    <div className="animate-fade-in">
        <h2 className={`text-3xl font-bold mb-6 ${isNightMode ? 'text-red-400' : 'text-white'}`}>Távcső Kalkulátor</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className={`p-6 rounded-lg border ${containerBg}`}>
                <h3 className={`text-xl font-semibold mb-4 border-b pb-2 ${isNightMode ? 'border-red-800 text-red-400' : 'border-gray-600 text-white'}`}>Felszerelés Adatok</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Mentett Távcsövek</label>
                    <select onChange={(e) => handleTelescopeSelect(e.target.value)} className={selectStyle}>
                      <option value="">Válassz...</option>
                      {telescopes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Mentett Okulárok</label>
                     <select onChange={(e) => handleEyepieceSelect(e.target.value)} className={selectStyle}>
                      <option value="">Válassz...</option>
                      {eyepieces.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <InputField label="Távcső átmérő" value={aperture} onChange={setAperture} unit="mm" />
                    <InputField label="Távcső fókusz" value={focalLength} onChange={setFocalLength} unit="mm" />
                    <InputField label="Okulár fókusz" value={eyepieceFocalLength} onChange={setEyepieceFocalLength} unit="mm" />
                    <InputField label="Okulár látómező" value={eyepieceAFOV} onChange={setEyepieceAFOV} unit="°" />
                </div>
            </div>
            <div className={`p-6 rounded-lg border ${containerBg}`}>
                <h3 className={`text-xl font-semibold mb-4 border-b pb-2 ${isNightMode ? 'border-red-800 text-red-400' : 'border-gray-600 text-white'}`}>Számított Értékek</h3>
                <ResultField isNightMode={isNightMode} label="Fókuszarány (f/)" value={calculations.focalRatio?.toFixed(1) ?? 'N/A'} description="A távcső 'fényereje' és látómezeje." />
                <ResultField isNightMode={isNightMode} label="Nagyítás" value={calculations.magnification?.toFixed(0) ?? 'N/A'} unit="x" description="Ennyiszer nagyobbnak látszik az objektum." />
                <ResultField isNightMode={isNightMode} label="Kilépő pupilla" value={calculations.exitPupil?.toFixed(1) ?? 'N/A'} unit="mm" description="A fénykéve átmérője. Ideális: 2-7mm." recommendation={`Mély-éghez (~6mm) egy ${calculations.recEyepieceForDeepSky?.toFixed(1)} mm-es, bolygózáshoz (~2mm) egy ${calculations.recEyepieceForPlanets?.toFixed(1)} mm-es okulár javasolt.`} />
                <ResultField isNightMode={isNightMode} label="Valós látómező (TFOV)" value={calculations.trueFOV?.toFixed(2) ?? 'N/A'} unit="°" description="A látható égboltszelet szögmérete." />
                <ResultField isNightMode={isNightMode} label="Max. hasznos nagyítás" value={calculations.maxMagnification?.toFixed(0) ?? 'N/A'} unit="x" description="Elméleti határ, ami felett a kép minősége romlik." recommendation={`Ehhez a nagyításhoz egy ~${calculations.recEyepieceForMaxMag?.toFixed(1)} mm-es okulárra van szükség.`}/>
                <ResultField isNightMode={isNightMode} label="Min. hasznos nagyítás" value={calculations.minMagnification?.toFixed(0) ?? 'N/A'} unit="x" description="Alsó határ, ami alatt a kilépő pupilla túl nagy." recommendation={`Ehhez a nagyításhoz egy ~${calculations.recEyepieceForMinMag?.toFixed(1)} mm-es okulárra van szükség.`} />
                <ResultField isNightMode={isNightMode} label="Felbontóképesség" value={calculations.dawesLimit?.toFixed(2) ?? 'N/A'} unit="arcsec" description="Közeli objektumok megkülönböztetése (Dawes-limit)." />
                <ResultField isNightMode={isNightMode} label="Határmagnitúdó" value={calculations.limitingMagnitude?.toFixed(1) ?? 'N/A'} description="A leghalványabb látható csillag." />
            </div>
        </div>
    </div>
  );
};
