import React, { useState } from 'react';
import { useSharedState } from '../context/SharedStateContext';

export default function SealingEntry() {
  const { batches, activeBatch, activeProductConfig, updateItemInBatch } = useSharedState();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewingBatch, setViewingBatch] = useState(null);
  const [sealType, setSealType] = useState('');

  // ── Build batch-level sealed records ──────────────────────────
  const sealedBatches = batches
    .filter(b => b.items.some(i => i.sealNumber))
    .map(b => {
      const sealedItems = b.items.filter(i => i.sealNumber);
      return {
        batchNumber: b.batchNumber,
        sealingId: sealedItems[0]?.sealingId || '—',
        sealType: sealedItems[0]?.sealType || '—',
        sealingDate: sealedItems[0]?.sealingDate || '—',
        cylinderCount: sealedItems.length,
        items: sealedItems,
      };
    });

  // ── DETAIL VIEW ───────────────────────────────────────────────
  if (viewingBatch) {
    return (
      <div className="space-y-6 max-w-[1200px] mx-auto font-sans">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
          <button onClick={() => setViewingBatch(null)}
            className="absolute top-4 right-4 flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm font-semibold bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors border border-gray-200">
            ← Back to List
          </button>

          <h2 className="text-xl font-bold text-gray-800 mb-1 pl-4">Sealing Record Details</h2>
          <p className="text-xs text-gray-400 pl-4 mb-6 uppercase tracking-widest font-semibold">Batch-level sealing record</p>

          <div className="grid grid-cols-4 gap-4 pl-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Batch Number</label>
              <div className="bg-indigo-50 border border-indigo-200 font-mono text-indigo-800 rounded-lg p-2.5 text-sm font-bold">{viewingBatch.batchNumber}</div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Sealing ID</label>
              <div className="bg-gray-50 border border-gray-200 font-mono text-gray-800 rounded-lg p-2.5 text-sm font-bold">{viewingBatch.sealingId}</div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Seal Type</label>
              <div className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg p-2.5 text-sm font-medium">{viewingBatch.sealType}</div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Sealing Date</label>
              <div className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg p-2.5 text-sm font-medium">{viewingBatch.sealingDate}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 pl-4 mb-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cylinders Sealed:</span>
            <span className="bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-indigo-200">{viewingBatch.cylinderCount}</span>
          </div>

          <div className="pl-4">
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-white border-b border-gray-200 text-gray-500 text-xs uppercase tracking-widest font-bold">
                    <th className="p-3 pl-4">#</th>
                    <th className="p-3">Serial Number</th>
                    <th className="p-3">Seal Number (Unique)</th>
                    <th className="p-3">Seal Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {viewingBatch.items.map((item, idx) => (
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
        </div>
      </div>
    );
  }

  // ── MAIN VIEW ─────────────────────────────────────────────────
  if (!activeBatch || !activeProductConfig) return <div>Loading...</div>;

  const itemsToSeal = activeBatch.items.filter(i =>
    i.itemStatus === 'Produced' && i.qcStatus === 'QC Passed' && i.processStatus === 'Success'
  );

  // Sealing ID = batch-level (same for all cylinders in batch)
  const batchSealingId = `SEAL-${activeBatch.batchNumber}`;

  const handleSealAll = () => {
    if (!sealType) {
      alert('Please select a Seal Type');
      return;
    }
    if (itemsToSeal.length === 0) return;

    itemsToSeal.forEach((item, idx) => {
      // Seal Number = unique per cylinder
      const sealNum = `SN-${activeBatch.batchNumber}-${String(idx + 1).padStart(3, '0')}`;
      updateItemInBatch(activeBatch.batchNumber, item.serialNumber, {
        sealingId: batchSealingId,   // same for all in batch
        sealNumber: sealNum,          // unique per cylinder
        sealType: sealType,
        itemStatus: 'Sealed',
        sealingDate: date,
      });
    });
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto font-sans">
      {/* ── Past Records (Batch Level) ─── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
            <h3 className="font-bold text-gray-800 text-lg">Sealing Records (by Batch)</h3>
          </div>
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Click a Batch to view details</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-white border-b border-gray-200 text-gray-500 font-bold tracking-wide text-xs uppercase">
                <th className="p-4">Batch Number</th>
                <th className="p-4">Sealing ID</th>
                <th className="p-4">Seal Type</th>
                <th className="p-4 text-center">Cylinders Sealed</th>
                <th className="p-4">Sealing Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sealedBatches.length > 0 ? sealedBatches.map(rec => (
                <tr key={rec.batchNumber} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="p-4">
                    <button onClick={() => setViewingBatch(rec)}
                      className="font-mono text-indigo-600 font-semibold hover:text-indigo-800 hover:underline underline-offset-2 transition-colors">
                      {rec.batchNumber}
                    </button>
                  </td>
                  <td className="p-4 font-mono text-gray-700 font-bold">{rec.sealingId}</td>
                  <td className="p-4 text-gray-600">{rec.sealType}</td>
                  <td className="p-4 text-center">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg border border-gray-200/50 font-bold">{rec.cylinderCount}</span>
                  </td>
                  <td className="p-4 text-gray-500">{rec.sealingDate}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-400 italic font-medium bg-gray-50/50">No sealed batch records yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Entry Form ─── */}
      {activeBatch.status !== 'Complete' ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-2">Batch Not Complete</h2>
          <p className="text-gray-500 text-sm text-center max-w-md">Complete the batch on the Summary screen first before sealing items.</p>
        </div>
      ) : itemsToSeal.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-2">No Items to Seal</h2>
          <p className="text-gray-500 text-sm text-center max-w-md">All QC-passed items in this batch have already been sealed, or no items passed QC.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
          <h2 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-3">Seal Batch: {activeBatch.batchNumber}</h2>

          <div className="grid grid-cols-4 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sealing ID (Batch)</label>
              <input type="text" disabled value={batchSealingId} className="w-full bg-gray-50 border border-gray-200 text-indigo-700 rounded-lg p-2.5 text-sm font-mono font-bold cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Batch</label>
              <input type="text" disabled value={activeBatch.batchNumber} className="w-full bg-gray-50 border border-gray-200 text-gray-500 rounded-lg p-2.5 text-sm cursor-not-allowed font-medium" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Seal Type <span className="text-red-500">*</span></label>
              <select value={sealType} onChange={e => setSealType(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                <option value="">-- Select --</option>
                {activeProductConfig.sealOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Cylinders to be Sealed ({itemsToSeal.length})</h3>
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-white border-b border-gray-200 text-gray-500 text-xs uppercase tracking-widest font-bold">
                    <th className="p-3 pl-4">#</th>
                    <th className="p-3">Serial Number</th>
                    <th className="p-3">Seal Number (will be assigned)</th>
                    <th className="p-3">QC Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {itemsToSeal.map((item, idx) => (
                    <tr key={item.serialNumber} className="hover:bg-white transition-colors">
                      <td className="p-3 pl-4 text-gray-400 font-mono text-xs">{idx + 1}</td>
                      <td className="p-3 font-mono text-indigo-700 font-bold">{item.serialNumber}</td>
                      <td className="p-3 font-mono text-gray-400 text-xs">SN-{activeBatch.batchNumber}-{String(idx + 1).padStart(3, '0')}</td>
                      <td className="p-3">
                        <span className="bg-green-50 text-green-700 px-2 py-1 rounded-md text-xs font-bold border border-green-200">QC Passed</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={handleSealAll} disabled={!sealType}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2">
              Seal All {itemsToSeal.length} Cylinders <span className="text-xl leading-none">→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
