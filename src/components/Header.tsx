"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, ShoppingBag, User, X, Trash2, ArrowRight, Menu } from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { useCartStore } from "@/lib/store/useCartStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import { useAuthModalStore } from "@/lib/store/useAuthModalStore";

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currency, setCurrency] = useState<"LKR" | "USD">("LKR");
  const { items, isOpen, openCart, closeCart, removeItem, updateQuantity, subtotal, totalCount } = useCartStore();
  const { customer, isAuthenticated } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const count = mounted ? totalCount() : 0;
  const currentSubtotal = mounted ? subtotal() : 0;

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-[#f4f5f7]/95 backdrop-blur-xl border-b border-[#e2e4e8] shadow-[0_4px_20px_-6px_rgba(0,0,0,0.07)] transition-colors duration-300">
        {/* Top Announcement Bar - Animated Infinite Marquee Ticker */}
        <div className="w-full bg-black text-white py-1.5 overflow-hidden border-b border-neutral-800 flex items-center select-none">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-8 text-xs font-mono tracking-widest uppercase font-medium text-neutral-200">
            <span>COLOMBO FLAGSHIP & ISLAND-WIDE DISPATCH</span>
            <span className="text-neutral-500">//</span>
            <span>DOORSTEP DELIVERY WITHIN 24 HOURS</span>
            <span className="text-neutral-500">//</span>
            <span>COMPLIMENTARY SHIPPING OVER LKR 10,000</span>
            <span className="text-neutral-500">//</span>
            <span>COMBED COTTON</span>
            <span className="text-neutral-500">//</span>
            <span>ZERO COLLAR SAG GUARANTEED</span>
            <span className="text-neutral-500">//</span>
            {/* Duplicate set for seamless infinite loop */}
            <span>COLOMBO FLAGSHIP & ISLAND-WIDE DISPATCH</span>
            <span className="text-neutral-500">//</span>
            <span>DOORSTEP DELIVERY WITHIN 24 HOURS</span>
            <span className="text-neutral-500">//</span>
            <span>COMPLIMENTARY SHIPPING OVER LKR 10,000</span>
            <span className="text-neutral-500">//</span>
            <span>COMBED COTTON</span>
            <span className="text-neutral-500">//</span>
            <span>ZERO COLLAR SAG GUARANTEED</span>
            <span className="text-neutral-500">//</span>
          </div>
        </div>

        <div className="h-20 max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
          {/* Left: Mobile Menu Button & Brand Logo */}
          <div className="flex items-center gap-3 md:gap-6">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Navigation Menu"
              className="lg:hidden p-2 text-neutral-800 hover:text-black hover:bg-neutral-200/60 rounded-lg transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/" className="flex items-center group py-1">
              <img
                src="/logo.png"
                alt="CALVIZ"
                className="h-9 md:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-5 xl:gap-8 ml-4">
              <Link
                href="/"
                className="text-[13px] font-mono uppercase tracking-wider font-semibold text-neutral-700 hover:text-black transition-colors"
              >
                NEW DROPS
              </Link>
              <Link
                href="/products"
                className="text-[13px] font-mono uppercase tracking-wider font-semibold text-neutral-700 hover:text-black transition-colors"
              >
                SHOP ALL
              </Link>
              <Link
                href="/about"
                className="text-[13px] font-mono uppercase tracking-wider font-semibold text-neutral-700 hover:text-black transition-colors"
              >
                ABOUT US
              </Link>
              <Link
                href="/contact"
                className="text-[13px] font-mono uppercase tracking-wider font-semibold text-neutral-700 hover:text-black transition-colors"
              >
                CONTACT
              </Link>
              <Link
                href="/track"
                className="text-[13px] font-mono uppercase tracking-wider font-semibold text-neutral-700 hover:text-black transition-colors flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                <span>TRACK ORDER</span>
              </Link>
            </nav>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Currency selector */}
            <div className="hidden md:flex items-center gap-1 text-xs font-mono font-bold text-neutral-800 px-2.5 py-1 bg-white rounded border border-neutral-300 shadow-xs">
              <span
                onClick={() => setCurrency("LKR")}
                className={`cursor-pointer transition-colors ${currency === "LKR" ? "text-black font-bold" : "hover:text-black"}`}
              >
                LKR
              </span>
            </div>

            {/* Search */}
            <button
              type="button"
              aria-label="Search Archive"
              onClick={() => {
                const el = document.getElementById("catalog");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="p-1.5 text-neutral-700 hover:text-black transition-colors flex items-center justify-center cursor-pointer"
            >
              <Search className="w-4 h-4 stroke-[1.75]" />
            </button>

            {/* Track Order */}
            <Link
              href="/track"
              aria-label="Track Order"
              title="Track Order"
              className="hidden sm:flex p-1.5 text-neutral-700 hover:text-black transition-colors items-center justify-center"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </Link>

            {/* Wishlist Link */}
            <button
              type="button"
              aria-label="Wishlist"
              onClick={() => {
                if (!isAuthenticated) {
                  useAuthModalStore.getState().openModal({
                    tab: "login",
                    title: "SIGN IN FOR WISHLIST",
                    description: "Sign in to access your private saved wishlist and capsule items.",
                  });
                } else {
                  const el = document.getElementById("catalog");
                  el?.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="relative p-1.5 text-neutral-700 hover:text-black transition-colors flex items-center justify-center cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {mounted && useWishlistStore.getState().items.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white font-mono text-[9px] flex items-center justify-center rounded-full">
                  {useWishlistStore.getState().items.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={openCart}
              aria-label="Shopping Bag"
              type="button"
              className="relative p-1.5 text-neutral-700 hover:text-black transition-colors flex items-center justify-center cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 stroke-[1.75]" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white font-mono text-[9px] flex items-center justify-center rounded-full">
                {count}
              </span>
            </button>

            {/* Account Icon */}
            <Link
              href={mounted && isAuthenticated ? "/account" : "/login"}
              aria-label="Account"
              className="h-7 w-7 rounded-full bg-black flex items-center justify-center text-white hover:opacity-90 transition-all ml-1 font-mono text-[10px] font-bold overflow-hidden border border-neutral-300 shadow-xs"
            >
              {mounted && isAuthenticated && customer?.avatarUrl ? (
                <img
                  src={customer.avatarUrl}
                  alt={customer.fullName || "Client"}
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
              ) : mounted && isAuthenticated && customer?.fullName ? (
                <span className="uppercase text-[10px] font-bold">
                  {customer.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </span>
              ) : (
                <User className="w-3.5 h-3.5 stroke-[2]" />
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Over Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-start bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in lg:hidden">
          <div className="w-full max-w-xs bg-white h-full flex flex-col shadow-2xl border-r border-neutral-200 animate-slide-right">
            {/* Drawer Header */}
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center">
                <img src="/logo.png" alt="CALVIZ" className="h-8 w-auto object-contain" />
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-neutral-500 hover:text-black rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 p-5 space-y-1 font-mono text-sm uppercase tracking-wider overflow-y-auto">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-3 rounded-lg hover:bg-neutral-100 text-neutral-900 hover:text-black font-bold transition-colors"
              >
                NEW DROPS
              </Link>
              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-3 rounded-lg hover:bg-neutral-100 text-neutral-900 hover:text-black font-bold transition-colors"
              >
                ALL PRODUCTS
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-3 rounded-lg hover:bg-neutral-100 text-neutral-900 hover:text-black font-bold transition-colors"
              >
                ABOUT ATELIER
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-3 rounded-lg hover:bg-neutral-100 text-neutral-900 hover:text-black font-bold transition-colors"
              >
                CONTACT CLIENT DESK
              </Link>
              <Link
                href="/track"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-3 rounded-lg hover:bg-neutral-100 text-neutral-900 hover:text-black font-bold transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>TRACK CONSIGNMENT</span>
              </Link>

              <div className="pt-4 mt-4 border-t border-neutral-200">
                <a
                  href="https://wa.me/94704901027"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 rounded-xl bg-[#25D366]/10 text-[#075E54] border border-[#25D366]/30 font-bold transition-colors"
                >
                  <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                  <span>VIP WhatsApp (+94 70 490 1027)</span>
                </a>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-neutral-200 bg-neutral-50 text-[10px] font-mono text-neutral-500 text-center">
              COLOMBO FLAGSHIP ATELIER // 24H DELIVERY
            </div>
          </div>
        </div>
      )}


      {/* Slide-over Cart Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in">
          <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl border-l border-[#e4e4e7] animate-slide-left">
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#e4e4e7] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#09090b]">YOUR BAG ({count})</h2>
                <span className="text-[10px] text-[#71717a] uppercase font-mono">ISLAND-WIDE COD READY</span>
              </div>
              <button
                onClick={closeCart}
                className="p-1.5 text-[#71717a] hover:text-black hover:bg-neutral-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-[#71717a] py-12">
                  <ShoppingBag className="w-12 h-12 stroke-[1] mb-3 text-neutral-300" />
                  <p className="text-xs uppercase tracking-wider font-semibold">Your bag is empty</p>
                  <p className="text-[11px] text-neutral-400 mt-1 max-w-[200px]">Explore the curated drops to add heavyweight essentials.</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.variantId} className="flex gap-4 pb-4 border-b border-[#f4f2fd]">
                    <div className="w-18 h-22 bg-[#f4f2fd] overflow-hidden flex-shrink-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400 font-mono text-[9px]">CALVIZ</div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="text-xs font-bold text-[#09090b]">{item.productName}</h3>
                          <button onClick={() => removeItem(item.variantId)} className="text-neutral-400 hover:text-red-600 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[10px] text-[#71717a] font-mono mt-0.5">
                          SIZE: {item.size} • {item.color}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center border border-[#e4e4e7] rounded-none">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="px-2 py-0.5 text-xs text-[#71717a] hover:bg-neutral-100"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-bold text-[#09090b]">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="px-2 py-0.5 text-xs text-[#71717a] hover:bg-neutral-100"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-xs font-bold text-[#09090b]">
                          LKR {(item.unitPrice * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer & Checkout */}
            {items.length > 0 && (
              <div className="p-5 border-t border-[#e4e4e7] bg-[#fbf8ff] space-y-3">
                <div className="flex justify-between items-center text-xs font-medium text-[#71717a]">
                  <span>Subtotal</span>
                  <span className="text-sm font-bold text-[#09090b]">LKR {currentSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-[#71717a] uppercase font-mono">
                  <span>Island-wide Delivery</span>
                  <span>Calculated at checkout</span>
                </div>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full py-3.5 bg-[#09090b] text-white font-bold text-xs uppercase tracking-widest hover:bg-[#18181b] transition-colors flex items-center justify-center gap-2"
                >
                  <span>PROCEED TO CHECKOUT</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
