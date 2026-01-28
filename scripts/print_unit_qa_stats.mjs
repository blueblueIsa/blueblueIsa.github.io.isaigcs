import fs from 'fs';
const r = JSON.parse(fs.readFileSync('./src/data/unit_qa_report.json','utf8'));
const total = r.length;
const withQA = r.filter(x=>x.hasRelatedQA).length;
const withAnswerMatches = r.filter(x=>x.answersContainingDefinition && x.answersContainingDefinition.length>0).length;
const missing = r.filter(x=>!x.hasRelatedQA).slice(0,10).map(x=>`${x.unitId}/${x.term}`);
console.log(`terms: ${total}, withRelatedQA: ${withQA}, withAnswerMatches: ${withAnswerMatches}`);
console.log(`sample missing (${missing.length}): ${missing.join(', ')}`);
const perUnit = {};
for (const item of r) {
  perUnit[item.unitId] = perUnit[item.unitId] || {total:0, with:0};
  perUnit[item.unitId].total++;
  if (item.hasRelatedQA) perUnit[item.unitId].with++;
}
console.log('per-unit sample (first 6 units):');
Object.keys(perUnit).slice(0,6).forEach(k => console.log(k, perUnit[k]));
