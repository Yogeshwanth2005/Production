import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSharedState } from '../context/SharedStateContext';
import { Search, Edit3, ArrowLeft, Filter, Download, CheckCircle2, XCircle, SearchIcon, LayoutGrid } from 'lucide-react';

export default function QualityCheckEntry() {
  const navigate = useNavigate();
  const { batches, updateItemInBatch } = useSharedState();
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [activeBatch, setBatchForQC] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleQCInitiate = (batch) => {
    setBatchForQC(batch);
    setView('form');
  };

  const filteredBatches = batches.filter(b => 
    b.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (view === 'form' && activeBatch) {
    const itemsToQC = activeBatch.items.filter(i =>
      i.itemStatus === 'Produced' && (!i.qcStatus || i.qcStatus === 'Pending QC')
    );
    const passedCount = activeBatch.items.filter(i => i.qcStatus === 'QC Passed').length;
    const failedCount = activeBatch.items.filter(i => i.qcStatus === 'QC Failed').length;

    return (
      <div className="flex flex-col h-full bg-slate-50 w-full animate-in fade-in duration-300 font-sans">
        <div className="p-8 pb-4">
           <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-xs uppercase tracking-widest mb-4 transition-colors">
             <ArrowLeft size={14} /> Back to QC Registry
           </button>
           <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Quality Check Entry</h2>
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
           {/* Stats Bar */}
           <div className="grid grid-cols-3 gap-6 max-w-6xl mx-auto">
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex items-center gap-6">
                 <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                    <SearchIcon size={28} />
                 </div>
                 <div>
                    <div className="text-3xl font-black text-slate-800 tracking-tighter">{itemsToQC.length}</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Review</div>
                 </div>
              </div>
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex items-center gap-6">
                 <div className="h-14 w-14 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 border border-sky-100">
                    <CheckCircle2 size={28} />
                 </div>
                 <div>
                    <div className="text-3xl font-black text-sky-600 tracking-tighter">{passedCount}</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">QC Passed</div>
                 </div>
              </div>
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex items-center gap-6">
                 <div className="h-14 w-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
                    <XCircle size={28} />
                 </div>
                 <div>
                    <div className="text-3xl font-black text-rose-600 tracking-tighter">{failedCount}</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">QC Failed</div>
                 </div>
              </div>
           </div>

           {/* Entry Table */}
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden max-w-6xl mx-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-white text-[10px] font-black uppercase tracking-[2px]">
                    <th className="p-5 pl-8 border-r border-slate-700/50">Serial Number</th>
                    <th className="p-5 border-r border-slate-700/50">Gas Purity (%)</th>
                    <th className="p-5 border-r border-slate-700/50">Pressure Check</th>
                    <th className="p-5 border-r border-slate-700/50 text-center">QC Status</th>
                    <th className="p-5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {itemsToQC.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-20 text-center text-slate-400 font-bold italic uppercase tracking-widest">No Items Pending Inspection</td>
                    </tr>
                  ) : itemsToQC.map(item => (
                    <QCRow 
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
              <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase leading-none">Quality Assurance Registry</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[2px] mt-1.5">Inspection Control Center</p>
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
                  <th className="p-4 w-[35%]">Pending QC</th>
                  <th className="p-4 w-[15%] text-center">Status</th>
                  <th className="p-4 w-[12%] text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBatches.map(batch => {
                  const pending = batch.items.filter(i => i.itemStatus === 'Produced' && (!i.qcStatus || i.qcStatus === 'Pending QC')).length;

                  return (
                    <tr key={batch.batchNumber} className="neat-table-row">
                      <td className="p-4 pl-8">
                         <span onClick={() => navigate('/summary')} className="neat-link">{batch.batchNumber}</span>
                      </td>
                      <td className="p-4 text-slate-600 font-bold">{pending} Units Pending</td>
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
                          onClick={() => handleQCInitiate(batch)}
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

function QCRow({ item, batchNum, isBatchPosted, updateFn, onLink }) {
  const [gasPurity, setGasPurity] = useState('');
  const [pressureCheck, setPressureCheck] = useState('Pass');
  const [qcStatus, setQcStatus] = useState('Approved');

  const handleSubmit = async () => {
    if (gasPurity === '') return;
    try {
      await updateFn(batchNum, item.serialNumber, {
        gasPurity: Number(gasPurity),
        pressureCheck,
        qcStatus: qcStatus === 'Approved' ? 'QC Passed' : 'QC Failed',
        qcId: `QC-${Math.floor(1000 + Math.random() * 9000)}` // Auto-generate QC ID for linking
      });
    } catch (err) {
      alert("QC Submission Failed");
    }
  };

  const isLocked = isBatchPosted;

  return (
    <tr className="hover:bg-slate-50/50">
      <td className="p-5 pl-8 font-mono text-slate-500 font-bold">
        <span onClick={onLink} className="neat-link font-mono">{item.serialNumber}</span>
      </td>
      <td className="p-5">
        <input 
          type="number" value={gasPurity} onChange={e => setGasPurity(e.target.value)}
          disabled={isLocked}
          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-black focus:ring-2 focus:ring-sky-500 outline-none"
          placeholder="99.9"
        />
      </td>
      <td className="p-5">
        <select value={pressureCheck} disabled={isLocked} onChange={e => setPressureCheck(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-sky-500">
          <option>Pass</option>
          <option>Fail</option>
        </select>
      </td>
      <td className="p-5 text-center">
        <select value={qcStatus} disabled={isLocked} onChange={e => setQcStatus(e.target.value)} className={`w-full border rounded-xl p-3 text-sm font-black outline-none focus:ring-2 focus:ring-sky-500 ${qcStatus === 'Approved' ? 'bg-sky-50 text-sky-700 border-sky-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
          <option value="Approved">ACCEPT</option>
          <option value="Rejected">REJECT</option>
        </select>
      </td>
      <td className="p-5 text-center">
        <button 
          onClick={handleSubmit}
          disabled={gasPurity === '' || isLocked}
          className="bg-sky-600 text-white px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-sky-700 transition-all shadow-lg shadow-sky-100 disabled:bg-slate-200 disabled:text-slate-400"
        >
          Post Result
        </button>
      </td>
    </tr>
  );
}
