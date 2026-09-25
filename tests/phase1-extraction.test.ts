import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { ingestDocument } from '../src/services/ingestion/documentIngestion';

async function runPhase1Tests() {
  console.log('====================================================');
  console.log('PHASE 1 TESTING: Document Extraction and OCR Pipeline');
  console.log('====================================================\n');

  const fixturesDir = path.resolve(__dirname, 'fixtures');

  // Test 1: TXT
  console.log('1. Testing TXT Extraction (sample-access-to-work.txt)...');
  const txtPath = path.join(fixturesDir, 'sample-access-to-work.txt');
  const txtBuf = fs.readFileSync(txtPath);
  const txtResult = await ingestDocument({ name: 'sample-access-to-work.txt', buffer: txtBuf });

  assert.strictEqual(txtResult.success, true, 'TXT extraction should succeed');
  assert.strictEqual(txtResult.metadata.fileType, 'txt');
  assert.ok(txtResult.sections.length >= 4, `Expected >= 4 sections in TXT, got ${txtResult.sections.length}`);
  assert.ok(txtResult.fullText.includes('£69,260'), 'Should extract financial cap £69,260');
  assert.ok(txtResult.sections.some(s => s.title.includes('ELIGIBILITY')), 'Should detect Eligibility heading');
  assert.ok(txtResult.sections[0].sourceReference.charStart >= 0, 'Source reference must have charStart');
  assert.ok(txtResult.sections[0].sourceReference.sourceLocator.length > 0, 'Source reference must have sourceLocator');
  console.log(`   ✓ TXT extracted: ${txtResult.metadata.wordCount} words, ${txtResult.sections.length} structured sections with source ranges.\n`);

  // Test 2: Markdown
  console.log('2. Testing Markdown Extraction (sample-guide.md)...');
  const mdPath = path.join(fixturesDir, 'sample-guide.md');
  const mdBuf = fs.readFileSync(mdPath);
  const mdResult = await ingestDocument({ name: 'sample-guide.md', buffer: mdBuf });

  assert.strictEqual(mdResult.success, true);
  assert.strictEqual(mdResult.metadata.fileType, 'md');
  assert.ok(mdResult.sections.length >= 3, `Expected >= 3 sections in MD, got ${mdResult.sections.length}`);
  assert.ok(mdResult.fullText.includes('noise-cancelling headphones'), 'Should extract text content');
  assert.ok(mdResult.sections.some(s => s.title.includes('Core Workplace Accommodations')), 'Should detect H2 heading');
  console.log(`   ✓ Markdown extracted: ${mdResult.metadata.wordCount} words, ${mdResult.sections.length} sections identified.\n`);

  // Test 3: HTML
  console.log('3. Testing HTML Extraction (sample-policy.html)...');
  const htmlPath = path.join(fixturesDir, 'sample-policy.html');
  const htmlBuf = fs.readFileSync(htmlPath);
  const htmlResult = await ingestDocument({ name: 'sample-policy.html', buffer: htmlBuf });

  assert.strictEqual(htmlResult.success, true);
  assert.strictEqual(htmlResult.metadata.fileType, 'html');
  assert.ok(htmlResult.fullText.includes('Equality Act 2010'), 'Should extract body text without HTML tags');
  assert.ok(!htmlResult.fullText.includes('<article>'), 'Should not contain raw HTML tags');
  assert.ok(htmlResult.sections.some(s => s.title.includes('Duty to Make Adjustments')), 'Should detect H2 heading');
  console.log(`   ✓ HTML extracted: ${htmlResult.metadata.wordCount} words, ${htmlResult.sections.length} sections.\n`);

  // Test 4: PDF
  console.log('4. Testing Native PDF Extraction (sample-handbook.pdf)...');
  const pdfPath = path.join(fixturesDir, 'sample-handbook.pdf');
  const pdfBuf = fs.readFileSync(pdfPath);
  const pdfResult = await ingestDocument({ name: 'sample-handbook.pdf', buffer: pdfBuf });

  assert.strictEqual(pdfResult.success, true);
  assert.strictEqual(pdfResult.metadata.fileType, 'pdf');
  assert.strictEqual(pdfResult.metadata.pageCount, 2, 'Should detect 2 pages');
  assert.ok(pdfResult.fullText.includes('Personal Independence Payment'), 'Should extract text from PDF');
  assert.ok(pdfResult.fullText.includes('Mobility Component'), 'Should extract text from Page 2');
  assert.strictEqual(pdfResult.sections[0].pageNumber, 1, 'Section 1 should be on page 1');
  assert.strictEqual(pdfResult.sections[1].pageNumber, 2, 'Section 2 should be on page 2');
  console.log(`   ✓ PDF extracted: ${pdfResult.metadata.pageCount} pages, ${pdfResult.metadata.wordCount} words, page locators attached.\n`);

  // Test 5: Scanned PDF (OCR)
  console.log('5. Testing Scanned PDF OCR (sample-scanned.pdf)...');
  const scannedPdfPath = path.join(fixturesDir, 'sample-scanned.pdf');
  const scannedPdfBuf = fs.readFileSync(scannedPdfPath);
  const scannedPdfResult = await ingestDocument({ name: 'sample-scanned.pdf', buffer: scannedPdfBuf });

  assert.strictEqual(scannedPdfResult.success, true);
  assert.ok(scannedPdfResult.metadata.ocrApplied, 'OCR must be applied to scanned PDF');
  assert.ok(scannedPdfResult.fullText.toLowerCase().includes('medical') || scannedPdfResult.fullText.toLowerCase().includes('adhd'), 'Should OCR key text');
  console.log(`   ✓ Scanned PDF OCR succeeded: confidence ${scannedPdfResult.metadata.ocrConfidence}%, text: "${scannedPdfResult.fullText.trim()}".\n`);

  // Test 6: DOCX
  console.log('6. Testing DOCX Extraction (sample-contract.docx)...');
  const docxPath = path.join(fixturesDir, 'sample-contract.docx');
  const docxBuf = fs.readFileSync(docxPath);
  const docxResult = await ingestDocument({ name: 'sample-contract.docx', buffer: docxBuf });

  assert.strictEqual(docxResult.success, true);
  assert.strictEqual(docxResult.metadata.fileType, 'docx');
  assert.ok(docxResult.fullText.includes('Disabled Students Allowance'), 'Should extract text from DOCX');
  assert.ok(docxResult.sections.some(s => s.title.includes('Specialist Equipment Allowance')), 'Should detect Heading 2');
  console.log(`   ✓ DOCX extracted: ${docxResult.metadata.wordCount} words, ${docxResult.sections.length} sections.\n`);

  // Test 7: Image (OCR)
  console.log('7. Testing Image OCR (sample-receipt.png)...');
  const imgPath = path.join(fixturesDir, 'sample-receipt.png');
  const imgBuf = fs.readFileSync(imgPath);
  const imgResult = await ingestDocument({ name: 'sample-receipt.png', buffer: imgBuf });

  assert.strictEqual(imgResult.success, true);
  assert.strictEqual(imgResult.metadata.fileType, 'image');
  assert.ok(imgResult.metadata.ocrApplied, 'OCR must be applied');
  assert.ok(imgResult.fullText.includes('88241') || imgResult.fullText.toLowerCase().includes('receipt'), 'Should OCR receipt number');
  console.log(`   ✓ Image OCR succeeded: confidence ${imgResult.metadata.ocrConfidence}%, text: "${imgResult.fullText.trim()}".\n`);

  // Test 8: Error handling & validation
  console.log('8. Testing Error Handling (Corrupt/Empty/Unsupported formats)...');
  
  // Empty file error
  await assert.rejects(
    async () => await ingestDocument({ name: 'empty.txt', buffer: Buffer.from('') }),
    /Cannot process empty text file/,
    'Empty TXT must throw descriptive error'
  );

  // Unsupported extension error
  await assert.rejects(
    async () => await ingestDocument({ name: 'malicious.exe', buffer: Buffer.from('4D5A') }),
    /Unsupported file format/,
    'Unsupported file format must throw descriptive error'
  );

  console.log('   ✓ Rejection tests passed: descriptive error thrown, no silent invented content.\n');

  console.log('====================================================');
  console.log('🎉 PHASE 1 COMPLETE: All 7 formats verified successfully!');
  console.log('====================================================');
}

runPhase1Tests().catch(err => {
  console.error('Phase 1 test failed:', err);
  process.exit(1);
});
