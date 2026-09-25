import assert from 'node:assert';
import { parseBionicWord, tokenizeBionicText, formatBionicHtml } from '../src/services/accessibility/bionicReading';
import { FocusTimer } from '../src/services/accessibility/focusTimer';
import { ttsService } from '../src/services/accessibility/ttsService';
import { getFontFamilyString, getFontSizePixels, getLineHeightMultiplier } from '../src/constants/theme';

async function runPhase4Tests() {
  console.log('====================================================');
  console.log('PHASE 4 TESTING: Accessibility, TTS, and Focus Timers');
  console.log('====================================================\n');

  // Test 1: Bionic Reading
  console.log('1. Testing Bionic Reading Tokenizer and Parser...');
  const testWord = 'Disability';
  const bionicWord = parseBionicWord(testWord, 0.45, 0.55);
  assert.strictEqual(bionicWord.bold, 'Disab', 'Fixation 0.45 of 10-char word should bold 5 chars');
  assert.strictEqual(bionicWord.normal, 'ility', 'Remaining 5 chars normal');

  // Punctuation handling
  const punctWord = parseBionicWord('(Government)', 0.5, 0.5);
  assert.strictEqual(punctWord.prefix, '(');
  assert.strictEqual(punctWord.suffix, ')');
  assert.ok(punctWord.bold.length > 0);

  // Short words
  const shortWord = parseBionicWord('to', 0.5, 0.5);
  assert.strictEqual(shortWord.bold, 'to');
  assert.strictEqual(shortWord.normal, '');

  // Full sentence tokenization & HTML
  const sentence = 'Focus Edition helps ADHD brains finish overwhelming documents.';
  const bionicHtml = formatBionicHtml(sentence, 0.45, 0.55);
  assert.ok(bionicHtml.includes('<b>Foc</b><span style="opacity:0.55">us</span>'));
  assert.ok(bionicHtml.includes('<b>AD</b><span style="opacity:0.55">HD</span>') || bionicHtml.includes('<b>ADH</b>'));
  console.log('   ✓ Bionic reading parser correctly bolded fixation anchors and preserved punctuation.\n');

  // Test 2: Focus Timer
  console.log('2. Testing Focus Timer State Machine and Break Reminders...');
  const timer = new FocusTimer(25);
  assert.strictEqual(timer.getState(), 'idle');
  assert.strictEqual(timer.getRemainingSeconds(), 25 * 60);
  assert.strictEqual(timer.getFormattedTime(), '25:00');
  assert.strictEqual(timer.getProgressPercentage(), 0);

  let ticksReported = 0;
  let breakReminderCalled = false;

  timer.subscribe({
    onTick: () => ticksReported++,
    onBreakReminder: () => {
      breakReminderCalled = true;
    }
  });

  // Test tick
  timer.tick();
  assert.strictEqual(timer.getRemainingSeconds(), 25 * 60 - 1);
  assert.ok(ticksReported > 0);

  // Test interval switch
  timer.setDuration(15);
  assert.strictEqual(timer.getRemainingSeconds(), 15 * 60);
  assert.strictEqual(timer.getFormattedTime(), '15:00');

  // Test completion and break reminder
  // Simulate fast-forwarding to 1 second remaining
  (timer as any).remainingSeconds = 1;
  timer.tick();
  assert.strictEqual(timer.getState(), 'completed');
  assert.strictEqual(breakReminderCalled, true, 'Break reminder callback must fire on completion');
  console.log('   ✓ Focus timer state machine, intervals (15m, 25m), and break triggers verified.\n');

  // Test 3: Text-to-Speech Toggle Logic (Second Click Stops)
  console.log('3. Testing TTS Toggle Logic (First click speaks, second click stops)...');
  await ttsService.stop();
  assert.strictEqual(ttsService.getState(), 'idle');

  // 1st click -> Starts speaking
  const startResult = await ttsService.toggleSpeak('Testing speech synthesis for Access to Work.');
  assert.strictEqual(startResult.action, 'started');
  assert.strictEqual(ttsService.getState(), 'speaking');

  // 2nd click -> Stops speaking
  const stopResult = await ttsService.toggleSpeak('Testing speech synthesis for Access to Work.');
  assert.strictEqual(stopResult.action, 'stopped');
  assert.strictEqual(ttsService.getState(), 'idle');

  console.log('   ✓ TTS toggle logic verified: first press starts, second press immediately cancels.\n');

  // Test 4: Accessibility Typography Tokens
  console.log('4. Testing Accessibility Theme Tokens...');
  assert.ok(getFontFamilyString('opendyslexic').includes('OpenDyslexic'));
  assert.ok(getFontFamilyString('lexend').includes('Lexend'));
  assert.ok(getFontFamilyString('hyper').includes('Atkinson Hyperlegible'));
  assert.strictEqual(getFontSizePixels('small'), 14);
  assert.strictEqual(getFontSizePixels('medium'), 16);
  assert.strictEqual(getFontSizePixels('large'), 18);
  assert.strictEqual(getFontSizePixels('xl'), 21);
  assert.strictEqual(getLineHeightMultiplier('loose'), 2.0);
  console.log('   ✓ Accessibility fonts, sizes, and spacing tokens verified.\n');

  console.log('====================================================');
  console.log('🎉 PHASE 4 COMPLETE: Accessibility, TTS & Timers verified!');
  console.log('====================================================');
}

runPhase4Tests().catch(err => {
  console.error('Phase 4 test failed:', err);
  process.exit(1);
});
