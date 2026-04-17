import React, { useState } from 'react';
import { useSharedState } from '../context/SharedStateContext';

export default function TaggingEntry() {
  const { batches, activeBatch, activeProductConfig, updateItemInBatch } = useSharedState();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewingBatch, setViewingBatch] = useState(null);
  const [expiryDate, setExpiryDate] = useState('');

  // ── Build batch-level tagged records ──────────────────────────
  const taggedBatches = batches
    .filter(b => b.items.some(i => i.tagNumber))
    .map(b => {
      const taggedItems = b.items.filter(i => i.tagNumber);
      return {
        batchNumber: b.batchNumber,
        taggingId: taggedItems[0]?.taggingId || '—',
        productLabel: taggedItems[0]?.tagLabelType || activeProductConfig?.tagLabelType || '—',
        cylinderCount: taggedItems.length,
        expiryDate: taggedItems[0]?.expiryDate || '—',
        items: taggedItems,
      };
    });

  // ── DETAIL VIEW ───────────────────────────────────────────────
  if (viewingBatch) {
    return (
      <div className="space-y-6 max-w-[1200px] mx-auto font-sans">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
          <button onClick={() => setViewingBatch(null)}
            className="absolute top-4 right-4 flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm font-semibold bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors border border-gray-200">
            ← Back to List
          </button>

          <h2 className="text-xl font-bold text-gray-800 mb-1 pl-4">Tagging Record Details</h2>
          <p className="text-xs text-gray-400 pl-4 mb-6 uppercase tracking-widest font-semibold">Batch-level tagging record</p>

          <div className="grid grid-cols-4 gap-4 pl-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Batch Number</label>
              <div className="bg-blue-50 border border-blue-200 font-mono text-blue-800 rounded-lg p-2.5 text-sm font-bold">{viewingBatch.batchNumber}</div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tagging ID (Batch)</label>
              <div className="bg-gray-50 border border-gray-200 font-mono text-gray-800 rounded-lg p-2.5 text-sm font-bold">{viewingBatch.taggingId}</div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Product Label</label>
              <div className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg p-2.5 text-sm font-medium">{viewingBatch.productLabel}</div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Expiry Date</label>
              <div className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg p-2.5 text-sm font-medium">{viewingBatch.expiryDate}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 pl-4 mb-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cylinders Tagged:</span>
            <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-blue-200">{viewingBatch.cylinderCount}</span>
          </div>

          <div className="pl-4">
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-white border-b border-gray-200 text-gray-500 text-xs uppercase tracking-widest font-bold">
                    <th className="p-3 pl-4">#</th>
                    <th className="p-3">Serial Number</th>
                    <th className="p-3">Tag Number (Unique)</th>
                    <th className="p-3">Production Date</th>
                    <th className="p-3">Expiry Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {viewingBatch.items.map((item, idx) => (
                    <tr key={item.serialNumber} className="hover:bg-white transition-colors">
                      <td className="p-3 pl-4 text-gray-400 font-mono text-xs">{idx + 1}</td>
                      <td className="p-3 font-mono text-blue-700 font-bold">{item.serialNumber}</td>
                      <td className="p-3 font-mono text-gray-700 font-bold tracking-widest">{item.tagNumber}</td>
                      <td className="p-3 text-gray-600">{item.productionDate || '—'}</td>
                      <td className="p-3 text-gray-600">{item.expiryDate || '—'}</td>
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

  const itemsToTag = activeBatch.items.filter(i => i.itemStatus === 'Sealed');

  // Tagging ID = batch-level (same for all cylinders in batch)
  const batchTaggingId = `TAG-${activeBatch.batchNumber}`;

  // Auto-compute expiry from first item's production date
  const defaultExpiry = (() => {
    const firstItem = itemsToTag.find(i => i.productionDate);
    if (!firstItem) return '';
    const d = new Date(firstItem.productionDate);
    d.setDate(d.getDate() + activeProductConfig.expiryIntervalDays);
    return d.toISOString().split('T')[0];
  })();

  const handleTagAll = () => {
    if (itemsToTag.length === 0) return;

    itemsToTag.forEach((item, idx) => {
      // Tag Number = unique per cylinder
      const tagNum = `TN-${activeBatch.batchNumber}-${String(idx + 1).padStart(3, '0')}`;
      updateItemInBatch(activeBatch.batchNumber, item.serialNumber, {
        taggingId: batchTaggingId,    // same for all in batch
        tagNumber: tagNum,             // unique per cylinder
        expiryDate: expiryDate || defaultExpiry,
        itemStatus: 'Tagged',
      });
    });
  };

  const itemsTaggedCount = activeBatch.items.filter(i => i.itemStatus === 'Tagged').length;
  const processedItemsCount = activeBatch.items.filter(i => i.processStatus === 'Success' && i.qcStatus === 'QC Passed').length;
  const isAllTagged = processedItemsCount > 0 && itemsTaggedCount === processedItemsCount;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto font-sans">
      {/* ── Past Records (Batch Level) ─── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
            <h3 className="font-bold text-gray-800 text-lg">Tagging Records (by Batch)</h3>
          </div>
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Click a Batch to view details</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-white border-b border-gray-200 text-gray-500 font-bold tracking-wide text-xs uppercase">
                <th className="p-4">Batch Number</th>
                <th className="p-4">Tagging ID (Batch)</th>
                <th className="p-4">Product Label</th>
                <th className="p-4 text-center">Cylinders Tagged</th>
                <th className="p-4">Expiry Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {taggedBatches.length > 0 ? taggedBatches.map(rec => (
                <tr key={rec.batchNumber} className="hover:bg-blue-50/30 transition-colors">
                  <td className="p-4">
                    <button onClick={() => setViewingBatch(rec)}
                      className="font-mono text-blue-600 font-semibold hover:text-blue-800 hover:underline underline-offset-2 transition-colors">
                      {rec.batchNumber}
                    </button>
                  </td>
                  <td className="p-4 font-mono text-gray-700 font-bold">{rec.taggingId}</td>
                  <td className="p-4 text-gray-600">{rec.productLabel}</td>
                  <td className="p-4 text-center">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg border border-gray-200/50 font-bold">{rec.cylinderCount}</span>
                  </td>
                  <td className="p-4 text-gray-500">{rec.expiryDate}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-400 italic font-medium bg-gray-50/50">No tagged batch records yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Entry Form ─── */}
      {isAllTagged ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Batch {activeBatch.batchNumber} is Dispatch-Ready!</h2>
          <p className="text-gray-500 mb-4 text-center max-w-md text-sm">All successfully processed items have been sealed and tagged. Ready for finished goods inventory.</p>
          <div className="bg-green-50 text-green-700 px-6 py-2.5 rounded-lg border border-green-200 font-semibold tracking-wide text-sm">
            {itemsTaggedCount} ITEMS TAGGED
          </div>
        </div>
      ) : itemsToTag.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-2">No Items to Tag</h2>
          <p className="text-gray-500 text-sm text-center max-w-md">All sealed items in this batch have been tagged, or no items have been sealed yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <h2 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-3">Tag Batch: {activeBatch.batchNumber}</h2>

          <div className="grid grid-cols-4 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tagging ID (Batch)</label>
              <input type="text" disabled value={batchTaggingId} className="w-full bg-gray-50 border border-gray-200 text-blue-700 rounded-lg p-2.5 text-sm font-mono font-bold cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Batch</label>
              <input type="text" disabled value={activeBatch.batchNumber} className="w-full bg-gray-50 border border-gray-200 text-gray-500 rounded-lg p-2.5 text-sm cursor-not-allowed font-medium" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Product Label</label>
              <div className="bg-gray-100 px-3 py-2.5 rounded-lg border border-gray-200 text-xs font-bold tracking-wide text-gray-700">
                {activeProductConfig.tagLabelType}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry / Next Review</label>
              <input type="date" value={expiryDate || defaultExpiry} onChange={e => setExpiryDate(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Cylinders to be Tagged ({itemsToTag.length})</h3>
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-white border-b border-gray-200 text-gray-500 text-xs uppercase tracking-widest font-bold">
                    <th className="p-3 pl-4">#</th>
                    <th className="p-3">Serial Number</th>
                    <th className="p-3">Tag Number (will be assigned)</th>
                    <th className="p-3">Production Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {itemsToTag.map((item, idx) => (
                    <tr key={item.serialNumber} className="hover:bg-white transition-colors">
                      <td className="p-3 pl-4 text-gray-400 font-mono text-xs">{idx + 1}</td>
                      <td className="p-3 font-mono text-blue-700 font-bold">{item.serialNumber}</td>
                      <td className="p-3 font-mono text-gray-400 text-xs">TN-{activeBatch.batchNumber}-{String(idx + 1).padStart(3, '0')}</td>
                      <td className="p-3 text-gray-600">{item.productionDate || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={handleTagAll}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2">
              Tag All {itemsToTag.length} Cylinders <span className="text-xl leading-none">→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
