import React, { useState } from 'react';
import { useSharedState } from '../context/SharedStateContext';
import { Search, ArrowLeft, RefreshCcw, CheckCircle2, Package, Layers } from 'lucide-react';

export default function BatchSummary() {
  const { batches, completeBatch } = useSharedState();
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [activeBatch, setBatchSummary] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSummaryView = (batch) => {
    setBatchSummary(batch);
    setView('form');
  };

  const handlePostBatch = async () => {
    if (!activeBatch) return;
    try {
      await completeBatch(activeBatch.batchNumber);
      setView('list');
    } catch (err) {
      alert("Batch Finalization Failed");
    }
  };

  const filteredBatches = batches.filter(b => 
    b.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (view === 'form' && activeBatch) {
    const items = activeBatch.items;
    const produced = items.filter(i => i.itemStatus === 'Produced').length;
    const qcPassed = items.filter(i => i.qcStatus === 'QC Passed').length;
    const sealed = items.filter(i => i.itemStatus === 'Sealed' || i.itemStatus === 'Tagged' || i.itemStatus === 'In Inventory').length;

    return (
      <div className="flex flex-col h-full bg-slate-50 w-full animate-in fade-in duration-300 font-sans">
        <div className="p-8 pb-4 flex justify-between items-start">
           <div>
              <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-xs uppercase tracking-widest mb-4 transition-colors">
                <ArrowLeft size={14} /> Back to Registry
              </button>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Batch Status & Finalization</h2>
           </div>
           {!activeBatch.isPosted && (
             <button 
               onClick={handlePostBatch}
               className="bg-sky-600 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-sky-700 transition-all shadow-xl shadow-sky-100"
             >
                Post Final Batch
             </button>
           )}
        </div>

        <div className="flex-1 p-8 pt-4 space-y-6">
           <div className="grid grid-cols-4 gap-6">
              <SummaryCard label="Total Units" value={items.length} icon={Layers} color="slate" />
              <SummaryCard label="Produced" value={produced} icon={Package} color="sky" />
              <SummaryCard label="QC Approved" value={qcPassed} icon={CheckCircle2} color="sky" />
              <SummaryCard label="Locked & Sealed" value={sealed} icon={RefreshCcw} color="slate" />
           </div>

           <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-8">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-[2px] mb-8 pb-4 border-b border-slate-100">Cylinder Lifecycle Traceability</h3>
              <div className="space-y-4">
                 {items.map((item, idx) => (
                   <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-sky-200 transition-colors">
                      <div className="flex items-center gap-4">
                         <div className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-black text-[10px] text-slate-400">{idx + 1}</div>
                         <div>
                            <div className="text-sm font-mono font-black text-slate-700">{item.serialNumber}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.itemStatus}</div>
                         </div>
                      </div>
                      <div className="flex items-center gap-8">
                         <div className="text-center">
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">QC Status</div>
                            <div className={`text-xs font-black ${item.qcStatus === 'QC Passed' ? 'text-sky-600' : 'text-slate-400'}`}>{item.qcStatus || 'N/A'}</div>
                         </div>
                         <div className="text-center">
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Net Output</div>
                            <div className="text-xs font-black text-slate-700">{item.netOutput?.toFixed(2) || '0.00'} Kg</div>
                         </div>
                      </div>
                   </div>
                 ))}
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
           <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Batch Summary Registry</h2>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[2px] mt-1">Lifecycle Approval Hub</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search By Batch ID..."
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
                  <th className="p-5 border-r border-slate-700/50">Completion</th>
                  <th className="p-5 border-r border-slate-700/50 text-center">Final Status</th>
                  <th className="p-5 text-right pr-12">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBatches.map(batch => {
                  const items = batch.items;
                  const produced = items.filter(i => i.itemStatus === 'Produced').length;
                  const total = items.length;
                  const progress = total > 0 ? (produced / total) * 100 : 0;

                  return (
                    <tr key={batch.batchNumber} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-5 pl-8 font-mono text-sky-700 font-black">
                        <button onClick={() => handleSummaryView(batch)} className="hover:underline underline-offset-4 decoration-sky-300">
                          {batch.batchNumber}
                        </button>
                      </td>
                      <td className="p-5">
                          <div className="flex items-center gap-3">
                             <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-sky-600 h-full" style={{ width: `${progress}%` }}></div>
                             </div>
                             <span className="text-[10px] font-black text-slate-400">{Math.round(progress)}% COMPLETE</span>
                          </div>
                      </td>
                      <td className="p-5 text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-[9px] font-black text-white ${batch.isPosted ? 'bg-sky-600' : 'bg-rose-600'}`}>
                          {batch.statusTab}
                        </span>
                      </td>
                      <td className="p-5 text-right pr-8">
                        <button 
                          onClick={() => handleSummaryView(batch)}
                          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-sky-600 hover:text-white transition-all shadow-sm"
                        >
                          Details
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

function SummaryCard({ label, value, icon: Icon, color }) {
  const colorClasses = {
    sky: 'bg-sky-50 text-sky-600 border-sky-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-100'
  };
  return (
    <div className={`bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-6`}>
      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${colorClasses[color]}`}>
        <Icon size={28} />
      </div>
      <div>
        <div className="text-3xl font-black text-slate-800">{value}</div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</div>
      </div>
    </div>
  );
}
