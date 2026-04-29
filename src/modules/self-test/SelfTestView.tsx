import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { units } from '../../data/units';
import { selfTestSets } from '../../data/self-test';
import { BookMarked, ChevronRight } from 'lucide-react';
import '../../styles/self-test-view.scss';

export const SelfTestView: React.FC = () => {
  const navigate = useNavigate();

  // Count available MCQ questions per unit from self-test dataset
  const unitStats = useMemo(() => {
    return units.map(unit => {
      const unitSets = selfTestSets[unit.id] || [];
      let mcqCount = 0;

      for (const set of unitSets) {
        mcqCount += set.questions.length;
      }

      return {
        ...unit,
        questionCount: mcqCount,
      };
    });
  }, []);

  const totalQuestions = unitStats.reduce((sum, u) => sum + u.questionCount, 0);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 16px' }}>
      <div className="self-test-overview">
        <div className="overview-header">
          <div>
            <h1>📝 Self-Test Hub</h1>
            <p className="subtitle">Practice with past paper questions</p>
          </div>
          <div className="overview-stats">
            <div className="stat-card">
              <span className="stat-number">{units.length}</span>
              <span className="stat-label">Units</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{totalQuestions}</span>
              <span className="stat-label">MCQ Questions</span>
            </div>
          </div>
        </div>

        <div className="units-grid">
          {unitStats.map((unit) => (
            <div
              key={unit.id}
              className="unit-card"
              onClick={() => navigate(`/self-test/${unit.id}`)}
            >
              <div className="card-header">
                <div className="unit-badge">
                  Unit {unit.number}
                </div>
                <span className="question-count">
                  {unit.questionCount} Q{unit.questionCount !== 1 ? 's' : ''}
                </span>
              </div>

              <h3>{unit.title}</h3>
              <p className="card-description">{unit.description}</p>

              <div className="card-footer">
                <span className="start-link">
                  Start Test <ChevronRight size={16} />
                </span>
              </div>
            </div>
          ))}
        </div>

        {totalQuestions === 0 && (
          <div className="no-questions-message">
            <BookMarked size={48} />
            <p>No MCQ questions available yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};
