
import React, { useState, useEffect } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { useSkyPosition } from '../hooks/useSkyPosition';
import { allDeepSkyObjects } from '../data/deepsky';
import { planets } from '../data/planets';
import { AstroObject, Planet, LocationData } from '../types';

interface ObjectCatalogProps {
  isNightMode: boolean;
}

export const ObjectCatalog: React.FC<ObjectCatalogProps> = ({ isNightMode }) => {
  const { location } = useGeolocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [catalogFilter, setCatalogFilter] = useState('');
  const [showVisibleOnly, setShowVisibleOnly] = useState(false);
  const [filteredObjects, setFilteredObjects] = useState<(AstroObject | Planet)[]>([]);

  const allObjects: (AstroObject | Planet)[] = [...allDeepSkyObjects, ...planets];
  const objectTypes = [...new Set(allDeepSkyObjects.map((obj: AstroObject) => obj.type))];
  const catalogs = [...new Set(allDeepSkyObjects.map((obj: AstroObject) => obj.catalog).filter(Boolean))];

  useEffect(() => {
    let results: (AstroObject | Planet)[] = allObjects;
    
    if (searchTerm) {
      results = results.filter(obj => 
        obj.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (obj.name && obj.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (typeFilter) {
      results = results.filter(obj => 'type' in obj && (obj as AstroObject).type === typeFilter);
    }

    if (catalogFilter) {
        results = results.filter(obj => 'catalog' in obj && (obj as AstroObject).catalog === catalogFilter);
    }

    setFilteredObjects(results);
  }, [searchTerm, typeFilter, catalogFilter]);
  
  const cardBg = isNightMode ? 'bg-red-900/20 border-red-800/50' : 'bg-gray-800/50 border-gray-700';
  const inputStyle = "w-full p-2 rounded-md bg-gray-700 border-gray-600 text-white";

  return (
    <div className="animate-fade-in">
      <h2 className={`text-3xl font-bold mb-6 ${isNightMode ? 'text-red-400' : 'text-white'}`}>Objektum Katalógus</h2>
      <div className={`p-4 rounded-lg border ${cardBg} mb-6 flex flex-col sm:flex-row gap-4 items-center`}>
        <input 
          type="text" 
          placeholder="Keresés..." 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
          className={`${inputStyle} flex-grow`}
        />
        <select value={catalogFilter} onChange={e => setCatalogFilter(e.target.value)} className={`${inputStyle} sm:w-40`}>
            <option value="">Minden katalógus</option>
            {catalogs.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className={`${inputStyle} sm:w-48`}>
            <option value="">Minden típus</option>
            {objectTypes.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
        <label className="flex items-center space-x-2 cursor-pointer text-sm">
            <input type="checkbox" checked={showVisibleOnly} onChange={() => setShowVisibleOnly(!showVisibleOnly)} className="form-checkbox h-5 w-5 bg-gray-700 border-gray-600 rounded"/>
            <span>Csak látható</span>
        </label>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className={`${isNightMode ? 'text-red-300' : 'text-gray-300'}`}>
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Név</th>
              <th className="p-2">Típus</th>
              <th className="p-2">Csillagkép</th>
              <th className="p-2 text-center">Mag.</th>
              <th className="p-2 text-center">Láthatóság</th>
            </tr>
          </thead>
          <tbody>
            {filteredObjects.map(obj => (
                 <ObjectRowWrapper key={obj.id} obj={obj} location={location} isNightMode={isNightMode} showVisibleOnly={showVisibleOnly} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ObjectRowWrapper = ({ obj, location, isNightMode, showVisibleOnly }: { obj: AstroObject | Planet, location: LocationData | null, isNightMode: boolean, showVisibleOnly: boolean }) => {
    const { alt } = useSkyPosition('ra' in obj ? obj.ra : null, 'dec' in obj ? obj.dec : null, location);

    if (showVisibleOnly && (alt === null || alt < 0)) {
        return null; 
    }

    return (
        <tr className={`border-t ${isNightMode ? 'border-red-800/50' : 'border-gray-700'} ${alt !== null && alt < 0 ? 'opacity-40' : ''}`}>
            <td className="p-2 font-bold">{obj.id}</td>
            <td className="p-2">{obj.name}</td>
            <td className="p-2">{'type' in obj ? obj.type : 'Bolygó'}</td>
            <td className="p-2">{'constellation' in obj ? obj.constellation : 'N/A'}</td>
            <td className="p-2 text-center">{'magnitude' in obj ? obj.magnitude : 'N/A'}</td>
            <td className={`p-2 text-center font-medium ${alt !== null && alt > 0 ? (isNightMode ? 'text-green-400' : 'text-green-500') : (isNightMode ? 'text-red-600': 'text-gray-500')}`}>
                {alt === null ? '...' : alt > 0 ? `${alt.toFixed(1)}°` : 'Lent'}
            </td>
        </tr>
    );
};
