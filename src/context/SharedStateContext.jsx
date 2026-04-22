import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { PRODUCT_CONFIG } from '../config/data';

const SharedStateContext = createContext();

const API = '/api';

// Convert snake_case API response to camelCase for frontend
function convertItem(item) {
  return {
    serialNumber: item.serial_number,
    inputValue: item.input_value || 0,
    outputValue: item.output_value || 0,
    netOutput: item.net_output || 0,
    indicator: item.indicator || "",
    itemStatus: item.item_status || "Issued",
    processStatus: item.process_status || null,
    qcStatus: item.qc_status || null,
    validationColor: item.validation_color || null,
    gasPurity: item.gas_purity || null,
    pressureCheck: item.pressure_check || null,
    leakTest: item.leak_test || null,
    valveCondition: item.valve_condition || null,
    remarks: item.remarks || null,
    productionDate: item.production_date || null,
    sealNumber: item.seal_number || null,
    sealType: item.seal_type || null,
    sealingDate: item.sealing_date || null,
    tagNumber: item.tag_number || null,
    expiryDate: item.expiry_date || null,
    inventoryLocation: item.inventory_location || null,
    moveDate: item.move_date || null,
    transactionId: item.transaction_id || null,
  };
}

function convertBatch(batch) {
  // Mapping API status to UI labels: Pending -> Saved (S), Complete -> Posted (P)
  const uiStatus = batch.status === 'Complete' ? 'Posted' : 'Saved';
  const statusTab = batch.status === 'Complete' ? 'P' : 'S';

  return {
    batchNumber: batch.batch_number,
    productType: batch.product_type,
    status: uiStatus,
    statusTab: statusTab,
    isPosted: batch.status === 'Complete',
    rawStatus: batch.status,
    items: (batch.items || []).map(convertItem),
  };
}

function convertChecklist(cl) {
  return {
    id: cl.checklist_id || cl.id,
    batchNumber: cl.batch_number,
    date: cl.date,
    fillingStation: cl.filling_station,
    supervisorName: cl.supervisor_name,
    checks: {
      equipmentCondition: cl.equipment_condition,
      safetyValves: cl.safety_valves,
      fireSafety: cl.fire_safety,
      ppeCompliance: cl.ppe_compliance,
    },
    status: cl.status,
  };
}

// Convert camelCase update from frontend to snake_case for API
function toSnakeCase(updates) {
  const map = {
    inputValue: 'input_value', outputValue: 'output_value', netOutput: 'net_output',
    itemStatus: 'item_status', processStatus: 'process_status', qcStatus: 'qc_status',
    validationColor: 'validation_color', gasPurity: 'gas_purity',
    pressureCheck: 'pressure_check', leakTest: 'leak_test', valveCondition: 'valve_condition',
    productionDate: 'production_date', sealNumber: 'seal_number', sealType: 'seal_type',
    sealingDate: 'sealing_date', tagNumber: 'tag_number', expiryDate: 'expiry_date',
    inventoryLocation: 'inventory_location', moveDate: 'move_date', transactionId: 'transaction_id',
  };
  const result = {};
  for (const [key, value] of Object.entries(updates)) {
    result[map[key] || key] = value;
  }
  return result;
}

export const SharedStateProvider = ({ children }) => {
  const [productConfig] = useState(PRODUCT_CONFIG);
  const [batches, setBatches] = useState([]);
  const [safetyChecklists, setSafetyChecklists] = useState([]);
  const [activeBatchNumber, setActiveBatchNumber] = useState('');
  const [loading, setLoading] = useState(true);

  // --- Fetch all batches from API ---
  const fetchBatches = useCallback(async () => {
    try {
      const res = await fetch(`${API}/batches`);
      const data = await res.json();
      const converted = data.map(convertBatch);
      setBatches(converted);
      // Set active batch if not set or if current one no longer exists
      if (converted.length > 0) {
        setActiveBatchNumber(prev => {
          if (!prev || !converted.find(b => b.batchNumber === prev)) {
            return converted[0].batchNumber;
          }
          return prev;
        });
      }
    } catch (err) {
      console.error('Failed to fetch batches:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Fetch safety checklists from API ---
  const fetchSafetyChecklists = useCallback(async () => {
    try {
      const res = await fetch(`${API}/safety-checklists`);
      const data = await res.json();
      setSafetyChecklists(data.map(convertChecklist));
    } catch (err) {
      console.error('Failed to fetch safety checklists:', err);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    fetchBatches();
    fetchSafetyChecklists();
  }, [fetchBatches, fetchSafetyChecklists]);

  // --- Derived state ---
  const activeBatch = batches.find(b => b.batchNumber === activeBatchNumber);
  const activeProductConfig = activeBatch ? productConfig[activeBatch.productType] : null;

  const getBatch = (batchNum) => batches.find(b => b.batchNumber === batchNum);

  // --- Batch operations ---
  const addBatch = async (batchNumber, productType) => {
    try {
      await fetch(`${API}/batches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch_number: batchNumber, product_type: productType })
      });
      await fetchBatches();
      setActiveBatchNumber(batchNumber);
    } catch (err) {
      console.error('Failed to create batch:', err);
    }
  };

  const deleteBatch = async (batchNum) => {
    try {
      await fetch(`${API}/batches/${batchNum}`, { method: 'DELETE' });
      await fetchBatches();
    } catch (err) {
      console.error('Failed to delete batch:', err);
    }
  };

  const completeBatch = async (batchNum) => {
    try {
      await fetch(`${API}/batches/${batchNum}/complete`, { method: 'PUT' });
      await fetchBatches();
    } catch (err) {
      console.error('Failed to complete batch:', err);
    }
  };

  // --- Item operations ---
  const addItemToBatch = async (batchNum, serialNumber) => {
    const res = await fetch(`${API}/batches/${batchNum}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serial_number: serialNumber })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP Error ${res.status}`);
    }
    await fetchBatches();
  };

  const removeItemFromBatch = async (batchNum, serialNumber) => {
    try {
      await fetch(`${API}/batches/${batchNum}/items/${serialNumber}`, { method: 'DELETE' });
      await fetchBatches();
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const updateItemInBatch = async (batchNum, serialNumber, updates) => {
    const res = await fetch(`${API}/batches/${batchNum}/items/${serialNumber}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toSnakeCase(updates))
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP Error ${res.status}`);
    }
    await fetchBatches();
  };

  // --- Safety Checklist operations ---
  const addSafetyChecklist = async (checklist) => {
    try {
      await fetch(`${API}/safety-checklists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checklist_id: checklist.id,
          batch_number: checklist.batchNumber,
          date: checklist.date,
          filling_station: checklist.fillingStation,
          supervisor_name: checklist.supervisorName,
          equipment_condition: checklist.checks.equipmentCondition,
          safety_valves: checklist.checks.safetyValves,
          fire_safety: checklist.checks.fireSafety,
          ppe_compliance: checklist.checks.ppeCompliance,
          status: checklist.status
        })
      });
      await fetchSafetyChecklists();
    } catch (err) {
      console.error('Failed to add safety checklist:', err);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4">⚙️</div>
          <p className="text-gray-600 font-medium">Connecting to database...</p>
          <p className="text-gray-400 text-sm mt-1">Make sure the Python backend is running on port 8000</p>
        </div>
      </div>
    );
  }

  return (
    <SharedStateContext.Provider value={{
      productConfig,
      batches,
      activeBatchNumber,
      setActiveBatchNumber,
      activeBatch,
      activeProductConfig,
      getBatch,
      addBatch,
      deleteBatch,
      addItemToBatch,
      removeItemFromBatch,
      updateItemInBatch,
      completeBatch,
      safetyChecklists,
      addSafetyChecklist,
      fetchBatches
    }}>
      {children}
    </SharedStateContext.Provider>
  );
};

export const useSharedState = () => useContext(SharedStateContext);
