import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ClipboardList, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    { 
      icon: ClipboardList, 
      label: 'Defect Survey', 
      href: '/defect-survey',
      color: 'bg-orange-500' 
    },
    { 
      icon: CheckCircle, 
      label: 'Defect Verification', 
      href: '/defect-verification',
      color: 'bg-emerald-500' 
    },
  ];

  const handleAction = (href) => {
    navigate(href);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col-reverse items-end mb-4 space-y-reverse space-y-3">
            {actions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 group px-2"
              >
                <span className="bg-slate-900 border border-slate-800 text-white text-sm font-medium px-3 py-1.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {action.label}
                </span>
                <button
                  onClick={() => handleAction(action.href)}
                  className={`${action.color} text-white p-3 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all`}
                >
                  <action.icon size={24} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`p-4 rounded-full shadow-2xl flex items-center justify-center transition-colors ${
          isOpen ? 'bg-slate-800 text-white' : 'bg-primary-500 text-white shadow-primary-500/30'
        }`}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <Plus size={32} />
        </motion.div>
      </motion.button>
    </div>
  );
};

export default FloatingActionButton;
