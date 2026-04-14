import React, { useState, useEffect } from 'react';
import { useSharedState } from '../context/SharedStateContext';

export default function ExecutionEntry() {
  const { activeBatch, activeProductConfig, updateItemInBatch, addItemToBatch } = useSharedState();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSerials, setSelectedSerials] = useState([]);
  const [availableCylinders, setAvailableCylinders] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchCylinders = async () => {
      try {
        const res = await fetch('/api/cylinder-issues');
        if (res.ok) {
          const issues = await res.json();
          const serials = issues.flatMap(iss => iss.items.map(i => i.serial_number));
          setAvailableCylinders([...new Set(serials)]);
        }
      } catch (err) {
        console.error("Failed to load cylinders", err);
      }
    };
    fetchCylinders();
  }, []);

  if (!activeBatch || !activeProductConfig) return <div>Loading...</div>;

  const isReadOnly = activeBatch.status === "Complete";
  const itemsToProcess = activeBatch.items.filter(item => item.itemStatus === "Issued");

  const toggleSerial = (serial) => {
    if (selectedSerials.includes(serial)) {
      setSelectedSerials(prev => prev.filter(s => s !== serial));
    } else {
      setSelectedSerials(prev => [...prev, serial]);
    }
  };

  const handleAddMultiple = async () => {
    if (selectedSerials.length === 0) return;
    
    try {
      // Process them sequentially to avoid race conditions with state updates
      for (const serial of selectedSerials) {
        if (!activeBatch.items.find(i => i.serialNumber === serial)) {
          await addItemToBatch(activeBatch.batchNumber, serial);
        }
      }
      setSelectedSerials([]);
      setIsDropdownOpen(false);
    } catch (err) {
      alert("Error adding cylinder: " + err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
        <h2 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-3 font-sans">Process Execution Details</h2>
        <div className="grid grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Batch Number <span className="text-red-500">*</span></label>
            <input type="text" disabled value={activeBatch.batchNumber} className="w-full bg-gray-50 border border-gray-200 text-gray-500 rounded-lg p-2.5 text-sm cursor-not-allowed font-medium font-sans" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date <span className="text-red-500">*</span></label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} disabled={isReadOnly} className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-sans" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Product Type <span className="text-red-500">*</span></label>
            <input type="text" disabled value={activeProductConfig.productName} className="w-full bg-gray-50 border border-gray-200 text-gray-500 rounded-lg p-2.5 text-sm cursor-not-allowed font-medium font-sans" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Process Method</label>
            <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
              <button disabled className="flex-1 bg-white shadow-sm text-primary font-medium text-sm py-1.5 rounded-md cursor-default border border-gray-200/50">
                {activeProductConfig.processMethod}
              </button>
            </div>
          </div>
        </div>
      </div>

      {!isReadOnly && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex gap-4 items-end relative">
          <div className="flex-1 relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Cylinders to Process</label>
              
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-white border border-gray-300 rounded-lg p-2 min-h-[46px] text-sm cursor-pointer flex justify-between items-center hover:border-primary transition-colors shadow-sm"
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
                    {availableCylinders.filter(serial => !activeBatch.items.some(i => i.serialNumber === serial)).length === 0 ? (
                      <div className="text-gray-400 text-sm italic p-4 text-center bg-gray-50">No available empty cylinders found from issues.</div>
                    ) : availableCylinders
                      .filter(serial => !activeBatch.items.some(i => i.serialNumber === serial))
                      .map(serial => (
                        <label key={serial} className="flex items-center gap-3 p-3 hover:bg-blue-50/80 cursor-pointer border-b border-gray-100 last:border-0 transition-colors">
                          <input 
                            type="checkbox" 
                            checked={selectedSerials.includes(serial)}
                            onChange={() => toggleSerial(serial)}
                            className="w-4.5 h-4.5 text-primary bg-white border-gray-300 rounded focus:ring-primary cursor-pointer"
                          />
                          <span className="font-mono text-sm text-gray-700 font-bold uppercase tracking-wide">{serial}</span>
                        </label>
                    ))}
                </div>
              )}
          </div>
          <button onClick={handleAddMultiple} disabled={selectedSerials.length === 0} className="bg-primary hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white px-8 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm whitespace-nowrap">
            Add {selectedSerials.length > 0 ? `(${selectedSerials.length}) ` : ''}to Batch
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm font-sans">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold tracking-wide text-xs uppercase">
                <th className="p-4">Serial Number</th>
                <th className="p-4">{activeProductConfig.inputLabel}</th>
                <th className="p-4">{activeProductConfig.outputLabel}</th>
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
                      <span className="text-3xl">🎉</span>
                      <p>All items processed or no issued items found in this batch.</p>
                    </div>
                  </td>
                </tr>
              ) : itemsToProcess.map((item) => (
                <RowItem key={item.serialNumber} item={item} config={activeProductConfig} date={date} isReadOnly={isReadOnly} batchNum={activeBatch.batchNumber} updateFn={updateItemInBatch} />
              ))}
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
      <td className="p-4 font-mono text-primary font-semibold">{item.serialNumber}</td>
      <td className="p-4">
        <input type="number" disabled={isReadOnly} value={inp} onChange={e => setInp(e.target.value)} className="w-32 border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow" placeholder="0.00" />
      </td>
      <td className="p-4">
        <input type="number" disabled={isReadOnly} value={outp} onChange={e => setOutp(e.target.value)} className="w-32 border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow" placeholder="0.00" />
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
          className="bg-primary hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm"
        >
          Submit
        </button>
      </td>
    </tr>
  );
}
