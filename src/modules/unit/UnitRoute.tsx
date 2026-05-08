import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { GenericUnitView } from '../common/GenericUnitView';
import { units } from '../../data/units';

const resolveUnit = (id?: string) => {
  if (!id) return undefined;
  return units.find((u) => u.id === id || String(u.number) === id);
};

export const UnitRoute: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const unit = resolveUnit(id);

  if (!unit) {
    return <Navigate to={`/unit/${units[0].id}`} replace />;
  }

  return <GenericUnitView unit={unit} />;
};
