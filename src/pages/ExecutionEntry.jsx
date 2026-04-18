import React, { useState, useEffect } from 'react';
import { useSharedState } from '../context/SharedStateContext';

export default function ExecutionEntry() {
  const {
    batches,
    activeBatchNumber,
    setActiveBatchNumber,
    productConfig,
    updateItemInBatch,
    addItemToBatch
  } = useSharedState();

  const [viewingBatch, setViewingBatch] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSerials, setSelectedSerials] = useState([]);
  const [allIssues, setAllIssues] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchCylinders = async () => {
      try {
        const res = await fetch('/api/cylinder-issues');
        if (res.ok) {
          const issues = await res.json();
          setAllIssues(issues);
        }
      } catch (err) {
        console.error("Failed to load cylinders", err);
      }
    };
    fetchCylinders();
  }, []);

  // Reset cylinder selection when batch changes
  useEffect(() => {
    setSelectedSerials([]);
    setIsDropdownOpen(false);
  }, [viewingBatch]);

  const handleViewBatch = (batch) => {
    setViewingBatch(batch);
    setActiveBatchNumber(batch.batchNumber);
  };

  const handleBackToList = () => {
    setViewingBatch(null);
  };

  // Refresh the viewingBatch object from context whenever batches changes
  const currentBatch = viewingBatch ? batches.find(b => b.batchNumber === viewingBatch.batchNumber) : null;
  const currentConfig = currentBatch ? productConfig[currentBatch.productType] : null;
  const isReadOnly = currentBatch?.status === "Complete";
  const itemsToProcess = currentBatch ? currentBatch.items.filter(item => item.itemStatus === "Issued") : [];

  // All serials already used in ANY batch across the system
  const usedInAnyBatch = new Set(
    batches.flatMap(b => b.items.map(i => i.serialNumber))
  );

  // Filter: matching product type AND not already in any batch
  const availableCylinders = (() => {
    if (!currentBatch) return [];
    const batchType = currentBatch.productType.toUpperCase();
    const matchingIssues = allIssues.filter(iss =>
      iss.gas_type_planned.toUpperCase().includes(batchType) ||
      batchType.includes(iss.gas_type_planned.toUpperCase())
    );
    const serials = matchingIssues.flatMap(iss => iss.items.map(i => i.serial_number));
    return [...new Set(serials)].filter(serial => !usedInAnyBatch.has(serial));
  })();

  const toggleSerial = (serial) => {
    if (selectedSerials.includes(serial)) {
      setSelectedSerials(prev => prev.filter(s => s !== serial));
    } else {
      setSelectedSerials(prev => [...prev, serial]);
    }
  };

  const handleAddMultiple = async () => {
    if (selectedSerials.length === 0 || !currentBatch) return;

    try {
      for (const serial of selectedSerials) {
        if (!currentBatch.items.find(i => i.serialNumber === serial)) {
          await addItemToBatch(currentBatch.batchNumber, serial);
        }
      }
      setSelectedSerials([]);
      setIsDropdownOpen(false);
    } catch (err) {
      alert("Error adding cylinder: " + err.message);
    }
  };


  // ── DETAIL VIEW ──────────────────────────────────────────────
  if (viewingBatch && currentBatch && currentConfig) {
    return (
      <div className="space-y-6 max-w-[1200px] mx-auto font-sans">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>

          {/* Back button */}
          <button
            onClick={handleBackToList}
            className="absolute top-4 right-4 flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm font-semibold bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors border border-gray-200"
          >
            ← Back to List
          </button>

          <h2 className="text-xl font-bold text-gray-800 mb-1 pl-4">Process Execution Details</h2>
          <p className="text-xs text-gray-400 pl-4 mb-6 uppercase tracking-widest font-semibold">
            Batch Processing Record
          </p>

          {/* Header fields (read-only) */}
          <div className="grid grid-cols-4 gap-4 mb-6 pl-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Batch Number</label>
              <div className="bg-blue-50 border border-blue-200 font-mono text-blue-800 rounded-lg p-2.5 text-sm font-bold">
                {currentBatch.batchNumber}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                disabled={isReadOnly}
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Product Type</label>
              <div className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg p-2.5 text-sm font-medium">
                {currentConfig.productName}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Process Method</label>
              <div className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg p-2.5 text-sm font-medium">
                {currentConfig.processMethod}
              </div>
            </div>
          </div>

          {/* Extra batch info */}
          <div className="grid grid-cols-3 gap-4 mb-6 pl-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Gas Type</label>
              <div className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg p-2.5 text-sm font-medium">
                {currentBatch.gasType || '—'}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Filling Station</label>
              <div className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg p-2.5 text-sm font-medium">
                {currentBatch.fillingStation || '—'}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Operator</label>
              <div className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg p-2.5 text-sm font-medium">
                {currentBatch.operatorName || '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Cylinder Selector */}
        {!isReadOnly && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex gap-4 items-end relative">
            <div className="flex-1 relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Cylinders to Process</label>

                <div
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full bg-white border border-gray-300 rounded-lg p-2 min-h-[46px] text-sm cursor-pointer flex justify-between items-center hover:border-blue-500 transition-colors shadow-sm"
                >
                  <div className="flex flex-wrap gap-1.5 flex-1 items-center">
                    {selectedSerials.length === 0 ? (
                      <span className="font-sans text-gray-500 ml-1">-- Select issued empty cylinders --</span>
                    ) : (
                      selectedSerials.map(serial => (
                        <span key={serial} className="flex items-center gap-1.5 bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-mono font-bold border border-gray-200 shadow-sm transition-colors hover:bg-gray-50">
                          {serial}
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleSerial(serial); }}
                            className="text-gray-400 hover:text-red-500 hover:bg-gray-200 rounded-full w-5 h-5 flex items-center justify-center font-bold pb-0.5 leading-none cursor-pointer transition-colors"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                  <span className={`text-gray-400 px-2 transition-transform duration-200 flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                </div>

                {isDropdownOpen && (
                  <div className="absolute z-50 w-full mt-2 border border-gray-200 rounded-lg max-h-56 overflow-y-auto bg-white shadow-xl">
                      {availableCylinders.length === 0 ? (
                        <div className="text-gray-400 text-sm italic p-4 text-center bg-gray-50">No available empty cylinders found from issues.</div>
                      ) : availableCylinders
                        .map(serial => (
                          <label key={serial} className="flex items-center gap-3 p-3 hover:bg-blue-50/80 cursor-pointer border-b border-gray-100 last:border-0 transition-colors">
                            <input
                              type="checkbox"
                              checked={selectedSerials.includes(serial)}
                              onChange={() => toggleSerial(serial)}
                              className="w-4.5 h-4.5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                            />
                            <span className="font-mono text-sm text-gray-700 font-bold uppercase tracking-wide">{serial}</span>
                          </label>
                      ))}
                  </div>
                )}
            </div>
            <button onClick={handleAddMultiple} disabled={selectedSerials.length === 0} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white px-8 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm whitespace-nowrap">
              Add {selectedSerials.length > 0 ? `(${selectedSerials.length}) ` : ''}to Batch
            </button>
          </div>
        )}

        {/* Items Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              Cylinders
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg text-xs font-bold border border-gray-200/50">{currentBatch.items.length}</span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm font-sans">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold tracking-wide text-xs uppercase">
                  <th className="p-4">Serial Number</th>
                  <th className="p-4">{currentConfig.inputLabel}</th>
                  <th className="p-4">{currentConfig.outputLabel}</th>
                  <th className="p-4">Net Output</th>
                  <th className="p-4 text-center">Indicator</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {itemsToProcess.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-gray-500 font-medium">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <p>All items processed or no issued items found in this batch.</p>
                      </div>
                    </td>
                  </tr>
                ) : itemsToProcess.map((item) => (
                  <RowItem key={item.serialNumber} item={item} config={currentConfig} date={date} isReadOnly={isReadOnly} batchNum={currentBatch.batchNumber} updateFn={updateItemInBatch} />
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
            <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
            <h3 className="font-bold text-gray-800 text-lg">Process Execution — Batch List</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-white border-b border-gray-200 text-gray-500 font-bold tracking-wide text-xs uppercase">
                <th className="p-4">Batch Number</th>
                <th className="p-4">Product Type</th>
                <th className="p-4 text-center">Cylinders</th>
                <th className="p-4 text-center">Pending</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {batches.length > 0 ? batches.map(batch => {
                const pending = batch.items.filter(i => i.itemStatus === 'Issued').length;
                return (
                  <tr key={batch.batchNumber} className="hover:bg-blue-50/30 transition-colors cursor-pointer" onClick={() => handleViewBatch(batch)}>
                    <td className="p-4">
                      <span className="font-mono text-blue-600 font-semibold hover:text-blue-800 hover:underline underline-offset-2 transition-colors">
                        {batch.batchNumber}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 font-medium">{batch.productType}</td>
                    <td className="p-4 text-center font-bold text-gray-800">
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg border border-gray-200/50">{batch.items.length}</span>
                    </td>
                    <td className="p-4 text-center">
                      {pending > 0 ? (
                        <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-amber-200">
                          {pending} pending
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-green-200">
                          All done
                        </span>
                      )}
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
                    No batches found. Create a batch in Filling Batch Creation first.
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

function RowItem({ item, config, date, isReadOnly, batchNum, updateFn }) {
  const [inp, setInp] = useState("");
  const [outp, setOutp] = useState("");

  const handleProcess = () => {
    if (inp === "" || outp === "") return;
    const net = config.calculateNet(inp, outp);
    const validation = config.validateProcess(net);

    updateFn(batchNum, item.serialNumber, {
      inputValue: Number(inp),
      outputValue: Number(outp),
      netOutput: net,
      indicator: validation.indicator,
      processStatus: validation.status, // Success / Rejected
      itemStatus: "Produced", // moves it to next stage
      productionDate: date,
      qcStatus: "Pending QC", // will be handled in Quality Check Entry screen
      validationColor: validation.color
    });
  };

  const currentNet = (inp !== "" && outp !== "") ? config.calculateNet(inp, outp) : "-";
  let curVal = null;
  if (currentNet !== "-") curVal = config.validateProcess(currentNet);

  return (
    <tr className="hover:bg-blue-50/20 transition-colors">
      <td className="p-4 font-mono text-blue-600 font-semibold">{item.serialNumber}</td>
      <td className="p-4">
        <input type="number" disabled={isReadOnly} value={inp} onChange={e => setInp(e.target.value)} className="w-32 border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" placeholder="0.00" />
      </td>
      <td className="p-4">
        <input type="number" disabled={isReadOnly} value={outp} onChange={e => setOutp(e.target.value)} className="w-32 border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" placeholder="0.00" />
      </td>
      <td className="p-4 font-mono font-medium text-gray-700 bg-gray-50/50">
        {currentNet} <span className="text-xs text-gray-400 font-sans">{config.outputUnit}</span>
      </td>
      <td className="p-4 text-center">
        {curVal ? (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
            ${curVal.color === 'green' ? 'bg-green-100 text-green-700 border border-green-200' :
              curVal.color === 'red' ? 'bg-red-100 text-red-700 border border-red-200' :
                'bg-amber-100 text-amber-700 border border-amber-200'}`}>
            {curVal.indicator}
          </span>
        ) : <span className="text-gray-400 text-xs italic tracking-wide">Pending</span>}
      </td>
      <td className="p-4 text-right">
        <button
          onClick={handleProcess}
          disabled={isReadOnly || !curVal}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm"
        >
          Submit
        </button>
      </td>
    </tr>
  );
}
