
import React, { useState, useCallback } from 'react';
import { Dashboard } from './components/Dashboard';
import { TelescopeCalculator } from './components/TelescopeCalculator';
import { DevelopmentIdeas } from './components/DevelopmentIdeas';
import { EquipmentManager } from './components/EquipmentManager';
import { ObjectCatalog } from './components/ObjectCatalog';
import { AstroPhotoCalculator } from './components/AstroPhotoCalculator';
import { ObservationLog } from './components/ObservationLog';
import { ObservationPlanner } from './components/ObservationPlanner';
import { StarChart } from './components/StarChart';
import { Weather } from './components/Weather';
import { SunIcon, MoonIcon, TelescopeIcon, DashboardIcon, LightbulbIcon, GearIcon, CatalogIcon, CameraIcon, LogIcon, PlannerIcon, StarMapIcon, WeatherIcon } from './components/Icons';
import { Footer } from './components/Footer';

type View = 'dashboard' | 'calculator' | 'ideas' | 'equipment' | 'catalog' | 'astrophoto' | 'log' | 'planner' | 'starchart' | 'weather';

const App: React.FC = () => {
  const [isNightMode, setIsNightMode] = useState(false);
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const toggleNightMode = useCallback(() => {
    setIsNightMode(prev => !prev);
  }, []);

  const NavButton = ({ view, label, icon }: { view: View; label: string; icon: React.ReactNode }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex flex-col sm:flex-row items-center justify-center sm:justify-start sm:px-4 py-3 w-full text-sm font-medium rounded-lg transition-colors duration-200 ${
        currentView === view
          ? isNightMode ? 'bg-red-900/50 text-red-300' : 'bg-blue-600 text-white'
          : isNightMode ? 'text-red-400 hover:bg-red-900/50 hover:text-red-300' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
    >
      {icon}
      <span className="mt-1 sm:mt-0 sm:ml-3">{label}</span>
    </button>
  );

  const renderView = () => {
    switch (currentView) {
      case 'calculator':
        return <TelescopeCalculator isNightMode={isNightMode} />;
      case 'ideas':
        return <DevelopmentIdeas isNightMode={isNightMode} />;
      case 'equipment':
        return <EquipmentManager isNightMode={isNightMode} />;
      case 'catalog':
        return <ObjectCatalog isNightMode={isNightMode} />;
      case 'astrophoto':
        return <AstroPhotoCalculator isNightMode={isNightMode} />;
      case 'log':
        return <ObservationLog isNightMode={isNightMode} />;
      case 'planner':
        return <ObservationPlanner isNightMode={isNightMode} />;
      case 'starchart':
        return <StarChart isNightMode={isNightMode} />;
      case 'weather':
        return <Weather isNightMode={isNightMode} />;
      case 'dashboard':
      default:
        return <Dashboard isNightMode={isNightMode} />;
    }
  };
  
  const bgColor = isNightMode ? 'bg-black' : 'bg-gray-900';
  const textColor = isNightMode ? 'text-red-500' : 'text-gray-200';

  return (
    <div className={`min-h-screen w-full flex flex-col md:flex-row ${bgColor} ${textColor} font-sans transition-colors duration-300`}>
      <header className={`md:w-64 md:flex-shrink-0 md:flex md:flex-col p-4 border-b md:border-b-0 md:border-r ${isNightMode ? 'border-red-800' : 'border-gray-700'} bg-opacity-20 ${isNightMode ? 'bg-red-900/10' : 'bg-gray-800'}`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-2xl font-bold ${isNightMode ? 'text-red-400' : 'text-white'}`}>
            Astro Companion
          </h1>
          <button onClick={toggleNightMode} className={`p-2 rounded-full ${isNightMode ? 'text-red-400 hover:bg-red-900/50' : 'text-yellow-400 hover:bg-gray-700'}`}>
            {isNightMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
          </button>
        </div>
        <nav className="flex md:flex-col justify-around md:justify-start md:space-y-2">
          <NavButton view="dashboard" label="Műszerfal" icon={<DashboardIcon className="w-5 h-5" />} />
          <NavButton view="starchart" label="Csillagtérkép" icon={<StarMapIcon className="w-5 h-5" />} />
          <NavButton view="catalog" label="Objektum Katalógus" icon={<CatalogIcon className="w-5 h-5" />} />
          <NavButton view="planner" label="Észlelési Tervező" icon={<PlannerIcon className="w-5 h-5" />} />
           <NavButton view="weather" label="Időjárás" icon={<WeatherIcon className="w-5 h-5" />} />
          <NavButton view="log" label="Észlelési Napló" icon={<LogIcon className="w-5 h-5" />} />
          <NavButton view="equipment" label="Felszerelés" icon={<GearIcon className="w-5 h-5" />} />
          <NavButton view="calculator" label="Távcső Kalkulátor" icon={<TelescopeIcon className="w-5 h-5" />} />
          <NavButton view="astrophoto" label="Asztrofotós Segédlet" icon={<CameraIcon className="w-5 h-5" />} />
          <NavButton view="ideas" label="Fejlesztési Ötletek" icon={<LightbulbIcon className="w-5 h-5" />} />
        </nav>
      </header>

      <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto flex flex-col">
        <div className="flex-grow">
          {renderView()}
        </div>
        <Footer isNightMode={isNightMode} />
      </main>
    </div>
  );
};

export default App;
