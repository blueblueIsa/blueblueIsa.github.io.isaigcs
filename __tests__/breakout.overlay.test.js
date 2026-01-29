const React = require('react');
const { render, screen, act, fireEvent } = require('@testing-library/react');
const { BreakoutGame } = require('../src/modules/games/breakout.testable');

jest.useFakeTimers();

describe('Breakout overlay', () => {
  afterEach(() => {
    delete window.breakoutControls;
    jest.clearAllTimers();
  });

  test('shows Game Over overlay when lives are 0 and buttons call controls', async () => {
    const onBack = jest.fn();
    render(React.createElement(BreakoutGame, { onBack }));

    const resetMock = jest.fn();
    const startMock = jest.fn();

    window.breakoutControls = {
      gameState: {
        isPlaying: false,
        lives: 0,
        bricks: [[{ status: 0 }]],
        level: 1
      },
      resetGame: resetMock,
      startGame: startMock
    };

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    expect(screen.getByText('Game Over')).not.toBeNull();

    const retry = screen.getByText('Retry');
    await act(async () => {
      fireEvent.click(retry);
    });

    expect(resetMock).toHaveBeenCalled();
    expect(startMock).toHaveBeenCalled();

    const back = screen.getByText('Back');
    await act(async () => {
      fireEvent.click(back);
    });
    expect(onBack).toHaveBeenCalled();
  });
});
