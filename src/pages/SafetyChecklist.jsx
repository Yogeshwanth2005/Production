import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSharedState } from '../context/SharedStateContext';
import { Search, Plus, Edit3, ArrowLeft, ShieldCheck, AlertCircle, CheckCircle2, LayoutGrid } from 'lucide-react';

export default function SafetyChecklist() {
  const navigate = useNavigate();
  const { safetyChecklists, batches, addSafetyChecklist } = useSharedState();
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [editingAudit, setEditingAudit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState({
    id: '',
    batchNumber: '',
    date: new Date().toISOString().split('T')[0],
    fillingStation: '',
    supervisorName: '',
    checks: {
      equipmentCondition: 'OK',
      safetyValves: 'OK',
      fireSafety: 'OK',
      ppeCompliance: 'OK',
    },
    approvalStatus: 'Saved'
  });

  const handleNew = () => {
    setEditingAudit(null);
    setForm({
      id: `SCL-${Date.now().toString().slice(-6)}`,
      batchNumber: '',
      date: new Date().toISOString().split('T')[0],
      fillingStation: '',
      supervisorName: '',
      checks: {
        equipmentCondition: 'OK',
        safetyValves: 'OK',
        fireSafety: 'OK',
        ppeCompliance: 'OK',
      },
      approvalStatus: 'Saved'
    });
    setView('form');
  };

  const handleEdit = (cl) => {
    if (cl.approvalStatus === 'Posted') return;
    setEditingAudit(cl);
    setForm({
      ...cl,
      approvalStatus: cl.approvalStatus || 'Saved'
    });
    setView('form');
  };

  const handleCheckChange = (check) => {
    if (form.approvalStatus === 'Posted') return;
    setForm(prev => ({
      ...prev,
      checks: {
        ...prev.checks,
        [check]: prev.checks[check] === 'OK' ? 'FAIL' : 'OK'
      }
    }));
  };

  const handleSubmit = async (status = 'Saved') => {
    if (!form.batchNumber || !form.fillingStation || !form.supervisorName) {
      alert("Please fill all required fields");
      return;
    }
    
    const isPassed = Object.values(form.checks).every(v => v === 'OK');
    
    await addSafetyChecklist({
      ...form,
      status: isPassed ? 'Passed' : 'Failed',
      approvalStatus: status
    });
    setView('list');
  };

  const filteredChecklists = safetyChecklists.filter(cl => 
    cl.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cl.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (view === 'form') {
    const isPosted = form.approvalStatus === 'Posted';
    return (
      <div className="flex flex-col h-full bg-slate-50 w-full animate-in slide-in-from-right duration-300 font-sans">
        <div className="p-8 pb-4">
           <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-xs uppercase tracking-widest mb-4 transition-colors">
             <ArrowLeft size={14} /> Back to Registry
           </button>
           <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">{editingAudit ? 'Edit Safety Audit' : 'New Safety Compliance Audit'}</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-[2px] mt-1">Audit ID: <span className="text-sky-600 font-black">{form.id}</span></p>
              </div>
              <div className="flex gap-3">
                 <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${isPosted ? 'bg-sky-50 text-sky-700 border-sky-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                    <div className={`h-2 w-2 rounded-full ${isPosted ? 'bg-sky-600' : 'bg-rose-600'}`}></div>
                    {form.approvalStatus}
                 </div>
              </div>
           </div>
        </div>

        <div className="flex-1 p-8 pt-4 overflow-y-auto">
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full max-w-5xl mx-auto">
              <div className="h-1.5 bg-slate-800 w-full"></div>
              <div className="p-8">
                 <div className="grid grid-cols-2 gap-8 mb-12">
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Target Batch Number *</label>
                       <select 
                         value={form.batchNumber} 
                         disabled={isPosted}
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
                         disabled={isPosted}
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
                         disabled={isPosted}
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
                         disabled={isPosted}
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
                           onClick={() => !isPosted && handleCheckChange(check)}
                           className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${
                             isPosted ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
                           } ${
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

                 {!isPosted && (
                   <div className="mt-12 flex justify-end gap-4 border-t border-slate-100 pt-8">
                      <button onClick={() => setView('list')} className="px-8 py-3 rounded-xl text-xs font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all">Discard</button>
                      <button onClick={() => handleSubmit('Saved')} className="border border-slate-200 text-slate-700 px-10 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Save Draft</button>
                      <button onClick={() => handleSubmit('Posted')} className="bg-sky-600 text-white px-10 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-sky-100 hover:bg-sky-700 transition-all">Post Audit</button>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 w-full animate-in fade-in duration-300 font-sans">
      <div className="p-6 pb-6 flex justify-between items-center bg-white border-b border-slate-200">
        <div className="flex items-center gap-4">
           <div className="bg-slate-100 p-2 rounded-lg">
              <LayoutGrid size={20} className="text-slate-600" />
           </div>
           <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase leading-none">Safety Compliance Audit Logs</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[2px] mt-1.5">Protocols & Security Verification</p>
           </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search Registry..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-xs font-bold focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all w-64 shadow-inner"
              />
           </div>
           <button onClick={handleNew} className="bg-slate-800 text-white px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center gap-2 shadow-sm">
             <Plus size={14} /> Log Audit
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-white">
        <div className="neat-table-container border-t-0">
           <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="neat-table-header">
                  <th className="p-4 pl-8 w-[25%]">Audit ID</th>
                  <th className="p-4 w-[25%]">Batch Number</th>
                  <th className="p-4 w-[20%] text-center">Compliance</th>
                  <th className="p-4 w-[15%] text-center">Status</th>
                  <th className="p-4 w-[12%] text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredChecklists.length > 0 ? filteredChecklists.map(cl => (
                  <tr key={cl.id} className="neat-table-row">
                    <td className="p-4 pl-8">
                       <span className="font-mono text-slate-600 font-bold">{cl.id}</span>
                    </td>
                    <td className="p-4">
                       <span onClick={() => navigate('/summary')} className="neat-link">{cl.batchNumber}</span>
                    </td>
                    <td className="p-4 text-center">
                       <div className="flex justify-center gap-1.5">
                          {Object.values(cl.checks).map((v, idx) => (
                            <div key={idx} className={`w-2 h-2 rounded-full ${v === 'OK' ? 'bg-sky-400' : 'bg-rose-400'}`}></div>
                          ))}
                       </div>
                    </td>
                    <td className="p-4 text-center">
                       <span className={`inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-sm ${
                         cl.approvalStatus === 'Posted' ? 'bg-sky-50 text-sky-700 border-sky-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                       }`}>
                         <div className={`h-1.5 w-1.5 rounded-full ${cl.approvalStatus === 'Posted' ? 'bg-sky-600' : 'bg-rose-600'}`}></div>
                         {cl.approvalStatus || 'Saved'}
                       </span>
                    </td>
                    <td className="p-4 text-center">
                       <button 
                         onClick={() => handleEdit(cl)}
                         disabled={cl.approvalStatus === 'Posted'}
                         className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                           cl.approvalStatus === 'Posted' 
                           ? 'text-slate-300 bg-slate-50 cursor-not-allowed opacity-50' 
                           : 'text-sky-600 bg-sky-50/50 hover:bg-sky-600 hover:text-white border border-sky-100 shadow-sm'
                         }`}
                       >
                          <Edit3 size={12} />
                          <span>Edit</span>
                       </button>
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
