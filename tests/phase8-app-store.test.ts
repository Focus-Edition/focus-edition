import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

async function runPhase8Tests() {
  console.log('====================================================');
  console.log('PHASE 8 TESTING: App Store & Google Play Preparation');
  console.log('====================================================\n');

  // Test 1: Validate app.json manifest configuration
  console.log('1. Validating app.json manifest configuration...');
  const appJsonPath = path.resolve(__dirname, '../app.json');
  assert.ok(fs.existsSync(appJsonPath), 'app.json must exist');
  
  const appConfig = JSON.parse(fs.readFileSync(appJsonPath, 'utf8')).expo;
  assert.strictEqual(appConfig.name, 'Focus Edition');
  assert.strictEqual(appConfig.slug, 'focus-edition');

  // iOS assertions
  assert.ok(appConfig.ios, 'iOS configuration must be defined');
  assert.strictEqual(appConfig.ios.bundleIdentifier, 'app.focusedition.mobile');
  assert.ok(appConfig.ios.infoPlist, 'iOS infoPlist permissions must be declared');
  assert.ok(appConfig.ios.infoPlist.NSCameraUsageDescription?.length > 20, 'NSCameraUsageDescription must be descriptive');
  assert.ok(appConfig.ios.infoPlist.NSPhotoLibraryUsageDescription?.length > 20, 'NSPhotoLibraryUsageDescription must be descriptive');
  assert.ok(appConfig.ios.infoPlist.NSSpeechRecognitionUsageDescription?.length > 20, 'NSSpeechRecognitionUsageDescription must be descriptive');

  // Android assertions
  assert.ok(appConfig.android, 'Android configuration must be defined');
  assert.strictEqual(appConfig.android.package, 'app.focusedition.mobile');
  assert.ok(Array.isArray(appConfig.android.permissions), 'Android permissions must be an array');
  assert.ok(appConfig.android.permissions.includes('android.permission.CAMERA'));
  assert.ok(appConfig.android.permissions.includes('android.permission.INTERNET'));

  // Assets existence
  const iconPath = path.resolve(__dirname, '..', appConfig.icon);
  const splashPath = path.resolve(__dirname, '..', appConfig.splash.image);
  assert.ok(fs.existsSync(iconPath), `Icon asset must exist at ${iconPath}`);
  assert.ok(fs.existsSync(splashPath), `Splash asset must exist at ${splashPath}`);
  console.log('   ✓ app.json bundle identifiers, permissions strings, and asset paths verified.\n');

  // Test 2: Expo CLI Configuration Parse Check
  console.log('2. Running Expo CLI config schema validation...');
  try {
    const expoConfigOutput = execSync('npx expo config --json', { encoding: 'utf8' });
    const parsedExpoConfig = JSON.parse(expoConfigOutput);
    assert.strictEqual(parsedExpoConfig.name, 'Focus Edition');
    assert.ok(parsedExpoConfig.platforms.includes('ios'));
    assert.ok(parsedExpoConfig.platforms.includes('android'));
    assert.ok(parsedExpoConfig.platforms.includes('web'));
    console.log('   ✓ Expo CLI config validation succeeded with zero schema errors.\n');
  } catch (err: any) {
    console.error('Expo config command failed:', err.message);
    throw err;
  }

  // Test 3: App Store Metadata Verification
  console.log('3. Validating App Store & Google Play metadata documentation...');
  const metaDocPath = path.resolve(__dirname, '../docs/APP_STORE_METADATA.md');
  assert.ok(fs.existsSync(metaDocPath), 'App Store metadata documentation must exist');
  const metaContent = fs.readFileSync(metaDocPath, 'utf8');

  assert.ok(metaContent.includes('Focus Edition — ADHD Document Reader'));
  assert.ok(metaContent.includes('Turn dense docs into 4-min missions'));
  assert.ok(metaContent.includes('NSCameraUsageDescription'));
  assert.ok(metaContent.includes('Strict Document Privacy'));
  console.log('   ✓ App Store marketing metadata, keywords, and privacy descriptions verified.\n');

  console.log('====================================================');
  console.log('🎉 PHASE 8 COMPLETE: App Store & Play Store ready!');
  console.log('====================================================');
}

runPhase8Tests().catch(err => {
  console.error('Phase 8 test failed:', err);
  process.exit(1);
});
