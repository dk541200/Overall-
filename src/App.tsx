import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Header } from './components/Header.tsx';
import { Hero } from './components/Hero.tsx';
import { TrustBar } from './components/TrustBar.tsx';
import { Categories } from './components/Categories.tsx';
import { ProductCard } from './components/ProductCard.tsx';
import { FitmentModal } from './components/FitmentModal.tsx';
import { PreOrdersTracker } from './components/PreOrdersTracker.tsx';
import { MechanicChatPage } from './components/MechanicChatPage.tsx';
import { AdminPage } from './components/AdminPage.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { Footer } from './components/Footer.tsx';
import { INITIAL_PRODUCTS, COMMON_PROBLEMS } from './data/initialProducts.ts';
import type { Product, PreOrder, MechanicChat, CustomerPage, AdminTab } from './types/index.ts';
import { filterProducts } from './utils/autoflux.ts';
import { ChevronDown, ChevronUp, Sparkles, AlertCircle, X } from 'lucide-react';

function getCustomerPageFromPath(path: string): CustomerPage {
  const clean = path.replace(/\/+$/, '') || '/';
  if (clean === '/orders') return 'orders';
  if (clean === '/mechanic') return 'mechanic';
  return 'home';
}

export default function App() {
  // 1. Catalog & Data state
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const extra: Product[] = JSON.parse(localStorage.getItem('autoflux_products') || '[]');
      const overrides: Record<number, Partial<Product>> = JSON.parse(
        localStorage.getItem('autoflux_overrides') || '{}'
      );
      const deleted: number[] = JSON.parse(localStorage.getItem('autoflux_deleted') || '[]');
      const deletedSet = new Set(deleted);

      const combined = [...INITIAL_PRODUCTS, ...extra].filter((p) => !deletedSet.has(p.id));
      return combined.map((p) => {
        if (overrides[p.id]) {
          return { ...p, ...overrides[p.id] };
        }
        return p;
      });
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Pre-orders state
  const [orders, setOrders] = useState<PreOrder[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('autoflux_orders') || '[]');
    } catch {
      return [];
    }
  });

  // Wishlist state
  const [wishlist, setWishlist] = useState<Set<number>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('autoflux_wishlist') || '[]');
      return new Set(saved);
    } catch {
      return new Set();
    }
  });

  // Mechanic Chats state
  const [chats, setChats] = useState<MechanicChat[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('autoflux_chats') || '[]');
      if (saved && saved.length > 0) return saved;
      return [
        {
          problem: COMMON_PROBLEMS[0].id,
          title: COMMON_PROBLEMS[0].title,
          messages: [
            {
              from: 'mechanic',
              text: 'Hi! Tell us your vehicle make/model, when this starting problem started, and any warning lights or clicking sounds. For safety-critical issues, arrange an in-person inspection before driving.',
            },
          ],
        },
      ];
    } catch {
      return [];
    }
  });

  // Hero image
  const [heroImage, setHeroImage] = useState<string>(() => {
    return (
      localStorage.getItem('autoflux_hero') ||
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1900&q=90'
    );
  });

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [showAllProducts, setShowAllProducts] = useState(false);

  // Full-page customer navigation mode (synchronized with URL)
  const [activeCustomerPage, setActiveCustomerPage] = useState<CustomerPage>(() => {
    if (typeof window !== 'undefined') {
      return getCustomerPageFromPath(window.location.pathname);
    }
    return 'home';
  });

  // URL-based navigation helper updating window history state
  const navigateTo = (page: CustomerPage, push = true) => {
    setActiveCustomerPage(page);
    let targetPath = '/';
    if (page === 'orders') targetPath = '/orders';
    else if (page === 'mechanic') targetPath = '/mechanic';

    if (push && typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      window.history.pushState({ page }, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Browser Back/Forward (popstate) event listener
  useEffect(() => {
    const handlePopState = () => {
      const page = getCustomerPageFromPath(window.location.pathname);
      setActiveCustomerPage(page);
      window.scrollTo({ top: 0, behavior: 'instant' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Synchronize live catalog and hero banner from server published database
  useEffect(() => {
    fetch('/api/catalog')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
          if (data.heroImage) {
            setHeroImage(data.heroImage);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Admin Mode & Separate Admin Views state
  const [adminMode, setAdminMode] = useState<boolean>(false);
  const [adminOpen, setAdminOpen] = useState<boolean>(false);
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('dashboard');

  // Interactive 3D fitment preview modal
  const [fitmentModalOpen, setFitmentModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Home edit modal for direct editing on home
  const [editingListing, setEditingListing] = useState<Product | null>(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (message: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Persist orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('autoflux_orders', JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  // Persist wishlist
  useEffect(() => {
    try {
      localStorage.setItem('autoflux_wishlist', JSON.stringify([...wishlist]));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  // Persist chats
  useEffect(() => {
    try {
      localStorage.setItem('autoflux_chats', JSON.stringify(chats));
    } catch (e) {
      console.error(e);
    }
  }, [chats]);

  // Save full catalog state
  const persistCatalogState = (currentProducts: Product[], deletedId?: number) => {
    try {
      const overrides: Record<number, Partial<Product>> = {};
      currentProducts.forEach((p) => {
        overrides[p.id] = {
          name: p.name,
          brand: p.brand,
          cat: p.cat,
          price: p.price,
          old: p.old,
          tag: p.tag,
          img: p.img,
          desc: p.desc,
          listingType: p.listingType,
          year: p.year,
          condition: p.condition,
        };
      });
      localStorage.setItem('autoflux_overrides', JSON.stringify(overrides));

      const extraItems = currentProducts.filter((p) => p.id > 8);
      localStorage.setItem('autoflux_products', JSON.stringify(extraItems));

      if (deletedId) {
        const deletedArr: number[] = JSON.parse(
          localStorage.getItem('autoflux_deleted') || '[]'
        );
        deletedArr.push(deletedId);
        localStorage.setItem('autoflux_deleted', JSON.stringify(deletedArr));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered products list
  const filteredList = useMemo(() => {
    return filterProducts(products, activeCategory, searchQuery);
  }, [products, activeCategory, searchQuery]);

  const displayedProducts = useMemo(() => {
    return showAllProducts ? filteredList : filteredList.slice(0, 8);
  }, [filteredList, showAllProducts]);

  // Handlers
  const handleToggleWishlist = (id: number) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast('Removed item from your wishlist.');
      } else {
        next.add(id);
        showToast('Saved item to your wishlist.');
      }
      return next;
    });
  };

  const handleOpenFitment = (product?: Product) => {
    setSelectedProduct(product || products[0]);
    setFitmentModalOpen(true);
  };

  const handleSubmitPreOrder = (order: PreOrder) => {
    setOrders((prev) => [order, ...prev]);
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    }).catch(() => {});
    showToast(`Pre-order ${order.id} registered on this device.`);
  };

  const handleUnlockAdmin = async (password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'studyai9211@gmail.com',
          password,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAdminMode(true);
        setActiveAdminTab('dashboard');
        setAdminOpen(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleLogoutAdmin = () => {
    setAdminMode(false);
    setAdminOpen(false);
    setActiveCustomerPage('home');
    showToast('Admin mode deactivated. Customer navigation restored.');
  };

  const handleAddProduct = (newProductData: Omit<Product, 'id'>) => {
    const newItem: Product = {
      ...newProductData,
      id: Date.now(),
    };
    const nextList = [newItem, ...products];
    setProducts(nextList);
    persistCatalogState(nextList);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    const nextList = products.map((p) =>
      p.id === updatedProduct.id ? updatedProduct : p
    );
    setProducts(nextList);
    persistCatalogState(nextList);
  };

  const handleDeleteListing = (id: number) => {
    const confirmDelete = window.confirm('Delete this listing from the AUTOFLUX store?');
    if (!confirmDelete) return;

    const updatedList = products.filter((p) => p.id !== id);
    setProducts(updatedList);
    persistCatalogState(updatedList, id);
    showToast('Listing deleted from catalog.');
  };

  const handleUpdateHeroImage = (url: string) => {
    setHeroImage(url);
    try {
      localStorage.setItem('autoflux_hero', url);
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirmOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'Confirmed' } : o))
    );
    showToast(`Order ${orderId} confirmed.`);
  };

  const handleDeleteOrder = (orderId: string) => {
    const confirmDelete = window.confirm(`Remove order ${orderId} from this device?`);
    if (!confirmDelete) return;

    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    showToast(`Order ${orderId} deleted.`);
  };

  // Interactive diagnostic mechanic chat messages
  const handleSendMechanicMessage = (problemId: string, text: string) => {
    const existingIndex = chats.findIndex((c) => c.problem === problemId);
    const problemMeta = COMMON_PROBLEMS.find((p) => p.id === problemId) || COMMON_PROBLEMS[0];

    const customerMessage = { from: 'customer' as const, text };

    let updatedChat: MechanicChat;

    if (existingIndex >= 0) {
      updatedChat = {
        ...chats[existingIndex],
        messages: [...chats[existingIndex].messages, customerMessage],
      };
    } else {
      updatedChat = {
        problem: problemId,
        title: problemMeta.title,
        messages: [customerMessage],
      };
    }

    const nextChats = existingIndex >= 0
      ? chats.map((c, i) => (i === existingIndex ? updatedChat : c))
      : [...chats, updatedChat];

    setChats(nextChats);

    // Provide helpful technician diagnostic response after short delay
    setTimeout(() => {
      let advice = 'Thank you for sharing the symptoms. Please provide your vehicle registration year and any recent warning lights.';
      const lower = text.toLowerCase();

      if (problemId === 'starting' || lower.includes('start') || lower.includes('crank')) {
        advice = 'Technician review: If the engine cranks slowly, the battery or starter relay is weak. If there is only a rapid click, clean the battery terminals and verify voltage is above 12.4V with a multimeter.';
      } else if (problemId === 'brakes' || lower.includes('brake') || lower.includes('noise')) {
        advice = 'Technician review: High-pitched squeal means brake pad wear indicator tabs are making contact. Grinding indicates pads are down to bare metal backing plates. Avoid driving until inspected.';
      } else if (problemId === 'battery' || lower.includes('battery')) {
        advice = 'Technician review: If the battery is older than 2.5–3 years, parasitic drain or cell degradation is likely. We can schedule a digital load test and alternator charging check.';
      } else if (problemId === 'engine' || lower.includes('vibration') || lower.includes('sound')) {
        advice = 'Technician review: Check engine oil level on a cold flat surface. If the check engine light is illuminated, our workshop scanner can read OBD-II DTC error codes for exact diagnosis.';
      } else if (problemId === 'tyres' || lower.includes('tyre') || lower.includes('wheel')) {
        advice = 'Technician review: Check tyre pressures when cold. If you feel steering wheel wobble at 70–90 km/h, wheel balancing or uneven tyre tread wear is usually the root cause.';
      } else {
        advice = 'Technician review: We have logged your service inquiry. Our service advisor can arrange genuine parts and confirm booking times.';
      }

      setChats((current) =>
        current.map((c) =>
          c.problem === problemId
            ? {
                ...c,
                messages: [...c.messages, { from: 'mechanic', text: advice }],
              }
            : c
        )
      );
    }, 600);
  };

  const scrollToProducts = () => {
    navigateTo('home');
    setTimeout(() => {
      const el = document.getElementById('products-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  return (
    <div className="min-h-screen bg-[#f7f4ee] text-[#171717] flex flex-col font-sans">
      {/* 1. Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={(e) => {
          e.preventDefault();
          scrollToProducts();
        }}
        wishlistCount={wishlist.size}
        orderCount={orders.length}
        onOpenWishlist={() => navigateTo('orders')}
        onOpenOrders={() => navigateTo('orders')}
        onGoHome={() => navigateTo('home')}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* 2. Hero */}
        <Hero
          heroImageUrl={heroImage}
          adminMode={adminMode}
          onExitAdmin={handleLogoutAdmin}
          onExploreProducts={scrollToProducts}
          onOpenPreview={() => handleOpenFitment(products[0])}
        />

        {/* 3. Trust Bar */}
        <TrustBar />

        {/* 4. Categories Section */}
        <div id="categories-section">
          <Categories
            activeCategory={activeCategory}
            onSelectCategory={(cat) => {
              setActiveCategory(cat);
              scrollToProducts();
            }}
            onExploreClick={scrollToProducts}
          />
        </div>

        {/* 5. Products Catalog */}
        <section id="products-section" className="py-16 sm:py-20 bg-[#eee8dd]/60 border-t border-[#171717]/10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <div className="inline-flex items-center gap-2 text-[#ef531d] text-xs font-black tracking-widest uppercase mb-2">
                  <span className="w-5 h-0.5 bg-[#ef531d]" />
                  Curated for the road
                </div>
                <h2 className="font-display text-4xl sm:text-5xl font-black text-[#171717]">
                  FEATURED <span className="text-[#ef531d]">PRODUCTS.</span>
                </h2>
                {activeCategory && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs font-bold text-[#696862]">
                      Filtering by: <span className="text-[#ef531d]">{activeCategory}</span>
                    </span>
                    <button
                      onClick={() => setActiveCategory('')}
                      className="text-xs underline text-[#ef531d] hover:text-[#d84512]"
                    >
                      Clear filter
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xs sm:text-sm text-[#696862] max-w-md leading-relaxed">
                Explore automotive accessories, audio upgrades, wheels, and utility gear. Inspect 3D rotation angles and submit your fitment pre-order.
              </p>
            </div>

            {/* Product Cards Grid */}
            {displayedProducts.length === 0 ? (
              <div className="p-12 text-center bg-[#fffdf8] rounded-2xl border border-dashed border-[#d8cfc1]">
                <AlertCircle className="w-8 h-8 text-[#ef531d] mx-auto mb-2" />
                <h3 className="font-display text-xl font-bold text-[#171717]">
                  No matching parts found
                </h3>
                <p className="text-xs text-[#797168] mt-1">
                  Try adjusting your search terms or selecting a different category.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('');
                  }}
                  className="mt-4 bg-[#ef531d] text-white px-4 py-2 rounded-lg text-xs font-bold"
                >
                  Reset Catalog Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {displayedProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    isWishlisted={wishlist.has(p.id)}
                    onToggleWishlist={handleToggleWishlist}
                    onOpenFitment={handleOpenFitment}
                    adminMode={adminMode}
                    onEditListing={(id) => {
                      const item = products.find((x) => x.id === id);
                      if (item) setEditingListing(item);
                    }}
                    onDeleteListing={handleDeleteListing}
                  />
                ))}
              </div>
            )}

            {/* Show All / Show Fewer Button */}
            {filteredList.length > 8 && (
              <div className="text-center mt-10">
                <button
                  onClick={() => setShowAllProducts(!showAllProducts)}
                  className="inline-flex items-center gap-2 bg-[#fffdf8] hover:bg-[#faf5ec] text-[#171717] border border-[#29231d]/20 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-colors shadow-sm"
                >
                  <span>{showAllProducts ? 'SHOW FEWER' : 'SHOW ALL PRODUCTS'}</span>
                  {showAllProducts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            )}

            {/* Fitment Interactive Callout Banner */}
            <div className="mt-14 sm:mt-18 bg-[#fffdf8] border border-[#e2d9cc] rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 shadow-sm">
              <div
                className="min-h-[260px] bg-cover bg-center filter saturate-90"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=85')`,
                }}
              />
              <div className="p-8 sm:p-10 flex flex-col justify-center items-start">
                <div className="inline-flex items-center gap-2 text-[#ef531d] text-xs font-black tracking-widest uppercase mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span>A better way to choose</span>
                </div>
                <h3 className="font-display text-3xl sm:text-4xl font-black text-[#171717] leading-tight mb-3">
                  SEE IT ON <br />
                  <span className="text-[#ef531d]">YOUR RIDE.</span>
                </h3>
                <p className="text-xs sm:text-sm text-[#696862] leading-relaxed mb-6">
                  Select any product from the catalog, specify your vehicle make, model and year, and rotate the preview from all angles before confirming compatibility.
                </p>
                <button
                  onClick={() => handleOpenFitment(products[0])}
                  className="bg-[#ef531d] hover:bg-[#d84512] text-white px-6 py-3 rounded-lg font-black text-xs uppercase tracking-wide transition-all hover:-translate-y-0.5 shadow-md shadow-[#ef531d]/20"
                >
                  TRY A FIT PREVIEW ↗
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 6. How it works */}
        <section className="py-16 sm:py-20 bg-[#f7f4ee]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <div className="inline-flex items-center gap-2 text-[#ef531d] text-xs font-black tracking-widest uppercase mb-2">
                  Your upgrade, simplified
                </div>
                <h2 className="font-display text-4xl sm:text-5xl font-black text-[#171717]">
                  FROM BROWSE TO <span className="text-[#ef531d]">PRE-ORDER.</span>
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#696862] max-w-md leading-relaxed">
                Simple steps help drivers and riders find verified products and coordinate vehicle fitment checks with the workshop.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  num: '01',
                  title: 'Choose a Product',
                  desc: 'Browse product photos, specs, price and critical compatibility specifications.',
                },
                {
                  num: '02',
                  title: 'Select Your Ride',
                  desc: 'Enter vehicle type, make, model and year to request custom fitment assistance.',
                },
                {
                  num: '03',
                  title: 'Rotate & Review',
                  desc: 'Inspect the preview from different angles with perspective controls.',
                },
                {
                  num: '04',
                  title: 'Send Pre-Order',
                  desc: 'Share contact and preferred time. The shop confirms availability and compatibility.',
                },
              ].map((step, idx) => (
                <article
                  key={idx}
                  className="p-6 bg-[#fffdf8] border border-[#171717]/10 rounded-xl hover:border-[#ef531d]/40 transition-colors"
                >
                  <div className="font-display text-4xl font-black text-[#ef531d] mb-3">
                    {step.num}
                  </div>
                  <h3 className="font-display text-xl font-black text-[#201d19] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#6c6862] leading-relaxed">
                    {step.desc}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Newsletter Strip */}
        <section className="bg-[#ef531d] text-white py-12 px-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-white leading-tight">
                STAY IN THE ROAD LOOP.
              </h2>
              <p className="text-xs sm:text-sm text-white/90 mt-1 max-w-md">
                Get product releases, fitment tutorials and part availability alerts directly to your inbox.
              </p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast('Subscription registered! Newsletter updates will be sent.');
                (e.target as HTMLFormElement).reset();
              }}
              className="flex w-full md:max-w-md bg-white rounded-xl overflow-hidden p-1 shadow-lg"
            >
              <input
                type="email"
                required
                placeholder="Enter your email address"
                aria-label="Email address for updates"
                className="flex-1 px-4 py-2 text-xs sm:text-sm text-[#171717] outline-none"
              />
              <button
                type="submit"
                className="bg-[#171717] hover:bg-[#333] text-white font-bold text-xs px-5 py-2.5 rounded-lg uppercase transition-colors shrink-0"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* 8. Footer */}
      <Footer
        onGoHome={() => navigateTo('home')}
        onGoShop={scrollToProducts}
        onOpenPreview={() => handleOpenFitment(products[0])}
        onOpenOrders={() => navigateTo('orders')}
      />

      {/* 9. Bottom Navigation Bar */}
      <BottomNav
        adminMode={adminMode}
        activeCustomerPage={activeCustomerPage}
        activeAdminTab={activeAdminTab}
        onSelectCustomerPage={(page) => navigateTo(page)}
        onOpenPreview={() => handleOpenFitment(products[0])}
        onSelectAdminTab={(tab) => {
          setActiveAdminTab(tab);
          setAdminOpen(true);
        }}
        onLogoutAdmin={handleLogoutAdmin}
        orderCount={orders.length}
      />

      {/* 10. Interactive 3D Fitment Modal */}
      <FitmentModal
        isOpen={fitmentModalOpen}
        product={selectedProduct}
        onClose={() => setFitmentModalOpen(false)}
        onSubmitPreOrder={handleSubmitPreOrder}
        showToast={showToast}
      />

      {/* 11. Full-Page Customer Views */}
      <PreOrdersTracker
        orders={orders}
        isOpen={activeCustomerPage === 'orders'}
        onClose={() => navigateTo('home')}
        showToast={showToast}
        onExploreProducts={scrollToProducts}
      />

      <MechanicChatPage
        isOpen={activeCustomerPage === 'mechanic'}
        onClose={() => navigateTo('home')}
        chats={chats}
        onSendMessage={handleSendMechanicMessage}
      />

      {/* 12. Full-Page Admin Management View with Separate Tabs */}
      <AdminPage
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        isAdminUnlocked={adminMode}
        onUnlockAdmin={handleUnlockAdmin}
        onLogoutAdmin={handleLogoutAdmin}
        activeTab={activeAdminTab}
        onTabChange={(tab) => setActiveAdminTab(tab)}
        products={products}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteListing}
        heroImageUrl={heroImage}
        onUpdateHeroImage={handleUpdateHeroImage}
        orders={orders}
        onConfirmOrder={handleConfirmOrder}
        onDeleteOrder={handleDeleteOrder}
        chats={chats}
        onGoHome={() => {
          setAdminOpen(false);
          setActiveCustomerPage('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        showToast={showToast}
      />

      {/* 13. Direct Listing Edit Dialog (for Home Storefront Admin Mode) */}
      {editingListing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#fffdf8] border border-[#e5decb] rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-[#171717]/10 mb-4">
              <h3 className="font-display text-2xl font-black text-[#171717]">
                EDIT HOME LISTING
              </h3>
              <button
                onClick={() => setEditingListing(null)}
                className="w-8 h-8 rounded-lg bg-[#eee8dd] text-[#171717] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateProduct(editingListing);
                setEditingListing(null);
                showToast('Listing updated on home page.');
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-[#444] mb-1">Item / Vehicle Name</label>
                <input
                  required
                  value={editingListing.name}
                  onChange={(e) =>
                    setEditingListing({ ...editingListing, name: e.target.value })
                  }
                  className="w-full bg-[#f9f7f2] border border-[#ddd] rounded-lg px-3 py-2 outline-none focus:border-[#ef531d]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#444] mb-1">Brand / Seller</label>
                  <input
                    required
                    value={editingListing.brand}
                    onChange={(e) =>
                      setEditingListing({ ...editingListing, brand: e.target.value })
                    }
                    className="w-full bg-[#f9f7f2] border border-[#ddd] rounded-lg px-3 py-2 outline-none focus:border-[#ef531d]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#444] mb-1">Price (₹)</label>
                  <input
                    required
                    type="number"
                    value={editingListing.price}
                    onChange={(e) =>
                      setEditingListing({
                        ...editingListing,
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
                  value={editingListing.img}
                  onChange={(e) =>
                    setEditingListing({ ...editingListing, img: e.target.value })
                  }
                  className="w-full bg-[#f9f7f2] border border-[#ddd] rounded-lg px-3 py-2 outline-none focus:border-[#ef531d]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#444] mb-1">Category</label>
                <input
                  required
                  value={editingListing.cat}
                  onChange={(e) =>
                    setEditingListing({ ...editingListing, cat: e.target.value })
                  }
                  className="w-full bg-[#f9f7f2] border border-[#ddd] rounded-lg px-3 py-2 outline-none focus:border-[#ef531d]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#444] mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingListing.desc}
                  onChange={(e) =>
                    setEditingListing({ ...editingListing, desc: e.target.value })
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
                  onClick={() => setEditingListing(null)}
                  className="bg-[#eee8dd] hover:bg-[#ded6c9] text-[#171717] py-2.5 px-4 rounded-xl font-bold uppercase text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 14. Floating Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#211d19] text-white px-5 py-3 rounded-xl shadow-2xl text-xs sm:text-sm font-semibold max-w-[90vw] text-center border border-white/10 animate-fade-in"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
