
import React, { useState, useEffect, useMemo } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { allDeepSkyObjects } from '../data/deepsky';
import { planets } from '../data/planets';
import { AstroObject, Planet, LocationData } from '../types';

interface ObjectCatalogProps {
  isNightMode: boolean;
}

const DEGREES_TO_RADIANS = Math.PI / 180;
const RADIANS_TO_DEGREES = 180 / Math.PI;

const calculateInstantSkyPosition = (ra: number, dec: number, location: LocationData) => {
    const now = new Date();
    const longitude = location.longitude;
    const latitude = location.latitude;

    const j2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
    const diff = now.getTime() - j2000.getTime();
    const d = diff / (1000 * 60 * 60 * 24);

    const ut = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
    const gmst = 18.697374558 + 24.06570982441908 * d;
    let lst_hours = (gmst + ut + longitude / 15) % 24;
    if(lst_hours < 0) lst_hours += 24;
    const lst_degrees = lst_hours * 15;

    const ra_degrees = ra * 15;
    let ha_degrees = lst_degrees - ra_degrees;
    if (ha_degrees < 0) ha_degrees += 360;

    const lat_rad = latitude * DEGREES_TO_RADIANS;
    const dec_rad = dec * DEGREES_TO_RADIANS;
    const ha_rad = ha_degrees * DEGREES_TO_RADIANS;

    const sin_alt = Math.sin(dec_rad) * Math.sin(lat_rad) + Math.cos(dec_rad) * Math.cos(lat_rad) * Math.cos(ha_rad);
    const alt_rad = Math.asin(sin_alt);
    const alt_deg = alt_rad * RADIANS_TO_DEGREES;

    return { alt: alt_deg };
};

export const ObjectCatalog: React.FC<ObjectCatalogProps> = ({ isNightMode }) => {
  const { location } = useGeolocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [catalogFilter, setCatalogFilter] = useState('');
  const [showVisibleOnly, setShowVisibleOnly] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // update every minute for sorting
    return () => clearInterval(timer);
  }, []);

  const allObjects: (AstroObject | Planet)[] = [...allDeepSkyObjects, ...planets];
  const objectTypes = [...new Set(allDeepSkyObjects.map((obj: AstroObject) => obj.type))];
  const catalogs = [...new Set(allDeepSkyObjects.map((obj: AstroObject) => obj.catalog).filter(Boolean))];

  const sortedObjects = useMemo(() => {
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

    if (!location) {
        return showVisibleOnly ? [] : results.map(obj => ({ ...obj, alt: null }));
    }

    const objectsWithAlt = results.map(obj => {
        const alt = ('ra' in obj && 'dec' in obj) ? calculateInstantSkyPosition(obj.ra, obj.dec, location).alt : null;
        return { ...obj, alt };
    });

    const visibleObjects = showVisibleOnly
        ? objectsWithAlt.filter(obj => obj.alt !== null && obj.alt > 0)
        : objectsWithAlt;

    return visibleObjects.sort((a, b) => (b.alt ?? -999) - (a.alt ?? -999));

  }, [searchTerm, typeFilter, catalogFilter, location, showVisibleOnly, currentTime]);
  
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
              <th className="p-2 text-center">Láthatóság (Magasság)</th>
            </tr>
          </thead>
          <tbody>
            {sortedObjects.map(obj => (
                 <ObjectRow key={obj.id} obj={obj} isNightMode={isNightMode} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ObjectRow = ({ obj, isNightMode }: { obj: (AstroObject | Planet) & {alt: number | null}; isNightMode: boolean; }) => {
    const { alt } = obj;

    return (
        <tr className={`border-t ${isNightMode ? 'border-red-800/50' : 'border-gray-700'} ${alt !== null && alt < 0 ? 'opacity-40' : ''}`}>
            <td className="p-2 font-bold">{obj.id}</td>
            <td className="p-2">{obj.name}</td>
            <td className="p-2">{'type' in obj ? obj.type : 'Bolygó'}</td>
            <td className="p-2">{'constellation' in obj ? obj.constellation : 'N/A'}</td>
            <td className="p-2 text-center">{'magnitude' in obj ? obj.magnitude : 'N/A'}</td>
            <td className={`p-2 text-center font-medium ${alt !== null && alt > 0 ? (isNightMode ? 'text-green-400' : 'text-green-500') : (isNightMode ? 'text-red-600': 'text-gray-500')}`}>
                {alt === null ? '...' : alt > 0 ? `${alt.toFixed(1)}°` : `${alt.toFixed(1)}°`}
            </td>
        </tr>
    );
};
