"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCartStore } from "@/lib/store/useCartStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import { useAuthModalStore } from "@/lib/store/useAuthModalStore";
import { fetchProducts, fetchCategories, fetchColors } from "@/lib/api";
import { ProductSummary, Category, ColorAttribute } from "@/types";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ShoppingBag,
  Heart,
  Layers,
  Sparkles,
  Flame,
  Tag,
  ArrowRight,
  Check,
  RotateCcw,
  LayoutGrid,
  Grid2X2,
  Filter,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Bell,
} from "lucide-react";
import RestockWaitlistModal, {
  getWaitlistedProductIds,
} from "@/components/RestockWaitlistModal";

function ShopProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialCat = searchParams.get("category") || "all";
  const initialSearch = searchParams.get("search") || "";
  const initialSize = searchParams.get("size") || "all";
  const initialColor = searchParams.get("color") || "all";
  const initialSort = searchParams.get("sort") || "featured";
  const initialFilter = (searchParams.get("filter") || "all") as "all" | "new-arrivals" | "best-selling" | "sale";

  // Data State
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<ColorAttribute[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search State
  const [selectedCurated, setSelectedCurated] = useState<"all" | "new-arrivals" | "best-selling" | "sale">(initialFilter);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [selectedSize, setSelectedSize] = useState<string>(initialSize);
  const [selectedColor, setSelectedColor] = useState<string>(initialColor);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>(initialSort);
  const [priceLimit, setPriceLimit] = useState<number>(15000);

  // Layout View Mode (4 columns vs 2 columns)
  const [viewCols, setViewCols] = useState<3 | 4>(4);

  // Mobile Filter Drawer State
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Selected Sizes State (map of productId -> size)
  const [selectedSizes, setSelectedSizes] = useState<{ [key: string]: string }>({});

  // Cart & Auth & Wishlist Stores
  const { addItem, openCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { items: wishlistItems, toggleItem, setPendingProduct } = useWishlistStore();
  const { openModal } = useAuthModalStore();

  // Restock Notification Waitlist State
  const [waitlistProduct, setWaitlistProduct] = useState<ProductSummary | null>(null);
  const [waitlistSize, setWaitlistSize] = useState<string>("M");
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const [waitlistedIds, setWaitlistedIds] = useState<string[]>([]);

  useEffect(() => {
    setWaitlistedIds(getWaitlistedProductIds());
  }, []);

  const handleOpenWaitlist = (product: ProductSummary, size?: string) => {
    setWaitlistProduct(product);
    setWaitlistSize(size || selectedSizes[product.id] || product.availableSizes?.[0] || "M");
    setIsWaitlistModalOpen(true);
  };

  const handleWaitlistSuccess = (productId: string) => {
    setWaitlistedIds((prev) => (prev.includes(productId) ? prev : [...prev, productId]));
  };

  // Load initial data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [cats, cols, prods] = await Promise.all([
          fetchCategories(),
          fetchColors(),
          fetchProducts(),
        ]);
        setCategories(cats);
        setColors(cols);
        setProducts(prods);

        // Pre-select default sizes
        setSelectedSizes((prev) => {
          const updated = { ...prev };
          prods.forEach((item) => {
            if (!updated[item.id] && item.availableSizes?.length) {
              updated[item.id] = item.availableSizes.includes("M")
                ? "M"
                : item.availableSizes[0];
            }
          });
          return updated;
        });
      } catch (err) {
        console.error("Failed to load catalog data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Update URL Query params on filter changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCurated && selectedCurated !== "all") params.set("filter", selectedCurated);
    if (selectedCategory && selectedCategory !== "all") params.set("category", selectedCategory);
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (selectedSize && selectedSize !== "all") params.set("size", selectedSize);
    if (selectedColor && selectedColor !== "all") params.set("color", selectedColor);
    if (sortBy && sortBy !== "featured") params.set("sort", sortBy);

    const queryString = params.toString();
    const newUrl = queryString ? `/products?${queryString}` : "/products";
    router.replace(newUrl, { scroll: false });
  }, [selectedCurated, selectedCategory, searchQuery, selectedSize, selectedColor, sortBy, router]);

  // All available unique sizes across catalog
  const availableSizesList = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      p.availableSizes?.forEach((s) => set.add(s.toUpperCase()));
    });
    const order = ["XS", "S", "M", "L", "XL", "2XL", "XXL", "3XL"];
    return Array.from(set).sort((a, b) => {
      const idxA = order.indexOf(a);
      const idxB = order.indexOf(b);
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });
  }, [products]);

  // Filtered and sorted products calculation
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Curated Collection Filter (New Arrivals, Best Selling, Sale)
        if (selectedCurated === "new-arrivals" && !p.isNewArrival) return false;
        if (selectedCurated === "best-selling" && !p.isBestSeller) return false;
        if (selectedCurated === "sale" && !(p.isOnSale && p.salePrice && p.salePrice < p.basePrice)) return false;

        // Category Filter
        if (selectedCategory !== "all") {
          const sel = selectedCategory.toLowerCase();
          const matchSlug = p.categorySlug?.toLowerCase() === sel;
          const matchId = p.categoryId?.toLowerCase() === sel;
          const matchName = p.categoryName?.toLowerCase() === sel;
          const matchMulti = p.categories?.some(
            (c) => c.slug?.toLowerCase() === sel || c.id?.toLowerCase() === sel || c.name?.toLowerCase() === sel
          );
          const matchMultiId = p.categoryIds?.some((id) => id?.toLowerCase() === sel);
          if (!matchSlug && !matchId && !matchName && !matchMulti && !matchMultiId) return false;
        }

        // Search Query Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchSlug = p.slug.toLowerCase().includes(q);
          const matchCat = p.categoryName?.toLowerCase().includes(q);
          const matchGsm = p.gsm ? `${p.gsm}`.includes(q) : false;
          if (!matchName && !matchSlug && !matchCat && !matchGsm) return false;
        }

        // Size Filter
        if (selectedSize !== "all") {
          const hasSize = p.availableSizes?.some(
            (s) => s.toUpperCase() === selectedSize.toUpperCase()
          );
          if (!hasSize) return false;
        }

        // Color Filter
        if (selectedColor !== "all") {
          const hasColor = p.availableColors?.some(
            (c) => c.toLowerCase() === selectedColor.toLowerCase()
          );
          if (!hasColor) return false;
        }

        // In-Stock Only
        const totalStock =
          typeof p.totalStock === "number"
            ? p.totalStock
            : p.variants?.reduce((sum, v) => sum + (v.stockQuantity || 0), 0) ?? 0;
        if (inStockOnly && totalStock <= 0) return false;

        // Price Limit (uses effective price)
        const effectivePrice =
          p.isOnSale && p.salePrice && p.salePrice < p.basePrice
            ? p.salePrice
            : p.basePrice;
        if (effectivePrice > priceLimit) return false;

        return true;
      })
      .sort((a, b) => {
        const priceA = a.isOnSale && a.salePrice && a.salePrice < a.basePrice ? a.salePrice : a.basePrice;
        const priceB = b.isOnSale && b.salePrice && b.salePrice < b.basePrice ? b.salePrice : b.basePrice;
        if (sortBy === "price-low") return priceA - priceB;
        if (sortBy === "price-high") return priceB - priceA;
        if (sortBy === "gsm-high") return (b.gsm || 0) - (a.gsm || 0);
        if (sortBy === "bestselling") {
          if (a.isBestSeller && !b.isBestSeller) return -1;
          if (!a.isBestSeller && b.isBestSeller) return 1;
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
        }
        if (sortBy === "sale") {
          const discountPctA = a.isOnSale && a.salePrice && a.salePrice < a.basePrice
            ? ((a.basePrice - a.salePrice) / a.basePrice) : 0;
          const discountPctB = b.isOnSale && b.salePrice && b.salePrice < b.basePrice
            ? ((b.basePrice - b.salePrice) / b.basePrice) : 0;
          return discountPctB - discountPctA;
        }
        if (sortBy === "newest") {
          if (a.isNewArrival && !b.isNewArrival) return -1;
          if (!a.isNewArrival && b.isNewArrival) return 1;
          return b.slug.localeCompare(a.slug);
        }
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [products, selectedCurated, selectedCategory, searchQuery, selectedSize, selectedColor, inStockOnly, priceLimit, sortBy]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCurated !== "all") count++;
    if (selectedCategory !== "all") count++;
    if (searchQuery.trim()) count++;
    if (selectedSize !== "all") count++;
    if (selectedColor !== "all") count++;
    if (inStockOnly) count++;
    if (priceLimit < 15000) count++;
    return count;
  }, [selectedCurated, selectedCategory, searchQuery, selectedSize, selectedColor, inStockOnly, priceLimit]);

  const handleResetFilters = () => {
    setSelectedCurated("all");
    setSelectedCategory("all");
    setSearchQuery("");
    setSelectedSize("all");
    setSelectedColor("all");
    setInStockOnly(false);
    setPriceLimit(15000);
    setSortBy("featured");
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
        description: "Sign in to save this item to your wishlist.",
      });
      return;
    }
    toggleItem(productId);
  };

  const handleAddToBag = (product: ProductSummary) => {
    const stock =
      typeof product.totalStock === "number"
        ? product.totalStock
        : (product.variants?.reduce((sum, v) => sum + (v.stockQuantity || 0), 0) ?? 0);

    if (stock <= 0) return;

    const size = selectedSizes[product.id] || product.availableSizes?.[0] || "M";
    const color = product.availableColors?.[0] || "Monochrome";
    const imageUrl = product.primaryImageUrl || product.images?.[0]?.imageUrl;

    const matchedVariant =
      product.variants?.find((v) => v.size.toUpperCase() === size.toUpperCase()) || product.variants?.[0];

    const actualVariantId = matchedVariant?.id ? String(matchedVariant.id) : `${product.id}-${size}`;

    const effectiveBasePrice =
      product.isOnSale && product.salePrice && product.salePrice < product.basePrice
        ? Number(product.salePrice)
        : Number(product.basePrice);

    addItem({
      variantId: actualVariantId,
      productId: product.id,
      productName: product.name,
      slug: product.slug,
      size: matchedVariant?.size || size,
      color: matchedVariant?.color || color,
      unitPrice: effectiveBasePrice + (matchedVariant?.priceAdjustment || 0),
      quantity: 1,
      imageUrl: imageUrl,
      maxStock: matchedVariant ? matchedVariant.stockQuantity : stock,
    });
    openCart();
  };

  const getProductMetrics = (product: ProductSummary) => {
    const stock =
      typeof product.totalStock === "number"
        ? product.totalStock
        : (product.variants?.reduce((sum, v) => sum + (v.stockQuantity || 0), 0) ?? 0);

    const isOutOfStock = stock <= 0;
    const isUrgent = stock > 0 && stock <= 10;

    let badge = "NEW DROP";
    if (isOutOfStock) {
      badge = "SOLD OUT";
    } else if (product.isOnSale && product.salePrice && product.salePrice < product.basePrice) {
      const discount = Math.round(((product.basePrice - product.salePrice) / product.basePrice) * 100);
      badge = `SALE -${discount}%`;
    } else if (isUrgent) {
      badge = "FEW UNITS LEFT";
    } else if (product.isBestSeller) {
      badge = "🔥 BESTSELLER";
    } else if (product.isNewArrival) {
      badge = "✨ NEW DROP";
    } else if (product.isFeatured) {
      badge = "FEATURED";
    }

    return { badge, isUrgent, isOutOfStock, stock };
  };

  return (
    <div className="space-y-8">
      {/* Editorial Header Banner */}
      <div className="bg-neutral-950 text-white p-6 sm:p-10 border border-neutral-800 shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-neutral-300 text-[10px] font-mono uppercase tracking-widest mb-4 border border-white/10">
            <Layers className="w-3 h-3 text-white" />
            <span>CALVIZ ARCHIVAL DROP REGISTER</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white mb-2">
            All Products
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 font-mono leading-relaxed">
            Engineered heavyweight combed cotton apparel. Custom-milled organic weaves, boxy structural cuts, and reinforced anti-sag collars crafted for the tropics.
          </p>

          {/* Quick Stats Bar */}
          <div className="mt-6 pt-6 border-t border-neutral-800/80 flex flex-wrap gap-6 text-xs font-mono">
            <div>
              <span className="text-neutral-500 uppercase text-[10px] block">TOTAL ARCHIVAL PIECES</span>
              <span className="text-white font-bold">{products.length} Drops Active</span>
            </div>
            <div>
              <span className="text-neutral-500 uppercase text-[10px] block">ISLAND-WIDE DISPATCH</span>
              <span className="text-emerald-400 font-bold">LKR 300 Flat Courier</span>
            </div>
            <div>
              <span className="text-neutral-500 uppercase text-[10px] block">FABRIC STANDARD</span>
              <span className="text-white font-bold">Heavyweight Combed Cotton</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Catalog Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar Filters (3 Cols) */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-28 bg-white border border-neutral-200 p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-black" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-black">
                Filters &amp; Facets
              </h2>
            </div>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] font-mono text-neutral-500 hover:text-black uppercase flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset ({activeFiltersCount})
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono uppercase text-neutral-500 block">Search Drops</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search drops..."
                className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 text-xs font-mono placeholder:text-neutral-400 focus:outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Curated Drops Quick Filter */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono uppercase text-neutral-500 block">Curated Drops</label>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setSelectedCurated("all")}
                className={`w-full text-left px-3 py-2 text-xs font-mono uppercase rounded transition-colors flex items-center justify-between ${
                  selectedCurated === "all"
                    ? "bg-black text-white font-bold"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <span>All Drops</span>
                <span className="text-[10px] opacity-70">{products.length}</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedCurated("new-arrivals")}
                className={`w-full text-left px-3 py-2 text-xs font-mono uppercase rounded transition-colors flex items-center justify-between ${
                  selectedCurated === "new-arrivals"
                    ? "bg-black text-white font-bold"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  New Arrivals
                </span>
                <span className="text-[10px] opacity-70">
                  {products.filter((p) => p.isNewArrival).length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedCurated("best-selling")}
                className={`w-full text-left px-3 py-2 text-xs font-mono uppercase rounded transition-colors flex items-center justify-between ${
                  selectedCurated === "best-selling"
                    ? "bg-black text-white font-bold"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  Best Selling
                </span>
                <span className="text-[10px] opacity-70">
                  {products.filter((p) => p.isBestSeller).length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedCurated("sale")}
                className={`w-full text-left px-3 py-2 text-xs font-mono uppercase rounded transition-colors flex items-center justify-between ${
                  selectedCurated === "sale"
                    ? "bg-red-600 text-white font-bold"
                    : "text-red-600 hover:bg-red-50"
                }`}
              >
                <span className="flex items-center gap-1.5 font-bold">
                  <Tag className="w-3.5 h-3.5 text-red-500" />
                  On Sale
                </span>
                <span className="text-[10px] font-bold">
                  {products.filter((p) => p.isOnSale && p.salePrice && p.salePrice < p.basePrice).length}
                </span>
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono uppercase text-neutral-500 block">Category</label>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`w-full text-left px-3 py-2 text-xs font-mono uppercase rounded transition-colors flex items-center justify-between ${selectedCategory === "all"
                  ? "bg-black text-white font-bold"
                  : "text-neutral-700 hover:bg-neutral-100"
                  }`}
              >
                <span>All Categories</span>
                <span>{products.length}</span>
              </button>
              {categories.map((cat) => {
                const count = products.filter(
                  (p) => p.categorySlug === cat.slug || p.categoryId === cat.id
                ).length;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.slug || cat.id)}
                    className={`w-full text-left px-3 py-2 text-xs font-mono uppercase rounded transition-colors flex items-center justify-between ${selectedCategory === cat.slug || selectedCategory === cat.id
                      ? "bg-black text-white font-bold"
                      : "text-neutral-700 hover:bg-neutral-100"
                      }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    <span className="text-[10px] opacity-70">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Filter */}
          <div className="space-y-2 pt-2 border-t border-neutral-100">
            <label className="text-[11px] font-mono uppercase text-neutral-500 block">Size Profile</label>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedSize("all")}
                className={`py-1.5 text-xs font-mono uppercase border transition-all ${selectedSize === "all"
                  ? "border-black bg-black text-white font-bold"
                  : "border-neutral-200 hover:border-black text-neutral-800"
                  }`}
              >
                All
              </button>
              {availableSizesList.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(sz)}
                  className={`py-1.5 text-xs font-mono uppercase border transition-all ${selectedSize.toUpperCase() === sz.toUpperCase()
                    ? "border-black bg-black text-white font-bold"
                    : "border-neutral-200 hover:border-black text-neutral-800"
                    }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Color Palette Filter */}
          {colors.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-neutral-100">
              <label className="text-[11px] font-mono uppercase text-neutral-500 block">Colorway</label>
              <div className="space-y-1 max-h-48 overflow-y-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setSelectedColor("all")}
                  className={`w-full text-left px-2.5 py-1.5 text-xs font-mono uppercase rounded flex items-center gap-2 transition-colors ${selectedColor === "all" ? "bg-black text-white font-bold" : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full border border-neutral-300 bg-linear-to-r from-red-500 via-green-500 to-blue-500" />
                  <span>All Colorways</span>
                </button>
                {colors.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedColor(c.name)}
                    className={`w-full text-left px-2.5 py-1.5 text-xs font-mono uppercase rounded flex items-center gap-2 transition-colors ${selectedColor.toLowerCase() === c.name.toLowerCase()
                      ? "bg-black text-white font-bold"
                      : "text-neutral-700 hover:bg-neutral-100"
                      }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-neutral-300 shrink-0"
                      style={{ backgroundColor: c.hexCode }}
                    />
                    <span className="truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Toggle */}
          <div className="pt-2 border-t border-neutral-100">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-neutral-800">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="accent-black w-4 h-4 rounded-none"
              />
              <span>In-Stock Items Only</span>
            </label>
          </div>
        </aside>

        {/* Catalog Main Feed (9 Cols) */}
        <div className="lg:col-span-9 space-y-6">
          {/* Top Filter Bar & Sorting Deck */}
          <div className="bg-white border border-neutral-200 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Left: Results Count & Active Chips */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Mobile Filter Button */}
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 px-3 py-2 bg-neutral-900 text-white text-xs font-mono uppercase"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ""}</span>
              </button>

              <span className="text-xs font-mono text-neutral-500 uppercase">
                Showing <strong className="text-black font-bold">{filteredProducts.length}</strong> of{" "}
                {products.length} Archival Drops
              </span>

              {/* Active Filter Chips */}
              {selectedCurated !== "all" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-black text-white text-[11px] font-mono uppercase font-bold">
                  <span>
                    {selectedCurated === "new-arrivals"
                      ? "✨ New Arrivals"
                      : selectedCurated === "best-selling"
                      ? "🔥 Best Selling"
                      : "🏷️ On Sale"}
                  </span>
                  <button onClick={() => setSelectedCurated("all")} className="hover:opacity-75">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedCategory !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-100 text-black text-[11px] font-mono uppercase">
                  <span>Cat: {selectedCategory}</span>
                  <button onClick={() => setSelectedCategory("all")}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedSize !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-100 text-black text-[11px] font-mono uppercase">
                  <span>Size: {selectedSize}</span>
                  <button onClick={() => setSelectedSize("all")}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedColor !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-100 text-black text-[11px] font-mono uppercase">
                  <span>Color: {selectedColor}</span>
                  <button onClick={() => setSelectedColor("all")}><X className="w-3 h-3" /></button>
                </span>
              )}
              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-100 text-black text-[11px] font-mono uppercase">
                  <span>Query: &quot;{searchQuery}&quot;</span>
                  <button onClick={() => setSearchQuery("")}><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>

            {/* Right: Sorting Select & View Switcher */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase text-neutral-400 hidden sm:inline">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 text-xs font-mono uppercase text-neutral-900 focus:outline-none focus:border-black"
                >
                  <option value="featured">Featured / Curated</option>
                  <option value="newest">Newest Drops First</option>
                  <option value="bestselling">Best Sellers First</option>
                  <option value="sale">Biggest Discount First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="gsm-high">Heaviest Weave First</option>
                </select>
              </div>

              <div className="hidden sm:flex items-center border border-neutral-200">
                <button
                  type="button"
                  aria-label="3 Column View"
                  onClick={() => setViewCols(3)}
                  className={`p-1.5 transition-colors ${viewCols === 3 ? "bg-black text-white" : "text-neutral-500 hover:text-black"}`}
                >
                  <Grid2X2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  aria-label="4 Column View"
                  onClick={() => setViewCols(4)}
                  className={`p-1.5 transition-colors ${viewCols === 4 ? "bg-black text-white" : "text-neutral-500 hover:text-black"}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Curated Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              type="button"
              onClick={() => setSelectedCurated("all")}
              className={`px-3.5 py-1.5 text-xs font-mono uppercase whitespace-nowrap transition-all border ${
                selectedCurated === "all"
                  ? "bg-black text-white border-black font-bold shadow-xs"
                  : "bg-white text-neutral-700 border-neutral-200 hover:border-black hover:text-black"
              }`}
            >
              All Drops ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCurated("new-arrivals")}
              className={`px-3.5 py-1.5 text-xs font-mono uppercase whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                selectedCurated === "new-arrivals"
                  ? "bg-black text-white border-black font-bold shadow-xs"
                  : "bg-white text-neutral-700 border-neutral-200 hover:border-black hover:text-black"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>New Arrivals</span>
              <span className={`text-[10px] px-1.5 py-0.2 ${
                selectedCurated === "new-arrivals" ? "bg-neutral-800 text-white" : "bg-neutral-100 text-neutral-700"
              }`}>
                {products.filter((p) => p.isNewArrival).length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCurated("best-selling")}
              className={`px-3.5 py-1.5 text-xs font-mono uppercase whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                selectedCurated === "best-selling"
                  ? "bg-black text-white border-black font-bold shadow-xs"
                  : "bg-white text-neutral-700 border-neutral-200 hover:border-black hover:text-black"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Best Selling</span>
              <span className={`text-[10px] px-1.5 py-0.2 ${
                selectedCurated === "best-selling" ? "bg-neutral-800 text-white" : "bg-neutral-100 text-neutral-700"
              }`}>
                {products.filter((p) => p.isBestSeller).length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCurated("sale")}
              className={`px-3.5 py-1.5 text-xs font-mono uppercase whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                selectedCurated === "sale"
                  ? "bg-red-600 text-white border-red-700 font-bold shadow-xs"
                  : "bg-white text-red-600 border-red-200 hover:border-red-600 hover:bg-red-50"
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-red-500" />
              <span>On Sale</span>
              <span className={`text-[10px] px-1.5 py-0.2 ${
                selectedCurated === "sale" ? "bg-red-700 text-white" : "bg-red-100 text-red-700 font-bold"
              }`}>
                {products.filter((p) => p.isOnSale && p.salePrice && p.salePrice < p.basePrice).length}
              </span>
            </button>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="py-24 text-center bg-white border border-neutral-200 shadow-xs">
              <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-xs font-mono uppercase tracking-widest text-neutral-500">
                Loading Calviz Apparel Catalog...
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            /* Empty State */
            <div className="bg-white border border-neutral-200 p-12 text-center shadow-xs space-y-4">
              <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto stroke-[1.5]" />
              <h3 className="text-base font-bold uppercase tracking-wider text-black">
                No Matching Apparel Drops
              </h3>
              <p className="text-xs text-neutral-500 max-w-md mx-auto">
                No products match your active combination of filters. Try clearing your filters or search for another heavyweight essential.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-6 py-2.5 bg-black text-white text-xs font-mono uppercase tracking-wider font-bold hover:bg-neutral-800 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            /* Product Grid */
            <div
              className={`grid gap-6 ${viewCols === 3
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                }`}
            >
              {filteredProducts.map((product) => {
                const metrics = getProductMetrics(product);
                const isWishlisted = wishlistItems.includes(product.id);
                const activeSize =
                  selectedSizes[product.id] || product.availableSizes?.[0] || "M";
                const primaryImage =
                  product.primaryImageUrl ||
                  product.images?.find((img) => img.isPrimary)?.imageUrl ||
                  product.images?.[0]?.imageUrl;
                const secondaryImage =
                  product.images?.find(
                    (img) => img.imageUrl && img.imageUrl !== primaryImage
                  )?.imageUrl ||
                  product.images?.[1]?.imageUrl ||
                  primaryImage;

                return (
                  <div
                    key={product.id}
                    className="group flex flex-col justify-between bg-white border border-neutral-200 hover:border-black transition-all duration-300 shadow-xs hover:shadow-md relative overflow-hidden"
                  >
                    {/* Top Media Container */}
                    <div>
                      <div className="relative aspect-4/5 bg-neutral-100 overflow-hidden">
                        <Link href={`/products/${product.slug}`} className="block w-full h-full relative overflow-hidden">
                          <img
                            src={primaryImage}
                            alt={product.name}
                            className="w-full h-full object-cover object-top transition-all duration-700 ease-out group-hover:scale-105"
                            loading="lazy"
                            decoding="async"
                          />
                          {secondaryImage && secondaryImage !== primaryImage && (
                            <img
                              src={secondaryImage}
                              alt={`${product.name} alternate`}
                              className="w-full h-full object-cover object-top absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out group-hover:scale-105"
                              loading="lazy"
                              decoding="async"
                            />
                          )}
                        </Link>

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none">
                          <span
                            className={`px-2 py-0.5 text-[9px] font-mono uppercase font-bold tracking-wider ${
                              metrics.isOutOfStock
                                ? "bg-red-600 text-white"
                                : metrics.badge.startsWith("SALE")
                                ? "bg-red-600 text-white shadow-xs"
                                : metrics.isUrgent
                                ? "bg-amber-500 text-black"
                                : "bg-black text-white"
                            }`}
                          >
                            {metrics.badge}
                          </span>
                        </div>

                        {/* Wishlist Button */}
                        <button
                          type="button"
                          aria-label="Toggle Wishlist"
                          onClick={() => toggleWishlist(product.id)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md border border-neutral-200 flex items-center justify-center text-neutral-700 hover:text-black hover:scale-110 transition-all shadow-xs"
                        >
                          <Heart
                            className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""
                              }`}
                          />
                        </button>
                      </div>

                      {/* Product Content Details */}
                      <div className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">
                              {product.categoryName || "HEAVYWEIGHT STREETWEAR"}
                            </span>
                            <Link href={`/products/${product.slug}`}>
                              <h3 className="text-sm font-bold text-neutral-950 uppercase tracking-tight hover:underline line-clamp-1 mt-0.5">
                                {product.name}
                              </h3>
                            </Link>
                          </div>
                          <div className="text-right shrink-0">
                            {product.isOnSale && product.salePrice && product.salePrice < product.basePrice ? (
                              <div>
                                <span className="text-xs font-mono font-bold text-red-600 block">
                                  LKR {product.salePrice.toLocaleString()}
                                </span>
                                <span className="text-[10px] font-mono text-neutral-400 line-through block">
                                  LKR {product.basePrice.toLocaleString()}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs font-mono font-bold text-black block">
                                LKR {product.basePrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Size Selection Pill Matrix */}
                        {product.availableSizes && product.availableSizes.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono uppercase text-neutral-400 block">
                              SELECT SIZE: {activeSize}
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {product.availableSizes.map((sz) => (
                                <button
                                  key={sz}
                                  type="button"
                                  onClick={() => handleSelectSize(product.id, sz)}
                                  className={`px-2 py-1 text-[10px] font-mono uppercase border transition-all ${activeSize === sz
                                    ? "border-black bg-black text-white font-bold"
                                    : "border-neutral-200 bg-neutral-50 hover:border-neutral-400 text-neutral-800"
                                    }`}
                                >
                                  {sz}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Estimated Delivery Time SLA Badge */}
                        <div className="flex items-center justify-between px-2.5 py-1.5 bg-neutral-900 text-white rounded font-mono text-[10px] tracking-tight shadow-xs border border-neutral-800">
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
                    </div>

                    {/* Bottom Action Deck */}
                    <div className="p-4 pt-0">
                      {metrics.isOutOfStock ? (
                        <button
                          type="button"
                          onClick={() => handleOpenWaitlist(product, selectedSizes[product.id])}
                          className={`w-full py-2.5 text-xs font-mono uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 rounded-sm cursor-pointer active:scale-98 ${
                            waitlistedIds.includes(product.id)
                              ? "bg-emerald-950/20 text-emerald-700 border border-emerald-500/50 hover:bg-emerald-950/30"
                              : "bg-black text-white hover:bg-neutral-800 btn-black-animated border border-neutral-900 shadow-xs"
                          }`}
                        >
                          {waitlistedIds.includes(product.id) ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>WAITLISTED ✓</span>
                            </>
                          ) : (
                            <>
                              <Bell className="w-3.5 h-3.5 text-amber-400" />
                              <span>SOLD OUT • NOTIFY ME</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddToBag(product)}
                          className="w-full py-2.5 text-xs font-mono uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 rounded-sm btn-add-to-bag hover:text-white group cursor-pointer active:scale-98"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110" />
                          <span>ADD TO BAG</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Slide-Over Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto z-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-black" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-black">Filter Catalog</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 hover:bg-neutral-100 rounded text-neutral-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Curated Drops (Mobile) */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase text-neutral-500 block">Curated Drops</span>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setSelectedCurated("all")}
                    className={`w-full text-left px-3 py-2 text-xs font-mono uppercase rounded flex items-center justify-between ${
                      selectedCurated === "all" ? "bg-black text-white font-bold" : "text-neutral-700 bg-neutral-50"
                    }`}
                  >
                    <span>All Drops</span>
                    <span>{products.length}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCurated("new-arrivals")}
                    className={`w-full text-left px-3 py-2 text-xs font-mono uppercase rounded flex items-center justify-between ${
                      selectedCurated === "new-arrivals" ? "bg-black text-white font-bold" : "text-neutral-700 bg-neutral-50"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      New Arrivals
                    </span>
                    <span>{products.filter((p) => p.isNewArrival).length}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCurated("best-selling")}
                    className={`w-full text-left px-3 py-2 text-xs font-mono uppercase rounded flex items-center justify-between ${
                      selectedCurated === "best-selling" ? "bg-black text-white font-bold" : "text-neutral-700 bg-neutral-50"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      Best Selling
                    </span>
                    <span>{products.filter((p) => p.isBestSeller).length}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCurated("sale")}
                    className={`w-full text-left px-3 py-2 text-xs font-mono uppercase rounded flex items-center justify-between ${
                      selectedCurated === "sale" ? "bg-red-600 text-white font-bold" : "text-red-600 bg-red-50 font-bold"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-red-500" />
                      On Sale
                    </span>
                    <span>{products.filter((p) => p.isOnSale && p.salePrice && p.salePrice < p.basePrice).length}</span>
                  </button>
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase text-neutral-500 block">Category</span>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("all")}
                    className={`w-full text-left px-3 py-2 text-xs font-mono uppercase rounded ${selectedCategory === "all" ? "bg-black text-white font-bold" : "text-neutral-700 bg-neutral-50"
                      }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.slug || cat.id)}
                      className={`w-full text-left px-3 py-2 text-xs font-mono uppercase rounded ${selectedCategory === cat.slug || selectedCategory === cat.id
                        ? "bg-black text-white font-bold"
                        : "text-neutral-700 bg-neutral-50"
                        }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase text-neutral-500 block">Size</span>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedSize("all")}
                    className={`py-1.5 text-xs font-mono uppercase border ${selectedSize === "all" ? "border-black bg-black text-white font-bold" : "border-neutral-200"
                      }`}
                  >
                    All
                  </button>
                  {availableSizesList.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`py-1.5 text-xs font-mono uppercase border ${selectedSize.toUpperCase() === sz.toUpperCase()
                        ? "border-black bg-black text-white font-bold"
                        : "border-neutral-200"
                        }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* In-Stock */}
              <div>
                <label className="flex items-center gap-2 text-xs font-mono text-neutral-800">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="accent-black w-4 h-4"
                  />
                  <span>In-Stock Only</span>
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-100 flex gap-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 py-2.5 border border-neutral-300 text-xs font-mono uppercase font-bold"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2.5 bg-black text-white text-xs font-mono uppercase font-bold"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restock Notification Waitlist Modal */}
      <RestockWaitlistModal
        isOpen={isWaitlistModalOpen}
        onClose={() => setIsWaitlistModalOpen(false)}
        product={waitlistProduct}
        initialSize={waitlistSize}
        onSuccess={handleWaitlistSuccess}
      />
    </div>
  );
}

export default function ShopProductsPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-[#09090b] flex flex-col font-sans">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-36 md:pt-44 pb-20">
        <Suspense fallback={<div className="py-24 text-center"><div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" /></div>}>
          <ShopProductsContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
