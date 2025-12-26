import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, ClipboardCheck, Info, Loader2 } from 'lucide-react';
import { surveyService } from '../services/surveyService';

const SurveyForm = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    department: '',
    productivity: '',
    comments: '',
    qualityChecked: false,
    machineStatus: 'operational',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await surveyService.addSurvey(formData);
    setLoading(false);

    if (result.success) {
      alert('Survey submitted successfully!');
      setFormData({
        date: new Date().toISOString().split('T')[0],
        department: '',
        productivity: '',
        comments: '',
        qualityChecked: false,
        machineStatus: 'operational',
      });
    } else {
      alert('Error submitting survey: ' + result.error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Daily Survey</h1>
        <p className="text-slate-500">Please fill in the daily operational data accurately.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Survey Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                required
              >
                <option value="">Select Department</option>
                <option value="production">Production</option>
                <option value="quality">Quality Control</option>
                <option value="maintenance">Maintenance</option>
                <option value="logistics">Logistics</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Productivity Score (1-10)</label>
            <input
              type="number"
              name="productivity"
              min="1"
              max="10"
              value={formData.productivity}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              placeholder="Enter score"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Machine Status</label>
            <div className="grid grid-cols-3 gap-4">
              {['operational', 'under_maintenance', 'down'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, machineStatus: status }))}
                  className={cn(
                    "px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                    formData.machineStatus === status
                      ? "bg-primary-500/10 border-primary-500 text-primary-500"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                  )}
                >
                  {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Additional Comments</label>
            <textarea
              name="comments"
              value={formData.comments}
              onChange={handleChange}
              rows="4"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              placeholder="Any issues or observations..."
            ></textarea>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 text-blue-400 text-sm">
            <Info size={18} />
            <p>Ensure all quality checks are completed before submission.</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="qualityChecked"
              name="qualityChecked"
              checked={formData.qualityChecked}
              onChange={handleChange}
              className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-primary-500 focus:ring-primary-500"
            />
            <label htmlFor="qualityChecked" className="text-sm text-slate-400">
              I confirm that all data entered is accurate and verified.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-500/20 transition-all active:scale-[0.98]"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            {loading ? 'Submitting...' : 'Submit Survey'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const cn = (...classes) => classes.filter(Boolean).join(' ');

export default SurveyForm;
