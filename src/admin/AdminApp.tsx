import React, { useState, useEffect } from 'react';
import {
  Lock,
  LogOut,
  LayoutDashboard,
  PlusCircle,
  Layers,
  ClipboardList,
  Wrench,
  Check,
  Trash2,
  Edit3,
  ExternalLink,
  Search,
  AlertCircle,
  X,
  PackageCheck,
  Car,
  Bike,
  ShieldCheck,
  RefreshCw,
  Mail,
  KeyRound,
  Send,
  Eye,
  EyeOff,
  UserCheck,
  PauseCircle,
  PlayCircle,
  UploadCloud,
  RotateCcw,
  Info,
  Clock,
  Sparkles,
  FileText,
  Sliders,
} from 'lucide-react';
import { formatMoney } from '../utils/autoflux.ts';
import type { CatalogDiff } from '../utils/admin_logic.ts';

export type AdminTab = 'dashboard' | 'add' | 'listings' | 'orders' | 'chats' | 'access' | 'banner';

interface Product {
  id: number;
  brand: string;
  name: string;
  cat: string;
  price: number;
  old: number;
  tag?: string;
  img: string;
  desc: string;
  fit: string;
  listingType?: 'part' | 'used';
  year?: string;
  condition?: string;
}

interface PreOrder {
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
}

interface MechanicChat {
  problem: string;
  title: string;
  messages: Array<{
    from: 'user' | 'mechanic';
    text: string;
    timestamp?: string;
  }>;
}

interface AccessRequest {
  id: string;
  name: string;
  email: string;
  organization?: string;
  reason: string;
  createdAt: number;
  status: string;
}

export default function AdminApp() {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('autoflux_admin_session_token') || null;
  });
  const [adminUser, setAdminUser] = useState<{ id: string; email: string; role: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(true);

  // Form states for login (Requirement 1: Admin Email: studyai9211@gmail.com, password: NovaXMaddy)
  const [loginEmail, setLoginEmail] = useState('studyai9211@gmail.com');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Forgot Password Flow state (Requirement 2)
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3 | 4>(1); // 1: Email, 2: 8-digit code, 3: New Password, 4: Success
  const [forgotEmail, setForgotEmail] = useState('studyai9211@gmail.com');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotStatusMessage, setForgotStatusMessage] = useState<string | null>(null);
  const [forgotErrorMessage, setForgotErrorMessage] = useState<string | null>(null);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [devCodeHint, setDevCodeHint] = useState<string | null>(null);
  const [missingEmailConfig, setMissingEmailConfig] = useState<string[]>([]);

  // Request for Admin Panel state (Requirement 3)
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reqName, setReqName] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqOrg, setReqOrg] = useState('');
  const [reqReason, setReqReason] = useState('');
  const [reqSubmittedId, setReqSubmittedId] = useState<string | null>(null);
  const [isSubmittingReq, setIsSubmittingReq] = useState(false);
  const [reqError, setReqError] = useState<string | null>(null);

  // Active admin tab
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Live state from server (Requirement 4 & 5)
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<PreOrder[]>([]);
  const [chats, setChats] = useState<MechanicChat[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [heroImage, setHeroImage] = useState<string>('');
  const [isLivePaused, setIsLivePaused] = useState<boolean>(false);
  const [lastPublishedAt, setLastPublishedAt] = useState<number>(0);
  const [catalogDiff, setCatalogDiff] = useState<CatalogDiff | null>(null);

  const [metrics, setMetrics] = useState({
    totalProducts: 0,
    usedVehicles: 0,
    newParts: 0,
    totalOrders: 0,
    confirmedOrders: 0,
    pendingOrders: 0,
    totalChats: 0,
    pendingChangesCount: 0,
    isLivePaused: false,
    hasChanges: false,
  });

  // UI state
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Add Item form state
  const [listingType, setListingType] = useState<'part' | 'used'>('part');
  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formCategory, setFormCategory] = useState('Exterior');
  const [formPrice, setFormPrice] = useState('');
  const [formOldPrice, setFormOldPrice] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formTag, setFormTag] = useState('');
  const [formYear, setFormYear] = useState('');
  const [formCondition, setFormCondition] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formFit, setFormFit] = useState('');

  // Editing state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Listings filter
  const [listingSearch, setListingSearch] = useState('');
  const [listingCategory, setListingCategory] = useState('All');

  // Orders filter
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'confirmed'>('all');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Verify session token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('autoflux_admin_session_token');
    if (!savedToken) {
      setIsVerifying(false);
      return;
    }

    fetch('/api/admin/verify', {
      headers: { Authorization: `Bearer ${savedToken}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.valid) {
          setToken(savedToken);
          setAdminUser(data.admin);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('autoflux_admin_session_token');
          setToken(null);
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
      })
      .finally(() => {
        setIsVerifying(false);
      });
  }, []);

  // 2. Load admin data once authenticated
  const fetchAdminData = async () => {
    if (!token) return;
    setIsLoadingData(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [dashRes, catRes, statusRes, ordRes, chatRes, reqRes] = await Promise.all([
        fetch('/api/admin/dashboard', { headers }),
        fetch('/api/admin/catalog', { headers }),
        fetch('/api/admin/content/status', { headers }),
        fetch('/api/admin/orders', { headers }),
        fetch('/api/admin/chats', { headers }),
        fetch('/api/admin/access-requests', { headers }),
      ]);

      const dashData = await dashRes.json();
      const catData = await catRes.json();
      const statusData = await statusRes.json();
      const ordData = await ordRes.json();
      const chatData = await chatRes.json();
      const reqData = await reqRes.json();

      if (dashData.success) {
        setMetrics(dashData.metrics);
      }
      if (catData.success) {
        setProducts(catData.products);
        if (catData.heroImage) setHeroImage(catData.heroImage);
      }
      if (statusData.success) {
        setIsLivePaused(statusData.isLivePaused);
        setLastPublishedAt(statusData.lastPublishedAt);
        setCatalogDiff(statusData.diff);
      }
      if (ordData.success) {
        setOrders(ordData.orders);
      }
      if (chatData.success) {
        setChats(chatData.chats);
      }
      if (reqData.success) {
        setAccessRequests(reqData.requests);
      }
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchAdminData();
    }
  }, [isAuthenticated, token]);

  // Handle Login (Requirement 1: Email studyai9211@gmail.com, password: NovaXMaddy)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('autoflux_admin_session_token', data.token);
        setToken(data.token);
        setAdminUser(data.admin);
        setIsAuthenticated(true);
        setLoginPassword('');
        showToast('Administrative authorization granted.');
      } else {
        setLoginError(data.message || 'Invalid administrative email or password.');
      }
    } catch {
      setLoginError('Unable to connect to AUTOFLUX authentication server.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    if (token) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error(err);
      }
    }
    localStorage.removeItem('autoflux_admin_session_token');
    setToken(null);
    setIsAuthenticated(false);
    setAdminUser(null);
    setActiveTab('dashboard');
    showToast('Logged out of administrative portal.');
  };

  // Requirement 2: Forgot Password - Step 1: Send Verification Code
  const handleRequestVerificationCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotErrorMessage(null);
    setForgotStatusMessage(null);
    setDevCodeHint(null);
    setIsSendingCode(true);

    try {
      const res = await fetch('/api/admin/forgot-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setForgotStatusMessage(data.message);
        if (data.devCodeHint) {
          setDevCodeHint(data.devCodeHint);
        }
        if (data.missingConfig) {
          setMissingEmailConfig(data.missingConfig);
        }
        setForgotStep(2);
      } else {
        setForgotErrorMessage(data.message || 'Failed to request verification code.');
      }
    } catch {
      setForgotErrorMessage('Server communication failure while requesting verification code.');
    } finally {
      setIsSendingCode(false);
    }
  };

  // Requirement 2: Forgot Password - Step 2 -> 3
  const handleProceedToNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotErrorMessage(null);
    const cleanCode = verificationCode.trim();
    if (cleanCode.length !== 8 || !/^\d{8}$/.test(cleanCode)) {
      setForgotErrorMessage('Please enter a valid 8-digit numerical verification code.');
      return;
    }
    setForgotStep(3);
  };

  // Requirement 2: Forgot Password - Step 3: Verify Code & Update Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotErrorMessage(null);

    if (newPassword.length < 8) {
      setForgotErrorMessage('Password must be at least 8 characters in length.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotErrorMessage('New password and confirm password do not match.');
      return;
    }

    setIsResettingPassword(true);
    try {
      const res = await fetch('/api/admin/forgot-password/verify-and-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail,
          code: verificationCode.trim(),
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setForgotStep(4);
        setForgotStatusMessage(data.message);
        showToast('Password updated securely. Please log in with your new password.');
      } else {
        setForgotErrorMessage(data.message || 'Failed to update password.');
      }
    } catch {
      setForgotErrorMessage('Server communication error during password reset.');
    } finally {
      setIsResettingPassword(false);
    }
  };

  // Requirement 3: Request for Admin Panel Submission
  const handleSubmitAccessRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setReqError(null);
    setIsSubmittingReq(true);

    try {
      const res = await fetch('/api/admin/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: reqName,
          email: reqEmail,
          organization: reqOrg,
          reason: reqReason,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setReqSubmittedId(data.requestId);
        showToast('Access request submitted for authorized review.');
      } else {
        setReqError(data.message || 'Error submitting access request.');
      }
    } catch {
      setReqError('Server connection failure while submitting request.');
    } finally {
      setIsSubmittingReq(false);
    }
  };

  // Requirement 4: Pause Live / Resume Live
  const handleTogglePauseLive = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/content/toggle-pause', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setIsLivePaused(data.isLivePaused);
        showToast(data.message);
        fetchAdminData();
      }
    } catch {
      showToast('Failed to toggle live publishing state.');
    }
  };

  // Requirement 4: Save Draft
  const handleSaveDraft = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/content/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          products,
          heroImage,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCatalogDiff(data.diff);
        showToast('Draft changes saved securely on server.');
        fetchAdminData();
      }
    } catch {
      showToast('Failed to save draft changes.');
    }
  };

  // Requirement 4: Discard Draft
  const handleDiscardDraft = async () => {
    if (!token) return;
    if (!confirm('Discard all pending draft edits and revert to the live published website content?')) return;

    try {
      const res = await fetch('/api/admin/content/discard-draft', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        showToast('Drafts discarded. Restored live published version.');
        fetchAdminData();
      }
    } catch {
      showToast('Failed to discard draft.');
    }
  };

  // Requirement 4: Publish Changes to Live Website
  const handlePublishChanges = async () => {
    if (!token) return;
    if (isLivePaused) {
      showToast('Live publishing is paused. Please resume live publishing first.');
      return;
    }

    setIsPublishing(true);
    try {
      const res = await fetch('/api/admin/content/publish', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'Changes published live! Customers see changes immediately upon refresh.');
        setShowPublishModal(false);
        fetchAdminData();
      } else {
        showToast(data.message || 'Unable to publish changes.');
      }
    } catch {
      showToast('Server error during publication.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Add Item to Draft
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!formName.trim() || !formPrice) {
      showToast('Please specify item name and price.');
      return;
    }

    try {
      const res = await fetch('/api/admin/catalog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formName.trim(),
          brand: formBrand.trim() || (listingType === 'used' ? 'Verified Owner' : 'AUTOFLUX Performance'),
          cat: listingType === 'used' ? 'Used Vehicles' : formCategory,
          price: Number(formPrice),
          old: formOldPrice ? Number(formOldPrice) : Math.round(Number(formPrice) * 1.2),
          tag: formTag.trim() || (listingType === 'used' ? 'Certified Used' : 'New Arrival'),
          img: formImageUrl.trim() || 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&w=700&q=85',
          desc: formDesc.trim() || 'Verified quality checked by AUTOFLUX technicians.',
          fit: formFit.trim() || 'Verified fitment specifications.',
          listingType,
          year: formYear.trim() || undefined,
          condition: formCondition.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Added to draft: ${data.product.name}`);
        setFormName('');
        setFormBrand('');
        setFormPrice('');
        setFormOldPrice('');
        setFormImageUrl('');
        setFormTag('');
        setFormYear('');
        setFormCondition('');
        setFormDesc('');
        setFormFit('');
        fetchAdminData();
        setActiveTab('listings');
      } else {
        showToast(data.message || 'Error creating listing.');
      }
    } catch {
      showToast('Server request failed.');
    }
  };

  // Update Item in Draft
  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingProduct) return;

    try {
      const res = await fetch(`/api/admin/catalog/${editingProduct.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingProduct),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Updated draft: ${editingProduct.name}`);
        setEditingProduct(null);
        fetchAdminData();
      } else {
        showToast(data.message || 'Error updating item.');
      }
    } catch {
      showToast('Server error while updating listing.');
    }
  };

  // Delete Item from Draft
  const handleDeleteItem = async (id: number) => {
    if (!token) return;
    if (!confirm('Remove this item from the catalog draft?')) return;

    try {
      const res = await fetch(`/api/admin/catalog/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Listing removed from draft.');
        fetchAdminData();
      } else {
        showToast(data.message || 'Error deleting item.');
      }
    } catch {
      showToast('Server connection failed.');
    }
  };

  // Update Hero Image in Draft
  const handleUpdateHero = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !heroImage.trim()) return;

    try {
      const res = await fetch('/api/admin/hero', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ heroImage: heroImage.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('Hero image updated in draft. Click "Publish Changes" to push live.');
        fetchAdminData();
      }
    } catch {
      showToast('Failed to update hero image.');
    }
  };

  // Confirm Pre-Order
  const handleConfirmOrder = async (orderId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'Confirmed' }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Pre-Order ${orderId} confirmed!`);
        fetchAdminData();
      }
    } catch {
      showToast('Failed to update order status.');
    }
  };

  // Delete Pre-Order
  const handleDeleteOrder = async (orderId: string) => {
    if (!token) return;
    if (!confirm(`Delete pre-order ${orderId}?`)) return;

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Order ${orderId} deleted.`);
        fetchAdminData();
      }
    } catch {
      showToast('Failed to delete order.');
    }
  };

  // Clear Diagnostic Chat
  const handleClearChat = async (problemId: string) => {
    if (!token) return;
    if (!confirm(`Clear diagnostic thread #${problemId}?`)) return;

    try {
      const res = await fetch(`/api/admin/chats/${problemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Diagnostic request cleared.');
        fetchAdminData();
      }
    } catch {
      showToast('Failed to delete chat.');
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#121214] text-white flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-[#ef531d]">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="font-mono text-sm tracking-widest uppercase">Verifying Authorization...</span>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // LOGIN SCREEN (Requirement 1, 2 & 3)
  // ==========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#121214] text-[#eee] flex flex-col justify-between p-4 sm:p-8 font-sans selection:bg-[#ef531d] selection:text-white">
        {/* Navigation back to root storefront */}
        <header className="max-w-md w-full mx-auto flex items-center justify-between py-4">
          <a
            href="/"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#999] hover:text-[#ef531d] transition-colors"
          >
            ← Return to Storefront
          </a>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#888] border border-white/10">
            AUTOFLUX OS v3.3
          </span>
        </header>

        {/* Main Login Card */}
        <main className="max-w-md w-full mx-auto my-auto bg-[#1b1b1f] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#ef531d] flex items-center justify-center text-white shadow-lg shadow-[#ef531d]/30 shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white uppercase font-display">
                Admin Control Portal
              </h1>
              <p className="text-xs text-[#999]">Server-Authorized Operations Access</p>
            </div>
          </div>

          {loginError && (
            <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#bbb] uppercase mb-1 tracking-wider">
                Admin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="studyai9211@gmail.com"
                  className="w-full bg-[#121214] border border-white/10 focus:border-[#ef531d] rounded-lg px-3.5 py-2.5 text-sm text-white outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#bbb] uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(true);
                    setForgotStep(1);
                    setForgotErrorMessage(null);
                    setForgotStatusMessage(null);
                  }}
                  className="text-[11px] font-semibold text-[#ef531d] hover:text-[#ff6a38] transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  className="w-full bg-[#121214] border border-white/10 focus:border-[#ef531d] rounded-lg px-3.5 py-2.5 pr-10 text-sm text-white outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-[#ef531d] hover:bg-[#d84512] disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-[#ef531d]/25 transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2 mt-5 cursor-pointer"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Unlock Admin Command</span>
                </>
              )}
            </button>
          </form>

          {/* Access Request Action (Requirement 3) */}
          <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-[#888]">
            <span>Need new access?</span>
            <button
              type="button"
              onClick={() => {
                setShowRequestModal(true);
                setReqSubmittedId(null);
                setReqError(null);
              }}
              className="text-[#ef531d] hover:underline font-semibold cursor-pointer flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Request for Admin Panel</span>
            </button>
          </div>
        </main>

        <footer className="max-w-md w-full mx-auto text-center py-4 text-[11px] text-[#666]">
          AUTOFLUX Central Command · Cryptographic Verification & Audit Logging Active
        </footer>

        {/* ================================================================== */}
        {/* FORGOT PASSWORD MODAL (Requirement 2)                             */}
        {/* ================================================================== */}
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1b1b1f] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-[#ef531d]" />
                  <h3 className="font-display text-lg font-bold text-white uppercase">
                    Admin Password Recovery
                  </h3>
                </div>
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Step indicator */}
              <div className="flex items-center justify-between mb-5 text-[11px] font-mono border-b border-white/5 pb-2">
                <span className={forgotStep === 1 ? 'text-[#ef531d] font-bold' : 'text-gray-500'}>
                  1. Identify
                </span>
                <span className="text-gray-600">→</span>
                <span className={forgotStep === 2 ? 'text-[#ef531d] font-bold' : 'text-gray-500'}>
                  2. 8-Digit Code
                </span>
                <span className="text-gray-600">→</span>
                <span className={forgotStep === 3 ? 'text-[#ef531d] font-bold' : 'text-gray-500'}>
                  3. New Password
                </span>
              </div>

              {forgotErrorMessage && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{forgotErrorMessage}</span>
                </div>
              )}

              {/* STEP 1: Enter email and send code */}
              {forgotStep === 1 && (
                <form onSubmit={handleRequestVerificationCode} className="space-y-4">
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Enter the authorized administrator email to generate and dispatch an 8-digit verification code.
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                      Admin Email
                    </label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="studyai9211@gmail.com"
                      className="w-full bg-[#121214] border border-white/10 focus:border-[#ef531d] rounded-lg px-3 py-2 text-sm text-white outline-none"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      Codes are exclusively dispatched to the configured admin account (studyai9211@gmail.com).
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingCode}
                    className="w-full bg-[#ef531d] hover:bg-[#d84512] disabled:opacity-50 text-white font-bold py-2.5 rounded-xl uppercase text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#ef531d]/20"
                  >
                    {isSendingCode ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating & Dispatching Code...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Verification Code</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 2: Enter 8-digit verification code */}
              {forgotStep === 2 && (
                <form onSubmit={handleProceedToNewPassword} className="space-y-4">
                  {forgotStatusMessage && (
                    <div className="p-3 rounded-lg bg-[#ef531d]/10 border border-[#ef531d]/30 text-xs text-[#ff8f68] leading-relaxed">
                      <p className="font-semibold">{forgotStatusMessage}</p>
                    </div>
                  )}

                  {devCodeHint && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-1">
                      <p className="font-bold flex items-center gap-1">
                        <Info className="w-3.5 h-3.5" /> Diagnostic Notice:
                      </p>
                      <p className="text-[11px] text-gray-300">
                        No live email service (SMTP / Resend) is configured in environment variables.
                      </p>
                      <p className="font-mono text-sm tracking-widest text-[#ef531d] font-black bg-black/40 px-2 py-1 rounded inline-block">
                        Code: {devCodeHint}
                      </p>
                      {missingEmailConfig.length > 0 && (
                        <p className="text-[10px] text-gray-400">
                          Missing vars for live email: {missingEmailConfig.join(', ')}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                      8-Digit Numerical Code
                    </label>
                    <input
                      type="text"
                      maxLength={8}
                      pattern="[0-9]{8}"
                      required
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="87654321"
                      className="w-full bg-[#121214] border border-white/10 focus:border-[#ef531d] rounded-lg px-3 py-2 text-center text-lg font-mono tracking-widest text-white outline-none"
                    />
                    <div className="flex items-center justify-between mt-1 text-[11px] text-gray-500">
                      <span>Expires in 10 minutes</span>
                      <span>Single-use · Max 5 attempts</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="bg-white/5 hover:bg-white/10 text-gray-300 py-2.5 px-4 rounded-xl text-xs uppercase"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-[#ef531d] hover:bg-[#d84512] text-white font-bold py-2.5 rounded-xl uppercase text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#ef531d]/20"
                    >
                      <span>Verify Code & Continue</span>
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: Enter new password & confirm */}
              {forgotStep === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <p className="text-xs text-gray-400">
                    Code verified. Please set a new secure administrative password (minimum 8 characters).
                  </p>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#121214] border border-white/10 focus:border-[#ef531d] rounded-lg px-3 py-2 text-sm text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#121214] border border-white/10 focus:border-[#ef531d] rounded-lg px-3 py-2 text-sm text-white outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isResettingPassword}
                    className="w-full bg-[#ef531d] hover:bg-[#d84512] disabled:opacity-50 text-white font-bold py-2.5 rounded-xl uppercase text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#ef531d]/20"
                  >
                    {isResettingPassword ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 4: Success confirmation */}
              {forgotStep === 4 && (
                <div className="text-center py-4 space-y-4">
                  <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Password Updated</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      Your administrative password was securely updated. All previous sessions have been invalidated.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowForgotModal(false);
                      setLoginPassword('');
                    }}
                    className="w-full bg-[#ef531d] hover:bg-[#d84512] text-white font-bold py-2.5 rounded-xl uppercase text-xs tracking-wider cursor-pointer"
                  >
                    Return to Login
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* REQUEST FOR ADMIN PANEL MODAL (Requirement 3)                     */}
        {/* ================================================================== */}
        {showRequestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1b1b1f] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-[#ef531d]" />
                  <h3 className="font-display text-lg font-bold text-white uppercase">
                    Request Admin Panel Access
                  </h3>
                </div>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {reqSubmittedId ? (
                <div className="text-center py-4 space-y-4">
                  <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Access Request Submitted</h4>
                    <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                      Your request has been logged for authorized owner review. Admin access is not automatically granted.
                    </p>
                    <div className="mt-3 p-2 rounded bg-black/40 border border-white/5 font-mono text-xs text-[#ef531d]">
                      Reference: {reqSubmittedId}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowRequestModal(false)}
                    className="w-full bg-white/10 hover:bg-white/15 text-white font-bold py-2.5 rounded-xl uppercase text-xs tracking-wider"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitAccessRequest} className="space-y-3.5">
                  <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 leading-relaxed">
                    Submitting this form does not grant immediate access. All requests are securely stored for verification and approval by the platform owner.
                  </div>

                  {reqError && (
                    <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                      {reqError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={reqName}
                      onChange={(e) => setReqName(e.target.value)}
                      placeholder="e.g. Vikram Sharma"
                      className="w-full bg-[#121214] border border-white/10 focus:border-[#ef531d] rounded-lg px-3 py-2 text-sm text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                      Work Email
                    </label>
                    <input
                      type="email"
                      required
                      value={reqEmail}
                      onChange={(e) => setReqEmail(e.target.value)}
                      placeholder="vikram@autoflux.com"
                      className="w-full bg-[#121214] border border-white/10 focus:border-[#ef531d] rounded-lg px-3 py-2 text-sm text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                      Organization / Role
                    </label>
                    <input
                      type="text"
                      value={reqOrg}
                      onChange={(e) => setReqOrg(e.target.value)}
                      placeholder="e.g. Workshop Operations / Lead Technician"
                      className="w-full bg-[#121214] border border-white/10 focus:border-[#ef531d] rounded-lg px-3 py-2 text-sm text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
                      Reason for Access Request
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={reqReason}
                      onChange={(e) => setReqReason(e.target.value)}
                      placeholder="Describe what inventory or pre-order records you need to manage..."
                      className="w-full bg-[#121214] border border-white/10 focus:border-[#ef531d] rounded-lg px-3 py-2 text-sm text-white outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReq}
                    className="w-full bg-[#ef531d] hover:bg-[#d84512] disabled:opacity-50 text-white font-bold py-2.5 rounded-xl uppercase text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#ef531d]/20"
                  >
                    {isSubmittingReq ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting Request...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Request for Owner Review</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================================================
  // AUTHENTICATED ADMIN DASHBOARD (Requirements 4, 5 & 6)
  // ==========================================================================

  // Filtered listings
  const filteredProducts = products.filter((p) => {
    const matchesCat = listingCategory === 'All' || p.cat === listingCategory;
    const matchesSearch =
      !listingSearch ||
      p.name.toLowerCase().includes(listingSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(listingSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'pending') return o.status !== 'Confirmed';
    if (orderFilter === 'confirmed') return o.status === 'Confirmed';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#121214] text-[#eee] flex flex-col font-sans selection:bg-[#ef531d] selection:text-white">
      {/* 1. TOP HEADER & PUBLISHING SYSTEM BAR (Requirement 4) */}
      <header className="bg-[#18181c] border-b border-white/10 sticky top-0 z-40 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Brand info */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#ef531d] text-white flex items-center justify-center font-black font-display text-lg shadow-md shadow-[#ef531d]/30">
              A
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-base text-white tracking-wider">
                  AUTOFLUX COMMAND
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-gray-300">
                  {adminUser?.email || 'studyai9211@gmail.com'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-gray-400">
                <span>Central Management</span>
                <span>•</span>
                <a
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#ef531d] hover:underline flex items-center gap-0.5"
                >
                  <span>Customer Storefront</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Publishing & Live Control Center (Requirement 4) */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Live Publishing Status Badge */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                isLivePaused
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isLivePaused ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
                }`}
              />
              <span>{isLivePaused ? 'Live Publishing Paused' : 'Live Publishing Active'}</span>
            </div>

            {/* Pause Live / Resume Live toggle control */}
            <button
              onClick={handleTogglePauseLive}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                isLivePaused
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/40'
                  : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/30'
              }`}
              title={
                isLivePaused
                  ? 'Resume live publishing to allow pushing approved drafts to customers'
                  : 'Pause live publishing to lock public updates while editing drafts'
              }
            >
              {isLivePaused ? (
                <>
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>Resume Live</span>
                </>
              ) : (
                <>
                  <PauseCircle className="w-3.5 h-3.5" />
                  <span>Pause Live</span>
                </>
              )}
            </button>

            {/* Save Draft Button */}
            <button
              onClick={handleSaveDraft}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors cursor-pointer"
              title="Save changes to server draft store without publishing to customer site"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>

            {/* Discard Drafts Button */}
            {catalogDiff?.hasChanges && (
              <button
                onClick={handleDiscardDraft}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors cursor-pointer"
                title="Discard all pending draft edits and revert to published state"
              >
                <span>Discard Draft</span>
              </button>
            )}

            {/* Prominent Publish Changes Button */}
            <button
              onClick={() => setShowPublishModal(true)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg ${
                isLivePaused
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-60'
                  : catalogDiff?.hasChanges
                  ? 'bg-[#ef531d] hover:bg-[#d84512] text-white shadow-[#ef531d]/30 animate-pulse'
                  : 'bg-[#ef531d]/80 hover:bg-[#ef531d] text-white shadow-[#ef531d]/20'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Publish Changes</span>
              {catalogDiff && catalogDiff.summary.length > 0 && (
                <span className="bg-black/40 text-white px-1.5 py-0.2 rounded-full text-[10px]">
                  {catalogDiff.summary.length}
                </span>
              )}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
              title="Log out of Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pending Changes Quick Ribbon */}
        {catalogDiff && catalogDiff.hasChanges && (
          <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-[#ef531d]">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              Pending Draft Edits: {catalogDiff.summary.join(' · ')}
            </span>
            <span className="text-gray-400 text-[10px]">
              Not visible on customer storefront until published.
            </span>
          </div>
        )}
      </header>

      {/* 2. ADMIN NAVIGATION TABS */}
      <nav className="bg-[#151518] border-b border-white/5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-2.5">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-[#ef531d] text-white shadow-md shadow-[#ef531d]/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('listings')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
              activeTab === 'listings'
                ? 'bg-[#ef531d] text-white shadow-md shadow-[#ef531d]/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Catalog & Vehicles ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
              activeTab === 'add'
                ? 'bg-[#ef531d] text-white shadow-md shadow-[#ef531d]/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Item</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#ef531d] text-white shadow-md shadow-[#ef531d]/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('chats')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
              activeTab === 'chats'
                ? 'bg-[#ef531d] text-white shadow-md shadow-[#ef531d]/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Diagnostics ({chats.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('access')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
              activeTab === 'access'
                ? 'bg-[#ef531d] text-white shadow-md shadow-[#ef531d]/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Access Requests ({accessRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('banner')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
              activeTab === 'banner'
                ? 'bg-[#ef531d] text-white shadow-md shadow-[#ef531d]/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Storefront Banner</span>
          </button>
        </div>
      </nav>

      {/* 3. MAIN TAB CONTENT */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 flex-1">
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Publishing Banner Info */}
            <div
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                isLivePaused
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isLivePaused ? 'bg-amber-500/20' : 'bg-emerald-500/20'
                  }`}
                >
                  {isLivePaused ? <PauseCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    {isLivePaused
                      ? 'Live Publishing is Currently Paused'
                      : 'Live Publishing System is Active'}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {isLivePaused
                      ? 'Public storefront continues displaying the last published content. New draft changes cannot be published until live mode is resumed.'
                      : 'Approved catalog drafts can be published directly to customer-facing storefront with instant visibility upon browser refresh.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleTogglePauseLive}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer ${
                    isLivePaused
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300'
                  }`}
                >
                  {isLivePaused ? 'Resume Live Publishing' : 'Pause Live Publishing'}
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[#1b1b1f] border border-white/10 rounded-2xl p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                  Draft Catalog
                </span>
                <div className="text-2xl font-black font-display text-white">
                  {products.length}
                </div>
                <span className="text-[11px] text-gray-500 mt-1 block">
                  {metrics.usedVehicles} Vehicles · {metrics.newParts} Accessories
                </span>
              </div>

              <div className="bg-[#1b1b1f] border border-white/10 rounded-2xl p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                  Customer Pre-Orders
                </span>
                <div className="text-2xl font-black font-display text-white">
                  {orders.length}
                </div>
                <span className="text-[11px] text-emerald-400 mt-1 block">
                  {metrics.confirmedOrders} Confirmed · {metrics.pendingOrders} Pending
                </span>
              </div>

              <div className="bg-[#1b1b1f] border border-white/10 rounded-2xl p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                  Mechanic Chats
                </span>
                <div className="text-2xl font-black font-display text-white">
                  {chats.length}
                </div>
                <span className="text-[11px] text-gray-500 mt-1 block">
                  Active diagnostic logs
                </span>
              </div>

              <div className="bg-[#1b1b1f] border border-white/10 rounded-2xl p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                  Pending Diffs
                </span>
                <div className="text-2xl font-black font-display text-[#ef531d]">
                  {catalogDiff?.summary.length || 0}
                </div>
                <span className="text-[11px] text-gray-500 mt-1 block">
                  {catalogDiff?.hasChanges ? 'Draft edits ready' : 'Synced with live site'}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveTab('add')}
                className="bg-[#1b1b1f] hover:bg-[#222227] border border-white/10 rounded-2xl p-5 text-left transition-colors cursor-pointer group"
              >
                <PlusCircle className="w-6 h-6 text-[#ef531d] mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="font-bold text-white text-sm">Add New Listing</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Create a new car accessory, bike part, or certified used vehicle in drafts.
                </p>
              </button>

              <button
                onClick={() => setShowPublishModal(true)}
                className="bg-[#1b1b1f] hover:bg-[#222227] border border-white/10 rounded-2xl p-5 text-left transition-colors cursor-pointer group"
              >
                <UploadCloud className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="font-bold text-white text-sm">Review & Publish</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Inspect diff summary and push approved drafts live to the customer website.
                </p>
              </button>

              <button
                onClick={() => setActiveTab('access')}
                className="bg-[#1b1b1f] hover:bg-[#222227] border border-white/10 rounded-2xl p-5 text-left transition-colors cursor-pointer group"
              >
                <UserCheck className="w-6 h-6 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="font-bold text-white text-sm">Review Access Requests</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Manage incoming requests submitted through the "Request for Admin Panel" portal.
                </p>
              </button>
            </div>

            {/* Recent Pre-Orders Preview */}
            <div className="bg-[#1b1b1f] border border-white/10 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm uppercase tracking-wider text-white">
                  Recent Workshop Pre-Orders
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-[#ef531d] hover:underline"
                >
                  View All Orders →
                </button>
              </div>

              {orders.length === 0 ? (
                <p className="text-xs text-gray-500 py-4 text-center">No pre-orders recorded yet.</p>
              ) : (
                <div className="divide-y divide-white/5 text-xs">
                  {orders.slice(0, 4).map((order) => (
                    <div key={order.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-white">{order.product}</div>
                        <div className="text-gray-400 text-[11px]">
                          {order.name} · {order.vehicle} · {order.phone}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">
                          {formatMoney(order.price)}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            order.status === 'Confirmed'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CATALOG LISTINGS TAB */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={listingSearch}
                    onChange={(e) => setListingSearch(e.target.value)}
                    placeholder="Search draft listings..."
                    className="w-full bg-[#1b1b1f] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-[#ef531d]"
                  />
                </div>
                <select
                  value={listingCategory}
                  onChange={(e) => setListingCategory(e.target.value)}
                  className="bg-[#1b1b1f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#ef531d]"
                >
                  <option value="All">All Categories</option>
                  <option value="Exterior">Exterior</option>
                  <option value="Interior">Interior</option>
                  <option value="Lighting">Lighting</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Used Vehicles">Used Vehicles</option>
                </select>
              </div>

              <button
                onClick={() => setActiveTab('add')}
                className="bg-[#ef531d] hover:bg-[#d84512] text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#ef531d]/20"
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Item</span>
              </button>
            </div>

            {/* Listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-[#1b1b1f] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="h-44 w-full bg-[#121214] relative overflow-hidden">
                      <img
                        src={p.img}
                        alt={p.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <span className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                        {p.cat}
                      </span>
                      {p.tag && (
                        <span className="absolute top-2.5 right-2.5 bg-[#ef531d] text-white px-2 py-0.5 rounded text-[10px] font-bold">
                          {p.tag}
                        </span>
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="text-[11px] font-bold text-[#ef531d] uppercase tracking-wider">
                        {p.brand}
                      </div>
                      <h4 className="font-bold text-white text-sm line-clamp-1">{p.name}</h4>
                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                        {p.desc}
                      </p>
                      <div className="pt-2 flex items-baseline gap-2">
                        <span className="text-base font-black font-display text-white">
                          {formatMoney(p.price)}
                        </span>
                        {p.old > p.price && (
                          <span className="text-xs text-gray-500 line-through">
                            {formatMoney(p.old)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-[#161619] border-t border-white/5 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setEditingProduct(p)}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Draft</span>
                    </button>
                    <button
                      onClick={() => handleDeleteItem(p.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer"
                      title="Delete from draft"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ADD ITEM TAB */}
        {activeTab === 'add' && (
          <div className="max-w-2xl mx-auto bg-[#1b1b1f] border border-white/10 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              <PlusCircle className="w-6 h-6 text-[#ef531d]" />
              <div>
                <h3 className="font-bold text-lg text-white">Create Draft Catalog Listing</h3>
                <p className="text-xs text-gray-400">
                  Items are saved to your draft catalog. Use "Publish Changes" when ready to push live.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-300 uppercase mb-1">Listing Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setListingType('part');
                      if (formCategory === 'Used Vehicles') setFormCategory('Exterior');
                    }}
                    className={`py-2 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer ${
                      listingType === 'part'
                        ? 'bg-[#ef531d] text-white'
                        : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>New Part / Accessory</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setListingType('used');
                      setFormCategory('Used Vehicles');
                    }}
                    className={`py-2 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer ${
                      listingType === 'used'
                        ? 'bg-[#ef531d] text-white'
                        : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Car className="w-4 h-4" />
                    <span>Certified Used Vehicle</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-300 uppercase mb-1">
                    {listingType === 'used' ? 'Vehicle Make & Model' : 'Product Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder={listingType === 'used' ? 'e.g. Royal Enfield Classic 350' : 'e.g. Sport Alloy Wheel 17"'}
                    className="w-full bg-[#121214] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#ef531d]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-300 uppercase mb-1">
                    {listingType === 'used' ? 'Brand / Manufacturer' : 'Brand Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    placeholder="e.g. RoadForm, GripCraft, Honda"
                    className="w-full bg-[#121214] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#ef531d]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-300 uppercase mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-[#121214] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#ef531d]"
                  >
                    <option value="Exterior">Exterior</option>
                    <option value="Interior">Interior</option>
                    <option value="Lighting">Lighting</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Used Vehicles">Used Vehicles</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-300 uppercase mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="8990"
                    className="w-full bg-[#121214] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#ef531d]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-300 uppercase mb-1">Old Price (₹)</label>
                  <input
                    type="number"
                    min={1}
                    value={formOldPrice}
                    onChange={(e) => setFormOldPrice(e.target.value)}
                    placeholder="10990"
                    className="w-full bg-[#121214] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#ef531d]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-300 uppercase mb-1">Direct Image URL</label>
                <input
                  type="url"
                  required
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-[#121214] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#ef531d]"
                />
              </div>

              {listingType === 'used' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-300 uppercase mb-1">Registration Year</label>
                    <input
                      type="text"
                      value={formYear}
                      onChange={(e) => setFormYear(e.target.value)}
                      placeholder="2022"
                      className="w-full bg-[#121214] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#ef531d]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-300 uppercase mb-1">Condition & Mileage</label>
                    <input
                      type="text"
                      value={formCondition}
                      onChange={(e) => setFormCondition(e.target.value)}
                      placeholder="Excellent (14,200 km)"
                      className="w-full bg-[#121214] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#ef531d]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-300 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Detailed specifications, vehicle fitment notes..."
                  className="w-full bg-[#121214] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#ef531d]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#ef531d] hover:bg-[#d84512] text-white font-bold py-3 rounded-xl uppercase text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#ef531d]/20 mt-4"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Save to Draft Catalog</span>
              </button>
            </form>
          </div>
        )}

        {/* CUSTOMER PRE-ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => setOrderFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-bold ${
                    orderFilter === 'all' ? 'bg-[#ef531d] text-white' : 'bg-white/5 text-gray-400'
                  }`}
                >
                  All ({orders.length})
                </button>
                <button
                  onClick={() => setOrderFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg font-bold ${
                    orderFilter === 'pending' ? 'bg-[#ef531d] text-white' : 'bg-white/5 text-gray-400'
                  }`}
                >
                  Pending ({orders.filter((o) => o.status !== 'Confirmed').length})
                </button>
                <button
                  onClick={() => setOrderFilter('confirmed')}
                  className={`px-3 py-1.5 rounded-lg font-bold ${
                    orderFilter === 'confirmed' ? 'bg-[#ef531d] text-white' : 'bg-white/5 text-gray-400'
                  }`}
                >
                  Confirmed ({orders.filter((o) => o.status === 'Confirmed').length})
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-[#1b1b1f] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[#ef531d] font-bold">#{order.id}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          order.status === 'Confirmed'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-sm">{order.product}</h4>
                    <p className="text-xs text-gray-400">
                      Customer: <strong className="text-gray-200">{order.name}</strong> · Phone: {order.phone} · Vehicle: {order.vehicle}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Preferred Booking: {order.date} ({order.time}) {order.notes ? `· Notes: ${order.notes}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                    <span className="font-mono font-black text-white text-base mr-2">
                      {formatMoney(order.price)}
                    </span>
                    {order.status !== 'Confirmed' && (
                      <button
                        onClick={() => handleConfirmOrder(order.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MECHANIC DIAGNOSTICS TAB */}
        {activeTab === 'chats' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {chats.map((chat) => (
                <div
                  key={chat.problem}
                  className="bg-[#1b1b1f] border border-white/10 rounded-2xl p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-[#ef531d]" />
                        <h4 className="font-bold text-white text-sm">{chat.title}</h4>
                      </div>
                      <span className="text-[10px] font-mono text-gray-500 uppercase">
                        ID: {chat.problem}
                      </span>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs">
                      {chat.messages.map((m, idx) => (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-xl ${
                            m.from === 'mechanic'
                              ? 'bg-[#ef531d]/15 border border-[#ef531d]/20 text-[#ffb69b] ml-4'
                              : 'bg-white/5 text-gray-300 mr-4'
                          }`}
                        >
                          <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5 text-gray-400">
                            {m.from === 'mechanic' ? 'AUTOFLUX Workshop Technician' : 'Customer'}
                          </div>
                          <p className="leading-relaxed">{m.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-white/5 flex justify-end">
                    <button
                      onClick={() => handleClearChat(chat.problem)}
                      className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Thread</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACCESS REQUESTS TAB (Requirement 3 review) */}
        {activeTab === 'access' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-white">Submitted Admin Panel Requests</h3>
                <p className="text-xs text-gray-400">
                  Requests submitted from the "Request for Admin Panel" login link. Privileges require manual owner approval.
                </p>
              </div>
            </div>

            {accessRequests.length === 0 ? (
              <div className="bg-[#1b1b1f] border border-white/10 rounded-2xl p-8 text-center text-gray-500 text-xs">
                No access requests currently pending review.
              </div>
            ) : (
              <div className="space-y-3">
                {accessRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-[#1b1b1f] border border-white/10 rounded-2xl p-5 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-[#ef531d] font-bold">{req.id}</span>
                        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-bold">
                          {req.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-500">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <p className="text-white font-semibold">
                        {req.name} ({req.email})
                      </p>
                      {req.organization && (
                        <p className="text-gray-400">Department / Org: {req.organization}</p>
                      )}
                      <p className="text-gray-300 bg-black/30 p-2.5 rounded-lg border border-white/5 mt-2 leading-relaxed">
                        Reason: {req.reason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STOREFRONT BANNER TAB */}
        {activeTab === 'banner' && (
          <div className="max-w-xl mx-auto bg-[#1b1b1f] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <Sliders className="w-5 h-5 text-[#ef531d]" />
              <div>
                <h3 className="font-bold text-white text-base">Storefront Hero Banner (Draft)</h3>
                <p className="text-xs text-gray-400">
                  Update the primary hero background image. Remember to click "Publish Changes" to push live.
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateHero} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-300 uppercase mb-1">
                  Hero Image URL
                </label>
                <input
                  type="url"
                  required
                  value={heroImage}
                  onChange={(e) => setHeroImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#121214] border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-[#ef531d]"
                />
              </div>

              {heroImage && (
                <div className="h-40 w-full rounded-xl overflow-hidden border border-white/10 bg-black/40">
                  <img
                    src={heroImage}
                    alt="Hero Banner Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#ef531d] hover:bg-[#d84512] text-white font-bold py-2.5 rounded-xl uppercase tracking-wider cursor-pointer"
              >
                Save Hero Image to Draft
              </button>
            </form>
          </div>
        )}
      </main>

      {/* EDIT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1b1b1f] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="font-bold text-white text-base">Edit Draft Listing #{editingProduct.id}</h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-300 uppercase mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full bg-[#121214] border border-white/10 rounded-lg px-3 py-2 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-300 uppercase mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.brand}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    className="w-full bg-[#121214] border border-white/10 rounded-lg px-3 py-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-300 uppercase mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) || 0 })}
                    className="w-full bg-[#121214] border border-white/10 rounded-lg px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-300 uppercase mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={editingProduct.img}
                  onChange={(e) => setEditingProduct({ ...editingProduct, img: e.target.value })}
                  className="w-full bg-[#121214] border border-white/10 rounded-lg px-3 py-2 text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-300 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.desc}
                  onChange={(e) => setEditingProduct({ ...editingProduct, desc: e.target.value })}
                  className="w-full bg-[#121214] border border-white/10 rounded-lg px-3 py-2 text-white outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#ef531d] hover:bg-[#d84512] text-white py-2.5 rounded-xl font-bold uppercase text-xs cursor-pointer"
                >
                  Save Draft Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="bg-white/5 hover:bg-white/10 text-gray-300 py-2.5 px-4 rounded-xl text-xs uppercase"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* PUBLISH CHANGES MODAL (Requirement 4)                                */}
      {/* ==================================================================== */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1b1b1f] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-[#ef531d]" />
                <h3 className="font-bold text-white text-base">Publish Changes to Live Store</h3>
              </div>
              <button
                onClick={() => setShowPublishModal(false)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isLivePaused ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-2 text-xs">
                <p className="font-bold flex items-center gap-1.5">
                  <PauseCircle className="w-4 h-4" /> Live Publishing is Currently PAUSED
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Publishing is locked to prevent partial updates. To push pending changes to customers, click "Resume Live Publishing" above.
                </p>
              </div>
            ) : !catalogDiff?.hasChanges ? (
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs leading-relaxed">
                The live customer storefront is already completely in sync with your drafts. No uncommitted modifications were found.
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <p className="text-gray-300">
                  The following pending draft modifications will be synchronized directly to the live customer storefront:
                </p>

                <div className="bg-[#121214] border border-white/10 rounded-xl p-3.5 space-y-2 max-h-56 overflow-y-auto">
                  {catalogDiff.summary.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[#ef531d]">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-gray-200 font-medium">{item}</span>
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-gray-500">
                  Customers will see updated prices, listings, and banners immediately on page reload without needing a server restart or deployment.
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={handlePublishChanges}
                disabled={isLivePaused || !catalogDiff?.hasChanges || isPublishing}
                className="flex-1 bg-[#ef531d] hover:bg-[#d84512] disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#ef531d]/20"
              >
                {isPublishing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Publishing Changes...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Confirm & Push Live</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="bg-white/5 hover:bg-white/10 text-gray-300 py-3 px-4 rounded-xl text-xs uppercase"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-[#222227] text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold border border-white/10 flex items-center gap-2 animate-fade-in"
        >
          <Sparkles className="w-4 h-4 text-[#ef531d]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
