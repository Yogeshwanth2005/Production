import React from 'react';
import { useSharedState } from '../context/SharedStateContext';

export default function BatchSummary() {
  const { activeBatch, activeProductConfig, completeBatch } = useSharedState();

  if (!activeBatch || !activeProductConfig) return <div>Loading...</div>;

  const totalItems = activeBatch.items.length;
  // An item is unprocessed if it is still "Issued"
  const unprocessedItems = activeBatch.items.filter(i => i.itemStatus === "Issued").length;
  const processedItems = activeBatch.items.filter(i => i.itemStatus !== "Issued");
  
  const successfulCount = processedItems.filter(i => i.processStatus === "Success").length;
  const rejectedCount = processedItems.filter(i => i.processStatus === "Rejected").length;

  const totalNet = processedItems.reduce((acc, curr) => acc + (curr.netOutput || 0), 0);
  
  // mock expected as the average ideal value * total processed
  // e.g. oxygen expects ~ 195 net. 
  let variance = 0;
  if(activeProductConfig.productName === "Oxygen Gas") {
    variance = totalNet - (processedItems.length * 195);
  } else if (activeProductConfig.productName === "Engine Oil 5W-30") {
    variance = totalNet - (processedItems.length * 50);
  }

  const isComplete = activeBatch.status === "Complete";
  const canComplete = unprocessedItems === 0 && !isComplete;

  const handleComplete = () => {
    completeBatch(activeBatch.batchNumber);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-2 h-full ${isComplete ? 'bg-green-500' : 'bg-primary'}`}></div>
        <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Batch Summary</h2>
            <p className="text-gray-500 mt-1">Review aggregated results before closing the batch.</p>
          </div>
          <span className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase border
            ${isComplete ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
            {activeBatch.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500 font-semibold mb-1">Batch Number</p>
              <p className="font-mono text-lg font-bold text-gray-800">{activeBatch.batchNumber}</p>
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
            <div>
              <p className="text-sm text-gray-500 font-semibold mb-1">Total Net Output</p>
              <p className="text-xl font-mono font-bold text-primary">
                {totalNet.toFixed(2)} <span className="text-sm text-gray-500">{activeProductConfig.outputUnit}</span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                <p className="text-xs text-green-800 font-bold uppercase tracking-wider mb-1">Successful</p>
                <p className="text-2xl font-bold text-green-700">{successfulCount}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                <p className="text-xs text-red-800 font-bold uppercase tracking-wider mb-1">Rejected</p>
                <p className="text-2xl font-bold text-red-700">{rejectedCount}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold mb-1">Variance (Actual vs Expected)</p>
              <p className="font-mono font-medium text-gray-700">{variance > 0 ? '+' : ''}{variance.toFixed(2)} {activeProductConfig.outputUnit}</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end">
          <button 
            onClick={handleComplete}
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
