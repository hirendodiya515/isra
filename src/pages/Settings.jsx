import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Settings as SettingsIcon, AlertCircle, Loader2 } from 'lucide-react';
import { surveyService } from '../services/surveyService';

const DefectSection = ({ category, title, description, defectTypes, loading, fetching, onAdd }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim(), category);
    setName('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm"
    >
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-sm text-slate-500 mb-6">{description}</p>
      
      <form onSubmit={handleSubmit} className="flex gap-4 mb-8">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter defect name..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
          Add
        </button>
      </form>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {fetching ? (
            <div className="text-center py-4 text-slate-500">Loading...</div>
          ) : defectTypes.length === 0 ? (
            <div className="text-center py-6 bg-slate-800/30 rounded-xl border border-dashed border-slate-700 text-slate-500 text-sm">
              No defects in this section.
            </div>
          ) : (
            defectTypes.map((type) => (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700 group hover:border-slate-500 transition-colors"
              >
                <span className="text-sm font-medium">{type.name}</span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 text-slate-500 hover:text-red-400">
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const Settings = () => {
  const [defectTypes, setDefectTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const unsubscribe = surveyService.subscribeToDefectTypes((types) => {
      setDefectTypes(types);
      setFetching(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddDefect = async (name, category) => {
    setLoading(true);
    const result = await surveyService.addDefectType(name, category);
    setLoading(false);
    if (!result.success) alert('Error: ' + result.error);
  };

  const section1Defects = defectTypes.filter(d => (d.category || 1) === 1);
  const section2Defects = defectTypes.filter(d => d.category === 2);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <SettingsIcon className="text-primary-500" />
          Settings
        </h1>
        <p className="text-slate-500">Manage defect types and categories.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DefectSection
          category={1}
          title="Bubble Defects"
          description="Counters: OK, Missed, False, Partial"
          defectTypes={section1Defects}
          loading={loading}
          fetching={fetching}
          onAdd={handleAddDefect}
        />
        <DefectSection
          category={2}
          title="Stones Defects"
          description="Counters: OK, Dust, Missed, Bubble"
          defectTypes={section2Defects}
          loading={loading}
          fetching={fetching}
          onAdd={handleAddDefect}
        />
      </div>

      <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-blue-400 text-sm flex gap-3">
        <AlertCircle className="shrink-0" />
        <p>Categories defined here will appear as separate tables in the Defect Survey page with their respective counter types.</p>
      </div>
    </div>
  );
};

export default Settings;
