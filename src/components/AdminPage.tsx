import React, { useState } from 'react';
import {
  ArrowLeft,
  Lock,
  PlusCircle,
  Image,
  Check,
  Trash2,
  Home,
  LogOut,
  LayoutDashboard,
  Layers,
  ClipboardList,
  Wrench,
  Settings,
  Search,
  ExternalLink,
  Edit3,
  X,
  PackageCheck,
  Car,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import type { Product, PreOrder, MechanicChat, AdminTab } from '../types/index.ts';
import { formatMoney, calculateDashboardMetrics } from '../utils/autoflux.ts';

interface AdminPageProps {
  isOpen: boolean;
  onClose: () => void;
  isAdminUnlocked: boolean;
  onUnlockAdmin: (password: string) => boolean | Promise<boolean>;
  onLogoutAdmin: () => void;
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: number) => void;
  heroImageUrl: string;
  onUpdateHeroImage: (url: string) => void;
  orders: PreOrder[];
  onConfirmOrder: (orderId: string) => void;
  onDeleteOrder: (orderId: string) => void;
  chats: MechanicChat[];
  onGoHome: () => void;
  showToast: (msg: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  isOpen,
  onClose,
  isAdminUnlocked,
  onUnlockAdmin,
  onLogoutAdmin,
  activeTab,
  onTabChange,
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  heroImageUrl,
  onUpdateHeroImage,
  orders,
  onConfirmOrder,
  onDeleteOrder,
  chats,
  onGoHome,
  showToast,
}) => {
  if (!isOpen) return null;

  const [password, setPassword] = useState('');
  const [newHeroUrl, setNewHeroUrl] = useState(heroImageUrl);

  // New listing form state
  const [listingType, setListingType] = useState<'part' | 'used'>('part');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Exterior');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [year, setYear] = useState('');
  const [condition, setCondition] = useState('');
  const [description, setDescription] = useState('');

  // Editing listing modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Search filter inside admin listings
  const [listingSearch, setListingSearch] = useState('');
  const [listingCategory, setListingCategory] = useState('All');

  // Order status filter in admin orders view
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'confirmed'>('all');

  const metrics = calculateDashboardMetrics(products, orders, chats);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onUnlockAdmin(password);
    if (success) {
      setPassword('');
      showToast('Admin portal unlocked.');
    } else {
      showToast('Incorrect administrator password.');
    }
  };

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !brand.trim() || !price || !imageUrl.trim()) {
      showToast('Please fill all required listing fields.');
      return;
    }

    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      showToast('Please enter a valid price.');
      return;
    }

    const descParts = [
      description.trim(),
      year ? `Year: ${year}` : '',
      condition ? `Condition: ${condition}` : '',
    ].filter(Boolean);

    onAddProduct({
      name: name.trim(),
      brand: brand.trim(),
      cat: listingType === 'used' ? 'Used Vehicles' : category,
      price: priceNum,
      old: priceNum,
      tag: listingType === 'used' ? 'Second-hand' : 'New',
      img: imageUrl.trim(),
      desc: descParts.join(' · ') || 'Verified listing',
      fit: listingType === 'used' ? 'Vehicle specifications inspected' : 'Requires fitment check',
      listingType,
      year: year || undefined,
      condition: condition || undefined,
    });

    setName('');
    setBrand('');
    setPrice('');
    setImageUrl('');
    setYear('');
    setCondition('');
    setDescription('');
    showToast(listingType === 'used' ? 'Vehicle listing published to store.' : 'Product listing published to store.');
    onTabChange('listings');
  };

  const handleSaveHero = () => {
    if (!newHeroUrl.trim()) {
      showToast('Please provide an image URL for the hero section.');
      return;
    }
    onUpdateHeroImage(newHeroUrl.trim());
    showToast('Hero section banner updated.');
  };

  const handleSaveEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    onUpdateProduct(editingProduct);
    setEditingProduct(null);
    showToast('Listing updated successfully.');
  };

  const filteredAdminListings = products.filter((p) => {
    const matchesCat = listingCategory === 'All' || p.cat.toLowerCase() === listingCategory.toLowerCase();
    const q = listingSearch.toLowerCase();
    const matchesQuery = !q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  const filteredAdminOrders = orders.filter((o) => {
    if (orderFilter === 'confirmed') return o.status === 'Confirmed';
    if (orderFilter === 'pending') return o.status !== 'Confirmed';
    return true;
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-[#f7f4ee] overflow-y-auto animate-fade-in text-[#171717]"
      role="region"
      aria-label="Admin control panel"
    >
      {/* Top Header Bar */}
      <header className="sticky top-0 z-20 bg-[#211d1a] border-b border-[#302b26] text-white px-4 sm:px-8 py-3.5 sm:py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onClose();
                onGoHome();
              }}
              className="inline-flex items-center gap-2 text-xs font-bold text-white/90 hover:text-white py-1 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Store</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-[#ef531d] font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#ef531d] animate-pulse" />
              <span>Storefront Admin</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdminUnlocked && (
              <button
                onClick={onLogoutAdmin}
                className="inline-flex items-center gap-1.5 bg-[#ef531d] hover:bg-[#d84512] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              aria-label="Close admin"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Full-Page Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 pb-32">
        {!isAdminUnlocked ? (
          /* Password Authentication Gate */
          <div className="max-w-md mx-auto my-12 p-8 bg-[#fffdf8] border border-[#e5decb] rounded-2xl text-center shadow-lg">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#ef531d]/10 text-[#ef531d] flex items-center justify-center mb-4">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="font-display text-3xl font-black text-[#171717] mb-2">
              ADMIN AUTHENTICATION
            </h1>
            <p className="text-xs text-[#696862] mb-6 leading-relaxed">
              Enter the owner password to access dashboard metrics, edit listings, and manage pre-orders.
            </p>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                placeholder="Enter administrator password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#fbf9f4] text-[#171717] border border-[#d9d1c1] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#ef531d] text-center"
              />
              <button
                type="submit"
                className="w-full bg-[#ef531d] hover:bg-[#d84512] text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-colors shadow-md shadow-[#ef531d]/20"
              >
                Unlock Admin Portal ↗
              </button>
            </form>
          </div>
        ) : (
          /* Unlocked Admin Workspace with Strict Separate View Pages */
          <div>
            {/* View Switching Navigation Pills */}
            <nav aria-label="Admin sub-pages" className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 border-b border-[#171717]/10">
              {[
                { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
                { id: 'add' as AdminTab, label: 'Add Items', icon: <PlusCircle className="w-4 h-4" /> },
                { id: 'listings' as AdminTab, label: 'Edit Listings', icon: <Layers className="w-4 h-4" /> },
                { id: 'orders' as AdminTab, label: 'Pre-Orders', icon: <ClipboardList className="w-4 h-4" /> },
                { id: 'chats' as AdminTab, label: 'Problem Chats', icon: <Wrench className="w-4 h-4" /> },
                { id: 'settings' as AdminTab, label: 'Settings', icon: <Settings className="w-4 h-4" /> },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-[#ef531d] text-white shadow-md shadow-[#ef531d]/20'
                        : 'bg-[#fffdf8] text-[#555] border border-[#e5decb] hover:bg-[#eee8dd] hover:text-[#171717]'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* PAGE 1: DASHBOARD ONLY */}
            {activeTab === 'dashboard' && (
              <section className="space-y-8 animate-fade-in">
                <div>
                  <h1 className="font-display text-4xl sm:text-5xl font-black text-[#171717] leading-none mb-2">
                    ADMIN <span className="text-[#ef531d]">DASHBOARD.</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-[#696862]">
                    Real-time catalog counts and pre-order metrics computed directly from saved device data.
                  </p>
                </div>

                {/* 6 Real KPI Metric Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
                  <div className="bg-[#fffdf8] border border-[#e5decb] rounded-2xl p-4 shadow-sm">
                    <span className="text-[0.68rem] font-bold text-[#797168] block uppercase">Total Products</span>
                    <b className="font-display text-3xl sm:text-4xl font-black text-[#171717] mt-1 block">
                      {metrics.totalProducts}
                    </b>
                    <small className="text-[0.68rem] text-[#1e7e34] font-semibold">Active in shop</small>
                  </div>

                  <div className="bg-[#fffdf8] border border-[#e5decb] rounded-2xl p-4 shadow-sm">
                    <span className="text-[0.68rem] font-bold text-[#797168] block uppercase">New Parts</span>
                    <b className="font-display text-3xl sm:text-4xl font-black text-[#171717] mt-1 block">
                      {metrics.newParts}
                    </b>
                    <small className="text-[0.68rem] text-[#777]">Accessories</small>
                  </div>

                  <div className="bg-[#fffdf8] border border-[#e5decb] rounded-2xl p-4 shadow-sm">
                    <span className="text-[0.68rem] font-bold text-[#797168] block uppercase">Used Vehicles</span>
                    <b className="font-display text-3xl sm:text-4xl font-black text-[#ef531d] mt-1 block">
                      {metrics.usedVehicles}
                    </b>
                    <small className="text-[0.68rem] text-[#777]">Cars & bikes</small>
                  </div>

                  <div className="bg-[#fffdf8] border border-[#e5decb] rounded-2xl p-4 shadow-sm">
                    <span className="text-[0.68rem] font-bold text-[#797168] block uppercase">Total Orders</span>
                    <b className="font-display text-3xl sm:text-4xl font-black text-[#171717] mt-1 block">
                      {metrics.totalOrders}
                    </b>
                    <small className="text-[0.68rem] text-[#777]">Customer requests</small>
                  </div>

                  <div className="bg-[#fffdf8] border border-[#e5decb] rounded-2xl p-4 shadow-sm">
                    <span className="text-[0.68rem] font-bold text-[#797168] block uppercase">Confirmed</span>
                    <b className="font-display text-3xl sm:text-4xl font-black text-[#1e7e34] mt-1 block">
                      {metrics.confirmedOrders}
                    </b>
                    <small className="text-[0.68rem] text-[#1e7e34] font-semibold">Ready for pickup</small>
                  </div>

                  <div className="bg-[#fffdf8] border border-[#e5decb] rounded-2xl p-4 shadow-sm">
                    <span className="text-[0.68rem] font-bold text-[#797168] block uppercase">Problem Chats</span>
                    <b className="font-display text-3xl sm:text-4xl font-black text-[#ef531d] mt-1 block">
                      {metrics.totalChats}
                    </b>
                    <small className="text-[0.68rem] text-[#777]">Diagnostic topics</small>
                  </div>
                </div>

                {/* Quick Navigation Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <button
                    onClick={() => onTabChange('add')}
                    className="p-6 bg-[#fffdf8] border border-[#e5decb] hover:border-[#ef531d] rounded-2xl text-left transition-all group shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#f5ede0] text-[#ef531d] group-hover:bg-[#ef531d] group-hover:text-white flex items-center justify-center mb-3 transition-colors">
                      <PlusCircle className="w-5 h-5" />
                    </div>
                    <h3 className="font-display text-xl font-black text-[#171717]">Publish New Listing</h3>
                    <p className="text-xs text-[#696862] mt-1">Add aftermarket accessories or second-hand vehicles.</p>
                  </button>

                  <button
                    onClick={() => onTabChange('listings')}
                    className="p-6 bg-[#fffdf8] border border-[#e5decb] hover:border-[#ef531d] rounded-2xl text-left transition-all group shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#f5ede0] text-[#ef531d] group-hover:bg-[#ef531d] group-hover:text-white flex items-center justify-center mb-3 transition-colors">
                      <Layers className="w-5 h-5" />
                    </div>
                    <h3 className="font-display text-xl font-black text-[#171717]">Manage Catalog ({products.length})</h3>
                    <p className="text-xs text-[#696862] mt-1">Directly edit pricing, images, and descriptions or remove items.</p>
                  </button>

                  <button
                    onClick={() => onTabChange('orders')}
                    className="p-6 bg-[#fffdf8] border border-[#e5decb] hover:border-[#ef531d] rounded-2xl text-left transition-all group shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#f5ede0] text-[#ef531d] group-hover:bg-[#ef531d] group-hover:text-white flex items-center justify-center mb-3 transition-colors">
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <h3 className="font-display text-xl font-black text-[#171717]">Review Pre-Orders ({orders.length})</h3>
                    <p className="text-xs text-[#696862] mt-1">Confirm stock and coordinate installation with customers.</p>
                  </button>
                </div>
              </section>
            )}

            {/* PAGE 2: ADD ITEMS ONLY */}
            {activeTab === 'add' && (
              <section className="bg-[#fffdf8] p-6 sm:p-8 rounded-2xl border border-[#e5decb] shadow-sm animate-fade-in max-w-3xl">
                <div className="flex items-center gap-2 text-[#ef531d] text-xs font-black uppercase tracking-wider mb-2">
                  <PlusCircle className="w-4 h-4" />
                  <span>Inventory Management</span>
                </div>
                <h1 className="font-display text-3xl sm:text-4xl font-black text-[#171717] mb-2">
                  ADD NEW LISTING
                </h1>
                <p className="text-xs text-[#696862] mb-6">
                  Publish new auto parts, bike accessories, or second-hand vehicles into the store catalog.
                </p>

                <form onSubmit={handleCreateListing} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[0.72rem] font-bold text-[#403a33] mb-1">
                        Listing Type *
                      </label>
                      <select
                        value={listingType}
                        onChange={(e) => setListingType(e.target.value as 'part' | 'used')}
                        className="w-full bg-[#f9f7f2] border border-[#dcd4c4] rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-[#ef531d]"
                      >
                        <option value="part">1 · New Part / Accessory / Gear</option>
                        <option value="used">2 · Second-Hand Car / Bike / Vehicle</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[0.72rem] font-bold text-[#403a33] mb-1">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        disabled={listingType === 'used'}
                        className="w-full bg-[#f9f7f2] border border-[#dcd4c4] rounded-xl px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-[#ef531d] disabled:opacity-60"
                      >
                        <option>Exterior</option>
                        <option>Interior</option>
                        <option>Lighting</option>
                        <option>Cleaning</option>
                        <option>Gadgets</option>
                        <option>Tools</option>
                        <option>Bike Accessories</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[0.72rem] font-bold text-[#403a33] mb-1">
                        Item / Vehicle Name *
                      </label>
                      <input
                        required
                        placeholder="e.g. Carbon Rear Spoiler or Hyundai Creta 2021"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#f9f7f2] border border-[#dcd4c4] rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-[#ef531d]"
                      />
                    </div>
                    <div>
                      <label className="block text-[0.72rem] font-bold text-[#403a33] mb-1">
                        Brand / Seller Name *
                      </label>
                      <input
                        required
                        placeholder="e.g. Brembo / AutoFlux Verified"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        className="w-full bg-[#f9f7f2] border border-[#dcd4c4] rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-[#ef531d]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-[0.72rem] font-bold text-[#403a33] mb-1">
                        Price (₹) *
                      </label>
                      <input
                        required
                        type="number"
                        min="1"
                        placeholder="e.g. 4500"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full bg-[#f9f7f2] border border-[#dcd4c4] rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-[#ef531d]"
                      />
                    </div>
                    <div>
                      <label className="block text-[0.72rem] font-bold text-[#403a33] mb-1">
                        Year (if vehicle)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 2022"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full bg-[#f9f7f2] border border-[#dcd4c4] rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-[#ef531d]"
                      />
                    </div>
                    <div>
                      <label className="block text-[0.72rem] font-bold text-[#403a33] mb-1">
                        Condition / Mileage
                      </label>
                      <input
                        placeholder="e.g. Brand New or 28,000 km"
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                        className="w-full bg-[#f9f7f2] border border-[#dcd4c4] rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-[#ef531d]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[0.72rem] font-bold text-[#403a33] mb-1">
                      Direct Photo Image URL *
                    </label>
                    <input
                      required
                      type="url"
                      placeholder="https://..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full bg-[#f9f7f2] border border-[#dcd4c4] rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-[#ef531d]"
                    />
                  </div>

                  <div>
                    <label className="block text-[0.72rem] font-bold text-[#403a33] mb-1">
                      Description & Specifications
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Provide compatibility notes, material, dimensions, or service history..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-[#f9f7f2] border border-[#dcd4c4] rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-[#ef531d]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-[#ef531d] hover:bg-[#d84512] text-white px-7 py-3 rounded-xl font-black text-xs uppercase tracking-wide transition-colors shadow-md shadow-[#ef531d]/20"
                  >
                    Publish Listing To Store ↗
                  </button>
                </form>
              </section>
            )}

            {/* PAGE 3: EDIT LISTINGS ONLY */}
            {activeTab === 'listings' && (
              <section className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <h1 className="font-display text-4xl sm:text-5xl font-black text-[#171717] leading-none mb-2">
                      MANAGE <span className="text-[#ef531d]">LISTINGS.</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-[#696862]">
                      Edit pricing, images, and descriptions or remove items from the live storefront.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onGoHome();
                    }}
                    className="inline-flex items-center gap-1.5 bg-[#211d1a] text-white px-4 py-2 rounded-xl text-xs font-bold self-start"
                  >
                    <Home className="w-4 h-4" />
                    <span>View on Home Page</span>
                  </button>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[#888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="search"
                      placeholder="Filter listings by name or brand..."
                      value={listingSearch}
                      onChange={(e) => setListingSearch(e.target.value)}
                      className="w-full bg-[#fffdf8] border border-[#e5decb] rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:border-[#ef531d]"
                    />
                  </div>
                  <select
                    value={listingCategory}
                    onChange={(e) => setListingCategory(e.target.value)}
                    className="bg-[#fffdf8] border border-[#e5decb] rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-[#ef531d]"
                  >
                    <option value="All">All Categories</option>
                    <option value="Exterior">Exterior</option>
                    <option value="Interior">Interior</option>
                    <option value="Lighting">Lighting</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Gadgets">Gadgets</option>
                    <option value="Tools">Tools</option>
                    <option value="Used Vehicles">Used Vehicles</option>
                  </select>
                </div>

                {/* Listings Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAdminListings.map((p) => (
                    <article
                      key={p.id}
                      className="bg-[#fffdf8] border border-[#e5decb] rounded-2xl overflow-hidden p-4 flex flex-col justify-between shadow-sm"
                    >
                      <div className="flex gap-3 mb-3">
                        <img
                          src={p.img}
                          alt={p.name}
                          className="w-20 h-20 rounded-xl object-cover bg-[#eee8dd] shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-[0.65rem] font-black uppercase text-[#ef531d] block">
                            {p.brand} · {p.cat}
                          </span>
                          <h3 className="font-bold text-sm text-[#171717] leading-snug truncate">
                            {p.name}
                          </h3>
                          <div className="font-display text-lg font-black text-[#171717] mt-1">
                            {formatMoney(p.price)}
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-[#696862] line-clamp-2 mb-4 leading-relaxed">
                        {p.desc}
                      </p>

                      <div className="flex items-center gap-2 pt-3 border-t border-[#171717]/10">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(p)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#211d1a] hover:bg-[#38332c] text-white py-2 px-3 rounded-lg text-xs font-black uppercase transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteProduct(p.id)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#ffe4dc] hover:bg-[#ffd2c4] text-[#a72a08] py-2 px-3 rounded-lg text-xs font-black uppercase transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* PAGE 4: ORDERS ONLY */}
            {activeTab === 'orders' && (
              <section className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <h1 className="font-display text-4xl sm:text-5xl font-black text-[#171717] leading-none mb-2">
                      CUSTOMER <span className="text-[#ef531d]">PRE-ORDERS.</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-[#696862]">
                      Review incoming compatibility and pre-order requests. Confirm requests or remove completed orders.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setOrderFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                        orderFilter === 'all' ? 'bg-[#ef531d] text-white' : 'bg-[#fffdf8] border text-[#555]'
                      }`}
                    >
                      All ({orders.length})
                    </button>
                    <button
                      onClick={() => setOrderFilter('pending')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                        orderFilter === 'pending' ? 'bg-[#ef531d] text-white' : 'bg-[#fffdf8] border text-[#555]'
                      }`}
                    >
                      Pending ({orders.filter((o) => o.status !== 'Confirmed').length})
                    </button>
                    <button
                      onClick={() => setOrderFilter('confirmed')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                        orderFilter === 'confirmed' ? 'bg-[#ef531d] text-white' : 'bg-[#fffdf8] border text-[#555]'
                      }`}
                    >
                      Confirmed ({orders.filter((o) => o.status === 'Confirmed').length})
                    </button>
                  </div>
                </div>

                {filteredAdminOrders.length === 0 ? (
                  <div className="p-12 text-center bg-[#fffdf8] rounded-2xl border border-dashed border-[#d8cfc1]">
                    <PackageCheck className="w-8 h-8 text-[#ef531d] mx-auto mb-2" />
                    <p className="text-sm font-bold text-[#4a4742]">No customer pre-orders match this view.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredAdminOrders.map((o) => (
                      <article
                        key={o.id}
                        className="p-5 bg-[#fffdf8] border border-[#e5decb] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
                      >
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-mono text-xs font-black text-[#ef531d] bg-[#ef531d]/10 px-2 py-0.5 rounded">
                              {o.id}
                            </span>
                            <strong className="text-base text-[#171717]">{o.product}</strong>
                            <span
                              className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${
                                o.status === 'Confirmed'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-[#e8e2d4] text-[#635c52]'
                              }`}
                            >
                              {o.status}
                            </span>
                          </div>
                          <p className="text-[#625c52]">
                            Customer: <strong>{o.name}</strong> · {o.phone}
                          </p>
                          <p className="text-[#625c52]">
                            Vehicle: <strong>{o.vehicle}</strong> {o.year ? `(${o.year})` : ''}
                          </p>
                          <p className="text-[#625c52]">
                            Schedule: {o.date} · {o.time} · Price: {formatMoney(o.price)}
                          </p>
                          {o.notes && <p className="italic text-[#827a6e]">Notes: {o.notes}</p>}
                        </div>

                        <div className="flex items-center gap-2 shrink-0 flex-wrap">
                          {o.status !== 'Confirmed' ? (
                            <button
                              type="button"
                              onClick={() => onConfirmOrder(o.id)}
                              className="inline-flex items-center gap-1.5 bg-[#1e7e34] hover:bg-[#165c26] text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Confirm Request</span>
                            </button>
                          ) : (
                            <span className="text-xs text-[#1e7e34] font-bold px-3 py-1.5 bg-[#e3f4e6] rounded-xl flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              Confirmed
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => onDeleteOrder(o.id)}
                            className="inline-flex items-center gap-1.5 bg-[#ffe4dc] hover:bg-[#ffd2c4] text-[#a72a08] px-3.5 py-2 rounded-xl text-xs font-bold transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* PAGE 5: CHATS / PROBLEM REQUESTS ONLY */}
            {activeTab === 'chats' && (
              <section className="space-y-6 animate-fade-in">
                <div>
                  <h1 className="font-display text-4xl sm:text-5xl font-black text-[#171717] leading-none mb-2">
                    MECHANIC <span className="text-[#ef531d]">REQUESTS.</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-[#696862]">
                    Transcripts of diagnostic inquiries submitted through the workshop chat.
                  </p>
                </div>

                {chats.length === 0 ? (
                  <div className="p-12 text-center bg-[#fffdf8] rounded-2xl border border-dashed border-[#d8cfc1]">
                    <Wrench className="w-8 h-8 text-[#ef531d] mx-auto mb-2" />
                    <p className="text-sm font-bold text-[#4a4742]">No customer mechanic inquiries logged yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chats.map((c, idx) => (
                      <article key={idx} className="p-5 bg-[#fffdf8] border border-[#e5decb] rounded-2xl shadow-sm">
                        <div className="flex items-center justify-between pb-3 border-b border-[#171717]/10 mb-3">
                          <b className="text-sm font-display text-xl font-black text-[#171717] uppercase tracking-wide">
                            {c.title}
                          </b>
                          <span className="text-[0.68rem] font-bold text-[#777] bg-[#eee8dd] px-2.5 py-1 rounded-full">
                            {c.messages.length} messages
                          </span>
                        </div>
                        <div className="space-y-2 text-xs text-[#38342e]">
                          {c.messages.map((m, mIdx) => (
                            <div
                              key={mIdx}
                              className={`p-3 rounded-xl leading-relaxed ${
                                m.from === 'customer'
                                  ? 'bg-[#fff5f0] border border-[#f5d9cf] text-[#a3320c]'
                                  : 'bg-[#f4efe6] text-[#2d2924]'
                              }`}
                            >
                              <strong className="block text-[0.68rem] uppercase font-black mb-0.5">
                                {m.from === 'customer' ? 'Customer:' : 'Workshop Advice:'}
                              </strong>
                              {m.text}
                            </div>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* PAGE 6: SETTINGS & LOGOUT ONLY */}
            {activeTab === 'settings' && (
              <section className="space-y-6 animate-fade-in max-w-2xl">
                <div>
                  <h1 className="font-display text-4xl sm:text-5xl font-black text-[#171717] leading-none mb-2">
                    ADMIN <span className="text-[#ef531d]">SETTINGS.</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-[#696862]">
                    Storefront appearance, hero photo customization, and session controls.
                  </p>
                </div>

                {/* Hero section image modifier */}
                <div className="bg-[#fffdf8] p-6 rounded-2xl border border-[#e5decb] shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-[#ef531d] text-xs font-black uppercase tracking-wider">
                    <Image className="w-4 h-4" />
                    <span>Storefront Banner Image</span>
                  </div>
                  <h3 className="font-display text-2xl font-black text-[#171717]">
                    HERO PHOTO URL
                  </h3>
                  <p className="text-xs text-[#696862] leading-relaxed">
                    Update the main showcase vehicle banner image displayed at the top of the homepage.
                  </p>

                  <div className="space-y-3">
                    <input
                      type="url"
                      placeholder="Paste direct image URL"
                      value={newHeroUrl}
                      onChange={(e) => setNewHeroUrl(e.target.value)}
                      className="w-full bg-[#f9f7f2] border border-[#dcd4c4] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#ef531d]"
                    />
                    <button
                      type="button"
                      onClick={handleSaveHero}
                      className="bg-[#211d1a] hover:bg-[#38332c] text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase transition-colors"
                    >
                      Save Hero Banner Image
                    </button>
                  </div>
                </div>

                {/* Session termination */}
                <div className="bg-[#fffdf8] p-6 rounded-2xl border border-red-200 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-red-600 text-xs font-black uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4" />
                    <span>Session Termination</span>
                  </div>
                  <h3 className="font-display text-2xl font-black text-[#171717]">
                    LOG OUT OF ADMIN MODE
                  </h3>
                  <p className="text-xs text-[#696862] leading-relaxed">
                    Deactivates admin privileges and restores the standard customer navigation.
                  </p>
                  <button
                    type="button"
                    onClick={onLogoutAdmin}
                    className="bg-[#ef531d] hover:bg-[#d84512] text-white px-6 py-3 rounded-xl font-black text-xs uppercase transition-colors inline-flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Confirm Log Out</span>
                  </button>
                </div>
              </section>
            )}
          </div>
        )}

        {/* Modal for Editing a Specific Listing */}
        {editingProduct && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
          >
            <div className="bg-[#fffdf8] border border-[#e5decb] rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-[#171717]/10 mb-4">
                <h3 className="font-display text-2xl font-black text-[#171717]">
                  EDIT LISTING
                </h3>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="w-8 h-8 rounded-lg bg-[#eee8dd] text-[#171717] flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEditProduct} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-[#444] mb-1">Item Name</label>
                  <input
                    required
                    value={editingProduct.name}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, name: e.target.value })
                    }
                    className="w-full bg-[#f9f7f2] border border-[#ddd] rounded-lg px-3 py-2 outline-none focus:border-[#ef531d]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-[#444] mb-1">Brand / Seller</label>
                    <input
                      required
                      value={editingProduct.brand}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, brand: e.target.value })
                      }
                      className="w-full bg-[#f9f7f2] border border-[#ddd] rounded-lg px-3 py-2 outline-none focus:border-[#ef531d]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#444] mb-1">Price (₹)</label>
                    <input
                      required
                      type="number"
                      value={editingProduct.price}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          price: Number(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-[#f9f7f2] border border-[#ddd] rounded-lg px-3 py-2 outline-none focus:border-[#ef531d]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#444] mb-1">Direct Image URL</label>
                  <input
                    required
                    type="url"
                    value={editingProduct.img}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, img: e.target.value })
                    }
                    className="w-full bg-[#f9f7f2] border border-[#ddd] rounded-lg px-3 py-2 outline-none focus:border-[#ef531d]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#444] mb-1">Category</label>
                  <input
                    required
                    value={editingProduct.cat}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, cat: e.target.value })
                    }
                    className="w-full bg-[#f9f7f2] border border-[#ddd] rounded-lg px-3 py-2 outline-none focus:border-[#ef531d]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#444] mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={editingProduct.desc}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, desc: e.target.value })
                    }
                    className="w-full bg-[#f9f7f2] border border-[#ddd] rounded-lg px-3 py-2 outline-none focus:border-[#ef531d]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-[#ef531d] hover:bg-[#d84512] text-white py-2.5 rounded-xl font-bold uppercase text-xs"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="bg-[#eee8dd] hover:bg-[#ded6c9] text-[#171717] py-2.5 px-4 rounded-xl font-bold uppercase text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
