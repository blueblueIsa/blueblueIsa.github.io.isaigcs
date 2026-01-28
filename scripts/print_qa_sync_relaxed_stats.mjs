import fs from 'fs';
const p = JSON.parse(fs.readFileSync('./src/data/qa_sync_proposals_relaxed.json','utf8'));
const total = p.length;
const c90 = p.filter(x=>x.confidence>=0.9).length;
const c8 = p.filter(x=>x.confidence>=0.8 && x.confidence<0.9).length;
const c7 = p.filter(x=>x.confidence>=0.7 && x.confidence<0.8).length;
console.log(`proposals: ${total}, >=0.9: ${c90}, 0.8-0.9: ${c8}, 0.7-0.8: ${c7}`);
console.log('\nTop 15 proposals (by confidence):');
p.slice(0,15).forEach((r,i)=>console.log(`${i+1}. ${r.unitId}/${r.term} (${r.matchType}, ${r.confidence}) -> ${r.question}`));

// print first 5 candidates with confidence >=0.95
console.log('\nHigh-confidence (>=0.95) sample:');
p.filter(x=>x.confidence>=0.95).slice(0,10).forEach((r,i)=>console.log(`${i+1}. ${r.unitId}/${r.term} (${r.matchType}, ${r.confidence}) -> ${r.question}`));
