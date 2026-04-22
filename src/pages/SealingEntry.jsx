import React, { useState } from 'react';
import { useSharedState } from '../context/SharedStateContext';
import { Search, Edit3, ArrowLeft, ClipboardCheck, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function SealingEntry() {
  const { batches, updateItemInBatch } = useSharedState();
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [activeBatch, setBatchForSealing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSealingInitiate = (batch) => {
    setBatchForSealing(batch);
    setView('form');
  };

  const filteredBatches = batches.filter(b => 
    b.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (view === 'form' && activeBatch) {
    const itemsToSeal = activeBatch.items.filter(i => 
      i.qcStatus === 'QC Passed' && (!i.itemStatus || i.itemStatus === 'Produced' || i.itemStatus === 'Sealed')
    );
    const sealedCount = activeBatch.items.filter(i => i.itemStatus === 'Sealed' || i.itemStatus === 'Tagged' || i.itemStatus === 'In Inventory').length;

    return (
      <div className="flex flex-col h-full bg-slate-50 w-full animate-in fade-in duration-300 font-sans">
        <div className="p-8 pb-4">
           <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-xs uppercase tracking-widest mb-4 transition-colors">
             <ArrowLeft size={14} /> Back to Sealing Registry
           </button>
           <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Security Sealing Entry</h2>
           <p className="text-xs text-slate-400 font-bold uppercase tracking-[2px] mt-1">Batch: <span className="text-sky-600">{activeBatch.batchNumber}</span></p>
        </div>

        <div className="flex-1 p-8 pt-4 space-y-6">
           <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex justify-between items-center">
              <div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seal Progress</span>
                 <div className="text-xl font-black text-slate-800 mt-1">{sealedCount} / {activeBatch.items.filter(i => i.qcStatus === 'QC Passed').length} Units Secured</div>
              </div>
              <div className="flex items-center gap-4">
                 <ShieldAlert size={20} className="text-sky-600 animate-pulse" />
                 <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-100">Integrity Protocol Active</span>
              </div>
           </div>

           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-white text-[10px] font-black uppercase tracking-[2px]">
                    <th className="p-5 pl-8 border-r border-slate-700/50">Serial Number</th>
                    <th className="p-5 border-r border-slate-700/50">Seal ID Number</th>
                    <th className="p-5 border-r border-slate-700/50">Seal Classification</th>
                    <th className="p-5 text-right pr-8">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {itemsToSeal.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-20 text-center text-slate-400 font-bold italic uppercase tracking-widest">No QC-Passed Items Available for Sealing</td>
                    </tr>
                  ) : itemsToSeal.map(item => (
                    <SealingRow 
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
           <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Security Sealing Registry</h2>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[2px] mt-1">Tamper-Evident Logs</p>
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
                  <th className="p-5 border-r border-slate-700/50">QC Passed Units</th>
                  <th className="p-5 border-r border-slate-700/50">Sealing Status</th>
                  <th className="p-5 text-right pr-12">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBatches.map(batch => {
                  const qcPassed = batch.items.filter(i => i.qcStatus === 'QC Passed').length;
                  const sealed = batch.items.filter(i => i.itemStatus === 'Sealed' || i.itemStatus === 'Tagged' || i.itemStatus === 'In Inventory').length;
                  const progress = qcPassed > 0 ? (sealed / qcPassed) * 100 : 0;

                  return (
                    <tr key={batch.batchNumber} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-5 pl-8 font-mono text-sky-700 font-black">
                        <button onClick={() => handleSealingInitiate(batch)} className="hover:underline underline-offset-4 decoration-sky-300">
                          {batch.batchNumber}
                        </button>
                      </td>
                      <td className="p-5 text-slate-600 font-bold">{qcPassed} Units</td>
                      <td className="p-5">
                          <div className="flex items-center gap-3">
                             <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-sky-600 h-full" style={{ width: `${progress}%` }}></div>
                             </div>
                             <span className="text-[10px] font-black text-slate-400">{Math.round(progress)}% SECURED</span>
                          </div>
                      </td>
                      <td className="p-5 text-right pr-8">
                        <button 
                          onClick={() => handleSealingInitiate(batch)}
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

function SealingRow({ item, batchNum, isBatchPosted, updateFn }) {
  const [sealNumber, setSealNumber] = useState(item.sealNumber || '');
  const [sealType, setSealType] = useState(item.sealType || 'Plastic Seal');
  const [isEditing, setIsEditing] = useState(!item.sealNumber);

  // Auto-generate Seal Number on Edit start if empty
  const handleEditInit = () => {
    if (!sealNumber) {
      setSealNumber(`SN-${Date.now().toString().slice(-6)}`);
    }
    setIsEditing(true);
  };

  const handleSubmit = async () => {
    if (!sealNumber) return;
    try {
      await updateFn(batchNum, item.serialNumber, {
        sealNumber,
        sealType,
        sealingDate: new Date().toISOString().split('T')[0],
        itemStatus: 'Sealed'
      });
      setIsEditing(false);
    } catch (err) {
       alert("Sealing Lock Injection Failed");
    }
  };

  const isLocked = isBatchPosted;

  return (
    <tr className={`hover:bg-slate-50 transition-colors ${!isEditing ? 'bg-sky-50/5' : ''}`}>
      <td className="p-5 pl-8 font-mono text-slate-500 font-bold">{item.serialNumber}</td>
      <td className="p-5">
        <input 
          type="text" value={sealNumber} onChange={e => setSealNumber(e.target.value)}
          disabled={!isEditing || isLocked}
          className={`w-full bg-white border border-slate-200 rounded-lg p-2 text-sm font-bold focus:ring-2 focus:ring-sky-500 outline-none transition-all ${(!isEditing || isLocked) ? 'bg-slate-50 text-slate-400 font-mono' : 'text-sky-700'}`}
          placeholder="Enter SN-..."
        />
      </td>
      <td className="p-5">
        <select value={sealType} onChange={e => setSealType(e.target.value)} disabled={!isEditing || isLocked} className={`w-full bg-white border border-slate-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-sky-500 ${(!isEditing || isLocked) ? 'bg-slate-50 text-slate-400' : ''}`}>
          <option>Plastic Seal</option>
          <option>Lead Seal</option>
          <option>Electronic RF Seal</option>
          <option>High Security Bolt</option>
        </select>
      </td>
      <td className="p-5 text-right pr-8">
        {!isEditing ? (
           <button 
             onClick={() => !isLocked && handleEditInit()}
             disabled={isLocked}
             className={`p-2 rounded-lg transition-all ${isLocked ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-sky-600 hover:bg-sky-50'}`}
           >
             <Edit3 size={18} />
           </button>
        ) : (
           <button 
             onClick={handleSubmit}
             disabled={isLocked || !sealNumber}
             className="bg-sky-600 text-white px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-sky-700 transition-all shadow-md disabled:bg-slate-200 disabled:text-slate-400"
           >
             Lock
           </button>
        )}
      </td>
    </tr>
  );
}
