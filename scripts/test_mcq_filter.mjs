#!/usr/bin/env node

/**
 * Quick verification that MCQ filtering works correctly
 */

// Test cases from qa.ts
const testQuestions = [
  {
    question: "Convert 11010110₂ to denary and hexadecimal.",
    answer: "Denary: 214\nHexadecimal: D6",
    tags: ["calculate"],
    shouldFilter: true,
    reason: "Multiple conversions with 'and'"
  },
  {
    question: "Convert denary numbers 20, 32, and 165 to hexadecimal.",
    answer: "14\n20\nA5",
    tags: ["conversion"],
    shouldFilter: true,
    reason: "Multiple conversions with commas and 'and'"
  },
  {
    question: "Identify incorrect statement about hexadecimal number system.",
    answer: "It is a base 10 system",
    tags: ["multiple-choice"],
    shouldFilter: false,
    reason: "True MCQ - should be kept"
  },
  {
    question: "Give two reasons why ticket numbers are displayed as hexadecimal.",
    answer: "1. Shorter representation than binary\n2. Easier for humans to read",
    tags: ["give reasons"],
    shouldFilter: true,
    reason: "Requires explanation, not MCQ"
  },
  {
    question: "Draw a circuit diagram showing...",
    answer: "Circuit with...",
    tags: ["diagram"],
    shouldFilter: true,
    reason: "Drawing question"
  }
];

// Recreate filter logic
const isSuitableForMCQ = (q) => {
  // Filter out questions not suitable for MCQ format
  
  // 1. Avoid "Convert X, Y, Z to..." multi-value conversion problems
  // Check if question has multiple targets (e.g., "to denary and hexadecimal")
  const hasMultipleTargets = /to\s+\w+\s+(and|or)\s+\w+/i.test(q.question);
  const hasListOfValues = /\d+\s*,\s*\d+\s*(,|\s+and)/i.test(q.question);
  if (hasMultipleTargets || hasListOfValues) {
    return false;
  }

  // 2. Avoid drawing, sketching, or diagram questions
  const avoidPatterns = [
    /draw|sketch|diagram|illustrate|flow.*chart|state.*diagram/i,
    /show.*working|show.*calculation|show.*steps|demonstrate/i,
    /construct|build.*circuit|design|create|write.*code/i,
    /write.*program|code.*in|algorithm|table|list/i,
    /\bgive\b.*(reason|explanation|example)|\bexplain\b|\bdescribe\b|\bstate\b/i,
    /complete.*(table|sentence|paragraph)/i,
  ];
  
  if (avoidPatterns.some(p => p.test(q.question))) {
    return false;
  }

  // 3. Avoid questions with very long answers (likely explanations)
  if (!q.answer) return false;
  const answerLength = q.answer.length;
  if (answerLength > 400) return false;

  // 4. Avoid questions that require multiple answer lines (calculation steps)
  const answerLines = q.answer.split('\n').filter(l => l.trim());
  if (answerLines.length > 4) return false;

  // 5. Avoid questions marked with certain tags that aren't "multiple-choice"
  const avoidTags = [
    'short_answer', 'fill_in', 'complete', 'draw', 'write',
    'conversion', 'calculate', 'conversion', 'calculation',
    'give', 'explain', 'describe', 'state',
  ];
  if (q.tags && q.tags.some(tag => avoidTags.includes(tag.toLowerCase()))) {
    return false;
  }

  return true;
};

console.log('\n🔍 MCQ Filter Verification');
console.log('═'.repeat(70));

let allPass = true;

testQuestions.forEach((test, idx) => {
  const suitable = isSuitableForMCQ(test);
  const shouldKeep = !test.shouldFilter;
  const pass = suitable === shouldKeep;
  
  const status = pass ? '✅' : '❌';
  console.log(`\n${status} Test ${idx + 1}: ${pass ? 'PASS' : 'FAIL'}`);
  console.log(`   Question: "${test.question.substring(0, 60)}${test.question.length > 60 ? '...' : ''}"`);
  console.log(`   Expected: ${shouldKeep ? 'KEEP (MCQ)' : 'FILTER OUT'}`);
  console.log(`   Got: ${suitable ? 'KEEP (MCQ)' : 'FILTER OUT'}`);
  console.log(`   Reason: ${test.reason}`);
  
  if (!pass) allPass = false;
});

console.log('\n' + '═'.repeat(70));
if (allPass) {
  console.log('✅ All tests PASSED! MCQ filtering is working correctly.');
} else {
  console.log('❌ Some tests FAILED! Check the filter logic.');
}
console.log('\n');
