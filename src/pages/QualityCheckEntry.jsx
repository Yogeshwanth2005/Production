import React, { useState } from 'react';
import { useSharedState } from '../context/SharedStateContext';
import { Search, Edit3, ArrowLeft, Filter, Download, CheckCircle2, XCircle } from 'lucide-react';

export default function QualityCheckEntry() {
  const { batches, updateItemInBatch } = useSharedState();
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [activeBatch, setBatchForQC] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [qcDate, setQcDate] = useState(new Date().toISOString().split('T')[0]);
  const [inspectorName, setInspectorName] = useState('');

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
           <h2 className="text-2xl font-black text-slate-800 tracking-tight">QUALITY CHECK ENTRY</h2>
           <p className="text-xs text-slate-400 font-bold uppercase tracking-[2px] mt-1">Batch: <span className="text-sky-600">{activeBatch.batchNumber}</span></p>
        </div>

        <div className="flex-1 p-8 pt-4 space-y-6">
           {/* Stats Bar */}
           <div className="grid grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
                 <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                    <Search size={24} />
                 </div>
                 <div>
                    <div className="text-2xl font-black text-slate-800">{itemsToQC.length}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Review</div>
                 </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
                 <div className="h-12 w-12 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                    <CheckCircle2 size={24} />
                 </div>
                 <div>
                    <div className="text-2xl font-black text-sky-600">{passedCount}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">QC Passed</div>
                 </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
                 <div className="h-12 w-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                    <XCircle size={24} />
                 </div>
                 <div>
                    <div className="text-2xl font-black text-rose-600">{failedCount}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">QC Failed</div>
                 </div>
              </div>
           </div>

           {/* Entry Table */}
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-white text-[10px] font-black uppercase tracking-[2px]">
                    <th className="p-5 pl-8 border-r border-slate-700/50">Serial Number</th>
                    <th className="p-5 border-r border-slate-700/50">Gas Purity (%)</th>
                    <th className="p-5 border-r border-slate-700/50">Pressure</th>
                    <th className="p-5 border-r border-slate-700/50">Leak Test</th>
                    <th className="p-5 border-r border-slate-700/50 text-center">Status</th>
                    <th className="p-5 text-right pr-8">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {itemsToQC.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-20 text-center text-slate-400 font-bold italic uppercase tracking-widest">No Items Pending Inspection</td>
                    </tr>
                  ) : itemsToQC.map(item => (
                    <QCRow 
                      key={item.serialNumber} 
                      item={item} 
                      batchNum={activeBatch.batchNumber} 
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
           <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Quality Assurance Registry</h2>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[2px] mt-1">Inspection Control Center</p>
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
           <button className="bg-slate-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm uppercase tracking-widest">
             <Download size={14} /> Export Logs
           </button>
        </div>
      </div>

      <div className="flex-1 p-8 pt-4 overflow-hidden">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
           <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white text-[10px] font-black uppercase tracking-[2px]">
                  <th className="p-5 pl-8 border-r border-slate-700/50">Batch ID</th>
                  <th className="p-5 border-r border-slate-700/50">Pending QC</th>
                  <th className="p-5 border-r border-slate-700/50">Passed</th>
                  <th className="p-5 border-r border-slate-700/50">Failed</th>
                  <th className="p-5 text-right pr-12">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBatches.map(batch => {
                  const pending = batch.items.filter(i => i.itemStatus === 'Produced' && (!i.qcStatus || i.qcStatus === 'Pending QC')).length;
                  const passed = batch.items.filter(i => i.qcStatus === 'QC Passed').length;
                  const failed = batch.items.filter(i => i.qcStatus === 'QC Failed').length;

                  return (
                    <tr key={batch.batchNumber} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-5 pl-8 font-mono text-sky-700 font-black">
                        <button onClick={() => handleQCInitiate(batch)} className="hover:underline underline-offset-4 decoration-sky-300">
                          {batch.batchNumber}
                        </button>
                      </td>
                      <td className="p-5 text-slate-600 font-bold">{pending}</td>
                      <td className="p-5 text-sky-600 font-black">{passed}</td>
                      <td className="p-5 text-rose-600 font-black">{failed}</td>
                      <td className="p-5 text-right pr-8">
                        <button 
                          onClick={() => handleQCInitiate(batch)}
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

function QCRow({ item, batchNum, updateFn }) {
  const [gasPurity, setGasPurity] = useState('');
  const [pressureCheck, setPressureCheck] = useState('Pass');
  const [leakTest, setLeakTest] = useState('Pass');
  const [qcStatus, setQcStatus] = useState('Approved');

  const handleSubmit = async () => {
    if (gasPurity === '') return;
    try {
      await updateFn(batchNum, item.serialNumber, {
        gasPurity: Number(gasPurity),
        pressureCheck,
        leakTest,
        qcStatus: qcStatus === 'Approved' ? 'QC Passed' : 'QC Failed',
      });
    } catch (err) {
      alert("QC Submission Failed");
    }
  };

  return (
    <tr className="hover:bg-slate-50/50">
      <td className="p-5 pl-8 font-mono text-slate-500 font-bold">{item.serialNumber}</td>
      <td className="p-5">
        <input 
          type="number" value={gasPurity} onChange={e => setGasPurity(e.target.value)}
          className="w-24 bg-white border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
          placeholder="99.0"
        />
      </td>
      <td className="p-5">
        <select value={pressureCheck} onChange={e => setPressureCheck(e.target.value)} className="bg-white border border-slate-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-sky-500">
          <option>Pass</option>
          <option>Fail</option>
        </select>
      </td>
      <td className="p-5">
        <select value={leakTest} onChange={e => setLeakTest(e.target.value)} className="bg-white border border-slate-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-sky-500">
          <option>Pass</option>
          <option>Fail</option>
        </select>
      </td>
      <td className="p-5 text-center">
        <select value={qcStatus} onChange={e => setQcStatus(e.target.value)} className="bg-white border border-slate-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-sky-500 font-bold">
          <option value="Approved">ACCEPT</option>
          <option value="Rejected">REJECT</option>
        </select>
      </td>
      <td className="p-5 text-right pr-8">
        <button 
          onClick={handleSubmit}
          disabled={gasPurity === ''}
          className="bg-sky-600 text-white px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-sky-700 transition-all opacity-80 hover:opacity-100 disabled:opacity-30 shadow-md"
        >
          Post Results
        </button>
      </td>
    </tr>
  );
}
