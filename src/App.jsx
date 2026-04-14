import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SharedStateProvider } from './context/SharedStateContext';
import Layout from './components/Layout';
import GasProductionEntry from './pages/GasProductionEntry';
import FillingBatchCreation from './pages/FillingBatchCreation';
import EmptyCylinderIssue from './pages/EmptyCylinderIssue';
import ExecutionEntry from './pages/ExecutionEntry';
import QualityCheckEntry from './pages/QualityCheckEntry';
import BatchSummary from './pages/BatchSummary';
import SealingEntry from './pages/SealingEntry';
import TaggingEntry from './pages/TaggingEntry';
import SafetyChecklist from './pages/SafetyChecklist';
import FilledInventory from './pages/FilledInventory';

function App() {
  return (
    <SharedStateProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/gas-production" replace />} />
            <Route path="gas-production" element={<GasProductionEntry />} />
            <Route path="cylinder-issue" element={<EmptyCylinderIssue />} />
            <Route path="batch-creation" element={<FillingBatchCreation />} />
            <Route path="filling" element={<ExecutionEntry />} />
            <Route path="summary" element={<BatchSummary />} />
            <Route path="qc" element={<QualityCheckEntry />} />
            <Route path="safety" element={<SafetyChecklist />} />
            <Route path="sealing" element={<SealingEntry />} />
            <Route path="tagging" element={<TaggingEntry />} />
            <Route path="inventory" element={<FilledInventory />} />
          </Route>
        </Routes>
      </Router>
    </SharedStateProvider>
  );
}

export default App;
