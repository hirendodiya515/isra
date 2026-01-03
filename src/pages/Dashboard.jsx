import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, LineChart, Line, Legend 
} from 'recharts';
import { TrendingUp, Activity, Layers, AlertCircle, Loader2 } from 'lucide-react';
import { surveyService } from '../services/surveyService';

const StatCard = ({ icon: Icon, label, value, subValue, color, loading }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-3 rounded-xl", color)}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
    <h3 className="text-slate-400 text-sm font-medium">{label}</h3>
    {loading ? (
      <div className="h-8 w-24 bg-slate-800 rounded animate-pulse mt-1" />
    ) : (
      <>
        <p className="text-2xl font-bold mt-1">{value}</p>
        <p className="text-xs text-slate-500 mt-1">{subValue}</p>
      </>
    )}
  </motion.div>
);

const cn = (...classes) => classes.filter(Boolean).join(' ');

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [allSurveys, setAllSurveys] = useState([]);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  
  const [stats, setStats] = useState({
    sg31: { bubble: '0.00%', stone: '0.00%', date: '-' },
    sg32: { bubble: '0.00%', stone: '0.00%', date: '-' }
  });
  const [trendData, setTrendData] = useState([]);

  // Fetch Data once
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await surveyService.getDefectSurveys();
        // Client-side sort by date ascending
        const sorted = data.sort((a, b) => new Date(a.date) - new Date(b.date));
        setAllSurveys(sorted);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Process Data when surveys or filters change
  useEffect(() => {
    // Filter logic
    let surveys = allSurveys;
    if (dateRange.from) {
      surveys = surveys.filter(s => s.date >= dateRange.from);
    }
    if (dateRange.to) {
      surveys = surveys.filter(s => s.date <= dateRange.to);
    }

    // Data structures
    const lineStats = {
      'SG#3.1': { bubble: 0, stone: 0, date: null },
      'SG#3.2': { bubble: 0, stone: 0, date: null }
    };
    
    const dateMap = {};

    // Helper to calc efficiency for a single survey doc
    const calcSurveyEff = (defects) => {
      let bOk = 0, bTotal = 0;
      let sOk = 0, sTotal = 0;

      Object.values(defects).forEach(d => {
        const total = (d.ok || 0) + (d.missed || 0) + (d.falseCase || 0) + (d.partial || 0) + (d.dust || 0) + (d.bubble || 0);
        if (Number(d.category) === 1) { // Bubble
            bOk += (d.ok || 0);
            bTotal += total;
        } else if (Number(d.category) === 2) { // Stones
            sOk += (d.ok || 0);
            sTotal += total;
        }
      });

      return {
        bubble: bTotal > 0 ? (bOk / bTotal) * 100 : 0,
        stone: sTotal > 0 ? (sOk / sTotal) * 100 : 0
      };
    };

    surveys.forEach(survey => {
        const { bubble, stone } = calcSurveyEff(survey.defects || {});
        
        // Update latest stats logic
        if (survey.line && lineStats[survey.line]) {
          lineStats[survey.line] = {
              bubble: bubble.toFixed(2),
              stone: stone.toFixed(2),
              date: survey.date
          };
        }

        // Update Trend Data (Group by Date)
        const dateKey = survey.date;
        if (!dateMap[dateKey]) dateMap[dateKey] = { date: dateKey, 'SG#3.1': [], 'SG#3.2': [] };
        
        if (survey.line === 'SG#3.1' || survey.line === 'SG#3.2') {
            dateMap[dateKey][survey.line].push({ bubble, stone }); 
        }
    });

    // Finalize Trend Data
    const finalTrend = Object.values(dateMap).map(day => {
        const avg = (arr, key) => {
            if (!arr.length) return null;
            const sum = arr.reduce((acc, curr) => acc + curr[key], 0);
            return (sum / arr.length).toFixed(2);
        };
        
        return {
            name: day.date,
            sg31_bubble: avg(day['SG#3.1'], 'bubble'),
            sg31_stone: avg(day['SG#3.1'], 'stone'),
            sg32_bubble: avg(day['SG#3.2'], 'bubble'),
            sg32_stone: avg(day['SG#3.2'], 'stone'),
        };
    }).sort((a, b) => new Date(a.name) - new Date(b.name));

    setTrendData(finalTrend);
    setStats({
        sg31: { ...lineStats['SG#3.1'], bubble: lineStats['SG#3.1'].bubble + '%', stone: lineStats['SG#3.1'].stone + '%' },
        sg32: { ...lineStats['SG#3.2'], bubble: lineStats['SG#3.2'].bubble + '%', stone: lineStats['SG#3.2'].stone + '%' }
    });

  }, [allSurveys, dateRange]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-slate-500">Real-time performance metrics</p>
        </div>
        
        {/* Date Filters */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/50 p-2 rounded-xl border border-slate-800">
           <div className="flex items-center gap-2 px-2">
              <span className="text-xs font-bold text-slate-500 uppercase">From</span>
              <input 
                type="date" 
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-sm focus:ring-1 focus:ring-primary-500 outline-none"
              />
           </div>
           <div className="w-px h-6 bg-slate-700"></div>
           <div className="flex items-center gap-2 px-2">
              <span className="text-xs font-bold text-slate-500 uppercase">To</span>
              <input 
                type="date" 
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-sm focus:ring-1 focus:ring-primary-500 outline-none"
              />
           </div>
           {(dateRange.from || dateRange.to) && (
             <button 
               onClick={() => setDateRange({ from: '', to: '' })}
               className="ml-2 px-3 py-1 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
             >
               Clear
             </button>
           )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Activity} 
          label="SG#3.1 Bubble Eff." 
          value={stats.sg31.bubble} 
          subValue={`Latest: ${stats.sg31.date || 'No Data'}`}
          color="bg-blue-500" 
          loading={loading}
        />
        <StatCard 
          icon={Layers} 
          label="SG#3.1 Stone Eff." 
          value={stats.sg31.stone}
          subValue={`Latest: ${stats.sg31.date || 'No Data'}`}
          color="bg-amber-500" 
          loading={loading}
        />
        <StatCard 
          icon={Activity} 
          label="SG#3.2 Bubble Eff." 
          value={stats.sg32.bubble} 
          subValue={`Latest: ${stats.sg32.date || 'No Data'}`}
          color="bg-emerald-500" 
          loading={loading}
        />
        <StatCard 
          icon={Layers} 
          label="SG#3.2 Stone Eff." 
          value={stats.sg32.stone} 
          subValue={`Latest: ${stats.sg32.date || 'No Data'}`}
          color="bg-purple-500" 
          loading={loading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bubble Efficiency Trend */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary-500"/>
            Bubble Efficiency Trend
          </h3>
          <div className="h-[300px]">
            {loading ? (
                <div className="h-full flex items-center justify-center text-slate-500">
                    <Loader2 className="animate-spin mr-2" /> Loading data...
                </div>
            ) : trendData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500">No data available</div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis 
                        stroke="#64748b" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        domain={[0, 100]} 
                        tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                        formatter={(value) => [`${value}%`]}
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="sg31_bubble" name="SG#3.1" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} />
                    <Line type="monotone" dataKey="sg32_bubble" name="SG#3.2" stroke="#10b981" strokeWidth={3} dot={{r: 4}} />
                </LineChart>
                </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Stone Efficiency Trend */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Layers size={20} className="text-amber-500"/>
            Stone Efficiency Trend
          </h3>
          <div className="h-[300px]">
             {loading ? (
                <div className="h-full flex items-center justify-center text-slate-500">
                    <Loader2 className="animate-spin mr-2" /> Loading data...
                </div>
            ) : trendData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500">No data available</div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis 
                        stroke="#64748b" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        domain={[0, 100]} 
                        tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                        formatter={(value) => [`${value}%`]}
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="sg31_stone" name="SG#3.1" stroke="#f59e0b" strokeWidth={3} dot={{r: 4}} />
                    <Line type="monotone" dataKey="sg32_stone" name="SG#3.2" stroke="#a855f7" strokeWidth={3} dot={{r: 4}} />
                </LineChart>
                </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
