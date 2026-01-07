import React from 'react';
import { NavLink } from 'react-router-dom';
import { units } from '../../data/units';
import classNames from 'classnames';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const groupedUnits = units.reduce((acc, unit) => {
    if (!acc[unit.group]) acc[unit.group] = [];
    acc[unit.group].push(unit);
    return acc;
  }, {} as Record<string, typeof units>);

  return (
    <nav className={classNames('sidebar', { open: isOpen })}>
      <div className="brand">IGCSE Computer Science</div>
      
      {Object.entries(groupedUnits).map(([group, groupUnits]) => (
        <div key={group} className="group">
          <div className="group-title">{group}</div>
          {groupUnits.map(unit => (
            <NavLink
              key={unit.id}
              to={`/unit/${unit.id}`}
              className={({ isActive }) => classNames('unit-item', { active: isActive })}
              onClick={onClose}
            >
              <div className="unit-number">{unit.number}</div>
              <div>{unit.title}</div>
            </NavLink>
          ))}
        </div>
      ))}
      
      <div className="group">
        <div className="group-title">Practice</div>
        <NavLink
          to="/qa"
          className={({ isActive }) => classNames('unit-item', { active: isActive })}
          onClick={onClose}
        >
          <div className="unit-number">?</div>
          <div>Past Paper Q&A</div>
        </NavLink>
      </div>
    </nav>
  );
};
