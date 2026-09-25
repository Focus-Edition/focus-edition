import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { ingestDocument } from '../src/services/ingestion/documentIngestion';
import { generateMissionsFromIngestion } from '../src/services/generators/missionGenerator';

async function runPhase2Tests() {
  console.log('====================================================');
  console.log('PHASE 2 TESTING: Source-Grounded Mission Generation');
  console.log('====================================================\n');

  const fixturesDir = path.resolve(__dirname, 'fixtures');

  // Test 1: Generate missions from real TXT
  console.log('1. Generating missions from Access to Work TXT...');
  const txtPath = path.join(fixturesDir, 'sample-access-to-work.txt');
  const txtBuf = fs.readFileSync(txtPath);
  const txtIngest = await ingestDocument({ name: 'sample-access-to-work.txt', buffer: txtBuf });
  const edition = generateMissionsFromIngestion(txtIngest, {
    editionTitle: 'Access to Work — Focus Edition'
  });

  assert.strictEqual(edition.missions.length, txtIngest.sections.length);
  assert.strictEqual(edition.totalMissions, edition.missions.length);
  assert.ok(edition.totalTimeEstimateMinutes > 0);
  assert.strictEqual(edition.progress, 0);

  // Check each mission
  edition.missions.forEach((m, idx) => {
    assert.ok(m.id.startsWith(edition.id), 'Mission ID must be prefixed with editionId');
    assert.strictEqual(m.order, idx + 1);
    assert.ok(m.title.length > 3, 'Mission must have a real title');
    assert.ok(m.body.length > 50, 'Mission body must contain actual extracted text');
    assert.ok(m.readingEstimateMinutes >= 1 && m.readingEstimateMinutes <= 5, 'Estimate must be 1-5 mins for ADHD chunks');
    assert.ok(m.keyTakeaways.length >= 1, 'Key takeaways must be populated');

    // Source grounding assertions
    assert.ok(m.sourceReference, 'Mission must have sourceReference');
    assert.ok(m.sourceReference.charStart >= 0, 'charStart must be non-negative');
    assert.ok(m.sourceReference.charEnd > m.sourceReference.charStart, 'charEnd must be greater than charStart');
    assert.ok(m.sourceReference.rawSnippet.length > 10, 'rawSnippet must be present');
    assert.ok(m.sourceReference.sourceLocator.length > 5, 'sourceLocator must be informative');

    // Ensure body text exists in full document
    assert.ok(txtIngest.fullText.includes(m.body), `Mission ${m.id} body must exist verbatim in full extracted text`);
  });

  console.log(`   ✓ Created ${edition.missions.length} source-grounded missions.`);
  console.log(`   ✓ All missions verified against verbatim source text.`);
  console.log(`   ✓ Total estimated focus time: ${edition.totalTimeEstimateMinutes} minutes.\n`);

  // Test 2: Source Page Numbers from PDF
  console.log('2. Generating missions from PIP PDF with page tracking...');
  const pdfPath = path.join(fixturesDir, 'sample-handbook.pdf');
  const pdfBuf = fs.readFileSync(pdfPath);
  const pdfIngest = await ingestDocument({ name: 'sample-handbook.pdf', buffer: pdfBuf });
  const pdfEdition = generateMissionsFromIngestion(pdfIngest);

  assert.strictEqual(pdfEdition.missions.length, 2);
  assert.strictEqual(pdfEdition.missions[0].sourceReference.pageNumber, 1, 'Mission 1 must be grounded in Page 1');
  assert.strictEqual(pdfEdition.missions[1].sourceReference.pageNumber, 2, 'Mission 2 must be grounded in Page 2');
  assert.ok(pdfEdition.missions[0].sourceReference.sourceLocator.includes('Page 1'));
  assert.ok(pdfEdition.missions[1].sourceReference.sourceLocator.includes('Page 2'));
  console.log('   ✓ Page numbers and source locators verified on multi-page PDF.\n');

  // Test 3: Long section automatic subdivision
  console.log('3. Testing long section chunking into sub-missions...');
  const longText = `
SECTION 1: EXTENSIVE REGULATION GUIDELINES
Paragraph 1: In the field of cognitive accessibility, extensive long-form documentation presents an acute challenge for neurodivergent individuals, specifically those diagnosed with Attention Deficit Hyperactivity Disorder or Autism Spectrum Conditions. Traditional documentation fails to accommodate working memory constraints, resulting in rapid cognitive fatigue and avoidance behaviors. When individuals encounter dense walls of text, the brain struggles to prioritize salient operational steps.

Paragraph 2: To mitigate this severe cognitive overhead, content must be broken down into structured, self-contained units that can be consumed in single focused bursts of two to five minutes. Each unit must present clear operational objectives, transparent time requirements, and immediate feedback mechanisms such as active recall questions or flashcards. By providing continuous positive reinforcement and clear visual termination boundaries, completion rates improve dramatically.

Paragraph 3: Furthermore, statutory regulations surrounding workplace accommodations mandate that employers maintain proactive communication loops. When employees request adaptive equipment, such as noise-cancelling headphones or ergonomic furniture, the processing timeline should never exceed thirty calendar days. Employers must designate a trained disability champion to coordinate technical assessments and maintain auditable records of all accommodation requests and outcomes.

Paragraph 4: Compliance with national disability frameworks requires comprehensive training for line managers and executive leadership. Every managerial review must incorporate questions regarding sensory environments and workload pacing. Failure to provide reasonable adjustments constitutes unlawful discrimination under civil rights legislation, exposing non-compliant entities to legal liabilities and statutory compensation awards.
  `.trim();

  const longIngest = await ingestDocument({ name: 'long-doc.txt', text: longText });
  const longEdition = generateMissionsFromIngestion(longIngest);
  assert.ok(longEdition.missions.length >= 2, 'Long document should be split into at least 2 sub-missions');
  assert.ok(longEdition.missions[0].title.includes('Part 1'), 'First sub-mission should have Part 1 in title');
  assert.ok(longEdition.missions[1].title.includes('Part 2'), 'Second sub-mission should have Part 2 in title');
  console.log(`   ✓ Long section cleanly subdivided into ${longEdition.missions.length} digestible parts.\n`);

  // Test 4: Rejection of empty ingestion
  console.log('4. Testing rejection of empty ingestion...');
  assert.throws(
    () => generateMissionsFromIngestion({ success: false, metadata: {} as any, fullText: '', sections: [] }),
    /Cannot generate missions from an empty/,
    'Should throw error on invalid ingestion'
  );
  console.log('   ✓ Empty document cleanly rejected without fabricating content.\n');

  console.log('====================================================');
  console.log('🎉 PHASE 2 COMPLETE: Source-grounded mission generator verified!');
  console.log('====================================================');
}

runPhase2Tests().catch(err => {
  console.error('Phase 2 test failed:', err);
  process.exit(1);
});
