import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Settings, Menu, X, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import FloatingActionButton from './FloatingActionButton';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const SidebarItem = ({ icon: Icon, label, href, active, showLabel }) => (
  <Link
    to={href}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
      active 
        ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30" 
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
    )}
  >
    <Icon size={20} className={cn("transition-transform duration-200 shrink-0", !active && "group-hover:scale-110")} />
    
    <AnimatePresence>
      {showLabel && (
        <motion.span 
          initial={{ opacity: 0, x: -10 }} 
          animate={{ opacity: 1, x: 0 }} 
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="font-medium whitespace-nowrap overflow-hidden"
        >
          {label}
        </motion.span>
      )}
    </AnimatePresence>
  </Link>
);

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: ClipboardList, label: 'Daily Survey', href: '/survey' },
    { icon: BarChart3, label: 'Survey Results', href: '/results' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200 overflow-hidden">
      {/* Sidebar Backdrop (Mobile/Expanded) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Floating Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        onHoverStart={() => setIsSidebarOpen(true)}
        onHoverEnd={() => setIsSidebarOpen(false)}
        className={cn(
            "fixed inset-y-0 left-0 bg-[#020617] border-r border-slate-800 z-40 flex flex-col transition-all duration-300 shadow-2xl shadow-black",
            !isSidebarOpen && "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <span className="text-xl font-bold text-white">I</span>
          </div>
          <AnimatePresence mode="wait">
            {isSidebarOpen && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 whitespace-nowrap overflow-hidden"
              >
                ISRA
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto overflow-x-hidden scrollbar-hide">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.href}
              {...item}
              active={location.pathname === item.href}
              showLabel={isSidebarOpen}
            />
          ))}
        </nav>
      </motion.aside>

      {/* Main Content */}
      <main className={cn(
          "flex-1 flex flex-col min-w-0 overflow-auto transition-all duration-300",
          "lg:ml-20" // Add margin for collapsed sidebar on desktop
      )}>
        <header className="h-20 flex items-center justify-between px-4 sm:px-8 border-b border-slate-800 bg-[#020617]/50 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center gap-4">
             <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-slate-800 transition-colors lg:hidden"
             >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
             </button>
             
             {/* Header Branding (Mobile/Desktop) */}
             <div className="flex items-center gap-2 lg:hidden">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    ISRA
                </span>
             </div>
          </div>
          
           {/* Right Side Header Branding (Desktop) - Replacing User Profile */}
           <div className="hidden lg:flex items-center gap-3">
              <span className="text-lg font-bold text-slate-400 tracking-wider border-l border-slate-800 pl-4">
                  ISRA DASHBOARD
              </span>
           </div>
        </header>

        <section className="p-4 sm:p-8 max-w-7xl mx-auto w-full pb-24">
          {children}
        </section>
      </main>
      <FloatingActionButton />
    </div>
  );
};

export default Layout;
