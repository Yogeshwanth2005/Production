import React, { useState, useEffect } from 'react';
import { useSharedState } from '../context/SharedStateContext';

export default function SealingEntry() {
  const { activeBatch, activeProductConfig, updateItemInBatch } = useSharedState();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [sealingId] = useState(`SEAL-${Date.now().toString().slice(-6)}`);
  
  if (!activeBatch || !activeProductConfig) return <div>Loading...</div>;

  // The instruction says "Block Sealing screen if batch is not yet completed"
  if (activeBatch.status !== "Complete") {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-white rounded-xl shadow-sm border border-gray-200 min-h-[400px]">
         <div className="text-4xl mb-4">🔒</div>
         <h2 className="text-xl font-bold text-gray-800 mb-2">Batch Not Complete</h2>
         <p className="text-gray-500">You cannot seal items for a batch that is still processing. Please complete the batch on the Summary screen first.</p>
      </div>
    );
  }

  // Only "Produced" + "QC Passed" items. (We mocked QC Passed when processing).
  const itemsToSeal = activeBatch.items.filter(i => 
    i.itemStatus === "Produced" && i.qcStatus === "QC Passed" && i.processStatus === "Success"
  );
  
  return (
    <div className="space-y-6 max-w-[1200px] mx-auto font-sans">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
        <h2 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-3">Sealing / Packaging Entry</h2>
        
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sealing ID</label>
            <input type="text" disabled value={sealingId} className="w-full bg-gray-50 border border-gray-200 text-indigo-700 rounded-lg p-2.5 text-sm font-mono font-bold cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Batch Number</label>
            <input type="text" disabled value={activeBatch.batchNumber} className="w-full bg-gray-50 border border-gray-200 text-gray-500 rounded-lg p-2.5 text-sm cursor-not-allowed font-medium" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold tracking-wide text-xs uppercase">
                <th className="p-4">Serial Number</th>
                <th className="p-4">Seal / Package Number</th>
                <th className="p-4">Seal Type</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {itemsToSeal.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-gray-500 font-medium">
                     No items pending sealing or QC check failed.
                  </td>
                </tr>
              ) : itemsToSeal.map(item => (
                <SealingRow 
                  key={item.serialNumber} 
                  item={item} 
                  date={date}
                  sealOptions={activeProductConfig.sealOptions}
                  batchNum={activeBatch.batchNumber} 
                  updateFn={updateItemInBatch} 
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SealingRow({ item, date, sealOptions, batchNum, updateFn }) {
  const [sealNum, setSealNum] = useState("");
  const [sealType, setSealType] = useState(sealOptions[0] || "");

  const handleSeal = () => {
    if (sealNum.trim() === "" || sealType === "") return;
    
    updateFn(batchNum, item.serialNumber, {
      sealNumber: sealNum,
      sealType: sealType,
      itemStatus: "Sealed",
      sealingDate: date
    });
  };

  return (
    <tr className="hover:bg-indigo-50/20 transition-colors">
      <td className="p-4 font-mono text-indigo-700 font-semibold">{item.serialNumber}</td>
      <td className="p-4">
        <input 
          type="text" 
          value={sealNum} 
          onChange={e => setSealNum(e.target.value)} 
          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow uppercase" 
          placeholder="Enter unique seal number" 
        />
      </td>
      <td className="p-4">
        <select 
          value={sealType} 
          onChange={e => setSealType(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow bg-white"
        >
          {sealOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </td>
      <td className="p-4 text-right">
        <button 
          onClick={handleSeal}
          disabled={sealNum.trim() === ""}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm"
        >
          Record Seal
        </button>
      </td>
    </tr>
  );
}
