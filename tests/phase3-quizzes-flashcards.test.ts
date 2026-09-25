import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { ingestDocument } from '../src/services/ingestion/documentIngestion';
import { generateMissionsFromIngestion } from '../src/services/generators/missionGenerator';

async function runPhase3Tests() {
  console.log('====================================================');
  console.log('PHASE 3 TESTING: Quizzes and Flashcards Generation');
  console.log('====================================================\n');

  const fixturesDir = path.resolve(__dirname, 'fixtures');

  // Test 1: Access to Work TXT Quizzes and Cards
  console.log('1. Testing Quizzes and Flashcards for Access to Work...');
  const txtPath = path.join(fixturesDir, 'sample-access-to-work.txt');
  const txtBuf = fs.readFileSync(txtPath);
  const txtIngest = await ingestDocument({ name: 'sample-access-to-work.txt', buffer: txtBuf });
  const edition = generateMissionsFromIngestion(txtIngest);

  edition.missions.forEach((mission, mIdx) => {
    // Quizzes assertions
    assert.ok(mission.quizQuestions.length > 0, `Mission ${mission.order} must have quiz questions`);
    mission.quizQuestions.forEach((q, qIdx) => {
      assert.ok(q.id.startsWith(`quiz_${mission.id}`), 'Question ID must be scoped to mission');
      assert.ok(q.question.length > 10, 'Question text must be substantive');
      assert.strictEqual(q.options.length, 4, 'Must provide 4 options');

      const correctOptions = q.options.filter(o => o.isCorrect);
      assert.strictEqual(correctOptions.length, 1, 'Exactly one option must be marked correct');

      // The correct answer must exist in the mission's body text
      assert.ok(
        mission.body.includes(correctOptions[0].text),
        `Correct answer for Q${qIdx + 1} must exist verbatim in mission text: "${correctOptions[0].text}"`
      );

      // Source reference check
      assert.ok(q.sourceReference, 'Quiz question must have a sourceReference');
      assert.ok(q.sourceReference.rawSnippet.length > 0, 'rawSnippet must not be empty');
      assert.ok(q.sourceReference.sourceLocator.length > 0, 'sourceLocator must be descriptive');
      assert.ok(
        q.explanation.includes(q.sourceReference.rawSnippet),
        'Explanation must reference the raw source snippet'
      );
    });

    // Flashcards assertions
    assert.ok(mission.flashcards.length > 0, `Mission ${mission.order} must have flashcards`);
    mission.flashcards.forEach((card, cIdx) => {
      assert.ok(card.id.startsWith(`card_${mission.id}`), 'Card ID must be scoped to mission');
      assert.ok(card.front.length > 3, 'Front of card must be non-empty concept');
      assert.ok(card.back.length > 10, 'Back of card must be non-empty factual answer');

      // Back of card must be grounded in mission body
      assert.ok(
        mission.body.includes(card.back),
        `Flashcard ${cIdx + 1} back must exist verbatim in mission text: "${card.back}"`
      );

      // Source reference check
      assert.ok(card.sourceReference, 'Card must have sourceReference');
      assert.ok(card.sourceReference.rawSnippet.length > 0);
      assert.ok(card.sourceReference.sourceLocator.includes(`Card ${cIdx + 1}`));
    });
  });

  console.log(`   ✓ Verified ${edition.missions.length} missions with 100% source-grounded quizzes & cards.`);
  console.log(`   ✓ All correct quiz answers and flashcard backs verified verbatim against source.\n`);

  // Test 2: Multi-page PDF Quiz and Card Page Traceability
  console.log('2. Testing Source Page Traceability in PDF Quizzes and Cards...');
  const pdfPath = path.join(fixturesDir, 'sample-handbook.pdf');
  const pdfBuf = fs.readFileSync(pdfPath);
  const pdfIngest = await ingestDocument({ name: 'sample-handbook.pdf', buffer: pdfBuf });
  const pdfEdition = generateMissionsFromIngestion(pdfIngest);

  // Mission 1 (Page 1)
  const m1 = pdfEdition.missions[0];
  assert.strictEqual(m1.sourceReference.pageNumber, 1);
  m1.quizQuestions.forEach(q => {
    assert.strictEqual(q.sourceReference.pageNumber, 1, 'Question must inherit Page 1 reference');
    assert.ok(q.sourceReference.sourceLocator.includes('Page 1'));
  });
  m1.flashcards.forEach(c => {
    assert.strictEqual(c.sourceReference.pageNumber, 1, 'Card must inherit Page 1 reference');
    assert.ok(c.sourceReference.sourceLocator.includes('Page 1'));
  });

  // Mission 2 (Page 2)
  const m2 = pdfEdition.missions[1];
  assert.strictEqual(m2.sourceReference.pageNumber, 2);
  m2.quizQuestions.forEach(q => {
    assert.strictEqual(q.sourceReference.pageNumber, 2, 'Question must inherit Page 2 reference');
    assert.ok(q.sourceReference.sourceLocator.includes('Page 2'));
  });
  m2.flashcards.forEach(c => {
    assert.strictEqual(c.sourceReference.pageNumber, 2, 'Card must inherit Page 2 reference');
    assert.ok(c.sourceReference.sourceLocator.includes('Page 2'));
  });

  console.log('   ✓ Page 1 and Page 2 source references strictly preserved in all interactive items.\n');

  console.log('====================================================');
  console.log('🎉 PHASE 3 COMPLETE: Quizzes and flashcards verified!');
  console.log('====================================================');
}

runPhase3Tests().catch(err => {
  console.error('Phase 3 test failed:', err);
  process.exit(1);
});
