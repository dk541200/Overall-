import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateAdminEmail,
  generate8DigitCode,
  verifyCodeAttempt,
  validatePasswordUpdate,
  calculateCatalogDiff,
  canPublish,
  type VerificationCodeRecord,
} from './admin_logic.ts';
import type { Product } from '../types/index.ts';

test('validateAdminEmail only accepts the configured studyai9211@gmail.com', () => {
  assert.equal(validateAdminEmail('studyai9211@gmail.com'), true);
  assert.equal(validateAdminEmail('STUDYAI9211@GMAIL.COM'), true);
  assert.equal(validateAdminEmail('  studyai9211@gmail.com  '), true);
  assert.equal(validateAdminEmail('other@gmail.com'), false);
  assert.equal(validateAdminEmail('admin@autoflux.com'), false);
  assert.equal(validateAdminEmail(''), false);
});

test('generate8DigitCode produces an 8-digit numeric string', () => {
  for (let i = 0; i < 20; i++) {
    const code = generate8DigitCode();
    assert.equal(typeof code, 'string');
    assert.equal(code.length, 8);
    assert.match(code, /^\d{8}$/);
    const num = parseInt(code, 10);
    assert.ok(num >= 10000000 && num <= 99999999);
  }
});

test('verifyCodeAttempt enforces expiry, attempt limits, and single-use', () => {
  const baseTime = 1000000;
  const record: VerificationCodeRecord = {
    email: 'studyai9211@gmail.com',
    code: '12345678',
    createdAt: baseTime,
    expiresAt: baseTime + 10 * 60 * 1000,
    attempts: 0,
    used: false,
  };

  // 1. Wrong code increments attempts
  const fail1 = verifyCodeAttempt(record, '00000000', baseTime + 1000);
  assert.equal(fail1.valid, false);
  assert.equal(record.attempts, 1);
  assert.equal(record.used, false);

  // 2. Format check
  const failFormat = verifyCodeAttempt(record, '1234', baseTime + 2000);
  assert.equal(failFormat.valid, false);

  // 3. Max attempts enforcement (after 4 more failures)
  verifyCodeAttempt(record, '11111111', baseTime + 3000);
  verifyCodeAttempt(record, '22222222', baseTime + 4000);
  verifyCodeAttempt(record, '33333333', baseTime + 5000);
  verifyCodeAttempt(record, '44444444', baseTime + 6000);
  assert.equal(record.attempts, 5);

  const failMax = verifyCodeAttempt(record, '12345678', baseTime + 7000);
  assert.equal(failMax.valid, false);
  assert.match(failMax.error || '', /Maximum verification attempts/);

  // 4. Expiry enforcement
  const freshRecord: VerificationCodeRecord = {
    email: 'studyai9211@gmail.com',
    code: '87654321',
    createdAt: baseTime,
    expiresAt: baseTime + 10 * 60 * 1000,
    attempts: 0,
    used: false,
  };
  const failExpired = verifyCodeAttempt(freshRecord, '87654321', baseTime + 11 * 60 * 1000);
  assert.equal(failExpired.valid, false);
  assert.match(failExpired.error || '', /expired/i);

  // 5. Success marks used and cannot be re-used
  const success = verifyCodeAttempt(freshRecord, '87654321', baseTime + 60 * 1000);
  assert.equal(success.valid, true);
  assert.equal(freshRecord.used, true);

  const reuse = verifyCodeAttempt(freshRecord, '87654321', baseTime + 65 * 1000);
  assert.equal(reuse.valid, false);
  assert.match(reuse.error || '', /already been used/i);
});

test('validatePasswordUpdate requires matching and at least 8 chars', () => {
  const short = validatePasswordUpdate('Nova', 'Nova');
  assert.equal(short.valid, false);
  assert.match(short.error || '', /at least 8 characters/);

  const mismatch = validatePasswordUpdate('NovaXMaddy2026', 'NovaXMaddy2027');
  assert.equal(mismatch.valid, false);
  assert.match(mismatch.error || '', /do not match/);

  const valid = validatePasswordUpdate('NovaXMaddy2026', 'NovaXMaddy2026');
  assert.equal(valid.valid, true);
});

test('calculateCatalogDiff correctly detects additions, updates, deletions and hero changes', () => {
  const p1: Product = {
    id: 1,
    brand: 'RoadForm',
    name: 'Alloy Wheels',
    cat: 'Exterior',
    price: 8000,
    old: 10000,
    img: 'img1',
    desc: 'desc',
    fit: 'fit',
  };
  const p2: Product = {
    id: 2,
    brand: 'GripCraft',
    name: 'Steering Cover',
    cat: 'Interior',
    price: 700,
    old: 900,
    img: 'img2',
    desc: 'desc',
    fit: 'fit',
  };

  const published = [p1, p2];
  const draftHeroOriginal = 'https://autoflux.example.com/hero1.jpg';

  // No changes
  const diffNoChange = calculateCatalogDiff(published, [p1, p2], draftHeroOriginal, draftHeroOriginal);
  assert.equal(diffNoChange.hasChanges, false);
  assert.equal(diffNoChange.summary.length, 0);

  // Modified item + new item + deleted item + hero changed
  const p1Modified: Product = { ...p1, price: 8500 };
  const p3New: Product = {
    id: 3,
    brand: 'MotoGuard',
    name: 'Bike Mount',
    cat: 'Electronics',
    price: 1500,
    old: 1800,
    img: 'img3',
    desc: 'desc',
    fit: 'fit',
  };
  const draft = [p1Modified, p3New]; // p2 deleted, p1 modified, p3 added
  const newHero = 'https://autoflux.example.com/hero2.jpg';

  const diff = calculateCatalogDiff(published, draft, draftHeroOriginal, newHero);
  assert.equal(diff.hasChanges, true);
  assert.equal(diff.added.length, 1);
  assert.equal(diff.updated.length, 1);
  assert.equal(diff.deleted.length, 1);
  assert.equal(diff.heroChanged, true);
  assert.equal(diff.summary.length, 4);
});

test('canPublish respects isLivePaused control', () => {
  const paused = canPublish(true, true);
  assert.equal(paused.allowed, false);
  assert.match(paused.reason || '', /PAUSED/);

  const noChanges = canPublish(false, false);
  assert.equal(noChanges.allowed, false);
  assert.match(noChanges.reason || '', /No draft changes detected/);

  const allowed = canPublish(false, true);
  assert.equal(allowed.allowed, true);
});
