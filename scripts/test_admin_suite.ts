import assert from 'node:assert/strict';

const BASE_URL = 'http://127.0.0.1:3000';

async function runTestSuite() {
  console.log('🧪 Starting AUTOFLUX Admin Panel Full Verification Suite...\n');

  // 1. Test Route Availability: /, /admin, /admin.html
  console.log('1️⃣ Testing Route Accessibility...');
  const resHome = await fetch(`${BASE_URL}/`);
  assert.equal(resHome.status, 200, 'Storefront / must return 200');
  const homeText = await resHome.text();
  assert.ok(homeText.includes('AUTOFLUX'), 'Home must contain AUTOFLUX title');

  const resAdmin = await fetch(`${BASE_URL}/admin`);
  assert.equal(resAdmin.status, 200, '/admin must return 200');
  const adminText = await resAdmin.text();
  assert.ok(adminText.includes('admin-root') || adminText.includes('AUTOFLUX Admin'), '/admin must serve admin HTML');

  const resAdminHtml = await fetch(`${BASE_URL}/admin.html`);
  assert.equal(resAdminHtml.status, 200, '/admin.html must return 200');
  console.log('  ✅ Route test passed: /, /admin, and /admin.html all return 200.');

  // 2. Test Admin Login with Incorrect Credentials
  console.log('\n2️⃣ Testing Login with Incorrect Credentials...');
  const resBadLogin = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'studyai9211@gmail.com', password: 'WrongPassword123' }),
  });
  assert.equal(resBadLogin.status, 401, 'Bad credentials must be rejected with 401');
  const badLoginData = await resBadLogin.json();
  assert.equal(badLoginData.success, false);

  const resWrongEmail = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'stranger@gmail.com', password: 'NovaXMaddy' }),
  });
  assert.equal(resWrongEmail.status, 401, 'Unauthorized email must be rejected with 401');
  console.log('  ✅ Login security test passed: Unauthorized credentials rejected.');

  // 3. Test Admin Login with Valid Credentials (studyai9211@gmail.com / NovaXMaddy)
  console.log('\n3️⃣ Testing Login with Valid Credentials (studyai9211@gmail.com / NovaXMaddy)...');
  const resGoodLogin = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'studyai9211@gmail.com', password: 'NovaXMaddy' }),
  });
  assert.equal(resGoodLogin.status, 200, 'Valid credentials must return 200');
  const loginData = await resGoodLogin.json();
  assert.equal(loginData.success, true);
  assert.ok(loginData.token, 'Token must be issued');
  const adminToken = loginData.token;
  console.log('  ✅ Admin authentication passed: Session token issued.');

  // 4. Test Forgot Password — 8-digit code generation, validation, expiry, and reset
  console.log('\n4️⃣ Testing Forgot Password & 8-Digit Verification Flow...');
  // 4a. Request with invalid email
  const resBadForgot = await fetch(`${BASE_URL}/api/admin/forgot-password/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'unauthorized@gmail.com' }),
  });
  assert.equal(resBadForgot.status, 403, 'Unauthorized email reset request must be rejected');

  // 4b. Request with authorized admin email
  const resForgot = await fetch(`${BASE_URL}/api/admin/forgot-password/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'studyai9211@gmail.com' }),
  });
  assert.equal(resForgot.status, 200, 'Code request must return 200');
  const forgotData = await resForgot.json();
  assert.equal(forgotData.success, true);
  assert.ok(forgotData.missingConfig.length > 0, 'Must explain missing email env vars when SMTP is unconfigured');
  assert.ok(forgotData.devCodeHint, 'Dev code hint must be present in dev mode');
  const eightDigitCode = forgotData.devCodeHint;
  assert.equal(eightDigitCode.length, 8, 'Code must be exactly 8 digits');
  console.log(`  ✅ 8-Digit verification code generated: ${eightDigitCode}`);

  // 4c. Verify & update password with mismatching confirmation
  const resMismatch = await fetch(`${BASE_URL}/api/admin/forgot-password/verify-and-reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'studyai9211@gmail.com',
      code: eightDigitCode,
      newPassword: 'NovaXMaddy2026',
      confirmPassword: 'DifferentPassword2026',
    }),
  });
  assert.equal(resMismatch.status, 400, 'Password mismatch must be rejected');

  // 4d. Verify with wrong 8-digit code
  const resWrongCode = await fetch(`${BASE_URL}/api/admin/forgot-password/verify-and-reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'studyai9211@gmail.com',
      code: '00000000',
      newPassword: 'NovaXMaddy2026',
      confirmPassword: 'NovaXMaddy2026',
    }),
  });
  assert.equal(resWrongCode.status, 400, 'Wrong code must be rejected');

  // 4e. Verify & reset with valid matching password
  const resResetSuccess = await fetch(`${BASE_URL}/api/admin/forgot-password/verify-and-reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'studyai9211@gmail.com',
      code: eightDigitCode,
      newPassword: 'NovaXMaddy2026',
      confirmPassword: 'NovaXMaddy2026',
    }),
  });
  assert.equal(resResetSuccess.status, 200, 'Password reset must succeed');
  console.log('  ✅ Password update succeeded with 8-digit code.');

  // 4f. Test login with old password fails
  const resOldLogin = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'studyai9211@gmail.com', password: 'NovaXMaddy' }),
  });
  assert.equal(resOldLogin.status, 401, 'Old password must be invalidated');

  // 4g. Test login with new password succeeds
  const resNewLogin = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'studyai9211@gmail.com', password: 'NovaXMaddy2026' }),
  });
  assert.equal(resNewLogin.status, 200, 'Login with new password must succeed');
  const newLoginData = await resNewLogin.json();
  const activeToken = newLoginData.token;
  console.log('  ✅ Login with new password succeeded.');

  // Reset back to NovaXMaddy for seamless continued operation
  const resetBackCodeRes = await fetch(`${BASE_URL}/api/admin/forgot-password/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'studyai9211@gmail.com' }),
  });
  const resetBackCodeData = await resetBackCodeRes.json();
  await fetch(`${BASE_URL}/api/admin/forgot-password/verify-and-reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'studyai9211@gmail.com',
      code: resetBackCodeData.devCodeHint,
      newPassword: 'NovaXMaddy',
      confirmPassword: 'NovaXMaddy',
    }),
  });
  const reauthRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'studyai9211@gmail.com', password: 'NovaXMaddy' }),
  });
  const currentToken = (await reauthRes.json()).token;

  // 5. Test "Request for Admin Panel"
  console.log('\n5️⃣ Testing "Request for Admin Panel" Flow...');
  const resReqAccess = await fetch(`${BASE_URL}/api/admin/request-access`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Priya Joshi',
      email: 'priya@autoflux.com',
      organization: 'Workshop Quality Audit',
      reason: 'Need access to inspect diagnostic logs and manage workshop listings.',
    }),
  });
  assert.equal(resReqAccess.status, 201, 'Access request must be registered');
  const reqData = await resReqAccess.json();
  assert.ok(reqData.requestId.startsWith('REQ-'), 'Must return valid request ID');

  const resListReqs = await fetch(`${BASE_URL}/api/admin/access-requests`, {
    headers: { Authorization: `Bearer ${currentToken}` },
  });
  const listReqsData = await resListReqs.json();
  assert.ok(listReqsData.requests.some((r: any) => r.id === reqData.requestId), 'Admin can view access requests');
  console.log('  ✅ "Request for Admin Panel" submitted and visible in owner dashboard.');

  // 6. Test Draft System & Pause Live / Publish Changes
  console.log('\n6️⃣ Testing Draft System, Pause Live & Publish Changes...');
  // 6a. Add new item to draft
  const testListingName = `Performance Air Filter Test ${Date.now()}`;
  const resAddItem = await fetch(`${BASE_URL}/api/admin/catalog`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${currentToken}`,
    },
    body: JSON.stringify({
      name: testListingName,
      brand: 'AeroFlow',
      cat: 'Interior',
      price: 3499,
      old: 4299,
      img: 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc',
      desc: 'High-flow washable air filter upgrade.',
      fit: 'Universal 3-inch intake piping.',
    }),
  });
  assert.equal(resAddItem.status, 201, 'Item must be created in draft');
  const createdItem = (await resAddItem.json()).product;

  // 6b. Verify that public storefront DOES NOT have the draft item yet
  const resPublicCatalog1 = await fetch(`${BASE_URL}/api/catalog`);
  const publicData1 = await resPublicCatalog1.json();
  assert.equal(
    publicData1.products.some((p: any) => p.name === testListingName),
    false,
    'Draft item must NOT appear on public website before publication'
  );
  console.log('  ✅ Draft isolation verified: Unsaved/unpublished draft not visible on public store.');

  // 6c. Test Pause Live functionality
  console.log('  Testing Pause Live publishing...');
  const resPause = await fetch(`${BASE_URL}/api/admin/content/toggle-pause`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${currentToken}` },
  });
  const pauseData = await resPause.json();
  assert.equal(pauseData.isLivePaused, true, 'Live publishing must be paused');

  // 6d. Attempt to publish while paused (must be blocked)
  const resPublishBlocked = await fetch(`${BASE_URL}/api/admin/content/publish`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${currentToken}` },
  });
  assert.equal(resPublishBlocked.status, 400, 'Publishing while paused must be rejected');
  console.log('  ✅ Pause Live verified: Publishing blocked when live publishing is paused.');

  // 6e. Resume live publishing
  const resResume = await fetch(`${BASE_URL}/api/admin/content/toggle-pause`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${currentToken}` },
  });
  const resumeData = await resResume.json();
  assert.equal(resumeData.isLivePaused, false, 'Live publishing must be resumed');

  // 6f. Publish changes to live website
  const resPublish = await fetch(`${BASE_URL}/api/admin/content/publish`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${currentToken}` },
  });
  assert.equal(resPublish.status, 200, 'Publishing must succeed');
  const publishData = await resPublish.json();
  assert.equal(publishData.success, true);

  // 6g. Verify public customer storefront immediately sees published changes
  const resPublicCatalog2 = await fetch(`${BASE_URL}/api/catalog`);
  const publicData2 = await resPublicCatalog2.json();
  assert.equal(
    publicData2.products.some((p: any) => p.name === testListingName),
    true,
    'Published item must immediately appear on public customer website'
  );
  console.log('  ✅ Publish Changes verified: Item immediately live on public website.');

  // 6h. Clean up test listing from draft and publish cleanup
  await fetch(`${BASE_URL}/api/admin/catalog/${createdItem.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${currentToken}` },
  });
  await fetch(`${BASE_URL}/api/admin/content/publish`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${currentToken}` },
  });

  console.log('\n🎉 ALL INTEGRATION SUITE TESTS PASSED 100% SUCCESSFULLY!\n');
}

runTestSuite().catch((err) => {
  console.error('\n❌ Integration Test Suite Failed:', err);
  process.exit(1);
});
