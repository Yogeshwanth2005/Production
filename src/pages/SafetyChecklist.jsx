import React, { useState } from 'react';
import { useSharedState } from '../context/SharedStateContext';
import { Search, Plus, Edit3, ArrowLeft, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SafetyChecklist() {
  const { safetyChecklists, batches, addSafetyChecklist } = useSharedState();
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState({
    batchNumber: '',
    date: new Date().toISOString().split('T')[0],
    fillingStation: '',
    supervisorName: '',
    checks: {
      equipmentCondition: 'OK',
      safetyValves: 'OK',
      fireSafety: 'OK',
      ppeCompliance: 'OK',
    }
  });

  const handleNew = () => {
    // Auto-generate Checklist ID
    const checklistId = `SCL-${Date.now().toString().slice(-6)}`;
    setForm(prev => ({ ...prev, id: checklistId }));
    setView('form');
  };

  const handleCheckChange = (check) => {
    setForm(prev => ({
      ...prev,
      checks: {
        ...prev.checks,
        [check]: prev.checks[check] === 'OK' ? 'FAIL' : 'OK'
      }
    }));
  };

  const handleSubmit = async () => {
    if (!form.batchNumber || !form.fillingStation || !form.supervisorName) {
      alert("Please fill all required fields");
      return;
    }
    
    const isPassed = Object.values(form.checks).every(v => v === 'OK');
    
    await addSafetyChecklist({
      ...form,
      status: isPassed ? 'Passed' : 'Failed'
    });
    setView('list');
  };

  const filteredChecklists = safetyChecklists.filter(cl => 
    cl.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cl.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (view === 'form') {
    return (
      <div className="flex flex-col h-full bg-slate-50 w-full animate-in slide-in-from-right duration-300 font-sans">
        <div className="p-8 pb-4">
           <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-xs uppercase tracking-widest mb-4 transition-colors">
             <ArrowLeft size={14} /> Back to Registry
           </button>
           <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">New Safety Compliance Audit</h2>
           <p className="text-xs text-slate-400 font-bold uppercase tracking-[2px] mt-1">Audit ID: <span className="text-sky-600 font-black">{form.id}</span></p>
        </div>

        <div className="flex-1 p-8 pt-4">
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full max-w-5xl">
              <div className="h-1.5 bg-sky-600 w-full"></div>
              <div className="p-8">
                 <div className="grid grid-cols-2 gap-8 mb-12">
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Target Batch Number *</label>
                       <select 
                         value={form.batchNumber} 
                         onChange={e => setForm({...form, batchNumber: e.target.value})}
                         className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all"
                       >
                         <option value="">Select a batch...</option>
                         {batches.map(b => (
                           <option key={b.batchNumber} value={b.batchNumber}>{b.batchNumber} ({b.productType})</option>
                         ))}
                       </select>
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Audit Supervisor Name *</label>
                       <input 
                         type="text" 
                         value={form.supervisorName}
                         onChange={e => setForm({...form, supervisorName: e.target.value})}
                         placeholder="Authorized Persona"
                         className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all"
                       />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Filling Station ID *</label>
                       <input 
                         type="text" 
                         value={form.fillingStation}
                         onChange={e => setForm({...form, fillingStation: e.target.value})}
                         placeholder="Station Reference"
                         className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all"
                       />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Audit Execution Date</label>
                       <input 
                         type="date" 
                         value={form.date}
                         onChange={e => setForm({...form, date: e.target.value})}
                         className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all"
                       />
                    </div>
                 </div>

                 <div className="border-t border-slate-100 pt-8">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Compliance Checklist</h3>
                    <div className="grid grid-cols-2 gap-4">
                       {Object.keys(form.checks).map((check) => (
                         <div 
                           key={check}
                           onClick={() => handleCheckChange(check)}
                           className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                             form.checks[check] === 'OK' 
                             ? 'bg-sky-50 border-sky-200 text-sky-800 shadow-sm' 
                             : 'bg-rose-50 border-rose-100 text-rose-700'
                           }`}
                         >
                            <span className="text-xs font-black uppercase tracking-widest">{check.replace(/([A-Z])/g, ' $1')}</span>
                            <div className={`w-10 h-6 rounded-full relative transition-colors ${form.checks[check] === 'OK' ? 'bg-sky-600' : 'bg-slate-300'}`}>
                               <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${form.checks[check] === 'OK' ? 'right-1' : 'left-1'}`}></div>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="mt-12 flex justify-end gap-4">
                    <button 
                      onClick={handleSubmit}
                      className="bg-sky-600 text-white px-12 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-sky-700 transition-all shadow-lg hover:shadow-sky-100"
                    >
                       Submit Security Audit
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 w-full animate-in fade-in duration-300 font-sans">
      <div className="p-8 pb-4 flex justify-between items-end">
        <div>
           <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Safety Compliance Audit Logs</h2>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[2px] mt-1">Protocols & Security Verification</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search By Audit ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all w-64 shadow-sm"
              />
           </div>
           <button onClick={handleNew} className="bg-slate-800 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-900 transition-all flex items-center gap-2 shadow-lg uppercase tracking-widest">
             <Plus size={14} /> Log Audit
           </button>
        </div>
      </div>

      <div className="flex-1 p-8 pt-4 overflow-hidden">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
           <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white text-[10px] font-black uppercase tracking-[2px]">
                  <th className="p-5 pl-8 border-r border-slate-700/50">Audit ID</th>
                  <th className="p-5 border-r border-slate-700/50">Batch Number</th>
                  <th className="p-5 border-r border-slate-700/50 text-center">Compliance</th>
                  <th className="p-5 border-r border-slate-700/50">Auditor</th>
                  <th className="p-5 text-right pr-12">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredChecklists.length > 0 ? filteredChecklists.map(cl => (
                  <tr key={cl.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-5 pl-8 font-mono text-sky-700 font-black">
                      {cl.id}
                    </td>
                    <td className="p-5 text-slate-600 font-bold">{cl.batchNumber}</td>
                    <td className="p-5 text-center">
                       <div className="flex justify-center gap-1.5">
                          {Object.values(cl.checks).map((v, idx) => (
                            <div key={idx} className={`w-2 h-2 rounded-full ${v === 'OK' ? 'bg-sky-400' : 'bg-rose-400'}`}></div>
                          ))}
                       </div>
                    </td>
                    <td className="p-5 text-slate-500 font-medium">{cl.supervisorName}</td>
                    <td className="p-5 text-right pr-12">
                       <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded border shadow-sm ${
                         cl.status === 'Passed' ? 'bg-sky-50 text-sky-700 border-sky-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                       }`}>
                         {cl.status}
                       </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="p-20 text-center text-slate-400 italic font-bold bg-slate-50/30">
                      NO COMPLIANCE LOGS DETECTED
                    </td>
                  </tr>
                )}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}
