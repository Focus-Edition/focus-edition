import assert from 'node:assert';
import { subscriptionService, SUBSCRIPTION_PLANS } from '../src/services/subscriptions/subscriptionService';

async function runPhase7Tests() {
  console.log('====================================================');
  console.log('PHASE 7 TESTING: Test-Mode Subscriptions & Paywall');
  console.log('====================================================\n');

  // Test 1: Plans Catalog
  console.log('1. Testing Subscription Plans Catalog...');
  assert.strictEqual(SUBSCRIPTION_PLANS.length, 2);
  const monthly = SUBSCRIPTION_PLANS.find(p => p.id === 'monthly_pro');
  const annual = SUBSCRIPTION_PLANS.find(p => p.id === 'annual_pro');
  assert.ok(monthly);
  assert.ok(annual);
  assert.strictEqual(monthly.trialDays, 7);
  assert.strictEqual(annual.trialDays, 14);
  console.log(`   ✓ Plans catalog verified: ${monthly.name} (${monthly.priceFormatted}), ${annual.name} (${annual.priceFormatted}).\n`);

  // Test 2: Free Tier Feature Gating
  console.log('2. Testing Free Tier Feature Gating...');
  subscriptionService.cancelSubscription();
  const state = subscriptionService.getState();
  assert.strictEqual(state.tier, 'free');
  assert.strictEqual(state.isActive, false);

  // Free allows under 3
  const allowCheck1 = subscriptionService.canCreateEdition(2);
  assert.strictEqual(allowCheck1.allowed, true);

  // Free blocks at 3 or more
  const blockCheck = subscriptionService.canCreateEdition(3);
  assert.strictEqual(blockCheck.allowed, false);
  assert.ok(blockCheck.reason?.includes('Free tier allows up to 3'));
  console.log('   ✓ Free tier limit (3 editions max) enforced.\n');

  // Test 3: Test-Mode Purchase Simulation
  console.log('3. Testing Sandbox / Test-Mode Purchase Flow...');
  subscriptionService.setTestMode(true);
  const purchaseRes = await subscriptionService.purchasePlan('annual_pro');

  assert.strictEqual(purchaseRes.success, true);
  assert.strictEqual(purchaseRes.state.tier, 'pro');
  assert.strictEqual(purchaseRes.state.isActive, true);
  assert.strictEqual(purchaseRes.state.planId, 'annual_pro');
  assert.ok(purchaseRes.state.receiptToken?.startsWith('rcpt_sandbox_'));
  assert.ok(purchaseRes.state.expiryDate);

  // Pro tier now permits unlimited editions
  const proCheck = subscriptionService.canCreateEdition(15);
  assert.strictEqual(proCheck.allowed, true, 'Pro tier must allow unlimited editions');
  console.log(`   ✓ Sandbox purchase succeeded: Tier upgraded to PRO, receipt: ${purchaseRes.state.receiptToken}.\n`);

  // Test 4: Restore Purchases
  console.log('4. Testing Restore Purchases Flow...');
  const restoreRes = await subscriptionService.restorePurchases();
  assert.strictEqual(restoreRes.restored, true);
  assert.strictEqual(restoreRes.state.tier, 'pro');
  console.log('   ✓ Restored active entitlements successfully.\n');

  // Test 5: Cancellation
  console.log('5. Testing Cancellation...');
  subscriptionService.cancelSubscription();
  assert.strictEqual(subscriptionService.getState().tier, 'free');
  assert.strictEqual(subscriptionService.canCreateEdition(4).allowed, false);
  console.log('   ✓ Cancellation reverted tier to free and restored limits.\n');

  console.log('====================================================');
  console.log('🎉 PHASE 7 COMPLETE: Subscriptions & Entitlements verified!');
  console.log('====================================================');
}

runPhase7Tests().catch(err => {
  console.error('Phase 7 test failed:', err);
  process.exit(1);
});
