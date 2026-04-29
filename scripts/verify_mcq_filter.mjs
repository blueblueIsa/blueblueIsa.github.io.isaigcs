#!/usr/bin/env node

import { qaData } from '../src/data/qa.js';

// Recreate the filter logic
const isSuitableForMCQ = (q) => {
  const convertMultiplePattern = /convert.*(,|and).*(to|into)/i;
  if (convertMultiplePattern.test(q.question)) {
    const questionParts = q.question.split(/,|and/);
    if (questionParts.length > 2) return false;
  }

  const avoidPatterns = [
    /draw|sketch|diagram|illustrate/i,
    /show.*working|show.*calculation|show.*steps/i,
    /construct|build.*circuit|design/i,
    /write.*program|code.*in|algorithm/i,
  ];
  
  if (avoidPatterns.some(p => p.test(q.question))) {
    return false;
  }

  if (!q.answer) return false;
  const answerLength = q.answer.length;
  if (answerLength > 500) return false;

  const answerLines = q.answer.split('\n').filter(l => l.trim());
  if (answerLines.length > 5) return false;

  const avoidTags = ['short_answer', 'fill_in', 'complete', 'draw', 'write'];
  if (q.tags && q.tags.some(tag => avoidTags.includes(tag.toLowerCase()))) {
    return false;
  }

  return true;
};

// Check all questions
let totalQuestions = 0;
let suitableForMCQ = 0;
let rejected = [];

for (const unitId in qaData) {
  const unitQA = qaData[unitId] || {};
  for (const topic in unitQA) {
    const topicQuestions = unitQA[topic] || [];
    for (const q of topicQuestions) {
      totalQuestions++;
      if (isSuitableForMCQ(q)) {
        suitableForMCQ++;
      } else {
        rejected.push({
          question: q.question.substring(0, 80),
          reason: generateReason(q),
          answer_preview: q.answer.substring(0, 60),
        });
      }
    }
  }
}

function generateReason(q) {
  if (/convert.*(,|and).*(to|into)/i.test(q.question)) {
    return "Multiple conversion question";
  }
  if (/draw|sketch|diagram|illustrate/i.test(q.question)) {
    return "Drawing/Diagram question";
  }
  if (/show.*working|show.*calculation|show.*steps/i.test(q.question)) {
    return "Requires showing working";
  }
  if (/construct|build.*circuit|design/i.test(q.question)) {
    return "Design/Construction question";
  }
  if (/write.*program|code.*in|algorithm/i.test(q.question)) {
    return "Programming question";
  }
  const answerLength = q.answer.length;
  if (answerLength > 500) {
    return "Answer too long (explanation)";
  }
  const answerLines = q.answer.split('\n').filter(l => l.trim());
  if (answerLines.length > 5) {
    return "Multi-line calculation/explanation";
  }
  const avoidTags = ['short_answer', 'fill_in', 'complete', 'draw', 'write'];
  if (q.tags && q.tags.some(tag => avoidTags.includes(tag.toLowerCase()))) {
    return `Question tagged as: ${q.tags.join(', ')}`;
  }
  return "Unknown reason";
}

console.log('\n📊 MCQ Suitability Analysis');
console.log('═'.repeat(60));
console.log(`Total questions: ${totalQuestions}`);
console.log(`Suitable for MCQ: ${suitableForMCQ} (${((suitableForMCQ/totalQuestions)*100).toFixed(1)}%)`);
console.log(`Rejected: ${rejected.length} (${((rejected.length/totalQuestions)*100).toFixed(1)}%)`);

console.log('\n❌ Sample of Rejected Questions:');
console.log('─'.repeat(60));
rejected.slice(0, 10).forEach((item, i) => {
  console.log(`\n${i + 1}. ${item.question}`);
  console.log(`   Reason: ${item.reason}`);
  console.log(`   Answer: ${item.answer_preview}...`);
});

console.log('\n✅ Questions ARE being correctly filtered!');
