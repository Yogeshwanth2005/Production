import React, { useState, useEffect } from 'react';

export default function GasProductionEntry() {
  const [entries, setEntries] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [filterDate, setFilterDate] = useState('');
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

  const handleEditClick = (e) => {
    setForm({
      productionId: e.production_id,
      date: e.date,
      plantLocation: e.plant_location,
      gasType: e.gas_type,
      shift: e.shift,
      machineUnit: e.machine_unit,
      operatorName: e.operator_name,
      quantityProduced: e.quantity_produced || '',
      quantityUnit: e.quantity_unit || 'Kg',
      purityLevel: e.purity_level || '',
      pressureLevel: e.pressure_level || '',
      linkedTankId: e.linked_tank_id || '',
      remarks: e.remarks || '',
    });
    setIsEditing(true);
    setIsCreating(true);
    setIsViewOnly(e.approval_status === 'Approved');
  };

  const handleSubmit = async () => {
    if (!form.plantLocation || !form.machineUnit || !form.operatorName) {
      alert('Please fill all required fields');
      return;
    }

    const payload = {
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
    };

    try {
      if (isEditing) {
        await fetch(`/api/gas-production/${form.productionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch('/api/gas-production', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, production_id: form.productionId, approval_status: 'Pending' })
        });
      }
      
      setForm({
        productionId: `GPE-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toISOString().split('T')[0],
        plantLocation: '', gasType: 'Oxygen', shift: 'Morning',
        machineUnit: '', operatorName: '', quantityProduced: '',
        quantityUnit: 'Kg', purityLevel: '', pressureLevel: '',
        linkedTankId: '', remarks: '',
      });
      await fetchEntries();
      setIsCreating(false);
      setIsEditing(false);
      setIsViewOnly(false);
    } catch (err) {
      console.error('Failed to create/update entry:', err);
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

  const filteredEntries = filterDate ? entries.filter(e => e.date === filterDate) : entries;

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto font-sans">
      {!isCreating ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-violet-500 rounded-full"></div>
              <h3 className="font-bold text-gray-800 text-lg">Gas Production Records</h3>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-gray-600">Filter Date:</label>
                <div className="relative flex items-center">
                  <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="bg-white border border-gray-300 text-gray-700 rounded-lg p-2 pr-8 text-sm focus:ring-2 focus:ring-violet-500 outline-none shadow-sm" />
                  {filterDate && <button onClick={() => setFilterDate('')} className="absolute right-2 text-gray-400 hover:text-red-500 text-sm font-bold bg-white px-1">✕</button>}
                </div>
              </div>
              <button onClick={() => {
                setForm({
                  productionId: `GPE-${Math.floor(100000 + Math.random() * 900000)}`,
                  date: new Date().toISOString().split('T')[0],
                  plantLocation: '', gasType: 'Oxygen', shift: 'Morning',
                  machineUnit: '', operatorName: '', quantityProduced: '',
                  quantityUnit: 'Kg', purityLevel: '', pressureLevel: '',
                  linkedTankId: '', remarks: '',
                });
                setIsEditing(false);
                setIsCreating(true);
                setIsViewOnly(false);
              }} className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center gap-2">
                + New Production Entry
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-white border-b border-gray-200 text-gray-500 font-bold tracking-wide text-xs uppercase">
                  <th className="p-4">Production ID</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Gas Type</th>
                  <th className="p-4">Quantity</th>
                  <th className="p-4">Purity %</th>
                  <th className="p-4">Operator</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEntries.length > 0 ? filteredEntries.map(e => (
                  <tr key={e.production_id} className="hover:bg-violet-50/30 transition-colors">
                    <td className="p-4 font-mono text-violet-700 font-semibold">
                      <button onClick={() => handleEditClick(e)} className="hover:underline hover:text-violet-900 cursor-pointer text-left transition-colors font-bold truncate group">
                        {e.production_id} <span className="opacity-0 group-hover:opacity-100 text-[10px] text-violet-500 ml-1 inline-block uppercase tracking-wider transition-opacity">{e.approval_status === 'Approved' ? '👁 View' : '✎ Edit'}</span>
                      </button>
                    </td>
                    <td className="p-4 text-gray-600">{e.date}</td>
                    <td className="p-4 text-gray-700 font-medium">{e.gas_type}</td>
                    <td className="p-4 font-mono">{e.quantity_produced} {e.quantity_unit}</td>
                    <td className="p-4 font-mono">{e.purity_level}%</td>
                    <td className="p-4 text-gray-600">{e.operator_name}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                        e.approval_status === 'Approved'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>{e.approval_status}</span>
                    </td>
                    <td className="p-4 text-right pr-6">
                      {e.approval_status === 'Pending' ? (
                        <button onClick={() => handleApprove(e.production_id)}
                          className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border border-green-200 px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm">
                          ✓ Approve
                        </button>
                      ) : (
                        <span className="text-gray-300 text-xs italic">Approved</span>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="8" className="p-16 text-center text-gray-400 italic font-medium bg-gray-50/50">
                      No production records found {filterDate ? 'for this date' : 'yet'}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-violet-500"></div>
          <button onClick={() => { setIsCreating(false); setIsEditing(false); setIsViewOnly(false); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-lg">✕</button>

          <h2 className="text-xl font-bold text-gray-800 mb-1 pl-4">
            {isViewOnly ? 'Gas Production Details (Read-Only)' : isEditing ? 'Edit Gas Production Entry' : 'Gas Production Entry'}
          </h2>
          <p className="text-xs text-gray-400 pl-4 mb-6 uppercase tracking-widest font-semibold">
            {isViewOnly ? 'Viewing approved production data' : isEditing ? 'Update existing records' : 'Record gas generated in plant'}
          </p>

          <div className="grid grid-cols-4 gap-4 mb-6 pl-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Production ID</label>
              <input type="text" value={form.productionId} readOnly disabled={isViewOnly}
                className="w-full bg-violet-50 border border-violet-200 font-mono text-violet-800 rounded-lg p-2.5 text-sm disabled:opacity-75" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Date {!isViewOnly && <span className="text-red-500">*</span>}</label>
              <input type="date" value={form.date} onChange={e => handleChange('date', e.target.value)} disabled={isViewOnly}
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none shadow-sm disabled:bg-gray-50 disabled:text-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Plant / Location {!isViewOnly && <span className="text-red-500">*</span>}</label>
              <input type="text" value={form.plantLocation} onChange={e => handleChange('plantLocation', e.target.value)} disabled={isViewOnly}
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none shadow-sm disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="e.g. Oxygen Plant A" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Gas Type {!isViewOnly && <span className="text-red-500">*</span>}</label>
              <select value={form.gasType} onChange={e => handleChange('gasType', e.target.value)} disabled={isViewOnly}
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none shadow-sm disabled:bg-gray-50 disabled:text-gray-500">
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
              <label className="block text-sm font-semibold text-gray-700 mb-1">Shift {!isViewOnly && <span className="text-red-500">*</span>}</label>
              <select value={form.shift} onChange={e => handleChange('shift', e.target.value)} disabled={isViewOnly}
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none shadow-sm disabled:bg-gray-50 disabled:text-gray-500">
                <option>Morning</option>
                <option>Evening</option>
                <option>Night</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Machine / Unit {!isViewOnly && <span className="text-red-500">*</span>}</label>
              <input type="text" value={form.machineUnit} onChange={e => handleChange('machineUnit', e.target.value)} disabled={isViewOnly}
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none shadow-sm disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="e.g. ASU-01" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Operator Name {!isViewOnly && <span className="text-red-500">*</span>}</label>
              <input type="text" value={form.operatorName} onChange={e => handleChange('operatorName', e.target.value)} disabled={isViewOnly}
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none shadow-sm disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Enter operator name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Linked Tank ID</label>
              <input type="text" value={form.linkedTankId} onChange={e => handleChange('linkedTankId', e.target.value)} disabled={isViewOnly}
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none shadow-sm disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="e.g. TANK-001" />
            </div>
          </div>

          <h3 className="text-sm font-bold text-gray-600 pl-4 mb-3 uppercase tracking-wider border-t border-gray-100 pt-6 mt-2">Production Details</h3>
          <div className="grid grid-cols-4 gap-4 mb-6 pl-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Quantity Produced</label>
              <div className="flex gap-2">
                <input type="number" step="0.01" value={form.quantityProduced} onChange={e => handleChange('quantityProduced', e.target.value)} disabled={isViewOnly}
                  className="flex-1 bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none shadow-sm disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="0.00" />
                <select value={form.quantityUnit} onChange={e => handleChange('quantityUnit', e.target.value)} disabled={isViewOnly}
                  className="w-20 bg-white border border-gray-300 rounded-lg p-2.5 text-sm outline-none shadow-sm disabled:bg-gray-50 disabled:text-gray-500">
                  <option>Kg</option>
                  <option>Liters</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Purity Level (%)</label>
              <input type="number" step="0.01" value={form.purityLevel} onChange={e => handleChange('purityLevel', e.target.value)} disabled={isViewOnly}
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none shadow-sm disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="e.g. 99.5" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Pressure Level</label>
              <input type="number" step="0.01" value={form.pressureLevel} onChange={e => handleChange('pressureLevel', e.target.value)} disabled={isViewOnly}
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none shadow-sm disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="e.g. 150" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Remarks</label>
              <input type="text" value={form.remarks} onChange={e => handleChange('remarks', e.target.value)} disabled={isViewOnly}
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none shadow-sm disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Optional remarks" />
            </div>
          </div>

          {!isViewOnly && (
            <div className="pl-4 pt-4 border-t border-gray-100 flex justify-end">
              <button onClick={handleSubmit}
                className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2">
                {isEditing ? 'Update Production Entry' : 'Submit Production Entry'} <span className="text-xl leading-none">→</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
