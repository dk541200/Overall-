import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import nodemailer from 'nodemailer';
import {
  CONFIGURED_ADMIN_EMAIL,
  CODE_EXPIRY_MS,
  MAX_VERIFY_ATTEMPTS,
  validateAdminEmail,
  generate8DigitCode,
  verifyCodeAttempt,
  validatePasswordUpdate,
  calculateCatalogDiff,
  canPublish,
  type VerificationCodeRecord,
} from './src/utils/admin_logic.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

import type { Product } from './src/types/index.ts';

// ============================================================================
// DATA STORE & PERSISTENCE (Requirement 4 & 5)
// ============================================================================

export interface PreOrder {
  id: string;
  productId?: number;
  product: string;
  price: number;
  vehicle: string;
  year?: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  notes?: string;
  status: string;
  createdAt?: number;
}

export interface MechanicChat {
  problem: string;
  title: string;
  messages: Array<{
    from: 'user' | 'mechanic';
    text: string;
    timestamp?: string;
  }>;
}

export interface AccessRequest {
  id: string;
  name: string;
  email: string;
  organization?: string;
  reason: string;
  createdAt: number;
  status: 'PENDING_OWNER_APPROVAL' | 'APPROVED' | 'REJECTED';
}

const DATA_DIR = path.resolve(__dirname, 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Password hashing helper using PBKDF2 with secure random salt fallback
const ADMIN_SALT = process.env.ADMIN_SALT || crypto.randomBytes(32).toString('hex');
function hashPassword(password: string, salt: string = ADMIN_SALT): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

// Initial Seed Products
const SEED_PRODUCTS: Product[] = [
  {
    id: 1,
    brand: 'RoadForm',
    name: 'Sport Alloy Wheel — 17 inch',
    cat: 'Exterior',
    price: 8990,
    old: 10990,
    tag: 'Popular',
    img: 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&w=700&q=85',
    desc: 'Sport-inspired wheel style. Confirm wheel size, PCD, offset and vehicle compatibility before ordering.',
    fit: 'Requires exact wheel specifications and vehicle fitment check.',
    listingType: 'part',
  },
  {
    id: 2,
    brand: 'GripCraft',
    name: 'Premium Steering Cover',
    cat: 'Interior',
    price: 799,
    old: 1099,
    tag: 'Bestseller',
    img: 'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?auto=format&fit=crop&w=700&q=85',
    desc: 'Comfort-focused steering cover in a sporty finish. Check steering wheel diameter and airbag compatibility.',
    fit: 'Measure steering wheel and ensure no interference with controls or airbags.',
    listingType: 'part',
  },
  {
    id: 3,
    brand: 'CabinPro',
    name: 'Universal Seat Cushion Set',
    cat: 'Interior',
    price: 2499,
    old: 3199,
    tag: 'New',
    img: 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&w=700&q=85',
    desc: 'Seat comfort upgrade with a clean, premium cabin look. Actual fit varies by seat shape and airbags.',
    fit: 'Check seat dimensions, side airbags and attachment points.',
    listingType: 'part',
  },
  {
    id: 4,
    brand: 'ClearDrive',
    name: 'Car Care & Cleaning Kit',
    cat: 'Cleaning',
    price: 1199,
    old: 1599,
    tag: 'Value pack',
    img: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=700&q=85',
    desc: 'A sample car-care bundle for everyday cleaning and detailing. Confirm exact included products.',
    fit: 'Universal care kit; verify surfaces and instructions for each included product.',
    listingType: 'part',
  },
  {
    id: 5,
    brand: 'NightShift',
    name: 'LED Auxiliary Light Kit',
    cat: 'Lighting',
    price: 1899,
    old: 2399,
    tag: 'Popular',
    img: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=700&q=85',
    desc: 'Auxiliary illumination concept. Ensure compliance with regional road regulations and proper wiring.',
    fit: 'Requires vehicle electrical check and mounting bracket assessment.',
    listingType: 'part',
  },
  {
    id: 6,
    brand: 'MotoGuard',
    name: 'Bike Phone Mount & Charger',
    cat: 'Electronics',
    price: 1499,
    old: 1899,
    tag: 'Bike pick',
    img: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=700&q=85',
    desc: 'Handlebar mount with vibration damping and USB fast-charge port. Compatible with 22-32mm handlebars.',
    fit: 'Handlebars 22mm–32mm diameter; 12V battery connection required.',
    listingType: 'part',
  },
  {
    id: 7,
    brand: 'Royal Enfield',
    name: 'Classic 350 Stealth Black (2022)',
    cat: 'Used Vehicles',
    price: 165000,
    old: 185000,
    tag: 'Verified Bike',
    img: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=700&q=85',
    desc: 'Single owner, 14,200 km driven, complete service history at authorized workshop, zero insurance claims.',
    fit: 'Certified 40-point inspection completed. All registration documents verified.',
    listingType: 'used',
    year: '2022',
    condition: 'Excellent (14,200 km)',
  },
];

const DEFAULT_HERO_IMAGE = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1900&q=90';

interface StoreState {
  adminEmail: string;
  adminPasswordHash: string;
  publishedProducts: Product[];
  publishedHero: string;
  draftProducts: Product[];
  draftHero: string;
  isLivePaused: boolean;
  lastPublishedAt: number;
  lastDraftSavedAt: number;
  orders: PreOrder[];
  chats: MechanicChat[];
  accessRequests: AccessRequest[];
}

// In-memory state with persistence
let store: StoreState = {
  adminEmail: CONFIGURED_ADMIN_EMAIL,
  adminPasswordHash: hashPassword('NovaXMaddy'),
  publishedProducts: [...SEED_PRODUCTS],
  publishedHero: DEFAULT_HERO_IMAGE,
  draftProducts: [...SEED_PRODUCTS],
  draftHero: DEFAULT_HERO_IMAGE,
  isLivePaused: false,
  lastPublishedAt: Date.now(),
  lastDraftSavedAt: Date.now(),
  orders: [
    {
      id: 'AF-882194',
      productId: 1,
      product: 'Sport Alloy Wheel — 17 inch',
      price: 8990,
      vehicle: 'Car · Hyundai Creta',
      year: '2023',
      date: '2026-10-28',
      time: 'Morning (10 AM - 1 PM)',
      name: 'Sanjay Rawat',
      phone: '+91 98112 44321',
      notes: 'Gloss black finish. Need on-site fitment.',
      status: 'Confirmed',
      createdAt: Date.now() - 86400000 * 2,
    },
    {
      id: 'AF-419022',
      productId: 6,
      product: 'Bike Phone Mount & Charger',
      price: 1499,
      vehicle: 'Bike · KTM Duke 250',
      year: '2022',
      date: '2026-10-30',
      time: 'Evening (4 PM - 7 PM)',
      name: 'Rohan Mehra',
      phone: '+91 97234 11098',
      notes: 'Handlebar clamp fitting required.',
      status: 'Request saved on this device',
      createdAt: Date.now() - 86400000 * 1,
    },
  ],
  chats: [
    {
      problem: 'starting',
      title: 'Vehicle Starting / Battery Problem',
      messages: [
        {
          from: 'user',
          text: 'Car clicks repeatedly when turning key in the morning, dashboard lights flicker.',
          timestamp: '10:15 AM',
        },
        {
          from: 'mechanic',
          text: 'Hi! That classic rapid clicking with flickering dash lights indicates low battery voltage or corroded terminals rather than a starter motor failure. Have you tested terminal tightness?',
          timestamp: '10:18 AM',
        },
      ],
    },
    {
      problem: 'brakes',
      title: 'Brake Noise & Pedal Feel',
      messages: [
        {
          from: 'user',
          text: 'High-pitched squeal when braking at low speed in city traffic.',
          timestamp: 'Yesterday',
        },
        {
          from: 'mechanic',
          text: 'Hi! Low speed squeal is often caused by brake pad wear indicator tabs or glazed friction material. Book an inspection before rotor scoring occurs.',
          timestamp: 'Yesterday',
        },
      ],
    },
  ],
  accessRequests: [],
};

// Load saved store from disk if present
function loadStore() {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const data = fs.readFileSync(STORE_PATH, 'utf-8');
      const loaded = JSON.parse(data);
      store = {
        ...store,
        ...loaded,
        // Enforce configured email identity
        adminEmail: CONFIGURED_ADMIN_EMAIL,
      };
      console.log('✅ Loaded persistent AUTOFLUX store from disk.');
    } else {
      saveStore();
    }
  } catch (err) {
    console.error('⚠️ Could not read store file, using in-memory defaults:', err);
  }
}

function saveStore() {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('⚠️ Failed to save store file:', err);
  }
}

loadStore();

// Reset verification codes store
const activeResetCodes = new Map<string, VerificationCodeRecord>();

// ============================================================================
// SERVER-SIDE SESSIONS & AUTHENTICATION (Requirement 1 & 5)
// ============================================================================

interface SessionData {
  adminId: string;
  email: string;
  role: string;
  createdAt: number;
  expiresAt: number;
}
const activeSessions = new Map<string, SessionData>();
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

function generateSecureToken(email: string): string {
  const randomPart = crypto.randomBytes(24).toString('hex');
  const timestamp = Date.now();
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(`${email}:${randomPart}:${timestamp}`)
    .digest('hex');
  return `afx_${randomPart}_${signature.slice(0, 16)}`;
}

function authenticateAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Access denied: Valid administrative server authorization token required.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);

  if (!session) {
    res.status(401).json({
      success: false,
      error: 'INVALID_SESSION',
      message: 'Administrative session has expired or is invalid. Please log in again.',
    });
    return;
  }

  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    res.status(401).json({
      success: false,
      error: 'SESSION_EXPIRED',
      message: 'Administrative session timed out. Please authenticate again.',
    });
    return;
  }

  (req as any).adminSession = session;
  next();
}

// Email provider configuration checker
function checkEmailServiceConfig(): { isConfigured: boolean; missingVars: string[]; provider: string } {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const resendKey = process.env.RESEND_API_KEY;

  if (resendKey) {
    return { isConfigured: true, missingVars: [], provider: 'Resend API' };
  }

  const missing: string[] = [];
  if (!host) missing.push('SMTP_HOST');
  if (!process.env.SMTP_PORT) missing.push('SMTP_PORT');
  if (!user) missing.push('SMTP_USER');
  if (!pass) missing.push('SMTP_PASS');

  if (missing.length === 0) {
    return { isConfigured: true, missingVars: [], provider: 'SMTP' };
  }

  return { isConfigured: false, missingVars: missing, provider: 'None (Unconfigured)' };
}

// Dynamic metrics calculator
function calculateMetrics() {
  const totalProducts = store.draftProducts.length;
  const usedVehicles = store.draftProducts.filter((p) => p.listingType === 'used' || p.cat === 'Used Vehicles').length;
  const newParts = totalProducts - usedVehicles;
  const totalOrders = store.orders.length;
  const confirmedOrders = store.orders.filter((o) => o.status === 'Confirmed').length;
  const pendingOrders = totalOrders - confirmedOrders;
  const totalChats = store.chats.length;
  const diff = calculateCatalogDiff(
    store.publishedProducts,
    store.draftProducts,
    store.publishedHero,
    store.draftHero
  );

  return {
    totalProducts,
    usedVehicles,
    newParts,
    totalOrders,
    confirmedOrders,
    pendingOrders,
    totalChats,
    pendingChangesCount: diff.summary.length,
    isLivePaused: store.isLivePaused,
    hasChanges: diff.hasChanges,
  };
}

// ============================================================================
// SERVER API ROUTES
// ============================================================================

// ----------------------------------------------------------------------------
// 1. ADMIN LOGIN (Requirement 1)
// ----------------------------------------------------------------------------
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { email, username, password } = req.body;
  const submittedIdentifier = String(email || username || '').trim();

  if (!submittedIdentifier || !password) {
    res.status(400).json({
      success: false,
      error: 'MISSING_CREDENTIALS',
      message: 'Both Admin Email and Password are required.',
    });
    return;
  }

  // Only the configured admin email (studyai9211@gmail.com) can log in
  if (!validateAdminEmail(submittedIdentifier)) {
    setTimeout(() => {
      res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid administrative email or password.',
      });
    }, 200);
    return;
  }

  const inputHash = hashPassword(String(password));
  if (inputHash !== store.adminPasswordHash) {
    setTimeout(() => {
      res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid administrative email or password.',
      });
    }, 200);
    return;
  }

  const token = generateSecureToken(store.adminEmail);
  const now = Date.now();
  const expiresAt = now + 24 * 60 * 60 * 1000;

  activeSessions.set(token, {
    adminId: 'AFX-ADMIN-ROOT',
    email: store.adminEmail,
    role: 'super_admin',
    createdAt: now,
    expiresAt,
  });

  res.json({
    success: true,
    token,
    admin: {
      id: 'AFX-ADMIN-ROOT',
      email: store.adminEmail,
      role: 'super_admin',
      portal: 'AUTOFLUX Central Command',
    },
    expiresAt,
    message: 'Administrative authentication successful. Welcome to AUTOFLUX Command.',
  });
});

// Admin Session Verify (GET /api/admin/verify)
app.get('/api/admin/verify', authenticateAdmin, (req: Request, res: Response) => {
  const session = (req as any).adminSession;
  res.json({
    success: true,
    valid: true,
    admin: {
      id: session.adminId,
      email: session.email,
      role: session.role,
      portal: 'AUTOFLUX Central Command',
    },
    expiresAt: session.expiresAt,
  });
});

// Admin Logout (POST /api/admin/logout)
app.post('/api/admin/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeSessions.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully from admin portal.' });
});

// ----------------------------------------------------------------------------
// 2. FORGOT PASSWORD — EMAIL VERIFICATION (Requirement 2)
// ----------------------------------------------------------------------------
app.post('/api/admin/forgot-password/request', async (req: Request, res: Response) => {
  const { email } = req.body;
  const cleanEmail = String(email || '').trim();

  if (!cleanEmail) {
    res.status(400).json({
      success: false,
      error: 'MISSING_EMAIL',
      message: 'Admin email is required to request a verification code.',
    });
    return;
  }

  // Security rule: Never send verification codes to an email other than the configured admin email
  if (!validateAdminEmail(cleanEmail)) {
    res.status(403).json({
      success: false,
      error: 'UNAUTHORIZED_EMAIL',
      message: `Password reset verification codes can only be requested for the authorized administrator email (${CONFIGURED_ADMIN_EMAIL}).`,
    });
    return;
  }

  const code = generate8DigitCode();
  const now = Date.now();
  const expiresAt = now + CODE_EXPIRY_MS;

  const record: VerificationCodeRecord = {
    email: CONFIGURED_ADMIN_EMAIL,
    code,
    createdAt: now,
    expiresAt,
    attempts: 0,
    used: false,
  };
  activeResetCodes.set(CONFIGURED_ADMIN_EMAIL, record);

  const emailService = checkEmailServiceConfig();

  if (emailService.isConfigured) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"AUTOFLUX Security" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: CONFIGURED_ADMIN_EMAIL,
        subject: `[AUTOFLUX] Admin Password Reset Code: ${code}`,
        text: `Your AUTOFLUX administrative password reset verification code is: ${code}\n\nThis 8-digit code expires in 10 minutes and can be used once. If you did not request this, please verify your server security.`,
        html: `
          <div style="font-family: sans-serif; background: #121214; color: #fff; padding: 24px; border-radius: 8px;">
            <h2 style="color: #ef531d; margin: 0 0 12px 0;">AUTOFLUX Central Command</h2>
            <p>A password reset was requested for administrator account <strong>${CONFIGURED_ADMIN_EMAIL}</strong>.</p>
            <div style="background: #1b1b1f; border: 1px solid #333; padding: 16px; border-radius: 6px; margin: 20px 0; text-align: center;">
              <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #ef531d;">${code}</span>
            </div>
            <p style="font-size: 12px; color: #888;">This 8-digit code expires in 10 minutes (single-use limit: 5 attempts).</p>
          </div>
        `,
      });

      res.json({
        success: true,
        emailSent: true,
        message: `An 8-digit verification code has been dispatched to ${CONFIGURED_ADMIN_EMAIL}.`,
        expiresInMinutes: 10,
      });
      return;
    } catch (err: any) {
      console.error('SMTP delivery error:', err.message);
      // Fall through to report failure accurately
      res.status(500).json({
        success: false,
        emailSent: false,
        error: 'EMAIL_DELIVERY_FAILED',
        message: `Failed to deliver email through configured SMTP provider: ${err.message}. Check SMTP server credentials.`,
      });
      return;
    }
  }

  // Email service not configured: Never pretend! Explicitly state missing configuration.
  console.log(`\n======================================================`);
  console.log(`[AUTOFLUX AUTH] 8-DIGIT RESET CODE: ${code}`);
  console.log(`[AUTOFLUX AUTH] TARGET: ${CONFIGURED_ADMIN_EMAIL}`);
  console.log(`[AUTOFLUX AUTH] MISSING ENV VARS: ${emailService.missingVars.join(', ')}`);
  console.log(`======================================================\n`);

  res.json({
    success: true,
    emailSent: false,
    requiresManualDelivery: true,
    message: `Verification code generated for ${CONFIGURED_ADMIN_EMAIL}. Live email delivery is unconfigured because required SMTP settings (${emailService.missingVars.join(', ')}) or RESEND_API_KEY are missing from environment variables. For administrative testing, the secure code has been generated on the server.`,
    missingConfig: emailService.missingVars,
    devCodeHint: process.env.NODE_ENV !== 'production' ? code : undefined,
    expiresInMinutes: 10,
  });
});

app.post('/api/admin/forgot-password/verify-and-reset', (req: Request, res: Response) => {
  const { email, code, newPassword, confirmPassword } = req.body;
  const cleanEmail = String(email || '').trim();

  if (!validateAdminEmail(cleanEmail)) {
    res.status(403).json({
      success: false,
      error: 'UNAUTHORIZED_EMAIL',
      message: `Invalid administrator email.`,
    });
    return;
  }

  // 1. Validate password rules
  const passwordCheck = validatePasswordUpdate(newPassword, confirmPassword);
  if (!passwordCheck.valid) {
    res.status(400).json({
      success: false,
      error: 'INVALID_PASSWORD',
      message: passwordCheck.error,
    });
    return;
  }

  // 2. Validate verification code
  const record = activeResetCodes.get(CONFIGURED_ADMIN_EMAIL);
  const verifyResult = verifyCodeAttempt(record, code);

  if (!verifyResult.valid) {
    res.status(400).json({
      success: false,
      error: 'VERIFICATION_FAILED',
      message: verifyResult.error,
      remainingAttempts: verifyResult.remainingAttempts,
    });
    return;
  }

  // 3. Update password in persistent store
  store.adminPasswordHash = hashPassword(newPassword);
  saveStore();

  // Invalidate any active sessions
  activeSessions.clear();

  res.json({
    success: true,
    message: 'Password successfully updated in AUTOFLUX security store. Please log in with your new password.',
  });
});

// ----------------------------------------------------------------------------
// 3. REQUEST FOR ADMIN PANEL (Requirement 3)
// ----------------------------------------------------------------------------
app.post('/api/admin/request-access', (req: Request, res: Response) => {
  const { name, email, organization, reason } = req.body;

  if (!name || !email || !reason) {
    res.status(400).json({
      success: false,
      error: 'MISSING_FIELDS',
      message: 'Full name, email address, and reason for access are required.',
    });
    return;
  }

  const requestId = `REQ-${Date.now().toString(36).toUpperCase()}`;
  const newRequest: AccessRequest = {
    id: requestId,
    name: String(name).trim(),
    email: String(email).trim(),
    organization: organization ? String(organization).trim() : undefined,
    reason: String(reason).trim(),
    createdAt: Date.now(),
    status: 'PENDING_OWNER_APPROVAL',
  };

  store.accessRequests.unshift(newRequest);
  saveStore();

  res.status(201).json({
    success: true,
    message: 'Your request for admin access has been logged for owner review. Admin access is never granted automatically.',
    requestId,
  });
});

app.get('/api/admin/access-requests', authenticateAdmin, (req: Request, res: Response) => {
  res.json({
    success: true,
    requests: store.accessRequests,
  });
});

// ----------------------------------------------------------------------------
// 4. PUBLISHING & DRAFT MANAGEMENT (Requirement 4)
// ----------------------------------------------------------------------------

// Content status & diff
app.get('/api/admin/content/status', authenticateAdmin, (req: Request, res: Response) => {
  const diff = calculateCatalogDiff(
    store.publishedProducts,
    store.draftProducts,
    store.publishedHero,
    store.draftHero
  );

  res.json({
    success: true,
    isLivePaused: store.isLivePaused,
    lastPublishedAt: store.lastPublishedAt,
    lastDraftSavedAt: store.lastDraftSavedAt,
    publishedCount: store.publishedProducts.length,
    draftCount: store.draftProducts.length,
    diff,
    hero: {
      published: store.publishedHero,
      draft: store.draftHero,
    },
  });
});

// Toggle pause live publishing
app.post('/api/admin/content/toggle-pause', authenticateAdmin, (req: Request, res: Response) => {
  store.isLivePaused = !store.isLivePaused;
  saveStore();

  res.json({
    success: true,
    isLivePaused: store.isLivePaused,
    message: store.isLivePaused
      ? 'Live publishing is now PAUSED. Customer site remains live with current published content, but new changes cannot be published until resumed.'
      : 'Live publishing is now ACTIVE. Approved drafts can be published to the customer site.',
  });
});

// Save draft modifications
app.post('/api/admin/content/draft', authenticateAdmin, (req: Request, res: Response) => {
  const { products, heroImage } = req.body;

  if (Array.isArray(products)) {
    store.draftProducts = products;
  }
  if (typeof heroImage === 'string' && heroImage.trim()) {
    store.draftHero = heroImage.trim();
  }

  store.lastDraftSavedAt = Date.now();
  saveStore();

  const diff = calculateCatalogDiff(
    store.publishedProducts,
    store.draftProducts,
    store.publishedHero,
    store.draftHero
  );

  res.json({
    success: true,
    message: 'Draft changes saved. These changes are NOT visible to customers until published.',
    diff,
    lastDraftSavedAt: store.lastDraftSavedAt,
  });
});

// Discard draft modifications
app.post('/api/admin/content/discard-draft', authenticateAdmin, (req: Request, res: Response) => {
  store.draftProducts = JSON.parse(JSON.stringify(store.publishedProducts));
  store.draftHero = store.publishedHero;
  store.lastDraftSavedAt = Date.now();
  saveStore();

  res.json({
    success: true,
    message: 'Draft changes discarded. Reverted all drafts to currently published live website content.',
    draftProducts: store.draftProducts,
    draftHero: store.draftHero,
  });
});

// Publish draft to live website
app.post('/api/admin/content/publish', authenticateAdmin, (req: Request, res: Response) => {
  const diff = calculateCatalogDiff(
    store.publishedProducts,
    store.draftProducts,
    store.publishedHero,
    store.draftHero
  );

  const check = canPublish(store.isLivePaused, diff.hasChanges);
  if (!check.allowed) {
    res.status(400).json({
      success: false,
      error: store.isLivePaused ? 'PUBLISHING_PAUSED' : 'NO_CHANGES',
      message: check.reason,
    });
    return;
  }

  // Apply approved draft to published live state
  store.publishedProducts = JSON.parse(JSON.stringify(store.draftProducts));
  store.publishedHero = store.draftHero;
  store.lastPublishedAt = Date.now();
  saveStore();

  res.json({
    success: true,
    message: 'All draft changes published successfully! Customers will see these changes immediately.',
    publishedCount: store.publishedProducts.length,
    lastPublishedAt: store.lastPublishedAt,
  });
});

// ----------------------------------------------------------------------------
// 5. PUBLIC & ADMIN CATALOG (Shared Backend)
// ----------------------------------------------------------------------------

// Public storefront catalog: returns PUBLISHED products and hero
app.get('/api/catalog', (req: Request, res: Response) => {
  res.json({
    success: true,
    products: store.publishedProducts,
    heroImage: store.publishedHero,
    isLivePaused: store.isLivePaused,
    total: store.publishedProducts.length,
    lastPublishedAt: store.lastPublishedAt,
  });
});

// Admin catalog: returns DRAFT products for management
app.get('/api/admin/catalog', authenticateAdmin, (req: Request, res: Response) => {
  res.json({
    success: true,
    products: store.draftProducts,
    heroImage: store.draftHero,
    total: store.draftProducts.length,
  });
});

// Admin Add Product (saves to draft)
app.post('/api/admin/catalog', authenticateAdmin, (req: Request, res: Response) => {
  const { brand, name, cat, price, old, tag, img, desc, fit, listingType, year, condition } = req.body;

  if (!brand || !name || !price) {
    res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Brand, product name, and price are required.',
    });
    return;
  }

  const newId = Date.now();
  const newProduct: Product = {
    id: newId,
    brand: String(brand).trim(),
    name: String(name).trim(),
    cat: String(cat || 'Exterior'),
    price: Number(price),
    old: old ? Number(old) : Math.round(Number(price) * 1.2),
    tag: tag ? String(tag).trim() : (listingType === 'used' ? 'Verified Used' : 'New Arrival'),
    img: String(img || 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&w=700&q=85'),
    desc: String(desc || 'Detailed specification provided by AUTOFLUX workshop technicians.'),
    fit: String(fit || 'Compatible with verified vehicle specifications. Fitment check recommended.'),
    listingType: listingType === 'used' ? 'used' : 'part',
    year: year ? String(year) : undefined,
    condition: condition ? String(condition) : undefined,
  };

  store.draftProducts.unshift(newProduct);
  store.lastDraftSavedAt = Date.now();
  saveStore();

  res.status(201).json({
    success: true,
    message: 'Listing added to draft. Click "Publish Changes" to push to live customer website.',
    product: newProduct,
    metrics: calculateMetrics(),
  });
});

// Admin Update Product (updates draft)
app.patch('/api/admin/catalog/:id', authenticateAdmin, (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const index = store.draftProducts.findIndex((p) => p.id === id);

  if (index === -1) {
    res.status(404).json({ success: false, message: 'Listing not found in drafts.' });
    return;
  }

  store.draftProducts[index] = {
    ...store.draftProducts[index],
    ...req.body,
    id, // Keep immutable ID
  };
  store.lastDraftSavedAt = Date.now();
  saveStore();

  res.json({
    success: true,
    message: 'Draft listing updated. Click "Publish Changes" when ready to push live.',
    product: store.draftProducts[index],
    metrics: calculateMetrics(),
  });
});

// Admin Delete Product (removes from draft)
app.delete('/api/admin/catalog/:id', authenticateAdmin, (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const initialLen = store.draftProducts.length;
  store.draftProducts = store.draftProducts.filter((p) => p.id !== id);

  if (store.draftProducts.length === initialLen) {
    res.status(404).json({ success: false, message: 'Listing not found in drafts.' });
    return;
  }

  store.lastDraftSavedAt = Date.now();
  saveStore();

  res.json({
    success: true,
    message: `Listing #${id} deleted from drafts. Click "Publish Changes" to update the live store.`,
    metrics: calculateMetrics(),
  });
});

// Admin Update Hero (updates draft hero)
app.post('/api/admin/hero', authenticateAdmin, (req: Request, res: Response) => {
  const { heroImage } = req.body;
  if (!heroImage || typeof heroImage !== 'string') {
    res.status(400).json({ success: false, message: 'Hero image URL is required.' });
    return;
  }

  store.draftHero = heroImage.trim();
  store.lastDraftSavedAt = Date.now();
  saveStore();

  res.json({
    success: true,
    message: 'Draft hero image updated.',
    draftHero: store.draftHero,
  });
});

// ----------------------------------------------------------------------------
// 6. ORDERS & CHATS
// ----------------------------------------------------------------------------

app.get('/api/orders', (req: Request, res: Response) => {
  res.json({ success: true, orders: store.orders });
});

app.get('/api/admin/orders', authenticateAdmin, (req: Request, res: Response) => {
  res.json({ success: true, orders: store.orders });
});

app.post('/api/orders', (req: Request, res: Response) => {
  const { product, price, vehicle, year, date, time, name, phone, notes, productId } = req.body;

  if (!product || !vehicle || !name || !phone) {
    res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Product, vehicle details, customer name, and phone number are required.',
    });
    return;
  }

  const newOrder: PreOrder = {
    id: `AF-${Math.floor(100000 + Math.random() * 900000)}`,
    productId: productId ? Number(productId) : undefined,
    product: String(product),
    price: Number(price) || 0,
    vehicle: String(vehicle),
    year: year ? String(year) : undefined,
    date: date || new Date().toISOString().split('T')[0],
    time: time || 'Morning (10 AM - 1 PM)',
    name: String(name),
    phone: String(phone),
    notes: notes ? String(notes) : undefined,
    status: 'Request saved on this device',
    createdAt: Date.now(),
  };

  store.orders.unshift(newOrder);
  saveStore();

  res.status(201).json({
    success: true,
    message: 'Pre-order request saved and synchronized.',
    order: newOrder,
  });
});

app.patch('/api/admin/orders/:id', authenticateAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const order = store.orders.find((o) => o.id === id);

  if (!order) {
    res.status(404).json({ success: false, message: 'Order not found.' });
    return;
  }

  if (req.body.status) order.status = req.body.status;
  if (req.body.notes !== undefined) order.notes = req.body.notes;
  saveStore();

  res.json({
    success: true,
    message: 'Order updated successfully.',
    order,
    metrics: calculateMetrics(),
  });
});

app.delete('/api/admin/orders/:id', authenticateAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLen = store.orders.length;
  store.orders = store.orders.filter((o) => o.id !== id);

  if (store.orders.length === initialLen) {
    res.status(404).json({ success: false, message: 'Order not found.' });
    return;
  }
  saveStore();

  res.json({
    success: true,
    message: `Order #${id} deleted from records.`,
    metrics: calculateMetrics(),
  });
});

app.get('/api/chats', (req: Request, res: Response) => {
  res.json({ success: true, chats: store.chats });
});

app.get('/api/admin/chats', authenticateAdmin, (req: Request, res: Response) => {
  res.json({ success: true, chats: store.chats });
});

app.post('/api/chats', (req: Request, res: Response) => {
  const { problem, title, message } = req.body;
  if (!problem || !message) {
    res.status(400).json({ success: false, message: 'Problem ID and message required.' });
    return;
  }

  let chat = store.chats.find((c) => c.problem === problem);
  if (!chat) {
    chat = {
      problem: String(problem),
      title: title || 'Vehicle Diagnostic Inquiry',
      messages: [],
    };
    store.chats.push(chat);
  }

  chat.messages.push({
    from: message.from || 'user',
    text: message.text,
    timestamp: message.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });
  saveStore();

  res.json({ success: true, chat });
});

app.delete('/api/admin/chats/:id', authenticateAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  store.chats = store.chats.filter((c) => c.problem !== id);
  saveStore();
  res.json({ success: true, message: `Chat problem #${id} cleared.` });
});

app.get('/api/admin/dashboard', authenticateAdmin, (req: Request, res: Response) => {
  const metrics = calculateMetrics();
  res.json({
    success: true,
    metrics,
    recentOrders: store.orders.slice(0, 5),
    recentProducts: store.draftProducts.slice(-5).reverse(),
    recentChats: store.chats,
  });
});

// ============================================================================
// MULTI-PAGE & SPA ROUTING HANDLERS
// ============================================================================

async function startServer() {
  // Rewrite /admin and /admin/ to /admin.html before Vite SPA fallback
  app.use((req: Request, res: Response, next: NextFunction) => {
    const rawPath = req.path.replace(/\/+$/, '') || '/';
    if (rawPath === '/admin') {
      if (process.env.NODE_ENV !== 'production') {
        req.url = '/admin.html' + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '');
        next();
      } else {
        const distPath = path.resolve(__dirname, 'dist');
        res.sendFile(path.join(distPath, 'admin.html'));
      }
      return;
    }
    next();
  });

  if (process.env.NODE_ENV !== 'production') {
    // Development mode: mount Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // Production mode: serve built dist folder
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));

    // Admin portal routes: /admin, /admin/, and /admin.html
    app.get(['/admin', '/admin/', '/admin.html'], (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'admin.html'));
    });

    // Customer routes
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚗 AUTOFLUX Platform Server active on http://0.0.0.0:${PORT}`);
    console.log(`   Customer Storefront:   http://localhost:${PORT}/`);
    console.log(`   Admin Portal:          http://localhost:${PORT}/admin or /admin.html\n`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
