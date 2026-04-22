import React, { useState } from 'react';
import { useSharedState } from '../context/SharedStateContext';
import { Search, Edit3, ArrowLeft, Filter, Download, Package, Layers, Clipboard } from 'lucide-react';

export default function ExecutionEntry() {
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
           <h2 className="text-2xl font-black text-slate-800 tracking-tight">PROCESS EXECUTION ENTRY</h2>
           <div className="flex items-center gap-4 mt-1">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-[2px]">Batch: <span className="text-sky-600">{activeBatch.batchNumber}</span></p>
              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase text-white ${activeBatch.isPosted ? 'bg-sky-600' : 'bg-rose-600'}`}>
                {activeBatch.status}
              </span>
           </div>
        </div>

        <div className="flex-1 p-8 pt-4 space-y-6">
           {/* Header Info */}
           <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm grid grid-cols-4 gap-8">
              <div className="flex flex-col">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Product</span>
                 <span className="text-sm font-black text-slate-800">{activeBatch.productType}</span>
              </div>
              <div className="flex flex-col">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Inventory</span>
                 <span className="text-sm font-black text-slate-800">{items.length} Units</span>
              </div>
              <div className="flex flex-col">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Execution Progress</span>
                 <span className="text-sm font-black text-sky-600">{completedCount} / {items.length}</span>
              </div>
              <div className="flex flex-col items-end justify-center">
                 <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-sky-600 h-full transition-all duration-500" style={{ width: `${(completedCount / items.length) * 100}%` }}></div>
                 </div>
              </div>
           </div>

           {/* Items Table */}
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-white text-[10px] font-black uppercase tracking-[2px]">
                    <th className="p-5 pl-8 border-r border-slate-700/50 w-1/4">Serial Number</th>
                    <th className="p-5 border-r border-slate-700/50 w-1/4">Input Value</th>
                    <th className="p-5 border-r border-slate-700/50 w-1/4">Output Value</th>
                    <th className="p-5 text-right pr-8 w-1/4">Action</th>
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
      <div className="p-8 pb-4 flex justify-between items-end">
        <div>
           <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Process Execution Registry</h2>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[2px] mt-1">Real-time Filling Monitoring</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search Active Batch..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all w-64 shadow-sm"
              />
           </div>
        </div>
      </div>

      <div className="flex-1 p-8 pt-4 overflow-hidden">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
           <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white text-[10px] font-black uppercase tracking-[2px]">
                  <th className="p-5 pl-8 border-r border-slate-700/50">Batch ID</th>
                  <th className="p-5 border-r border-slate-700/50">Progress</th>
                  <th className="p-5 border-r border-slate-700/50">Work Station</th>
                  <th className="p-5 border-r border-slate-700/50 text-center">Status</th>
                  <th className="p-5 text-right pr-12">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBatches.map(batch => {
                  const completed = batch.items.filter(i => i.itemStatus === 'Produced').length;
                  const total = batch.items.length;
                  const progress = total > 0 ? (completed / total) * 100 : 0;

                  return (
                    <tr key={batch.batchNumber} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-5 pl-8 font-mono text-sky-700 font-black">
                        <button onClick={() => handleExecutionInitiate(batch)} className="hover:underline underline-offset-4 decoration-sky-300">
                          {batch.batchNumber}
                        </button>
                      </td>
                      <td className="p-5">
                          <div className="flex items-center gap-3">
                             <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-sky-600 h-full" style={{ width: `${progress}%` }}></div>
                             </div>
                             <span className="text-[10px] font-black text-slate-400">{Math.round(progress)}%</span>
                          </div>
                      </td>
                      <td className="p-5 text-slate-600 font-bold">{batch.fillingStation || 'STN-?'}</td>
                      <td className="p-5 text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-[9px] font-black text-white ${batch.isPosted ? 'bg-sky-600' : 'bg-rose-600'}`}>
                          {batch.statusTab}
                        </span>
                      </td>
                      <td className="p-5 text-right pr-8">
                        <button 
                          onClick={() => handleExecutionInitiate(batch)}
                          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-sky-600 hover:text-white transition-all shadow-sm"
                        >
                          Execute
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

function ExecutionRow({ item, batchNum, isBatchPosted, updateFn }) {
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
           {item.serialNumber}
        </div>
      </td>
      <td className="p-5">
        <input 
          type="number" value={inputVal} onChange={e => setInputVal(e.target.value)}
          disabled={!isEditing || isLocked}
          className={`w-full bg-white border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all ${(!isEditing || isLocked) ? 'bg-slate-50 text-slate-400' : ''}`}
          placeholder="Tare Wait"
        />
      </td>
      <td className="p-5">
        <input 
          type="number" value={outputVal} onChange={e => setOutputVal(e.target.value)}
          disabled={!isEditing || isLocked}
          className={`w-full bg-white border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all ${(!isEditing || isLocked) ? 'bg-slate-50 text-slate-400' : ''}`}
          placeholder="Gross Wait"
        />
      </td>
      <td className="p-5 text-right pr-8">
        {!isEditing ? (
           <button 
             onClick={() => !isLocked && setIsEditing(true)}
             disabled={isLocked}
             className={`p-2 rounded-lg transition-all ${isLocked ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-sky-600 hover:bg-sky-50'}`}
           >
             <Edit3 size={18} />
           </button>
        ) : (
           <button 
             onClick={handleSubmit}
             disabled={isLocked || inputVal === '' || outputVal === ''}
             className="bg-sky-600 text-white px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-sky-700 transition-all shadow-md disabled:bg-slate-200 disabled:text-slate-400"
           >
             Save
           </button>
        )}
      </td>
    </tr>
  );
}
