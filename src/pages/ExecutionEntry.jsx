import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSharedState } from '../context/SharedStateContext';
import { Search, Edit3, ArrowLeft, Filter, Download, Package, Layers, Clipboard, LayoutGrid } from 'lucide-react';

export default function ExecutionEntry() {
  const navigate = useNavigate();
  const { batches, updateItemInBatch } = useSharedState();
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [activeBatch, setBatchForExecution] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleExecutionInitiate = (batch) => {
    setBatchForExecution(batch);
    setView('form');
  };

  const filteredBatches = batches.filter(b => 
    b.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (view === 'form' && activeBatch) {
    const items = activeBatch.items;
    const completedCount = items.filter(i => i.itemStatus === 'Produced').length;

    return (
      <div className="flex flex-col h-full bg-slate-50 w-full animate-in fade-in duration-300 font-sans">
        <div className="p-8 pb-4">
           <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-xs uppercase tracking-widest mb-4 transition-colors">
             <ArrowLeft size={14} /> Back to Process Registry
           </button>
           <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Process Execution Entry</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-[2px] mt-1">Batch: <span className="text-sky-600 font-black underline decoration-sky-300 underline-offset-4">{activeBatch.batchNumber}</span></p>
              </div>
              <div className="flex gap-3">
                 <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${activeBatch.isPosted ? 'bg-sky-50 text-sky-700 border-sky-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                    <div className={`h-2 w-2 rounded-full ${activeBatch.isPosted ? 'bg-sky-600' : 'bg-rose-600'}`}></div>
                    {activeBatch.status}
                 </div>
              </div>
           </div>
        </div>

        <div className="flex-1 p-8 pt-4 space-y-6 overflow-y-auto">
           {/* Header Info */}
           <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm grid grid-cols-4 gap-8 max-w-6xl mx-auto">
              <div className="flex flex-col">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target Product</span>
                 <span className="text-sm font-black text-slate-800 uppercase">{activeBatch.productType}</span>
              </div>
              <div className="flex flex-col">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Inventory</span>
                 <span className="text-sm font-black text-slate-800">{items.length} Units</span>
              </div>
              <div className="flex flex-col">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Execution Progress</span>
                 <span className="text-sm font-black text-sky-600">{completedCount} / {items.length} Filled</span>
              </div>
              <div className="flex flex-col items-end justify-center">
                 <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-sky-600 h-full transition-all duration-500" style={{ width: `${(completedCount / items.length) * 100}%` }}></div>
                 </div>
              </div>
           </div>

           {/* Items Table */}
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 max-w-6xl mx-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-white text-[10px] font-black uppercase tracking-[2px]">
                    <th className="p-5 pl-8 border-r border-slate-700/50 w-1/4">Serial Number</th>
                    <th className="p-5 border-r border-slate-700/50 w-1/4">Input Value (Kg)</th>
                    <th className="p-5 border-r border-slate-700/50 w-1/4">Output Value (Kg)</th>
                    <th className="p-5 text-center w-1/4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-20 text-center text-slate-400 font-bold italic uppercase tracking-widest">No Cylinders Assigned to this Batch</td>
                    </tr>
                  ) : items.map(item => (
                    <ExecutionRow 
                      key={item.serialNumber} 
                      item={item} 
                      batchNum={activeBatch.batchNumber} 
                      isBatchPosted={activeBatch.isPosted}
                      updateFn={updateItemInBatch} 
                      onLink={() => navigate('/summary')}
                    />
                  ))}
                </tbody>
              </table>
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
              <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase leading-none">Process Execution Registry</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[2px] mt-1.5">Real-time Filling Monitoring</p>
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
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-white">
        <div className="neat-table-container border-t-0">
           <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="neat-table-header">
                  <th className="p-4 pl-8 w-[25%]">Batch ID</th>
                  <th className="p-4 w-[35%]">Progress</th>
                  <th className="p-4 w-[15%] text-center">Status</th>
                  <th className="p-4 w-[12%] text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBatches.map(batch => {
                  const completed = batch.items.filter(i => i.itemStatus === 'Produced').length;
                  const total = batch.items.length;
                  const progress = total > 0 ? (completed / total) * 100 : 0;

                  return (
                    <tr key={batch.batchNumber} className="neat-table-row">
                      <td className="p-4 pl-8">
                         <span onClick={() => navigate('/summary')} className="neat-link">{batch.batchNumber}</span>
                      </td>
                      <td className="p-4">
                          <div className="flex items-center gap-3">
                             <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-sky-600 h-full" style={{ width: `${progress}%` }}></div>
                             </div>
                             <span className="text-[10px] font-black text-slate-400">{Math.round(progress)}% COMPLETE</span>
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
                          onClick={() => handleExecutionInitiate(batch)}
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
                  );
                })}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}

function ExecutionRow({ item, batchNum, isBatchPosted, updateFn, onLink }) {
  const [inputVal, setInputVal] = useState(item.inputValue || '');
  const [outputVal, setOutputVal] = useState(item.outputValue || '');
  const [isEditing, setIsEditing] = useState(item.itemStatus !== 'Produced');

  const handleSubmit = async () => {
    if (inputVal === '' || outputVal === '') return;
    try {
      await updateFn(batchNum, item.serialNumber, {
        inputValue: Number(inputVal),
        outputValue: Number(outputVal),
        netOutput: Number(outputVal) - Number(inputVal),
        itemStatus: 'Produced',
        productionDate: new Date().toISOString().split('T')[0]
      });
      setIsEditing(false);
    } catch (err) {
      alert("Execution Failed");
    }
  };

  const isLocked = isBatchPosted;

  return (
    <tr className={`hover:bg-slate-50/50 transition-colors ${!isEditing ? 'bg-sky-50/10' : ''}`}>
      <td className="p-5 pl-8 font-mono text-slate-700 font-bold">
        <div className="flex items-center gap-2">
           <Package size={14} className={item.itemStatus === 'Produced' ? 'text-sky-600' : 'text-slate-300'} />
           <span onClick={onLink} className="neat-link font-mono">{item.serialNumber}</span>
        </div>
      </td>
      <td className="p-5">
        <input 
          type="number" value={inputVal} onChange={e => setInputVal(e.target.value)}
          disabled={!isEditing || isLocked}
          className={`w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-black focus:ring-2 focus:ring-sky-500 outline-none transition-all ${(!isEditing || isLocked) ? 'bg-slate-50 text-slate-400 font-mono' : 'text-sky-700 border-sky-100 shadow-sm'}`}
          placeholder="Tare Weight"
        />
      </td>
      <td className="p-5">
        <input 
          type="number" value={outputVal} onChange={e => setOutputVal(e.target.value)}
          disabled={!isEditing || isLocked}
          className={`w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-black focus:ring-2 focus:ring-sky-500 outline-none transition-all ${(!isEditing || isLocked) ? 'bg-slate-50 text-slate-400 font-mono' : 'text-sky-700 border-sky-100 shadow-sm'}`}
          placeholder="Gross Weight"
        />
      </td>
      <td className="p-5 text-center">
        {!isEditing ? (
           <button 
             onClick={() => !isLocked && setIsEditing(true)}
             disabled={isLocked}
             className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
               isLocked 
               ? 'text-slate-300 bg-slate-50 cursor-not-allowed opacity-50' 
               : 'text-slate-400 bg-slate-50 hover:bg-sky-600 hover:text-white border border-slate-200 shadow-sm'
             }`}
           >
             <Edit3 size={12} />
             <span>Edit</span>
           </button>
        ) : (
           <button 
             onClick={handleSubmit}
             disabled={isLocked || inputVal === '' || outputVal === ''}
             className="bg-sky-600 text-white px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-sky-700 transition-all shadow-lg shadow-sky-100 disabled:bg-slate-200 disabled:text-slate-400"
           >
             Save
           </button>
        )}
      </td>
    </tr>
  );
}
