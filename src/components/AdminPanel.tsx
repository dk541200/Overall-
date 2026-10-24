import React, { useState } from 'react';
import { X, Lock, PlusCircle, Image, Check, Trash2, Home, LogOut } from 'lucide-react';
import type { Product, PreOrder, MechanicChat } from '../types/index.ts';
import { formatMoney } from '../utils/autoflux.ts';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isAdminUnlocked: boolean;
  onUnlockAdmin: (password: string) => boolean | Promise<boolean>;
  onLogoutAdmin: () => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  heroImageUrl: string;
  onUpdateHeroImage: (url: string) => void;
  orders: PreOrder[];
  onConfirmOrder: (orderId: string) => void;
  onDeleteOrder: (orderId: string) => void;
  chats: MechanicChat[];
  onGoHome: () => void;
  showToast: (msg: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  isAdminUnlocked,
  onUnlockAdmin,
  onLogoutAdmin,
  onAddProduct,
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onUnlockAdmin(password);
    if (success) {
      setPassword('');
      showToast('Admin access granted.');
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

    // Reset form
    setName('');
    setBrand('');
    setPrice('');
    setImageUrl('');
    setYear('');
    setCondition('');
    setDescription('');
    showToast(listingType === 'used' ? 'Vehicle listing published.' : 'Product listing published.');
  };

  const handleSaveHero = () => {
    if (!newHeroUrl.trim()) {
      showToast('Please provide an image URL for the hero section.');
      return;
    }
    onUpdateHeroImage(newHeroUrl.trim());
    showToast('Hero section banner updated.');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#fffdf8] text-[#191817] border border-[#e3dbcf] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative my-auto p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-[#171717]/10">
          <div>
            <span className="text-[0.68rem] font-black uppercase text-[#ef531d] tracking-widest block">
              Owner Management
            </span>
            <h2 className="font-display text-3xl font-black text-[#171717]">
              ADMIN <span className="text-[#ef531d]">PANEL.</span>
            </h2>
            <p className="text-xs text-[#696862] mt-1">
              Add products or used vehicles, review pre-order requests, and monitor mechanic diagnostic logs.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-[#eee8dd] hover:bg-[#ded6c9] text-[#171717] flex items-center justify-center transition-colors shrink-0"
            aria-label="Close admin panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Password Screen if Locked */}
        {!isAdminUnlocked ? (
          <form onSubmit={handleLogin} className="max-w-md mx-auto my-12 p-6 bg-[#f7f3ea] border border-[#ded5c5] rounded-2xl text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#ef531d]/10 text-[#ef531d] flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-display text-2xl font-black text-[#171717]">
              ADMIN AUTHENTICATION
            </h3>
            <p className="text-xs text-[#696862]">
              Enter the workshop admin password to unlock management tools.
            </p>
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white text-[#171717] border border-[#d9d1c1] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#ef531d] text-center"
            />
            <button
              type="submit"
              className="w-full bg-[#ef531d] hover:bg-[#d84512] text-white py-3 rounded-xl font-black text-xs uppercase transition-colors shadow-md shadow-[#ef531d]/20"
            >
              Unlock Admin Portal
            </button>
          </form>
        ) : (
          /* Admin Unlocked Controls */
          <div className="space-y-8 mt-6">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between flex-wrap gap-3 p-4 bg-[#f6f2e8] border border-[#e3dac9] rounded-xl">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-600" />
                <span className="text-xs font-bold text-[#171717]">
                  Admin Session Active
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onGoHome();
                  }}
                  className="inline-flex items-center gap-1.5 bg-white border border-[#d4cbba] text-[#171717] hover:bg-[#f1ede3] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors"
                >
                  <Home className="w-3.5 h-3.5 text-[#ef531d]" />
                  <span>Edit Directly On Home</span>
                </button>
                <button
                  type="button"
                  onClick={onLogoutAdmin}
                  className="inline-flex items-center gap-1.5 bg-[#ef531d] hover:bg-[#d84512] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>

            {/* 1. Add Listing Form */}
            <section className="bg-white p-6 rounded-2xl border border-[#e5decb] shadow-sm">
              <div className="flex items-center gap-2 text-[#ef531d] text-xs font-black uppercase tracking-wider mb-2">
                <PlusCircle className="w-4 h-4" />
                <span>Add Listing</span>
              </div>
              <h3 className="font-display text-2xl font-black text-[#171717] mb-1">
                CREATE NEW SHOP ITEM
              </h3>
              <p className="text-xs text-[#696862] mb-5">
                List new auto parts, bike accessories, or second-hand vehicles for sale.
              </p>

              <form onSubmit={handleCreateListing} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[0.72rem] font-bold text-[#403a33] mb-1">
                      Listing Type *
                    </label>
                    <select
                      value={listingType}
                      onChange={(e) => setListingType(e.target.value as 'part' | 'used')}
                      className="w-full bg-[#f9f7f2] border border-[#dcd4c4] rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:border-[#ef531d]"
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
                      className="w-full bg-[#f9f7f2] border border-[#dcd4c4] rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:border-[#ef531d] disabled:opacity-60"
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[0.72rem] font-bold text-[#403a33] mb-1">
                      Item / Vehicle Name *
                    </label>
                    <input
                      required
                      placeholder="e.g. Carbon Rear Spoiler or Hyundai Creta 2021"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#f9f7f2] border border-[#dcd4c4] rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-[#ef531d]"
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
                      className="w-full bg-[#f9f7f2] border border-[#dcd4c4] rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-[#ef531d]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                      className="w-full bg-[#f9f7f2] border border-[#dcd4c4] rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-[#ef531d]"
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
                      className="w-full bg-[#f9f7f2] border border-[#dcd4c4] rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-[#ef531d]"
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
                      className="w-full bg-[#f9f7f2] border border-[#dcd4c4] rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-[#ef531d]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[0.72rem] font-bold text-[#403a33] mb-1">
                    Image URL *
                  </label>
                  <input
                    required
                    type="url"
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-[#f9f7f2] border border-[#dcd4c4] rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-[#ef531d]"
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
                    className="w-full bg-[#f9f7f2] border border-[#dcd4c4] rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-[#ef531d]"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-[#ef531d] hover:bg-[#d84512] text-white px-6 py-2.5 rounded-lg font-black text-xs uppercase transition-colors shadow-sm"
                >
                  Publish Listing to Store
                </button>
              </form>
            </section>

            {/* 2. Hero Image Customizer */}
            <section className="bg-white p-6 rounded-2xl border border-[#e5decb] shadow-sm">
              <div className="flex items-center gap-2 text-[#ef531d] text-xs font-black uppercase tracking-wider mb-2">
                <Image className="w-4 h-4" />
                <span>Storefront Appearance</span>
              </div>
              <h3 className="font-display text-2xl font-black text-[#171717] mb-1">
                HERO SECTION IMAGE
              </h3>
              <p className="text-xs text-[#696862] mb-4">
                Update the main hero banner background photo displayed at the top of the storefront.
              </p>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Paste direct image URL"
                  value={newHeroUrl}
                  onChange={(e) => setNewHeroUrl(e.target.value)}
                  className="flex-1 bg-[#f9f7f2] border border-[#dcd4c4] rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-[#ef531d]"
                />
                <button
                  type="button"
                  onClick={handleSaveHero}
                  className="bg-[#24211d] hover:bg-[#38342e] text-white px-4 py-2 rounded-lg text-xs font-black uppercase transition-colors shrink-0"
                >
                  Save Hero Image
                </button>
              </div>
            </section>

            {/* 3. Pre-Orders Management */}
            <section className="bg-white p-6 rounded-2xl border border-[#e5decb] shadow-sm">
              <h3 className="font-display text-2xl font-black text-[#171717] mb-1">
                CUSTOMER PRE-ORDERS · CONFIRM OR DELETE
              </h3>
              <p className="text-xs text-[#696862] mb-4">
                Review and update status on requests submitted by customers on this device.
              </p>

              {orders.length === 0 ? (
                <div className="p-6 bg-[#f8f5ee] rounded-xl text-center text-xs text-[#797168]">
                  No pre-order requests currently recorded.
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((o) => (
                    <article
                      key={o.id}
                      className="p-4 bg-[#faf7f0] border border-[#e3dacf] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-sm text-[#171717]">{o.product}</strong>
                          <span className="text-xs font-mono font-bold text-[#ef531d]">({o.id})</span>
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
                        <div className="text-xs text-[#625c52] mt-1 space-y-0.5">
                          <p>Customer: {o.name} · {o.phone}</p>
                          <p>Vehicle: {o.vehicle} {o.year ? `(${o.year})` : ''}</p>
                          <p>Preferred: {o.date} · {o.time} · Price: {formatMoney(o.price)}</p>
                          {o.notes && <p className="italic text-[#827a6e]">Notes: {o.notes}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {o.status !== 'Confirmed' && (
                          <button
                            type="button"
                            onClick={() => onConfirmOrder(o.id)}
                            className="inline-flex items-center gap-1 bg-[#1e7e34] hover:bg-[#165c26] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Confirm</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onDeleteOrder(o.id)}
                          className="inline-flex items-center gap-1 bg-[#ffe4dc] hover:bg-[#ffd2c4] text-[#a72a08] px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
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

            {/* 4. Mechanic Chats Log */}
            <section className="bg-white p-6 rounded-2xl border border-[#e5decb] shadow-sm">
              <h3 className="font-display text-2xl font-black text-[#171717] mb-1">
                MECHANIC CHAT INQUIRIES
              </h3>
              <p className="text-xs text-[#696862] mb-4">
                Transcripts of technical consultations submitted through the workshop chat.
              </p>

              {chats.length === 0 ? (
                <div className="p-6 bg-[#f8f5ee] rounded-xl text-center text-xs text-[#797168]">
                  No mechanic chats logged yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {chats.map((c, idx) => (
                    <article key={idx} className="p-4 bg-[#faf7f0] border border-[#e3dacf] rounded-xl">
                      <b className="text-xs font-bold text-[#ef531d] uppercase tracking-wide block mb-2">
                        Topic: {c.title}
                      </b>
                      <div className="space-y-1.5 text-xs text-[#38342e]">
                        {c.messages.map((m, mIdx) => (
                          <p key={mIdx}>
                            <span className="font-bold text-[#171717]">
                              {m.from === 'customer' ? 'Customer: ' : 'Mechanic: '}
                            </span>
                            {m.text}
                          </p>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
