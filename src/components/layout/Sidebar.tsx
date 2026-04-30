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
      
      <div className="sidebar-part-header">
        <span className="part-number">Part 1</span>
        <span className="part-title">Learn</span>
      </div>
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
                  to={`/unit/${unit.id}/key-terms`}
                  className={({ isActive }) => classNames('sub-item', { active: isActive })}
                  onClick={onClose}
                >
                  Key Terms
                </NavLink>
              </div>
            </div>
          ))}
        </div>
      ))}
      
      <div className="sidebar-part-header practice">
        <span className="part-number">Part 2</span>
        <span className="part-title practice-name">Practice</span>
      </div>
      <div className="group">
        <div className="unit-block">
          <NavLink
            to="/self-test"
            className={({ isActive }) => classNames('unit-item', { active: isActive })}
            onClick={onClose}
          >
            <div className="unit-number">📝</div>
            <div>Self-Test Hub</div>
          </NavLink>
          <div className="sub-list">
            {units.map(unit => (
              <NavLink
                key={`self-test-${unit.id}`}
                to={`/self-test/${unit.id}`}
                className={({ isActive }) => classNames('sub-item', { active: isActive })}
                onClick={onClose}
              >
                Unit {unit.number}
              </NavLink>
            ))}
          </div>
        </div>
        <NavLink
          to="/qa"
          className={({ isActive }) => classNames('unit-item', { active: isActive })}
          onClick={onClose}
        >
          <div className="unit-number">?</div>
          <div>Past Paper Q&A</div>
        </NavLink>
        <div className="unit-block">
          <NavLink
            to="/cards"
            className={({ isActive }) => classNames('unit-item', 'practice-item', { active: isActive })}
            onClick={onClose}
          >
            <div className="unit-number">✨</div>
            <div>Magic Rhyme Cards</div>
          </NavLink>
          <div className="sub-list">
            {units.map(unit => (
              <NavLink
                key={`cards-${unit.id}`}
                to={`/cards/unit/${unit.id}`}
                className={({ isActive }) => classNames('sub-item', { active: isActive })}
                onClick={onClose}
              >
                Unit {unit.number}
              </NavLink>
            ))}
          </div>
        </div>
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
