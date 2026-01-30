// Unit tests for Related Q&A helper

afterEach(() => {
  jest.resetModules();
  delete process.env.VITE_RELATED_QA_FUZZY;
});

test('hasRelatedQAForTerm returns false when no assigned QA and fuzzy disabled', () => {
  const { hasRelatedQAForTerm } = require('../src/modules/common/qaHelpers.js');
  const emptyQa = {};

  const assignedMap = {};
  const res = hasRelatedQAForTerm('Cache memory', assignedMap, 'test-cs', emptyQa, false);
  expect(res).toBe(false);
});

test('hasRelatedQAForTerm returns true when fuzzy enabled and fuzzy match exists', () => {
  const { hasRelatedQAForTerm } = require('../src/modules/common/qaHelpers.js');
  const qaData = {
    'test-cs': {
      'Memory': [
        { question: 'What is cache memory?', answer: '', paper: 'S23P1', topic: 'Memory', keywords: ['cache'] }
      ]
    }
  };

  const assignedMap = {};
  const res = hasRelatedQAForTerm('Cache memory', assignedMap, 'test-cs', qaData, true);
  expect(res).toBe(true);
});
