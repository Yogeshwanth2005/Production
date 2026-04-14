import React, { useState, useEffect } from 'react';

export default function EmptyCylinderIssue() {
  const [issues, setIssues] = useState([]);
  const [form, setForm] = useState({
    issueId: `ISS-${Math.floor(100000 + Math.random() * 900000)}`,
    date: new Date().toISOString().split('T')[0],
    fromLocation: '',
    toLocation: '',
    gasTypePlanned: 'Oxygen',
  });
  const [serialInput, setSerialInput] = useState('');
  const [cylinderType, setCylinderType] = useState('Standard');
  const [lineItems, setLineItems] = useState([]);

  const fetchIssues = async () => {
    try {
      const res = await fetch('/api/cylinder-issues');
      const data = await res.json();
      setIssues(data);
    } catch (err) {
      console.error('Failed to fetch cylinder issues:', err);
    }
  };

  useEffect(() => { fetchIssues(); }, []);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const addLineItem = () => {
    if (!serialInput.trim()) return;
    if (lineItems.some(i => i.serial_number === serialInput.trim())) {
      alert('Cylinder already added');
      return;
    }
    setLineItems(prev => [...prev, {
      serial_number: serialInput.trim(),
      cylinder_type: cylinderType,
      current_status: 'Empty'
    }]);
    setSerialInput('');
  };

  const removeLineItem = (serial) => {
    setLineItems(prev => prev.filter(i => i.serial_number !== serial));
  };

  const handleSubmit = async () => {
    if (!form.fromLocation || !form.toLocation) {
      alert('Please fill From Location and To Location');
      return;
    }
    if (lineItems.length === 0) {
      alert('Please add at least one cylinder');
      return;
    }

    try {
      await fetch('/api/cylinder-issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issue_id: form.issueId,
          date: form.date,
          from_location: form.fromLocation,
          to_location: form.toLocation,
          gas_type_planned: form.gasTypePlanned,
          items: lineItems,
        })
      });

      setForm({
        issueId: `ISS-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toISOString().split('T')[0],
        fromLocation: '', toLocation: '', gasTypePlanned: 'Oxygen',
      });
      setLineItems([]);
      await fetchIssues();
    } catch (err) {
      console.error('Failed to create issue:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto font-sans">
      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-orange-500"></div>

        <h2 className="text-xl font-bold text-gray-800 mb-1 pl-4">Empty Cylinder Issue to Filling</h2>
        <p className="text-xs text-gray-400 pl-4 mb-6 uppercase tracking-widest font-semibold">Move empty cylinders → filling station</p>

        <div className="grid grid-cols-3 gap-4 mb-6 pl-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Issue ID</label>
            <input type="text" value={form.issueId} readOnly
              className="w-full bg-orange-50 border border-orange-200 font-mono text-orange-800 rounded-lg p-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
            <input type="date" value={form.date} onChange={e => handleChange('date', e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Gas Type Planned <span className="text-red-500">*</span></label>
            <select value={form.gasTypePlanned} onChange={e => handleChange('gasTypePlanned', e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none">
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
            <label className="block text-sm font-semibold text-gray-700 mb-1">From Location <span className="text-red-500">*</span></label>
            <input type="text" value={form.fromLocation} onChange={e => handleChange('fromLocation', e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              placeholder="e.g. Empty Yard / Warehouse" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">To Location <span className="text-red-500">*</span></label>
            <input type="text" value={form.toLocation} onChange={e => handleChange('toLocation', e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              placeholder="e.g. Filling Station A" />
          </div>
        </div>

        {/* Line Items */}
        <div className="pl-4 mb-6">
          <h3 className="text-sm font-bold text-gray-600 mb-3 uppercase tracking-wider">Line Items — Cylinders</h3>
          <div className="flex items-end gap-3 mb-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Cylinder Serial Number</label>
              <input type="text" value={serialInput} onChange={e => setSerialInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addLineItem(); }}
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none font-mono uppercase"
                placeholder="e.g. OXY-CYL-0101" />
            </div>
            <div className="w-40">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Cylinder Type</label>
              <select value={cylinderType} onChange={e => setCylinderType(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm outline-none">
                <option>Standard</option>
                <option>Jumbo</option>
                <option>Small</option>
                <option>Medical</option>
              </select>
            </div>
            <button onClick={addLineItem} disabled={!serialInput.trim()}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap">
              + Add
            </button>
          </div>

          {lineItems.length > 0 && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wider font-semibold">
                    <th className="p-3">#</th>
                    <th className="p-3">Serial Number</th>
                    <th className="p-3">Cylinder Type</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {lineItems.map((item, idx) => (
                    <tr key={item.serial_number} className="hover:bg-orange-50/30">
                      <td className="p-3 text-gray-400 font-mono text-xs">{idx + 1}</td>
                      <td className="p-3 font-mono text-orange-700 font-semibold">{item.serial_number}</td>
                      <td className="p-3 text-gray-600">{item.cylinder_type}</td>
                      <td className="p-3">
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold border border-gray-200">
                          {item.current_status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button onClick={() => removeLineItem(item.serial_number)}
                          className="text-red-500 hover:text-red-700 text-xs font-medium">✕ Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="text-xs text-orange-600 mt-2 font-medium">👆 Only <strong>Empty</strong> cylinders allowed for issue to filling.</p>
        </div>

        <div className="pl-4">
          <button onClick={handleSubmit}
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm">
            Submit Issue
          </button>
        </div>
      </div>

      {/* Issue History */}
      {issues.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-800">Issue History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold tracking-wide text-xs uppercase">
                  <th className="p-4">Issue ID</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">From → To</th>
                  <th className="p-4">Gas Type</th>
                  <th className="p-4 text-center">Cylinders</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {issues.map(iss => (
                  <tr key={iss.issue_id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="p-4 font-mono text-orange-700 font-semibold">{iss.issue_id}</td>
                    <td className="p-4 text-gray-600">{iss.date}</td>
                    <td className="p-4 text-gray-700">{iss.from_location} → {iss.to_location}</td>
                    <td className="p-4 text-gray-600">{iss.gas_type_planned}</td>
                    <td className="p-4 text-center font-bold">{iss.items.length}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                        iss.status === 'Completed'
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-amber-100 text-amber-700 border-amber-200'
                      }`}>{iss.status}</span>
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
