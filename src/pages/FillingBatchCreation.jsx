import React, { useState, useEffect } from 'react';
import { useSharedState } from '../context/SharedStateContext';
import { Search, Plus, Edit3, ArrowLeft, Filter, Download } from 'lucide-react';

export default function FillingBatchCreation() {
  const { productConfig, batches, fetchBatches } = useSharedState();
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [editingBatch, setEditingBatch] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState({
    batchNumber: '',
    date: new Date().toISOString().split('T')[0],
    productType: Object.keys(productConfig)[0],
    gasType: 'Oxygen',
    fillingStation: '',
    tankId: '',
    operatorName: '',
    shift: 'Morning',
  });

  // Auto-generate ID when "New" is clicked
  useEffect(() => {
    if (view === 'form' && !editingBatch) {
      const prefix = form.gasType.substring(0, 3).toUpperCase();
      const num = Math.floor(1000 + Math.random() * 9000);
      const year = new Date().getFullYear();
      setForm(prev => ({ ...prev, batchNumber: `BATCH-${year}-${prefix}-${num}` }));
    }
  }, [view, editingBatch, form.gasType]);

  const handleNew = () => {
    setEditingBatch(null);
    setForm({
      batchNumber: '',
      date: new Date().toISOString().split('T')[0],
      productType: Object.keys(productConfig)[0],
      gasType: 'Oxygen',
      fillingStation: '',
      tankId: '',
      operatorName: '',
      shift: 'Morning',
    });
    setView('form');
  };

  const handleEdit = (batch) => {
    setEditingBatch(batch);
    setForm({
      batchNumber: batch.batchNumber,
      date: batch.date || new Date().toISOString().split('T')[0],
      productType: batch.productType,
      gasType: batch.gasType || 'Oxygen',
      fillingStation: batch.fillingStation || '',
      tankId: batch.tankId || '',
      operatorName: batch.operatorName || '',
      shift: batch.shift || 'Morning',
    });
    setView('form');
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.batchNumber || !form.fillingStation || !form.operatorName) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const url = editingBatch ? `/api/batches/${editingBatch.batchNumber}` : '/api/batches';
      const method = editingBatch ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batch_number: form.batchNumber,
          product_type: form.productType,
          batch_date: form.date,
          gas_type: form.gasType,
          filling_station: form.fillingStation,
          tank_id: form.tankId,
          operator_name: form.operatorName,
          shift: form.shift,
        })
      });

      if (!res.ok) throw new Error('API Error');

      await fetchBatches();
      setView('list');
    } catch (err) {
      alert('Failed to save batch data.');
    }
  };

  const filteredBatches = batches.filter(b => 
    b.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.productType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (view === 'form') {
    return (
      <div className="flex flex-col h-full bg-slate-50 w-full animate-in fade-in duration-300">
        <div className="p-8 pb-4">
           <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-xs uppercase tracking-widest mb-4 transition-colors">
             <ArrowLeft size={14} /> Back to Batch List
           </button>
           <h2 className="text-2xl font-black text-slate-800 tracking-tight">
             {editingBatch ? 'EDIT' : 'CREATE'} FILLING BATCH
           </h2>
           <p className="text-xs text-slate-400 font-bold uppercase tracking-[2px] mt-1">
             Process ID Registry
           </p>
        </div>

        <div className="flex-1 p-8 pt-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full max-w-4xl">
            <div className="h-1.5 bg-sky-600 w-full"></div>
            <div className="p-8">
              <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Batch Number *</label>
                  <input type="text" value={form.batchNumber} disabled
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-mono font-bold text-sky-800 cursor-not-allowed shadow-inner" />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Registration Date *</label>
                  <input type="date" value={form.date} onChange={e => handleChange('date', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all" />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Product Category *</label>
                  <select value={form.productType} onChange={e => handleChange('productType', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all cursor-pointer">
                    {Object.entries(productConfig).map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.productName} ({key})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Specific Gas Type *</label>
                  <select value={form.gasType} onChange={e => handleChange('gasType', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all cursor-pointer">
                    <option>Oxygen</option>
                    <option>Nitrogen</option>
                    <option>Argon</option>
                    <option>Hydrogen</option>
                    <option>Acetylene</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Filling Station ID *</label>
                  <input type="text" value={form.fillingStation} onChange={e => handleChange('fillingStation', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all"
                    placeholder="e.g. STN-A1" />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Source Tank ID</label>
                  <input type="text" value={form.tankId} onChange={e => handleChange('tankId', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all"
                    placeholder="e.g. TANK-900" />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Operator Authority *</label>
                  <input type="text" value={form.operatorName} onChange={e => handleChange('operatorName', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all"
                    placeholder="Signature Name" />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Operational Shift *</label>
                  <select value={form.shift} onChange={e => handleChange('shift', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all cursor-pointer">
                    <option>Morning</option>
                    <option>Evening</option>
                    <option>Night</option>
                  </select>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-slate-100 flex justify-end gap-4">
                <button 
                  onClick={() => setView('list')}
                  className="px-8 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmit}
                  className="bg-sky-600 hover:bg-sky-700 text-white px-10 py-3 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-sky-200 transform hover:-translate-y-0.5 uppercase tracking-widest"
                >
                  {editingBatch ? 'Update Record' : 'Post Batch'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 w-full font-sans animate-in fade-in duration-300">
      {/* Header / Filter Bar */}
      <div className="p-8 pb-4 flex justify-between items-end">
        <div>
           <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Batch Registry</h2>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[2px] mt-1">Central Production Logs</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search By Batch #"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all w-64 shadow-sm"
              />
           </div>
           <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm uppercase tracking-widest">
             <Filter size={14} /> Filter
           </button>
           <button className="bg-slate-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm uppercase tracking-widest">
             <Download size={14} /> Export
           </button>
           <button onClick={handleNew} className="bg-sky-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-sky-700 transition-all flex items-center gap-2 shadow-lg shadow-sky-100 uppercase tracking-widest">
             <Plus size={14} /> New Record
           </button>
        </div>
      </div>

      {/* Status Legend */}
      <div className="px-8 py-2 flex items-center gap-6">
         <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-rose-600 text-white flex items-center justify-center text-[9px] font-black">S</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saved (Draft)</span>
         </div>
         <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-sky-600 text-white flex items-center justify-center text-[9px] font-black">P</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Posted (Final)</span>
         </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 p-8 pt-4 overflow-hidden">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white text-[10px] font-black uppercase tracking-[2px]">
                  <th className="p-5 pl-8 border-r border-slate-700/50">Batch Number</th>
                  <th className="p-5 border-r border-slate-700/50">Product Type</th>
                  <th className="p-5 border-r border-slate-700/50 text-center">Cylinders</th>
                  <th className="p-5 border-r border-slate-700/50">Operator</th>
                  <th className="p-5 border-r border-slate-700/50 text-center">Status</th>
                  <th className="p-5 text-right pr-8">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredBatches.length > 0 ? filteredBatches.map(batch => (
                  <tr key={batch.batchNumber} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-5 pl-8 font-mono text-sky-700 font-black">
                      <button className="hover:underline underline-offset-4 decoration-sky-300">
                        {batch.batchNumber}
                      </button>
                    </td>
                    <td className="p-5 text-slate-600 font-bold">{batch.productType}</td>
                    <td className="p-5 text-center">
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-black border border-slate-200/50">
                        {batch.items?.length || 0}
                      </span>
                    </td>
                    <td className="p-5 text-slate-600 font-medium">
                       {batch.operatorName || '—'}
                    </td>
                    <td className="p-5 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-black text-white shadow-sm ${
                        batch.isPosted ? 'bg-sky-600' : 'bg-rose-600'
                      }`}>
                        {batch.statusTab}
                      </span>
                    </td>
                    <td className="p-5 text-right pr-8">
                       <button 
                         onClick={() => handleEdit(batch)}
                         disabled={batch.isPosted}
                         className={`p-2 rounded-lg transition-all ${
                            batch.isPosted 
                            ? 'text-slate-300 cursor-not-allowed bg-slate-50' 
                            : 'text-slate-400 hover:text-sky-600 hover:bg-sky-50'
                         }`}
                       >
                         <Edit3 size={18} />
                       </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="p-20 text-center text-slate-400 italic font-bold bg-slate-50/30">
                      NO RECORDS DETECTED IN REGISTRY
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
