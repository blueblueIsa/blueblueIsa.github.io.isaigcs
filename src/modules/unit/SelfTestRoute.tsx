import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { units } from '../../data/units';
import { UnitSelfTest } from './UnitSelfTest';

export const SelfTestRoute: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const unit = units.find(u => u.id === id);

  if (!unit) {
    return <Navigate to={`/self-test/${units[0].id}`} replace />;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 16px' }}>
      <div className="content-header" style={{ marginBottom: '32px' }}>
        <div className="header-main">
          <h1>📝 Self-Test · Unit {unit.number}</h1>
          <p className="muted" style={{ marginTop: '8px' }}>
            Practice with multiple-choice questions from past papers
          </p>
        </div>
      </div>

      <UnitSelfTest key={unit.id} unit={unit} />
    </div>
  );
};
