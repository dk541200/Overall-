import React from 'react';
import { ArrowRight } from 'lucide-react';

interface CategoriesProps {
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  onExploreClick: () => void;
}

export const Categories: React.FC<CategoriesProps> = ({
  activeCategory,
  onSelectCategory,
  onExploreClick,
}) => {
  const categories = [
    {
      name: 'Interior',
      label: 'Interior & Seat Covers',
      img: 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&w=500&q=80',
    },
    {
      name: 'Cleaning',
      label: 'Cleaning & Care',
      img: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=500&q=80',
    },
    {
      name: 'Lighting',
      label: 'Lights & Electrical',
      img: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=500&q=80',
    },
    {
      name: 'Gadgets',
      label: 'Gadgets & Tech',
      img: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=500&q=80',
    },
    {
      name: 'Tools',
      label: 'Tools & Utility',
      img: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=500&q=80',
    },
    {
      name: 'Exterior',
      label: 'Exterior & Styling',
      img: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=500&q=80',
    },
  ];

  return (
    <section className="py-14 sm:py-20 bg-[#f7f4ee]">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-[#ef531d] text-xs font-black tracking-widest uppercase mb-2">
              <span className="w-5 h-0.5 bg-[#ef531d]" />
              Find your next upgrade
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-black text-[#171717]">
              SHOP BY <span className="text-[#ef531d]">CATEGORY.</span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#696862] max-w-md leading-relaxed">
            Explore parts and accessories by type. Product availability and vehicle compatibility should be confirmed before ordering.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => onSelectCategory(isSelected ? '' : cat.name)}
                className={`group relative text-left bg-[#fffdf8] border rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
                  isSelected
                    ? 'border-[#ef531d] ring-2 ring-[#ef531d]/30'
                    : 'border-[#171717]/10 hover:border-[#ef531d]/50'
                }`}
              >
                <div className="h-28 sm:h-32 bg-[#eee9df] overflow-hidden">
                  <img
                    src={cat.img}
                    alt={cat.label}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <span className="block font-display font-black text-xs sm:text-sm text-[#201d19] uppercase leading-tight">
                    {cat.label}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[0.68rem] font-bold text-[#ef531d] mt-1">
                    Explore <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Mid-page Styled Banner */}
        <div className="relative mt-12 sm:mt-16 rounded-2xl overflow-hidden border border-[#e5dccf] bg-cover bg-center p-8 sm:p-12 shadow-sm"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(247, 244, 238, 0.96) 0%, rgba(247, 244, 238, 0.85) 60%, rgba(247, 244, 238, 0.3) 100%), url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85')`,
          }}
        >
          <div className="max-w-xl relative z-10">
            <div className="inline-flex items-center gap-2 text-[#ef531d] text-xs font-black tracking-widest uppercase mb-2">
              Make it yours
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-black text-[#171717] leading-tight mb-3">
              YOUR VEHICLE. <br />
              <span className="text-[#ef531d]">YOUR STYLE.</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#514d47] mb-6 leading-relaxed">
              Choose a product, select your car or bike, and explore an interactive visual fit preview before sending a pre-order request.
            </p>
            <button
              onClick={onExploreClick}
              className="inline-flex items-center gap-2 bg-[#ef531d] hover:bg-[#d84512] text-white px-5 py-3 rounded-lg font-black text-xs sm:text-sm uppercase tracking-wide transition-all hover:-translate-y-0.5 shadow-md shadow-[#ef531d]/20"
            >
              <span>FIND YOUR UPGRADE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          {/* Brand stripe on right */}
          <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-[#ef531d]" />
        </div>
      </div>
    </section>
  );
};
