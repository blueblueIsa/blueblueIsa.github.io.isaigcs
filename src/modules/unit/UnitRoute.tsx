import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { GenericUnitView } from '../common/GenericUnitView';
import { units } from '../../data/units';

export const UnitRoute: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const unit = units.find(u => u.id === id);

  if (!unit) {
    return <Navigate to={`/unit/${units[0].id}`} replace />;
  }

  return <GenericUnitView unit={unit} />;
};
