import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { UnitRoute } from './modules/unit/UnitRoute';
import { SelfTestRoute } from './modules/unit/SelfTestRoute';
import { UnitAnimation } from './modules/animation/UnitAnimation';
import { UnitPaperTerms } from './modules/unit/UnitPaperTerms';
import { QAView } from './modules/qa/QAView';
import { units } from './data/units';
import { Resources } from './modules/resources/Resources';
import { GamesView } from './modules/games/GamesView';
import { UnitReview } from './modules/review/UnitReview';
import { CpuCycleReview } from './modules/review/CpuCycleReview';
import { SelfTestView } from './modules/self-test/SelfTestView';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to={`/unit/${units[0].id}`} replace />} />
        <Route path="unit/:id" element={<UnitRoute />} />
        <Route path="unit/:id/paper-terms" element={<UnitPaperTerms />} />
        <Route path="review/unit/:id" element={<UnitReview />} />
        <Route path="review/unit/:id/cpu-cycle" element={<CpuCycleReview />} />
        <Route path="animation/unit/:id" element={<UnitAnimation />} />
        <Route path="self-test" element={<SelfTestView />} />
        <Route path="self-test/:id" element={<SelfTestRoute />} />
        <Route path="qa/*" element={<QAView />} />
        <Route path="resources" element={<Resources />} />
        <Route path="games" element={<GamesView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default App;
