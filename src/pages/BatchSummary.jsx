import React, { useState, useEffect } from 'react';
import { useSharedState } from '../context/SharedStateContext';

export default function BatchSummary() {
  const { batches, productConfig, completeBatch, activeBatch } = useSharedState();
  const [selectedBatchId, setSelectedBatchId] = useState(null);

  useEffect(() => {
    // Optionally default to active batch if none selected, but user requested List view. 
    // We will keep it strictly List view by default.
  }, []);

  if (!batches) return <div>Loading...</div>;

  const handleComplete = (batchNumber) => {
    completeBatch(batchNumber);
  };

  if (selectedBatchId) {
    const batch = batches.find(b => b.batchNumber === selectedBatchId);
    if (!batch) return <div>Loading...</div>;
    
    const pConfig = productConfig[batch.productType];
    const totalItems = batch.items.length;
    const unprocessedItems = batch.items.filter(i => i.itemStatus === "Issued").length;
    const processedItems = batch.items.filter(i => i.itemStatus !== "Issued");
    
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

    const isComplete = batch.status === "Complete";
    const canComplete = unprocessedItems === 0 && !isComplete;

    return (
      <div className="space-y-6 max-w-4xl mx-auto font-sans">
        <button 
          onClick={() => setSelectedBatchId(null)}
          className="text-gray-500 hover:text-gray-800 font-semibold text-sm flex items-center gap-2 mb-2 transition-colors"
        >
          <span>←</span> Back to Batch List
        </button>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-2 h-full ${isComplete ? 'bg-green-500' : 'bg-primary'}`}></div>
          <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Batch Summary</h2>
              <p className="text-gray-500 mt-1">Review aggregated results before closing the batch.</p>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase border
              ${isComplete ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
              {batch.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-500 font-semibold mb-1">Batch Number</p>
                <p className="font-mono text-lg font-bold text-gray-800">{batch.batchNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold mb-1">Total Items</p>
                <p className="text-xl font-bold text-gray-800">{totalItems}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold mb-1">Items Unprocessed</p>
                <p className={`text-xl font-bold ${unprocessedItems > 0 ? 'text-amber-500' : 'text-gray-800'}`}>
                  {unprocessedItems}
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg">
                  <p className="text-xs text-blue-800 font-bold uppercase tracking-wider mb-1">Actual Output</p>
                  <p className="text-xl font-mono font-bold text-blue-700">
                    {totalNet.toFixed(2)} <span className="text-sm opacity-60">{pConfig ? pConfig.outputUnit : ''}</span>
                  </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-1">Expected Output</p>
                  <p className="text-xl font-mono font-bold text-gray-700">
                    {expectedNet.toFixed(2)} <span className="text-sm opacity-60">{pConfig ? pConfig.outputUnit : ''}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border border-green-200 p-3 rounded-lg">
                  <p className="text-xs text-green-700 font-bold uppercase tracking-wider mb-1">Successful</p>
                  <p className="text-2xl font-bold text-green-600">{successfulCount}</p>
                </div>
                <div className="border border-red-200 p-3 rounded-lg">
                  <p className="text-xs text-red-700 font-bold uppercase tracking-wider mb-1">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 font-semibold mb-1">Variance (Actual - Expected)</p>
                <div className={`inline-block px-3 py-1 rounded-md border font-mono font-bold tracking-wide
                  ${variance === 0 ? 'bg-gray-50 text-gray-600 border-gray-200' : 
                    variance > 0 ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                  {variance > 0 ? '+' : ''}{variance.toFixed(2)} {pConfig ? pConfig.outputUnit : ''}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button 
              onClick={() => handleComplete(batch.batchNumber)}
              disabled={!canComplete}
              className="bg-primary hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-bold text-lg transition-all shadow-md active:scale-95"
            >
              Complete Batch
            </button>
          </div>
          
          {unprocessedItems > 0 && !isComplete && (
            <p className="text-right text-amber-600 text-sm mt-3 font-medium">
              Cannot complete batch: {unprocessedItems} item(s) are still pending processing.
            </p>
          )}
        </div>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="space-y-6 max-w-[1200px] mx-auto font-sans">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Batch Logs</h2>
          <p className="text-sm text-gray-500 mt-1">Select a batch to view its processing summary or complete it.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {batches.length === 0 ? (
           <div className="p-12 text-center text-gray-500 font-medium">No batches found in the system.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold tracking-wide text-xs uppercase">
                  <th className="p-4">Batch Number</th>
                  <th className="p-4">Product Type</th>
                  <th className="p-4">Total Items</th>
                  <th className="p-4">Process Progress</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[...batches].reverse().map(batch => {
                  const total = batch.items.length;
                  const processed = batch.items.filter(i => i.itemStatus !== "Issued").length;
                  
                  return (
                    <tr 
                      key={batch.batchNumber} 
                      onClick={() => setSelectedBatchId(batch.batchNumber)}
                      className="hover:bg-blue-50/30 cursor-pointer transition-colors"
                    >
                      <td className="p-4 font-mono font-bold text-primary">{batch.batchNumber}</td>
                      <td className="p-4 font-semibold text-gray-700">{batch.productType}</td>
                      <td className="p-4 font-medium text-gray-600">{total} cylinders</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                            <div className="bg-primary h-2 rounded-full" style={{ width: total > 0 ? `${(processed/total)*100}%` : '0%' }}></div>
                          </div>
                          <span className="text-xs text-gray-500 font-bold">{processed}/{total}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                          batch.status === 'Complete'
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-amber-100 text-amber-700 border-amber-200'
                        }`}>
                          {batch.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
