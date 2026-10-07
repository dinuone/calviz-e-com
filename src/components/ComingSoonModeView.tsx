"use client";

import React, { useState, useEffect } from "react";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import {
  Sparkles,
  Lock,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Send
} from "lucide-react";

interface ComingSoonModeViewProps {
  headline?: string;
  message?: string;
  targetDateUtc?: string;
  supportPhone?: string;
  enableVipSignup?: boolean;
}

export default function ComingSoonModeView({
  headline = "NEXT CAPSULE UNVEILING // DROP 02",
  message = "Strictly limited to 250 heavy-milled archival units per silhouette. Enter your WhatsApp or SMS contact to secure 2-hour priority early allocation before public release.",
  targetDateUtc,
  supportPhone = "+94 70 490 1027",
  enableVipSignup = true,
}: ComingSoonModeViewProps) {
  const [phoneInput, setPhoneInput] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Time remaining calculation
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    // Default to a 3-day target if none provided
    const targetTime = targetDateUtc ? new Date(targetDateUtc).getTime() : new Date().getTime() + 1000 * 60 * 60 * 72;

    const calculateTime = () => {
      const now = new Date().getTime();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDateUtc]);

  const handleVipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput || phoneInput.trim().length < 7) return;

    setSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5089/api";
      await fetch(`${apiUrl}/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Coming Soon VIP Member",
          phone: "+94 " + phoneInput.trim(),
          inquiryType: "Coming Soon Drop 02 Priority Access",
          message: `Customer secured priority early access pass for upcoming drop (+94 ${phoneInput.trim()}).`,
          submitElapsedSeconds: 3.2,
        }),
      });
      setSubscribed(true);
    } catch {
      setSubscribed(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-white flex flex-col justify-between relative overflow-hidden select-none font-sans animate-gradient-shade">
      {/* Ambient Moving Glow Accents */}
      <div className="absolute top-1/3 -left-40 w-[30rem] h-[30rem] bg-purple-600/15 rounded-full blur-3xl pointer-events-none animate-glow-orb-1" />
      <div className="absolute bottom-1/3 -right-40 w-[30rem] h-[30rem] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none animate-glow-orb-2" />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-neutral-850/80">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="CALVIZ"
            className="h-9 md:h-11 w-auto object-contain brightness-0 invert opacity-95"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-purple-950/60 border border-purple-800/80 rounded-full text-purple-300 font-mono text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span>VIP EARLY PASS ACTIVE</span>
          </div>
        </div>
      </header>

      {/* Main Hero Card */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16 text-center space-y-8 my-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-white font-mono text-xs uppercase font-bold shadow-2xl">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>CAPSULE RELEASE COUNTDOWN</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase text-white font-mono tracking-tight leading-none">
            {headline}
          </h1>
          <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed font-medium">
            {message}
          </p>
        </div>

        {/* Live Countdown Timer */}
        {timeLeft && (
          <div className="grid grid-cols-4 gap-2.5 sm:gap-4 max-w-lg mx-auto font-mono">
            <div className="p-4 sm:p-5 bg-neutral-900/90 rounded-2xl border border-neutral-800 shadow-2xl">
              <span className="text-3xl sm:text-5xl font-black text-white block">{timeLeft.days}</span>
              <span className="text-[10px] sm:text-xs text-neutral-500 uppercase font-bold tracking-widest mt-1 block">DAYS</span>
            </div>
            <div className="p-4 sm:p-5 bg-neutral-900/90 rounded-2xl border border-neutral-800 shadow-2xl">
              <span className="text-3xl sm:text-5xl font-black text-white block">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="text-[10px] sm:text-xs text-neutral-500 uppercase font-bold tracking-widest mt-1 block">HOURS</span>
            </div>
            <div className="p-4 sm:p-5 bg-neutral-900/90 rounded-2xl border border-neutral-800 shadow-2xl">
              <span className="text-3xl sm:text-5xl font-black text-white block">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="text-[10px] sm:text-xs text-neutral-500 uppercase font-bold tracking-widest mt-1 block">MINS</span>
            </div>
            <div className="p-4 sm:p-5 bg-neutral-900/90 rounded-2xl border border-neutral-800 shadow-2xl">
              <span className="text-3xl sm:text-5xl font-black text-purple-400 block">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
              <span className="text-[10px] sm:text-xs text-neutral-500 uppercase font-bold tracking-widest mt-1 block">SECS</span>
            </div>
          </div>
        )}

        {/* Priority Early Allocation Form */}
        {enableVipSignup && (
          <div className="max-w-md mx-auto pt-2">
            {subscribed ? (
              <div className="p-5 bg-purple-950/60 border border-purple-800 rounded-2xl text-center space-y-1 animate-fade-in font-mono text-xs">
                <div className="w-10 h-10 rounded-full bg-purple-900 text-purple-300 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="font-bold text-purple-300 uppercase tracking-wider">EARLY ALLOCATION PASS REGISTERED</p>
                <p className="text-neutral-400 text-[11px]">Your priority 2-hour checkout link will be sent to your WhatsApp/SMS before public release.</p>
              </div>
            ) : (
              <form onSubmit={handleVipSubmit} className="space-y-2">
                <div className="flex bg-neutral-900 border border-neutral-700 rounded-xl overflow-hidden focus-within:border-white transition-colors shadow-2xl">
                  <span className="px-3.5 py-3.5 bg-neutral-800 text-neutral-300 font-mono text-xs font-bold border-r border-neutral-700 flex items-center">
                    +94
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="77 XXX XXXX (MOBILE / WHATSAPP)"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="flex-1 bg-transparent px-3 py-2 text-white font-mono text-xs outline-none"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 btn-add-to-bag text-white font-mono text-xs font-bold uppercase transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? "..." : "GET ACCESS"}
                  </button>
                </div>
                <p className="text-[10px] font-mono text-neutral-500">
                  🔒 No spam. Only single-use priority allocation dispatch passes.
                </p>
              </form>
            )}
          </div>
        )}

        {/* WhatsApp Direct Help */}
        <div className="pt-2">
          <a
            href="https://wa.me/94704901027?text=Hello%20CALVIZ%20Atelier%2C%20I%20am%20inquiring%20about%20the%20upcoming%20drop."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] font-mono text-xs font-bold transition-all shadow-sm hover:scale-102"
          >
            <WhatsAppIcon className="w-3.5 h-3.5" />
            <span>WhatsApp (+94 70 490 1027)</span>
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-850/80 font-mono text-[11px] text-neutral-500">
        <p>© {new Date().getFullYear()} CALVIZ. ARCHITECTURAL READY-TO-WEAR.</p>
        <p className="uppercase tracking-widest text-neutral-400">SRI LANKA</p>
      </footer>
    </div>
  );
}
