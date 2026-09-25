import assert from 'node:assert';
import { syncEngine } from '../src/services/offline/syncEngine';
import { getOfflineQueue, clearOfflineQueue } from '../src/services/offline/storage';

async function runPhase6Tests() {
  console.log('====================================================');
  console.log('PHASE 6 TESTING: Mobile Navigation & Offline Progress');
  console.log('====================================================\n');

  // Test 1: Initialize Engine
  console.log('1. Testing Engine Initialization & Seed Data...');
  const editions = await syncEngine.initialize();
  assert.ok(editions.length >= 2, 'Should load at least 2 seed editions');
  const atw = syncEngine.getEditionById('ed_atw');
  assert.ok(atw, 'Should find Access to Work edition');
  assert.strictEqual(atw.totalMissions, 13);
  console.log(`   ✓ Loaded ${editions.length} editions with seeds.\n`);

  // Test 2: Mission completion toggle & progress calculation
  console.log('2. Testing Mission Toggle & Progress State Recalculation...');
  await clearOfflineQueue();
  const mission1 = atw.missions[0];
  const initialDone = mission1.done;

  // Toggle state
  const updatedM = await syncEngine.toggleMissionDone('ed_atw', mission1.id);
  assert.ok(updatedM);
  assert.strictEqual(updatedM.done, !initialDone);

  // Check offline queue item was added
  const queue = await getOfflineQueue();
  assert.ok(queue.length > 0, 'Offline action must be queued');
  assert.strictEqual(queue[0].action, 'toggle_mission');

  // Toggle back
  await syncEngine.toggleMissionDone('ed_atw', mission1.id);
  assert.strictEqual(mission1.done, initialDone);
  console.log('   ✓ Mission toggle and progress recalculation verified.\n');

  // Test 3: Mark All / Unmark All
  console.log('3. Testing Mark All & Unmark All...');
  const markedEd = await syncEngine.markAllMissions('ed_atw', true);
  assert.ok(markedEd);
  assert.strictEqual(markedEd.progress, markedEd.totalMissions);
  assert.strictEqual(markedEd.status, 'completed');

  const unmarkedEd = await syncEngine.markAllMissions('ed_atw', false);
  assert.ok(unmarkedEd);
  assert.strictEqual(unmarkedEd.progress, 0);
  assert.strictEqual(unmarkedEd.status, 'draft');
  console.log('   ✓ Mark all / unmark all verified.\n');

  // Test 4: Search & Filtering
  console.log('4. Testing Real-time Search and Status Filters...');
  const searchResults = syncEngine.filterEditions('Access to Work', 'all');
  assert.ok(searchResults.length >= 1);
  assert.ok(searchResults.some(e => e.id === 'ed_atw'));

  const emptyResults = syncEngine.filterEditions('NonExistentTermXYZ', 'all');
  assert.strictEqual(emptyResults.length, 0);

  const draftResults = syncEngine.filterEditions('', 'draft');
  assert.ok(draftResults.every(e => e.status === 'draft'));
  console.log('   ✓ Instant search & status filtering verified.\n');

  // Test 5: Duplicate and Delete
  console.log('5. Testing Edition Duplication and Deletion...');
  const duplicated = await syncEngine.duplicateEdition('ed_atw');
  assert.ok(duplicated);
  assert.ok(duplicated.id.includes('copy'));
  assert.strictEqual(duplicated.progress, 0);
  assert.strictEqual(duplicated.missions[0].done, false);

  const deleted = await syncEngine.deleteEdition(duplicated.id);
  assert.strictEqual(deleted, true);
  assert.strictEqual(syncEngine.getEditionById(duplicated.id), undefined);
  console.log('   ✓ Duplication and deletion verified.\n');

  console.log('====================================================');
  console.log('🎉 PHASE 6 COMPLETE: Navigation & Offline Progress verified!');
  console.log('====================================================');
}

runPhase6Tests().catch(err => {
  console.error('Phase 6 test failed:', err);
  process.exit(1);
});
