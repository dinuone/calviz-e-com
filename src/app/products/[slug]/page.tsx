"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCartStore } from "@/lib/store/useCartStore";
import { fetchProductBySlug, fetchProducts } from "@/lib/api";
import { ProductDetail, ProductSummary, SizeMeasurementRow } from "@/types";
import CustomerReviewsSection from "@/components/CustomerReviewsSection";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import {
  ShoppingBag,
  Truck,
  MessageCircle,
  ShieldCheck,
  Zap,
  RefreshCw,
  Ruler,
  Star,
  Check,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  X,
  Lock,
  Maximize2,
  Bell,
  CheckCircle2,
} from "lucide-react";
import RestockWaitlistModal, {
  getWaitlistedProductIds,
} from "@/components/RestockWaitlistModal";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug || "";

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Variant selection
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedColorHex, setSelectedColorHex] = useState<string>("#0A0A0A");

  // Interactive tabs & modal
  const [activeTab, setActiveTab] = useState<"textile" | "measurements" | "logistics">("textile");
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isSizeChartZoomOpen, setIsSizeChartZoomOpen] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Restock Notification Waitlist Modal State
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const [waitlistedIds, setWaitlistedIds] = useState<string[]>([]);

  useEffect(() => {
    setWaitlistedIds(getWaitlistedProductIds());
  }, []);

  // Cart store
  const { addItem, openCart } = useCartStore();

  // Dynamic Measurements List parsed strictly from backend product.sizeMeasurementsJson
  const measurementsList: SizeMeasurementRow[] = useMemo(() => {
    if (product?.sizeMeasurementsJson) {
      try {
        const parsed = JSON.parse(product.sizeMeasurementsJson);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Error parsing product sizeMeasurementsJson:", e);
      }
    }
    return [];
  }, [product?.sizeMeasurementsJson]);

  // Dynamic measurement columns
  const measurementColumns = useMemo(() => {
    if (measurementsList.length === 0) return [];
    return Object.keys(measurementsList[0]).filter((k) => k !== "size");
  }, [measurementsList]);

  const scrollToReviews = () => {
    const el = document.getElementById("reviews-section") || document.getElementById("customer-reviews");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    async function loadData() {
      if (!slug) return;
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProductBySlug(slug);

        if (data) {
          setProduct(data);
          // Set initial size & color
          const initialSize = data.variants?.[0]?.size || "M";
          const initialColor = data.variants?.[0]?.color || "Jet Black";
          const initialColorHex = data.variants?.[0]?.colorHex || "#0A0A0A";

          setSelectedSize(initialSize);
          setSelectedColor(initialColor);
          setSelectedColorHex(initialColorHex);
        } else {
          setError("Product not found");
        }

        // Fetch related products
        const catalog = await fetchProducts();
        setRelatedProducts(catalog.filter((p) => p.slug !== slug).slice(0, 4));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load product details";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [slug]);

  // Distinct available colors from variants
  const availableColors = useMemo(() => {
    if (!product?.variants) return [];
    const map = new Map<string, string>();
    product.variants.forEach((v) => {
      const col = v.color?.trim() || "Jet Black";
      const hex = v.colorHex || (col.toLowerCase().includes("white") ? "#F4F4F6" : "#0A0A0A");
      if (!map.has(col)) {
        map.set(col, hex);
      }
    });
    return Array.from(map.entries()).map(([name, hex]) => ({ name, hex }));
  }, [product]);

  // Distinct sizes available
  const availableSizes = useMemo(() => {
    if (!product?.variants) return ["S", "M", "L", "XL"];
    const sizes = Array.from(new Set(product.variants.map((v) => v.size.toUpperCase())));
    return sizes.length > 0 ? sizes : ["S", "M", "L", "XL"];
  }, [product]);

  // Current variant based on selected size & color
  const activeVariant = useMemo(() => {
    if (!product?.variants) return null;
    return (
      product.variants.find(
        (v) =>
          v.size.toUpperCase() === selectedSize.toUpperCase() &&
          (!selectedColor || v.color.toLowerCase() === selectedColor.toLowerCase())
      ) ||
      product.variants.find((v) => v.size.toUpperCase() === selectedSize.toUpperCase()) ||
      product.variants[0]
    );
  }, [product, selectedSize, selectedColor]);

  const currentStock = activeVariant ? activeVariant.stockQuantity : 0;
  const isOutOfStock = currentStock <= 0;
  const isLowStock = currentStock > 0 && currentStock <= 10;

  // Images list
  const displayImages = useMemo(() => {
    if (!product || !product.images || product.images.length === 0) {
      return [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBL2DSR3gFCs8qOjLfsjCoopjlcj8Dohk0trwxsGo0gHsrhJygb5G8gO39q7dcg-VhT4H0-Bf_z_YhcnNqRm_5riHCf2TASEQ-DDTgTJNZbqAowohmxN0BIm89KkKWk-W1jo8J5lEOESWH9tXsOdl2pOQmWYEdlnE68i681bzpqxsPK_aQNlUeq3hjK8G90h9jaWzkjwlKZXMhh8dKJOgjVN58zNeV-HMGdWyw1OzGbS3PYVTwFE9Rczbo_zGAkQTsq0w",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuB2M0rkxF451QZx78DKXczliF8cWoa5hUfBXQEBGSeLqSYSQAxX5Hw0SYG8ov8_q4u1rhGwlycd1FQyChCJZ6xYUGn__zhSdL9HPLRuNE9tgbflfq5eU5K8JHwsWb6f8Pq-FmdZV0-t9kvCg1YFwPPB_g9WYkBNtE_i-HIKuTD7GlqnpvXEpLVM_KZuGdJZUqodDb5z1yR5KpvmiLFoX7ruZ4msX_QL0lAmH4osKLt9pQKuDNT5vEAuAsOWbUFaaFwiKQ",
      ];
    }
    return product.images.map((img) => img.imageUrl);
  }, [product]);

  const activeMainImage = displayImages[activeImageIndex] || displayImages[0];

  const effectiveBasePrice =
    product?.isOnSale && product?.salePrice && Number(product.salePrice) < Number(product.basePrice)
      ? Number(product.salePrice)
      : Number(product?.basePrice || 0);

  const handleAddToCart = () => {
    if (!product || isOutOfStock) return;

    addItem({
      variantId: activeVariant?.id ? String(activeVariant.id) : `${product.id}-${selectedSize}`,
      productId: String(product.id),
      productName: product.name,
      slug: product.slug,
      size: selectedSize,
      color: selectedColor || "Standard",
      unitPrice: effectiveBasePrice + (activeVariant?.priceAdjustment || 0),
      quantity: 1,
      imageUrl: activeMainImage,
      maxStock: currentStock,
    });

    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      openCart();
    }, 800);
  };

  const handleBuyNow = () => {
    if (!product || isOutOfStock) return;

    addItem({
      variantId: activeVariant?.id ? String(activeVariant.id) : `${product.id}-${selectedSize}`,
      productId: String(product.id),
      productName: product.name,
      slug: product.slug,
      size: selectedSize,
      color: selectedColor || "Standard",
      unitPrice: effectiveBasePrice + (activeVariant?.priceAdjustment || 0),
      quantity: 1,
      imageUrl: activeMainImage,
      maxStock: currentStock,
    });

    router.push("/checkout");
  };

  const handleDirectWhatsApp = () => {
    if (!product) return;
    const msg = encodeURIComponent(
      `Hello CALVIZ, I would like to order "${product.name}" in Size ${selectedSize} (${selectedColor || "Standard"}). Price: LKR ${effectiveBasePrice.toLocaleString()}.`
    );
    window.open(`https://wa.me/94704901027?text=${msg}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black flex flex-col justify-between">
        <Header />
        <div className="flex-1 flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">
              LOADING PRODUCT DETAILS...
            </span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white text-black flex flex-col justify-between">
        <Header />
        <div className="flex-1 max-w-2xl mx-auto px-4 py-32 text-center space-y-6">
          <div className="inline-block px-3 py-1 font-mono text-xs uppercase bg-neutral-100 border border-neutral-200 text-neutral-600">
            NOT FOUND
          </div>
          <h1 className="text-3xl font-bold uppercase tracking-tight">Product Unavailable</h1>
          <p className="text-sm text-neutral-600 leading-relaxed font-mono">
            The requested product is currently out of stock or no longer available.
          </p>
          <div className="pt-4">
            <Link
              href="/#catalog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-mono text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors"
            >
              <ArrowRight className="w-4 h-4 rotate-180" /> RETURN TO CATALOG
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#09090b] flex flex-col justify-between selection:bg-black selection:text-white">
      <Header />

      <main className="flex-1 w-full pt-32 md:pt-36 pb-20">
        {/* Product Breadcrumb Navigation */}
        <div className="w-full px-4 md:px-8 lg:px-12 py-3 bg-white border-b border-neutral-200">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-neutral-500">
              <Link href="/" className="hover:text-black transition-colors">
                HOME
              </Link>
              <span>/</span>
              <Link href="/#catalog" className="hover:text-black transition-colors">
                ALL PRODUCTS
              </Link>
              <span>/</span>
              <span className="text-neutral-400">
                {product.categoryName || "HEAVYWEIGHT"}
              </span>
              <span>/</span>
              <span className="text-black font-bold truncate max-w-[260px] md:max-w-none">
                "{product.name}" // SKU: {activeVariant?.sku || product.slug.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-4 self-start lg:self-auto">
              <div className="flex items-center gap-2 px-2.5 py-1 bg-neutral-100 rounded border border-neutral-200">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-black font-semibold">
                  {isOutOfStock
                    ? "SOLD OUT"
                    : isLowStock
                      ? `ONLY ${currentStock} LEFT IN STOCK`
                      : `IN STOCK (${currentStock} AVAILABLE)`}
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-neutral-600 font-mono text-[10px] uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-black" />
                <span>SRI LANKA LOGISTICS READY</span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Product Canvas */}
        <div className="w-full px-4 md:px-8 lg:px-12 py-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Gallery Column */}
            <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
              {/* Vertical Thumbnail Stack */}
              <div className="flex md:flex-col gap-2.5 w-full md:w-20 shrink-0 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                {displayImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-24 shrink-0 overflow-hidden rounded border transition-all duration-200 cursor-pointer ${activeImageIndex === idx
                      ? "border-black ring-1 ring-black opacity-100"
                      : "border-neutral-200 opacity-60 hover:opacity-100"
                      }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${product.name} view ${idx + 1}`}
                      className="w-full h-full object-cover object-top"
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="absolute bottom-1 right-1 font-mono text-[9px] bg-black text-white px-1 font-bold">
                      0{idx + 1}
                    </span>
                  </button>
                ))}
              </div>

              {/* Master Viewframe */}
              <div className="relative w-full aspect-[3/4] bg-neutral-100 overflow-hidden rounded-lg border border-neutral-200 group">
                <img
                  src={activeMainImage}
                  alt={product.name}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  decoding="async"
                  fetchPriority="high"
                />

                {/* Top Badge */}
                <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                  <div className="bg-white/95 backdrop-blur px-3 py-1 rounded shadow-xs border border-neutral-200">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-black font-semibold">
                      STYLE REF // #{activeVariant?.sku || product.slug.toUpperCase()}
                    </span>
                  </div>
                  {product.isOnSale && product.salePrice && Number(product.salePrice) < Number(product.basePrice) && (
                    <div className="bg-red-600 text-white font-mono text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded shadow-sm flex items-center gap-1 animate-pulse">
                      <span>🏷️ ON SALE</span>
                      <span>(-{Math.round(((Number(product.basePrice) - Number(product.salePrice)) / Number(product.basePrice)) * 100)}%)</span>
                    </div>
                  )}
                </div>

                {/* Bottom Spec Tags */}
                <div className="absolute bottom-4 right-4 bg-black text-white px-3 py-1.5 rounded font-mono text-[10px] uppercase flex items-center gap-1.5 shadow-md">
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>PREMIUM HEAVYWEIGHT</span>
                </div>

                <div className="absolute bottom-4 left-4 hidden sm:flex flex-col gap-1">
                  <span className="bg-white/95 backdrop-blur px-2 py-0.5 rounded font-mono text-[9px] tracking-widest text-black border border-neutral-200">
                    COLOMBO CRAFTED
                  </span>
                  <span className="bg-white/95 backdrop-blur px-2 py-0.5 rounded font-mono text-[9px] tracking-widest text-neutral-600 border border-neutral-200">
                    PRE-SHRUNK FINISH
                  </span>
                </div>
              </div>
            </div>

            {/* Product Details & Purchase Column */}
            <div className="lg:col-span-5 flex flex-col space-y-6">
              {/* Header & Pricing */}
              <div className="space-y-3 pb-2 border-b border-neutral-100">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[11px] text-neutral-500 uppercase tracking-widest">
                    CALVIZ STREETWEAR // EDITION 01
                  </p>
                  <span className="font-mono text-[10px] uppercase bg-neutral-100 border border-neutral-200 text-black px-2 py-0.5 rounded font-semibold">
                    HEAVYWEIGHT
                  </span>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-black leading-tight">
                  {product.name}
                </h1>

                {/* Reviews Rating Quick Link to Scroll Down */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={scrollToReviews}
                    className="group inline-flex items-center gap-2 text-left cursor-pointer transition-colors"
                  >
                    <div className="flex items-center text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    </div>
                    <span className="font-mono text-xs font-bold text-black group-hover:underline underline-offset-4">
                      4.95 / 5.0
                    </span>
                    <span className="text-neutral-300 font-mono text-xs">|</span>
                    <span className="font-mono text-xs text-neutral-600 group-hover:text-black group-hover:underline underline-offset-4 flex items-center gap-1">
                      Read Reviews &amp; Photos
                      <ArrowRight className="w-3 h-3 text-neutral-400 group-hover:text-black group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </button>
                </div>

                <div className="flex flex-wrap items-baseline gap-3 pt-2">
                  {product.isOnSale && product.salePrice && Number(product.salePrice) < Number(product.basePrice) ? (
                    <>
                      <p className="text-2xl md:text-3xl font-black font-mono text-red-600">
                        LKR {Number(product.salePrice).toLocaleString()}
                      </p>
                      <p className="text-base md:text-lg font-mono text-neutral-400 line-through">
                        LKR {Number(product.basePrice).toLocaleString()}
                      </p>
                      <span className="font-mono text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded uppercase tracking-wider">
                        SAVE {Math.round(((Number(product.basePrice) - Number(product.salePrice)) / Number(product.basePrice)) * 100)}%
                      </span>
                    </>
                  ) : (
                    <p className="text-2xl md:text-3xl font-bold font-mono text-black">
                      LKR {Number(product.basePrice).toLocaleString()}
                    </p>
                  )}
                  <p className="font-mono text-xs text-neutral-500">
                    ≈ ${(effectiveBasePrice / 300).toFixed(2)} USD
                  </p>
                  <span className="font-mono text-[10px] text-neutral-600 px-2 py-0.5 bg-neutral-100 rounded border border-neutral-200">
                    TAX INCL. // FREE SHIPPING OVER 10K
                  </span>
                </div>

                {/* <p className="text-xs text-neutral-600 leading-relaxed font-normal pt-1">
                  {product.description ||
                    `Constructed from architectural ring-spun combed long-staple cotton. Featuring high-density discharge screenprint back graphic and minimal embroidered Calviz crown emblem on chest. Engineered for perpetual drop-shoulder drape.`}
                </p> */}
              </div>

              {/* Color Selection */}
              {availableColors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase text-black font-semibold">
                      COLOR: <span className="font-bold">{selectedColor}</span>
                    </span>

                  </div>

                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    {availableColors.map((col) => {
                      const isSelected = selectedColor.toLowerCase() === col.name.toLowerCase();
                      return (
                        <button
                          key={col.name}
                          type="button"
                          onClick={() => {
                            setSelectedColor(col.name);
                            setSelectedColorHex(col.hex);
                          }}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded border transition-all cursor-pointer ${isSelected
                            ? "border-black bg-neutral-100 ring-1 ring-black"
                            : "border-neutral-200 bg-white hover:bg-neutral-50"
                            }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-neutral-300 shadow-xs"
                            style={{ backgroundColor: col.hex }}
                          />
                          <span className="font-mono text-xs uppercase font-semibold text-black">
                            {col.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase text-black font-semibold">
                    SELECT SIZE :
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="font-mono text-xs text-black underline underline-offset-4 hover:text-neutral-600 flex items-center gap-1 cursor-pointer"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>SIZE CHART</span>
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {availableSizes.map((sz) => {
                    const variantForSize = product.variants?.find(
                      (v) => v.size.toUpperCase() === sz.toUpperCase()
                    );
                    const vStock = variantForSize ? variantForSize.stockQuantity : 0;
                    const isSelected = selectedSize.toUpperCase() === sz.toUpperCase();
                    const isSizeSoldOut = vStock <= 0;

                    return (
                      <button
                        key={sz}
                        type="button"
                        disabled={isSizeSoldOut}
                        onClick={() => setSelectedSize(sz)}
                        className={`py-3 px-2 text-center rounded border transition-all relative cursor-pointer ${isSelected
                          ? "bg-black text-white border-black shadow-sm font-bold"
                          : isSizeSoldOut
                            ? "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed line-through"
                            : "bg-white text-neutral-800 border-neutral-200 hover:border-black font-medium"
                          }`}
                      >
                        <span className="block font-mono text-sm uppercase">{sz}</span>
                        <span
                          className={`block font-mono text-[9px] uppercase tracking-wider ${isSelected ? "text-neutral-300" : "text-neutral-500"
                            }`}
                        >
                          {isSizeSoldOut ? "SOLD OUT" : vStock <= 5 ? "LOW STOCK" : "IN STOCK"}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* <p className="font-mono text-[11px] text-neutral-500 italic">
                  Fits true to luxury oversized streetwear specifications. Boxy drape across chest.
                </p> */}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                {/* Out of Stock Waitlist vs Active Checkout Buttons */}
                {isOutOfStock ? (
                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={() => setIsWaitlistModalOpen(true)}
                      className={`w-full py-4 px-6 rounded-lg flex items-center justify-center gap-2.5 transition-all font-mono text-xs uppercase tracking-widest font-bold cursor-pointer shadow-md ${
                        waitlistedIds.includes(product.id)
                          ? "bg-emerald-950/20 text-emerald-700 border border-emerald-500/50 hover:bg-emerald-950/30"
                          : "bg-black text-white hover:bg-neutral-800 btn-black-animated"
                      }`}
                    >
                      {waitlistedIds.includes(product.id) ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>WAITLISTED FOR SIZE {selectedSize} ✓</span>
                        </>
                      ) : (
                        <>
                          <Bell className="w-4 h-4 text-amber-400" />
                          <span>SOLD OUT • NOTIFY ME WHEN AVAILABLE</span>
                        </>
                      )}
                    </button>
                    <div className="flex items-center justify-between px-1 text-[11px] font-mono text-neutral-500">
                      <span>⚡ Priority restock alert</span>
                      <span>Zero spam • 1-click alert</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* 1. Highlighted BUY NOW Button */}
                    <button
                      type="button"
                      onClick={handleBuyNow}
                      className="w-full py-3.5 px-6 rounded-lg flex items-center justify-center gap-2.5 transition-all font-mono text-xs uppercase tracking-widest font-bold cursor-pointer shadow-md bg-black text-white hover:bg-neutral-800 active:scale-[0.99] btn-black-animated"
                    >
                      <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span>BUY NOW • INSTANT CHECKOUT</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {/* 2. Bordered ADD TO BAG Button */}
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className={`w-full py-3 px-6 rounded-lg flex items-center justify-between group transition-all font-bold ${
                        addedAnimation
                          ? "bg-emerald-600 text-white border-2 border-emerald-600 shadow-sm"
                          : "bg-white text-neutral-900 border-2 border-neutral-900 hover:bg-neutral-900 hover:text-white cursor-pointer active:scale-[0.99] shadow-xs"
                      }`}
                    >
                      <span className="font-mono text-xs uppercase tracking-widest">
                        {addedAnimation
                          ? "ADDED TO BAG ✓"
                          : `ADD TO BAG // LKR ${(effectiveBasePrice + (activeVariant?.priceAdjustment || 0)).toLocaleString()}`}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] uppercase text-neutral-500 group-hover:text-neutral-300 transition-colors">
                          {addedAnimation ? "OPENING BAG..." : "ADD"}
                        </span>
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                    </button>
                  </>
                )}

                {/* 3. Direct WhatsApp Concierge Button */}
                <button
                  type="button"
                  onClick={handleDirectWhatsApp}
                  className="w-full py-2.5 px-4 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/40 text-[#075E54] hover:text-black rounded-lg flex items-center justify-center gap-2 transition-all font-mono text-xs uppercase tracking-wider font-bold cursor-pointer shadow-xs group"
                >
                  <WhatsAppIcon className="w-4 h-4 text-[#25D366] group-hover:scale-110 transition-transform" />
                  <span>ORDER VIA WHATSAPP</span>
                </button>
              </div>

              {/* Delivery & Dispatch Pillars */}
              <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-3.5">
                {/* Highlighted Delivery SLA Header */}
                <div className="flex items-center justify-between p-2.5 bg-neutral-900 text-white rounded-md font-mono text-xs shadow-xs border border-neutral-800">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="font-semibold text-neutral-200">
                      Colombo: <strong className="text-emerald-400 font-bold">Within 24 Hours</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-300 border-l border-neutral-700 pl-3">
                    <Truck className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Island: <strong className="text-white">2–3 Days</strong></span>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-1">
                  <ShieldCheck className="w-5 h-5 text-black shrink-0 mt-0.5" />
                  <div>
                    <p className="font-mono text-xs text-black uppercase font-bold">
                      DOORSTEP DELIVERY IN 24 HOURS
                    </p>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      Rapid 24-hour express courier delivery across Colombo with 7-day hassle-free size exchange.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-black shrink-0 mt-0.5" />
                  <div>
                    <p className="font-mono text-xs text-black uppercase font-bold">
                      ISLAND-WIDE DELIVERY
                    </p>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      24-Hour Express across Colombo. 48-72 Hours for all Outstation deliveries.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <RefreshCw className="w-5 h-5 text-black shrink-0 mt-0.5" />
                  <div>
                    <p className="font-mono text-xs text-black uppercase font-bold">
                      7-DAY COMPLIMENTARY SIZE EXCHANGE
                    </p>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      Immediate courier pickup &amp; replacement dispatch coordinated seamlessly via WhatsApp support.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Spec & Craft Blueprint Tabs */}
        <section className="w-full px-4 md:px-8 lg:px-12 py-12 bg-neutral-50 border-t border-neutral-200">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] text-neutral-500 uppercase tracking-widest">
                  FABRIC &amp; MATERIAL DETAILS
                </p>
                <h2 className="text-xl md:text-2xl font-bold text-black uppercase tracking-tight">
                  MATERIAL SPECIFICATIONS &amp; DETAILS
                </h2>
              </div>
              <p className="font-mono text-xs text-neutral-500">
                100% COMBED COTTON
              </p>
            </div>

            {/* Tab Buttons */}
            <div className="flex gap-2 bg-white p-1 rounded-lg border border-neutral-200 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("textile")}
                className={`px-4 py-2 font-mono text-xs uppercase rounded transition-colors cursor-pointer font-bold ${activeTab === "textile"
                  ? "bg-black text-white shadow-xs"
                  : "text-neutral-600 hover:text-black"
                  }`}
              >
                01 // FABRIC &amp; QUALITY
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("measurements")}
                className={`px-4 py-2 font-mono text-xs uppercase rounded transition-colors cursor-pointer font-bold ${activeTab === "measurements"
                  ? "bg-black text-white shadow-xs"
                  : "text-neutral-600 hover:text-black"
                  }`}
              >
                02 // MEASUREMENTS
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("logistics")}
                className={`px-4 py-2 font-mono text-xs uppercase rounded transition-colors cursor-pointer font-bold ${activeTab === "logistics"
                  ? "bg-black text-white shadow-xs"
                  : "text-neutral-600 hover:text-black"
                  }`}
              >
                03 // SHIPPING &amp; COD
              </button>
            </div>

            {/* Tab 1: Textile */}
            {activeTab === "textile" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 md:p-8 rounded-lg border border-neutral-200">
                <div className="space-y-2">
                  <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
                    FABRIC FOUNDATION
                  </span>
                  <h3 className="font-bold text-base uppercase text-black">
                    HEAVYWEIGHT LONG-STAPLE
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    100% GOTS organic ring-spun combed cotton. High yarn density provides structural boxy cut without feeling rigid or unbreathable in tropical heat.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
                    COLLAR INTEGRITY
                  </span>
                  <h3 className="font-bold text-base uppercase text-black">
                    1.2" SPANDEX RIB CORE
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Twin-needle bound ribbed neck with 5% elastane core prevents collar waviness (bacon-neck) across 50+ wash cycles. Clean, tight neckline that sits proud.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
                    GRAPHIC APPLICATION
                  </span>
                  <h3 className="font-bold text-base uppercase text-black">
                    DISCHARGE SCREENPRINT
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Water-based discharge ink bleeds into cotton fiber matrix rather than sitting on top like heavy plastisol. Soft to touch with zero cracking.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Measurements */}
            {activeTab === "measurements" && (
              <div className="bg-white p-6 md:p-8 rounded-lg border border-neutral-200 space-y-6">
                {/* Optional Uploaded Size Chart Blueprint / Diagram */}
                {product.sizeChartImageUrl && (
                  <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        onClick={() => setIsSizeChartZoomOpen(true)}
                        className="relative w-20 h-20 rounded-md overflow-hidden bg-white border border-neutral-200 shrink-0 cursor-pointer group shadow-2xs flex items-center justify-center p-1"
                      >
                        <img
                          src={product.sizeChartImageUrl}
                          alt={`${product.name} Size Blueprint`}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Maximize2 className="w-4 h-4" />
                        </div>
                      </div>
                      <div>
                        <span className="font-mono text-[10px] text-neutral-500 uppercase font-semibold">
                          SIZE CHART
                        </span>
                        <h4 className="text-sm font-bold uppercase text-black">
                          Visual Dimension &amp; Sizing Diagram
                        </h4>
                        <p className="text-xs text-neutral-600">
                          Inspect measurements and proportions for this garment.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSizeChartZoomOpen(true)}
                      className="px-3.5 py-2 bg-black text-white font-mono text-xs uppercase tracking-wider font-bold rounded hover:bg-neutral-800 transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      Expand Chart
                    </button>
                  </div>
                )}

                {measurementsList.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead>
                        <tr className="bg-neutral-100 text-black uppercase border-b border-neutral-200">
                          <th className="p-3 font-bold">SIZE</th>
                          {measurementColumns.map((col) => (
                            <th key={col} className="p-3 font-bold capitalize">
                              {col.replace(/_/g, " ")} (IN)
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {measurementsList.map((row, idx) => {
                          const isMatch = selectedSize.toUpperCase() === row.size.toUpperCase();
                          return (
                            <tr
                              key={idx}
                              className={
                                isMatch
                                  ? "bg-neutral-900 text-white font-bold"
                                  : "hover:bg-neutral-50 text-neutral-700"
                              }
                            >
                              <td className={`p-3 font-bold ${isMatch ? "text-white" : "text-black"}`}>
                                {row.size}
                                {isMatch && (
                                  <span className="ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-black font-semibold uppercase">
                                    Selected
                                  </span>
                                )}
                              </td>
                              {measurementColumns.map((col) => (
                                <td key={col} className="p-3">
                                  {row[col] || "—"}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-neutral-50 rounded-lg border border-neutral-200 text-xs font-mono text-neutral-500">
                    Detailed measurements for this product will be available soon. Check our Size Guide for standard sizing specifications.
                  </div>
                )}

                <p className="font-mono text-[10px] text-neutral-500 uppercase">
                  {product.sizeGuideNotes ||
                    'MEASUREMENTS TAKEN FLAT. DEVIATION OF +/- 0.5" REPRESENTS STANDARD HANDCRAFT TOLERANCE.'}
                </p>
              </div>
            )}

            {/* Tab 3: Logistics */}
            {activeTab === "logistics" && (
              <div className="bg-white p-6 md:p-8 rounded-lg border border-neutral-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-bold text-sm uppercase text-black">
                      24-HOUR DOORSTEP DELIVERY
                    </h4>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      CALVIZ operates direct express courier fulfillment with leading domestic logistics partners. Enjoy rapid 24-hour door-to-door delivery across Colombo and island-wide delivery with secure tamper-evident packaging.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-sm uppercase text-black">
                      EXCHANGE DISPATCH SLA
                    </h4>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      If fit is non-optimal, notify our team via{" "}
                      <a
                        href="https://wa.me/94704901027"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono font-bold text-[#075E54] bg-[#25D366]/15 px-1.5 py-0.5 rounded border border-[#25D366]/30 hover:bg-[#25D366]/25 transition-colors"
                      >
                        <WhatsAppIcon className="w-3 h-3 text-[#25D366]" />
                        <span>WhatsApp (+94 70 490 1027)</span>
                      </a>
                      . A rider will arrive with replacement size within 24 hours (Western Province) or 48 hours (Island-wide) to swap packages seamlessly.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Verified Wear Ratings & Reviews */}
        <section id="reviews-section" className="w-full px-4 md:px-8 lg:px-12 py-12 border-t border-neutral-200 bg-white">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-neutral-200 pb-6">
              <div>
                <p className="font-mono text-[11px] text-neutral-500 uppercase tracking-widest">
                  CUSTOMER FEEDBACK // VERIFIED RATINGS
                </p>
                <h2 className="text-xl md:text-2xl font-bold text-black uppercase tracking-tight mt-1">
                  VERIFIED WEAR RATINGS &amp; REVIEWS
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3 bg-neutral-100 px-4 py-2 rounded border border-neutral-200">
                  <div className="flex text-amber-500">
                    <Star className="w-4 h-4 fill-amber-500" />
                    <Star className="w-4 h-4 fill-amber-500" />
                    <Star className="w-4 h-4 fill-amber-500" />
                    <Star className="w-4 h-4 fill-amber-500" />
                    <Star className="w-4 h-4 fill-amber-500" />
                  </div>
                  <span className="font-mono text-sm font-bold text-black">4.95 / 5.0</span>
                  <span className="font-mono text-[11px] text-neutral-500 uppercase border-l border-neutral-300 pl-2">
                    128 ACQUISITIONS
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics Breakdown Bars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-neutral-50 p-4 rounded-lg border border-neutral-200">
              <div className="space-y-1.5 bg-white p-4 rounded border border-neutral-200">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-neutral-500 uppercase">TACTILE DENSITY &amp; DRAPE</span>
                  <span className="text-black font-bold">99%</span>
                </div>
                <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-black h-full w-[99%]" />
                </div>
                <p className="text-[11px] text-neutral-500 pt-1">
                  Confirmed true architectural drop-shoulder cut with zero-cling structure.
                </p>
              </div>

              <div className="space-y-1.5 bg-white p-4 rounded border border-neutral-200">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-neutral-500 uppercase">COLLAR INTEGRITY POST-WASH</span>
                  <span className="text-black font-bold">100%</span>
                </div>
                <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-black h-full w-full" />
                </div>
                <p className="text-[11px] text-neutral-500 pt-1">
                  Zero collar sagging (bacon-neck) tested past 20 high-humidity wash cycles.
                </p>
              </div>

              <div className="space-y-1.5 bg-white p-4 rounded border border-neutral-200">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-neutral-500 uppercase">ON-TIME DELIVERY SLA</span>
                  <span className="text-black font-bold">99.4%</span>
                </div>
                <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-black h-full w-[99.4%]" />
                </div>
                <p className="text-[11px] text-neutral-500 pt-1">
                  Parcels fulfilled within 24-hour express window across Colombo &amp; Western Province.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Live Verified Customer Reviews & Community Drape Section */}
        <CustomerReviewsSection
          productId={product.id}
          productSlug={product.slug}
          productName={product.name}
        />

        {/* Related Products Carousel */}
        {relatedProducts.length > 0 && (
          <section className="w-full px-4 md:px-8 lg:px-12 py-12 border-t border-neutral-200 bg-neutral-50">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-[11px] text-neutral-500 uppercase tracking-widest">
                    COMPLEMENTARY EDITIONS
                  </p>
                  <h2 className="text-xl font-bold uppercase tracking-tight text-black">
                    RECOMMENDED PRODUCTS
                  </h2>
                </div>
                <Link
                  href="/#catalog"
                  className="font-mono text-xs text-black uppercase underline underline-offset-4 hover:text-neutral-600"
                >
                  VIEW FULL ARCHIVE →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedProducts.map((rel) => {
                  const img = rel.primaryImageUrl || rel.images?.[0]?.imageUrl;
                  return (
                    <Link
                      key={rel.id}
                      href={`/products/${rel.slug}`}
                      className="group bg-white p-3 rounded-lg border border-neutral-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col"
                    >
                      <div className="aspect-[4/5] w-full bg-neutral-100 rounded overflow-hidden relative">
                        {img && (
                          <img
                            src={img}
                            alt={rel.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                            decoding="async"
                          />
                        )}
                        {rel.isOnSale && rel.salePrice && rel.salePrice < rel.basePrice ? (
                          <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-0.5 rounded font-mono text-[9px] uppercase font-bold tracking-wider shadow-xs">
                            SALE -{Math.round(((rel.basePrice - rel.salePrice) / rel.basePrice) * 100)}%
                          </div>
                        ) : null}
                        <div className="absolute top-2 right-2 bg-black text-white px-2 py-0.5 rounded font-mono text-[9px] uppercase font-bold">
                          HEAVYWEIGHT
                        </div>
                      </div>
                      <div className="pt-3 space-y-1">
                        <p className="font-mono text-[10px] text-neutral-500 uppercase">
                          {rel.categoryName || "HEAVYWEIGHT"}
                        </p>
                        <h3 className="text-xs font-bold uppercase text-black group-hover:underline line-clamp-1">
                          {rel.name}
                        </h3>
                        {rel.isOnSale && rel.salePrice && rel.salePrice < rel.basePrice ? (
                          <div className="flex items-baseline gap-2">
                            <span className="font-mono text-xs font-bold text-red-600">
                              LKR {Number(rel.salePrice).toLocaleString()}
                            </span>
                            <span className="font-mono text-[10px] text-neutral-400 line-through">
                              LKR {Number(rel.basePrice).toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <p className="font-mono text-xs font-bold text-black">
                            LKR {Number(rel.basePrice).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* 3D Size Drape & Measurement Modal */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-black w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 rounded-lg border border-neutral-300 shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div>
                <p className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider">
                  CALVIZ DRAPE MATRIX
                </p>
                <h3 className="font-bold text-base md:text-lg uppercase text-black">
                  ARCHITECTURAL FIT &amp; DRAPE GUIDE
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                className="text-neutral-500 hover:text-black p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Custom Uploaded Size Chart Blueprint if present */}
            {product?.sizeChartImageUrl && (
              <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-neutral-500 uppercase font-bold tracking-wider">
                    GARMENT CUT BLUEPRINT
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSizeChartZoomOpen(true)}
                    className="text-[11px] font-mono font-bold text-black hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    Full View
                  </button>
                </div>
                <div
                  onClick={() => setIsSizeChartZoomOpen(true)}
                  className="w-full max-h-64 rounded-md overflow-hidden bg-white border border-neutral-200 flex items-center justify-center p-2 cursor-pointer group"
                >
                  <img
                    src={product.sizeChartImageUrl}
                    alt={`${product.name} Size Blueprint`}
                    className="max-h-60 w-auto object-contain group-hover:scale-102 transition-transform"
                  />
                </div>
              </div>
            )}

            {/* Dynamic Measurement Table */}
            <div className="space-y-2">
              <span className="font-mono text-[10px] text-neutral-500 uppercase font-bold tracking-wider">
                EXACT MEASUREMENTS (INCHES)
              </span>
              {measurementsList.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-neutral-200">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="bg-neutral-100 text-black uppercase border-b border-neutral-200">
                        <th className="p-2.5 font-bold">SIZE</th>
                        {measurementColumns.map((col) => (
                          <th key={col} className="p-2.5 font-bold capitalize">
                            {col.replace(/_/g, " ")}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {measurementsList.map((row, idx) => {
                        const isMatch = selectedSize.toUpperCase() === row.size?.toUpperCase();
                        return (
                          <tr
                            key={idx}
                            className={
                              isMatch
                                ? "bg-neutral-900 text-white font-bold"
                                : "hover:bg-neutral-50 text-neutral-700"
                            }
                          >
                            <td className={`p-2.5 font-bold ${isMatch ? "text-white" : "text-black"}`}>
                              {row.size}
                              {isMatch && (
                                <span className="ml-1 text-[9px] font-mono px-1 py-0.5 rounded bg-white text-black font-semibold uppercase">
                                  Selected
                                </span>
                              )}
                            </td>
                            {measurementColumns.map((col) => (
                              <td key={col} className="p-2.5">
                                {row[col] || "—"}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center bg-neutral-50 rounded-lg border border-neutral-200 text-xs font-mono text-neutral-500">
                  No custom measurement specs assigned to this product yet.
                </div>
              )}
              <p className="font-mono text-[9px] text-neutral-500">
                {product?.sizeGuideNotes ||
                  'MEASUREMENTS TAKEN FLAT. DEVIATION OF +/- 0.5" REPRESENTS HANDCRAFT TOLERANCE.'}
              </p>
            </div>

            <div className="p-3.5 bg-neutral-100 rounded border border-neutral-200 space-y-1">
              <p className="font-mono text-xs uppercase font-bold text-black">
                THE CALVIZ FIT EXPLAINED
              </p>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Our garments feature an authentic drop-shoulder cut, wider bicep opening, and relaxed chest perimeter. The heavyweight custom-milled construction hangs vertically off the frame without clinging to body contours.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-3 bg-neutral-50 rounded border border-neutral-200">
                <p className="font-mono text-sm font-bold text-black">S</p>
                <p className="text-xs text-neutral-600">5'5" – 5'8"</p>
                <p className="font-mono text-[10px] text-neutral-400">55 – 65 KG</p>
              </div>
              <div className="p-3 bg-neutral-50 rounded border border-neutral-200">
                <p className="font-mono text-sm font-bold text-black">M</p>
                <p className="text-xs text-neutral-600">5'8" – 5'11"</p>
                <p className="font-mono text-[10px] text-neutral-400">65 – 75 KG</p>
              </div>
              <div className="p-3 bg-black text-white rounded border border-black shadow-xs">
                <p className="font-mono text-sm font-bold">L (POPULAR)</p>
                <p className="text-xs text-neutral-300">5'11" – 6'2"</p>
                <p className="font-mono text-[10px] text-neutral-400">75 – 88 KG</p>
              </div>
              <div className="p-3 bg-neutral-50 rounded border border-neutral-200">
                <p className="font-mono text-sm font-bold text-black">XL</p>
                <p className="text-xs text-neutral-600">6'2" +</p>
                <p className="font-mono text-[10px] text-neutral-400">88 – 105 KG</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSizeGuideOpen(false)}
              className="w-full bg-black text-white py-3 rounded font-mono text-xs uppercase tracking-wider font-bold hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              CONFIRM SELECTION &amp; RETURN
            </button>
          </div>
        </div>
      )}

      {/* Full Size Chart Diagram Zoom Modal */}
      {isSizeChartZoomOpen && product?.sizeChartImageUrl && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-xl p-4 sm:p-6 shadow-2xl flex flex-col items-center gap-4">
            <div className="w-full flex items-center justify-between border-b border-neutral-200 pb-3">
              <div>
                <span className="font-mono text-[10px] text-neutral-500 uppercase font-semibold">
                  GARMENT BLUEPRINT
                </span>
                <h3 className="font-bold text-sm uppercase text-black">
                  {product.name} — Detailed Size Chart
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSizeChartZoomOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-600 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-auto max-h-[75vh] w-full flex items-center justify-center bg-neutral-50 rounded-lg p-2">
              <img
                src={product.sizeChartImageUrl}
                alt={`${product.name} Size Blueprint`}
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Restock Notification Waitlist Modal */}
      <RestockWaitlistModal
        isOpen={isWaitlistModalOpen}
        onClose={() => setIsWaitlistModalOpen(false)}
        product={product}
        initialSize={selectedSize}
        initialColor={selectedColor}
        onSuccess={(prodId) => {
          setWaitlistedIds((prev) => (prev.includes(prodId) ? prev : [...prev, prodId]));
        }}
      />

      <Footer />
    </div>
  );
}
