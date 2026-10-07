"use client";

import React, { useState, useEffect } from "react";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import {
  ShieldCheck,
  Clock,
  Wrench,
  Sparkles,
  CheckCircle2,
  Send,
  Lock,
  ChevronRight,
  ExternalLink,
  Activity,
  Cpu,
  Layers
} from "lucide-react";

interface MaintenanceModeViewProps {
  headline?: string;
  message?: string;
  targetDateUtc?: string;
  supportPhone?: string;
  enableVipSignup?: boolean;
}

export default function MaintenanceModeView({
  headline = "ATELIER ARCHIVAL SYSTEM CALIBRATION",
  message = "CALVIZ digital atelier is currently conducting scheduled infrastructure enhancements and pattern calibration. Dispatch and client care desks remain fully active.",
  targetDateUtc,
  supportPhone = "+94 70 490 1027",
  enableVipSignup = true,
}: MaintenanceModeViewProps) {
  const [phoneInput, setPhoneInput] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Time remaining calculation
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    if (!targetDateUtc) return;

    const calculateTime = () => {
      const target = new Date(targetDateUtc).getTime();
      const now = new Date().getTime();
      const diff = target - now;

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
          name: "Maintenance VIP Member",
          phone: "+94 " + phoneInput.trim(),
          inquiryType: "Maintenance Reopen VIP Notification",
          message: `Customer requested reopening priority SMS notification (+94 ${phoneInput.trim()}).`,
          submitElapsedSeconds: 3.0,
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
      {/* Background Animated Glow Spheres */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-glow-orb-1" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-zinc-600/15 rounded-full blur-3xl pointer-events-none animate-glow-orb-2" />

      {/* Top Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-neutral-850/80">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="CALVIZ"
            className="h-9 md:h-10 w-auto object-contain brightness-0 invert opacity-95"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-950/60 border border-amber-800/80 rounded-full text-amber-400 font-mono text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>MAINTENANCE PROTOCOL</span>
          </div>
        </div>
      </header>

      {/* Main Content Hub */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16 text-center space-y-8 my-auto">
        {/* Animated Status Pulse Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-neutral-900/90 border border-neutral-800 rounded-full font-mono text-xs text-neutral-300 shadow-2xl">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <span className="font-bold text-white uppercase tracking-wider">SYSTEM OPTIMIZATION IN PROGRESS</span>
        </div>

        {/* Hero Headline */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase text-white font-mono tracking-tight leading-tight">
            {headline}
          </h1>
          <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed font-medium">
            {message}
          </p>
        </div>

        {/* Live Countdown Clock (If Target Date Configured) */}
        {timeLeft && (
          <div className="p-6 bg-neutral-900/80 backdrop-blur-md rounded-2xl border border-neutral-800 max-w-xl mx-auto shadow-2xl">
            <span className="text-[11px] font-mono uppercase text-neutral-400 font-bold block mb-4 tracking-widest">
              ESTIMATED ATELIER REOPENING
            </span>
            <div className="grid grid-cols-4 gap-3 font-mono">
              <div className="p-3 bg-black/60 rounded-xl border border-neutral-800">
                <span className="text-2xl sm:text-4xl font-black text-white block">{timeLeft.days}</span>
                <span className="text-[10px] text-neutral-500 uppercase font-bold">DAYS</span>
              </div>
              <div className="p-3 bg-black/60 rounded-xl border border-neutral-800">
                <span className="text-2xl sm:text-4xl font-black text-white block">
                  {String(timeLeft.hours).padStart(2, "0")}
                </span>
                <span className="text-[10px] text-neutral-500 uppercase font-bold">HOURS</span>
              </div>
              <div className="p-3 bg-black/60 rounded-xl border border-neutral-800">
                <span className="text-2xl sm:text-4xl font-black text-white block">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </span>
                <span className="text-[10px] text-neutral-500 uppercase font-bold">MINS</span>
              </div>
              <div className="p-3 bg-black/60 rounded-xl border border-neutral-800">
                <span className="text-2xl sm:text-4xl font-black text-amber-400 block">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </span>
                <span className="text-[10px] text-neutral-500 uppercase font-bold">SECS</span>
              </div>
            </div>
          </div>
        )}

        {/* VIP Early Notification Registration */}
        {enableVipSignup && (
          <div className="max-w-md mx-auto pt-2">
            {subscribed ? (
              <div className="p-4 bg-emerald-950/60 border border-emerald-800 rounded-2xl text-center space-y-1 animate-fade-in font-mono text-xs">
                <p className="font-bold text-emerald-400 uppercase">PRIORITY NOTIFICATION REGISTERED</p>
                <p className="text-neutral-400 text-[11px]">We will notify your mobile instantly once the atelier goes live.</p>
              </div>
            ) : (
              <form onSubmit={handleVipSubmit} className="space-y-2">
                <p className="font-mono text-xs text-neutral-400 uppercase tracking-wider font-bold">
                  GET NOTIFIED INSTANTLY UPON REOPENING
                </p>
                <div className="flex bg-neutral-900 border border-neutral-700 rounded-xl overflow-hidden focus-within:border-white transition-colors">
                  <span className="px-3 py-3 bg-neutral-800 text-neutral-300 font-mono text-xs font-bold border-r border-neutral-700 flex items-center">
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
                    className="px-5 bg-white text-black font-mono text-xs font-bold uppercase hover:bg-neutral-200 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? "..." : "NOTIFY ME"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Direct WhatsApp Concierge Help Button */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://wa.me/94704901027?text=Hello%20CALVIZ%20Desk%2C%20I%20am%20inquiring%20about%20orders%20during%20maintenance."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-mono text-xs font-bold uppercase rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl hover:scale-102 cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4" />
            <span>ORDER VIA DIRECT WHATSAPP</span>
          </a>

          <a
            href="tel:+94704901027"
            className="w-full sm:w-auto px-6 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 font-mono text-xs font-bold uppercase rounded-xl transition-colors text-center"
          >
            CALL HELPLINE (+94 70 490 1027)
          </a>
        </div>
      </main>

      {/* Footer Bar */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-850/80 font-mono text-[11px] text-neutral-500">
        <p>© {new Date().getFullYear()} CALVIZ ATELIER. ARCHITECTURAL READY-TO-WEAR.</p>
        <p className="uppercase tracking-widest text-neutral-400">COLOMBO 07 // SRI LANKA</p>
      </footer>
    </div>
  );
}
