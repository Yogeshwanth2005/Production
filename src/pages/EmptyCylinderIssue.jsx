import React, { useState, useEffect } from 'react';
import { useSharedState } from '../context/SharedStateContext';
import { Search, Plus, Edit3, ArrowLeft, Truck, Package, MapPin } from 'lucide-react';

export default function EmptyCylinderIssue() {
  const { batches, fetchBatches } = useSharedState();
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [issues, setIssues] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [form, setForm] = useState({
    issueId: '',
    date: new Date().toISOString().split('T')[0],
    fromLocation: 'Stock Yard',
    toLocation: 'Filling Station A',
    gasTypePlanned: 'Oxygen',
    items: []
  });

  const fetchIssues = async () => {
    try {
      const res = await fetch('/api/cylinder-issues');
      const data = await res.json();
      setIssues(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleNew = () => {
    setForm({
      issueId: `ISSUE-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      fromLocation: 'Stock Yard',
      toLocation: 'Filling Station A',
      gasTypePlanned: 'Oxygen',
      items: []
    });
    setView('form');
  };

  const handleAddItem = (serial) => {
    if (!serial) return;
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { serial_number: serial, cylinder_type: 'Standard' }]
    }));
  };

  const handleSubmit = async () => {
    if (form.items.length === 0) return;
    try {
      await fetch('/api/cylinder-issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issue_id: form.issueId,
          date: form.date,
          from_location: form.fromLocation,
          to_location: form.toLocation,
          gas_type_planned: form.gasTypePlanned,
          items: form.items
        })
      });
      fetchIssues();
      setView('list');
    } catch (err) {
      alert("Submission failed");
    }
  };

  if (view === 'form') {
    return (
      <div className="flex flex-col h-full bg-slate-50 w-full animate-in fade-in duration-300 font-sans">
        <div className="p-8 pb-4">
           <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-xs uppercase tracking-widest mb-4 transition-colors">
             <ArrowLeft size={14} /> Back to Issue Registry
           </button>
           <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Logistics Issue Voucher</h2>
           <p className="text-xs text-slate-400 font-bold uppercase tracking-[2px] mt-1">Voucher ID: <span className="text-sky-600 font-black">{form.issueId}</span></p>
        </div>

        <div className="flex-1 p-8 pt-4">
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full max-w-6xl">
              <div className="h-1.5 bg-slate-800 w-full"></div>
              <div className="p-8 grid grid-cols-3 gap-8">
                 <div className="col-span-2 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Discharge Location</label>
                          <input type="text" value={form.fromLocation} onChange={e => setForm({...form, fromLocation: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold shadow-sm" />
                       </div>
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Target Station</label>
                          <input type="text" value={form.toLocation} onChange={e => setForm({...form, toLocation: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold shadow-sm" />
                       </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                       <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Package size={16} className="text-sky-600" /> Itemized Cargo List
                       </h3>
                       <div className="flex gap-2 mb-4">
                          <input 
                            type="text" 
                            id="newSerial"
                            placeholder="Scan/Enter Serial..."
                            className="flex-1 bg-white border border-slate-200 rounded-xl p-2.5 text-sm font-mono shadow-inner outline-none focus:ring-2 focus:ring-sky-500"
                            onKeyDown={e => { if(e.key === 'Enter') { handleAddItem(e.currentTarget.value); e.currentTarget.value = ''; } }}
                          />
                          <button 
                            onClick={() => { const el = document.getElementById('newSerial'); handleAddItem(el.value); el.value = ''; }}
                            className="bg-sky-600 text-white px-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-sky-700 transition-all font-sans"
                          >
                            Add Unit
                          </button>
                       </div>
                       <div className="space-y-2 max-h-60 overflow-auto pr-2">
                          {form.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm animate-in zoom-in-95 duration-200">
                               <span className="text-sm font-mono font-bold text-slate-600">{item.serial_number}</span>
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Empty / {form.gasTypePlanned}</span>
                            </div>
                          ))}
                          {form.items.length === 0 && <p className="text-center text-slate-400 text-xs italic py-8">Scanner Queue Empty</p>}
                       </div>
                    </div>
                 </div>

                 <div className="space-y-8 pl-8 border-l border-slate-100">
                    <div>
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Planned Gas Type</label>
                       <select value={form.gasTypePlanned} onChange={e => setForm({...form, gasTypePlanned: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-sky-500">
                          <option>Oxygen</option>
                          <option>Nitrogen</option>
                          <option>Argon</option>
                       </select>
                    </div>
                    <div className="pt-8">
                       <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Gross Units Found</div>
                       <div className="text-5xl font-black text-slate-800 text-center">{form.items.length}</div>
                    </div>
                    <button 
                      onClick={handleSubmit}
                      className="w-full bg-slate-800 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200"
                    >
                       Confirm Issue
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
           <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Cylinder Logistics Registry</h2>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[2px] mt-1">Empty Stock Transfer Logs</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search Issue ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all w-64 shadow-sm"
              />
           </div>
           <button onClick={handleNew} className="bg-sky-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-sky-700 transition-all flex items-center gap-2 shadow-lg uppercase tracking-widest">
             <Plus size={14} /> Create Issue
           </button>
        </div>
      </div>

      <div className="flex-1 p-8 pt-4 overflow-hidden">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
           <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white text-[10px] font-black uppercase tracking-[2px]">
                  <th className="p-5 pl-8 border-r border-slate-700/50">Issue ID</th>
                  <th className="p-5 border-r border-slate-700/50">Location Path</th>
                  <th className="p-5 border-r border-slate-700/50 text-center">Unit Count</th>
                  <th className="p-5 border-r border-slate-700/50">Timestamp</th>
                  <th className="p-5 text-right pr-12">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {issues.map(issue => (
                  <tr key={issue.issue_id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-5 pl-8 font-mono text-sky-700 font-black">{issue.issue_id}</td>
                    <td className="p-5">
                       <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                          {issue.from_location} <ChevronRight size={10} className="text-slate-300" /> {issue.to_location}
                       </div>
                    </td>
                    <td className="p-5 text-center">
                       <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-black border border-slate-200/50">
                          {issue.items?.length || 0}
                       </span>
                    </td>
                    <td className="p-5 text-[11px] text-slate-400 font-bold uppercase">{issue.date}</td>
                    <td className="p-5 text-right pr-12">
                       <span className="bg-sky-50 text-sky-700 border border-sky-100 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest shadow-sm">
                          {issue.status}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}

function ChevronRight({ size, className }) {
   return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg>
}
