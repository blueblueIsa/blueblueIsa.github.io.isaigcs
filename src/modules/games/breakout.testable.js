const React = require('react');
const { useState, useEffect } = React;

function BreakoutTestable(props) {
  const [overlay, setOverlay] = useState(null);

  useEffect(() => {
    let mounted = true;
    const check = () => {
      const controls = typeof window !== 'undefined' && window.breakoutControls;
      if (!controls || !controls.gameState) {
        if (mounted) setOverlay(null);
        return;
      }

      const gs = controls.gameState;
      const noBricks = Array.isArray(gs.bricks) && gs.bricks.flat().every(b => b.status === 0);
      if (gs.lives <= 0) {
        if (mounted) setOverlay('gameover');
      } else if (noBricks) {
        if (mounted) setOverlay('levelclear');
      } else {
        if (mounted) setOverlay(null);
      }
    };

    const id = setInterval(check, 100);
    check();
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const controls = typeof window !== 'undefined' && window.breakoutControls;

  return React.createElement(
    'div',
    { className: 'breakout-testable' },
    [
      React.createElement('div', { key: 'canvas' }, 'Breakout canvas placeholder'),
      overlay === 'gameover' && React.createElement('div', { key: 'overlay', 'data-testid': 'overlay' }, [
        React.createElement('h2', { key: 'title' }, 'Game Over'),
        React.createElement('button', { key: 'retry', onClick: () => { controls && controls.resetGame && controls.resetGame(); controls && controls.startGame && controls.startGame(); } }, 'Retry'),
        React.createElement('button', { key: 'back', onClick: () => { props && props.onBack && props.onBack(); } }, 'Back')
      ]),
      overlay === 'levelclear' && React.createElement('div', { key: 'overlay2', 'data-testid': 'overlay' }, [
        React.createElement('h2', { key: 'title2' }, 'Level Clear'),
        React.createElement('button', { key: 'next', onClick: () => { controls && controls.startGame && controls.startGame(); } }, 'Next'),
        React.createElement('button', { key: 'back2', onClick: () => { props && props.onBack && props.onBack(); } }, 'Back')
      ])
    ]
  );
}

module.exports = { BreakoutGame: BreakoutTestable };
