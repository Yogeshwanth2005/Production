import React, { useState } from 'react';
import { useSharedState } from '../context/SharedStateContext';
import { Search, Edit3, ArrowLeft, Tag, Calendar, ShieldCheck } from 'lucide-react';

export default function TaggingEntry() {
  const { batches, updateItemInBatch } = useSharedState();
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [activeBatch, setBatchForTagging] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleTaggingInitiate = (batch) => {
    setBatchForTagging(batch);
    setView('form');
  };

  const filteredBatches = batches.filter(b => 
    b.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (view === 'form' && activeBatch) {
    const itemsToTag = activeBatch.items.filter(i => 
      i.itemStatus === 'Sealed' || i.itemStatus === 'Tagged' || i.itemStatus === 'In Inventory'
    );
    const taggedCount = activeBatch.items.filter(i => i.itemStatus === 'Tagged' || i.itemStatus === 'In Inventory').length;

    return (
      <div className="flex flex-col h-full bg-slate-50 w-full animate-in fade-in duration-300 font-sans">
        <div className="p-8 pb-4">
           <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-xs uppercase tracking-widest mb-4 transition-colors">
             <ArrowLeft size={14} /> Back to Tagging Registry
           </button>
           <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Traceability Tagging Entry</h2>
           <p className="text-xs text-slate-400 font-bold uppercase tracking-[2px] mt-1">Batch: <span className="text-sky-600">{activeBatch.batchNumber}</span></p>
        </div>

        <div className="flex-1 p-8 pt-4 space-y-6">
           <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-8">
              <div className="p-4 bg-sky-50 rounded-xl">
                 <Tag className="text-sky-600" size={24} />
              </div>
              <div className="flex-1">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Twin Status</span>
                 <div className="text-xl font-black text-slate-800 mt-1">{taggedCount} / {activeBatch.items.filter(i => i.itemStatus === 'Sealed' || i.itemStatus === 'Tagged' || i.itemStatus === 'In Inventory').length} RFID Tags Linked</div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg text-slate-500 text-[10px] font-black uppercase tracking-tighter">
                 <Calendar size={14} /> Global Expiry Sync Active
              </div>
           </div>

           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-white text-[10px] font-black uppercase tracking-[2px]">
                    <th className="p-5 pl-8 border-r border-slate-700/50">Serial Number</th>
                    <th className="p-5 border-r border-slate-700/50">Tag Identifier (TN-)</th>
                    <th className="p-5 border-r border-slate-700/50">Expiry Schedule</th>
                    <th className="p-5 text-right pr-8">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {itemsToTag.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-20 text-center text-slate-400 font-bold italic uppercase tracking-widest">No Sealed Items Detected in Station Registry</td>
                    </tr>
                  ) : itemsToTag.map(item => (
                    <TaggingRow 
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
           <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Tagging & Traceability Registry</h2>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[2px] mt-1">RFID & Certification Logs</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search Batch ID..."
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
                  <th className="p-5 border-r border-slate-700/50">Units Pending Tag</th>
                  <th className="p-5 border-r border-slate-700/50">Tagging Status</th>
                  <th className="p-5 text-right pr-12">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBatches.map(batch => {
                  const sealed = batch.items.filter(i => i.itemStatus === 'Sealed').length;
                  const tagged = batch.items.filter(i => i.itemStatus === 'Tagged' || i.itemStatus === 'In Inventory').length;
                  const totalSealed = sealed + tagged;
                  const progress = totalSealed > 0 ? (tagged / totalSealed) * 100 : 0;

                  return (
                    <tr key={batch.batchNumber} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-5 pl-8 font-mono text-sky-700 font-black">
                        <button onClick={() => handleTaggingInitiate(batch)} className="hover:underline underline-offset-4 decoration-sky-300">
                          {batch.batchNumber}
                        </button>
                      </td>
                      <td className="p-5 text-slate-600 font-bold">{sealed} / {totalSealed} Pending</td>
                      <td className="p-5">
                          <div className="flex items-center gap-3">
                             <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-sky-600 h-full" style={{ width: `${progress}%` }}></div>
                             </div>
                             <span className="text-[10px] font-black text-slate-400">{Math.round(progress)}% CERTIFIED</span>
                          </div>
                      </td>
                      <td className="p-5 text-right pr-8">
                        <button 
                          onClick={() => handleTaggingInitiate(batch)}
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

function TaggingRow({ item, batchNum, isBatchPosted, updateFn }) {
  const [tagNumber, setTagNumber] = useState(item.tagNumber || '');
  const [expiryDate, setExpiryDate] = useState(item.expiryDate || new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0]);
  const [isEditing, setIsEditing] = useState(!item.tagNumber);

  const handleEditInit = () => {
    if (!tagNumber) {
      setTagNumber(`TN-${Date.now().toString().slice(-6)}`);
    }
    setIsEditing(true);
  };

  const handleSubmit = async () => {
    if (!tagNumber) return;
    try {
      await updateFn(batchNum, item.serialNumber, {
        tagNumber,
        expiryDate,
        itemStatus: 'Tagged'
      });
      setIsEditing(false);
    } catch (err) {
       alert("Certification Tag Injection Failed");
    }
  };

  const isLocked = isBatchPosted;

  return (
    <tr className={`hover:bg-slate-50 transition-colors ${!isEditing ? 'bg-sky-50/5' : ''}`}>
      <td className="p-5 pl-8 font-mono text-slate-500 font-bold">{item.serialNumber}</td>
      <td className="p-5">
        <input 
          type="text" value={tagNumber} onChange={e => setTagNumber(e.target.value)}
          disabled={!isEditing || isLocked}
          className={`w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-black focus:ring-2 focus:ring-sky-500 outline-none transition-all ${(!isEditing || isLocked) ? 'bg-slate-50 text-slate-400 font-mono' : 'text-sky-700 border-sky-100 shadow-sm'}`}
          placeholder="Enter TN-..."
        />
      </td>
      <td className="p-5">
         <div className="flex items-center gap-3">
            <input 
              type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)}
              disabled={!isEditing || isLocked}
              className={`w-full bg-white border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-sky-500 ${(!isEditing || isLocked) ? 'bg-slate-50 text-slate-400' : ''}`}
            />
            {item.itemStatus === 'Tagged' && <ShieldCheck size={16} className="text-sky-600" />}
         </div>
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
             disabled={isLocked || !tagNumber}
             className="bg-sky-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-sky-700 transition-all shadow-lg active:scale-95 disabled:bg-slate-200 disabled:text-slate-400"
           >
             Certify
           </button>
        )}
      </td>
    </tr>
  );
}
