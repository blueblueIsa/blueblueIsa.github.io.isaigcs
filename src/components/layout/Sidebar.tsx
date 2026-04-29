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
            <div key={unit.id} className="unit-block">
              <NavLink
                to={`/unit/${unit.id}`}
                className={({ isActive }) => classNames('unit-item', { active: isActive })}
                onClick={onClose}
              >
                <div className="unit-number">{unit.number}</div>
                <div>{unit.title}</div>
              </NavLink>
              <div className="sub-list">
                <NavLink
                  to={`/qa/unit/${unit.id}`}
                  className={({ isActive }) => classNames('sub-item', { active: isActive })}
                  onClick={onClose}
                >
                  Common Questions
                </NavLink>
                <NavLink
                  to={`/unit/${unit.id}/paper-terms`}
                  className={({ isActive }) => classNames('sub-item', { active: isActive })}
                  onClick={onClose}
                >
                  Paper Terms
                </NavLink>
              </div>
            </div>
          ))}
        </div>
      ))}
      
      <div className="group">
        <div className="group-title">Reviews</div>
        {units.map(unit => (
          <NavLink
            key={`review-${unit.id}`}
            to={`/review/unit/${unit.id}`}
            className={({ isActive }) => classNames('unit-item', { active: isActive })}
            onClick={onClose}
          >
            <div className="unit-number">📚</div>
            <div>Unit {unit.number} Review</div>
          </NavLink>
        ))}
      </div>
      
      <div className="group">
        <div className="group-title">Practice</div>
        <NavLink
          to="/self-test"
          className={({ isActive }) => classNames('unit-item', { active: isActive })}
          onClick={onClose}
        >
          <div className="unit-number">📝</div>
          <div>Self-Test</div>
        </NavLink>
        <NavLink
          to="/qa"
          className={({ isActive }) => classNames('unit-item', { active: isActive })}
          onClick={onClose}
        >
          <div className="unit-number">?</div>
          <div>Past Paper Q&A</div>
        </NavLink>
        <NavLink
          to="/resources"
          className={({ isActive }) => classNames('unit-item', { active: isActive })}
          onClick={onClose}
        >
          <div className="unit-number">R</div>
          <div>Resources</div>
        </NavLink>
      </div>

      <div className="group">
        <div className="group-title">Games</div>
        <NavLink
          to="/games"
          className={({ isActive }) => classNames('unit-item', { active: isActive })}
          onClick={onClose}
        >
          <div className="unit-number">🎮</div>
          <div>Games</div>
        </NavLink>
      </div>
    </nav>
  );
};
