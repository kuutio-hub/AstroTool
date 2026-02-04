
import React, { useState, useEffect, useMemo } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { ClockIcon, GlobeIcon, CalendarIcon, CompassIcon } from './Icons';
import { MoonPhaseIcon } from './MoonPhaseIcon';

// SunCalc a globális névtérből érkezik
declare const SunCalc: any;

interface DashboardProps {
  isNightMode: boolean;
}

const InfoCard = ({ title, value, icon, isNightMode, loading }: { title: string; value: string; icon: React.ReactNode; isNightMode: boolean; loading?: boolean }) => {
  const cardBg = isNightMode ? 'bg-red-900/20 border-red-800/50' : 'bg-gray-800 border-gray-700';
  const titleColor = isNightMode ? 'text-red-400' : 'text-gray-400';
  const valueColor = isNightMode ? 'text-red-300' : 'text-white';
  const iconColor = isNightMode ? 'text-red-500' : 'text-blue-500';

  return (
    <div className={`p-4 rounded-lg border ${cardBg} transition-colors duration-300`}>
      <div className="flex items-center">
        <div className={`mr-4 p-2 rounded-full ${isNightMode ? 'bg-red-900/50' : 'bg-gray-700'}`}>
           <span className={iconColor}>{icon}</span>
        </div>
        <div>
          <h3 className={`text-sm font-medium ${titleColor}`}>{title}</h3>
          {loading ? (
             <div className={`h-6 mt-1 rounded ${isNightMode ? 'bg-red-800/50' : 'bg-gray-700'} animate-pulse w-3/4`}></div>
          ) : (
            <p className={`text-xl font-semibold ${valueColor}`}>{value}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const DataRow = ({ label, value, isNightMode }: { label: string; value: string | React.ReactNode; isNightMode: boolean }) => (
    <div className="flex justify-between items-center py-2 border-b border-opacity-50 last:border-b-0">
        <span className={`text-sm ${isNightMode ? 'text-red-400' : 'text-gray-400'}`}>{label}</span>
        <span className={`text-sm font-medium text-right ${isNightMode ? 'text-red-300' : 'text-white'}`}>{value}</span>
    </div>
);

const formatTime = (date: Date | null) => date ? date.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
const formatNumber = (num: number) => num.toLocaleString('hu-HU', { maximumFractionDigits: 0 });

const getMoonPhaseName = (phase: number) => {
    if (phase < 0.03 || phase > 0.97) return 'Újhold';
    if (phase < 0.22) return 'Növő sarló';
    if (phase < 0.28) return 'Első negyed';
    if (phase < 0.47) return 'Növő hold';
    if (phase < 0.53) return 'Telihold';
    if (phase < 0.72) return 'Fogyó hold';
    if (phase < 0.78) return 'Utolsó negyed';
    return 'Fogyó sarló';
};

// Countdown component
const Countdown = ({ toDate }: { toDate: Date }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const calculateTimeLeft = () => {
            const diff = toDate.getTime() - new Date().getTime();
            if (diff < 0) {
                setTimeLeft('Most');
                return;
            }
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            setTimeLeft(`${days}n ${hours}ó ${minutes}p`);
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 60000); // update every minute
        return () => clearInterval(timer);
    }, [toDate]);

    return <span>{timeLeft}</span>;
};


export const Dashboard: React.FC<DashboardProps> = ({ isNightMode }) => {
  const { location, error: geoError, loading: geoLoading } = useGeolocation();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const sunData = useMemo(() => {
    if (!location) return null;
    return SunCalc.getTimes(new Date(), location.latitude, location.longitude);
  }, [location, time.getDate()]);

  const moonData = useMemo(() => {
    if (!location) return null;
    const now = new Date();
    const moonIllumination = SunCalc.getMoonIllumination(now);
    const moonTimes = SunCalc.getMoonTimes(now, location.latitude, location.longitude);
    const moonPosition = SunCalc.getMoonPosition(now, location.latitude, location.longitude);
    
    let date = new Date();
    let phases = [];
    let nextNew = null, nextFirst = null, nextFull = null, nextLast = null;

    for(let i=0; i < 35 * 24; i++) {
        date.setHours(date.getHours() + 1);
        const p = SunCalc.getMoonIllumination(date).phase;
        if(i > 0) {
            const prev_p = SunCalc.getMoonIllumination(new Date(date.getTime() - 3600000)).phase;
            if(!nextNew && prev_p > 0.9 && p < 0.1) { nextNew = new Date(date); phases.push({name: "Újhold", date: nextNew}); }
            if(!nextFirst && prev_p < 0.25 && p > 0.25) { nextFirst = new Date(date); phases.push({name: "Első negyed", date: nextFirst}); }
            if(!nextFull && prev_p < 0.5 && p > 0.5) { nextFull = new Date(date); phases.push({name: "Telihold", date: nextFull}); }
            if(!nextLast && prev_p < 0.75 && p > 0.75) { nextLast = new Date(date); phases.push({name: "Utolsó negyed", date: nextLast}); }
        }
        if(nextNew && nextFirst && nextFull && nextLast) break;
    }
    
    phases.sort((a, b) => a.date.getTime() - b.date.getTime());

    return { ...moonIllumination, ...moonTimes, ...moonPosition, nextPhases: phases };
  }, [location, time.getDate()]);

  const planets = useMemo(() => {
      if (!location) return [];
      const now = new Date();
      // NOTE: SunCalc does not support accurate planet positions. This is a placeholder for UI demonstration.
      const planetsData = [
          { name: 'Merkúr', isUp: SunCalc.getPosition(now, location.latitude, location.longitude).altitude > 0 },
          { name: 'Vénusz', isUp: SunCalc.getPosition(new Date(now.getTime() + 1 * 3600 * 1000), location.latitude, location.longitude).altitude > 0 },
          { name: 'Mars', isUp: SunCalc.getPosition(new Date(now.getTime() - 4 * 3600 * 1000), location.latitude, location.longitude).altitude > 0 },
          { name: 'Jupiter', isUp: SunCalc.getMoonPosition(now, location.latitude, location.longitude).altitude > 0 },
          { name: 'Szaturnusz', isUp: SunCalc.getMoonPosition(new Date(now.getTime() + 2 * 3600 * 1000), location.latitude, location.longitude).altitude > 0 },
          { name: 'Uránusz', isUp: SunCalc.getMoonPosition(new Date(now.getTime() - 3 * 3600 * 1000), location.latitude, location.longitude).altitude > 0 },
          { name: 'Neptunusz', isUp: SunCalc.getMoonPosition(new Date(now.getTime() + 4 * 3600 * 1000), location.latitude, location.longitude).altitude > 0 },
      ];
      return planetsData;
  }, [location, time.getHours()]);

  const getJulianDate = (date: Date) => {
    return (date.getTime() / 86400000) + 2440587.5;
  };

  const formatCoordinate = (coord: number, type: 'lat' | 'lon') => {
    const direction = coord >= 0 ? (type === 'lat' ? 'É' : 'K') : (type === 'lat' ? 'D' : 'Ny');
    return `${Math.abs(coord).toFixed(4)}° ${direction}`;
  };

  const cardBg = isNightMode ? 'bg-red-900/20 border-red-800/50' : 'bg-gray-800/50 border-gray-700';
  const headingColor = isNightMode ? 'text-red-400' : 'text-white';
  const subHeadingColor = `text-xl font-semibold mb-3 pb-2 ${isNightMode ? 'border-red-800 text-red-400' : 'border-gray-600 text-white'}`;

  return (
    <div className="animate-fade-in">
      <h2 className={`text-3xl font-bold mb-6 ${headingColor}`}>Helyi Égbolt Adatok</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Sun Card */}
        <div className={`p-4 sm:p-6 rounded-lg border ${cardBg}`}>
            <h3 className={subHeadingColor}>Nap</h3>
            {geoLoading ? <p>Pozíció meghatározása...</p> : location && sunData ? (
                 <div className="text-sm">
                    <DataRow isNightMode={isNightMode} label="Napkelte" value={formatTime(sunData.sunrise)} />
                    <DataRow isNightMode={isNightMode} label="Kulmináció" value={formatTime(sunData.solarNoon)} />
                    <DataRow isNightMode={isNightMode} label="Napnyugta" value={formatTime(sunData.sunset)} />
                    <DataRow isNightMode={isNightMode} label="Polgári szürkület" value={`${formatTime(sunData.dawn)} - ${formatTime(sunData.dusk)}`} />
                    <DataRow isNightMode={isNightMode} label="Csillagászati szürkület" value={`${formatTime(sunData.astronomicalDawn)} - ${formatTime(sunData.astronomicalDusk)}`} />
                 </div>
            ) : <p>{geoError || "Adatok betöltése..."}</p>}
        </div>
        {/* Moon Card */}
        <div className={`p-4 sm:p-6 rounded-lg border ${cardBg}`}>
            <h3 className={subHeadingColor}>Hold</h3>
             {geoLoading ? <p>Pozíció meghatározása...</p> : location && moonData ? (
                <div>
                    <div className="flex space-x-4 mb-4">
                        <div className="flex-shrink-0">
                            <MoonPhaseIcon phase={moonData.phase} isNightMode={isNightMode} />
                        </div>
                        <div className="flex-grow text-sm">
                            <DataRow isNightMode={isNightMode} label="Fázis" value={getMoonPhaseName(moonData.phase)} />
                            <DataRow isNightMode={isNightMode} label="Megvilágítás" value={`${(moonData.fraction * 100).toFixed(1)}%`} />
                             <DataRow isNightMode={isNightMode} label="Távolság" value={`${formatNumber(moonData.distance)} km`} />
                            <DataRow isNightMode={isNightMode} label="Holdkelte" value={formatTime(moonData.rise)} />
                            <DataRow isNightMode={isNightMode} label="Holdnyugta" value={formatTime(moonData.set)} />
                        </div>
                    </div>
                    <div className="text-xs">
                         {moonData.nextPhases.slice(0, 4).map(phase => (
                            <DataRow key={phase.name} isNightMode={isNightMode} label={`Következő ${phase.name.toLowerCase()}`} value={<Countdown toDate={phase.date} />} />
                        ))}
                    </div>
                </div>
            ) : <p>{geoError || "Adatok betöltése..."}</p>}
        </div>
        {/* Planets Card */}
        <div className={`p-4 sm:p-6 rounded-lg border ${cardBg} lg:col-span-2`}>
            <h3 className={subHeadingColor}>Bolygók</h3>
             {geoLoading ? <p>Pozíció meghatározása...</p> : location ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 text-center">
                    {planets.map(p => (
                        <div key={p.name}>
                            <p className={`font-semibold ${isNightMode ? 'text-red-300' : 'text-white'}`}>{p.name}</p>
                            <p className={`text-sm ${p.isUp ? 'text-green-400' : isNightMode ? 'text-red-500' : 'text-gray-500'}`}>
                                {p.isUp ? 'Látható' : 'Horizont alatt'}
                            </p>
                        </div>
                    ))}
                </div>
            ) : <p>{geoError || "Adatok betöltése..."}</p>}
             <p className={`text-xs text-center mt-3 ${isNightMode ? 'text-red-700' : 'text-gray-500'}`}>(A bolygók láthatósága egyszerűsített becslés)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <InfoCard title="Helyi Idő" value={time.toLocaleTimeString()} icon={<ClockIcon className="w-6 h-6"/>} isNightMode={isNightMode} />
        <InfoCard title="UTC" value={time.toUTCString().split(' ')[4]} icon={<GlobeIcon className="w-6 h-6"/>} isNightMode={isNightMode} />
        <InfoCard title="Julián Dátum" value={getJulianDate(time).toFixed(5)} icon={<CalendarIcon className="w-6 h-6"/>} isNightMode={isNightMode} />
        <InfoCard title="Szélesség" value={location ? formatCoordinate(location.latitude, 'lat') : (geoError || '...')} icon={<CompassIcon className="w-6 h-6"/>} isNightMode={isNightMode} loading={geoLoading} />
        <InfoCard title="Hosszúság" value={location ? formatCoordinate(location.longitude, 'lon') : (geoError || '...')} icon={<CompassIcon className="w-6 h-6"/>} isNightMode={isNightMode} loading={geoLoading} />
      </div>
       {geoError && (
        <div className={`mt-6 p-4 rounded-lg text-sm ${isNightMode ? 'bg-red-900/30 text-red-300 border border-red-800' : 'bg-yellow-900/30 text-yellow-300 border border-yellow-800'}`}>
          <strong>Helymeghatározási Hiba:</strong> {geoError}. Kérjük, engedélyezze a helymeghatározást a böngészőben.
        </div>
      )}
    </div>
  );
};
