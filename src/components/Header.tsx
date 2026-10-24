import React from 'react';
import { Search, Heart, ClipboardList } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  wishlistCount: number;
  orderCount: number;
  onOpenWishlist: () => void;
  onOpenOrders: () => void;
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  wishlistCount,
  orderCount,
  onOpenWishlist,
  onOpenOrders,
  onGoHome,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#fffdf0]/90 backdrop-blur-md border-b border-[#171717]/10 transition-all">
      {/* Top micro banner */}
      <div className="bg-[#eee8dd] text-[#5f5a53] text-[0.72rem] py-2 border-b border-[#ded6c9] px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap gap-2 font-medium">
          <span className="flex items-center gap-1.5 font-semibold text-[#171717]">
            <span className="text-[#ef531d]">⚡</span> FREE DELIVERY ON SELECTED ORDERS · LOCAL FITMENT SUPPORT
          </span>
          <span className="hidden sm:inline tracking-wider uppercase text-[0.68rem] text-[#696862]">
            CAR & BIKE ACCESSORIES · FITMENT GUIDANCE
          </span>
        </div>
      </div>

      {/* Main navigation row */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-3 sm:gap-6">
        {/* Brand */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ef531d] rounded-md"
          aria-label="AUTOFLUX Home"
        >
          <div className="brand-mark w-9 h-8 bg-[#ef531d] text-white flex items-center justify-center font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
            A
          </div>
          <div>
            <span className="font-display text-2xl sm:text-3xl font-black tracking-wide text-[#171717] block leading-none">
              AUTOFLUX
            </span>
            <small className="text-[0.55rem] font-bold tracking-[0.22em] text-[#696862] uppercase block mt-0.5">
              DRIVE · STYLE · UPGRADE
            </small>
          </div>
        </button>

        {/* Search bar */}
        <form
          onSubmit={onSearchSubmit}
          className="flex-1 max-w-md hidden md:flex items-center bg-[#f3efe7] border border-[#e3dbcf] rounded-lg overflow-hidden focus-within:border-[#ef531d] focus-within:ring-1 focus-within:ring-[#ef531d] transition-all"
        >
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search parts, accessories, categories..."
            aria-label="Search parts and accessories"
            className="w-full bg-transparent text-[#171717] px-3.5 py-2 text-xs sm:text-sm placeholder:text-[#827c73] outline-none"
          />
          <button
            type="submit"
            className="bg-[#ef531d] hover:bg-[#d84512] text-white px-4 py-2 font-bold text-sm transition-colors flex items-center justify-center"
            aria-label="Submit search"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Action icons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Wishlist */}
          <button
            onClick={onOpenWishlist}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#f7f2e9] border border-[#e2d9cb] text-[#211f1c] hover:border-[#ef531d] hover:text-[#ef531d] flex items-center justify-center transition-all relative"
            aria-label={`View wishlist (${wishlistCount} items)`}
          >
            <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#ef531d] text-white text-[0.62rem] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Pre-Orders */}
          <button
            onClick={onOpenOrders}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#f7f2e9] border border-[#e2d9cb] text-[#211f1c] hover:border-[#ef531d] hover:text-[#ef531d] flex items-center justify-center transition-all relative"
            aria-label={`View pre-orders (${orderCount} items)`}
          >
            <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5" />
            {orderCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#ef531d] text-white text-[0.62rem] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                {orderCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="md:hidden px-4 pb-2.5">
        <form
          onSubmit={onSearchSubmit}
          className="flex items-center bg-[#f3efe7] border border-[#e3dbcf] rounded-lg overflow-hidden focus-within:border-[#ef531d]"
        >
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search parts, accessories, categories..."
            aria-label="Search parts"
            className="w-full bg-transparent text-[#171717] px-3 py-1.5 text-xs placeholder:text-[#827c73] outline-none"
          />
          <button
            type="submit"
            className="bg-[#ef531d] text-white px-3 py-1.5 font-bold text-xs"
            aria-label="Submit search"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </header>
  );
};
