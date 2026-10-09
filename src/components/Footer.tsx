import Link from "next/link";
import WhatsAppIcon from "@/components/WhatsAppIcon";

export default function Footer() {
  return (
    <footer className="relative w-full overflow-hidden bg-neutral-950 text-neutral-300 border-t border-neutral-850 animate-gradient-shade">
      {/* Ambient Moving Glow Accents */}
      <div className="absolute -top-24 left-1/4 w-96 h-96 bg-zinc-700/15 rounded-full blur-3xl pointer-events-none animate-glow-orb-1" />
      <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-neutral-600/15 rounded-full blur-3xl pointer-events-none animate-glow-orb-2" />

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand & Logo */}
          <div className="lg:col-span-5 space-y-5">
            <Link href="/" className="inline-flex items-center group py-1">
              <img
                src="/logo.png"
                alt="CALVIZ"
                className="h-16 sm:h-20 md:h-24 lg:h-28 w-auto max-w-full object-contain brightness-0 invert opacity-95 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105 drop-shadow-[0_4px_24px_rgba(255,255,255,0.18)]"
              />
            </Link>

            <p className="text-sm text-neutral-400 max-w-sm leading-relaxed">
              Premium heavyweight streetwear engineered in Colombo. Designed for daily comfort, clean fit, and lasting durability.
            </p>

            {/* Official Social Media Channels */}
            <div className="pt-2 space-y-2.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold block">
                OFFICIAL SOCIAL CHANNELS
              </span>
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Facebook */}
                <a
                  href="https://web.facebook.com/profile.php?id=61583053942508"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="CALVIZ on Facebook"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-[#1877F2]/15 hover:border-[#1877F2]/40 transition-all font-mono text-xs group shadow-xs hover:scale-102"
                >
                  <svg className="w-4 h-4 fill-current text-[#1877F2] group-hover:scale-110 transition-transform" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">Facebook</span>
                </a>

                {/* TikTok */}
                <a
                  href="https://www.tiktok.com/@calviz.clothing?_r=1&_t=ZS-99wGxgTprtt"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="CALVIZ on TikTok"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 hover:border-neutral-700 transition-all font-mono text-xs group shadow-xs hover:scale-102"
                >
                  <svg className="w-4 h-4 fill-current text-white group-hover:scale-110 transition-transform" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
                  </svg>
                  <span className="font-semibold">TikTok</span>
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/94704901027"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="CALVIZ on WhatsApp"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-[#25D366]/15 hover:border-[#25D366]/40 transition-all font-mono text-xs group shadow-xs hover:scale-102"
                >
                  <WhatsAppIcon className="w-4 h-4 text-[#25D366] group-hover:scale-110 transition-transform" />
                  <span className="font-semibold">WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Customer Care */}
          <div className="lg:col-span-4 space-y-3">
            <p className="text-xs font-mono uppercase tracking-widest text-white font-bold">
              CUSTOMER CARE &amp; SHIPPING
            </p>
            <ul className="space-y-2 text-xs text-neutral-400 font-medium">
              <li>
                <Link href="/about" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-neutral-600 font-mono">/</span>
                  <span>About CALVIZ</span>
                </Link>
              </li>
              <li>
                <Link href="/policy" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-neutral-600 font-mono">/</span>
                  <span>Shipping &amp; Returns Policy</span>
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-neutral-600 font-mono">/</span>
                  <span>Live Order Tracking</span>
                </Link>
              </li>
              <li>
                <Link href="/policy" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-neutral-600 font-mono">/</span>
                  <span>7-Day Complimentary Size Exchange</span>
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-neutral-600 font-mono">/</span>
                  <span>Size &amp; Fit Guide</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-neutral-600 font-mono">/</span>
                  <span>Contact Us</span>
                </Link>
              </li>
              <li>
                <Link href="/#doorstep-delivery" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-emerald-400 font-mono font-bold">⚡</span>
                  <span className="text-neutral-200 hover:text-white">24-Hour Doorstep Delivery in Colombo</span>
                </Link>
              </li>
              <li>
                <a
                  href="https://share.google/Hr1ChY38IMVGX469a"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-neutral-300"
                >
                  <span className="text-emerald-400 font-mono font-bold">📍</span>
                  <span>Google Business &amp; Maps Location</span>
                </a>
              </li>
              <li className="pt-2 flex flex-wrap items-center gap-2">
                <a
                  href="https://www.facebook.com/share/1FpUSPmWLu/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1877F2]/15 hover:bg-[#1877F2]/25 text-[#1877F2] border border-[#1877F2]/40 font-mono text-[11px] font-bold transition-all shadow-xs hover:scale-102"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                  <span>Facebook</span>
                </a>
                <a
                  href="https://www.tiktok.com/@calviz.clothing?_r=1&_t=ZS-99wGxgTprtt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 font-mono text-[11px] font-bold transition-all shadow-xs hover:scale-102"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
                  </svg>
                  <span>TikTok</span>
                </a>
                <a
                  href="https://wa.me/94704901027"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/40 font-mono text-[11px] font-bold transition-all shadow-xs hover:scale-102"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>WhatsApp</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Payment Modes */}
          <div className="lg:col-span-3 space-y-3">
            <p className="text-xs font-mono uppercase tracking-widest text-white font-bold">
              PAYMENT PROTOCOLS
            </p>
            <div className="space-y-2 font-mono text-[11px] text-neutral-300 font-semibold">
              <div className="p-2.5 bg-neutral-900/90 border border-neutral-800 rounded flex items-center justify-between hover:border-neutral-700 transition-colors">
                <span>ISLAND-WIDE COD</span>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60">ACTIVE</span>
              </div>
              <div className="p-2.5 bg-neutral-900/90 border border-neutral-800 rounded flex items-center justify-between hover:border-neutral-700 transition-colors">
                <span>DIRECT BANK TRANSFER</span>
                <span className="text-[10px] text-neutral-400 font-medium">SLIP UPLOAD</span>
              </div>
              <div className="p-2.5 bg-neutral-900/50 border border-neutral-800/70 rounded flex items-center justify-between text-neutral-500">
                <span>KOKO PAY LATER </span>
                <span className="text-[10px] text-neutral-500">COMING SOON</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-850">
          <p className="font-mono text-[11px] text-neutral-400 font-medium">
            © {new Date().getFullYear()} CALVIZ. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-4 text-[11px] font-mono text-neutral-400">
            <a
              href="https://www.facebook.com/share/1FpUSPmWLu/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span>FACEBOOK</span>
            </a>
            <span className="text-neutral-700">•</span>
            <a
              href="https://www.tiktok.com/@calviz.clothing?_r=1&_t=ZS-99wGxgTprtt"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span>TIKTOK</span>
            </a>
            <span className="text-neutral-700">•</span>
            <a
              href="https://wa.me/94704901027"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span>WHATSAPP</span>
            </a>
          </div>
          <p className="font-mono text-[11px] text-neutral-400 uppercase tracking-widest font-medium">
            MADE IN SRI LANKA // READY-TO-WEAR
          </p>
        </div>
      </div>
    </footer>
  );
}

