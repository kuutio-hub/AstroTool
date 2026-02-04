
import React from 'react';

interface WeatherProps {
  isNightMode: boolean;
}

const mockWeatherData = [
  { time: '20:00', cloud: '10%', transparency: 'Kiváló', seeing: '4/5' },
  { time: '21:00', cloud: '10%', transparency: 'Kiváló', seeing: '5/5' },
  { time: '22:00', cloud: '20%', transparency: 'Jó', seeing: '4/5' },
  { time: '23:00', cloud: '30%', transparency: 'Jó', seeing: '3/5' },
  { time: '00:00', cloud: '50%', transparency: 'Átlagos', seeing: '3/5' },
  { time: '01:00', cloud: '70%', transparency: 'Gyenge', seeing: '2/5' },
];

const WeatherCard = ({ data, isNightMode }: { data: typeof mockWeatherData[0]; isNightMode: boolean; }) => {
    const cardBg = isNightMode ? 'bg-red-900/20' : 'bg-gray-800';
    return (
        <div className={`p-4 rounded-lg text-center ${cardBg}`}>
            <p className="font-bold text-lg">{data.time}</p>
            <div className="mt-2 text-sm">
                <p>Felhőzet: {data.cloud}</p>
                <p>Átlátszóság: {data.transparency}</p>
                <p>Nyugodtság: {data.seeing}</p>
            </div>
        </div>
    );
};

export const Weather: React.FC<WeatherProps> = ({ isNightMode }) => {
  const cardBg = isNightMode ? 'bg-red-900/20 border-red-800/50' : 'bg-gray-800/50 border-gray-700';

  return (
    <div className="animate-fade-in">
      <h2 className={`text-3xl font-bold mb-6 ${isNightMode ? 'text-red-400' : 'text-white'}`}>Csillagászati Időjárás-előrejelzés</h2>
      <div className={`p-4 rounded-lg border ${cardBg} mb-6`}>
        <p className={`text-sm ${isNightMode ? 'text-red-300' : 'text-yellow-300'}`}>
          <strong>Figyelem:</strong> Ez a modul jelenleg bemutató adatokkal működik. A valós idejű, helyspecifikus előrejelzés egy jövőbeli frissítés része lesz, amelyhez API kulcs szükséges.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {mockWeatherData.map(data => (
            <WeatherCard key={data.time} data={data} isNightMode={isNightMode} />
        ))}
      </div>
       <p className={`text-xs text-center mt-4 ${isNightMode ? 'text-red-700' : 'text-gray-500'}`}>
            Előrejelzés forrása: 7Timer! (integrálás alatt)
       </p>
    </div>
  );
};
