import React, { useState } from 'react';
import { X, RotateCcw, RotateCw, ArrowUp, ArrowDown, RefreshCw, Send, CheckCircle2 } from 'lucide-react';
import type { Product, PreOrder } from '../types/index.ts';
import { formatMoney, validatePreOrder } from '../utils/autoflux.ts';

interface FitmentModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onSubmitPreOrder: (order: PreOrder) => void;
  showToast: (msg: string) => void;
}

export const FitmentModal: React.FC<FitmentModalProps> = ({
  isOpen,
  product,
  onClose,
  onSubmitPreOrder,
  showToast,
}) => {
  if (!isOpen || !product) return null;

  const [rotation, setRotation] = useState(0);
  const [tilt, setTilt] = useState(0);

  // Vehicle state
  const [vehicleType, setVehicleType] = useState('Car');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [fitmentNotes, setFitmentNotes] = useState('');
  const [fitResult, setFitResult] = useState<string | null>(null);

  // Pre-order customer state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('Any convenient time');

  const handleRotateLeft = () => setRotation((r) => r - 30);
  const handleRotateRight = () => setRotation((r) => r + 30);
  const handleTiltUp = () => setTilt((t) => Math.max(-45, t - 10));
  const handleTiltDown = () => setTilt((t) => Math.min(45, t + 10));
  const handleReset = () => {
    setRotation(0);
    setTilt(0);
  };

  const handleCheckFit = () => {
    if (!vehicleType || !vehicleMake.trim() || !vehicleModel.trim()) {
      showToast('Please select vehicle type and enter both make and model.');
      return;
    }
    const resultMsg = `Vehicle details registered: ${vehicleType} · ${vehicleMake.trim()} ${vehicleModel.trim()}${
      vehicleYear ? ` (${vehicleYear})` : ''
    }. Previewing fitment angle for this setup.`;
    setFitResult(resultMsg);
    showToast('Vehicle specifications applied to visual preview.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validatePreOrder({
      vehicleType,
      vehicleMake,
      vehicleModel,
      customerName,
      customerPhone,
      preferredDate,
    });

    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      showToast(firstError || 'Please fill in all required fields.');
      return;
    }

    const orderId = 'AF-' + Date.now().toString().slice(-6);
    const newOrder: PreOrder = {
      id: orderId,
      product: product.name,
      price: product.price,
      vehicle: `${vehicleType} · ${vehicleMake.trim()} ${vehicleModel.trim()}`,
      year: vehicleYear || undefined,
      date: preferredDate,
      time: preferredTime,
      name: customerName.trim(),
      phone: customerPhone.trim(),
      notes: fitmentNotes.trim() || undefined,
      status: 'Request saved on this device',
      createdAt: Date.now(),
    };

    onSubmitPreOrder(newOrder);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fitModalTitle"
    >
      <div className="bg-[#fffdf8] text-[#191817] border border-[#e3dbcf] rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl relative my-auto">
        {/* Modal Header */}
        <div className="sticky top-0 z-20 bg-[#fffdf8]/95 backdrop-blur-md px-6 py-4 border-b border-[#171717]/10 flex items-center justify-between">
          <div>
            <span className="text-[0.68rem] font-black uppercase text-[#ef531d] tracking-widest block">
              Vehicle Fitment & Pre-Order
            </span>
            <h2 id="fitModalTitle" className="font-display text-2xl sm:text-3xl font-black text-[#171717]">
              SEE IT ON <span className="text-[#ef531d]">YOUR RIDE.</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-[#eee8dd] hover:bg-[#e0d8cc] text-[#171717] flex items-center justify-center transition-colors"
            aria-label="Close fitment preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Left: 3D-Perspective Rotatable Preview */}
          <div className="flex flex-col">
            <div className="relative bg-gradient-to-b from-[#f1ede5] to-[#e7dfd3] rounded-xl min-h-[300px] sm:min-h-[340px] flex items-center justify-center overflow-hidden border border-[#171717]/10 p-6 shadow-inner">
              {/* Product Image with dynamic perspective */}
              <img
                src={product.img}
                alt={product.name}
                style={{
                  transform: `perspective(750px) rotateY(${rotation}deg) rotateX(${tilt}deg)`,
                  transition: 'transform 0.15s ease-out',
                }}
                className="max-h-64 max-w-full object-contain filter drop-shadow-xl"
              />

              {/* Angle Badge */}
              <div className="absolute left-3 bottom-3 bg-[#fffdf0]/90 backdrop-blur-md border border-[#d8cfc1] px-3 py-1.5 rounded-md text-[0.68rem] font-bold text-[#29241e] shadow-sm">
                <span>{product.name.toUpperCase()} · DEMO VISUAL</span>
              </div>
            </div>

            {/* Rotation Controls */}
            <div className="flex items-center justify-center flex-wrap gap-2 mt-4">
              <button
                type="button"
                onClick={handleRotateLeft}
                className="inline-flex items-center gap-1 bg-[#f0e9de] hover:bg-[#e3dbcd] text-[#211d19] border border-[#ded4c5] px-3 py-1.5 rounded-md text-xs font-bold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Rotate Left</span>
              </button>
              <button
                type="button"
                onClick={handleRotateRight}
                className="inline-flex items-center gap-1 bg-[#f0e9de] hover:bg-[#e3dbcd] text-[#211d19] border border-[#ded4c5] px-3 py-1.5 rounded-md text-xs font-bold transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Rotate Right</span>
              </button>
              <button
                type="button"
                onClick={handleTiltUp}
                className="inline-flex items-center gap-1 bg-[#f0e9de] hover:bg-[#e3dbcd] text-[#211d19] border border-[#ded4c5] px-3 py-1.5 rounded-md text-xs font-bold transition-colors"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>Tilt Up</span>
              </button>
              <button
                type="button"
                onClick={handleTiltDown}
                className="inline-flex items-center gap-1 bg-[#f0e9de] hover:bg-[#e3dbcd] text-[#211d19] border border-[#ded4c5] px-3 py-1.5 rounded-md text-xs font-bold transition-colors"
              >
                <ArrowDown className="w-3.5 h-3.5" />
                <span>Tilt Down</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 bg-[#fff] hover:bg-[#faf6ee] text-[#ef531d] border border-[#ef531d]/30 px-3 py-1.5 rounded-md text-xs font-black transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            <p className="text-[0.72rem] text-[#797168] mt-3 text-center leading-relaxed">
              Interactive prototype: adjust view angles to inspect styling. Compatibility must be verified by the workshop before ordering.
            </p>
          </div>

          {/* Right: Vehicle Fitment & Pre-Order Form */}
          <div className="flex flex-col">
            {/* Product Summary */}
            <div className="pb-4 border-b border-[#171717]/10 mb-4">
              <span className="text-[0.65rem] font-black uppercase text-[#ef531d] tracking-wider">
                Selected Item
              </span>
              <h3 className="font-bold text-lg text-[#191817] leading-snug">
                {product.name}
              </h3>
              <p className="text-xs text-[#625c54] mt-1 leading-relaxed">
                {product.desc}
              </p>
              <div className="font-display text-2xl font-black text-[#191817] mt-2">
                {formatMoney(product.price)}
              </div>
            </div>

            {/* Vehicle Inputs */}
            <div className="space-y-3">
              <span className="text-[0.68rem] font-black uppercase text-[#171717] tracking-wider block">
                1. Your Vehicle Details
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[0.72rem] font-bold text-[#403a33] mb-1">
                    Vehicle Type *
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full bg-white text-[#201d19] border border-[#ddd3c4] rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-[#ef531d]"
                  >
                    <option value="Car">Car</option>
                    <option value="Bike / Motorcycle">Bike / Motorcycle</option>
                    <option value="Scooter">Scooter</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[0.72rem] font-bold text-[#403a33] mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    min="1980"
                    max="2035"
                    placeholder="e.g. 2023"
                    value={vehicleYear}
                    onChange={(e) => setVehicleYear(e.target.value)}
                    className="w-full bg-white text-[#201d19] border border-[#ddd3c4] rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-[#ef531d]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[0.72rem] font-bold text-[#403a33] mb-1">
                    Make / Brand *
                  </label>
                  <input
                    placeholder="e.g. Honda, Maruti Suzuki"
                    value={vehicleMake}
                    onChange={(e) => setVehicleMake(e.target.value)}
                    className="w-full bg-white text-[#201d19] border border-[#ddd3c4] rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-[#ef531d]"
                  />
                </div>
                <div>
                  <label className="block text-[0.72rem] font-bold text-[#403a33] mb-1">
                    Model / Variant *
                  </label>
                  <input
                    placeholder="e.g. City V CVT / Activa"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    className="w-full bg-white text-[#201d19] border border-[#ddd3c4] rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-[#ef531d]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[0.72rem] font-bold text-[#403a33] mb-1">
                  Extra Details / Fitment Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Trim level, current accessories, colour preference..."
                  value={fitmentNotes}
                  onChange={(e) => setFitmentNotes(e.target.value)}
                  className="w-full bg-white text-[#201d19] border border-[#ddd3c4] rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-[#ef531d]"
                />
              </div>

              <button
                type="button"
                onClick={handleCheckFit}
                className="w-full bg-[#eee8dd] hover:bg-[#e2d8ca] text-[#201d19] font-black text-xs uppercase py-2.5 rounded-lg transition-colors border border-[#d9cebe]"
              >
                Apply Vehicle To Preview
              </button>

              {fitResult && (
                <div className="p-2.5 bg-[#eef7ee] border border-[#c4e3c4] rounded-lg flex items-start gap-2 text-xs text-[#1e6128]">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{fitResult}</span>
                </div>
              )}
            </div>

            {/* Pre-Order Section */}
            <form onSubmit={handleSubmit} className="mt-5 pt-4 border-t border-[#171717]/10 space-y-3">
              <span className="text-[0.68rem] font-black uppercase text-[#ef531d] tracking-wider block">
                2. Request Pre-Order / Availability Check
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[0.72rem] font-bold text-[#403a33] mb-1">
                    Your Name *
                  </label>
                  <input
                    required
                    placeholder="Full name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-white text-[#201d19] border border-[#ddd3c4] rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-[#ef531d]"
                  />
                </div>
                <div>
                  <label className="block text-[0.72rem] font-bold text-[#403a33] mb-1">
                    Phone Number *
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="Contact number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-white text-[#201d19] border border-[#ddd3c4] rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-[#ef531d]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[0.72rem] font-bold text-[#403a33] mb-1">
                    Preferred Date *
                  </label>
                  <input
                    required
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full bg-white text-[#201d19] border border-[#ddd3c4] rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-[#ef531d]"
                  />
                </div>
                <div>
                  <label className="block text-[0.72rem] font-bold text-[#403a33] mb-1">
                    Preferred Time
                  </label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full bg-white text-[#201d19] border border-[#ddd3c4] rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-[#ef531d]"
                  >
                    <option>Any convenient time</option>
                    <option>Morning</option>
                    <option>Afternoon</option>
                    <option>Evening</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#ef531d] hover:bg-[#d84512] text-white font-black text-xs uppercase py-3 rounded-lg transition-all shadow-md shadow-[#ef531d]/20 flex items-center justify-center gap-2 mt-2"
              >
                <Send className="w-4 h-4" />
                <span>REQUEST PRE-ORDER ↗</span>
              </button>

              <p className="text-[0.68rem] text-[#797168] leading-tight text-center">
                Request details are saved in this browser and can be copied or opened in WhatsApp to verify stock.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
