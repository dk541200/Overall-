import React from 'react';
import { ArrowUpRight, Compass, ShieldCheck } from 'lucide-react';

interface HeroProps {
  heroImageUrl: string;
  adminMode: boolean;
  onExitAdmin: () => void;
  onExploreProducts: () => void;
  onOpenPreview: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  heroImageUrl,
  adminMode,
  onExitAdmin,
  onExploreProducts,
  onOpenPreview,
}) => {
  return (
    <div>
      {/* Admin indicator bar */}
      {adminMode && (
        <div className="bg-[#ef531d] text-white px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm font-bold shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>ADMIN MODE ACTIVE — Direct listing editing & pre-order management enabled</span>
          </div>
          <button
            onClick={onExitAdmin}
            className="bg-white text-[#ef531d] hover:bg-[#fff5f0] px-3 py-1 rounded text-xs font-black uppercase transition-colors"
          >
            Exit Admin
          </button>
        </div>
      )}

      {/* Main Hero Container */}
      <section
        className="relative min-h-[520px] sm:min-h-[560px] flex items-center bg-cover bg-center overflow-hidden transition-all duration-500"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(247, 244, 238, 0.96) 0%, rgba(247, 244, 238, 0.88) 46%, rgba(247, 244, 238, 0.2) 100%), url('${heroImageUrl}')`,
        }}
      >
        {/* Subtle bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#f7f4ee] to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-20 relative z-10 w-full">
          <div className="max-w-2xl">
            {/* Kicker */}
            <div className="inline-flex items-center gap-2 text-[#ef531d] text-xs font-black tracking-widest uppercase mb-3">
              <span className="w-6 h-0.5 bg-[#ef531d]" />
              Parts That Fit Your Drive
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-black text-[#171717] leading-[0.88] tracking-tight mb-6">
              UPGRADE YOUR <br />
              RIDE. <span className="text-[#ef531d]">OWN</span> <br />
              THE ROAD.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#514d47] max-w-xl leading-relaxed mb-8 font-normal">
              Discover car and bike accessories, explore genuine specifications, and preview how selected parts fit your vehicle before requesting a pre-order.
            </p>

            {/* Actions */}
            <div className="flex items-center flex-wrap gap-3 sm:gap-4 mb-8">
              <button
                onClick={onExploreProducts}
                className="inline-flex items-center justify-center gap-2 bg-[#ef531d] hover:bg-[#d84512] text-white px-6 py-3.5 rounded-lg font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-[#ef531d]/20 transition-all hover:-translate-y-0.5"
              >
                <span>EXPLORE PRODUCTS</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenPreview}
                className="inline-flex items-center justify-center gap-2 bg-[#fffdf8] hover:bg-[#f1ede5] text-[#171717] border border-[#29231d]/20 px-6 py-3.5 rounded-lg font-black text-xs sm:text-sm tracking-wide transition-all hover:-translate-y-0.5"
              >
                <Compass className="w-4 h-4 text-[#ef531d]" />
                <span>TRY VEHICLE PREVIEW</span>
              </button>
            </div>

            {/* Trust bullet points */}
            <div className="flex items-center flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm font-semibold text-[#33302b]">
              <span className="flex items-center gap-1.5">
                <span className="text-[#ef531d] font-black">✓</span> Vehicle-fit guidance
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-[#ef531d] font-black">✓</span> Clear product details
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-[#ef531d] font-black">✓</span> Pre-order request
              </span>
            </div>
          </div>
        </div>

        {/* Floating Side Badge */}
        <div className="hidden lg:block absolute right-8 bottom-12 z-10 bg-[#fffdf0]/90 backdrop-blur-md border-l-4 border-[#ef531d] p-5 shadow-xl rounded-r-lg max-w-xs">
          <div className="flex items-center gap-2 text-[#ef531d] mb-1">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[0.68rem] font-bold tracking-widest uppercase">Certified Fitment</span>
          </div>
          <b className="font-display text-3xl font-black text-[#191817] block leading-none">
            BUILT FOR YOUR RIDE.
          </b>
          <span className="text-xs text-[#6c665e] font-semibold mt-1 block">
            CAR · BIKE · SCOOTER ACCESSORIES
          </span>
        </div>
      </section>
    </div>
  );
};
