import React, { useState, useEffect } from 'react';

export default function GasProductionEntry() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({
    productionId: `GPE-${Math.floor(100000 + Math.random() * 900000)}`,
    date: new Date().toISOString().split('T')[0],
    plantLocation: '',
    gasType: 'Oxygen',
    shift: 'Morning',
    machineUnit: '',
    operatorName: '',
    quantityProduced: '',
    quantityUnit: 'Kg',
    purityLevel: '',
    pressureLevel: '',
    linkedTankId: '',
    remarks: '',
  });

  const fetchEntries = async () => {
    try {
      const res = await fetch('/api/gas-production');
      const data = await res.json();
      setEntries(data);
    } catch (err) {
      console.error('Failed to fetch gas production entries:', err);
    }
  };

  useEffect(() => { fetchEntries(); }, []);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.plantLocation || !form.machineUnit || !form.operatorName) {
      alert('Please fill all required fields');
      return;
    }
    try {
      await fetch('/api/gas-production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          production_id: form.productionId,
          date: form.date,
          plant_location: form.plantLocation,
          gas_type: form.gasType,
          shift: form.shift,
          machine_unit: form.machineUnit,
          operator_name: form.operatorName,
          quantity_produced: parseFloat(form.quantityProduced) || 0,
          quantity_unit: form.quantityUnit,
          purity_level: parseFloat(form.purityLevel) || 0,
          pressure_level: parseFloat(form.pressureLevel) || 0,
          linked_tank_id: form.linkedTankId,
          remarks: form.remarks,
          approval_status: 'Pending',
        })
      });
      setForm({
        productionId: `GPE-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toISOString().split('T')[0],
        plantLocation: '', gasType: 'Oxygen', shift: 'Morning',
        machineUnit: '', operatorName: '', quantityProduced: '',
        quantityUnit: 'Kg', purityLevel: '', pressureLevel: '',
        linkedTankId: '', remarks: '',
      });
      await fetchEntries();
    } catch (err) {
      console.error('Failed to create entry:', err);
    }
  };

  const handleApprove = async (prodId) => {
    await fetch(`/api/gas-production/${prodId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approval_status: 'Approved' })
    });
    await fetchEntries();
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto font-sans">
      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-violet-500"></div>

        <h2 className="text-xl font-bold text-gray-800 mb-1 pl-4">Gas Production Entry</h2>
        <p className="text-xs text-gray-400 pl-4 mb-6 uppercase tracking-widest font-semibold">Record gas generated in plant</p>

        <div className="grid grid-cols-4 gap-4 mb-6 pl-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Production ID</label>
            <input type="text" value={form.productionId} readOnly
              className="w-full bg-violet-50 border border-violet-200 font-mono text-violet-800 rounded-lg p-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
            <input type="date" value={form.date} onChange={e => handleChange('date', e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Plant / Location <span className="text-red-500">*</span></label>
            <input type="text" value={form.plantLocation} onChange={e => handleChange('plantLocation', e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
              placeholder="e.g. Oxygen Plant A" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Gas Type <span className="text-red-500">*</span></label>
            <select value={form.gasType} onChange={e => handleChange('gasType', e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none">
              <option>Oxygen</option>
              <option>Nitrogen</option>
              <option>Argon</option>
              <option>Hydrogen</option>
              <option>Acetylene</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6 pl-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Shift <span className="text-red-500">*</span></label>
            <select value={form.shift} onChange={e => handleChange('shift', e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none">
              <option>Morning</option>
              <option>Evening</option>
              <option>Night</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Machine / Unit <span className="text-red-500">*</span></label>
            <input type="text" value={form.machineUnit} onChange={e => handleChange('machineUnit', e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
              placeholder="e.g. ASU-01" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Operator Name <span className="text-red-500">*</span></label>
            <input type="text" value={form.operatorName} onChange={e => handleChange('operatorName', e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
              placeholder="Enter operator name" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Linked Tank ID</label>
            <input type="text" value={form.linkedTankId} onChange={e => handleChange('linkedTankId', e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
              placeholder="e.g. TANK-001" />
          </div>
        </div>

        <h3 className="text-sm font-bold text-gray-600 pl-4 mb-3 uppercase tracking-wider">Production Details</h3>
        <div className="grid grid-cols-4 gap-4 mb-6 pl-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Quantity Produced</label>
            <div className="flex gap-2">
              <input type="number" step="0.01" value={form.quantityProduced} onChange={e => handleChange('quantityProduced', e.target.value)}
                className="flex-1 bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                placeholder="0.00" />
              <select value={form.quantityUnit} onChange={e => handleChange('quantityUnit', e.target.value)}
                className="w-20 bg-white border border-gray-300 rounded-lg p-2.5 text-sm outline-none">
                <option>Kg</option>
                <option>Liters</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Purity Level (%)</label>
            <input type="number" step="0.01" value={form.purityLevel} onChange={e => handleChange('purityLevel', e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
              placeholder="e.g. 99.5" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Pressure Level</label>
            <input type="number" step="0.01" value={form.pressureLevel} onChange={e => handleChange('pressureLevel', e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
              placeholder="e.g. 150" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Remarks</label>
            <input type="text" value={form.remarks} onChange={e => handleChange('remarks', e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
              placeholder="Optional remarks" />
          </div>
        </div>

        <div className="pl-4">
          <button onClick={handleSubmit}
            className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm">
            Submit Production Entry
          </button>
        </div>
      </div>

      {/* History Table */}
      {entries.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-800">Production History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold tracking-wide text-xs uppercase">
                  <th className="p-4">Production ID</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Gas Type</th>
                  <th className="p-4">Quantity</th>
                  <th className="p-4">Purity %</th>
                  <th className="p-4">Operator</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {entries.map(e => (
                  <tr key={e.production_id} className="hover:bg-violet-50/30 transition-colors">
                    <td className="p-4 font-mono text-violet-700 font-semibold">{e.production_id}</td>
                    <td className="p-4 text-gray-600">{e.date}</td>
                    <td className="p-4 text-gray-700 font-medium">{e.gas_type}</td>
                    <td className="p-4 font-mono">{e.quantity_produced} {e.quantity_unit}</td>
                    <td className="p-4 font-mono">{e.purity_level}%</td>
                    <td className="p-4 text-gray-600">{e.operator_name}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                        e.approval_status === 'Approved'
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-amber-100 text-amber-700 border-amber-200'
                      }`}>{e.approval_status}</span>
                    </td>
                    <td className="p-4 text-right">
                      {e.approval_status === 'Pending' && (
                        <button onClick={() => handleApprove(e.production_id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-all">
                          ✓ Approve
                        </button>
                      )}
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
