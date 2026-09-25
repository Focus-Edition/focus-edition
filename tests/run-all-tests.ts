import { execSync } from 'node:child_process';

const phases = [
  { name: 'Phase 1: Document extraction and OCR', cmd: 'npm run test:phase1' },
  { name: 'Phase 2: Source-grounded mission generation', cmd: 'npm run test:phase2' },
  { name: 'Phase 3: Quizzes and flashcards', cmd: 'npm run test:phase3' },
  { name: 'Phase 4: Accessibility, text-to-speech and timers', cmd: 'npm run test:phase4' },
  { name: 'Phase 5: Authentication, private storage and persistence', cmd: 'npm run test:phase5' },
  { name: 'Phase 6: Mobile navigation and offline-safe progress', cmd: 'npm run test:phase6' },
  { name: 'Phase 7: Test-mode subscriptions', cmd: 'npm run test:phase7' },
  { name: 'Phase 8: App-store preparation', cmd: 'npm run test:phase8' }
];

console.log('======================================================================');
console.log('FOCUS EDITION: RUNNING FULL 8-PHASE AUTOMATED VERIFICATION SUITE');
console.log('======================================================================\n');

let allPassed = true;

for (let i = 0; i < phases.length; i++) {
  const p = phases[i];
  console.log(`>>> RUNNING ${p.name.toUpperCase()}...`);
  try {
    const output = execSync(p.cmd, { encoding: 'utf8', stdio: 'inherit' });
    console.log(`\n✅ ${p.name}: PASSED\n`);
  } catch (err: any) {
    console.error(`\n❌ ${p.name}: FAILED\n`);
    allPassed = false;
    process.exit(1);
  }
}

console.log('======================================================================');
console.log('🎉 ALL 8 PHASES TESTED AND FULLY VERIFIED ON REAL DOCUMENT FIXTURES!');
console.log('======================================================================');
