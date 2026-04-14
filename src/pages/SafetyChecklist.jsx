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

  const [checklistId, setChecklistId] = useState(generateId);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [fillingStation, setFillingStation] = useState('');
  const [supervisorName, setSupervisorName] = useState('');
  const [checks, setChecks] = useState({ ...DEFAULT_CHECKS });
  const [submitted, setSubmitted] = useState(false);

  const toggleCheck = (id) => {
    setChecks(prev => ({ ...prev, [id]: prev[id] === 'OK' ? 'Not OK' : 'OK' }));
  };

  const handleSubmit = () => {
    if (!fillingStation.trim() || !supervisorName.trim()) return;
    const allOK = Object.values(checks).every(v => v === 'OK');
    addSafetyChecklist({
      id: checklistId,
      batchNumber: activeBatch?.batchNumber || 'N/A',
      date,
      fillingStation,
      supervisorName,
      checks: { ...checks },
      status: allOK ? 'Passed' : 'Failed',
    });
    setSubmitted(true);
  };

  const handleNewChecklist = () => {
    setChecklistId(generateId());
    setFillingStation('');
    setSupervisorName('');
    setChecks({ ...DEFAULT_CHECKS });
    setDate(new Date().toISOString().split('T')[0]);
    setSubmitted(false);
  };

  const allOK = Object.values(checks).every(v => v === 'OK');

  return (
    <div className="space-y-6 max-w-[900px] mx-auto font-sans">

      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
        <h2 className="text-lg font-bold text-gray-800 mb-1 border-b border-gray-100 pb-3">Safety Checklist</h2>
        <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider mb-6">Mandatory Compliance</p>

        {submitted ? (
          <div className="flex flex-col items-center py-10 text-center">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-3xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Checklist Submitted!</h3>
            <p className="text-gray-500 mb-1">Checklist ID: <span className="font-mono font-bold text-amber-700">{checklistId}</span></p>
            <p className="text-gray-500 mb-6">Safety status recorded as <span className={`font-bold ${allOK ? 'text-green-600' : 'text-red-600'}`}>{allOK ? 'PASSED' : 'FAILED'}</span></p>
            <button
              onClick={handleNewChecklist}
              className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm"
            >
              🛡️ New Checklist
            </button>
          </div>
        ) : (
          <>
            {/* Header Fields */}
            <div className="grid grid-cols-2 gap-6 mb-6">
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
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                <span className="text-base">📋</span>
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
                      className={`px-6 py-1.5 rounded-full text-sm font-bold border transition-all ${
                        checks[ci.id] === 'OK'
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
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-6 border ${allOK ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <span className="text-lg">{allOK ? '✅' : '⚠️'}</span>
              <span className={`text-sm font-semibold ${allOK ? 'text-green-700' : 'text-red-700'}`}>
                {allOK ? 'All checks are OK — Ready to submit.' : 'One or more checks are NOT OK. Review before submitting.'}
              </span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!fillingStation.trim() || !supervisorName.trim()}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold text-sm transition-all shadow-sm"
            >
              🛡️ Submit Safety Checklist
            </button>
          </>
        )}
      </div>

      {/* History Table */}
      {safetyChecklists.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
            <span className="text-base">📜</span>
            <h3 className="font-bold text-gray-800">Submission History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold tracking-wide text-xs uppercase">
                  <th className="p-4">Checklist ID</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Filling Station</th>
                  <th className="p-4">Supervisor</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[...safetyChecklists].reverse().map(cl => (
                  <tr key={cl.id} className="hover:bg-amber-50/20 transition-colors">
                    <td className="p-4 font-mono text-amber-700 font-semibold">{cl.id}</td>
                    <td className="p-4 text-gray-600">{cl.date}</td>
                    <td className="p-4 text-gray-600">{cl.fillingStation}</td>
                    <td className="p-4 text-gray-600">{cl.supervisorName}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                        cl.status === 'Passed'
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-red-100 text-red-700 border-red-200'
                      }`}>
                        {cl.status}
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
