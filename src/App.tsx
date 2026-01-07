import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { UnitRoute } from './modules/unit/UnitRoute';
import { QAView } from './modules/qa/QAView';
import { units } from './data/units';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to={`/unit/${units[0].id}`} replace />} />
        <Route path="unit/:id" element={<UnitRoute />} />
        <Route path="qa" element={<QAView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default App;
