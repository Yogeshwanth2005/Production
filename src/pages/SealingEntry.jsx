import React, { useState } from 'react';
import { useSharedState } from '../context/SharedStateContext';

export default function SealingEntry() {
  const { batches, productConfig, updateItemInBatch } = useSharedState();
  const [viewingBatch, setViewingBatch] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [sealType, setSealType] = useState('');

  // Keep in sync with latest data
  const currentBatch = viewingBatch ? batches.find(b => b.batchNumber === viewingBatch.batchNumber) : null;
  const currentConfig = currentBatch ? productConfig[currentBatch.productType] : null;

  // ── DETAIL VIEW ───────────────────────────────────────────────
  if (currentBatch && currentConfig) {
    const sealedItems = currentBatch.items.filter(i => i.sealNumber);
    const itemsToSeal = currentBatch.items.filter(i =>
      i.itemStatus === 'Produced' && i.qcStatus === 'QC Passed' && i.processStatus === 'Success'
    );
    const batchSealingId = `SEAL-${currentBatch.batchNumber}`;

    const handleSealAll = () => {
      if (!sealType) {
        alert('Please select a Seal Type');
        return;
      }
      if (itemsToSeal.length === 0) return;

      itemsToSeal.forEach((item, idx) => {
        const sealNum = `SN-${currentBatch.batchNumber}-${String(idx + 1).padStart(3, '0')}`;
        updateItemInBatch(currentBatch.batchNumber, item.serialNumber, {
          sealingId: batchSealingId,
          sealNumber: sealNum,
          sealType: sealType,
          itemStatus: 'Sealed',
          sealingDate: date,
        });
      });
    };

    const isCompleted = currentBatch.status !== 'Complete';

    return (
      <div className="space-y-6 max-w-[1200px] mx-auto font-sans">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>

          <button
            onClick={() => setViewingBatch(null)}
            className="absolute top-4 right-4 flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm font-semibold bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors border border-gray-200"
          >
            ← Back to List
          </button>

          <h2 className="text-xl font-bold text-gray-800 mb-1 pl-4">Sealing Entry</h2>
          <p className="text-xs text-gray-400 pl-4 mb-6 uppercase tracking-widest font-semibold">
            Seal batch cylinders after QC approval
          </p>

          {/* Batch header */}
          <div className="grid grid-cols-4 gap-4 mb-6 pl-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Batch Number</label>
              <div className="bg-indigo-50 border border-indigo-200 font-mono text-indigo-800 rounded-lg p-2.5 text-sm font-bold">
                {currentBatch.batchNumber}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Sealing ID (Batch)</label>
              <div className="bg-gray-50 border border-gray-200 font-mono text-gray-700 rounded-lg p-2.5 text-sm font-bold">
                {batchSealingId}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Seal Type <span className="text-red-500">*</span></label>
              <select value={sealType} onChange={e => setSealType(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                <option value="">-- Select --</option>
                {currentConfig.sealOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Items to Seal */}
        {itemsToSeal.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                Cylinders to Seal
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg text-xs font-bold border border-gray-200/50">{itemsToSeal.length}</span>
              </h3>
              <button onClick={handleSealAll} disabled={!sealType}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center gap-2">
                Seal All {itemsToSeal.length} Cylinders <span className="text-xl leading-none">→</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-widest font-bold">
                    <th className="p-3 pl-4">#</th>
                    <th className="p-3">Serial Number</th>
                    <th className="p-3">Seal Number (will be assigned)</th>
                    <th className="p-3">QC Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {itemsToSeal.map((item, idx) => (
                    <tr key={item.serialNumber} className="hover:bg-indigo-50/20 transition-colors">
                      <td className="p-3 pl-4 text-gray-400 font-mono text-xs">{idx + 1}</td>
                      <td className="p-3 font-mono text-indigo-700 font-bold">{item.serialNumber}</td>
                      <td className="p-3 font-mono text-gray-400 text-xs">SN-{currentBatch.batchNumber}-{String(idx + 1).padStart(3, '0')}</td>
                      <td className="p-3">
                        <span className="bg-green-50 text-green-700 px-2 py-1 rounded-md text-xs font-bold border border-green-200">QC Passed</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {/* Already sealed items */}
        {sealedItems.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                Sealed Cylinders
                <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-lg text-xs font-bold border border-indigo-200">{sealedItems.length}</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-widest font-bold">
                    <th className="p-3 pl-4">#</th>
                    <th className="p-3">Serial Number</th>
                    <th className="p-3">Seal Number (Unique)</th>
                    <th className="p-3">Seal Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sealedItems.map((item, idx) => (
                    <tr key={item.serialNumber} className="hover:bg-white transition-colors">
                      <td className="p-3 pl-4 text-gray-400 font-mono text-xs">{idx + 1}</td>
                      <td className="p-3 font-mono text-indigo-700 font-bold">{item.serialNumber}</td>
                      <td className="p-3 font-mono text-gray-700 font-bold tracking-wider">{item.sealNumber}</td>
                      <td className="p-3 text-gray-600">{item.sealType}</td>
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
            <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
            <h3 className="font-bold text-gray-800 text-lg">Sealing — Batch List</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-white border-b border-gray-200 text-gray-500 font-bold tracking-wide text-xs uppercase">
                <th className="p-4">Batch Number</th>
                <th className="p-4">Product Type</th>
                <th className="p-4 text-center">Ready to Seal</th>
                <th className="p-4 text-center">Sealed</th>
                <th className="p-4 text-center">Total Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {batches.length > 0 ? batches.map(batch => {
                const toSeal = batch.items.filter(i =>
                  i.itemStatus === 'Produced' && i.qcStatus === 'QC Passed' && i.processStatus === 'Success'
                ).length;
                const sealed = batch.items.filter(i => i.sealNumber).length;

                return (
                  <tr key={batch.batchNumber} className="hover:bg-indigo-50/30 transition-colors cursor-pointer" onClick={() => setViewingBatch(batch)}>
                    <td className="p-4">
                      <span className="font-mono text-indigo-600 font-semibold hover:text-indigo-800 hover:underline underline-offset-2 transition-colors">
                        {batch.batchNumber}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 font-medium">{batch.productType}</td>
                    <td className="p-4 text-center">
                      {toSeal > 0 ? (
                        <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-amber-200">{toSeal}</span>
                      ) : (
                        <span className="text-gray-400 text-xs">0</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {sealed > 0 ? (
                        <span className="bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-indigo-200">{sealed}</span>
                      ) : (
                        <span className="text-gray-400 text-xs">0</span>
                      )}
                    </td>
                    <td className="p-4 text-center font-bold text-gray-800">
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg border border-gray-200/50">{batch.items.length}</span>
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
