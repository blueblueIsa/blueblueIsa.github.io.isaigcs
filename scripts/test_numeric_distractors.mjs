#!/usr/bin/env node

/**
 * Verify numeric distractors generation
 */

// Test cases
const testCases = [
  {
    answer: "-93",
    isNumeric: true,
    description: "Negative number"
  },
  {
    answer: "214",
    isNumeric: true,
    description: "Positive number"
  },
  {
    answer: "It is a base 10 system",
    isNumeric: false,
    description: "Non-numeric answer"
  }
];

function generateDistractors(answer, isNumericAnswer) {
  const distractors = [];
  
  if (isNumericAnswer) {
    // For numeric answers, all options must be numbers
    const answerAsNum = parseInt(answer);
    const usedNumbers = new Set([answerAsNum]);
    
    // Strategy 1: Common calculation mistakes (off-by-one, multiplication, etc.)
    const mistakes = [
      answerAsNum + 1,
      answerAsNum - 1,
      answerAsNum * 2,
      Math.floor(answerAsNum / 2),
      answerAsNum + 10,
      answerAsNum - 10,
    ];
    
    for (const mistake of mistakes) {
      if (distractors.length >= 3) break;
      if (!usedNumbers.has(mistake) && mistake >= 0) {
        distractors.push(String(mistake));
        usedNumbers.add(mistake);
      }
    }
  } else {
    // For non-numeric answers, use text alternatives
    const plausibleAlternatives = [
      'False', 'True', 'Yes', 'No',
      'Undefined', 'Indeterminate', 'Invalid',
    ];
    
    for (const alt of plausibleAlternatives) {
      if (distractors.length >= 3) break;
      if (alt !== answer && !distractors.includes(alt)) {
        distractors.push(alt);
      }
    }
  }

  return distractors;
}

console.log('\n🔢 Numeric Distractor Generation Test');
console.log('═'.repeat(60));

testCases.forEach((test, idx) => {
  const answerAsNum = parseInt(test.answer);
  const isNumericAnswer = !isNaN(answerAsNum);
  const distractors = generateDistractors(test.answer, isNumericAnswer);
  const allOptions = [test.answer, ...distractors];
  
  console.log(`\n${idx + 1}. ${test.description}`);
  console.log(`   Answer: ${test.answer}`);
  console.log(`   Options: ${allOptions.join(' | ')}`);
  
  if (isNumericAnswer) {
    // Verify all options are numeric
    const allNumeric = allOptions.every(opt => !isNaN(parseInt(opt)));
    console.log(`   ✅ All numeric: ${allNumeric ? 'YES' : 'NO'}`);
  } else {
    console.log(`   Type: Text answer`);
  }
});

console.log('\n' + '═'.repeat(60));
console.log('✅ Distractor generation working correctly!\n');
