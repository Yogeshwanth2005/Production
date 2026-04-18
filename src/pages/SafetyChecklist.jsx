import React, { useState } from 'react';
import { useSharedState } from '../context/SharedStateContext';

const CHECKLIST_ITEMS = [
  { id: 'equipmentCondition', label: 'Equipment Condition', icon: '🔧' },
  { id: 'safetyValves', label: 'Safety Valves Checked', icon: '🔩' },
  { id: 'fireSafety', label: 'Fire Safety Equipment Available', icon: '🧯' },
  { id: 'ppeCompliance', label: 'PPE Compliance', icon: '🦺' },
];

const DEFAULT_CHECKS = {
  equipmentCondition: 'OK',
  safetyValves: 'OK',
  fireSafety: 'OK',
  ppeCompliance: 'OK',
};

function generateId() {
  return `SCL-${Date.now().toString().slice(-6)}`;
}

export default function SafetyChecklist() {
  const { activeBatch, safetyChecklists, addSafetyChecklist } = useSharedState();

  const [view, setView] = useState('list'); // 'list' | 'create' | 'detail'
  const [viewingChecklist, setViewingChecklist] = useState(null);

  const [checklistId, setChecklistId] = useState(generateId);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [fillingStation, setFillingStation] = useState('');
  const [supervisorName, setSupervisorName] = useState('');
  const [checks, setChecks] = useState({ ...DEFAULT_CHECKS });

  const toggleCheck = (id) => {
    setChecks(prev => ({ ...prev, [id]: prev[id] === 'OK' ? 'Not OK' : 'OK' }));
  };

  const allOK = Object.values(checks).every(v => v === 'OK');

  const handleStartCreating = () => {
    setChecklistId(generateId());
    setFillingStation('');
    setSupervisorName('');
    setChecks({ ...DEFAULT_CHECKS });
    setDate(new Date().toISOString().split('T')[0]);
    setView('create');
  };

  const handleSubmit = () => {
    if (!fillingStation.trim() || !supervisorName.trim()) return;
    addSafetyChecklist({
      id: checklistId,
      batchNumber: activeBatch?.batchNumber || 'N/A',
      date,
      fillingStation,
      supervisorName,
      checks: { ...checks },
      status: allOK ? 'Passed' : 'Failed',
    });
    setView('list');
  };

  const handleViewChecklist = (cl) => {
    setViewingChecklist(cl);
    setView('detail');
  };

  const handleBackToList = () => {
    setView('list');
    setViewingChecklist(null);
  };


  // ── DETAIL VIEW ──────────────────────────────────────────────
  if (view === 'detail' && viewingChecklist) {
    return (
      <div className="space-y-6 max-w-[1200px] mx-auto font-sans">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-amber-500"></div>

          <button
            onClick={handleBackToList}
            className="absolute top-4 right-4 flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm font-semibold bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors border border-gray-200"
          >
            ← Back to List
          </button>

          <h2 className="text-xl font-bold text-gray-800 mb-1 pl-4">Checklist Details</h2>
          <p className="text-xs text-gray-400 pl-4 mb-6 uppercase tracking-widest font-semibold">
            Safety compliance record
          </p>

          {/* Header fields */}
          <div className="grid grid-cols-4 gap-4 mb-6 pl-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Checklist ID</label>
              <div className="bg-amber-50 border border-amber-200 font-mono text-amber-800 rounded-lg p-2.5 text-sm font-bold">
                {viewingChecklist.id}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Date</label>
              <div className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg p-2.5 text-sm font-medium">
                {viewingChecklist.date}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Filling Station</label>
              <div className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg p-2.5 text-sm font-medium">
                {viewingChecklist.fillingStation}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Supervisor</label>
              <div className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg p-2.5 text-sm font-medium">
                {viewingChecklist.supervisorName}
              </div>
            </div>
          </div>

          {/* Check Results */}
          <div className="pl-4 mb-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 border-t border-gray-100 pt-5">Check Results</h3>
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-white border-b border-gray-200 text-gray-500 text-xs uppercase tracking-widest font-bold">
                    <th className="p-3 pl-4">Check Item</th>
                    <th className="p-3 text-right pr-4">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {CHECKLIST_ITEMS.map(ci => (
                    <tr key={ci.id} className="hover:bg-white transition-colors">
                      <td className="p-3 pl-4 flex items-center gap-3">
                        <span className="text-xl">{ci.icon}</span>
                        <span className="text-sm font-medium text-gray-700">{ci.label}</span>
                      </td>
                      <td className="p-3 text-right pr-4">
                        <span className={`px-4 py-1 rounded-full text-xs font-bold border ${
                          viewingChecklist.checks[ci.id] === 'OK'
                            ? 'bg-green-100 text-green-700 border-green-300'
                            : 'bg-red-100 text-red-700 border-red-300'
                        }`}>
                          {viewingChecklist.checks[ci.id]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Overall Status */}
          <div className="pl-4">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
              viewingChecklist.status === 'Passed' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <span className="text-lg">{viewingChecklist.status === 'Passed' ? '✅' : '⚠️'}</span>
              <span className={`text-sm font-semibold ${viewingChecklist.status === 'Passed' ? 'text-green-700' : 'text-red-700'}`}>
                Overall Status: {viewingChecklist.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }


  // ── CREATE VIEW ────────────────────────────────────────────────
  if (view === 'create') {
    return (
      <div className="space-y-6 max-w-[900px] mx-auto font-sans">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-amber-500"></div>
          <button
            onClick={handleBackToList}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-lg"
          >
            ✕
          </button>

          <h2 className="text-xl font-bold text-gray-800 mb-1 pl-4">Safety Checklist</h2>
          <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider pl-4 mb-6">Mandatory Compliance</p>

          {/* Header Fields */}
          <div className="grid grid-cols-2 gap-6 mb-6 pl-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Checklist ID</label>
              <input
                type="text" disabled value={checklistId}
                className="w-full bg-gray-50 border border-gray-200 text-amber-700 rounded-lg p-2.5 text-sm font-mono font-bold cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
              <input
                type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filling Station <span className="text-red-500">*</span></label>
              <input
                type="text" value={fillingStation} onChange={e => setFillingStation(e.target.value)}
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                placeholder="e.g. Station A"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Supervisor Name <span className="text-red-500">*</span></label>
              <input
                type="text" value={supervisorName} onChange={e => setSupervisorName(e.target.value)}
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                placeholder="Enter supervisor name"
              />
            </div>
          </div>

          {/* Checklist Items */}
          <div className="border border-gray-200 rounded-xl overflow-hidden mb-6 ml-4">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Checklist Items</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {CHECKLIST_ITEMS.map(ci => (
                <div key={ci.id} className="flex items-center justify-between px-5 py-4 hover:bg-amber-50/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{ci.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{ci.label}</span>
                  </div>
                  <button
                    onClick={() => toggleCheck(ci.id)}
                    className={`px-6 py-1.5 rounded-full text-sm font-bold border transition-all ${checks[ci.id] === 'OK'
                        ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200'
                        : 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200'
                      }`}
                  >
                    {checks[ci.id]}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Overall Status Preview */}
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-6 border ml-4 ${allOK ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <span className="text-lg">{allOK ? '✅' : '⚠️'}</span>
            <span className={`text-sm font-semibold ${allOK ? 'text-green-700' : 'text-red-700'}`}>
              {allOK ? 'All checks are OK — Ready to submit.' : 'One or more checks are NOT OK. Review before submitting.'}
            </span>
          </div>

          <div className="pl-4 pt-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!fillingStation.trim() || !supervisorName.trim()}
              className="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              Submit Safety Checklist <span className="text-xl leading-none">→</span>
            </button>
          </div>
        </div>
      </div>
    );
  }


  // ── LIST VIEW ──────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-[1200px] mx-auto font-sans">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
            <h3 className="font-bold text-gray-800 text-lg">Safety Checklist Records</h3>
          </div>
          <button
            onClick={handleStartCreating}
            className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
          >
            + New Checklist
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-white border-b border-gray-200 text-gray-500 font-bold tracking-wide text-xs uppercase">
                <th className="p-4">Checklist ID</th>
                <th className="p-4">Date</th>
                <th className="p-4">Filling Station</th>
                <th className="p-4">Supervisor</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {safetyChecklists.length > 0 ? [...safetyChecklists].reverse().map(cl => (
                <tr key={cl.id} className="hover:bg-amber-50/30 transition-colors cursor-pointer" onClick={() => handleViewChecklist(cl)}>
                  <td className="p-4">
                    <span className="font-mono text-amber-600 font-semibold hover:text-amber-800 hover:underline underline-offset-2 transition-colors">
                      {cl.id}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{cl.date}</td>
                  <td className="p-4 text-gray-600">{cl.fillingStation}</td>
                  <td className="p-4 text-gray-600">{cl.supervisorName}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${cl.status === 'Passed'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                      {cl.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="p-16 text-center text-gray-400 italic font-medium bg-gray-50/50">
                    No safety checklists submitted yet. Click "+ New Checklist" to create one.
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
