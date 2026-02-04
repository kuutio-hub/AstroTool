
import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { allDeepSkyObjects } from '../data/deepsky';
import { AstroObject } from '../types';
import { TrashIcon } from './Icons';

interface ObservationPlannerProps {
  isNightMode: boolean;
}

export const ObservationPlanner: React.FC<ObservationPlannerProps> = ({ isNightMode }) => {
  const [plan, setPlan] = useLocalStorage<AstroObject[]>('observationPlan', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableObjects, setAvailableObjects] = useState<AstroObject[]>([]);
  
  useEffect(() => {
    const planIds = new Set(plan.map(p => p.id));
    const filtered = allDeepSkyObjects.filter(obj => 
      !planIds.has(obj.id) &&
      (obj.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
       obj.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setAvailableObjects(filtered);
  }, [searchTerm, plan]);

  const addToPlan = (obj: AstroObject) => {
    setPlan([...plan, obj]);
  };

  const removeFromPlan = (objId: string) => {
    setPlan(plan.filter(obj => obj.id !== objId));
  };
  
  const cardBg = isNightMode ? 'bg-red-900/20 border-red-800/50' : 'bg-gray-800/50 border-gray-700';
  const inputStyle = "w-full p-2 rounded-md bg-gray-700 border-gray-600 text-white";

  return (
    <div className="animate-fade-in">
      <h2 className={`text-3xl font-bold mb-6 ${isNightMode ? 'text-red-400' : 'text-white'}`}>Észlelési Tervező</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Available Objects */}
        <div className={`p-4 rounded-lg border ${cardBg}`}>
          <h3 className="text-xl font-semibold mb-4">Elérhető Objektumok</h3>
          <input 
            type="text" 
            placeholder="Objektum keresése..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            className={`${inputStyle} mb-4`}
          />
          <ul className="h-96 overflow-y-auto space-y-2">
            {availableObjects.map(obj => (
              <li key={obj.id} className="flex justify-between items-center p-2 bg-gray-800 rounded">
                <div>
                  <span className="font-bold">{obj.id}</span>
                  <span className="text-sm text-gray-400 ml-2">{obj.name}</span>
                </div>
                <button onClick={() => addToPlan(obj)} className={`px-2 py-1 text-xs rounded ${isNightMode ? 'bg-red-600' : 'bg-blue-600'} text-white`}>Hozzáad</button>
              </li>
            ))}
          </ul>
        </div>
        {/* Current Plan */}
        <div className={`p-4 rounded-lg border ${cardBg}`}>
          <h3 className="text-xl font-semibold mb-4">Észlelési Terv</h3>
           <ul className="h-96 overflow-y-auto space-y-2">
            {plan.length === 0 && <p className="text-sm text-gray-400 text-center mt-4">A terved üres. Adj hozzá objektumokat a bal oldali listából.</p>}
            {plan.map(obj => (
              <li key={obj.id} className="flex justify-between items-center p-2 bg-gray-800 rounded">
                <div>
                  <span className="font-bold">{obj.id}</span>
                  <span className="text-sm text-gray-400 ml-2">{obj.name}</span>
                </div>
                <button onClick={() => removeFromPlan(obj.id)} className="text-red-500 hover:text-red-400"><TrashIcon className="w-5 h-5"/></button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
