
import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface LogEntry {
  id: string;
  date: string;
  object: string;
  seeing: string;
  notes: string;
}

interface ObservationLogProps {
  isNightMode: boolean;
}

export const ObservationLog: React.FC<ObservationLogProps> = ({ isNightMode }) => {
  const [logs, setLogs] = useLocalStorage<LogEntry[]>('observationLogs', []);
  const [form, setForm] = useState({ object: '', seeing: '3', notes: '' });

  const handleAddLog = () => {
    if (!form.object) return;
    const newLog: LogEntry = {
      id: new Date().toISOString(),
      date: new Date().toLocaleDateString('hu-HU'),
      object: form.object,
      seeing: form.seeing,
      notes: form.notes,
    };
    setLogs([newLog, ...logs]);
    setForm({ object: '', seeing: '3', notes: '' });
  };
  
  const handleDeleteLog = (id: string) => {
      setLogs(logs.filter(log => log.id !== id));
  };
  
  const cardBg = isNightMode ? 'bg-red-900/20 border-red-800/50' : 'bg-gray-800/50 border-gray-700';
  const inputStyle = `w-full p-2 rounded-md bg-gray-700 border-gray-600 text-white mb-4`;
  const buttonStyle = `w-full p-2 rounded-md font-semibold ${isNightMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`;
  
  return (
    <div className="animate-fade-in">
      <h2 className={`text-3xl font-bold mb-6 ${isNightMode ? 'text-red-400' : 'text-white'}`}>Észlelési Napló</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={`p-6 rounded-lg border ${cardBg} lg:col-span-1`}>
          <h3 className="text-xl font-semibold mb-4">Új Bejegyzés</h3>
          <input type="text" placeholder="Objektum neve (pl. M31)" value={form.object} onChange={e => setForm({...form, object: e.target.value})} className={inputStyle} />
          <label className="block text-sm mb-1">Nyugodtság (Seeing)</label>
          <select value={form.seeing} onChange={e => setForm({...form, seeing: e.target.value})} className={inputStyle}>
              <option value="5">5 (Kiváló)</option>
              <option value="4">4 (Jó)</option>
              <option value="3">3 (Átlagos)</option>
              <option value="2">2 (Gyenge)</option>
              <option value="1">1 (Nagyon gyenge)</option>
          </select>
          <textarea placeholder="Jegyzetek..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={4} className={inputStyle}></textarea>
          <button onClick={handleAddLog} className={buttonStyle}>Mentés</button>
        </div>
        <div className={`p-6 rounded-lg border ${cardBg} lg:col-span-2`}>
            <h3 className="text-xl font-semibold mb-4">Bejegyzések</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
                {logs.length === 0 && <p className="text-sm text-gray-400">Nincsenek mentett bejegyzések.</p>}
                {logs.map(log => (
                    <div key={log.id} className={`p-4 rounded-md ${isNightMode ? 'bg-red-900/30' : 'bg-gray-800'}`}>
                        <div className="flex justify-between items-center mb-2">
                           <div>
                             <p className="font-bold">{log.object}</p>
                             <p className="text-xs text-gray-400">{log.date} | Seeing: {log.seeing}/5</p>
                           </div>
                           <button onClick={() => handleDeleteLog(log.id)} className="text-red-500 font-bold text-lg">×</button>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{log.notes}</p>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};
