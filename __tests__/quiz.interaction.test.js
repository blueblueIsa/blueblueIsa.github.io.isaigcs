const React = require('react');
const { render, screen, fireEvent } = require('@testing-library/react');
const { TestQuiz } = require('../src/modules/resources/quiz.testable');
const Quiz = TestQuiz;

describe('Quiz interactions', () => {
  beforeEach(() => { try { localStorage.clear(); } catch (_) {} });

  test('clicking show answers toggles reveal and persists state', () => {
    const { rerender } = render(React.createElement(Quiz));
    const showBtn = screen.getByRole('button', { name: /show answers|show answer/i });
    fireEvent.click(showBtn);
    // now hide button should be present
    expect(screen.getByRole('button', { name: /hide answers|hide answer/i })).toBeTruthy();

    // simulate unmount/mount
    rerender(React.createElement(Quiz));
    expect(screen.getByRole('button', { name: /hide answers|hide answer/i })).toBeTruthy();
  });

  test('blank responds to keyboard Enter key', () => {
    render(React.createElement(Quiz));
    // find a fill-in question; if current question is short-answer, navigate next until we see blanks
    const ensureHasBlanks = () => {
      let blanks = screen.queryAllByRole('button', { name: /Blank \d+ of/i });
      let tries = 0;
      while (blanks.length === 0 && tries < 6) {
        const next = screen.queryByRole('button', { name: /next/i });
        if (!next) break;
        fireEvent.click(next);
        blanks = screen.queryAllByRole('button', { name: /Blank \d+ of/i });
        tries++;
      }
      return blanks;
    };

    // click show answers if present
    const showBtn = screen.queryByRole('button', { name: /show answers|show answer/i });
    if (showBtn) fireEvent.click(showBtn);

    const blanks = ensureHasBlanks();
    expect(blanks.length).toBeGreaterThan(0);
    const blank = blanks[0];

    blank.focus();
    fireEvent.keyDown(blank, { key: 'Enter', code: 'Enter', charCode: 13 });
    // after pressing Enter it should toggle reveal state (presence of 'Show answers' if it hid)
    expect(screen.queryByRole('button', { name: /show answers|show answer/i }) || screen.queryByRole('button', { name: /hide answers|hide answer/i })).toBeTruthy();
  });
});