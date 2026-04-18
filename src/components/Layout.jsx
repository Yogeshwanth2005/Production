import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Package, ClipboardCheck, Tag, CheckSquare, LogOut, User, ShieldCheck, AlertTriangle, Warehouse, Plus, X, Flame, Layers, Truck } from 'lucide-react';
import { useSharedState } from '../context/SharedStateContext';

export default function Layout() {
  const location = useLocation();
  const { batches, activeBatchNumber, setActiveBatchNumber } = useSharedState();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return "Dashboard";
      case '/gas-production': return "Gas Production Entry";
      case '/batch-creation': return "Filling Batch Creation";
      case '/cylinder-issue': return "Empty Cylinder Issue to Filling";
      case '/filling': return "Process Execution Entry";
      case '/qc': return "Quality Check Entry";
      case '/summary': return "Batch Summary & Completion";
      case '/sealing': return "Sealing / Packaging Entry";
      case '/tagging': return "Tagging / Labeling Entry";
      case '/safety': return "Safety Checklist";
      case '/inventory': return "Move to Filled Inventory";
      default: return "";
    }
  };

  return (
    <div className="flex h-screen bg-page text-gray-900 w-full font-sans text-left">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-white flex flex-col shadow-xl z-20 shrink-0 h-full">
        <div className="p-6 text-2xl font-bold tracking-wider border-b border-primary/50 text-white shadow-sm font-sans flex items-center justify-start">
          SOGFusion
        </div>
        <nav className="flex-1 py-6 px-3 space-y-1 font-medium overflow-y-auto">
          <NavLink to="/gas-production" className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-white/20 text-white shadow-inner font-semibold' : 'text-blue-100 hover:bg-white/10 hover:text-white'}`}>
            <Flame size={18} /> Gas Production
          </NavLink>
          <NavLink to="/cylinder-issue" className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-white/20 text-white shadow-inner font-semibold' : 'text-blue-100 hover:bg-white/10 hover:text-white'}`}>
            <Truck size={18} /> Cylinder Issue
          </NavLink>
          <NavLink to="/batch-creation" className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-white/20 text-white shadow-inner font-semibold' : 'text-blue-100 hover:bg-white/10 hover:text-white'}`}>
            <Layers size={18} /> Batch Creation
          </NavLink>
          <NavLink to="/filling" className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-white/20 text-white shadow-inner font-semibold' : 'text-blue-100 hover:bg-white/10 hover:text-white'}`}>
            <Package size={18} /> Process Entry
          </NavLink>
          <NavLink to="/summary" className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-white/20 text-white shadow-inner font-semibold' : 'text-blue-100 hover:bg-white/10 hover:text-white'}`}>
            <CheckSquare size={18} /> Batch Summary
          </NavLink>
          <NavLink to="/qc" className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-white/20 text-white shadow-inner font-semibold' : 'text-blue-100 hover:bg-white/10 hover:text-white'}`}>
            <ShieldCheck size={18} /> Quality Check
          </NavLink>
          <NavLink to="/safety" className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-white/20 text-white shadow-inner font-semibold' : 'text-blue-100 hover:bg-white/10 hover:text-white'}`}>
            <AlertTriangle size={18} /> Safety Checklist
          </NavLink>
          <NavLink to="/sealing" className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-white/20 text-white shadow-inner font-semibold' : 'text-blue-100 hover:bg-white/10 hover:text-white'}`}>
            <ClipboardCheck size={18} /> Sealing Entry
          </NavLink>
          <NavLink to="/tagging" className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-white/20 text-white shadow-inner font-semibold' : 'text-blue-100 hover:bg-white/10 hover:text-white'}`}>
            <Tag size={18} /> Tagging Entry
          </NavLink>
          <NavLink to="/inventory" className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-white/20 text-white shadow-inner font-semibold' : 'text-blue-100 hover:bg-white/10 hover:text-white'}`}>
            <Warehouse size={18} /> Filled Inventory
          </NavLink>
        </nav>
        <div className="p-4 border-t border-primary/50 text-sm text-blue-200 flex items-center justify-between hover:text-white cursor-pointer transition-colors">
          <span>Logout</span>
          <LogOut size={16} />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white h-full relative">
        {/* Topbar */}
        <header className="h-16 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-6 z-10 shrink-0 w-full absolute top-0 left-0 right-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">{getPageTitle()}</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-sm text-gray-500 font-medium">
              Production Unit A
            </div>
            <div className="h-9 w-9 rounded-full bg-blue-50 text-primary flex items-center justify-center border border-blue-100 shadow-inner">
              <User size={18} />
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-auto p-8 relative bg-gray-50 mt-16 w-full text-left">
          {/* Breadcrumb pseudo */}
          <div className="absolute top-2 right-8 text-xs text-gray-400 font-medium tracking-wide font-sans">
            Home / Production {location.pathname}
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
