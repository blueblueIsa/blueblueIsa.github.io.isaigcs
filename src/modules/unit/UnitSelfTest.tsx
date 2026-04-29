import React, { useMemo, useState } from 'react';
import type { Unit } from '../../types';
import { selfTestSets } from '../../data/self-test';
import { CheckCircle2, XCircle, Volume2, BookMarked } from 'lucide-react';
import '../../styles/unit-self-test.scss';

interface MCQItem {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  answer: string;
  marks: number;
  marks_label: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  paper: string;
  topic: string;
}

interface UnitSelfTestProps {
  unit: Unit;
}

export const UnitSelfTest: React.FC<UnitSelfTestProps> = ({ unit }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'ALL' | 'EASY' | 'MEDIUM' | 'HARD'>('ALL');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);

  // Load self-test questions from curated dataset
  const allQuestions = useMemo(() => {
    const unitSets = selfTestSets[unit.id] || [];
    const questions: MCQItem[] = [];

    for (const set of unitSets) {
      for (const q of set.questions) {
        const correctIndex = q.options.indexOf(q.answer);
        if (correctIndex >= 0) {
          questions.push({
            id: q.id,
            question: q.question,
            options: q.options,
            correctIndex,
            answer: q.answer,
            marks: q.marks,
            marks_label: `${q.marks} Mark${q.marks > 1 ? 's' : ''}`,
            difficulty: q.difficulty,
            paper: q.paper,
            topic: q.topic,
          });
        }
      }
    }

    return questions;
  }, [unit]);

  const filteredQuestions = useMemo(() => {
    if (selectedDifficulty === 'ALL') return allQuestions;
    return allQuestions.filter(q => q.difficulty === selectedDifficulty);
  }, [allQuestions, selectedDifficulty]);

  const currentQuestion = filteredQuestions[currentIndex];
  
  const score = useMemo(() => {
    let points = 0;
    for (let i = 0; i < filteredQuestions.length; i++) {
      if (userAnswers[i] === filteredQuestions[i].correctIndex) {
        points += filteredQuestions[i].marks;
      }
    }
    return points;
  }, [userAnswers, filteredQuestions]);

  const totalMarks = useMemo(() => {
    return filteredQuestions.reduce((sum, q) => sum + q.marks, 0);
  }, [filteredQuestions]);

  const handleSelectOption = (optionIndex: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentIndex]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleReset = () => {
    setUserAnswers({});
    setCurrentIndex(0);
    setShowResults(false);
  };

  if (allQuestions.length === 0) {
    return (
      <div className="unit-self-test">
        <div className="no-questions">
          <BookMarked size={32} />
          <p>No self-test questions available for this unit yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="unit-self-test">
      <div className="self-test-header">
        <div className="header-title">
          <h3>📝 Self-Test</h3>
          <p className="subtitle">Multiple-choice questions from past papers</p>
        </div>

        <div className="difficulty-filter">
          <button
            className={`difficulty-btn ${selectedDifficulty === 'ALL' ? 'active' : ''}`}
            onClick={() => {
              setSelectedDifficulty('ALL');
              setCurrentIndex(0);
              setShowResults(false);
            }}
          >
            All ({allQuestions.length})
          </button>
          <button
            className={`difficulty-btn easy ${selectedDifficulty === 'EASY' ? 'active' : ''}`}
            onClick={() => {
              setSelectedDifficulty('EASY');
              setCurrentIndex(0);
              setShowResults(false);
            }}
          >
            EASY
          </button>
          <button
            className={`difficulty-btn medium ${selectedDifficulty === 'MEDIUM' ? 'active' : ''}`}
            onClick={() => {
              setSelectedDifficulty('MEDIUM');
              setCurrentIndex(0);
              setShowResults(false);
            }}
          >
            MEDIUM
          </button>
          <button
            className={`difficulty-btn hard ${selectedDifficulty === 'HARD' ? 'active' : ''}`}
            onClick={() => {
              setSelectedDifficulty('HARD');
              setCurrentIndex(0);
              setShowResults(false);
            }}
          >
            HARD
          </button>
        </div>
      </div>

      {!showResults ? (
        <>
          <div className="question-card">
            <div className="question-meta">
              <div className="meta-left">
                <span className="question-number">Question {currentIndex + 1} of {filteredQuestions.length}</span>
                <span className={`difficulty-badge ${currentQuestion?.difficulty.toLowerCase()}`}>
                  {currentQuestion?.difficulty}
                </span>
                <span className="marks-badge">{currentQuestion?.marks_label}</span>
              </div>
              <div className="meta-right">
                <span className="paper-source">{currentQuestion?.paper}</span>
              </div>
            </div>

            <div className="question-text">
              <p>{currentQuestion?.question}</p>
            </div>

            <div className="options-container">
              {currentQuestion?.options.map((option, idx) => (
                <button
                  key={idx}
                  className={`option-button ${userAnswers[currentIndex] === idx ? 'selected' : ''}`}
                  onClick={() => handleSelectOption(idx)}
                >
                  <span className="option-number">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="option-text">{option}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="navigation-controls">
            <button
              className="btn-prev"
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              ← Previous
            </button>

            <button
              className="btn-submit"
              onClick={() => setShowResults(true)}
            >
              <Volume2 size={16} />
              Submit & Review
            </button>

            <button
              className="btn-next"
              onClick={handleNext}
              disabled={currentIndex === filteredQuestions.length - 1}
            >
              Next →
            </button>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${((currentIndex + 1) / filteredQuestions.length) * 100}%`,
              }}
            ></div>
          </div>
        </>
      ) : (
        <>
          <div className="results-summary">
            <div className="score-display">
              <div className="score-circle">
                <span className="score-number">{score}</span>
                <span className="score-total">/ {totalMarks}</span>
              </div>
              <div className="percentage">
                {Math.round((score / totalMarks) * 100)}%
              </div>
            </div>

            <div className="results-list">
              {filteredQuestions.map((q, idx) => {
                const isCorrect = userAnswers[idx] === q.correctIndex;
                const userSelectedOption = userAnswers[idx];
                return (
                  <div key={idx} className={`result-item ${isCorrect ? 'correct' : 'incorrect'}`}>
                    <div className="result-header">
                      <div className="result-icon">
                        {isCorrect ? (
                          <CheckCircle2 size={20} className="icon-correct" />
                        ) : (
                          <XCircle size={20} className="icon-incorrect" />
                        )}
                      </div>
                      <div className="result-info">
                        <div className="result-question">Q{idx + 1}: {q.question.substring(0, 60)}...</div>
                        <div className="result-marks">{q.marks_label}</div>
                      </div>
                    </div>
                    <div className="result-details">
                      {!isCorrect && (
                        <>
                          <div className="your-answer">
                            <strong>Your answer:</strong> {q.options[userSelectedOption ?? -1] || 'Not answered'}
                          </div>
                        </>
                      )}
                      <div className="correct-answer">
                        <strong>Correct answer:</strong> {q.options[q.correctIndex]}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="results-controls">
            <button className="btn-reset" onClick={handleReset}>
              Try Again
            </button>
            {selectedDifficulty !== 'ALL' && (
              <button
                className="btn-all-difficulties"
                onClick={() => {
                  setSelectedDifficulty('ALL');
                  setShowResults(false);
                }}
              >
                Try All Difficulties
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};
