const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { PDFDocument, StandardFonts } = require('pdf-lib');
const JSZip = require('jszip');

async function createFixtures() {
  const dir = path.resolve('tests/fixtures');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // 1. TXT fixture
  const txtContent = `ACCESS TO WORK GRANT SPECIFICATION
SECTION 1: OVERVIEW AND PURPOSE
Access to Work is a publicly funded employment support programme that helps individuals with disabilities, mental health conditions, and neurodivergent profiles (including ADHD and Autism) to start work, stay in work, or become self-employed. The grant covers practical support beyond what employers are legally required to provide as reasonable adjustments under the Equality Act 2010. Crucially, Access to Work awards are non-repayable grants, not loans.

SECTION 2: ELIGIBILITY CRITERIA
To qualify for Access to Work assistance, applicants must meet the following statutory requirements:
1. Be aged 16 years or older.
2. Normally live and work in England, Scotland, or Wales.
3. Have a physical or mental health condition or learning difficulty that impacts your ability to do your job.
4. Have paid employment starting within 4 weeks, be currently in paid employment, or be registered as self-employed.
A formal diagnosis is not strictly required at the initial application stage. Eligibility is evaluated based on workplace functional barriers rather than diagnostic labels.

SECTION 3: FUNDED SUPPORT TYPES
The grant can fund several distinct categories of practical intervention:
- Specialist assistive equipment: Active noise-cancelling headphones, screen readers, ergonomic seating, and dual-monitor task displays.
- Support workers and job coaching: Certified ADHD workplace coaches, professional note-takers, and personal readers.
- Travel assistance: Taxi fares or specialised transport support if public transportation causes severe sensory overload or anxiety.
- Mental Health Support Service: Dedicated mental health work-plans offering up to 9 months of confidential, one-on-one workplace guidance.

SECTION 4: FINANCIAL CAPS AND CLAIM PROCEDURES
Since April 2026, the maximum annual Access to Work grant award is capped at £69,260 per financial year. Claimants have a statutory window of 9 months from the date of expenditure to submit receipts for reimbursement. Reimbursement claims may be submitted electronically via the secure DWP online portal, eliminating the need for postal paperwork.`;
  fs.writeFileSync(path.join(dir, 'sample-access-to-work.txt'), txtContent.trim());
  console.log('✓ Created sample-access-to-work.txt');

  // 2. Markdown fixture
  const mdContent = `# ADHD Workplace Success Guide

## Executive Summary
Navigating complex corporate environments with an ADHD or AuDHD brain requires clear structural boundaries, external working memory aids, and intentional sensory management.

## Core Workplace Accommodations
### Environmental Adjustments
- Noise mitigation through high-fidelity active noise-cancelling headphones
- Dedicated quiet focus zones away from high-traffic open-plan office corridors
- Anti-glare monitors and adjustable indirect lighting

### Workflow and Task Management
- Breaking all multi-stage deliverables into 15-minute micro-tasks
- Providing all verbal instructions in concise, written bullet points within 2 hours of meetings
- Daily asynchronous standups instead of lengthy synchronous status updates

## Communication Protocols
When communicating priority shifts, managers must specify explicit due dates and numerical impact. Never assign open-ended tasks with ambiguous deadlines like "as soon as possible".`;
  fs.writeFileSync(path.join(dir, 'sample-guide.md'), mdContent.trim());
  console.log('✓ Created sample-guide.md');

  // 3. HTML fixture
  const htmlContent = `<!DOCTYPE html>
<html>
<head><title>Equality Act 2010 Guidance</title></head>
<body>
  <article>
    <h1>Equality Act 2010: Employer Obligations</h1>
    <section>
      <h2>Section 20: The Duty to Make Adjustments</h2>
      <p>Under Section 20 of the Equality Act 2010, an employer has a proactive legal duty to take reasonable steps to avoid substantial disadvantage experienced by disabled employees in comparison with non-disabled employees.</p>
    </section>
    <section>
      <h2>The Three Statutory Requirements</h2>
      <ul>
        <li>Provisions, criteria, or practices: Changing internal attendance policies or core hours.</li>
        <li>Physical features: Altering architectural barriers, lighting, or room acoustics.</li>
        <li>Auxiliary aids: Supplying assistive technology software, text-to-speech tools, or sensory regulation equipment.</li>
      </ul>
    </section>
    <section>
      <h2>Reasonableness Test</h2>
      <p>In assessing whether an adjustment is reasonable, tribunals consider the cost, financial resources of the employer, practical feasibility, and degree of disruption.</p>
    </section>
  </article>
</body>
</html>`;
  fs.writeFileSync(path.join(dir, 'sample-policy.html'), htmlContent.trim());
  console.log('✓ Created sample-policy.html');

  // 4. PDF fixture (multi-page text PDF)
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const p1 = pdfDoc.addPage([595, 842]);
  p1.drawText('Personal Independence Payment (PIP) Handbook', { x: 50, y: 790, font: boldFont, size: 18 });
  p1.drawText('Chapter 1: The Daily Living Component', { x: 50, y: 750, font: boldFont, size: 14 });
  p1.drawText('PIP daily living component evaluates 10 key activities essential for independent survival.', { x: 50, y: 720, font, size: 11 });
  p1.drawText('These activities include preparing food, taking nutrition, managing therapy, and washing.', { x: 50, y: 700, font, size: 11 });
  p1.drawText('A total of 8 points qualifies for standard rate, while 12 points awards enhanced rate.', { x: 50, y: 680, font, size: 11 });

  const p2 = pdfDoc.addPage([595, 842]);
  p2.drawText('Chapter 2: The Mobility Component', { x: 50, y: 790, font: boldFont, size: 14 });
  p2.drawText('The mobility component consists of two distinct statutory activities:', { x: 50, y: 760, font, size: 11 });
  p2.drawText('Activity 1 measures planning and following journeys including overwhelming sensory anxiety.', { x: 50, y: 740, font, size: 11 });
  p2.drawText('Activity 2 measures physical walking distance and moving around without severe discomfort.', { x: 50, y: 720, font, size: 11 });
  p2.drawText('Scores of 8 and 12 points map to standard and enhanced mobility awards respectively.', { x: 50, y: 700, font, size: 11 });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(path.join(dir, 'sample-handbook.pdf'), pdfBytes);
  console.log('✓ Created sample-handbook.pdf');

  // 5. Image fixture (PNG)
  const imgPath = path.join(dir, 'sample-receipt.png');
  execSync(`convert -size 600x160 xc:white -font DejaVu-Sans -pointsize 20 -fill black -draw "text 25,60 'Access to Work Claim Receipt 88241'" -draw "text 25,110 'Approved Equipment: Noise Cancelling Headset 249.99'" "${imgPath}"`);
  console.log('✓ Created sample-receipt.png');

  // 6. Scanned PDF fixture (Image-only PDF without text layer)
  const scannedImgPath = path.join(dir, 'temp-scan-page.png');
  execSync(`convert -size 600x160 xc:white -font DejaVu-Sans -pointsize 20 -fill black -draw "text 30,60 'DWP Medical Certificate Form B2'" -draw "text 30,110 'Diagnosis: ADHD Attention Deficit Support Required'" "${scannedImgPath}"`);
  
  const scannedPdfDoc = await PDFDocument.create();
  const scanImgBytes = fs.readFileSync(scannedImgPath);
  const embeddedScanImg = await scannedPdfDoc.embedPng(scanImgBytes);
  const scanPage = scannedPdfDoc.addPage([600, 160]);
  scanPage.drawImage(embeddedScanImg, { x: 0, y: 0, width: 600, height: 160 });
  const scannedPdfBytes = await scannedPdfDoc.save();
  fs.writeFileSync(path.join(dir, 'sample-scanned.pdf'), scannedPdfBytes);
  fs.unlinkSync(scannedImgPath);
  console.log('✓ Created sample-scanned.pdf');

  // 7. DOCX fixture
  const zip = new JSZip();
  zip.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
  zip.file('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
  
  const docxXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
      '<w:body>' +
        '<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>Disabled Students Allowance Guidelines</w:t></w:r></w:p>' +
        '<w:p><w:r><w:t>Disabled Students Allowance provides grant funding for higher education students living in England with neurodivergent conditions.</w:t></w:r></w:p>' +
        '<w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr><w:r><w:t>Specialist Equipment Allowance</w:t></w:r></w:p>' +
        '<w:p><w:r><w:t>The allowance covers specialist computer hardware, speech-to-text software, and digital audio recording pens.</w:t></w:r></w:p>' +
        '<w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr><w:r><w:t>Non-Medical Helper Allowance</w:t></w:r></w:p>' +
        '<w:p><w:r><w:t>Non-medical helpers include specialized one-to-one study skills tutors and assistive technology trainers.</w:t></w:r></w:p>' +
      '</w:body>' +
    '</w:document>';
  zip.file('word/document.xml', docxXml);
  const docxBytes = await zip.generateAsync({ type: 'nodebuffer' });
  fs.writeFileSync(path.join(dir, 'sample-contract.docx'), docxBytes);
  console.log('✓ Created sample-contract.docx');
}

createFixtures().catch(err => {
  console.error('Fixture creation failed:', err);
  process.exit(1);
});
