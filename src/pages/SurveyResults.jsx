import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, LayoutGrid, Search, Loader2, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { surveyService } from '../services/surveyService';

const ReportTable = ({ title, data, counters }) => {
  const sectionTotalOk = data.reduce((sum, item) => sum + (item.ok || 0), 0);
  const sectionTotalCount = data.reduce((sum, item) => sum + (item.total || 0), 0);
  const sectionEfficiency = sectionTotalCount > 0 ? ((sectionTotalOk / sectionTotalCount) * 100).toFixed(2) : "0.00";

  return (
    <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden backdrop-blur-sm shadow-xl">
      <div className="bg-emerald-600/10 border-b border-slate-800 p-5 sm:p-6">
        <h3 className="text-xl sm:text-2xl font-bold text-emerald-400 flex items-center gap-2">
            {title}
        </h3>
        <p className="text-lg sm:text-xl text-slate-300 mt-2">
            Total Efficiency = <span className="font-black text-white text-2xl sm:text-3xl">{sectionEfficiency}%</span>
        </p>
      </div>
      
      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-emerald-600 text-white uppercase text-[8px] sm:text-[10px] font-bold tracking-widest">
              <th className="px-2 sm:px-4 py-3 sticky left-0 bg-emerald-600 z-10">Category</th>
              <th className="px-2 sm:px-4 py-3 text-center">OK</th>
              {counters.filter(c => c.key !== 'ok').map(c => (
                <th key={c.key} className="px-2 sm:px-4 py-3 text-center">{c.label}</th>
              ))}
              <th className="px-2 sm:px-4 py-3 text-center bg-emerald-700/50">Total</th>
              <th className="px-2 sm:px-4 py-3 text-center bg-emerald-700">Eff %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {data.length === 0 ? (
                <tr>
                    <td colSpan={counters.length + 2} className="px-6 py-12 text-center text-slate-500 italic">
                        No data recorded for this section.
                    </td>
                </tr>
            ) : (
                data.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors text-[10px] sm:text-sm">
                        <td className="px-2 sm:px-4 py-3 font-bold text-slate-200 sticky left-0 bg-[#0c1426] shadow-[2px_0_5px_rgba(0,0,0,0.3)] truncate max-w-[80px] sm:max-w-none">{item.name}</td>
                        <td className="px-2 sm:px-4 py-3 text-center text-emerald-400 font-bold bg-emerald-500/5">{item.ok}</td>
                        {counters.filter(c => c.key !== 'ok').map(c => (
                             <td key={c.key} className="px-2 sm:px-4 py-3 text-center text-slate-400">{item[c.key] || 0}</td>
                        ))}
                        <td className="px-2 sm:px-4 py-3 text-center text-slate-200 font-medium bg-slate-800/50">{item.total}</td>
                        <td className="px-2 sm:px-4 py-3 text-center font-black text-white bg-primary-500/10">{item.efficiency}%</td>
                    </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SECTION_1_COUNTERS = [
  { label: 'OK', key: 'ok' },
  { label: 'Missed', key: 'missed' },
  { label: 'False', key: 'falseCase' },
  { label: 'Partial', key: 'partial' },
];

const SECTION_2_COUNTERS = [
  { label: 'OK', key: 'ok' },
  { label: 'Dust', key: 'dust' },
  { label: 'Missed', key: 'missed' },
  { label: 'Bubble', key: 'bubble' },
];

const SurveyResults = () => {
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    line: 'SG#3.1'
  });
  const [reportData, setReportData] = useState({ section1: [], section2: [] });

  const fetchReport = async () => {
    setLoading(true);
    try {
      const [surveys, types] = await Promise.all([
        surveyService.getSurveysByFilters(filters.date, filters.line),
        surveyService.getDefectTypes()
      ]);

      // Create maps for canonical lookup
      const typeMap = {};
      const nameMap = {};
      
      types.forEach(t => {
        const cat = t.category || 1;
        typeMap[t.id] = cat;
        if (t.name) {
             nameMap[t.name.trim()] = cat;
        }
      });

      const aggregated = {};
      
      surveys.forEach(survey => {
        Object.entries(survey.defects).forEach(([id, counts]) => {
          if (!aggregated[id]) {
            // Priority: 1. ID Match (Best) 2. Name Match (Resilience) 3. Saved Category (Fallback)
            let canonicalCategory = typeMap[id];
            
            if (!canonicalCategory && counts.name) {
                canonicalCategory = nameMap[counts.name.trim()];
            }
            
            if (!canonicalCategory) {
                canonicalCategory = counts.category || 1;
            }

            // Enforce number type
            canonicalCategory = Number(canonicalCategory);
            
            aggregated[id] = { 
              name: counts.name, 
              category: canonicalCategory,
              total: 0
            };
            // Initialize all possible keys
            const allKeys = canonicalCategory === 2 ? SECTION_2_COUNTERS : SECTION_1_COUNTERS;
            allKeys.forEach(k => aggregated[id][k.key] = 0);
          }
          
          Object.entries(counts).forEach(([key, val]) => {
            if (key !== 'category' && typeof val === 'number') {
              aggregated[id][key] = (aggregated[id][key] || 0) + val;
              aggregated[id].total += val;
            }
          });
        });
      });

      const processed = Object.values(aggregated).map(item => ({
        ...item,
        efficiency: item.total > 0 ? ((item.ok / item.total) * 100).toFixed(2) : "0.00"
      }));

      setReportData({
        section1: processed.filter(d => Number(d.category) === 1),
        section2: processed.filter(d => Number(d.category) === 2)
      });
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [filters]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32 px-4">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileSpreadsheet className="text-primary-500" />
            Survey Results
          </h1>
          
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm">
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
              <Calendar size={12} /> Date
            </label>
            <input 
              type="date" 
              value={filters.date}
              onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>

          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
              <LayoutGrid size={12} /> Line
            </label>
            <select 
              value={filters.line}
              onChange={(e) => setFilters(prev => ({ ...prev, line: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all appearance-none"
            >
              <option value="SG#3.1">SG#3.1</option>
              <option value="SG#3.2">SG#3.2</option>
            </select>
          </div>

          <button 
            onClick={fetchReport}
            className="flex items-center justify-center p-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-all shadow-lg shadow-primary-500/20 active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
          </button>
        </div>
      </div>

      <div className="space-y-12">
        <ReportTable 
            title={`${filters.line} ISRA Efficiency - Bubble`} 
            data={reportData.section1}
            counters={SECTION_1_COUNTERS}
        />
        <ReportTable 
            title={`${filters.line} ISRA Efficiency - Stones`} 
            data={reportData.section2}
            counters={SECTION_2_COUNTERS}
        />
      </div>

      <div className="p-6 rounded-2xl bg-primary-500/5 border border-primary-500/10 text-primary-400 text-sm flex gap-3 leading-relaxed">
        <AlertCircle className="shrink-0" />
        <p>
            This report aggregates multiple entries for the same date and line. 
            <strong> Efficiency</strong> is calculated at the category level and section level based on the total OK count versus total defects recorded.
        </p>
      </div>
    </div>
  );
};

export default SurveyResults;
