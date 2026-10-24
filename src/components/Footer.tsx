import React from 'react';
import { ArrowUp } from 'lucide-react';

interface FooterProps {
  onGoHome: () => void;
  onGoShop: () => void;
  onOpenPreview: () => void;
  onOpenOrders: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onGoHome,
  onGoShop,
  onOpenPreview,
  onOpenOrders,
}) => {
  const currentYear = new Date().getFullYear();

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#eee9df] text-[#201d19] border-t border-[#171717]/10 pt-14 pb-28 sm:pb-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-[#171717]/10">
          {/* Brand & info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="brand-mark w-8 h-7 bg-[#ef531d] text-white flex items-center justify-center font-black text-base shadow-sm">
                A
              </div>
              <span className="font-display text-2xl font-black text-[#171717] tracking-wider">
                AUTOFLUX
              </span>
            </div>
            <p className="text-xs text-[#6b645b] leading-relaxed max-w-xs">
              Curated car and bike accessories, visual fitment guidance, and direct workshop pre-order support. Built for drivers and riders.
            </p>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-display text-base font-black text-[#171717] tracking-wider uppercase mb-3">
              SHOP
            </h4>
            <div className="flex flex-col gap-2 text-xs text-[#6b645b]">
              <button
                onClick={onGoShop}
                className="text-left hover:text-[#ef531d] transition-colors"
              >
                Featured Products
              </button>
              <button
                onClick={onGoShop}
                className="text-left hover:text-[#ef531d] transition-colors"
              >
                Categories
              </button>
              <button
                onClick={onOpenPreview}
                className="text-left hover:text-[#ef531d] transition-colors"
              >
                Vehicle 3D Preview
              </button>
              <button
                onClick={onOpenOrders}
                className="text-left hover:text-[#ef531d] transition-colors"
              >
                Track Pre-Orders
              </button>
            </div>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-display text-base font-black text-[#171717] tracking-wider uppercase mb-3">
              CUSTOMER CARE
            </h4>
            <div className="flex flex-col gap-2 text-xs text-[#6b645b]">
              <button
                onClick={onOpenOrders}
                className="text-left hover:text-[#ef531d] transition-colors"
              >
                Pre-Order Support
              </button>
              <span className="hover:text-[#ef531d] cursor-pointer">
                Shipping & Delivery
              </span>
              <span className="hover:text-[#ef531d] cursor-pointer">
                Fitment Guarantee & Returns
              </span>
              <span className="hover:text-[#ef531d] cursor-pointer">
                Workshop Consultation
              </span>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-display text-base font-black text-[#171717] tracking-wider uppercase mb-3">
              CONTACT & WORKSHOP
            </h4>
            <div className="flex flex-col gap-1.5 text-xs text-[#6b645b] leading-relaxed mb-4">
              <span>Phone: +91 98765 43210</span>
              <span>Workshop: Auto Hub, Industrial Way</span>
              <span>Hours: Mon – Sat, 9:00 AM – 7:30 PM</span>
            </div>
            <button
              onClick={handleScrollTop}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ef531d] hover:text-[#d84512] transition-colors"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#73767d]">
          <span>
            © {currentYear} AUTOFLUX. Drive. Style. Upgrade. All specifications subject to vehicle verification.
          </span>
          <span className="font-semibold text-[#ef531d]">
            AUTOFLUX PROTOTYPE STORE
          </span>
        </div>
      </div>
    </footer>
  );
};
