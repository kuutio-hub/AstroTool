
import React from 'react';
import { CheckCircleIcon, LightbulbIcon } from './Icons';

interface DevelopmentIdeasProps {
  isNightMode: boolean;
}

interface IdeaItemProps {
  title: string;
  description: string;
  isNightMode: boolean;
  done?: boolean;
}

const IdeaItem: React.FC<IdeaItemProps> = ({ title, description, isNightMode, done = false }) => (
  <li className={`p-4 rounded-lg flex items-start space-x-4 ${isNightMode ? 'bg-red-900/20' : 'bg-gray-800'}`}>
    <div className={`flex-shrink-0 mt-1 ${done ? (isNightMode ? 'text-green-500' : 'text-green-400') : (isNightMode ? 'text-red-400' : 'text-blue-500')}`}>
      {done ? <CheckCircleIcon className="w-6 h-6" /> : <LightbulbIcon className="w-6 h-6" />}
    </div>
    <div>
      <h4 className={`font-semibold ${isNightMode ? 'text-red-300' : 'text-white'}`}>{title} {done && <span className="text-xs font-normal text-green-500">(Megvalósítva)</span>}</h4>
      <p className={`text-sm ${isNightMode ? 'text-red-400' : 'text-gray-400'}`}>{description}</p>
    </div>
  </li>
);

export const DevelopmentIdeas: React.FC<DevelopmentIdeasProps> = ({ isNightMode }) => {
  const ideas = [
    {
      title: 'Műszerfal Bővítések',
      description: 'Bolygók láthatóságának, Hold fázisainak és távolságának kijelzése. ISS áthaladások és meteorrajok maximumának előrejelzése.',
      done: true
    },
    {
      title: 'Felszerelés Adatbázis',
      description: 'A felhasználók elmenthetik saját távcsöveiket, okulárjaikat, kameráikat, így a kalkulátorokban egy gombnyomással betölthetik azokat.',
      done: true
    },
     {
      title: 'Asztrofotós Segédletek',
      description: 'Kalkulátor a látómező (FOV) és a képminőség (image scale) szimulációjához különböző távcsövekkel és kamerákkal.',
      done: true
    },
    {
      title: 'Észlelési Napló',
      description: 'Egy digitális napló, ahol a felhasználók rögzíthetik a megfigyeléseiket. Az adatok a böngészőben tárolódnak.',
      done: true
    },
    {
      title: 'Objektum Katalógus',
      description: 'Messier, NGC, IC katalógusok integrálása kereshető, szűrhető formában. Az objektumok aktuális égi pozíciójának, láthatóságának mutatása.',
      done: true
    },
     {
      title: 'Progressive Web App (PWA) Funkciók',
      description: 'Az alkalmazás telepíthető a telefon főképernyőjére, és alapvető offline működést biztosít.',
      done: true
    },
    {
      title: 'Időjárás Modul',
      description: 'Csillagászati időjárás-előrejelzés integrálása (pl. ingyenes 7Timer! API-val), amely mutatja a felhőzetet, seeing-et, és transzparenciát.'
    },
    {
      title: 'Interaktív Csillagtérkép',
      description: 'Egy egyszerű, böngészőben futó csillagtérkép (pl. D3.js segítségével), ami a felhasználó helyzetéből mutatja az aktuális égboltot, és a felszerelés látómezejét is szimulálhatja.'
    },
    {
      title: 'Észlelési Tervező',
      description: 'A katalógusból kiválasztott objektumokból egy éjszakai megfigyelési lista összeállítása, optimális sorrenddel (pl. magasság szerint).'
    }
  ];

  return (
    <div className="animate-fade-in">
      <h2 className={`text-3xl font-bold mb-6 ${isNightMode ? 'text-red-400' : 'text-white'}`}>Jövőbeli Fejlesztési Ötletek</h2>
      <p className={`mb-6 ${isNightMode ? 'text-red-400' : 'text-gray-400'}`}>
        Az alkalmazás moduláris felépítésű, hogy a jövőben könnyen bővíthető legyen. Íme néhány ötlet, kizárólag ingyenes eszközökkel és forrásokkal megvalósítva:
      </p>
      <ul className="space-y-4">
        {ideas.map((idea, index) => (
          <IdeaItem key={index} title={idea.title} description={idea.description} isNightMode={isNightMode} done={idea.done} />
        ))}
      </ul>
    </div>
  );
};
