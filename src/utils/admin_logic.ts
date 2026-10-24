import crypto from 'node:crypto';
import type { Product } from '../types/index.ts';

export const CONFIGURED_ADMIN_EMAIL = 'studyai9211@gmail.com';
export const CODE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
export const MAX_VERIFY_ATTEMPTS = 5;

export interface VerificationCodeRecord {
  email: string;
  code: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
  used: boolean;
}

export interface CatalogDiff {
  hasChanges: boolean;
  added: Product[];
  updated: Array<{ before: Product; after: Product }>;
  deleted: Product[];
  heroChanged: boolean;
  publishedHero: string;
  draftHero: string;
  summary: string[];
}

/**
 * Validates if the supplied email is the authorized admin email.
 */
export function validateAdminEmail(email: string): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === CONFIGURED_ADMIN_EMAIL.toLowerCase();
}

/**
 * Generates a cryptographically secure 8-digit verification code string.
 */
export function generate8DigitCode(): string {
  // Generates integer between 10,000,000 and 99,999,999 inclusive
  const min = 10000000;
  const max = 99999999;
  const num = crypto.randomInt(min, max + 1);
  return num.toString();
}

/**
 * Validates verification code attempts, expiry, and single-use status.
 */
export function verifyCodeAttempt(
  record: VerificationCodeRecord | undefined,
  inputCode: string,
  now: number = Date.now()
): { valid: boolean; error?: string; remainingAttempts?: number } {
  if (!record) {
    return {
      valid: false,
      error: 'No active verification code found for this admin email. Please request a new code.',
    };
  }

  if (record.used) {
    return {
      valid: false,
      error: 'This verification code has already been used. Please request a new code.',
    };
  }

  if (now > record.expiresAt) {
    return {
      valid: false,
      error: 'Verification code has expired (10-minute limit exceeded). Please request a new code.',
    };
  }

  if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
    return {
      valid: false,
      error: 'Maximum verification attempts (5) exceeded. For security, request a new code.',
      remainingAttempts: 0,
    };
  }

  const cleanInput = String(inputCode || '').trim();
  if (cleanInput.length !== 8 || !/^\d{8}$/.test(cleanInput)) {
    return {
      valid: false,
      error: 'Please enter a valid 8-digit numerical verification code.',
      remainingAttempts: MAX_VERIFY_ATTEMPTS - record.attempts,
    };
  }

  if (record.code !== cleanInput) {
    record.attempts += 1;
    const remaining = MAX_VERIFY_ATTEMPTS - record.attempts;
    return {
      valid: false,
      error: remaining > 0
        ? `Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
        : 'Maximum verification attempts (5) reached. Code invalidated.',
      remainingAttempts: Math.max(0, remaining),
    };
  }

  // Valid! Mark code as used immediately so it cannot be re-used.
  record.used = true;
  return { valid: true };
}

/**
 * Validates new password and confirmation password.
 */
export function validatePasswordUpdate(
  newPass: string,
  confirmPass: string
): { valid: boolean; error?: string } {
  if (!newPass || typeof newPass !== 'string') {
    return { valid: false, error: 'New password is required.' };
  }

  if (newPass.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long.' };
  }

  if (newPass !== confirmPass) {
    return { valid: false, error: 'New password and confirm password do not match.' };
  }

  return { valid: true };
}

/**
 * Compares published vs draft catalog to calculate pending changes diff.
 */
export function calculateCatalogDiff(
  publishedProducts: Product[],
  draftProducts: Product[],
  publishedHero: string,
  draftHero: string
): CatalogDiff {
  const publishedMap = new Map<number, Product>();
  publishedProducts.forEach((p) => publishedMap.set(p.id, p));

  const draftMap = new Map<number, Product>();
  draftProducts.forEach((p) => draftMap.set(p.id, p));

  const added: Product[] = [];
  const updated: Array<{ before: Product; after: Product }> = [];
  const deleted: Product[] = [];

  // Check additions and updates
  draftProducts.forEach((draftItem) => {
    const pubItem = publishedMap.get(draftItem.id);
    if (!pubItem) {
      added.push(draftItem);
    } else {
      // Check if any fields changed
      const changed =
        pubItem.name !== draftItem.name ||
        pubItem.brand !== draftItem.brand ||
        pubItem.price !== draftItem.price ||
        pubItem.old !== draftItem.old ||
        pubItem.cat !== draftItem.cat ||
        pubItem.tag !== draftItem.tag ||
        pubItem.img !== draftItem.img ||
        pubItem.desc !== draftItem.desc ||
        pubItem.fit !== draftItem.fit ||
        pubItem.listingType !== draftItem.listingType ||
        pubItem.year !== draftItem.year ||
        pubItem.condition !== draftItem.condition;

      if (changed) {
        updated.push({ before: pubItem, after: draftItem });
      }
    }
  });

  // Check deletions
  publishedProducts.forEach((pubItem) => {
    if (!draftMap.has(pubItem.id)) {
      deleted.push(pubItem);
    }
  });

  const heroChanged = publishedHero.trim() !== draftHero.trim();
  const hasChanges = added.length > 0 || updated.length > 0 || deleted.length > 0 || heroChanged;

  const summary: string[] = [];
  if (heroChanged) summary.push('Homepage Hero Banner updated');
  if (added.length > 0) summary.push(`${added.length} new listing(s) added`);
  if (updated.length > 0) summary.push(`${updated.length} listing(s) modified`);
  if (deleted.length > 0) summary.push(`${deleted.length} listing(s) deleted`);

  return {
    hasChanges,
    added,
    updated,
    deleted,
    heroChanged,
    publishedHero,
    draftHero,
    summary,
  };
}

/**
 * Checks if publishing can proceed based on pause state and presence of changes.
 */
export function canPublish(
  isLivePaused: boolean,
  hasChanges: boolean
): { allowed: boolean; reason?: string } {
  if (isLivePaused) {
    return {
      allowed: false,
      reason: 'Live publishing is currently PAUSED. Resume live publishing before publishing new draft changes.',
    };
  }

  if (!hasChanges) {
    return {
      allowed: false,
      reason: 'No draft changes detected. The live website is already synchronized with drafts.',
    };
  }

  return { allowed: true };
}
