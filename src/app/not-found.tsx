"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import {
  Compass,
  ArrowRight,
  Search,
  ShoppingBag,
  Sparkles,
  RotateCcw,
  Package,
  Layers,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

export default function NotFoundPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/products");
    }
  };

  const quickLinks = [
    { label: "Heavyweight Boxy Tees", href: "/products", badge: "240 GSM" },
    { label: "French Terry Hoodies", href: "/products", badge: "WINTER DROP" },
    { label: "Archival Lookbook", href: "/#lookbook", badge: "PLATES" },
    { label: "Live Order Tracking", href: "/track", badge: "24H SLA" },
    { label: "Size Architecture Guide", href: "/size-guide", badge: "MATRIX" },
    { label: "Direct Client Atelier", href: "/contact", badge: "SUPPORT" },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col font-sans selection:bg-neutral-800 selection:text-white relative overflow-hidden">
      <Header />

      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-emerald-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-36 md:pt-44 pb-20 relative z-10 max-w-5xl mx-auto w-full text-center">
        {/* Monogram / Coordinate Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-800 text-[11px] font-mono tracking-widest uppercase text-neutral-400 mb-6 shadow-md animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>COORDINATES DISPLACED // STATUS 404</span>
        </div>

        {/* Sculptural 404 Heading */}
        <div className="relative mb-6">
          <h1 className="text-7xl sm:text-9xl md:text-[140px] font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-neutral-300 to-neutral-700 leading-none select-none">
            404
          </h1>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs font-mono tracking-[0.3em] uppercase text-emerald-400/90 bg-neutral-950/90 px-3 py-1 rounded-full border border-emerald-500/30 whitespace-nowrap">
            ARCHIVE ENTRY NOT LOCATED
          </span>
        </div>

        {/* Narrative Description */}
        <p className="text-sm sm:text-base text-neutral-400 font-mono max-w-lg mx-auto leading-relaxed mb-8">
          The silhouette, plate, or dossier you requested does not exist in the active CALVIZ registry. It may have been vaulted or moved to a new catalog coordinate.
        </p>

        {/* Interactive Search Dispatch */}
        <form onSubmit={handleSearchSubmit} className="max-w-md w-full mx-auto mb-10">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-neutral-500 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search heavyweight silhouettes, cuts, GSM..."
              className="w-full pl-11 pr-28 py-3.5 bg-neutral-900/80 border border-neutral-800 focus:border-white rounded-xl text-xs font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-white transition-all shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-2 px-4 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-mono font-bold uppercase rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <span>Locate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-14">
          <Link
            href="/"
            className="px-6 py-3.5 bg-white text-black hover:bg-neutral-200 font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-2 group cursor-pointer"
          >
            <span>Return to Flagship</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/products"
            className="px-6 py-3.5 bg-neutral-900 border border-neutral-700 hover:border-neutral-500 hover:bg-neutral-800 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-neutral-400" />
            <span>Explore Collection</span>
          </Link>

          <Link
            href="/track"
            className="px-6 py-3.5 bg-neutral-900 border border-neutral-700 hover:border-neutral-500 hover:bg-neutral-800 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <Package className="w-4 h-4 text-emerald-400" />
            <span>Track Order</span>
          </Link>
        </div>

        {/* Quick Directory Grid */}
        <div className="w-full border-t border-neutral-800/80 pt-10">
          <div className="text-center mb-6">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500 font-bold block">
              QUICK ATELIER DIRECTORY
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="p-3.5 bg-neutral-900/40 hover:bg-neutral-900 border border-neutral-800/80 hover:border-neutral-700 rounded-xl flex items-center justify-between text-left group transition-all"
              >
                <div>
                  <span className="text-xs font-mono font-bold text-neutral-200 group-hover:text-white block transition-colors">
                    {link.label}
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 font-semibold uppercase tracking-wider">
                    {link.badge}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </div>

        {/* Concierge Desk Assurance */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-neutral-900/60 border border-neutral-800 rounded-2xl w-full text-xs font-mono text-neutral-400">
          <div className="flex items-center gap-2.5 text-left">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Require order fulfillment support or garment sizing assistance?</span>
          </div>
          <a
            href="https://wa.me/94704901027"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold uppercase tracking-wider text-[11px] transition-all shrink-0 cursor-pointer"
          >
            <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
            <span>WhatsApp Concierge</span>
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
