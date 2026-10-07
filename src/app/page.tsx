"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingBag,
  Heart,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Truck,
  MessageCircle,
  Lock,
  Layers,
  Sparkles,
  Loader2,
  Tag,
  Copy,
  Check,
  Gift,
  Percent,
  Flame,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { useCartStore } from "@/lib/store/useCartStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import { useAuthModalStore } from "@/lib/store/useAuthModalStore";
import { fetchProducts, fetchCategories, fetchLookbookBanners, fetchHeroSection, fetchOffersSection } from "@/lib/api";
import { ProductSummary, Category, LookbookBanner, HeroSectionConfig, HeroSlide, OfferCard, OffersSectionConfig } from "@/types";
import { validateSriLankanMobile, sanitizeInput } from "@/lib/sanitizer";

const DEFAULT_OFFER_CARDS: OfferCard[] = [
  {
    id: 1,
    icon: "Truck",
    badge: "ZERO-FEE LOGISTICS",
    title: "FREE ISLAND-WIDE SHIPPING",
    description: "Every order exceeding LKR 10,000 qualifies for complimentary express door-to-door courier dispatch across Sri Lanka.",
    footerTag: "AUTO-APPLIED AT CHECKOUT",
    buttonText: "SHOP NOW",
    buttonUrl: "#catalog",
    imageUrl: "https://lh3.googleusercontent.com/aida/AEtjO1VWwzrkvIXs9P97KvIEZny8bXkyVwlwGXt5FNUiMjAAm8Q-Jl5tRqWalnbNioctZvKjriLbJKNWdIe33IhvB-tDSUS4gJkF6_OFTzdNhnpUV83im4x1-rnF6Xl416VwRxs1DtvB2Okh3KqxI9CsTw_jHqg5r6d5kI1jlUQKEzgBT5mq1sm3H3_eWNP6h3zLvYtShouuQ6vlFZURcCQKan4dXMus65fsc_ywlsVmcKdeuaK8tsb3oe5rmI0",
  },
  {
    id: 2,
    icon: "ShieldCheck",
    badge: "EXPRESS LOGISTICS",
    title: "DOORSTEP DELIVERY IN 24 HOURS",
    description: "Enjoy rapid 24-hour door-to-door express delivery across Colombo and priority island-wide courier dispatch with 7-day size exchange.",
    footerTag: "COLOMBO 24H DISPATCH",
    buttonText: "HOW IT WORKS",
    buttonUrl: "#doorstep-delivery",
    imageUrl: "/doorstep-delivery.jpg",
  },
  {
    id: 3,
    icon: "Flame",
    badge: "EARLY ALLOCATION",
    title: "DROP 02 VIP EARLY PASS",
    description: "Join our private client reservation ledger to gain priority checkout access 2 hours before Drop 02 is released to the general public.",
    footerTag: "LIMITED TO 200 CLIENTS",
    buttonText: "CLAIM PASS",
    buttonUrl: "#vip-reservation",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFnAGDvyhL3sXyDD_E5Gd40gtlkrLg5U0fzEkMEwEj6cLdeoe-OnZEOsxZ52lrnPyqSlcotASCOtIO3MAqzuMSzLCKAG7cyCaxHd1G9jVCebSPrF2umtYF3D3Mi4ZgbUL2COuqHrxJ8cvHeTpYU20oHPNcC-1ZUnN2a0Orw0k-tSbzU3MzViAYt9qe0_5xC0Uz9MU9ycSdjfmYr3-cNRh14HqEm2vbbQTMkEqdVz_SiU-r5tENpU4DX2DLMkE0C7obrQ",
  },
];

const DEFAULT_OFFERS_CONFIG: OffersSectionConfig = {
  tagline: "SEASONAL PRIVILEGES & CLIENT OFFERS",
  title: "CURATED ATELIER OFFERS",
  subtitle: "Exclusive wardrobe incentives, complimentary island-wide logistics, and doorstep assurance for the discerning client.",
  noteBadge: "ALL OFFERS ACTIVE FOR DROP 01 ARCHIVE",
  marqueeText: "✦ ARCHIVAL DUO BUNDLE: SAVE 10% ON 2+ TEES WITH CODE \"CALVIZ10\" ✦ FREE ISLAND-WIDE EXPRESS DISPATCH ON ORDERS OVER LKR 10,000 ✦ DOORSTEP DELIVERY WITHIN 24 HOURS ✦ 7-DAY EFFORTLESS SIZE EXCHANGES ✦ VIP EARLY ALLOCATION PASSES ACTIVE FOR DROP 02 ✦",
  heroBadge: "CAPSULE BUNDLE PRIVILEGE",
  heroTitle: "ARCHIVAL DUO BUNDLE: SAVE 10% ON 2+ TEES",
  heroDescription: "Upgrade your daily rotation. Add any two or more heavyweight tees across Drop 01 to your cart and claim an instant 10% privilege discount.",
  heroPromoCode: "CALVIZ10",
  heroButtonText: "EXPLORE CAPSULE",
  heroButtonUrl: "#catalog",
  heroImageUrl: "https://lh3.googleusercontent.com/aida/AEtjO1W2UlicQK-ALNnpCFI_VnuAFHutBsM5uozFpmtPjMXZsKgJaWhuXUp4SDT1tJNzteqkhaiH2znBpGa_yQ2sr3WBt_5huSnSvMcSV6thVGD_KhYlLUIVjIqtwj2g5iI8la0TFUIpcr1C06lWj9EtWpnFrZ06wCyOupxEFBXyjgGa-3zYp-HEWnXyUBhZqXtBhAWnLx6mdqBN9l2gOhTIPTpQU8-meqP0eOIh29qFsd0yU35In11zyiQ7kKk",
  heroPerk1Title: "AUTOMATIC CART STACKING",
  heroPerk1Description: "Stacks seamlessly with island-wide free dispatch on orders over LKR 10,000.",
  heroPerk2Title: "ALL SIZES & CUTS ELIGIBLE",
  heroPerk2Description: "Mix and match between Obsidian Black, Stark White & Graphic Editions.",
  cardsJson: JSON.stringify(DEFAULT_OFFER_CARDS, null, 2),
  isActive: true,
};

export default function HomePage() {
  // Hero Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [heroConfig, setHeroConfig] = useState<HeroSectionConfig | null>(null);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);

  // Offers Section Dynamic Config State
  const [offersConfig, setOffersConfig] = useState<OffersSectionConfig>(DEFAULT_OFFERS_CONFIG);
  const [offerCards, setOfferCards] = useState<OfferCard[]>(DEFAULT_OFFER_CARDS);

  // Promo code copy notification state
  const [copiedPromo, setCopiedPromo] = useState<string | null>(null);
  const handleCopyPromo = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedPromo(code);
    setTimeout(() => {
      setCopiedPromo(null);
    }, 2200);
  };

  // Catalog API State
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("featured");
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Selected Sizes State (map of productId -> size)
  const [selectedSizes, setSelectedSizes] = useState<{ [key: string]: string }>({});

  // VIP Drop Form State
  const [phoneInput, setPhoneInput] = useState("");
  const [vipSuccess, setVipSuccess] = useState(false);
  const [vipError, setVipError] = useState<string | null>(null);
  const [vipLoading, setVipLoading] = useState(false);
  const [lookbooks, setLookbooks] = useState<LookbookBanner[]>([]);
  const [lookbooksLoaded, setLookbooksLoaded] = useState(false);

  // Cart & Auth & Wishlist Stores
  const { addItem, openCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { items: wishlistItems, toggleItem, setPendingProduct } = useWishlistStore();
  const { openModal } = useAuthModalStore();
  const catalogTrackRef = useRef<HTMLDivElement>(null);

  // 0. Fetch Hero Section Configuration on Mount
  useEffect(() => {
    let mounted = true;
    async function loadHero() {
      try {
        const data = await fetchHeroSection();
        if (mounted && data) {
          setHeroConfig(data);
          if (data.slidesJson) {
            try {
              const parsed = JSON.parse(data.slidesJson);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setHeroSlides(parsed);
              }
            } catch (e) {
              console.warn("Could not parse hero slidesJson", e);
            }
          }
        }
      } catch (err) {
        console.warn("Could not load hero section config", err);
      }
    }
    loadHero();
    return () => {
      mounted = false;
    };
  }, []);

  // 0.5. Fetch Offers & Privileges Section Configuration on Mount
  useEffect(() => {
    let mounted = true;
    async function loadOffers() {
      try {
        const data = await fetchOffersSection();
        if (mounted && data) {
          setOffersConfig(data);
          if (data.cardsJson) {
            try {
              const parsed = JSON.parse(data.cardsJson);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setOfferCards(parsed);
              }
            } catch (e) {
              console.warn("Could not parse offer cardsJson", e);
            }
          }
        }
      } catch (err) {
        console.warn("Could not load offers section config", err);
      }
    }
    loadOffers();
    return () => {
      mounted = false;
    };
  }, []);

  // 1. Fetch Lookbooks on Mount (strictly from backend)
  useEffect(() => {
    let mounted = true;
    async function loadLookbooks() {
      try {
        const banners = await fetchLookbookBanners();
        if (mounted) {
          setLookbooks(Array.isArray(banners) ? banners : []);
          setLookbooksLoaded(true);
        }
      } catch (err) {
        console.warn("Could not load lookbooks", err);
        if (mounted) {
          setLookbooks([]);
          setLookbooksLoaded(true);
        }
      }
    }
    loadLookbooks();
    return () => {
      mounted = false;
    };
  }, []);

  // 2. Fetch Categories on Mount
  useEffect(() => {
    let mounted = true;
    async function loadCategories() {
      try {
        const catData = await fetchCategories();
        if (mounted && catData?.length) {
          setCategories(catData);
        }
      } catch (err) {
        console.warn("Could not load categories", err);
      }
    }
    loadCategories();
    return () => {
      mounted = false;
    };
  }, []);

  // 2. Fetch Products when Selected Category changes
  const loadProducts = useCallback(async (catSlug?: string) => {
    setLoadingProducts(true);
    setApiError(null);
    try {
      const items = await fetchProducts(catSlug === "featured" || catSlug === "all" ? undefined : catSlug);
      setProducts(items);

      // Pre-select default sizes
      setSelectedSizes((prev) => {
        const updated = { ...prev };
        items.forEach((item) => {
          if (!updated[item.id] && item.availableSizes?.length) {
            updated[item.id] = item.availableSizes.includes("M")
              ? "M"
              : item.availableSizes[0];
          }
        });
        return updated;
      });
    } catch (err: any) {
      console.error("Error loading products:", err);
      setApiError("Unable to load latest capsule products from server.");
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    loadProducts(selectedCategory);
  }, [selectedCategory, loadProducts]);

  // Filter products: Show Featured/Selected Category Products and randomly pick 4 items each time
  const displayedProducts = useMemo(() => {
    let candidateList: ProductSummary[] = [];

    if (selectedCategory === "featured") {
      const featured = products.filter((p) => p.isFeatured);
      candidateList = featured.length > 0 ? featured : products;
    } else if (selectedCategory === "all") {
      candidateList = products;
    } else {
      candidateList = products.filter(
        (p) =>
          p.categorySlug?.toLowerCase() === selectedCategory.toLowerCase() ||
          p.categoryId?.toLowerCase() === selectedCategory.toLowerCase() ||
          p.categories?.some(
            (c) =>
              c.slug?.toLowerCase() === selectedCategory.toLowerCase() ||
              c.id?.toLowerCase() === selectedCategory.toLowerCase() ||
              c.name?.toLowerCase() === selectedCategory.toLowerCase()
          ) ||
          p.categoryIds?.includes(selectedCategory)
      );
    }

    if (candidateList.length <= 4) {
      return candidateList;
    }

    // Randomize order on each render/selection and select only 4 products
    const shuffled = [...candidateList];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 4);
  }, [products, selectedCategory]);

  // 3. Auto-play Carousel
  useEffect(() => {
    if (isPaused || heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, heroSlides.length]);

  const handleNextSlide = () => {
    if (heroSlides.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const handlePrevSlide = () => {
    if (heroSlides.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleSelectSize = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const toggleWishlist = (productId: string) => {
    if (!isAuthenticated) {
      setPendingProduct(productId);
      openModal({
        tab: "login",
        title: "SIGN IN FOR WISHLIST",
        description: "Sign in to save this capsule piece to your private client wishlist.",
      });
      return;
    }
    toggleItem(productId);
  };

  const handleAddToBag = (product: ProductSummary) => {
    const stock =
      typeof product.totalStock === "number"
        ? product.totalStock
        : (product.variants?.reduce(
          (sum, v) => sum + (v.stockQuantity || 0),
          0
        ) ?? 0);

    if (stock <= 0) return;

    const size =
      selectedSizes[product.id] || product.availableSizes?.[0] || "M";
    const color = product.availableColors?.[0] || "Monochrome";
    const imageUrl = product.primaryImageUrl || product.images?.[0]?.imageUrl;

    const matchedVariant =
      product.variants?.find(
        (v) => v.size.toUpperCase() === size.toUpperCase()
      ) || product.variants?.[0];

    const actualVariantId = matchedVariant?.id
      ? String(matchedVariant.id)
      : `${product.id}-${size}`;

    addItem({
      variantId: actualVariantId,
      productId: product.id,
      productName: product.name,
      slug: product.slug,
      size: matchedVariant?.size || size,
      color: matchedVariant?.color || color,
      unitPrice: Number(product.basePrice) + (matchedVariant?.priceAdjustment || 0),
      quantity: 1,
      imageUrl: imageUrl,
      maxStock: matchedVariant ? matchedVariant.stockQuantity : stock,
    });
    openCart();
  };

  const scrollCatalog = (direction: "left" | "right") => {
    if (catalogTrackRef.current) {
      const offset = direction === "left" ? -340 : 340;
      catalogTrackRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const handleVipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVipError(null);

    const validation = validateSriLankanMobile(phoneInput);
    if (!validation.isValid) {
      setVipError(validation.error || "Please enter a valid 9-digit mobile number starting with 7.");
      return;
    }

    try {
      setVipLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5070/api";
      const res = await fetch(`${apiUrl}/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "VIP Early Allocation Member",
          phone: validation.formatted,
          inquiryType: "VIP Early Allocation / Drop 02",
          message: `Customer registered for early access priority drop 02 reservation (${validation.formatted}).`,
          submitElapsedSeconds: 3.5,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to register mobile. Please try again.");
      }

      setVipSuccess(true);
      setVipError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration error. Please check your number.";
      setVipError(msg);
    } finally {
      setVipLoading(false);
    }
  };

  // Helper to calculate stock telemetry and allocation directly from backend stock data
  const getProductMetrics = (product: ProductSummary) => {
    const stock =
      typeof product.totalStock === "number"
        ? product.totalStock
        : (product.variants?.reduce(
          (sum, v) => sum + (v.stockQuantity || 0),
          0
        ) ?? 0);

    const isOutOfStock = stock <= 0;
    const isUrgent = stock > 0 && stock <= 10;

    let badge = "NEW ARRIVAL";
    if (isOutOfStock) {
      badge = "SOLD OUT";
    } else if (isUrgent) {
      badge = "FEW UNITS LEFT";
    } else if (product.isFeatured) {
      badge =
        product.categorySlug === "heavyweight-basics"
          ? "FEATURED"
          : "BESTSELLER";
    }

    let stockHeader = "EDITION STOCK";
    let stockText = `${stock} UNITS IN STOCK`;
    let stockPercent = Math.min(100, Math.max(10, Math.round((stock / 50) * 100)));

    if (isOutOfStock) {
      stockHeader = "STOCK STATUS";
      stockText = "0 UNITS AVAILABLE";
      stockPercent = 0;
    } else if (isUrgent) {
      stockHeader = "LOW STOCK";
      stockText = `ONLY ${stock} UNITS REMAINING`;
      stockPercent = Math.min(100, Math.max(15, (stock / 10) * 100));
    } else {
      stockHeader = "EDITION STOCK";
      stockText = `${stock} UNITS IN STOCK`;
      stockPercent = Math.min(100, Math.max(20, Math.round((stock / 100) * 100)));
    }

    return { badge, stockHeader, stockText, stockPercent, isUrgent, isOutOfStock, stock };
  };

  return (
    <div className="bg-white min-h-screen text-[#0a0a0a] antialiased selection:bg-black selection:text-white">
      <Header />

      <main className="w-full pt-24 bg-white">
        <div className="flex flex-col w-full">
          <section className="relative w-full bg-[#fdfdfd] border-b border-neutral-200/60 overflow-hidden" id="hero-section">
            {/* Ambient Architectural Background Watermark */}
            <div
              aria-hidden="true"
              className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none font-black text-[18vw] leading-none tracking-tighter text-neutral-100/90 z-0 transition-all duration-700"
              style={{
                letterSpacing: "-0.04em"
              }}
            >
              CALVIZ
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-10 md:pt-8 md:pb-16 lg:pt-10 lg:pb-20">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">

                {/* Left Column: High-Impact Luxury Typography & Storytelling */}
                <div className="lg:col-span-6 space-y-6 sm:space-y-8">
                  {/* Clean Micro Capsule Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 border border-neutral-200/80 rounded-full text-[10px] sm:text-[11px] font-mono tracking-wider text-neutral-800 uppercase shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold">{heroConfig?.badgeText || "DROP 01 // ARCHIVAL CAPSULE"}</span>
                    {heroConfig?.locationText && (
                      <>
                        <span className="text-neutral-300 hidden sm:inline">•</span>
                        <span className="text-neutral-500 hidden sm:inline">{heroConfig.locationText}</span>
                      </>
                    )}
                  </div>

                  {/* Impactful Architectural Title */}
                  <div className="space-y-3 sm:space-y-4">
                    <h1 className="text-3xl sm:text-5xl lg:text-[62px] font-black uppercase tracking-tight text-neutral-950 leading-[1.02] sm:leading-[0.96]">
                      <span className="block tracking-tight text-neutral-950">
                        BOLD FIT.
                      </span>
                      <span className="block tracking-tight bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-500 bg-clip-text text-transparent">
                        EFFORTLESS STYLE.
                      </span>
                    </h1>
                    <p className="text-xs sm:text-sm text-neutral-600 max-w-md leading-relaxed font-normal">
                      Structured boxy proportions cut from custom-milled organic combed cotton with tension-locked anti-sag collar ribbing.
                    </p>
                  </div>

                  {/* Action Controls */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                    <a
                      href={heroConfig?.primaryButtonUrl || "#catalog"}
                      className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-black text-white text-xs font-mono font-bold uppercase tracking-widest hover:bg-neutral-800 active:scale-[0.98] transition-all shadow-md group cursor-pointer"
                    >
                      <span>{heroConfig?.primaryButtonText || "EXPLORE CAPSULE"}</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </a>

                    <Link
                      href={heroConfig?.secondaryButtonUrl || "/track"}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200/80 text-xs font-mono font-bold uppercase tracking-wider text-neutral-800 transition-colors cursor-pointer"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{heroConfig?.secondaryButtonText || "TRACK ORDER"}</span>
                    </Link>
                  </div>

                  {/* Refined Spec Metric Cards */}
                  <div className="pt-6 sm:pt-8 border-t border-neutral-200/80 grid grid-cols-3 gap-2.5 sm:gap-6 text-neutral-800">
                    <div className="bg-neutral-50 sm:bg-transparent p-3 sm:p-0 rounded border border-neutral-200/60 sm:border-0 text-center sm:text-left">
                      <span className="text-[9px] sm:text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">
                        {heroConfig?.spec1Label || "FABRIC DENSITY"}
                      </span>
                      <span className="text-xs sm:text-sm font-black font-mono text-black mt-0.5 block">
                        {heroConfig?.spec1Value || "240 GSM"}
                      </span>
                    </div>
                    <div className="bg-neutral-50 sm:bg-transparent p-3 sm:p-0 rounded border border-neutral-200/60 sm:border-0 text-center sm:text-left">
                      <span className="text-[9px] sm:text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">
                        {heroConfig?.spec2Label || "COLLAR SPEC"}
                      </span>
                      <span className="text-xs sm:text-sm font-black font-mono text-black mt-0.5 block">
                        {heroConfig?.spec2Value || "ZERO-SAG"}
                      </span>
                    </div>
                    <div className="bg-neutral-50 sm:bg-transparent p-3 sm:p-0 rounded border border-neutral-200/60 sm:border-0 text-center sm:text-left">
                      <span className="text-[9px] sm:text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">
                        {heroConfig?.spec3Label || "LIMITED RUN"}
                      </span>
                      <span className="text-xs sm:text-sm font-black font-mono text-black mt-0.5 block">
                        {heroConfig?.spec3Value || "250 UNITS"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Clean Editorial Minimal Lookbook Visual Canvas */}
                <div className="lg:col-span-6">
                  <div className="relative aspect-4/5 sm:aspect-1/1 lg:aspect-4/5 w-full max-w-lg mx-auto bg-neutral-900 overflow-hidden shadow-2xl group">
                    {/* Visual Slide Showcase */}
                    {heroSlides.length > 0 ? (
                      <>
                        {heroSlides.map((slide, idx) => (
                          <div
                            key={slide.id ?? idx}
                            className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-out ${currentSlide === idx
                              ? "opacity-100 scale-100 z-10"
                              : "opacity-0 scale-105 pointer-events-none z-0"
                              }`}
                          >
                            <img
                              src={slide.img}
                              alt={slide.title}
                              className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                            />
                            {/* Subtle Minimal Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10 pointer-events-none" />

                            {/* Minimal Info Card in Visual */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white flex items-end justify-between">
                              <div>
                                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-300 block mb-1">
                                  {slide.tag}
                                </span>
                                <p className="text-base sm:text-lg font-bold uppercase tracking-tight text-white font-mono">
                                  {slide.title}
                                </p>
                              </div>
                              <span className="text-xs font-mono text-neutral-400">
                                {String(idx + 1).padStart(2, "0")} / {String(heroSlides.length).padStart(2, "0")}
                              </span>
                            </div>
                          </div>
                        ))}

                        {/* Floating Minimal Switcher Controls */}
                        {heroSlides.length > 1 && (
                          <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-md p-1.5 border border-white/20">
                            {heroSlides.map((_, idx) => (
                              <button
                                key={idx}
                                aria-label={`Slide ${idx + 1}`}
                                onClick={() => setCurrentSlide(idx)}
                                className={`w-2 h-2 rounded-full transition-all ${currentSlide === idx
                                  ? "bg-white scale-125"
                                  : "bg-white/40 hover:bg-white/80"
                                  }`}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-neutral-950 text-neutral-500 font-mono text-xs gap-3 p-6 text-center">
                        <div className="w-8 h-8 border border-neutral-700 border-t-white rounded-full animate-spin" />
                        <span className="tracking-widest uppercase text-[11px] text-neutral-400">
                          LOADING CAPSULE LOOKBOOK...
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Minimal Sub-caption Bar */}
                  {heroSlides.length > 0 && (
                    <div className="mt-4 flex items-center justify-between text-xs font-mono text-neutral-500 px-1">
                      <span className="uppercase text-[11px] tracking-wider">
                        ISLAND-WIDE LKR 425 FLAT DISPATCH
                      </span>
                      {heroSlides.length > 1 && (
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={handlePrevSlide}
                            className="hover:text-black uppercase transition-colors"
                          >
                            [ PREV ]
                          </button>
                          <button
                            type="button"
                            onClick={handleNextSlide}
                            className="hover:text-black uppercase transition-colors"
                          >
                            [ NEXT ]
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* CATALOG SECTION: DROP 01 // CORE EDITIONS (API INTEGRATED)                 */}
          {/* ========================================================================= */}
          <section
            className="w-full px-4 md:px-8 lg:px-12 py-12 md:py-16 bg-white border-b border-neutral-200"
            id="catalog"
          >
            <div className="max-w-7xl mx-auto">
              {/* Header & Controls */}
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-neutral-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-black rounded-full"></span>
                    <span className="font-mono text-[11px] uppercase text-neutral-600 font-bold">
                      ARCHIVE CAPSULE
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl uppercase text-[#0a0a0a] tracking-tight mt-1 font-extrabold">
                    DROP 01 // CORE EDITIONS
                  </h2>
                </div>

                <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="font-mono text-[11px] text-neutral-600 font-medium hidden sm:inline">
                    {loadingProducts
                      ? "FETCHING TELEMETRY..."
                      : `SHOWING ${displayedProducts.length} ALLOCATED STYLES`}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      aria-label="Scroll catalog left"
                      onClick={() => scrollCatalog("left")}
                      className="w-9 h-9 rounded border border-neutral-200 hover:border-black bg-neutral-100 hover:bg-black text-black hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      aria-label="Scroll catalog right"
                      onClick={() => scrollCatalog("right")}
                      className="w-9 h-9 rounded border border-neutral-200 hover:border-black bg-neutral-100 hover:bg-black text-black hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => setSelectedCategory("featured")}
                      className={`px-3 py-1.5 font-mono text-[11px] uppercase transition-colors rounded font-bold cursor-pointer ${selectedCategory === "featured"
                        ? "bg-black text-white"
                        : "bg-neutral-100 border border-neutral-200 text-black hover:bg-neutral-200"
                        }`}
                    >
                      FEATURED EDITIONS
                    </button>

                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`px-3 py-1.5 font-mono text-[11px] uppercase transition-colors rounded font-bold cursor-pointer ${selectedCategory === "all"
                        ? "bg-black text-white"
                        : "bg-neutral-100 border border-neutral-200 text-black hover:bg-neutral-200"
                        }`}
                    >
                      ALL PRODUCTS
                    </button>

                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.slug)}
                        className={`px-3 py-1.5 font-mono text-[11px] uppercase transition-colors rounded font-bold cursor-pointer ${selectedCategory === cat.slug
                          ? "bg-black text-white"
                          : "bg-neutral-100 border border-neutral-200 text-black hover:bg-neutral-200"
                          }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Error Notice */}
              {apiError && (
                <div className="mb-6 p-4 bg-neutral-50 border border-neutral-200 rounded text-neutral-600 font-mono text-xs flex items-center justify-between">
                  <span>{apiError}</span>
                  <button
                    onClick={() => loadProducts(selectedCategory)}
                    className="underline hover:text-black cursor-pointer font-bold uppercase"
                  >
                    Retry Connection
                  </button>
                </div>
              )}

              {/* Product Grid / Slider Track */}
              <div
                ref={catalogTrackRef}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto no-scrollbar scroll-smooth"
                id="catalog-slider-track"
              >
                {loadingProducts
                  ? // Skeletons while loading from API
                  Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={`skeleton-${i}`}
                      className="flex flex-col bg-white p-3 rounded-lg border border-neutral-200 animate-pulse min-w-[270px] sm:min-w-0"
                    >
                      <div className="w-full aspect-[4/5] bg-neutral-100 rounded"></div>
                      <div className="pt-4 space-y-2">
                        <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                        <div className="h-3 bg-neutral-100 rounded w-1/2"></div>
                        <div className="h-8 bg-neutral-100 rounded mt-4"></div>
                      </div>
                    </div>
                  ))
                  : displayedProducts.map((product) => {
                    const metrics = getProductMetrics(product);
                    const currentSelectedSize =
                      selectedSizes[product.id] ||
                      product.availableSizes?.[0] ||
                      "M";
                    const isFavorited = wishlistItems.includes(product.id);
                    const subtitle = `${product.categoryName || "Premium Edition"} // ${product.availableColors?.[0] || "Standard Dye"
                      }`;

                    const displayImageUrl =
                      product.primaryImageUrl ||
                      product.images?.find((img) => img.isPrimary)?.imageUrl ||
                      product.images?.[0]?.imageUrl;

                    const secondaryImageUrl =
                      product.images?.find(
                        (img) => img.imageUrl && img.imageUrl !== displayImageUrl
                      )?.imageUrl ||
                      product.images?.[1]?.imageUrl ||
                      displayImageUrl;

                    return (
                      <div
                        key={product.id}
                        className="group flex flex-col bg-white p-3 rounded-lg border border-neutral-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 min-w-[270px] sm:min-w-0"
                      >
                        <Link href={`/products/${product.slug}`} className="block relative w-full aspect-[4/5] bg-neutral-100 overflow-hidden rounded cursor-pointer">
                          {displayImageUrl ? (
                            <>
                              <img
                                alt={product.name}
                                className="w-full h-full object-cover object-top transition-all duration-700 ease-out group-hover:scale-105"
                                src={displayImageUrl}
                                loading="lazy"
                                decoding="async"
                              />
                              {secondaryImageUrl && secondaryImageUrl !== displayImageUrl && (
                                <img
                                  alt={`${product.name} alternate view`}
                                  className="w-full h-full object-cover object-top absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out group-hover:scale-105"
                                  src={secondaryImageUrl}
                                  loading="lazy"
                                  decoding="async"
                                />
                              )}
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-mono text-xs text-neutral-400">
                              NO IMAGE
                            </div>
                          )}

                          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded font-mono text-[10px] text-black font-bold uppercase border border-neutral-200 shadow-xs">
                            {metrics.badge}
                          </div>

                          {/* Allocation Badge showing REAL backend stock */}
                          <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-2 rounded border border-neutral-200 shadow-xs">
                            <div className="flex items-center justify-between font-mono text-[10px] text-neutral-800 mb-1">
                              <span className="font-semibold">
                                {metrics.stockHeader}
                              </span>
                              <span
                                className={`font-bold ${metrics.isOutOfStock
                                  ? "text-neutral-400"
                                  : metrics.isUrgent
                                    ? "text-red-600"
                                    : "text-black"
                                  }`}
                              >
                                {metrics.stockText}
                              </span>
                            </div>
                            <div className="w-full bg-neutral-100 h-1 rounded-full overflow-hidden border border-neutral-200">
                              <div
                                className={`h-full ${metrics.isOutOfStock
                                  ? "bg-neutral-300"
                                  : metrics.isUrgent
                                    ? "bg-red-600"
                                    : "bg-black"
                                  }`}
                                style={{
                                  width: `${metrics.stockPercent}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </Link>

                        <div className="pt-4 px-1 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <Link href={`/products/${product.slug}`} className="hover:underline">
                                <h3 className="text-base text-[#0a0a0a] uppercase font-bold leading-tight">
                                  {product.name}
                                </h3>
                              </Link>
                              <span className="text-sm font-bold text-black whitespace-nowrap font-mono">
                                LKR {product.basePrice.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-600 mt-1 font-normal">
                              {subtitle}
                            </p>
                            <div className="flex items-center gap-1 mt-2 text-neutral-600 font-mono text-[10px] font-medium">
                              <span className="text-black font-semibold">
                                HEAVYWEIGHT
                              </span>
                              <span>•</span>
                              <span>100% COMBED COTTON</span>
                            </div>

                            {/* Estimated Delivery Time SLA Badge */}
                            <div className="flex items-center justify-between px-2.5 py-1.5 mt-2.5 bg-neutral-900 text-white rounded font-mono text-[10px] tracking-tight shadow-xs border border-neutral-800">
                              <div className="flex items-center gap-1.5">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="font-medium text-neutral-200">
                                  Colombo: <strong className="text-emerald-400 font-bold">24H</strong>
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-neutral-400 border-l border-neutral-700/80 pl-2">
                                <Truck className="w-3 h-3 text-neutral-300" />
                                <span>Island: <strong className="text-white">2–3 Days</strong></span>
                              </div>
                            </div>
                          </div>

                          {/* Quick Size Selection & Bag */}
                          <div className="mt-4 pt-2 border-t border-neutral-100">
                            <div className="flex items-center justify-between gap-1 mb-2">
                              <span className="font-mono text-[10px] text-neutral-600 font-semibold">
                                SIZES:
                              </span>
                              <div className="flex gap-1">
                                {(product.availableSizes?.length
                                  ? product.availableSizes
                                  : ["S", "M", "L", "XL"]
                                ).map((sz) => {
                                  const isSelected =
                                    currentSelectedSize === sz;
                                  const variant = product.variants?.find(
                                    (v) =>
                                      v.size.toUpperCase() === sz.toUpperCase()
                                  );
                                  const isVariantOutOfStock =
                                    variant && variant.stockQuantity <= 0;

                                  return (
                                    <button
                                      key={sz}
                                      type="button"
                                      disabled={isVariantOutOfStock}
                                      title={
                                        variant
                                          ? `${variant.stockQuantity} units available`
                                          : undefined
                                      }
                                      onClick={() =>
                                        handleSelectSize(product.id, sz)
                                      }
                                      className={`px-2 py-0.5 font-mono text-[10px] rounded transition-colors cursor-pointer ${isSelected
                                        ? "bg-black text-white font-bold"
                                        : isVariantOutOfStock
                                          ? "bg-neutral-50 text-neutral-300 line-through cursor-not-allowed border border-neutral-100"
                                          : "bg-neutral-100 text-black border border-neutral-200 hover:bg-black hover:text-white"
                                        }`}
                                    >
                                      {sz}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <button
                              type="button"
                              disabled={metrics.isOutOfStock}
                              onClick={() => handleAddToBag(product)}
                              className={`w-full py-2.5 font-mono text-xs uppercase rounded flex items-center justify-center gap-2 font-bold transition-all ${metrics.isOutOfStock
                                ? "bg-neutral-200 text-neutral-500 cursor-not-allowed"
                                : "btn-add-to-bag cursor-pointer active:scale-98"
                                }`}
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>
                                {metrics.isOutOfStock
                                  ? "SOLD OUT"
                                  : "ADD TO BAG"}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {!loadingProducts && displayedProducts.length > 0 && products.length > 4 && (
                <div className="mt-10 flex justify-center">
                  <Link
                    href={selectedCategory && selectedCategory !== "all" && selectedCategory !== "featured" ? `/products?category=${selectedCategory}` : "/products"}
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-none bg-black text-white hover:bg-neutral-800 text-xs font-mono uppercase tracking-widest font-bold transition-all border border-black group"
                  >
                    <span>EXPLORE ALL {products.length} PRODUCTS IN CAPSULE</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              )}

              {!loadingProducts && products.length === 0 && (
                <div className="text-center py-12 text-neutral-500 font-mono text-xs">
                  No products found in this category.
                </div>
              )}
            </div>
          </section>

          {/* ========================================================================= */}
          {/* LOOKBOOK & EDITORIAL CAMPAIGNS (Configured by Admin in Backend)          */}
          {/* ========================================================================= */}
          {lookbooks.length > 0 && (
            <section
              className="w-full bg-white py-12 md:py-16 px-4 md:px-8 lg:px-12 border-b border-neutral-200"
              id="lookbook"
            >
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-3 border-b border-neutral-200">
                  <div>
                    <span className="font-mono text-[10px] uppercase text-neutral-600 tracking-widest font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-black inline-block" />
                      CALVIZ EDITORIAL // SEASON HIGHLIGHTS
                    </span>
                    <h2 className="text-2xl md:text-3xl text-[#0a0a0a] uppercase mt-1 font-extrabold tracking-tight">
                      SIGNATURE LOOKBOOK &amp; CAMPAIGNS
                    </h2>
                  </div>
                  <div className="mt-2 md:mt-0 flex items-center gap-4">
                    <p className="font-mono text-[11px] text-neutral-600 font-medium hidden sm:block">
                      CURATED VISUAL STORIES &amp; ATELIER SILHOUETTES
                    </p>
                    <Link
                      href="/products"
                      className="font-mono text-xs text-black font-bold uppercase underline underline-offset-4 hover:text-neutral-600 inline-flex items-center gap-1"
                    >
                      <span>EXPLORE ALL</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Asymmetrical Bento Gallery */}
                {(() => {
                  const featured = lookbooks.find((b) => b.isLarge) || lookbooks[0];
                  const secondary = lookbooks.filter((b) => b.id !== featured.id).slice(0, 2);

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
                      {/* Primary Featured Frame */}
                      {featured && (
                        <Link
                          href={featured.linkUrl || "/products"}
                          className="md:col-span-6 relative group overflow-hidden bg-neutral-100 rounded-lg border border-neutral-200 shadow-xs flex flex-col justify-between"
                        >
                          <div className="aspect-[4/5] w-full overflow-hidden relative">
                            <img
                              alt={featured.title}
                              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                              src={featured.imageUrl}
                              loading="lazy"
                              decoding="async"
                            />
                            {featured.badgeText && (
                              <div className="absolute top-3 left-3 bg-black/90 backdrop-blur-sm text-white px-3 py-1 rounded font-mono text-xs uppercase font-extrabold border border-white/20 tracking-wider">
                                {featured.badgeText}
                              </div>
                            )}
                          </div>
                          <div className="p-6 bg-white border-t border-neutral-200">
                            <div className="flex items-center justify-between font-mono text-xs text-neutral-500 uppercase font-bold tracking-wider">
                              <span>{featured.subtitle || "LOOKBOOK // COLOMBO ATELIER"}</span>
                              <span className="text-black group-hover:translate-x-1 transition-transform font-extrabold flex items-center gap-1">
                                VIEW CAMPAIGN →
                              </span>
                            </div>
                            <h3 className="text-xl md:text-2xl text-[#0a0a0a] font-black mt-2 uppercase tracking-tight group-hover:underline">
                              {featured.title}
                            </h3>
                            {featured.description && (
                              <p className="text-sm text-neutral-600 mt-2 line-clamp-2 font-medium leading-relaxed">
                                {featured.description}
                              </p>
                            )}
                          </div>
                        </Link>
                      )}

                      {/* Secondary Stack (Secondary banners + Atelier Quality Card) */}
                      <div className="md:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {secondary.map((banner) => (
                          <Link
                            key={banner.id}
                            href={banner.linkUrl || "/products"}
                            className="flex flex-col bg-white rounded-lg border border-neutral-200 overflow-hidden group shadow-xs justify-between"
                          >
                            <div className="aspect-[4/5] w-full bg-neutral-100 overflow-hidden relative">
                              <img
                                alt={banner.title}
                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                src={banner.imageUrl}
                                loading="lazy"
                                decoding="async"
                              />
                              {banner.badgeText && (
                                <div className="absolute top-2.5 left-2.5 bg-black/90 backdrop-blur-sm text-white px-2.5 py-1 rounded font-mono text-[10px] uppercase font-extrabold border border-white/20 tracking-wider">
                                  {banner.badgeText}
                                </div>
                              )}
                            </div>
                            <div className="p-4 sm:p-5 bg-white border-t border-neutral-200 flex flex-col justify-between flex-1">
                              <div>
                                <span className="font-mono text-xs text-neutral-500 uppercase tracking-wider font-bold block truncate mb-1">
                                  {banner.subtitle || "STUDIO STUDY"}
                                </span>
                                <h4 className="text-base sm:text-lg font-black text-[#0a0a0a] uppercase tracking-tight group-hover:underline leading-snug">
                                  {banner.title}
                                </h4>
                              </div>
                              <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between font-mono text-[11px] font-bold text-black uppercase">
                                <span>EXPLORE STUDY</span>
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                              </div>
                            </div>
                          </Link>
                        ))}

                        {/* Atelier Quality Monograph Card */}
                        <div className={`bg-black text-white p-6 sm:p-7 rounded-lg flex flex-col justify-between ${secondary.length < 2 ? "sm:col-span-2" : "sm:col-span-2"}`}>
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs uppercase tracking-widest text-neutral-400 font-bold">
                              ATELIER MANIFESTO
                            </span>
                            <span className="font-mono text-[10px] bg-neutral-800 text-neutral-300 px-2.5 py-1 rounded uppercase font-bold tracking-wider">
                              HEAVYWEIGHT
                            </span>
                          </div>
                          <blockquote className="text-sm md:text-base text-neutral-200 my-4 font-semibold leading-relaxed italic">
                            "We rejected featherweight mall-grade jersey. CALVIZ was created to manifest real tactile presence. When you wear this, it holds its own spatial perimeter."
                          </blockquote>
                          <div className="flex items-center justify-between text-neutral-400 font-mono text-xs font-semibold pt-3 border-t border-neutral-800">
                            <span className="text-neutral-300 font-bold">CALVIZ ATELIER // COLOMBO</span>
                            <Link href="/products" className="text-white font-bold underline underline-offset-4 hover:text-neutral-300 transition-colors">
                              BROWSE ALL DROPS →
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </section>
          )}

          {/* ========================================================================= */}
          {/* CURATED OFFERS & CLIENT PRIVILEGES BANNERS (DYNAMIC FROM ADMIN CMS)        */}
          {/* ========================================================================= */}
          {offersConfig.isActive !== false && (
            <section
              className="w-full px-4 md:px-8 lg:px-12 py-12 md:py-16 bg-[#080808] text-white border-b border-neutral-800 relative overflow-hidden"
              id="offers"
            >
              {/* Ambient Background Glows */}
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-white/[0.03] rounded-full blur-[120px] pointer-events-none"></div>

              <div className="max-w-7xl mx-auto space-y-8 relative z-10">
                {/* Header & Animated Live Status */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-neutral-800/80">
                  <div>
                    <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-neutral-400 font-bold mb-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>
                      <span>{offersConfig.tagline || "SEASONAL PRIVILEGES & CLIENT OFFERS"}</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl text-white uppercase font-extrabold tracking-tight leading-none">
                      {offersConfig.title || "CURATED ATELIER OFFERS"}
                    </h2>
                    <p className="text-sm md:text-base text-neutral-400 mt-2 max-w-2xl font-normal">
                      {offersConfig.subtitle || "Exclusive wardrobe incentives, complimentary island-wide logistics, and doorstep assurance for the discerning client."}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 font-mono text-xs text-neutral-400 font-semibold bg-neutral-900/80 px-3 py-1.5 rounded-lg border border-neutral-800">
                    <Tag className="w-3.5 h-3.5 text-amber-400" />
                    <span>{offersConfig.noteBadge || "ALL OFFERS ACTIVE FOR DROP 01 ARCHIVE"}</span>
                  </div>
                </div>

                {/* Animated Privileges Marquee Ticker */}
                {offersConfig.marqueeText && (
                  <div className="relative overflow-hidden w-full bg-neutral-900/90 border border-neutral-800 rounded-lg py-2.5">
                    <div className="animate-marquee whitespace-nowrap flex items-center gap-8 text-xs font-mono font-bold tracking-widest uppercase text-neutral-300">
                      <span>{offersConfig.marqueeText}</span>
                      <span>{offersConfig.marqueeText}</span>
                    </div>
                  </div>
                )}

                {/* Main Featured Promo Banner with Background Image & Parallax Hover */}
                <div className="group relative overflow-hidden rounded-2xl bg-neutral-950 text-white border border-neutral-800 shadow-2xl transition-all duration-500 hover:border-neutral-700">
                  {/* Background Image with Zoom & Dark Gradient Overlay */}
                  <div className="absolute inset-0 overflow-hidden">
                    <img
                      src={offersConfig.heroImageUrl || "https://lh3.googleusercontent.com/aida/AEtjO1W2UlicQK-ALNnpCFI_VnuAFHutBsM5uozFpmtPjMXZsKgJaWhuXUp4SDT1tJNzteqkhaiH2znBpGa_yQ2sr3WBt_5huSnSvMcSV6thVGD_KhYlLUIVjIqtwj2g5iI8la0TFUIpcr1C06lWj9EtWpnFrZ06wCyOupxEFBXyjgGa-3zYp-HEWnXyUBhZqXtBhAWnLx6mdqBN9l2gOhTIPTpQU8-meqP0eOIh29qFsd0yU35In11zyiQ7kKk"}
                      alt="CALVIZ Archival Heavyweight Model Editorial"
                      className="w-full h-full object-cover object-center opacity-35 scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
                      loading="lazy"
                      decoding="async"
                    />
                    {/* High-contrast multi-stop vignette gradients */}
                    <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black via-black/90 sm:via-black/85 to-black/40"></div>
                  </div>

                  <div className="relative z-10 p-6 md:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-7 space-y-4">
                      <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-300 backdrop-blur-md border border-amber-500/30 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase shadow-xs">
                        <Gift className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                        <span>{offersConfig.heroBadge || "CAPSULE BUNDLE PRIVILEGE"}</span>
                      </div>

                      <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white leading-tight">
                        {offersConfig.heroTitle || "ARCHIVAL DUO BUNDLE: SAVE 10% ON 2+ TEES"}
                      </h3>

                      <p className="text-sm sm:text-base text-neutral-300 max-w-xl leading-relaxed">
                        {offersConfig.heroDescription || "Upgrade your daily rotation. Add any two or more heavyweight tees across Drop 01 to your cart and claim an instant 10% privilege discount."}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        {offersConfig.heroPromoCode && (
                          <div className="flex items-center bg-black/80 backdrop-blur-md border border-neutral-700 hover:border-amber-400/60 rounded-xl p-1.5 pl-3.5 gap-3 shadow-lg transition-colors">
                            <span className="font-mono text-xs text-neutral-400 uppercase font-semibold">
                              CODE:
                            </span>
                            <span className="font-mono text-sm sm:text-base font-bold text-white tracking-widest bg-neutral-800/90 px-3 py-1 rounded-md border border-neutral-600">
                              {offersConfig.heroPromoCode}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyPromo(offersConfig.heroPromoCode)}
                              className="inline-flex items-center gap-1.5 bg-white text-black hover:bg-neutral-200 active:scale-95 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all shadow-sm"
                            >
                              {copiedPromo === offersConfig.heroPromoCode ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                                  <span className="text-emerald-700">COPIED!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>COPY CODE</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}

                        <span className="text-[10px] font-mono text-amber-300/80 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>Valid on 2+ garments • Limit 1 per client</span>
                        </span>

                        <a
                          href={offersConfig.heroButtonUrl || "#catalog"}
                          className="inline-flex items-center gap-2 bg-white/10 hover:bg-white text-white hover:text-black px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase transition-all duration-300 border border-white/20 backdrop-blur-md group-hover:border-white"
                        >
                          <span>{offersConfig.heroButtonText || "EXPLORE CAPSULE"}</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </a>
                      </div>
                    </div>

                    {/* Highlights Matrix Card */}
                    <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                      {offersConfig.heroPerk1Title && (
                        <div className="bg-neutral-900/80 backdrop-blur-md border border-neutral-800 hover:border-neutral-700 p-4 rounded-xl flex items-start gap-3.5 transition-all">
                          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5 text-amber-400">
                            <Percent className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-mono font-bold uppercase text-white tracking-wide">
                              {offersConfig.heroPerk1Title}
                            </div>
                            <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                              {offersConfig.heroPerk1Description}
                            </p>
                          </div>
                        </div>
                      )}

                      {offersConfig.heroPerk2Title && (
                        <div className="bg-neutral-900/80 backdrop-blur-md border border-neutral-800 hover:border-neutral-700 p-4 rounded-xl flex items-start gap-3.5 transition-all">
                          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5 text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-mono font-bold uppercase text-white tracking-wide">
                              {offersConfig.heroPerk2Title}
                            </div>
                            <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                              {offersConfig.heroPerk2Description}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3 Companion Offer & Privilege Cards with Custom Background Images & Hover Lift */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {offerCards.map((card, idx) => (
                    <div
                      key={card.id || idx}
                      className="group relative overflow-hidden rounded-2xl bg-neutral-950 border border-neutral-800 p-6 flex flex-col justify-between space-y-6 hover:-translate-y-1.5 transition-all duration-500 hover:border-amber-500/50 hover:shadow-xl hover:shadow-black/40 min-h-[250px]"
                    >
                      {/* Card Background Image */}
                      {card.imageUrl && (
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                          <img
                            src={card.imageUrl}
                            alt={card.title}
                            className="w-full h-full object-cover opacity-20 scale-100 group-hover:scale-110 transition-transform duration-700 ease-out"
                            loading="lazy"
                            decoding="async"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/90 to-neutral-950/60"></div>
                        </div>
                      )}

                      <div className="relative z-10 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                            {card.icon?.toLowerCase() === "truck" ? (
                              <Truck className="w-5 h-5" />
                            ) : card.icon?.toLowerCase() === "shieldcheck" ? (
                              <ShieldCheck className="w-5 h-5" />
                            ) : (
                              <Flame className="w-5 h-5" />
                            )}
                          </div>
                          {card.badge && (
                            <span className="font-mono text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full backdrop-blur-xs">
                              {card.badge}
                            </span>
                          )}
                        </div>
                        <h4 className="text-lg font-bold uppercase text-white tracking-tight pt-1">
                          {card.title}
                        </h4>
                        <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                          {card.description}
                        </p>
                      </div>

                      <div className="relative z-10 pt-3 border-t border-neutral-800/80 flex items-center justify-between">
                        <span className="font-mono text-[11px] text-neutral-400 font-semibold">
                          {card.footerTag}
                        </span>
                        <a
                          href={card.buttonUrl || "#catalog"}
                          className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
                        >
                          <span>{card.buttonText || "LEARN MORE"}</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ========================================================================= */}
          {/* CLIENT ASSURANCE & 24-HOUR DISPATCH LOGISTICS                             */}
          {/* ========================================================================= */}
          <section
            className="w-full bg-white py-12 md:py-16 px-4 md:px-8 lg:px-12 border-b border-neutral-200"
            id="doorstep-delivery"
          >
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Logistics Content */}
                <div className="lg:col-span-6 space-y-4 order-2 lg:order-1">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-600 font-bold block">
                    FULFILLMENT DISPATCH INFRASTRUCTURE
                  </span>
                  <h2 className="text-3xl md:text-4xl text-[#0a0a0a] uppercase leading-tight font-extrabold">
                    DOORSTEP DELIVERY IN 24 HOURS &amp; RELENTLESS DISPATCH
                  </h2>
                  <p className="text-base text-neutral-700 leading-relaxed font-normal">
                    We deliver precision, quality, and speed directly to your doorstep. Enjoy rapid 24-hour door-to-door express courier fulfillment across Colombo and express dispatch across Sri Lanka.
                  </p>

                  {/* Timeline Steps */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                      <span className="font-mono text-xs font-bold text-black px-2 py-0.5 bg-neutral-200 rounded border border-neutral-300">
                        01
                      </span>
                      <div>
                        <h4 className="text-sm text-[#0a0a0a] font-bold">
                          Rapid 24-Hour Dispatch
                        </h4>
                        <p className="text-xs text-neutral-600 mt-0.5">
                          Orders confirmed before 2:00 PM dispatched same-day with live SMS tracking.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                      <span className="font-mono text-xs font-bold text-black px-2 py-0.5 bg-neutral-200 rounded border border-neutral-300">
                        02
                      </span>
                      <div>
                        <h4 className="text-sm text-[#0a0a0a] font-bold">
                          Direct Doorstep Handover
                        </h4>
                        <p className="text-xs text-neutral-600 mt-0.5">
                          Sealed luxury packaging delivered to your door. Pay securely via Cash on Delivery, Card POS or Bank Transfer.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                      <span className="font-mono text-xs font-bold text-black px-2 py-0.5 bg-neutral-200 rounded border border-neutral-300">
                        03
                      </span>
                      <div>
                        <h4 className="text-sm text-[#0a0a0a] font-bold">
                          7-Day Sizing Exchange Guarantee
                        </h4>
                        <p className="text-xs text-neutral-600 mt-0.5">
                          If shoulder drop or length needs adjusting, our courier delivers your replacement size right to your door.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 pt-2 font-mono text-[11px] text-neutral-700 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-black" />
                      <span>COLOMBO 24H EXPRESS</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-black" />
                      <span>ISLAND-WIDE COVERAGE</span>
                    </div>
                  </div>
                </div>

                {/* Logistics Editorial Rider Image */}
                <div className="lg:col-span-6 order-1 lg:order-2">
                  <div className="relative rounded-lg overflow-hidden border border-neutral-200 shadow-md bg-neutral-100 aspect-[16/10]">
                    <img
                      alt="CALVIZ doorstep express delivery courier handing package directly to client"
                      className="w-full h-full object-cover"
                      src="/doorstep-delivery.jpg"
                    />
                    <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3 rounded-lg border border-neutral-200 flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-black animate-pulse"></span>
                        <span className="font-mono text-[10px] uppercase text-black font-bold">
                          COURIER PARTNERS: Royal Express Courier & Logistics (Pvt) Ltd
                        </span>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* VIP DROP 02 PRIORITY RESERVATION BANNER                                   */}
          {/* ========================================================================= */}
          <section className="w-full px-4 md:px-8 lg:px-12 py-12 md:py-16 bg-white" id="vip-reservation">
            <div className="max-w-7xl mx-auto">
              <div className="bg-black text-white rounded-xl p-8 md:p-14 relative overflow-hidden shadow-2xl">
                {/* Background Accents */}
                <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-neutral-800/40 pointer-events-none"></div>
                <div className="absolute -left-20 -top-20 w-60 h-60 rounded-full bg-neutral-800/40 pointer-events-none"></div>

                <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-800 text-white font-mono text-[11px] uppercase font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                    ACCESS PROTOCOL // DROP 02
                  </div>

                  <h2 className="text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-white font-extrabold leading-tight">
                    SECURE EARLY ALLOCATION FOR DROP 02
                  </h2>

                  <p className="text-base text-neutral-300 max-w-2xl mx-auto font-normal leading-relaxed">
                    Due to strict artisanal milling batches, each edition is strictly limited to 250 units. Enter your WhatsApp or SMS contact to receive 2-hour priority checkout before public unveiling.
                  </p>

                  {/* Input Registration Form */}
                  {vipSuccess ? (
                    <div className="max-w-lg mx-auto p-4 bg-neutral-900 border border-neutral-700 rounded text-center space-y-1 animate-fade-in">
                      <p className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                        TRANSMISSION REGISTERED
                      </p>
                      <p className="text-[11px] text-neutral-400 font-mono">
                        Your mobile has been registered for VIP Drop 02 early dispatch allocation.
                      </p>
                    </div>
                  ) : (
                    <form
                      onSubmit={handleVipSubmit}
                      className="max-w-lg mx-auto flex flex-col gap-2 pt-2"
                    >
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className={`flex-1 flex bg-white rounded border overflow-hidden transition-all ${vipError ? "border-rose-500 ring-1 ring-rose-500" : "border-neutral-300 focus-within:border-black"}`}>
                          <span className="inline-flex items-center px-3 bg-neutral-100 text-black font-mono text-xs font-bold border-r border-neutral-200">
                            +94
                          </span>
                          <input
                            type="tel"
                            required
                            value={phoneInput}
                            onChange={(e) => {
                              // Allow only numbers, spaces, hyphens
                              const clean = e.target.value.replace(/[^0-9\s\-]/g, "");
                              setPhoneInput(clean);
                              if (vipError) setVipError(null);
                            }}
                            placeholder="77 XXX XXXX (9-digit mobile)"
                            maxLength={15}
                            className="w-full bg-transparent px-3 py-2.5 text-[#0a0a0a] font-mono text-xs outline-none"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={vipLoading}
                          className="bg-white text-black px-6 py-2.5 font-mono text-xs uppercase hover:bg-neutral-100 transition-colors rounded font-bold cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                          {vipLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          {vipLoading ? "VALIDATING..." : "REQUEST ACCESS"}
                        </button>
                      </div>
                      {vipError && (
                        <p className="text-rose-400 font-mono text-[11px] text-left pt-1">
                          ⚠️ {vipError}
                        </p>
                      )}
                    </form>
                  )}

                  <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-neutral-300 font-mono text-[11px]">
                    <a
                      href="https://wa.me/94704901027"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 px-3.5 py-1.5 rounded-full transition-all text-white group cursor-pointer shadow-xs"
                    >
                      <WhatsAppIcon className="w-4 h-4 text-[#25D366] group-hover:scale-110 transition-transform" />
                      <span>
                        WHATSAPP :{" "}
                        <strong className="text-[#25D366] font-bold">+94 70 490 1027</strong>
                      </span>
                    </a>
                    <span className="hidden sm:inline text-neutral-600">•</span>
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-white" />
                      <span>NO SPAM. ONLY DISPATCH TRANSMISSIONS.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
