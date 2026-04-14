import React, { useState } from 'react';
import { useSharedState } from '../context/SharedStateContext';

function generateTxnId() {
  return `TXN-${Date.now().toString().slice(-6)}`;
}

export default function FilledInventory() {
  const { activeBatch, updateItemInBatch } = useSharedState();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [transactionId] = useState(generateTxnId);
  const [fromLocation, setFromLocation] = useState('Filling Station');
  const [toLocation, setToLocation] = useState('Filled Stock Yard');

  if (!activeBatch) return <div>Loading...</div>;

  const itemsToMove = activeBatch.items.filter(i => i.itemStatus === 'Tagged');
  const movedItems = activeBatch.items.filter(i => i.itemStatus === 'In Inventory');

  const canSubmit = fromLocation.trim() !== '' && toLocation.trim() !== '';

  const handleMoveAll = () => {
    if (!canSubmit) return;
    itemsToMove.forEach(item => {
      updateItemInBatch(activeBatch.batchNumber, item.serialNumber, {
        itemStatus: 'In Inventory',
        inventoryLocation: toLocation,
        moveDate: date,
        transactionId,
      });
    });
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto font-sans">

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-lg">📦</div>
          <div>
            <div className="text-2xl font-bold text-gray-800">{itemsToMove.length}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-0.5">Ready to Move</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-lg">🏪</div>
          <div>
            <div className="text-2xl font-bold text-teal-600">{movedItems.length}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-0.5">In Inventory</div>
          </div>
        </div>
      </div>

      {/* Header Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-teal-500"></div>
        <h2 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-3">Move to Filled Inventory</h2>
        <div className="grid grid-cols-3 gap-6 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Transaction ID</label>
            <input
              type="text" disabled value={transactionId}
              className="w-full bg-gray-50 border border-gray-200 text-teal-700 rounded-lg p-2.5 text-sm font-mono font-bold cursor-not-allowed"
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
              className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              From Location <span className="text-gray-400 font-normal">(Filling Station)</span>
            </label>
            <input
              type="text" value={fromLocation} onChange={e => setFromLocation(e.target.value)}
              className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
              placeholder="Filling Station"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              To Location <span className="text-gray-400 font-normal">(Filled Stock Yard)</span>
            </label>
            <input
              type="text" value={toLocation} onChange={e => setToLocation(e.target.value)}
              className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
              placeholder="Filled Stock Yard"
            />
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <div>
            <h3 className="font-bold text-gray-800">Tagged Items — Ready for Inventory</h3>
            <p className="text-xs text-gray-400 mt-0.5">Items must be tagged before they can be moved to filled inventory</p>
          </div>
          {itemsToMove.length > 0 && (
            <button
              onClick={handleMoveAll}
              disabled={!canSubmit}
              className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
            >
              📦 Move All to Inventory
            </button>
          )}
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
              {itemsToMove.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-gray-500 font-medium">
                    {movedItems.length > 0
                      ? `✅  All ${movedItems.length} item(s) have been moved to filled inventory.`
                      : 'No items ready. Items must be tagged before moving to inventory.'}
                  </td>
                </tr>
              ) : itemsToMove.map(item => (
                <InventoryRow
                  key={item.serialNumber}
                  item={item}
                  fromLocation={fromLocation}
                  toLocation={toLocation}
                  date={date}
                  transactionId={transactionId}
                  batchNum={activeBatch.batchNumber}
                  updateFn={updateItemInBatch}
                  canSubmit={canSubmit}
                />
              ))}
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
          📦 Move
        </button>
      </td>
    </tr>
  );
}
