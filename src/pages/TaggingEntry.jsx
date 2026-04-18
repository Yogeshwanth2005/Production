import React, { useState } from 'react';
import { useSharedState } from '../context/SharedStateContext';

export default function TaggingEntry() {
  const { batches, productConfig, updateItemInBatch } = useSharedState();
  const [viewingBatch, setViewingBatch] = useState(null);
  const [expiryDate, setExpiryDate] = useState('');

  // Keep in sync with latest data
  const currentBatch = viewingBatch ? batches.find(b => b.batchNumber === viewingBatch.batchNumber) : null;
  const currentConfig = currentBatch ? productConfig[currentBatch.productType] : null;

  // ── DETAIL VIEW ───────────────────────────────────────────────
  if (currentBatch && currentConfig) {
    const taggedItems = currentBatch.items.filter(i => i.tagNumber);
    const itemsToTag = currentBatch.items.filter(i => i.itemStatus === 'Sealed');
    const batchTaggingId = `TAG-${currentBatch.batchNumber}`;

    // Auto-compute expiry from first item's production date
    const defaultExpiry = (() => {
      const firstItem = itemsToTag.find(i => i.productionDate);
      if (!firstItem) return '';
      const d = new Date(firstItem.productionDate);
      d.setDate(d.getDate() + currentConfig.expiryIntervalDays);
      return d.toISOString().split('T')[0];
    })();

    const handleTagAll = () => {
      if (itemsToTag.length === 0) return;

      itemsToTag.forEach((item, idx) => {
        const tagNum = `TN-${currentBatch.batchNumber}-${String(idx + 1).padStart(3, '0')}`;
        updateItemInBatch(currentBatch.batchNumber, item.serialNumber, {
          taggingId: batchTaggingId,
          tagNumber: tagNum,
          expiryDate: expiryDate || defaultExpiry,
          itemStatus: 'Tagged',
        });
      });
    };

    return (
      <div className="space-y-6 max-w-[1200px] mx-auto font-sans">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>

          <button
            onClick={() => setViewingBatch(null)}
            className="absolute top-4 right-4 flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm font-semibold bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors border border-gray-200"
          >
            ← Back to List
          </button>

          <h2 className="text-xl font-bold text-gray-800 mb-1 pl-4">Tagging Entry</h2>
          <p className="text-xs text-gray-400 pl-4 mb-6 uppercase tracking-widest font-semibold">
            Tag sealed cylinders with product labels
          </p>

          {/* Batch header */}
          <div className="grid grid-cols-4 gap-4 mb-6 pl-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Batch Number</label>
              <div className="bg-blue-50 border border-blue-200 font-mono text-blue-800 rounded-lg p-2.5 text-sm font-bold">
                {currentBatch.batchNumber}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tagging ID (Batch)</label>
              <div className="bg-gray-50 border border-gray-200 font-mono text-gray-700 rounded-lg p-2.5 text-sm font-bold">
                {batchTaggingId}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Product Label</label>
              <div className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg p-2.5 text-sm font-medium">
                {currentConfig.tagLabelType}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Expiry / Next Review</label>
              <input type="date" value={expiryDate || defaultExpiry} onChange={e => setExpiryDate(e.target.value)}
                className={`w-full bg-white border rounded-lg p-2.5 text-sm focus:ring-2 outline-none transition-all ${(expiryDate || defaultExpiry) === new Date().toISOString().split('T')[0] ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} />
              {(expiryDate || defaultExpiry) === new Date().toISOString().split('T')[0] && (
                <p className="text-red-500 text-xs font-semibold mt-1.5">Expiry date is not valid</p>
              )}
            </div>
          </div>
        </div>

        {/* Items to Tag */}
        {itemsToTag.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                Cylinders to Tag
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg text-xs font-bold border border-gray-200/50">{itemsToTag.length}</span>
              </h3>
              <button onClick={handleTagAll}
                disabled={(expiryDate || defaultExpiry) === new Date().toISOString().split('T')[0]}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center gap-2">
                Tag All {itemsToTag.length} Cylinders <span className="text-xl leading-none">→</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-widest font-bold">
                    <th className="p-3 pl-4">#</th>
                    <th className="p-3">Serial Number</th>
                    <th className="p-3">Tag Number (will be assigned)</th>
                    <th className="p-3">Production Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {itemsToTag.map((item, idx) => (
                    <tr key={item.serialNumber} className="hover:bg-blue-50/20 transition-colors">
                      <td className="p-3 pl-4 text-gray-400 font-mono text-xs">{idx + 1}</td>
                      <td className="p-3 font-mono text-blue-700 font-bold">{item.serialNumber}</td>
                      <td className="p-3 font-mono text-gray-400 text-xs">TN-{currentBatch.batchNumber}-{String(idx + 1).padStart(3, '0')}</td>
                      <td className="p-3 text-gray-600">{item.productionDate || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {/* Already tagged items */}
        {taggedItems.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                Tagged Cylinders
                <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-lg text-xs font-bold border border-blue-200">{taggedItems.length}</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-widest font-bold">
                    <th className="p-3 pl-4">#</th>
                    <th className="p-3">Serial Number</th>
                    <th className="p-3">Tag Number (Unique)</th>
                    <th className="p-3">Production Date</th>
                    <th className="p-3">Expiry Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {taggedItems.map((item, idx) => (
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
            <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
            <h3 className="font-bold text-gray-800 text-lg">Tagging — Batch List</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-white border-b border-gray-200 text-gray-500 font-bold tracking-wide text-xs uppercase">
                <th className="p-4">Batch Number</th>
                <th className="p-4">Product Type</th>
                <th className="p-4 text-center">Ready to Tag</th>
                <th className="p-4 text-center">Tagged</th>
                <th className="p-4 text-center">Total Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {batches.length > 0 ? batches.map(batch => {
                const toTag = batch.items.filter(i => i.itemStatus === 'Sealed').length;
                const tagged = batch.items.filter(i => i.tagNumber).length;

                return (
                  <tr key={batch.batchNumber} className="hover:bg-blue-50/30 transition-colors cursor-pointer" onClick={() => setViewingBatch(batch)}>
                    <td className="p-4">
                      <span className="font-mono text-blue-600 font-semibold hover:text-blue-800 hover:underline underline-offset-2 transition-colors">
                        {batch.batchNumber}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 font-medium">{batch.productType}</td>
                    <td className="p-4 text-center">
                      {toTag > 0 ? (
                        <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-amber-200">{toTag}</span>
                      ) : (
                        <span className="text-gray-400 text-xs">0</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {tagged > 0 ? (
                        <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-blue-200">{tagged}</span>
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
