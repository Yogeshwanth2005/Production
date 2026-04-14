import React, { useState } from 'react';
import { useSharedState } from '../context/SharedStateContext';

export default function FillingBatchCreation() {
  const { productConfig, addBatch } = useSharedState();

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

  const generateBatchNumber = () => {
    const prefix = form.gasType.substring(0, 3).toUpperCase();
    const num = Math.floor(1000 + Math.random() * 9000);
    const year = new Date().getFullYear();
    setForm(prev => ({ ...prev, batchNumber: `BATCH-${year}-${prefix}-${num}` }));
  };

  const handleSubmit = async () => {
    if (!form.batchNumber || !form.fillingStation || !form.operatorName) {
      alert('Please fill all required fields (Batch Number, Filling Station, Operator Name)');
      return;
    }

    try {
      // Create batch via API with extended fields
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
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);

      // Reset form
      setForm({
        batchNumber: '', date: new Date().toISOString().split('T')[0],
        productType: Object.keys(productConfig)[0], gasType: 'Oxygen',
        fillingStation: '', tankId: '', operatorName: '', shift: 'Morning',
      });

      // Refresh batches in context
      window.location.reload();
    } catch (err) {
      console.error('Failed to create batch:', err);
      alert('Failed to create batch. Check if batch number already exists.');
    }
  };

  return (
    <div className="space-y-6 max-w-[900px] mx-auto font-sans">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-sky-500"></div>

        <h2 className="text-xl font-bold text-gray-800 mb-1 pl-4">Filling Batch Creation</h2>
        <p className="text-xs text-gray-400 pl-4 mb-6 uppercase tracking-widest font-semibold">Group cylinders into a batch</p>

        {submitted && (
          <div className="mx-4 mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">
            ✓ Batch created successfully! It is now the active batch. Add cylinders in Process Entry.
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6 pl-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Batch Number <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              <input type="text" value={form.batchNumber} onChange={e => handleChange('batchNumber', e.target.value)}
                className="flex-1 bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-sky-500 outline-none font-mono"
                placeholder="e.g. BATCH-2024-OXY-001" />
              <button onClick={generateBatchNumber}
                className="bg-sky-100 text-sky-700 px-3 rounded-lg text-xs font-semibold hover:bg-sky-200 transition-colors border border-sky-200 whitespace-nowrap">
                Auto-Generate
              </button>
            </div>
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

        <div className="pl-4">
          <button onClick={handleSubmit}
            className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm">
            Create Batch
          </button>
        </div>
      </div>
    </div>
  );
}
