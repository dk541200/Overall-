import React from 'react';
import { PlusCircle, Layers, LogOut, LayoutDashboard, ClipboardList, Wrench } from 'lucide-react';
import type { CustomerPage, AdminTab } from '../types/index.ts';

interface BottomNavProps {
  adminMode: boolean;
  activeCustomerPage: CustomerPage;
  activeAdminTab: AdminTab;
  onSelectCustomerPage: (page: CustomerPage) => void;
  onOpenPreview: () => void;
  onSelectAdminTab: (tab: AdminTab) => void;
  onLogoutAdmin: () => void;
  orderCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  adminMode,
  activeCustomerPage,
  activeAdminTab,
  onSelectCustomerPage,
  onOpenPreview,
  onSelectAdminTab,
  onLogoutAdmin,
  orderCount,
}) => {
  // ADMIN NAVIGATION MODE
  if (adminMode) {
    const adminNavItems: { id: AdminTab | 'logout'; label: string; icon: React.ReactNode }[] = [
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { id: 'add', label: 'Add Item', icon: <PlusCircle className="w-4 h-4" /> },
      { id: 'listings', label: 'Listings', icon: <Layers className="w-4 h-4" /> },
      { id: 'orders', label: 'Orders', icon: <ClipboardList className="w-4 h-4" /> },
      { id: 'chats', label: 'Problems', icon: <Wrench className="w-4 h-4" /> },
      { id: 'logout', label: 'Log Out', icon: <LogOut className="w-4 h-4" /> },
    ];

    return (
      <nav
        aria-label="Admin quick navigation"
        className="fixed bottom-0 inset-x-0 z-40 bg-[#1c1815]/95 backdrop-blur-2xl border-t-2 border-[#ef531d] text-white shadow-[0_-10px_35px_rgba(0,0,0,0.45)] px-2 py-1.5 pb-[calc(0.4rem+env(safe-area-inset-bottom))]"
      >
        <div className="grid grid-cols-6 max-w-lg mx-auto gap-1">
          {adminNavItems.map((item) => {
            const isLogout = item.id === 'logout';
            const isActive = !isLogout && activeAdminTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (isLogout) {
                    onLogoutAdmin();
                  } else {
                    onSelectAdminTab(item.id as AdminTab);
                  }
                }}
                className={`flex flex-col items-center justify-center gap-1 py-1 px-0.5 min-h-[46px] rounded-xl transition-all duration-200 select-none ${
                  isLogout
                    ? 'text-[#ef531d] hover:bg-white/10 active:scale-95'
                    : isActive
                    ? 'bg-[#ef531d] text-white font-black shadow-md shadow-[#ef531d]/30 scale-[1.02]'
                    : 'text-[#d4ceca] hover:text-white hover:bg-white/5 active:scale-95'
                }`}
              >
                <div className="shrink-0">{item.icon}</div>
                <span className="text-[0.6rem] font-bold tracking-tight uppercase truncate max-w-full">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  // CUSTOMER NAVIGATION MODE: Exact Crystal-Glass matching reference design
  return (
    <nav className="af-crystal-nav" aria-label="Customer quick navigation">
      {/* 1. Home */}
      <button
        type="button"
        data-tab="home"
        onClick={() => onSelectCustomerPage('home')}
        className={`af-crystal-btn ${activeCustomerPage === 'home' ? 'is-active' : ''}`}
        aria-label="Home"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 10 9-7 9 7" />
          <path d="M5 9v12h14V9M9 21v-8h6v8" />
        </svg>
        <span>Home</span>
      </button>

      {/* 2. Shop */}
      <button
        type="button"
        data-tab="shop"
        onClick={() => {
          onSelectCustomerPage('home');
          setTimeout(() => {
            const el = document.getElementById('products-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 50);
        }}
        className="af-crystal-btn"
        aria-label="Shop"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        <span>Shop</span>
      </button>

      {/* 3. Preview */}
      <button
        type="button"
        data-tab="preview"
        onClick={onOpenPreview}
        className="af-crystal-btn"
        aria-label="Preview"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7V4h3M18 4h3v3M21 17v3h-3M6 20H3v-3" />
          <circle cx="12" cy="12" r="5" />
        </svg>
        <span>Preview</span>
      </button>

      {/* 4. Orders */}
      <button
        type="button"
        data-tab="orders"
        onClick={() => onSelectCustomerPage('orders')}
        className={`af-crystal-btn ${activeCustomerPage === 'orders' ? 'is-active' : ''}`}
        aria-label="Orders"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 7h16l-1 14H5L4 7Z" />
          <path d="M9 9V6a3 3 0 0 1 6 0v3" />
        </svg>
        <span>Orders</span>
        {orderCount > 0 && <span className="af-crystal-badge">{orderCount}</span>}
      </button>

      {/* 5. Mechanic */}
      <button
        type="button"
        data-tab="mechanic"
        onClick={() => onSelectCustomerPage('mechanic')}
        className={`af-crystal-btn ${activeCustomerPage === 'mechanic' ? 'is-active' : ''}`}
        aria-label="Mechanic"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 7a5 5 0 0 0-7 7L3 18l3 3 4-4a5 5 0 0 0 7-7l-4 4-3-3 4-4Z" />
        </svg>
        <span>Mechanic</span>
      </button>
    </nav>
  );
};
