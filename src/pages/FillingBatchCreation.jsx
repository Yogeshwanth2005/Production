import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSharedState } from '../context/SharedStateContext';
import { Search, Plus, Edit3, ArrowLeft, Filter, Download, LayoutGrid } from 'lucide-react';

export default function FillingBatchCreation() {
  const navigate = useNavigate();
  const { productConfig, batches, fetchBatches } = useSharedState();
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [editingBatch, setEditingBatch] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState({
    batchNumber: '',
    date: new Date().toISOString().split('T')[0],
    productType: '',
    gasType: 'Oxygen',
    fillingStation: '',
    tankId: '',
    operatorName: '',
    shift: 'Morning',
  });

  // Auto-generate ID when "New" is clicked
  useEffect(() => {
    if (view === 'form' && !editingBatch) {
      const prefix = form.gasType ? form.gasType.substring(0, 3).toUpperCase() : 'GAS';
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
      productType: Object.keys(productConfig)[0] || '',
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

  const handleSubmit = async (status = 'Saved') => {
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
          status: status,
          is_posted: status === 'Posted'
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
    const isPosted = editingBatch?.isPosted;
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
             Process ID Registry: <span className="text-sky-600 font-black underline decoration-sky-300 underline-offset-4">{form.batchNumber}</span>
           </p>
        </div>

        <div className="flex-1 p-8 pt-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full max-w-4xl mx-auto">
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
                  <input type="date" value={form.date} onChange={e => handleChange('date', e.target.value)} disabled={isPosted}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all disabled:bg-slate-50" />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Product Category *</label>
                  <select value={form.productType} onChange={e => handleChange('productType', e.target.value)} disabled={isPosted}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all cursor-pointer disabled:bg-slate-50">
                    {Object.entries(productConfig).map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.productName} ({key})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Specific Gas Type *</label>
                  <select value={form.gasType} onChange={e => handleChange('gasType', e.target.value)} disabled={isPosted}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all cursor-pointer disabled:bg-slate-50">
                    <option>Oxygen</option>
                    <option>Nitrogen</option>
                    <option>Argon</option>
                    <option>Hydrogen</option>
                    <option>Acetylene</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Filling Station ID *</label>
                  <input type="text" value={form.fillingStation} onChange={e => handleChange('fillingStation', e.target.value)} disabled={isPosted}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all disabled:bg-slate-50"
                    placeholder="e.g. STN-A1" />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Source Tank ID</label>
                  <input type="text" value={form.tankId} onChange={e => handleChange('tankId', e.target.value)} disabled={isPosted}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all disabled:bg-slate-50"
                    placeholder="e.g. TANK-900" />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Operator Authority *</label>
                  <input type="text" value={form.operatorName} onChange={e => handleChange('operatorName', e.target.value)} disabled={isPosted}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all disabled:bg-slate-50"
                    placeholder="Signature Name" />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Operational Shift *</label>
                  <select value={form.shift} onChange={e => handleChange('shift', e.target.value)} disabled={isPosted}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all cursor-pointer disabled:bg-slate-50">
                    <option>Morning</option>
                    <option>Evening</option>
                    <option>Night</option>
                  </select>
                </div>
              </div>

              {!isPosted && (
                <div className="mt-12 pt-8 border-t border-slate-100 flex justify-end gap-4">
                  <button 
                    onClick={() => setView('list')}
                    className="px-8 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors uppercase tracking-widest"
                  >
                    Discard
                  </button>
                  <button 
                    onClick={() => handleSubmit('Saved')}
                    className="border border-slate-200 text-slate-700 px-10 py-3 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-slate-50 transition-all"
                  >
                    Save Draft
                  </button>
                  <button 
                    onClick={() => handleSubmit('Posted')}
                    className="bg-sky-600 hover:bg-sky-700 text-white px-10 py-3 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-sky-200 transform hover:-translate-y-0.5 uppercase tracking-widest"
                  >
                    Post Batch
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 w-full font-sans animate-in fade-in duration-300">
      <div className="p-6 pb-6 flex justify-between items-center bg-white border-b border-slate-200">
        <div className="flex items-center gap-4">
           <div className="bg-slate-100 p-2 rounded-lg">
              <LayoutGrid size={20} className="text-slate-600" />
           </div>
           <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase leading-none">Batch Registry</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[2px] mt-1.5">Central Production Logs</p>
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
                  <th className="p-4 pl-8 w-[25%]">Batch Number</th>
                  <th className="p-4 w-[25%]">Product / Category</th>
                  <th className="p-4 w-[12%] text-center">Unit Count</th>
                  <th className="p-4 w-[20%]">Operator Authority</th>
                  <th className="p-4 w-[10%] text-center">Status</th>
                  <th className="p-4 w-[8%] text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBatches.length > 0 ? filteredBatches.map(batch => (
                  <tr key={batch.batchNumber} className="neat-table-row">
                    <td className="p-4 pl-8">
                       <span onClick={() => navigate('/summary')} className="neat-link">{batch.batchNumber}</span>
                    </td>
                    <td className="p-4">
                       <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-700">{batch.productType}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{batch.gasType || 'Oxygen'} / {batch.shift || 'Morning'}</span>
                       </div>
                    </td>
                    <td className="p-4 text-center">
                       <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-black border border-slate-200/50">
                          {batch.items?.length || 0}
                       </span>
                    </td>
                    <td className="p-4">
                       <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 border border-slate-200">
                             {batch.operatorName?.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-slate-600 hover:text-sky-600 cursor-pointer">{batch.operatorName || '—'}</span>
                       </div>
                    </td>
                    <td className="p-4 text-center">
                       <span className={`inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border shadow-sm ${
                         batch.isPosted ? 'bg-sky-50 text-sky-700 border-sky-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                       }`}>
                         <div className={`h-1.5 w-1.5 rounded-full ${batch.isPosted ? 'bg-sky-600' : 'bg-rose-600'}`}></div>
                         {batch.status}
                       </span>
                    </td>
                    <td className="p-4 text-center">
                       <button 
                         onClick={() => handleEdit(batch)}
                         disabled={batch.isPosted}
                         className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                            batch.isPosted 
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
                    <td colSpan="6" className="p-20 text-center">
                       <div className="flex flex-col items-center gap-2 opacity-30">
                          <Search size={40} />
                          <span className="text-sm font-black uppercase tracking-widest">No matching batches found</span>
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
