import React, { useState, useEffect } from 'react';
import { useSharedState } from '../context/SharedStateContext';

export default function TaggingEntry() {
  const { activeBatch, activeProductConfig, updateItemInBatch } = useSharedState();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [taggingId] = useState(`TAG-${Date.now().toString().slice(-6)}`);
  
  if (!activeBatch || !activeProductConfig) return <div>Loading...</div>;

  const itemsToTag = activeBatch.items.filter(i => i.itemStatus === "Sealed");
  const itemsTaggedCount = activeBatch.items.filter(i => i.itemStatus === "Tagged").length;
  const processedItemsCount = activeBatch.items.filter(i => i.processStatus === "Success" && i.qcStatus === "QC Passed").length;
  
  // Show dispatch-ready success state if all processed items have reached Tagged state.
  const isAllTagged = processedItemsCount > 0 && itemsTaggedCount === processedItemsCount;

  if (isAllTagged) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-white rounded-xl shadow-sm border border-gray-200 min-h-[400px]">
         <div className="text-6xl mb-6">🚚</div>
         <h2 className="text-2xl font-bold text-gray-800 mb-2">Batch {activeBatch.batchNumber} is Dispatch-Ready!</h2>
         <p className="text-gray-500 mb-6 text-center max-w-md">All successfully processed items have been sealed and tagged. They are now fully traceable and ready for finished goods inventory.</p>
         <div className="bg-green-50 text-green-700 px-6 py-3 rounded-lg border border-green-200 font-semibold tracking-wide">
           {itemsTaggedCount} ITEMS TAGGED
         </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto font-sans">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
        <h2 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-3">Tagging / Labeling Entry</h2>
        
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tagging ID</label>
            <input type="text" disabled value={taggingId} className="w-full bg-gray-50 border border-gray-200 text-blue-700 rounded-lg p-2.5 text-sm font-mono font-bold cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Batch Number</label>
            <input type="text" disabled value={activeBatch.batchNumber} className="w-full bg-gray-50 border border-gray-200 text-gray-500 rounded-lg p-2.5 text-sm cursor-not-allowed font-medium" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold tracking-wide text-xs uppercase">
                <th className="p-4">Serial Number</th>
                <th className="p-4">Tag Number / Barcode</th>
                <th className="p-4">Product Type Label</th>
                <th className="p-4">Production Date</th>
                <th className="p-4">Expiry / Next Review</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {itemsToTag.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-gray-500 font-medium">
                     No items pending tagging. Items must be sealed first before tagging.
                  </td>
                </tr>
              ) : itemsToTag.map(item => (
                <TaggingRow 
                  key={item.serialNumber} 
                  item={item} 
                  config={activeProductConfig}
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

function TaggingRow({ item, config, batchNum, updateFn }) {
  const [tagNum, setTagNum] = useState("");
  
  // Expiry Date Logic
  const [expiryDate, setExpiryDate] = useState(() => {
    if(!item.productionDate) return "";
    const prodDateObj = new Date(item.productionDate);
    prodDateObj.setDate(prodDateObj.getDate() + config.expiryIntervalDays);
    return prodDateObj.toISOString().split('T')[0];
  });

  const handleTag = () => {
    if (tagNum.trim() === "" || expiryDate === "") return;
    
    updateFn(batchNum, item.serialNumber, {
      tagNumber: tagNum,
      expiryDate: expiryDate,
      itemStatus: "Tagged"
    });
  };

  return (
    <tr className="hover:bg-blue-50/20 transition-colors">
      <td className="p-4 font-mono text-blue-700 font-semibold">{item.serialNumber}</td>
      <td className="p-4">
        <input 
          type="text" 
          value={tagNum} 
          onChange={e => setTagNum(e.target.value)} 
          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none uppercase font-mono tracking-wider shadow-sm" 
          placeholder="SCAN OR TYPE BARCODE" 
        />
      </td>
      <td className="p-4 font-medium text-gray-700">
        <div className="bg-gray-100 px-3 py-1.5 rounded-md border border-gray-200 inline-block text-xs font-bold tracking-wide">
          {config.tagLabelType}
        </div>
      </td>
      <td className="p-4 text-gray-600 font-medium">{item.productionDate}</td>
      <td className="p-4">
         <input 
          type="date" 
          value={expiryDate} 
          onChange={e => setExpiryDate(e.target.value)} 
          className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm" 
        />
      </td>
      <td className="p-4 text-right">
        <button 
          onClick={handleTag}
          disabled={tagNum.trim() === "" || expiryDate === ""}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 w-full max-w-[120px] ml-auto"
        >
          🏷️ Print & Tag
        </button>
      </td>
    </tr>
  );
}
