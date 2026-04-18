import React, { useState } from 'react';
import { useSharedState } from '../context/SharedStateContext';

export default function BatchSummary() {
  const { batches, productConfig, completeBatch } = useSharedState();
  const [viewingBatch, setViewingBatch] = useState(null);

  if (!batches) return <div>Loading...</div>;

  const handleComplete = (batchNumber) => {
    completeBatch(batchNumber);
  };

  // Keep viewingBatch in sync with latest data from context
  const currentBatch = viewingBatch ? batches.find(b => b.batchNumber === viewingBatch.batchNumber) : null;

  // ── DETAIL VIEW ──────────────────────────────────────────────
  if (currentBatch) {
    const pConfig = productConfig[currentBatch.productType];
    const totalItems = currentBatch.items.length;
    const unprocessedItems = currentBatch.items.filter(i => i.itemStatus === "Issued").length;
    const processedItems = currentBatch.items.filter(i => i.itemStatus !== "Issued");

    const successfulCount = processedItems.filter(i => i.processStatus === "Success").length;
    const rejectedCount = processedItems.filter(i => i.processStatus === "Rejected").length;

    const totalNet = processedItems.reduce((acc, curr) => acc + (curr.netOutput || 0), 0);

    let expectedNet = 0;
    let variance = 0;
    if(pConfig && pConfig.productName === "Oxygen Gas") {
      expectedNet = processedItems.length * 195;
      variance = totalNet - expectedNet;
    } else if (pConfig && pConfig.productName === "Engine Oil 5W-30") {
      expectedNet = processedItems.length * 50;
      variance = totalNet - expectedNet;
    }

    const isComplete = currentBatch.status === "Complete";
    const canComplete = unprocessedItems === 0 && !isComplete;

    return (
      <div className="space-y-6 max-w-[1200px] mx-auto font-sans">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-2 h-full ${isComplete ? 'bg-green-500' : 'bg-indigo-500'}`}></div>

          {/* Back button */}
          <button
            onClick={() => setViewingBatch(null)}
            className="absolute top-4 right-4 flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm font-semibold bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors border border-gray-200"
          >
            ← Back to List
          </button>

          <h2 className="text-xl font-bold text-gray-800 mb-1 pl-4">Batch Summary</h2>
          <p className="text-xs text-gray-400 pl-4 mb-6 uppercase tracking-widest font-semibold">
            Review aggregated results before closing the batch
          </p>

          {/* Batch Header Info */}
          <div className="grid grid-cols-4 gap-4 mb-6 pl-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Batch Number</label>
              <div className="bg-indigo-50 border border-indigo-200 font-mono text-indigo-800 rounded-lg p-2.5 text-sm font-bold">
                {currentBatch.batchNumber}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Product Type</label>
              <div className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg p-2.5 text-sm font-medium">
                {pConfig ? pConfig.productName : currentBatch.productType}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Gas Type</label>
              <div className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg p-2.5 text-sm font-medium">
                {currentBatch.gasType || '—'}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
              <div className="mt-0.5">
                <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                  isComplete
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>{currentBatch.status}</span>
              </div>
            </div>
          </div>




          {/* Output Summary */}
          <div className="grid grid-cols-2 gap-4 mb-6 pl-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Actual Output</label>
              <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-2.5 text-sm font-mono font-bold">
                {totalNet.toFixed(2)} <span className="text-xs opacity-60">{pConfig ? pConfig.outputUnit : ''}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Expected Output</label>
              <div className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg p-2.5 text-sm font-mono font-bold">
                {expectedNet.toFixed(2)} <span className="text-xs opacity-60">{pConfig ? pConfig.outputUnit : ''}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cylinders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              Cylinder Details
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg text-xs font-bold border border-gray-200/50">{totalItems}</span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold tracking-wide text-xs uppercase">
                  <th className="p-4">Serial Number</th>
                  <th className="p-4">Item Status</th>
                  <th className="p-4">Process Status</th>
                  <th className="p-4">Net Output</th>
                  <th className="p-4 text-center">Indicator</th>
                  <th className="p-4">QC Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentBatch.items.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-gray-400 italic font-medium">
                      No cylinders in this batch.
                    </td>
                  </tr>
                ) : currentBatch.items.map(item => (
                  <tr key={item.serialNumber} className="hover:bg-indigo-50/20 transition-colors">
                    <td className="p-4 font-mono text-indigo-700 font-semibold">{item.serialNumber}</td>
                    <td className="p-4 text-gray-600 font-medium">{item.itemStatus}</td>
                    <td className="p-4">
                      {item.processStatus ? (
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          item.processStatus === 'Success'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>{item.processStatus}</span>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="p-4 font-mono text-gray-700">
                      {item.netOutput ? `${item.netOutput.toFixed(2)} ${pConfig ? pConfig.outputUnit : ''}` : '—'}
                    </td>
                    <td className="p-4 text-center">
                      {item.indicator ? (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          item.validationColor === 'green' ? 'bg-green-100 text-green-700 border-green-200' :
                          item.validationColor === 'red' ? 'bg-red-100 text-red-700 border-red-200' :
                          'bg-amber-100 text-amber-700 border-amber-200'
                        }`}>{item.indicator}</span>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="p-4">
                      {item.qcStatus ? (
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          item.qcStatus === 'QC Passed'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : item.qcStatus === 'QC Failed'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}>{item.qcStatus}</span>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
            <h3 className="font-bold text-gray-800 text-lg">Batch Summary Records</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-white border-b border-gray-200 text-gray-500 font-bold tracking-wide text-xs uppercase">
                <th className="p-4">Batch Number</th>
                <th className="p-4">Product Type</th>
                <th className="p-4 text-center">Total Items</th>
                <th className="p-4 text-center">Processed</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {batches.length > 0 ? [...batches].reverse().map(batch => {
                const total = batch.items.length;
                const processed = batch.items.filter(i => i.itemStatus !== "Issued").length;

                return (
                  <tr
                    key={batch.batchNumber}
                    onClick={() => setViewingBatch(batch)}
                    className="hover:bg-indigo-50/30 cursor-pointer transition-colors"
                  >
                    <td className="p-4">
                      <span className="font-mono text-indigo-600 font-semibold hover:text-indigo-800 hover:underline underline-offset-2 transition-colors">
                        {batch.batchNumber}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-gray-700">{batch.productType}</td>
                    <td className="p-4 text-center font-bold text-gray-800">
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg border border-gray-200/50">{total}</span>
                    </td>
                    <td className="p-4 text-center font-bold text-gray-800">
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg border border-gray-200/50">{processed}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                        batch.status === 'Complete'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>{batch.status}</span>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="5" className="p-16 text-center text-gray-400 italic font-medium bg-gray-50/50">
                    No batches found in the system.
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
