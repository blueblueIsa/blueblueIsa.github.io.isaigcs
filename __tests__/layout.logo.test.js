const React = require('react');
const { render, screen } = require('@testing-library/react');
const { Layout } = require('../src/components/layout/layout.testable');

describe('Layout logo removal', () => {
  test('logo-wrap is removed (no CS LAB label)', () => {
    render(React.createElement(Layout));
    const logo = screen.queryByLabelText('CS LAB');
    expect(logo).toBeNull();
  });
});