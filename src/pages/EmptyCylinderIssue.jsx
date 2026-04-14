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
  const [showAddForm, setShowAddForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [filterDate, setFilterDate] = useState('');

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
      setIsCreating(false);
    } catch (err) {
      console.error('Failed to create issue:', err);
    }
  };

  const filteredIssues = filterDate ? issues.filter(iss => iss.date === filterDate) : issues;

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto font-sans">
      {!isCreating ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div>
              <h3 className="font-bold text-gray-800 text-lg">Cylinder Issue Records</h3>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-gray-600">Filter Date:</label>
                <div className="relative flex items-center">
                  <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="bg-white border border-gray-300 text-gray-700 rounded-lg p-2 pr-8 text-sm focus:ring-2 focus:ring-orange-500 outline-none shadow-sm" />
                  {filterDate && <button onClick={() => setFilterDate('')} className="absolute right-2 text-gray-400 hover:text-red-500 text-sm font-bold bg-white px-1">✕</button>}
                </div>
              </div>
              <button onClick={() => setIsCreating(true)} className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center gap-2">
                + Create New Issue
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-white border-b border-gray-200 text-gray-500 font-bold tracking-wide text-xs uppercase">
                  <th className="p-4">Issue ID</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">From → To</th>
                  <th className="p-4">Gas Type</th>
                  <th className="p-4 text-center">Cylinders</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredIssues.length > 0 ? filteredIssues.map(iss => (
                  <tr key={iss.issue_id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="p-4 font-mono text-orange-700 font-semibold">{iss.issue_id}</td>
                    <td className="p-4 text-gray-600">{iss.date}</td>
                    <td className="p-4 text-gray-700">{iss.from_location} <span className="text-gray-300 mx-1">→</span> {iss.to_location}</td>
                    <td className="p-4 text-gray-600 font-medium">{iss.gas_type_planned}</td>
                    <td className="p-4 text-center font-bold text-gray-800">
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg border border-gray-200/50">{iss.items.length}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                        iss.status === 'Completed'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>{iss.status}</span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="p-16 text-center text-gray-400 italic font-medium bg-gray-50/50">
                      No issue records found {filterDate ? 'for this date' : 'yet'}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-orange-500"></div>
          <button onClick={() => setIsCreating(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-lg">✕</button>

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
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Gas Type Planned <span className="text-red-500">*</span></label>
              <select value={form.gasTypePlanned} onChange={e => handleChange('gasTypePlanned', e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none shadow-sm">
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
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none shadow-sm"
                placeholder="e.g. Empty Yard / Warehouse" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">To Location <span className="text-red-500">*</span></label>
              <input type="text" value={form.toLocation} onChange={e => handleChange('toLocation', e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500 outline-none shadow-sm"
                placeholder="e.g. Filling Station A" />
            </div>
          </div>

          {/* Line Items */}
          <div className="pl-4 mb-6">
            <div className="flex items-center justify-between mb-3 border-t border-gray-100 pt-6">
              <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Line Items — Cylinders</h3>
              {!showAddForm && (
                <button onClick={() => setShowAddForm(true)} className="bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm">
                  + Add Cylinder
                </button>
              )}
            </div>

            {lineItems.length > 0 ? (
              <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden mb-4">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-white border-b border-gray-200 text-gray-500 text-xs uppercase tracking-widest font-bold">
                      <th className="p-3 pl-4">#</th>
                      <th className="p-3">Serial Number</th>
                      <th className="p-3">Cylinder Type</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right pr-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {lineItems.map((item, idx) => (
                      <tr key={item.serial_number} className="hover:bg-white transition-colors">
                        <td className="p-3 pl-4 text-gray-400 font-mono text-xs">{idx + 1}</td>
                        <td className="p-3 font-mono text-orange-700 font-bold tracking-tight">{item.serial_number}</td>
                        <td className="p-3 text-gray-600 font-medium">{item.cylinder_type}</td>
                        <td className="p-3">
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-bold border border-gray-200/50">
                            {item.current_status}
                          </span>
                        </td>
                        <td className="p-3 text-right pr-4">
                          <button onClick={() => removeLineItem(item.serial_number)}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg text-xs font-bold transition-colors">✕ Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-sm text-gray-400 italic mb-4 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50/50">
                No cylinders added yet. Click "+ Add Cylinder" to begin.
              </div>
            )}

            {showAddForm && (
              <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4 relative shadow-sm">
                <button onClick={() => setShowAddForm(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 font-bold bg-gray-50 hover:bg-gray-100 rounded-lg p-1.5 transition-colors">✕</button>
                <h4 className="text-[11px] font-bold text-gray-400 mb-3 uppercase tracking-widest">Add New Cylinder</h4>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Cylinder Serial Number</label>
                    <input type="text" value={serialInput} onChange={e => setSerialInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && serialInput.trim()) { addLineItem(); setShowAddForm(false); } }}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none font-mono uppercase transition-all shadow-inner"
                      placeholder="e.g. OXY-CYL-0101" autoFocus />
                  </div>
                  <div className="w-48">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Cylinder Type</label>
                    <select value={cylinderType} onChange={e => setCylinderType(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:bg-white outline-none transition-all shadow-inner">
                      <option>Standard</option>
                      <option>Jumbo</option>
                      <option>Small</option>
                      <option>Medical</option>
                    </select>
                  </div>
                  <button onClick={() => { addLineItem(); setShowAddForm(false); }} disabled={!serialInput.trim()}
                    className="bg-gray-800 hover:bg-gray-900 shadow-sm disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap">
                    Save Cylinder
                  </button>
                </div>
              </div>
            )}
            
            <p className="text-[11px] text-gray-500 mt-2 font-medium bg-orange-50/50 inline-block px-3 py-1.5 rounded-md border border-orange-100">👆 Only <strong>Empty</strong> cylinders allowed for issue to filling.</p>
          </div>

          <div className="pl-4 pt-4 border-t border-gray-100 flex justify-end">
            <button onClick={handleSubmit}
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2">
              Submit Issue Form <span className="text-xl leading-none">→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
