
import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Telescope, Eyepiece, Camera } from '../types';
import { presetCameras } from '../data/cameras';
import { TrashIcon } from './Icons';

interface EquipmentManagerProps {
  isNightMode: boolean;
}

export const EquipmentManager: React.FC<EquipmentManagerProps> = ({ isNightMode }) => {
  const [telescopes, setTelescopes] = useLocalStorage<Telescope[]>('telescopes', []);
  const [eyepieces, setEyepieces] = useLocalStorage<Eyepiece[]>('eyepieces', []);
  const [cameras, setCameras] = useLocalStorage<Camera[]>('cameras', []);
  
  const [form, setForm] = useState({ type: 'telescope', name: '', val1: '', val2: '', val3: '' });

  const handlePresetCameraSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const preset = presetCameras.find(c => c.name === e.target.value);
    if (preset) {
        setForm({
            ...form,
            type: 'camera',
            name: preset.name,
            val1: String(preset.sensorWidth),
            val2: String(preset.sensorHeight),
            val3: String(preset.pixelSize),
        });
    }
  };

  const handleAdd = () => {
    const { type, name, val1, val2, val3 } = form;
    if (!name || !val1) return;
    const id = new Date().toISOString();

    if (type === 'telescope' && val2) {
      setTelescopes([...telescopes, { id, name, aperture: Number(val1), focalLength: Number(val2) }]);
    } else if (type === 'eyepiece' && val2) {
      setEyepieces([...eyepieces, { id, name, focalLength: Number(val1), afov: Number(val2) }]);
    } else if (type === 'camera' && val2 && val3) {
      setCameras([...cameras, { id, name, sensorWidth: Number(val1), sensorHeight: Number(val2), pixelSize: Number(val3) }]);
    }
    // Reset only relevant fields, keep type
    setForm({ ...form, name: '', val1: '', val2: '', val3: '' });
  };

  const handleDelete = (type: string, id: string) => {
    if (type === 'telescope') setTelescopes(telescopes.filter(t => t.id !== id));
    if (type === 'eyepiece') setEyepieces(eyepieces.filter(e => e.id !== id));
    if (type === 'camera') setCameras(cameras.filter(c => c.id !== id));
  };
  
  const cardBg = isNightMode ? 'bg-red-900/20 border-red-800/50' : 'bg-gray-800/50 border-gray-700';
  const inputStyle = "w-full p-2 rounded-md bg-gray-700 border-gray-600 text-white";
  const buttonStyle = `w-full p-2 rounded-md font-semibold ${isNightMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`;

  const sortedEyepieces = [...eyepieces].sort((a, b) => a.focalLength - b.focalLength);

  return (
    <div className="animate-fade-in">
      <h2 className={`text-3xl font-bold mb-6 ${isNightMode ? 'text-red-400' : 'text-white'}`}>Felszerelés Menedzser</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={`p-6 rounded-lg border ${cardBg} lg:col-span-1`}>
            <h3 className="text-xl font-semibold mb-4">Új Felszerelés</h3>
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value, name: '', val1: '', val2: '', val3: ''})} className={`${inputStyle} mb-4`}>
                <option value="telescope">Távcső</option>
                <option value="eyepiece">Okulár</option>
                <option value="camera">Kamera</option>
            </select>

            {form.type === 'camera' && (
                <select onChange={handlePresetCameraSelect} className={`${inputStyle} mb-4`}>
                    <option>Válassz előre beállított kamerát...</option>
                    {presetCameras.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
            )}

            <input type="text" placeholder="Név" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={`${inputStyle} mb-4`} />
            
            {form.type === 'telescope' && <>
                <input type="number" placeholder="Átmérő (mm)" value={form.val1} onChange={e => setForm({...form, val1: e.target.value})} className={`${inputStyle} mb-4`} />
                <input type="number" placeholder="Fókusz (mm)" value={form.val2} onChange={e => setForm({...form, val2: e.target.value})} className={`${inputStyle} mb-4`} />
            </>}
             {form.type === 'eyepiece' && <>
                <input type="number" placeholder="Fókusz (mm)" value={form.val1} onChange={e => setForm({...form, val1: e.target.value})} className={`${inputStyle} mb-4`} />
                <input type="number" placeholder="Látómező (°)" value={form.val2} onChange={e => setForm({...form, val2: e.target.value})} className={`${inputStyle} mb-4`} />
            </>}
            {form.type === 'camera' && <>
                <input type="number" placeholder="Szenzor szélesség (mm)" value={form.val1} onChange={e => setForm({...form, val1: e.target.value})} className={`${inputStyle} mb-4`} />
                <input type="number" placeholder="Szenzor magasság (mm)" value={form.val2} onChange={e => setForm({...form, val2: e.target.value})} className={`${inputStyle} mb-4`} />
                <input type="number" step="0.01" placeholder="Pixelméret (μm)" value={form.val3} onChange={e => setForm({...form, val3: e.target.value})} className={`${inputStyle} mb-4`} />
            </>}

            <button onClick={handleAdd} className={buttonStyle}>Hozzáadás</button>
        </div>
        <div className={`p-6 rounded-lg border ${cardBg} lg:col-span-2`}>
            <h3 className="text-xl font-semibold mb-4">Mentett Felszerelések</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <h4 className="font-bold mb-2">Távcsövek</h4>
                    <ul>{telescopes.map(t => <li key={t.id} className="text-sm mb-1 flex justify-between items-center"><span>{t.name} <span className="text-gray-400 text-xs">({t.aperture}mm/{t.focalLength}mm)</span></span> <button onClick={() => handleDelete('telescope', t.id)} className="text-red-500 hover:text-red-400"><TrashIcon className="w-4 h-4" /></button></li>)}</ul>
                </div>
                 <div>
                    <h4 className="font-bold mb-2">Okulárok</h4>
                    <ul>{sortedEyepieces.map(e => <li key={e.id} className="text-sm mb-1 flex justify-between items-center"><span>{e.name} <span className="text-gray-400 text-xs">({e.focalLength}mm/{e.afov}°)</span></span> <button onClick={() => handleDelete('eyepiece', e.id)} className="text-red-500 hover:text-red-400"><TrashIcon className="w-4 h-4" /></button></li>)}</ul>
                </div>
                 <div>
                    <h4 className="font-bold mb-2">Kamerák</h4>
                    <ul>{cameras.map(c => <li key={c.id} className="text-sm mb-1 flex justify-between items-center"><span>{c.name} <span className="text-gray-400 text-xs">({c.sensorWidth}x{c.sensorHeight}mm)</span></span> <button onClick={() => handleDelete('camera', c.id)} className="text-red-500 hover:text-red-400"><TrashIcon className="w-4 h-4" /></button></li>)}</ul>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
