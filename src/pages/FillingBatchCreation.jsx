import React, { useState } from 'react';
import { useSharedState } from '../context/SharedStateContext';

export default function FillingBatchCreation() {
  const { productConfig, batches, fetchBatches, setActiveBatchNumber } = useSharedState();

  const [view, setView] = useState('list'); // 'list' | 'create' | 'detail'
  const [viewBatch, setViewBatch] = useState(null);

  const generateBatchNumber = () => {
    const prefix = 'GAS';
    const num = Math.floor(1000 + Math.random() * 9000);
    const year = new Date().getFullYear();
    return `BATCH-${year}-${prefix}-${num}`;
  };

  const [form, setForm] = useState({
    batchNumber: '',
    date: new Date().toISOString().split('T')[0],
    productType: Object.keys(productConfig)[0],
    gasType: 'Oxygen',
    fillingStation: '',
    tankId: '',
    operatorName: '',
    shift: 'Morning',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleStartCreating = () => {
    setForm(prev => ({ ...prev, batchNumber: generateBatchNumber() }));
    setView('create');
  };

  const handleViewBatch = (batch) => {
    setViewBatch(batch);
    setView('detail');
  };

  const handleBackToList = () => {
    setView('list');
    setViewBatch(null);
  };

  const handleSubmit = async () => {
    if (!form.batchNumber || !form.fillingStation || !form.operatorName) {
      alert('Please fill all required fields (Batch Number, Filling Station, Operator Name)');
      return;
    }

    try {
      await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batch_number: form.batchNumber,
          product_type: form.productType,
          batch_date: form.date,
          gas_type: form.gasType,
          filling_station: form.fillingStation,
          tank_id: form.tankId,
          operator_name: form.operatorName,
          shift: form.shift,
        })
      });

      // Reset form
      setForm({
        batchNumber: '', date: new Date().toISOString().split('T')[0],
        productType: Object.keys(productConfig)[0], gasType: 'Oxygen',
        fillingStation: '', tankId: '', operatorName: '', shift: 'Morning',
      });

      setView('list');

      // Refresh batches in context and set the new batch as active
      await fetchBatches();
      setActiveBatchNumber(form.batchNumber);
    } catch (err) {
      console.error('Failed to create batch:', err);
      alert('Failed to create batch. Check if batch number already exists.');
    }
  };


  return (
    <div className="space-y-6 max-w-[1200px] mx-auto font-sans">
      {view === 'list' && (
        /* ─── LIST VIEW ─── */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-sky-500 rounded-full"></div>
              <h3 className="font-bold text-gray-800 text-lg">Batch Records</h3>
            </div>
            <button
              onClick={handleStartCreating}
              className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
            >
              + Create New Batch
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-white border-b border-gray-200 text-gray-500 font-bold tracking-wide text-xs uppercase">
                  <th className="p-4">Batch Number</th>
                  <th className="p-4">Product Type</th>
                  <th className="p-4 text-center">Cylinders</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {batches.length > 0 ? batches.map(batch => (
                  <tr key={batch.batchNumber} className="hover:bg-sky-50/30 transition-colors cursor-pointer" onClick={() => handleViewBatch(batch)}>
                    <td className="p-4 font-mono text-sky-700 font-semibold hover:underline">{batch.batchNumber}</td>
                    <td className="p-4 text-gray-600 font-medium">{batch.productType}</td>
                    <td className="p-4 text-center font-bold text-gray-800">
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg border border-gray-200/50">{batch.items.length}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                        batch.status === 'Complete'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>{batch.status}</span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="p-16 text-center text-gray-400 italic font-medium bg-gray-50/50">
                      No batch records found yet. Click "Create New Batch" to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === 'detail' && viewBatch && (
        /* ─── DETAIL VIEW ─── */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-sky-500"></div>
          <button
            onClick={handleBackToList}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-lg"
          >
            ✕
          </button>

          <div className="pl-4 mb-6">
            <button onClick={handleBackToList} className="text-sky-600 hover:text-sky-800 text-sm font-semibold flex items-center gap-1 mb-3 transition-colors">
              ← Back to Batch List
            </button>
            <h2 className="text-xl font-bold text-gray-800 mb-1">Batch Details</h2>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Read-only view of batch information</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 pl-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Batch Number</label>
              <input type="text" value={viewBatch.batchNumber} disabled
                className="w-full bg-gray-50 border border-gray-200 text-sky-700 rounded-lg p-2.5 text-sm font-mono font-bold cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
              <input type="text" value={viewBatch.batchDate || '—'} disabled
                className="w-full bg-gray-50 border border-gray-200 text-gray-600 rounded-lg p-2.5 text-sm cursor-not-allowed" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 pl-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Product Type</label>
              <input type="text" value={viewBatch.productType || '—'} disabled
                className="w-full bg-gray-50 border border-gray-200 text-gray-600 rounded-lg p-2.5 text-sm cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Gas Type</label>
              <input type="text" value={viewBatch.gasType || '—'} disabled
                className="w-full bg-gray-50 border border-gray-200 text-gray-600 rounded-lg p-2.5 text-sm cursor-not-allowed" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 pl-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Filling Station</label>
              <input type="text" value={viewBatch.fillingStation || '—'} disabled
                className="w-full bg-gray-50 border border-gray-200 text-gray-600 rounded-lg p-2.5 text-sm cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tank ID (Source of Gas)</label>
              <input type="text" value={viewBatch.tankId || '—'} disabled
                className="w-full bg-gray-50 border border-gray-200 text-gray-600 rounded-lg p-2.5 text-sm cursor-not-allowed" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6 pl-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Operator Name</label>
              <input type="text" value={viewBatch.operatorName || '—'} disabled
                className="w-full bg-gray-50 border border-gray-200 text-gray-600 rounded-lg p-2.5 text-sm cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Shift</label>
              <input type="text" value={viewBatch.shift || '—'} disabled
                className="w-full bg-gray-50 border border-gray-200 text-gray-600 rounded-lg p-2.5 text-sm cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
              <div className="mt-1">
                <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                  viewBatch.status === 'Complete'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>{viewBatch.status}</span>
              </div>
            </div>
          </div>

          {/* Cylinder Items in this batch */}
          <div className="pl-4 mt-6">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              Cylinders
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg text-xs font-bold border border-gray-200/50">{viewBatch.items.length}</span>
            </h3>
            {viewBatch.items.length > 0 ? (
              <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-white border-b border-gray-200 text-gray-500 font-bold tracking-wide text-xs uppercase">
                      <th className="p-3 pl-4">Serial Number</th>
                      <th className="p-3">Item Status</th>
                      <th className="p-3">QC Status</th>
                      <th className="p-3">Inventory Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {viewBatch.items.map(item => (
                      <tr key={item.serialNumber} className="hover:bg-sky-50/20 transition-colors">
                        <td className="p-3 pl-4 font-mono text-sky-700 font-semibold">{item.serialNumber}</td>
                        <td className="p-3 text-gray-600">{item.itemStatus || '—'}</td>
                        <td className="p-3">
                          {item.qcStatus ? (
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              item.qcStatus === 'QC Passed'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}>{item.qcStatus}</span>
                          ) : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="p-3 text-gray-600">{item.inventoryLocation || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center text-gray-400 italic text-sm">
                No cylinders added to this batch yet.
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'create' && (
        /* ─── CREATE VIEW ─── */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-sky-500"></div>
          <button
            onClick={handleBackToList}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-lg"
          >
            ✕
          </button>

          <h2 className="text-xl font-bold text-gray-800 mb-1 pl-4">Filling Batch Creation</h2>
          <p className="text-xs text-gray-400 pl-4 mb-6 uppercase tracking-widest font-semibold">Group cylinders into a batch</p>

          {submitted && (
            <div className="mx-4 mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">
              Batch created successfully! It is now the active batch. Add cylinders in Process Entry.
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6 pl-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Batch Number</label>
              <input type="text" value={form.batchNumber} disabled
                className="w-full bg-gray-50 border border-gray-200 text-sky-700 rounded-lg p-2.5 text-sm font-mono font-bold cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
              <input type="date" value={form.date} onChange={e => handleChange('date', e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 pl-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Product Type <span className="text-red-500">*</span></label>
              <select value={form.productType} onChange={e => handleChange('productType', e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-sky-500 outline-none">
                {Object.entries(productConfig).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.productName} ({key})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Gas Type <span className="text-red-500">*</span></label>
              <select value={form.gasType} onChange={e => handleChange('gasType', e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-sky-500 outline-none">
                <option>Oxygen</option>
                <option>Nitrogen</option>
                <option>Argon</option>
                <option>Hydrogen</option>
                <option>Acetylene</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 pl-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Filling Station <span className="text-red-500">*</span></label>
              <input type="text" value={form.fillingStation} onChange={e => handleChange('fillingStation', e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                placeholder="e.g. Station A" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tank ID (Source of Gas)</label>
              <input type="text" value={form.tankId} onChange={e => handleChange('tankId', e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                placeholder="e.g. TANK-001" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8 pl-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Operator Name <span className="text-red-500">*</span></label>
              <input type="text" value={form.operatorName} onChange={e => handleChange('operatorName', e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                placeholder="Enter operator name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Shift <span className="text-red-500">*</span></label>
              <select value={form.shift} onChange={e => handleChange('shift', e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-sky-500 outline-none">
                <option>Morning</option>
                <option>Evening</option>
                <option>Night</option>
              </select>
            </div>
          </div>

          <div className="pl-4 pt-4 border-t border-gray-100 flex justify-end">
            <button onClick={handleSubmit}
              className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2">
              Create Batch <span className="text-xl leading-none">→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
