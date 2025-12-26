import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Calendar, User, LayoutGrid, Loader2, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { surveyService } from '../services/surveyService';
import DefectCounterRow from '../components/DefectCounterRow';

const SECTION_1_COUNTERS = [
  { label: 'OK', key: 'ok', colorClass: 'text-emerald-500' },
  { label: 'Missed', key: 'missed', colorClass: 'text-red-500' },
  { label: 'False', key: 'falseCase', colorClass: 'text-orange-500' },
  { label: 'Partial', key: 'partial', colorClass: 'text-blue-500' },
];

const SECTION_2_COUNTERS = [
  { label: 'OK', key: 'ok', colorClass: 'text-emerald-500' },
  { label: 'Dust', key: 'dust', colorClass: 'text-yellow-500' },
  { label: 'Missed', key: 'missed', colorClass: 'text-red-500' },
  { label: 'Bubble', key: 'bubble', colorClass: 'text-cyan-500' },
];

const STORAGE_KEY = 'isra_defect_survey_backup';

const DefectSurvey = () => {
  const [loading, setLoading] = useState(false);
  const [fetchingTypes, setFetchingTypes] = useState(true);
  const [defectTypes, setDefectTypes] = useState([]);
  
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure date is updated to today if it's a new day, but keep other data
        return { 
          ...parsed, 
          date: new Date().toISOString().split('T')[0] 
        };
      } catch (e) {
        console.error("Error parsing saved survey:", e);
      }
    }
    return {
      date: new Date().toISOString().split('T')[0],
      line: 'SG#3.1',
      person: '',
      defects: {},
    };
  });

  // Persistence effect
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    const unsubscribe = surveyService.subscribeToDefectTypes((types) => {
      setDefectTypes(types);
      setFormData(prev => {
        const newDefects = { ...prev.defects };
        types.forEach(current => {
          if (!newDefects[current.id]) {
            const counters = (current.category || 1) === 1 ? SECTION_1_COUNTERS : SECTION_2_COUNTERS;
            newDefects[current.id] = { 
              name: current.name, 
              category: current.category || 1,
              ...counters.reduce((cAcc, c) => ({ ...cAcc, [c.key]: 0 }), {})
            };
          } else {
             // Force update metadata in case they changed in Settings
             newDefects[current.id] = {
                ...newDefects[current.id],
                name: current.name,
                category: current.category || 1
             };
          }
        });
        return { ...prev, defects: newDefects };
      });
      setFetchingTypes(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateCounter = (defectId, category, value) => {
    setFormData(prev => ({
      ...prev,
      defects: {
        ...prev.defects,
        [defectId]: {
          ...prev.defects[defectId],
          [category]: value
        }
      }
    }));
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to clear all current counts?")) {
      setFormData(prev => ({
        ...prev,
        defects: Object.keys(prev.defects).reduce((acc, key) => {
          const defect = prev.defects[key];
          const counters = defect.category === 1 ? SECTION_1_COUNTERS : SECTION_2_COUNTERS;
          acc[key] = { 
            ...defect, 
            ...counters.reduce((cAcc, c) => ({ ...cAcc, [c.key]: 0 }), {})
          };
          return acc;
        }, {})
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.person.trim()) {
      alert('Please enter the person name.');
      return;
    }

    setLoading(true);
    const result = await surveyService.addSurvey({
      ...formData,
      type: 'defect_survey',
    });
    setLoading(false);

    if (result.success) {
      alert('Defect survey submitted successfully!');
      localStorage.removeItem(STORAGE_KEY);
      // Reset counters but keep person/line
      setFormData(prev => ({
        ...prev,
        defects: Object.keys(prev.defects).reduce((acc, key) => {
          const defect = prev.defects[key];
          const counters = defect.category === 1 ? SECTION_1_COUNTERS : SECTION_2_COUNTERS;
          acc[key] = { 
            ...defect, 
            ...counters.reduce((cAcc, c) => ({ ...cAcc, [c.key]: 0 }), {})
          };
          return acc;
        }, {})
      }));
    } else {
      alert('Error submitting survey: ' + result.error + '. Your data is still saved locally.');
    }
  };

  const section1Types = defectTypes.filter(t => (t.category || 1) === 1);
  const section2Types = defectTypes.filter(t => t.category === 2);

  return (
    <div className="max-w-5xl mx-auto pb-24 px-4 sm:px-6">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Defect Survey</h1>
          <p className="text-slate-500 mt-1">Real-time recording with auto-save.</p>
        </div>
        <button 
          onClick={handleReset}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all border border-slate-700 text-sm font-medium"
        >
          <RefreshCw size={16} /> Reset All
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-12">
        {/* Header Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 p-5 sm:p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm"
        >
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 flex items-center gap-2 uppercase tracking-wider">
              <Calendar size={14} className="text-primary-500" /> Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 flex items-center gap-2 uppercase tracking-wider">
              <LayoutGrid size={14} className="text-primary-500" /> Line
            </label>
            <select
              value={formData.line}
              onChange={(e) => setFormData(prev => ({ ...prev, line: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm appearance-none"
            >
              <option value="SG#3.1">SG#3.1</option>
              <option value="SG#3.2">SG#3.2</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 flex items-center gap-2 uppercase tracking-wider">
              <User size={14} className="text-primary-500" /> Person
            </label>
            <input
              type="text"
              value={formData.person}
              placeholder="Operator Name"
              onChange={(e) => setFormData(prev => ({ ...prev, person: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm"
              required
            />
          </div>
        </motion.div>

        {/* Section 1: Bubble */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-2 gap-2">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <div className="w-1.5 h-6 bg-primary-500 rounded-full"></div>
                Bubble Defects
            </h2>
            <div className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] font-bold text-slate-500 ml-auto sm:ml-0 pr-1 sm:pr-4 uppercase tracking-tighter sm:tracking-widest">
                {SECTION_1_COUNTERS.map(c => (
                    <div key={c.key} className="w-[60px] sm:w-[80px] text-center">{c.label}</div>
                ))}
            </div>
          </div>
          <div className="space-y-3 sm:space-y-4">
             {fetchingTypes ? (
               <div className="py-12 text-center text-slate-500 animate-pulse bg-slate-900/20 rounded-2xl border border-slate-800">
                  <Loader2 className="animate-spin mx-auto mb-2 text-primary-500" size={24} />
                  Loading Bubble Types...
               </div>
             ) : section1Types.length === 0 ? (
               <div className="py-8 bg-slate-800/20 border border-dashed border-slate-800 rounded-2xl text-center text-slate-500 text-sm italic">
                  No Bubble defects configured in Settings.
               </div>
             ) : (
               section1Types.map(type => (
                 <DefectCounterRow
                    key={type.id}
                    name={type.name}
                    counters={SECTION_1_COUNTERS}
                    values={formData.defects[type.id] || {}}
                    onUpdate={(cat, val) => handleUpdateCounter(type.id, cat, val)}
                    hideLabels={true}
                 />
               ))
             )}
          </div>
        </div>

        {/* Section 2: Stones */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-2 gap-2">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <div className="w-1.5 h-6 bg-yellow-500 rounded-full"></div>
                Stones Defects
            </h2>
            <div className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] font-bold text-slate-500 ml-auto sm:ml-0 pr-1 sm:pr-4 uppercase tracking-tighter sm:tracking-widest">
                {SECTION_2_COUNTERS.map(c => (
                    <div key={c.key} className="w-[60px] sm:w-[80px] text-center">{c.label}</div>
                ))}
            </div>
          </div>
          <div className="space-y-3 sm:space-y-4">
             {fetchingTypes ? (
               <div className="py-12 text-center text-slate-500 animate-pulse bg-slate-900/20 rounded-2xl border border-slate-800">
                  <Loader2 className="animate-spin mx-auto mb-2 text-yellow-500" size={24} />
                  Loading Stones Types...
               </div>
             ) : section2Types.length === 0 ? (
               <div className="py-8 bg-slate-800/20 border border-dashed border-slate-800 rounded-2xl text-center text-slate-500 text-sm italic">
                  No Stones defects configured in Settings.
               </div>
             ) : (
               section2Types.map(type => (
                 <DefectCounterRow
                    key={type.id}
                    name={type.name}
                    counters={SECTION_2_COUNTERS}
                    values={formData.defects[type.id] || {}}
                    onUpdate={(cat, val) => handleUpdateCounter(type.id, cat, val)}
                    hideLabels={true}
                 />
               ))
             )}
          </div>
        </div>

        {/* Footer info and Submit */}
        <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-primary-500/5 border border-primary-500/10 text-primary-400 text-xs sm:text-sm flex items-start gap-3">
              <Info className="shrink-0 mt-0.5" size={18} />
              <p className="leading-relaxed">
                  Your progress is auto-saved locally. You can close the browser and come back within the same day to finish your entry.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || defectTypes.length === 0}
              className="w-full flex items-center justify-center gap-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-5 rounded-2xl shadow-xl shadow-primary-500/20 transition-all text-lg mb-10"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
              {loading ? 'Submitting Data...' : 'Submit'}
            </motion.button>
        </div>
      </form>
    </div>
  );
};

export default DefectSurvey;
