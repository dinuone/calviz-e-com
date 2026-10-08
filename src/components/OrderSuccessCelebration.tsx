"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Package, 
  Truck, 
  Sparkles,
  Copy,
  ExternalLink
} from "lucide-react";

interface OrderSuccessCelebrationProps {
  orderId: string;
  orderNumber?: string;
  customerName?: string;
  totalAmount?: number;
  paymentMethod?: string;
  itemCount?: number;
  onClose?: () => void;
}

export default function OrderSuccessCelebration({
  orderId,
  orderNumber,
  customerName,
  totalAmount,
  paymentMethod,
  itemCount = 1,
  onClose,
}: OrderSuccessCelebrationProps) {
  const router = useRouter();
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; color: string; delay: number; duration: number }>>([]);
  const [copied, setCopied] = useState(false);
  const [autoRedirectTimer, setAutoRedirectTimer] = useState(10);

  const displayOrderCode = orderNumber || orderId.slice(0, 8).toUpperCase();

  // Generate luxury architectural confetti particles on mount
  useEffect(() => {
    const colors = ["#000000", "#18181b", "#71717a", "#d4d4d8", "#e4e4e7", "#c5a880"];
    const newParticles = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage across screen
      y: -10 - Math.random() * 20,
      size: Math.random() * 7 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.8,
      duration: Math.random() * 2.5 + 2,
    }));
    setParticles(newParticles);

    // Optional audio celebration chime using Web Audio API if available
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const now = ctx.currentTime;
        
        // Soft ascending chime
        const playTone = (freq: number, start: number, dur: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + start);
          gain.gain.setValueAtTime(0.04, now + start);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + start);
          osc.stop(now + start + dur);
        };

        playTone(523.25, 0.05, 0.4); // C5
        playTone(659.25, 0.18, 0.4); // E5
        playTone(783.99, 0.32, 0.6); // G5
        playTone(1046.50, 0.46, 0.8); // C6
      }
    } catch {
      // Audio context may be restricted by browser policy
    }
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(displayOrderCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoToOrder = () => {
    if (onClose) onClose();
    router.push(`/orders/${orderId}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-hidden animate-fade-in">
      {/* Floating Confetti Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-xs shadow-sm"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size * (p.id % 2 === 0 ? 1.6 : 1)}px`,
              backgroundColor: p.color,
              animation: `confettiRain ${p.duration}s cubic-bezier(0.25, 1, 0.5, 1) ${p.delay}s forwards`,
              opacity: 0.85,
            }}
          />
        ))}
      </div>

      {/* Main Glassmorphic Celebration Card */}
      <div className="relative w-full max-w-lg bg-[#09090b] text-white border border-neutral-800/80 rounded-2xl p-6 sm:p-10 shadow-2xl overflow-hidden animate-celebration-pop">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-neutral-700/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Animated Success Badge with Pulsing Aura */}
          <div className="relative mb-6 flex items-center justify-center">
            <div className="absolute w-20 h-20 bg-white/10 rounded-full animate-pulse-glow" />
            <div className="absolute w-16 h-16 bg-white/15 rounded-full" />
            <div className="relative w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-105">
              <svg className="w-7 h-7 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" className="animate-checkmark-stroke" />
              </svg>
            </div>
          </div>

          {/* Capsule Tagline */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/15 rounded-full text-[10px] tracking-widest font-mono uppercase text-neutral-300 mb-3">
            <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
            <span>ORDER CONFIRMED</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Thank You{customerName ? `, ${customerName}` : ""}!
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-sm mb-6 leading-relaxed">
            Your order has been placed successfully and is being prepared for dispatch.
          </p>

          {/* Order Reference Number Banner */}
          <div className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="text-left">
              <span className="text-[10px] tracking-widest font-mono text-neutral-500 uppercase block">
                ORDER REFERENCE
              </span>
              <span className="font-mono text-base sm:text-lg font-bold tracking-wider text-white">
                #{displayOrderCode}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-xs text-neutral-200 rounded-lg transition-all border border-neutral-700/60 font-mono cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">COPIED</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-neutral-400" />
                  <span>COPY</span>
                </>
              )}
            </button>
          </div>

          {/* Order Progress Stepper */}
          <div className="w-full bg-neutral-950/60 border border-neutral-800/60 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono tracking-wider">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs mb-1 shadow-sm">
                  1
                </div>
                <span className="text-neutral-200 font-semibold">Confirmed</span>
                <span className="text-[9px] text-neutral-500">Order Placed</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700 flex items-center justify-center font-bold text-xs mb-1">
                  2
                </div>
                <span className="text-neutral-400">Packaging</span>
                <span className="text-[9px] text-neutral-600">Colombo Hub</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700 flex items-center justify-center font-bold text-xs mb-1">
                  3
                </div>
                <span className="text-neutral-400">Dispatch</span>
                <span className="text-[9px] text-emerald-400">Colombo: 24h · Island: 2-3d</span>
              </div>
            </div>
          </div>

          {/* Quick Details Pills */}
          <div className="w-full flex items-center justify-between text-xs text-neutral-400 border-t border-neutral-800/80 pt-4 mb-6">
            <div className="flex items-center gap-1.5">
              <Package className="w-4 h-4 text-neutral-400" />
              <span>{itemCount} {itemCount === 1 ? "Garment" : "Garments"}</span>
            </div>
            {totalAmount ? (
              <div className="font-mono font-semibold text-white">
                LKR {totalAmount.toLocaleString()}
              </div>
            ) : null}
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Truck className="w-4 h-4 text-emerald-400" />
              <span>Doorstep Delivery SLA</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="w-full flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleGoToOrder}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-black font-bold text-xs tracking-widest uppercase rounded-xl hover:bg-neutral-200 active:scale-[0.98] transition-all cursor-pointer shadow-md"
            >
              <span>View Order & Tracking</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-5 py-3.5 bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 active:scale-[0.98] font-bold text-xs tracking-widest uppercase rounded-xl transition-all"
            >
              <span>Back to Store</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
