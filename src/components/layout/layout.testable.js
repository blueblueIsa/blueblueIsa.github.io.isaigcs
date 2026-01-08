const React = require('react');
const { useState, useEffect } = React;
function TestLayout() {
  return React.createElement('div', { className: 'test-layout' }, [
    React.createElement('div', { key: 'meta' }, 'Test layout - visits hidden')
  ]);
}

module.exports = { Layout: TestLayout };
