import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSharedState } from '../context/SharedStateContext';
import { Search, ArrowLeft, Warehouse, CheckCircle2, Package, Truck, MoveRight, LayoutGrid, Edit3 } from 'lucide-react';

export default function FilledInventory() {
  const navigate = useNavigate();
  const { batches, updateItemInBatch } = useSharedState();
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [activeBatch, setBatchForTransfer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [location, setLocation] = useState('MAIN_STK_YARD');

  const handleTransferInitiate = (batch) => {
    setBatchForTransfer(batch);
    setView('form');
  };

  const handleMoveAll = async () => {
    if (!activeBatch) return;
    const itemsToMove = activeBatch.items.filter(i => i.itemStatus === 'Tagged');
    const txnId = `TXN-${Date.now().toString().slice(-6)}`;
    
    try {
      for (const item of itemsToMove) {
        await updateItemInBatch(activeBatch.batchNumber, item.serialNumber, {
          itemStatus: 'In Inventory',
          inventoryLocation: location,
          moveDate: new Date().toISOString().split('T')[0],
          transactionId: txnId
        });
      }
      setView('list');
    } catch (err) {
      alert("Transfer protocol interrupted");
    }
  };

  const filteredBatches = batches.filter(b => 
    b.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (view === 'form' && activeBatch) {
    const itemsToMove = activeBatch.items.filter(i => i.itemStatus === 'Tagged');
    const movedCount = activeBatch.items.filter(i => i.itemStatus === 'In Inventory').length;

    return (
      <div className="flex flex-col h-full bg-slate-50 w-full animate-in fade-in duration-300 font-sans">
        <div className="p-8 pb-4">
           <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-xs uppercase tracking-widest mb-4 transition-colors">
             <ArrowLeft size={14} /> Back to Transfer Registry
           </button>
           <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Bulk Inventory Transfer</h2>
           <p className="text-xs text-slate-400 font-bold uppercase tracking-[2px] mt-1">Batch Source: <span className="text-sky-600 font-black underline decoration-sky-300 underline-offset-4">{activeBatch.batchNumber}</span></p>
        </div>

        <div className="flex-1 p-8 pt-4 space-y-6 overflow-y-auto">
           <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm grid grid-cols-3 gap-12 max-w-6xl mx-auto">
              <div className="space-y-4">
                 <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inventory Target Site</span>
                    <select value={location} onChange={e => setLocation(e.target.value)} className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all">
                       <option value="MAIN_STK_YARD">MAIN STK YARD</option>
                       <option value="ZONE_B_DISPATCH">ZONE B DISPATCH</option>
                       <option value="CUSTOMER_HOLDING">CUSTOMER HOLDING</option>
                    </select>
                 </div>
                 <div className="flex items-center gap-2 text-[10px] font-black text-sky-600 uppercase tracking-tighter bg-sky-50 p-2 rounded border border-sky-100">
                    <CheckCircle2 size={12} /> Real-time Warehouse Sync MT-01
                 </div>
              </div>

              <div className="flex flex-col items-center justify-center border-x border-slate-100">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Units Awaiting Move</span>
                 <div className="text-5xl font-black text-slate-800">{itemsToMove.length}</div>
                 <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">Verification Required</span>
              </div>

              <div className="flex flex-col justify-center gap-4">
                 <button 
                   onClick={handleMoveAll}
                   disabled={itemsToMove.length === 0}
                   className="w-full bg-slate-800 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200 disabled:opacity-30 flex items-center justify-center gap-3"
                 >
                    Execute Global Transfer <MoveRight size={16} />
                 </button>
                 <div className="text-center text-[10px] font-bold text-slate-400 uppercase">{movedCount} Units already in Stock</div>
              </div>
           </div>

           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden max-w-6xl mx-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-white text-[10px] font-black uppercase tracking-[2px]">
                    <th className="p-5 pl-8 border-r border-slate-700/50">Serial Number</th>
                    <th className="p-5 border-r border-slate-700/50">Tag Number</th>
                    <th className="p-5 border-r border-slate-700/50">Current Status</th>
                    <th className="p-5 text-right pr-8">Final Destination</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {itemsToMove.length === 0 && movedCount === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-20 text-center text-slate-400 font-bold italic uppercase tracking-widest">Registry Empty - Check Tagging Registry</td>
                    </tr>
                  ) : activeBatch.items.filter(i => i.itemStatus === 'Tagged' || i.itemStatus === 'In Inventory').map(item => (
                    <tr key={item.serialNumber} className="hover:bg-slate-50 transition-colors">
                      <td className="p-5 pl-8 font-mono text-slate-500 font-bold">
                        <span onClick={() => navigate('/summary')} className="neat-link font-mono">{item.serialNumber}</span>
                      </td>
                      <td className="p-5 text-sky-700 font-black">{item.tagNumber || '—'}</td>
                      <td className="p-5">
                         <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${item.itemStatus === 'In Inventory' ? 'bg-sky-50 text-sky-600 border border-sky-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                            {item.itemStatus}
                         </span>
                      </td>
                      <td className="p-5 text-right pr-8 text-slate-400 font-black text-[10px] uppercase">{item.inventoryLocation || 'PENDING'}</td>
                    </tr>
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
              <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase leading-none">Finished Goods Inventory Registry</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[2px] mt-1.5">Terminal Stock Movement Logs</p>
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
                  <th className="p-4 w-[35%]">Tagging Progress</th>
                  <th className="p-4 w-[15%] text-center">Status</th>
                  <th className="p-4 w-[12%] text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBatches.map(batch => {
                  const tagged = batch.items.filter(i => i.itemStatus === 'Tagged' || i.itemStatus === 'In Inventory').length;

                  return (
                    <tr key={batch.batchNumber} className="neat-table-row">
                      <td className="p-4 pl-8">
                         <span onClick={() => navigate('/summary')} className="neat-link">{batch.batchNumber}</span>
                      </td>
                      <td className="p-4 text-slate-600 font-bold">{tagged} Tagged Units</td>
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
                          onClick={() => handleTransferInitiate(batch)}
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
