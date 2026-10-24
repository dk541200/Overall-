import React, { useState } from 'react';
import { ArrowLeft, Copy, ExternalLink, Calendar, Phone, Car, Clock, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import type { PreOrder } from '../types/index.ts';
import { formatMoney, generateWhatsAppMessage } from '../utils/autoflux.ts';

interface PreOrdersTrackerProps {
  orders: PreOrder[];
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
  onExploreProducts?: () => void;
}

export const PreOrdersTracker: React.FC<PreOrdersTrackerProps> = ({
  orders,
  isOpen,
  onClose,
  showToast,
  onExploreProducts,
}) => {
  if (!isOpen) return null;

  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed'>('all');

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'confirmed') return o.status === 'Confirmed';
    if (filterStatus === 'pending') return o.status !== 'Confirmed';
    return true;
  });

  const handleCopyAll = () => {
    if (!orders.length) {
      showToast('No pre-order requests to copy yet.');
      return;
    }
    const text = orders
      .map(
        (o) =>
          `${o.id} | ${o.product} | ${o.vehicle} | ${o.date} ${o.time} | ${o.name} | ${o.phone}`
      )
      .join('\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => showToast('All requests copied to clipboard.'))
        .catch(() => showToast('Could not access clipboard.'));
    } else {
      showToast('Clipboard access unavailable.');
    }
  };

  const handleCopySingle = (order: PreOrder) => {
    const text = `${order.id} | ${order.product} | ${order.vehicle} | ${order.date} ${order.time} | ${order.name} | ${order.phone}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => showToast(`Copied details for ${order.id}`))
        .catch(() => showToast('Could not access clipboard.'));
    }
  };

  const handleOpenWhatsApp = (order: PreOrder) => {
    const text = generateWhatsAppMessage(order);
    const shopNumber = '919876543210';
    const url = `https://wa.me/${shopNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#f7f4ee] overflow-y-auto animate-fade-in text-[#171717]"
      role="region"
      aria-label="Pre-order tracker page"
    >
      {/* Top Header Bar */}
      <header className="sticky top-0 z-20 bg-[#fffdf8]/90 backdrop-blur-md border-b border-[#171717]/10 px-4 sm:px-8 py-3.5 sm:py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#171717] hover:text-[#ef531d] transition-colors py-1 px-2.5 rounded-lg bg-[#eee8dd] hover:bg-[#ded6c9]"
            aria-label="Return to store"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#777168] font-bold hidden sm:inline">
              Device Storage
            </span>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-[#eee8dd] hover:bg-[#ded6c9] text-[#171717] flex items-center justify-center transition-colors"
              aria-label="Close page"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Full-Page Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-10 pb-32">
        {/* Page Heading */}
        <div className="border-b border-[#171717]/10 pb-6 mb-8">
          <div className="inline-flex items-center gap-2 text-[#ef531d] text-xs font-black tracking-widest uppercase mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Customer Portal</span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-black text-[#171717] leading-none mb-3">
            PRE-ORDER <span className="text-[#ef531d]">TRACKER.</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#696862] max-w-2xl leading-relaxed">
            Review status updates and compatibility checks for your requested car and bike parts. The shop reviews these details locally and confirms stock and scheduling.
          </p>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mt-6 flex-wrap">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                filterStatus === 'all'
                  ? 'bg-[#ef531d] text-white shadow-sm'
                  : 'bg-[#fffdf8] text-[#555] border border-[#d9d1c1] hover:bg-[#eee8dd]'
              }`}
            >
              All Requests ({orders.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                filterStatus === 'pending'
                  ? 'bg-[#ef531d] text-white shadow-sm'
                  : 'bg-[#fffdf8] text-[#555] border border-[#d9d1c1] hover:bg-[#eee8dd]'
              }`}
            >
              Pending ({orders.filter((o) => o.status !== 'Confirmed').length})
            </button>
            <button
              onClick={() => setFilterStatus('confirmed')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                filterStatus === 'confirmed'
                  ? 'bg-[#ef531d] text-white shadow-sm'
                  : 'bg-[#fffdf8] text-[#555] border border-[#d9d1c1] hover:bg-[#eee8dd]'
              }`}
            >
              Confirmed ({orders.filter((o) => o.status === 'Confirmed').length})
            </button>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center bg-[#fffdf8] rounded-2xl border border-dashed border-[#d8cfc1]">
              <div className="w-12 h-12 rounded-full bg-[#f5ede0] text-[#ef531d] flex items-center justify-center mx-auto mb-3">
                <Car className="w-6 h-6" />
              </div>
              <h3 className="font-display text-2xl font-black text-[#171717]">
                {orders.length === 0 ? 'No Pre-Orders Placed Yet' : 'No matching requests'}
              </h3>
              <p className="text-xs text-[#777168] max-w-md mx-auto mt-2 leading-relaxed">
                {orders.length === 0
                  ? 'Browse our featured parts and accessories catalog, choose your ride, and submit an availability request.'
                  : 'No requests match the selected filter status.'}
              </p>
              {onExploreProducts && (
                <button
                  onClick={() => {
                    onClose();
                    onExploreProducts();
                  }}
                  className="mt-5 inline-flex items-center gap-2 bg-[#ef531d] hover:bg-[#d84512] text-white px-5 py-2.5 rounded-lg font-bold text-xs uppercase transition-colors"
                >
                  Explore Store Catalog ↗
                </button>
              )}
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isConfirmed = order.status === 'Confirmed';
              return (
                <article
                  key={order.id}
                  className="bg-[#fffdf8] border border-[#e5decb] rounded-2xl p-5 sm:p-6 hover:border-[#ef531d]/40 transition-all shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-xs font-mono font-black text-[#ef531d] bg-[#ef531d]/10 px-2 py-0.5 rounded">
                          {order.id}
                        </span>
                        <h2 className="font-display text-xl sm:text-2xl font-black text-[#191817]">
                          {order.product}
                        </h2>
                      </div>
                      <div className="text-xs text-[#797268] mt-1">
                        Listed Price: <strong className="text-[#191817]">{formatMoney(order.price)}</strong>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-black uppercase px-3 py-1.5 rounded-full ${
                          isConfirmed
                            ? 'bg-[#dcf5df] text-[#176b2b] border border-[#b2e5ba]'
                            : 'bg-[#eee9df] text-[#686057] border border-[#ddd3c3]'
                        }`}
                      >
                        {isConfirmed && <CheckCircle2 className="w-3.5 h-3.5" />}
                        <span>{order.status}</span>
                      </span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-[#fbf9f4] border border-[#eee6d8] rounded-xl text-xs text-[#524e47] my-4">
                    <div className="flex items-start gap-2">
                      <Car className="w-4 h-4 text-[#ef531d] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[0.68rem] text-[#857d72] block font-bold uppercase">Vehicle</span>
                        <strong>{order.vehicle} {order.year ? `(${order.year})` : ''}</strong>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 text-[#ef531d] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[0.68rem] text-[#857d72] block font-bold uppercase">Contact</span>
                        <strong>{order.name}</strong>
                        <div className="text-[0.72rem] text-[#666]">{order.phone}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-[#ef531d] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[0.68rem] text-[#857d72] block font-bold uppercase">Requested Date</span>
                        <strong>{order.date}</strong>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-[#ef531d] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[0.68rem] text-[#857d72] block font-bold uppercase">Preferred Time</span>
                        <strong>{order.time || 'Any convenient time'}</strong>
                      </div>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="text-xs text-[#6a655d] bg-[#f5efe5] p-3 rounded-lg mb-4">
                      <strong>Customer Notes:</strong> {order.notes}
                    </div>
                  )}

                  {/* Action row */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pt-3 border-t border-[#171717]/5">
                    <button
                      type="button"
                      onClick={() => handleCopySingle(order)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6a655d] hover:text-[#171717] transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Details</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenWhatsApp(order)}
                      className="inline-flex items-center gap-1.5 bg-[#1e7e34] hover:bg-[#165c26] text-white px-3.5 py-1.5 rounded-lg text-xs font-black uppercase transition-colors shadow-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Inquire Via WhatsApp</span>
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* Bottom Toolbar */}
        {orders.length > 0 && (
          <div className="mt-8 p-4 sm:p-5 bg-[#fffdf8] border border-[#e5decb] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-[#777168] font-medium text-center sm:text-left">
              Total {orders.length} request(s) stored on this device.
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCopyAll}
                className="inline-flex items-center gap-2 bg-[#eee8dd] hover:bg-[#e0d7c9] text-[#201d19] px-4 py-2 rounded-xl text-xs font-black uppercase transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy All Requests</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
