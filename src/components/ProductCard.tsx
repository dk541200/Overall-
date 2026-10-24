import React, { useState } from 'react';
import { Heart, Eye, CheckCircle2, Edit3, Trash2 } from 'lucide-react';
import type { Product } from '../types/index.ts';
import { formatMoney } from '../utils/autoflux.ts';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (id: number) => void;
  onOpenFitment: (product: Product) => void;
  adminMode?: boolean;
  onEditListing?: (id: number) => void;
  onDeleteListing?: (id: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onToggleWishlist,
  onOpenFitment,
  adminMode = false,
  onEditListing,
  onDeleteListing,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article className="bg-[#fffdf8] text-[#191817] border border-[#e6ded2] rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
      {/* Product Image Area */}
      <div className="relative h-48 sm:h-52 bg-[#eee8dd] overflow-hidden flex items-center justify-center">
        {!imageFailed ? (
          <img
            src={product.img}
            alt={product.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#eee8dd] to-[#ded6c9] text-center">
            <span className="font-display font-black text-xl text-[#6c6862] uppercase tracking-wider">
              {product.brand}
            </span>
            <span className="text-xs text-[#827c73] mt-1">{product.name}</span>
          </div>
        )}

        {/* Tag */}
        {product.tag && (
          <span className="absolute top-3 left-3 bg-[#ef531d] text-white text-[0.62rem] font-black uppercase px-2.5 py-1 rounded shadow-sm">
            {product.tag}
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-colors ${
            isWishlisted
              ? 'bg-[#ef531d] text-white'
              : 'bg-white/90 text-[#171717] hover:bg-white hover:text-[#ef531d]'
          }`}
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        >
          <Heart className="w-4 h-4" fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Info Container */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Brand & Category */}
        <div className="text-[0.68rem] font-black uppercase tracking-wider text-[#797268] mb-1">
          {product.brand} · {product.cat}
        </div>

        {/* Title */}
        <h3 className="font-bold text-sm sm:text-base text-[#191817] leading-snug line-clamp-2 mb-2">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-[#69645d] line-clamp-2 leading-relaxed mb-3 flex-1">
          {product.desc}
        </p>

        {/* Rating note */}
        <div className="text-[0.68rem] text-[#d88319] font-medium flex items-center gap-1.5 mb-2">
          <span>★★★★★</span>
          <span className="text-[#777168]">Verified specification</span>
        </div>

        {/* Price Row */}
        <div className="flex items-baseline gap-2 mb-2 font-mono tabular-nums">
          <span className="font-display text-xl sm:text-2xl font-black text-[#191817]">
            {formatMoney(product.price)}
          </span>
          {product.old > product.price && (
            <del className="text-xs text-[#8d8f94] font-normal">
              {formatMoney(product.old)}
            </del>
          )}
        </div>

        {/* Fit note */}
        <div className="flex items-center gap-1 text-[0.68rem] text-[#69645d] mb-4">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#ef531d] shrink-0" />
          <span>Vehicle fitment check recommended</span>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#171717]/5">
          <button
            onClick={() => onOpenFitment(product)}
            className="bg-[#ef531d] hover:bg-[#d84512] text-white text-[0.72rem] font-black uppercase py-2.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm"
          >
            <span>SEE ON VEHICLE</span>
          </button>
          <button
            onClick={() => onOpenFitment(product)}
            className="bg-[#24211d] hover:bg-[#38342e] text-white text-[0.72rem] font-black uppercase py-2.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>DETAILS</span>
          </button>
        </div>

        {/* Admin controls */}
        {adminMode && (
          <div className="mt-3 pt-3 border-t border-dashed border-[#ef531d]/30 flex items-center gap-2">
            <button
              onClick={() => onEditListing?.(product.id)}
              className="flex-1 inline-flex items-center justify-center gap-1 bg-[#222] hover:bg-[#111] text-white text-[0.68rem] font-black uppercase py-1.5 px-2 rounded"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => onDeleteListing?.(product.id)}
              className="flex-1 inline-flex items-center justify-center gap-1 bg-[#ffe4dc] hover:bg-[#ffd2c4] text-[#a72a08] text-[0.68rem] font-black uppercase py-1.5 px-2 rounded"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    </article>
  );
};
