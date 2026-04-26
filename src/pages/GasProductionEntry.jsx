import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit3, ArrowLeft, Filter, Download, Activity, Database, CheckCircle2, ChevronRight, LayoutGrid } from 'lucide-react';

export default function GasProductionEntry() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [editingEntry, setEditingEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState({
    productionId: '',
    date: new Date().toISOString().split('T')[0],
    plantLocation: '',
    gasType: 'Oxygen',
    shift: 'Morning',
    machineUnit: '',
    operatorName: '',
    quantityProduced: '',
    quantityUnit: 'Kg',
    purityLevel: '',
    pressureLevel: '',
    linkedTankId: '',
    remarks: '',
  });

  const fetchEntries = async () => {
    try {
      const res = await fetch('/api/gas-production');
      const data = await res.json();
      setEntries(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchEntries(); }, []);

  const handleNew = () => {
    setEditingEntry(null);
    setForm({
      productionId: `GPE-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString().split('T')[0],
      plantLocation: '',
      gasType: 'Oxygen',
      shift: 'Morning',
      machineUnit: '',
      operatorName: '',
      quantityProduced: '',
      quantityUnit: 'Kg',
      purityLevel: '',
      pressureLevel: '',
      linkedTankId: '',
      remarks: '',
    });
    setView('form');
  };

  const handleEdit = (e) => {
    if (e.approval_status === 'Posted') return; 
    setEditingEntry(e);
    setForm({
      productionId: e.production_id,
      date: e.date,
      plantLocation: e.plant_location,
      gasType: e.gas_type,
      shift: e.shift,
      machineUnit: e.machine_unit,
      operatorName: e.operator_name,
      quantityProduced: e.quantity_produced || '',
      quantityUnit: e.quantity_unit || 'Kg',
      purityLevel: e.purity_level || '',
      pressureLevel: e.pressure_level || '',
      linkedTankId: e.linked_tank_id || '',
      remarks: e.remarks || '',
    });
    setView('form');
  };

  const handleSubmit = async (action = 'Saved') => {
    if (!form.plantLocation || !form.machineUnit || !form.operatorName) {
      alert('Please fill all required fields');
      return;
    }

    const payload = {
      production_id: form.productionId,
      date: form.date,
      plant_location: form.plantLocation,
      gas_type: form.gasType,
      shift: form.shift,
      machine_unit: form.machineUnit,
      operator_name: form.operatorName,
      quantity_produced: parseFloat(form.quantityProduced) || 0,
      quantity_unit: form.quantityUnit,
      purity_level: parseFloat(form.purityLevel) || 0,
      pressure_level: parseFloat(form.pressureLevel) || 0,
      linked_tank_id: form.linkedTankId,
      remarks: form.remarks,
      approval_status: action 
    };

    try {
      const url = editingEntry ? `/api/gas-production/${form.productionId}` : '/api/gas-production';
      const method = editingEntry ? 'PUT' : 'POST';
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      await fetchEntries();
      setView('list');
    } catch (err) {
      console.error(err);
    }
  };

  const filteredEntries = entries.filter(e => 
    e.production_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.operator_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (view === 'form') {
    const isPosted = editingEntry?.approval_status === 'Posted';
    return (
      <div className="flex flex-col h-full bg-slate-50 w-full animate-in fade-in duration-300 font-sans">
        <div className="p-8 pb-4">
           <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-xs uppercase tracking-widest mb-4 transition-colors">
             <ArrowLeft size={14} /> Back to Production Registry
           </button>
           <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">{editingEntry ? 'Production Record Analysis' : 'New Production Entry'}</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-[2px] mt-1">Record ID: <span className="text-sky-600 font-black underline decoration-sky-300 underline-offset-4">{form.productionId}</span></p>
              </div>
              <div className="flex gap-3">
                 <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${isPosted ? 'bg-sky-50 text-sky-700 border-sky-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                    <div className={`h-2 w-2 rounded-full ${isPosted ? 'bg-sky-600' : 'bg-rose-600'}`}></div>
                    {editingEntry?.approval_status || 'New'}
                 </div>
              </div>
           </div>
        </div>

        <div className="flex-1 p-8 pt-4 overflow-y-auto">
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full max-w-6xl mx-auto">
              <div className="h-1.5 bg-slate-800 w-full"></div>
              <div className="p-8">
                 <div className="grid grid-cols-4 gap-8 mb-12">
                    <div className="col-span-1">
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Registration Date</label>
                       <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} disabled={isPosted} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-sky-500/10" />
                    </div>
                    <div className="col-span-1">
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Gas Category</label>
                       <select value={form.gasType} onChange={e => setForm({...form, gasType: e.target.value})} disabled={isPosted} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-sky-500/10">
                          <option>Oxygen</option>
                          <option>Nitrogen</option>
                          <option>Argon</option>
                       </select>
                    </div>
                    <div className="col-span-1">
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Operational Shift</label>
                       <select value={form.shift} onChange={e => setForm({...form, shift: e.target.value})} disabled={isPosted} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-sky-500/10">
                          <option>Morning</option>
                          <option>Evening</option>
                          <option>Night</option>
                       </select>
                    </div>
                    <div className="col-span-1">
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Plant Location</label>
                       <input type="text" value={form.plantLocation} onChange={e => setForm({...form, plantLocation: e.target.value})} disabled={isPosted} placeholder="e.g. ASU-Plant Alpha" className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-sky-500/10" />
                    </div>
                 </div>

                 <div className="grid grid-cols-3 gap-12 bg-slate-50/50 p-8 rounded-3xl border border-slate-100 mb-12">
                    <div className="space-y-6">
                       <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-4">
                          <Activity size={14} className="text-sky-600" /> Output Metrics
                       </h3>
                       <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Quantity Produced</label>
                          <div className="flex gap-2">
                             <input type="number" value={form.quantityProduced} onChange={e => setForm({...form, quantityProduced: e.target.value})} disabled={isPosted} className="flex-1 bg-white border border-slate-200 rounded-xl p-3 text-sm font-black shadow-sm outline-none" />
                             <select value={form.quantityUnit} onChange={e => setForm({...form, quantityUnit: e.target.value})} disabled={isPosted} className="w-20 bg-white border border-slate-200 rounded-xl p-3 text-xs font-black shadow-sm outline-none">
                                <option>Kg</option>
                                <option>Nm3</option>
                             </select>
                          </div>
                       </div>
                       <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Purity Threshold (%)</label>
                          <input type="number" value={form.purityLevel} onChange={e => setForm({...form, purityLevel: e.target.value})} disabled={isPosted} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-black shadow-sm outline-none" placeholder="99.9" />
                       </div>
                    </div>

                    <div className="space-y-6 border-x border-slate-100 px-12">
                       <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-4">
                          <Database size={14} className="text-sky-600" /> Hardware Link
                       </h3>
                       <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Machine Unit ID</label>
                          <input type="text" value={form.machineUnit} onChange={e => setForm({...form, machineUnit: e.target.value})} disabled={isPosted} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-black shadow-sm outline-none" placeholder="e.g. COMP-90" />
                       </div>
                       <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Source Tank Reference</label>
                          <input type="text" value={form.linkedTankId} onChange={e => setForm({...form, linkedTankId: e.target.value})} disabled={isPosted} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-black shadow-sm outline-none" placeholder="TANK-00X" />
                       </div>
                    </div>

                    <div className="space-y-6">
                       <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-4">
                          <CheckCircle2 size={14} className="text-sky-600" /> Personnel
                       </h3>
                       <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Lead Operator Name</label>
                          <input type="text" value={form.operatorName} onChange={e => setForm({...form, operatorName: e.target.value})} disabled={isPosted} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-black shadow-sm outline-none text-sky-800" />
                       </div>
                       <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Operational Remarks</label>
                          <input type="text" value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} disabled={isPosted} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold shadow-sm outline-none" placeholder="Normal Op..." />
                       </div>
                    </div>
                 </div>

                 {!isPosted && (
                    <div className="flex justify-end gap-4 border-t border-slate-100 pt-8">
                       <button onClick={() => setView('list')} className="px-8 py-3 rounded-xl text-xs font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all">Discard</button>
                       <button onClick={() => handleSubmit('Saved')} className="border border-slate-200 text-slate-700 px-10 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Save Draft</button>
                       <button onClick={() => handleSubmit('Posted')} className="bg-sky-600 text-white px-10 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-sky-100 hover:bg-sky-700 transition-all">Post Record</button>
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
              <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase leading-none">Gas Production Registry</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[2px] mt-1.5">Atmospheric Separation Logs</p>
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
           <div className="h-8 w-px bg-slate-200 mx-2"></div>
           <button onClick={handleNew} className="bg-sky-600 text-white px-5 py-2 rounded-lg text-xs font-black hover:bg-sky-700 transition-all flex items-center gap-2 shadow-lg shadow-sky-100 uppercase tracking-widest">
             <Plus size={14} strokeWidth={3} /> New Record
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-white">
        <div className="neat-table-container border-t-0">
           <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="neat-table-header">
                  <th className="p-4 pl-8 w-[25%]">Production ID</th>
                  <th className="p-4 w-[20%]">Volume / Qty</th>
                  <th className="p-4 w-[15%]">Purity</th>
                  <th className="p-4 w-[20%]">Operator Name</th>
                  <th className="p-4 w-[12%] text-center">Status</th>
                  <th className="p-4 w-[8%] text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEntries.map(e => (
                  <tr key={e.production_id} className="neat-table-row">
                    <td className="p-4 pl-8">
                       <div className="flex flex-col">
                          <span onClick={() => handleEdit(e)} className="neat-link">{e.production_id}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{e.plant_location}</span>
                       </div>
                    </td>
                    <td className="p-4">
                       <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-700">{e.quantity_produced} {e.quantity_unit}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{e.gas_type} / {e.shift}</span>
                       </div>
                    </td>
                    <td className="p-4">
                       <span className="bg-sky-50 text-sky-700 px-2 py-1 rounded font-black text-xs border border-sky-100/50">
                          {e.purity_level}%
                       </span>
                    </td>
                    <td className="p-4">
                       <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 border border-slate-200">
                             {e.operator_name?.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-slate-600 hover:text-sky-600 cursor-pointer">{e.operator_name}</span>
                       </div>
                    </td>
                    <td className="p-4 text-center">
                       <span className={`inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-sm ${
                         e.approval_status === 'Posted' ? 'bg-sky-50 text-sky-700 border-sky-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                       }`}>
                         <div className={`h-1.5 w-1.5 rounded-full ${e.approval_status === 'Posted' ? 'bg-sky-600' : 'bg-rose-600'}`}></div>
                         {e.approval_status || 'Saved'}
                       </span>
                    </td>
                    <td className="p-4 text-center">
                       <button 
                         onClick={() => handleEdit(e)}
                         disabled={e.approval_status === 'Posted'}
                         className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                           e.approval_status === 'Posted' 
                           ? 'text-slate-300 bg-slate-50 cursor-not-allowed opacity-50' 
                           : 'text-sky-600 bg-sky-50/50 hover:bg-sky-600 hover:text-white border border-sky-100 shadow-sm'
                         }`}
                       >
                          <Edit3 size={12} />
                          <span>Edit</span>
                       </button>
                    </td>
                  </tr>
                ))}
                {filteredEntries.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-20 text-center">
                       <div className="flex flex-col items-center gap-2 opacity-30">
                          <Search size={40} />
                          <span className="text-sm font-black uppercase tracking-widest">No matching logs found</span>
                       </div>
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
