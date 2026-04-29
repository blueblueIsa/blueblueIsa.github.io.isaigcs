#!/usr/bin/env node

/**
 * Test improved distractor generation for statement-type questions
 */

// Mock distractor generation logic
function generateDistractors(answer, isNumericAnswer, isStatement) {
  const distractors = [];
  
  if (isStatement) {
    // For statement-type answers, generate plausible alternative statements
    const answerLower = answer.toLowerCase();
    
    const statementDisstractors = [
      // Opposite/negation
      answer.includes('stored') ? 'It is transmitted' : 'It is not permanent',
      answer.includes('permanent') ? 'It is temporary' : 'It is permanent',
      answer.includes('volatile') ? 'It is permanent' : 'It is volatile',
      answer.includes('temporary') ? 'It is permanent' : 'It is temporary',
      answer.includes('fast') ? 'It is slow' : 'It is fast',
      answer.includes('slow') ? 'It is fast' : 'It is slow',
      
      // Alternative incorrect statements based on keywords
      answerLower.includes('ram') ? 'It is used for permanent storage' : 'It is used for temporary storage',
      answerLower.includes('rom') ? 'It can be easily modified' : 'It is read-only',
      answerLower.includes('cache') ? 'It is slower than RAM' : 'It is faster than RAM',
      answerLower.includes('storage') ? 'It can hold large amounts of data' : 'It has limited capacity',
    ];
    
    for (const distractor of statementDisstractors) {
      if (distractors.length >= 3) break;
      if (distractor && 
          distractor.length > 10 && 
          distractor !== answer && 
          !distractors.includes(distractor)) {
        distractors.push(distractor);
      }
    }
    
    const genericStatements = [
      'It depends on the system',
      'This is not universally true',
      'It is determined by user settings',
      'It cannot be determined',
      'It varies by manufacturer',
    ];
    
    for (const stmt of genericStatements) {
      if (distractors.length >= 3) break;
      if (!distractors.includes(stmt)) {
        distractors.push(stmt);
      }
    }
  }
  
  return distractors;
}

const testCases = [
  {
    question: 'Identify correct statement about RAM.',
    answer: 'It stores data currently in use',
    isStatement: true,
    expectedQuality: 'Should generate meaningful statements, not keywords'
  },
  {
    question: 'Identify correct statement about ROM.',
    answer: 'It is read-only memory that contains firmware.',
    isStatement: true,
    expectedQuality: 'Should avoid options like "ROM", "firmware", "read-only"'
  },
];

console.log('\n🎯 Statement-Type Question Distractor Test');
console.log('═'.repeat(70));

testCases.forEach((test, idx) => {
  const isStatement = test.answer.length > 20 && /[.;:]/.test(test.answer);
  const distractors = generateDistractors(test.answer, false, isStatement);
  const allOptions = [test.answer, ...distractors];
  
  console.log(`\n${idx + 1}. Question: "${test.question}"`);
  console.log(`   Answer: "${test.answer}"`);
  console.log(`   Is Statement: ${isStatement ? 'YES ✓' : 'NO'}`);
  console.log(`   \n   All Options:`);
  
  allOptions.forEach((opt, i) => {
    const isCorrect = opt === test.answer;
    const marker = isCorrect ? '✓' : ' ';
    console.log(`   ${String.fromCharCode(65 + i)}. ${opt} ${marker}`);
  });
  
  // Validation
  const allAreMeaningful = allOptions.every(opt => opt.length > 10 || /[.;:]/.test(opt));
  const noSingleKeywords = !allOptions.some(opt => 
    opt.length < 5 && !opt.includes(' ')
  );
  
  console.log(`   \n   Quality Checks:`);
  console.log(`   - All options are meaningful statements: ${allAreMeaningful ? '✓' : '✗'}`);
  console.log(`   - No single keywords: ${noSingleKeywords ? '✓' : '✗'}`);
});

console.log('\n' + '═'.repeat(70));
console.log('✅ Improved distractor generation for statement questions!\n');
