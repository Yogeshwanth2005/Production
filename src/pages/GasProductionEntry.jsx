import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit3, ArrowLeft, Filter, Download, Activity, Database, CheckCircle2 } from 'lucide-react';

export default function GasProductionEntry() {
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

  const handleSubmit = async () => {
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
    };

    try {
      const url = editingEntry ? `/api/gas-production/${form.productionId}` : '/api/gas-production';
      const method = editingEntry ? 'PUT' : 'POST';
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingEntry ? payload : { ...payload, approval_status: 'Pending' })
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
    const isApproved = editingEntry?.approval_status === 'Approved';
    return (
      <div className="flex flex-col h-full bg-slate-50 w-full animate-in fade-in duration-300 font-sans">
        <div className="p-8 pb-4">
           <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-xs uppercase tracking-widest mb-4 transition-colors">
             <ArrowLeft size={14} /> Back to Production Registry
           </button>
           <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">{editingEntry ? 'Production Record Analysis' : 'New Production Entry'}</h2>
           <p className="text-xs text-slate-400 font-bold uppercase tracking-[2px] mt-1">Record ID: <span className="text-sky-600">{form.productionId}</span></p>
        </div>

        <div className="flex-1 p-8 pt-4">
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full max-w-6xl">
              <div className="h-1.5 bg-slate-800 w-full"></div>
              <div className="p-8">
                 <div className="grid grid-cols-4 gap-8 mb-12">
                    <div className="col-span-1">
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Registration Date</label>
                       <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} disabled={isApproved} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-sky-500/10" />
                    </div>
                    <div className="col-span-1">
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Gas Category</label>
                       <select value={form.gasType} onChange={e => setForm({...form, gasType: e.target.value})} disabled={isApproved} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-sky-500/10">
                          <option>Oxygen</option>
                          <option>Nitrogen</option>
                          <option>Argon</option>
                       </select>
                    </div>
                    <div className="col-span-1">
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Operational Shift</label>
                       <select value={form.shift} onChange={e => setForm({...form, shift: e.target.value})} disabled={isApproved} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-sky-500/10">
                          <option>Morning</option>
                          <option>Evening</option>
                          <option>Night</option>
                       </select>
                    </div>
                    <div className="col-span-1">
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Plant Location</label>
                       <input type="text" value={form.plantLocation} onChange={e => setForm({...form, plantLocation: e.target.value})} disabled={isApproved} placeholder="e.g. ASU-Plant Alpha" className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-sky-500/10" />
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
                             <input type="number" value={form.quantityProduced} onChange={e => setForm({...form, quantityProduced: e.target.value})} disabled={isApproved} className="flex-1 bg-white border border-slate-200 rounded-xl p-3 text-sm font-black shadow-sm outline-none" />
                             <select value={form.quantityUnit} onChange={e => setForm({...form, quantityUnit: e.target.value})} disabled={isApproved} className="w-20 bg-white border border-slate-200 rounded-xl p-3 text-xs font-black shadow-sm outline-none">
                                <option>Kg</option>
                                <option>Nm3</option>
                             </select>
                          </div>
                       </div>
                       <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Purity Threshold (%)</label>
                          <input type="number" value={form.purityLevel} onChange={e => setForm({...form, purityLevel: e.target.value})} disabled={isApproved} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-black shadow-sm outline-none" placeholder="99.9" />
                       </div>
                    </div>

                    <div className="space-y-6 border-x border-slate-100 px-12">
                       <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-4">
                          <Database size={14} className="text-sky-600" /> Hardware Link
                       </h3>
                       <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Machine Unit ID</label>
                          <input type="text" value={form.machineUnit} onChange={e => setForm({...form, machineUnit: e.target.value})} disabled={isApproved} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-black shadow-sm outline-none" placeholder="e.g. COMP-90" />
                       </div>
                       <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Source Tank Reference</label>
                          <input type="text" value={form.linkedTankId} onChange={e => setForm({...form, linkedTankId: e.target.value})} disabled={isApproved} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-black shadow-sm outline-none" placeholder="TANK-00X" />
                       </div>
                    </div>

                    <div className="space-y-6">
                       <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-4">
                          <CheckCircle2 size={14} className="text-sky-600" /> Personnel
                       </h3>
                       <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Lead Operator Name</label>
                          <input type="text" value={form.operatorName} onChange={e => setForm({...form, operatorName: e.target.value})} disabled={isApproved} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-black shadow-sm outline-none text-sky-800" />
                       </div>
                       <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Operational Remarks</label>
                          <input type="text" value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} disabled={isApproved} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold shadow-sm outline-none" placeholder="Normal Op..." />
                       </div>
                    </div>
                 </div>

                 {!isApproved && (
                   <div className="flex justify-end gap-4 border-t border-slate-100 pt-8">
                      <button onClick={() => setView('list')} className="px-8 py-3 rounded-xl text-xs font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all">Discard</button>
                      <button onClick={handleSubmit} className="bg-sky-600 text-white px-10 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-sky-100 hover:bg-sky-700 transition-all">Post Record</button>
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
      <div className="p-8 pb-4 flex justify-between items-end">
        <div>
           <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Gas Production Registry</h2>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[2px] mt-1">Atmospheric Separation Logs</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search By ID / Operator..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all w-64 shadow-sm"
              />
           </div>
           <button onClick={handleNew} className="bg-slate-800 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-900 transition-all flex items-center gap-2 shadow-lg uppercase tracking-widest">
             <Plus size={14} /> New Log
           </button>
        </div>
      </div>

      <div className="flex-1 p-8 pt-4 overflow-hidden">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
           <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white text-[10px] font-black uppercase tracking-[2px]">
                  <th className="p-5 pl-8 border-r border-slate-700/50">Production ID</th>
                  <th className="p-5 border-r border-slate-700/50">Volume (Qty)</th>
                  <th className="p-5 border-r border-slate-700/50">Purity</th>
                  <th className="p-5 border-r border-slate-700/50">Operator</th>
                  <th className="p-5 text-right pr-12">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEntries.map(e => (
                  <tr key={e.production_id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-5 pl-8 font-mono text-sky-700 font-black">
                       <button onClick={() => handleEdit(e)} className="hover:underline underline-offset-4 decoration-sky-300">
                         {e.production_id}
                       </button>
                    </td>
                    <td className="p-5 text-slate-600 font-bold">{e.quantity_produced} {e.quantity_unit}</td>
                    <td className="p-5 text-sky-600 font-black">{e.purity_level}%</td>
                    <td className="p-5 text-slate-500 font-medium">{e.operator_name}</td>
                    <td className="p-5 text-right pr-12">
                       <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded border shadow-sm ${
                         e.approval_status === 'Approved' ? 'bg-sky-50 text-sky-700 border-sky-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                       }`}>
                         {e.approval_status}
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
