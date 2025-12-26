import React from 'react';
import { Minus, Plus } from 'lucide-react';

const Counter = ({ label, value, onChange, colorClass, hideLabel }) => (
  <div className="flex flex-col items-center gap-1 flex-1 min-w-[60px] sm:min-w-[80px]">
    {!hideLabel && <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{label}</span>}
    <div className={`flex items-center bg-slate-800 rounded-lg p-0.5 sm:p-1 border border-slate-700 w-full justify-between shadow-inner`}>
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        className="p-1 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white"
        type="button"
      >
        <Minus size={16} />
      </button>
      <span className={`font-bold text-xs sm:text-sm ${colorClass}`}>{value}</span>
      <button
        onClick={() => onChange(value + 1)}
        className="p-1 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white"
        type="button"
      >
        <Plus size={16} />
      </button>
    </div>
  </div>
);

const DefectCounterRow = ({ name, counters, values, onUpdate, hideLabels }) => {
  return (
    <div className="flex flex-row items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-900/40 rounded-xl sm:rounded-2xl border border-slate-800 hover:border-slate-700 transition-all group">
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-slate-200 group-hover:text-primary-400 transition-colors uppercase tracking-tight text-[11px] sm:text-sm truncate">
          {name}
        </h4>
      </div>
      <div className="flex gap-2 sm:gap-3 shrink-0">
        {counters.map((c) => (
            <Counter 
              key={c.key}
              label={c.label} 
              value={values[c.key] || 0} 
              onChange={(val) => onUpdate(c.key, val)} 
              colorClass={c.colorClass}
              hideLabel={hideLabels}
            />
        ))}
      </div>
    </div>
  );
};

export default DefectCounterRow;
