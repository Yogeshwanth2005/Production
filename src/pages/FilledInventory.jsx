import React, { useState } from 'react';
import { useSharedState } from '../context/SharedStateContext';

function generateTxnId() {
  return `TXN-${Date.now().toString().slice(-6)}`;
}

export default function FilledInventory() {
  const { batches, updateItemInBatch } = useSharedState();
  const [viewingBatch, setViewingBatch] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [transactionId] = useState(generateTxnId);
  const [fromLocation, setFromLocation] = useState('Filling Station');
  const [toLocation, setToLocation] = useState('Filled Stock Yard');

  // Keep viewingBatch in sync with latest data
  const currentBatch = viewingBatch ? batches.find(b => b.batchNumber === viewingBatch.batchNumber) : null;

  // ── DETAIL VIEW ──────────────────────────────────────────────
  if (currentBatch) {
    const itemsToMove = currentBatch.items.filter(i => i.itemStatus === 'Tagged');
    const movedItems = currentBatch.items.filter(i => i.itemStatus === 'In Inventory');
    const canSubmit = fromLocation.trim() !== '' && toLocation.trim() !== '';

    const handleMoveAll = () => {
      if (!canSubmit) return;
      itemsToMove.forEach(item => {
        updateItemInBatch(currentBatch.batchNumber, item.serialNumber, {
          itemStatus: 'In Inventory',
          inventoryLocation: toLocation,
          moveDate: date,
          transactionId,
        });
      });
    };

    return (
      <div className="space-y-6 max-w-[1200px] mx-auto font-sans">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-teal-500"></div>

          <button
            onClick={() => setViewingBatch(null)}
            className="absolute top-4 right-4 flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm font-semibold bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors border border-gray-200"
          >
            ← Back to List
          </button>

          <h2 className="text-xl font-bold text-gray-800 mb-1 pl-4">Move to Filled Inventory</h2>
          <p className="text-xs text-gray-400 pl-4 mb-6 uppercase tracking-widest font-semibold">
            Transfer tagged cylinders to filled stock yard
          </p>

          {/* Header fields */}
          <div className="grid grid-cols-4 gap-4 mb-6 pl-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Batch Number</label>
              <div className="bg-teal-50 border border-teal-200 font-mono text-teal-800 rounded-lg p-2.5 text-sm font-bold">
                {currentBatch.batchNumber}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Transaction ID</label>
              <div className="bg-gray-50 border border-gray-200 font-mono text-gray-700 rounded-lg p-2.5 text-sm font-bold">
                {transactionId}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Product Type</label>
              <div className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg p-2.5 text-sm font-medium">
                {currentBatch.productType}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Date</label>
              <input
                type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 pl-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                From Location
              </label>
              <input
                type="text" value={fromLocation} onChange={e => setFromLocation(e.target.value)}
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                placeholder="Filling Station"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                To Location
              </label>
              <input
                type="text" value={toLocation} onChange={e => setToLocation(e.target.value)}
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                placeholder="Filled Stock Yard"
              />
            </div>
          </div>
        </div>

        {/* Items to Move */}
        {itemsToMove.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                Tagged Items — Ready for Inventory
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg text-xs font-bold border border-gray-200/50">{itemsToMove.length}</span>
              </h3>
              <button
                onClick={handleMoveAll}
                disabled={!canSubmit}
                className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
              >
                Move All to Inventory
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold tracking-wide text-xs uppercase">
                    <th className="p-4">Cylinder Serial Number</th>
                    <th className="p-4">Tag Number</th>
                    <th className="p-4">Production Date</th>
                    <th className="p-4">From Location</th>
                    <th className="p-4">To Location</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {itemsToMove.map(item => (
                    <InventoryRow
                      key={item.serialNumber}
                      item={item}
                      fromLocation={fromLocation}
                      toLocation={toLocation}
                      date={date}
                      transactionId={transactionId}
                      batchNum={currentBatch.batchNumber}
                      updateFn={updateItemInBatch}
                      canSubmit={canSubmit}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {/* Already Moved Items */}
        {movedItems.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                In Inventory
                <span className="bg-teal-100 text-teal-600 px-2 py-0.5 rounded-lg text-xs font-bold border border-teal-200">{movedItems.length}</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold tracking-wide text-xs uppercase">
                    <th className="p-4">Cylinder Serial Number</th>
                    <th className="p-4">Tag Number</th>
                    <th className="p-4">Production Date</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Move Date</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {movedItems.map(item => (
                    <tr key={item.serialNumber} className="hover:bg-teal-50/20 transition-colors">
                      <td className="p-4 font-mono text-teal-700 font-semibold">{item.serialNumber}</td>
                      <td className="p-4 font-mono text-gray-600 text-xs">{item.tagNumber || '—'}</td>
                      <td className="p-4 text-gray-600">{item.productionDate || '—'}</td>
                      <td className="p-4 text-gray-600">{item.inventoryLocation || '—'}</td>
                      <td className="p-4 text-gray-600">{item.moveDate || '—'}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-100 text-teal-700 border border-teal-200">
                          In Inventory
                        </span>
                      </td>
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
            <div className="w-1.5 h-6 bg-teal-500 rounded-full"></div>
            <h3 className="font-bold text-gray-800 text-lg">Filled Inventory — Batch List</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-white border-b border-gray-200 text-gray-500 font-bold tracking-wide text-xs uppercase">
                <th className="p-4">Batch Number</th>
                <th className="p-4">Product Type</th>
                <th className="p-4 text-center">Ready to Move</th>
                <th className="p-4 text-center">In Inventory</th>
                <th className="p-4 text-center">Total Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {batches.length > 0 ? batches.map(batch => {
                const ready = batch.items.filter(i => i.itemStatus === 'Tagged').length;
                const inInventory = batch.items.filter(i => i.itemStatus === 'In Inventory').length;

                return (
                  <tr key={batch.batchNumber} className="hover:bg-teal-50/30 transition-colors cursor-pointer" onClick={() => setViewingBatch(batch)}>
                    <td className="p-4">
                      <span className="font-mono text-teal-600 font-semibold hover:text-teal-800 hover:underline underline-offset-2 transition-colors">
                        {batch.batchNumber}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 font-medium">{batch.productType}</td>
                    <td className="p-4 text-center">
                      {ready > 0 ? (
                        <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-amber-200">{ready}</span>
                      ) : (
                        <span className="text-gray-400 text-xs">0</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {inInventory > 0 ? (
                        <span className="bg-teal-100 text-teal-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-teal-200">{inInventory}</span>
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

function InventoryRow({ item, fromLocation, toLocation, date, transactionId, batchNum, updateFn, canSubmit }) {
  const handleMove = () => {
    updateFn(batchNum, item.serialNumber, {
      itemStatus: 'In Inventory',
      inventoryLocation: toLocation,
      moveDate: date,
      transactionId,
    });
  };

  return (
    <tr className="hover:bg-teal-50/20 transition-colors">
      <td className="p-4 font-mono text-teal-700 font-semibold">{item.serialNumber}</td>
      <td className="p-4 font-mono text-gray-600 text-xs">{item.tagNumber || '—'}</td>
      <td className="p-4 text-gray-600">{item.productionDate || '—'}</td>
      <td className="p-4 text-gray-600">{fromLocation || 'Filling Station'}</td>
      <td className="p-4 text-gray-600">{toLocation || 'Filled Stock Yard'}</td>
      <td className="p-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200">
          Filled
        </span>
      </td>
      <td className="p-4 text-right">
        <button
          onClick={handleMove}
          disabled={!canSubmit}
          className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm"
        >
          Move
        </button>
      </td>
    </tr>
  );
}
