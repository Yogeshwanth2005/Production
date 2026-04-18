import React, { useState } from 'react';
import { useSharedState } from '../context/SharedStateContext';

export default function QualityCheckEntry() {
  const { batches, updateItemInBatch } = useSharedState();
  const [viewingBatch, setViewingBatch] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [inspectorName, setInspectorName] = useState('');

  // Keep viewingBatch in sync with latest data
  const currentBatch = viewingBatch ? batches.find(b => b.batchNumber === viewingBatch.batchNumber) : null;

  // ── DETAIL VIEW ──────────────────────────────────────────────
  if (currentBatch) {
    const itemsToQC = currentBatch.items.filter(i =>
      i.itemStatus === 'Produced' && (!i.qcStatus || i.qcStatus === 'Pending QC')
    );
    const passedCount = currentBatch.items.filter(i => i.qcStatus === 'QC Passed').length;
    const failedCount = currentBatch.items.filter(i => i.qcStatus === 'QC Failed').length;

    const checkedItems = currentBatch.items.filter(i =>
      i.qcStatus === 'QC Passed' || i.qcStatus === 'QC Failed'
    );

    return (
      <div className="space-y-6 max-w-[1400px] mx-auto font-sans">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>

          <button
            onClick={() => setViewingBatch(null)}
            className="absolute top-4 right-4 flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm font-semibold bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors border border-gray-200"
          >
            ← Back to List
          </button>

          <h2 className="text-xl font-bold text-gray-800 mb-1 pl-4">Quality Check Entry</h2>
          <p className="text-xs text-gray-400 pl-4 mb-6 uppercase tracking-widest font-semibold">
            Inspect cylinders for quality compliance
          </p>

          {/* Header fields */}
          <div className="grid grid-cols-4 gap-4 mb-6 pl-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Batch Number</label>
              <div className="bg-emerald-50 border border-emerald-200 font-mono text-emerald-800 rounded-lg p-2.5 text-sm font-bold">
                {currentBatch.batchNumber}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Date</label>
              <input
                type="date" value={date} onChange={e => setDate(e.target.value)}
                disabled={checkedItems.length > 0}
                className={`w-full border rounded-lg p-2.5 text-sm outline-none transition-all ${checkedItems.length > 0 ? 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'}`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Inspector Name</label>
              <input
                type="text" value={inspectorName} onChange={e => setInspectorName(e.target.value)}
                disabled={checkedItems.length > 0}
                className={`w-full border rounded-lg p-2.5 text-sm outline-none transition-all ${checkedItems.length > 0 ? 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'}`}
                placeholder="Enter inspector name"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Product Type</label>
              <div className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg p-2.5 text-sm font-medium">
                {currentBatch.productType}
              </div>
            </div>
          </div>
        </div>

        {/* Pending QC Table */}
        {itemsToQC.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                Pending QC
                <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-lg text-xs font-bold border border-amber-200">{itemsToQC.length}</span>
              </h3>
            </div>
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
                  {itemsToQC.map(item => (
                    <QCRow
                      key={item.serialNumber}
                      item={item}
                      batchNum={currentBatch.batchNumber}
                      updateFn={updateItemInBatch}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Checked Cylinders */}
        {checkedItems.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                Checked Cylinders
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg text-xs font-bold border border-gray-200/50">{checkedItems.length}</span>
              </h3>
            </div>
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {checkedItems.map(item => (
                    <tr key={item.serialNumber} className="hover:bg-emerald-50/20 transition-colors">
                      <td className="p-4 font-mono text-emerald-700 font-semibold">{item.serialNumber}</td>
                      <td className="p-4 font-mono text-gray-700">{item.gasPurity || '—'}%</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold border ${
                          item.pressureCheck === 'Pass' ? 'bg-gray-100 text-gray-700 border-gray-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>{item.pressureCheck || '—'}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold border ${
                          item.leakTest === 'Pass' ? 'bg-gray-100 text-gray-700 border-gray-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>{item.leakTest || '—'}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold border ${
                          item.valveCondition === 'Pass' ? 'bg-gray-100 text-gray-700 border-gray-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>{item.valveCondition || '—'}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                          item.qcStatus === 'QC Passed'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>{item.qcStatus}</span>
                      </td>
                      <td className="p-4 text-gray-600 text-sm">{item.remarks || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }


  // ── LIST VIEW ──────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-[1200px] mx-auto font-sans">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
            <h3 className="font-bold text-gray-800 text-lg">Quality Check — Batch List</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-white border-b border-gray-200 text-gray-500 font-bold tracking-wide text-xs uppercase">
                <th className="p-4">Batch Number</th>
                <th className="p-4">Product Type</th>
                <th className="p-4 text-center">Pending QC</th>
                <th className="p-4 text-center">QC Passed</th>
                <th className="p-4 text-center">QC Failed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {batches.length > 0 ? batches.map(batch => {
                const pending = batch.items.filter(i => i.itemStatus === 'Produced' && (!i.qcStatus || i.qcStatus === 'Pending QC')).length;
                const passed = batch.items.filter(i => i.qcStatus === 'QC Passed').length;
                const failed = batch.items.filter(i => i.qcStatus === 'QC Failed').length;

                return (
                  <tr key={batch.batchNumber} className="hover:bg-emerald-50/30 transition-colors cursor-pointer" onClick={() => setViewingBatch(batch)}>
                    <td className="p-4">
                      <span className="font-mono text-emerald-600 font-semibold hover:text-emerald-800 hover:underline underline-offset-2 transition-colors">
                        {batch.batchNumber}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 font-medium">{batch.productType}</td>
                    <td className="p-4 text-center">
                      {pending > 0 ? (
                        <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-amber-200">{pending}</span>
                      ) : (
                        <span className="text-gray-400 text-xs">0</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {passed > 0 ? (
                        <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-emerald-200">{passed}</span>
                      ) : (
                        <span className="text-gray-400 text-xs">0</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {failed > 0 ? (
                        <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-red-200">{failed}</span>
                      ) : (
                        <span className="text-gray-400 text-xs">0</span>
                      )}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="5" className="p-16 text-center text-gray-400 italic font-medium bg-gray-50/50">
                    No batches found. Create a batch first.
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
