import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  Menu, Bell, User, RefreshCcw, 
  LayoutDashboard, Settings, 
  Layers, Package, ShieldCheck, 
  ClipboardCheck, Tag, AlertTriangle, 
  Truck, Warehouse, Flame, Search
} from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('gas-production')) return "GAS PRODUCTION ENTRY";
    if (path.includes('batch-creation')) return "BATCH CREATION";
    if (path.includes('cylinder-issue')) return "CYLINDER ISSUE";
    if (path.includes('filling')) return "PROCESS ENTRY";
    if (path.includes('qc')) return "QUALITY CHECK";
    if (path.includes('summary')) return "BATCH SUMMARY";
    if (path.includes('sealing')) return "SEALING ENTRY";
    if (path.includes('tagging')) return "TAGGING ENTRY";
    if (path.includes('safety')) return "SAFETY CHECKLIST";
    if (path.includes('inventory')) return "FILLED INVENTORY";
    return "DASHBOARD";
  };

  const getBreadcrumbs = () => {
    const part = getPageTitle().toLowerCase().split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    return `Production / ${part}`;
  };

  const NavItem = ({ to, icon: Icon, label }) => (
    <NavLink 
      to={to} 
      className={({ isActive }) => `
        flex items-center gap-3 px-4 py-2.5 text-sm transition-all
        ${isActive 
          ? 'bg-sky-600/30 text-white border-l-4 border-sky-400' 
          : 'text-slate-300 hover:bg-slate-800 hover:text-white border-l-4 border-transparent'
        }
      `}
    >
      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
      <span className={isActive ? "font-bold" : "font-medium"}>{label}</span>
    </NavLink>
  );

  const GroupHeader = ({ label }) => (
    <div className="px-4 pt-6 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-[2px]">
      {label}
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar - Reference Style */}
      <aside className="w-64 bg-sidebar text-white flex flex-col shadow-2xl shrink-0 z-30">
        <div className="h-20 flex items-center px-6 gap-3 bg-slate-900 border-b border-slate-800">
          <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center p-1 font-bold text-slate-900 text-xl italic shadow-inner">
             BTG
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-widest text-sky-400">SOGFUSION</span>
            <span className="text-[10px] text-slate-400 font-medium">Production ERP</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto pb-8 scrollbar-hide">
          <GroupHeader label="Masters" />
          <NavItem to="/gas-production" icon={Flame} label="Gas Production" />
          
          <GroupHeader label="Production" />
          <NavItem to="/safety" icon={AlertTriangle} label="Safety Checklist" />
          <NavItem to="/batch-creation" icon={Layers} label="Batch Creation" />
          <NavItem to="/filling" icon={Package} label="Process Entry" />
          <NavItem to="/summary" icon={RefreshCcw} label="Batch Summary" />
          <NavItem to="/qc" icon={ShieldCheck} label="Quality Check" />
          <NavItem to="/sealing" icon={ClipboardCheck} label="Sealing Entry" />
          <NavItem to="/tagging" icon={Tag} label="Tagging Entry" />

          <GroupHeader label="Logistics" />
          <NavItem to="/cylinder-issue" icon={Truck} label="Cylinder Issue" />
          <NavItem to="/inventory" icon={Warehouse} label="Filled Inventory" />
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between text-slate-400">
           <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                <User size={16} />
              </div>
              <span className="text-xs font-bold text-slate-300">Yogeshwanth</span>
           </div>
           <RefreshCcw size={14} className="hover:text-sky-400 cursor-pointer transition-colors" />
        </div>
      </aside>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header - Reference Style */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 shadow-sm z-20">
          <div className="flex items-center gap-6">
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-lg font-black text-slate-800 tracking-wide uppercase">{getPageTitle()}</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Execution Core v2.0</p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex flex-col items-end">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                <span className="text-sky-600 hover:underline cursor-pointer group-hover:text-sky-700">Production</span> / {getPageTitle()}
              </div>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-rose-600 text-[10px] font-black uppercase tracking-tighter bg-rose-50 px-2 py-0.5 rounded border border-rose-100 flex items-center gap-1">
                  Updates Waiting - Refresh!
                </span>
                <span className="text-slate-500 text-[11px] font-medium flex items-center gap-1.5">
                  Welcome, <span className="font-bold text-slate-800 underline decoration-sky-300 underline-offset-4">Yogeshwanth</span>
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Body */}
        <main className="flex-1 overflow-auto bg-slate-50 w-full">
          <div className="w-full min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
