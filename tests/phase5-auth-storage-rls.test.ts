import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { signInDemoUser, signInWithEmail, signOut, getCurrentUser, setAllowAiProcessing } from '../src/services/supabase/authService';
import { checkAiPrivacyPermission, isAiProcessingAllowed, AiPrivacyViolationError } from '../src/services/supabase/privacyGuard';
import { uploadPrivateDocument } from '../src/services/supabase/storageService';
import { loadOfflineEditions, saveOfflineEditions, enqueueOfflineAction, getOfflineQueue, clearOfflineQueue } from '../src/services/offline/storage';

async function runPhase5Tests() {
  console.log('====================================================');
  console.log('PHASE 5 TESTING: Auth, Private Storage, Persistence, RLS');
  console.log('====================================================\n');

  // Test 1: Demo Auth & Session
  console.log('1. Testing User Authentication & Demo Account...');
  const demoUser = await signInDemoUser();
  assert.strictEqual(demoUser.email, 'alex@focus-edition.app');
  assert.strictEqual(demoUser.name, 'Alex Avery');
  assert.strictEqual(demoUser.allowAiProcessing, false, 'AI processing MUST default to false');
  assert.strictEqual(getCurrentUser()?.id, demoUser.id);

  // Email sign in
  const customUser = await signInWithEmail('test.adhd@example.com');
  assert.strictEqual(customUser.email, 'test.adhd@example.com');
  assert.strictEqual(customUser.allowAiProcessing, false);
  console.log('   ✓ Authentication verified: Demo user and email login.\n');

  // Test 2: AI Privacy Guard
  console.log('2. Testing Strict AI Privacy Guard...');
  // Default: false -> must throw AiPrivacyViolationError
  assert.throws(
    () => checkAiPrivacyPermission(customUser),
    AiPrivacyViolationError,
    'Should throw AiPrivacyViolationError when allowAiProcessing is false'
  );
  assert.strictEqual(isAiProcessingAllowed(customUser), false);

  // Enable opt-in
  setAllowAiProcessing(true);
  const updatedUser = getCurrentUser();
  assert.doesNotThrow(() => checkAiPrivacyPermission(updatedUser));
  assert.strictEqual(isAiProcessingAllowed(updatedUser), true);

  // Re-disable
  setAllowAiProcessing(false);
  assert.throws(() => checkAiPrivacyPermission(getCurrentUser()));
  console.log('   ✓ AI Privacy Guard verified: strictly blocks external transmission without consent.\n');

  // Test 3: Private Storage Isolation
  console.log('3. Testing Private Document Storage Isolation...');
  await signInDemoUser();
  const testBuffer = Buffer.from('Sensitive medical certificate content for Access to Work.');
  const uploadRes = await uploadPrivateDocument('medical-cert.pdf', testBuffer, 'application/pdf');

  assert.ok(uploadRes.path.includes(demoUser.id), `Storage path must be isolated with user ID: ${uploadRes.path}`);
  assert.ok(uploadRes.path.includes('medical-cert.pdf'));
  assert.strictEqual(uploadRes.fileSize, testBuffer.length);

  // Unauthenticated upload must fail
  await signOut();
  await assert.rejects(
    async () => await uploadPrivateDocument('doc.pdf', testBuffer, 'application/pdf'),
    /User must be authenticated/,
    'Unauthenticated upload must be rejected'
  );
  console.log('   ✓ Storage isolation verified: user-partitioned paths and auth requirement.\n');

  // Test 4: Offline Persistence and Action Queue
  console.log('4. Testing Offline Persistence and Queue Engine...');
  const sampleEdition = {
    id: 'ed_offline_test',
    title: 'Offline Edition',
    description: 'Testing offline storage',
    sourceFileName: 'test.txt',
    sourceType: 'txt',
    status: 'draft' as const,
    progress: 0,
    totalMissions: 1,
    totalTimeEstimateMinutes: 3,
    createdAt: '2026-09-25',
    updatedAt: '2026-09-25',
    tags: ['offline'],
    coverEmoji: '💾',
    themeColor: 'bg-[#6D4AFF]',
    missions: []
  };

  await saveOfflineEditions([sampleEdition]);
  const retrieved = await loadOfflineEditions();
  assert.strictEqual(retrieved.length, 1);
  assert.strictEqual(retrieved[0].id, 'ed_offline_test');

  // Queue actions
  await clearOfflineQueue();
  await enqueueOfflineAction('toggle_mission', { editionId: 'ed_offline_test', missionId: 'm1' });
  const queue = await getOfflineQueue();
  assert.strictEqual(queue.length, 1);
  assert.strictEqual(queue[0].action, 'toggle_mission');
  await clearOfflineQueue();
  assert.strictEqual((await getOfflineQueue()).length, 0);
  console.log('   ✓ Offline storage and action queue engine verified.\n');

  // Test 5: Row-Level Security Schema Verification
  console.log('5. Validating Supabase Schema & Row-Level Security (RLS)...');
  const sqlPath = path.resolve(__dirname, '../src/supabase/schema.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');

  // Ensure RLS enabled on all core tables
  const tables = ['profiles', 'editions', 'missions', 'quiz_questions', 'flashcards', 'user_progress'];
  tables.forEach(table => {
    assert.ok(
      sqlContent.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`),
      `RLS must be enabled on table public.${table}`
    );
  });

  // Ensure storage isolation policy
  assert.ok(sqlContent.includes('auth.uid()::text = (storage.foldername(name))[1]'), 'Storage RLS must enforce folder isolation');
  console.log('   ✓ Schema verified: RLS enabled on all tables and storage bucket.\n');

  console.log('====================================================');
  console.log('🎉 PHASE 5 COMPLETE: Auth, Storage, Persistence & RLS verified!');
  console.log('====================================================');
}

runPhase5Tests().catch(err => {
  console.error('Phase 5 test failed:', err);
  process.exit(1);
});
