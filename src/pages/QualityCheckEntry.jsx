import React, { useState } from 'react';
import { useSharedState } from '../context/SharedStateContext';

export default function QualityCheckEntry() {
  const { activeBatch, updateItemInBatch } = useSharedState();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [qcId] = useState(`QC-${Date.now().toString().slice(-6)}`);
  const [inspectorName, setInspectorName] = useState('');

  if (!activeBatch) return <div>Loading...</div>;

  const itemsToQC = activeBatch.items.filter(i =>
    i.itemStatus === 'Produced' && (!i.qcStatus || i.qcStatus === 'Pending QC')
  );
  const passedCount = activeBatch.items.filter(i => i.qcStatus === 'QC Passed').length;
  const failedCount = activeBatch.items.filter(i => i.qcStatus === 'QC Failed').length;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto font-sans">

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">⏳</div>
          <div>
            <div className="text-2xl font-bold text-gray-800">{itemsToQC.length}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-0.5">Pending QC</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-lg">✅</div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">{passedCount}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-0.5">QC Passed</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-lg">❌</div>
          <div>
            <div className="text-2xl font-bold text-red-600">{failedCount}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-0.5">QC Failed</div>
          </div>
        </div>
      </div>

      {/* Header Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
        <h2 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-3">Quality Check Entry</h2>
        <div className="grid grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">QC ID</label>
            <input
              type="text" disabled value={qcId}
              className="w-full bg-gray-50 border border-gray-200 text-emerald-700 rounded-lg p-2.5 text-sm font-mono font-bold cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Batch Number</label>
            <input
              type="text" disabled value={activeBatch.batchNumber}
              className="w-full bg-gray-50 border border-gray-200 text-gray-500 rounded-lg p-2.5 text-sm cursor-not-allowed font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
            <input
              type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Inspector Name</label>
            <input
              type="text" value={inspectorName} onChange={e => setInspectorName(e.target.value)}
              className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="Enter inspector name"
            />
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold tracking-wide text-xs uppercase">
                <th className="p-4">Serial Number</th>
                <th className="p-4">Gas Purity (%)</th>
                <th className="p-4">Pressure Check</th>
                <th className="p-4">Leak Test</th>
                <th className="p-4">Valve Condition</th>
                <th className="p-4">QC Status</th>
                <th className="p-4">Remarks</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {itemsToQC.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-gray-500 font-medium">
                    No items pending QC. Items must be processed in Process Entry first.
                  </td>
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

function QCRow({ item, batchNum, updateFn }) {
  const [gasPurity, setGasPurity] = useState('');
  const [pressureCheck, setPressureCheck] = useState('Pass');
  const [leakTest, setLeakTest] = useState('Pass');
  const [valveCondition, setValveCondition] = useState('Pass');
  const [qcStatus, setQcStatus] = useState('Approved');
  const [remarks, setRemarks] = useState('');

  const handleSubmit = async () => {
    if (gasPurity === '') return;
    try {
      await updateFn(batchNum, item.serialNumber, {
        gasPurity: Number(gasPurity),
        pressureCheck,
        leakTest,
        valveCondition,
        remarks,
        qcStatus: qcStatus === 'Approved' ? 'QC Passed' : 'QC Failed',
      });
    } catch (err) {
      alert("Error submitting QC: " + err.message);
    }
  };

  const selectClass = "border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white transition-shadow";

  return (
    <tr className="hover:bg-emerald-50/20 transition-colors">
      <td className="p-4 font-mono text-emerald-700 font-semibold">{item.serialNumber}</td>
      <td className="p-4">
        <input
          type="number" value={gasPurity} onChange={e => setGasPurity(e.target.value)}
          className="w-24 border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
          placeholder="e.g. 99.0" min="0" max="100"
        />
      </td>
      <td className="p-4">
        <select value={pressureCheck} onChange={e => setPressureCheck(e.target.value)} className={selectClass}>
          <option>Pass</option>
          <option>Fail</option>
        </select>
      </td>
      <td className="p-4">
        <select value={leakTest} onChange={e => setLeakTest(e.target.value)} className={selectClass}>
          <option>Pass</option>
          <option>Fail</option>
        </select>
      </td>
      <td className="p-4">
        <select value={valveCondition} onChange={e => setValveCondition(e.target.value)} className={selectClass}>
          <option>Pass</option>
          <option>Fail</option>
        </select>
      </td>
      <td className="p-4">
        <select value={qcStatus} onChange={e => setQcStatus(e.target.value)} className={selectClass}>
          <option>Approved</option>
          <option>Rejected</option>
        </select>
      </td>
      <td className="p-4">
        <input
          type="text" value={remarks} onChange={e => setRemarks(e.target.value)}
          className="w-full min-w-[120px] border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow"
          placeholder="Optional remarks..."
        />
      </td>
      <td className="p-4 text-right">
        <button
          onClick={handleSubmit}
          disabled={gasPurity === ''}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm whitespace-nowrap"
        >
          ✓ Submit QC
        </button>
      </td>
    </tr>
  );
}
