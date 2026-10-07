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
                className="h-10 md:h-12 w-auto object-contain brightness-0 invert opacity-95 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105 drop-shadow-[0_2px_12px_rgba(255,255,255,0.15)]"
              />
            </Link>

            <p className="text-sm text-neutral-400 max-w-sm leading-relaxed">
              Rigorous tailoring and heavyweight archival textiles engineered in Colombo. Designed with architectural permanence and understated modern luxury.
            </p>

            {/* <div className="flex items-center gap-3 pt-2 font-mono text-[11px] text-neutral-400">
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900/90 border border-neutral-800 rounded text-neutral-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>FLAGSHIP ATELIER</span>
              </span>
              <span className="px-2.5 py-1 bg-neutral-900/90 border border-neutral-800 rounded text-neutral-300">
                COLOMBO 07
              </span>
            </div> */}
          </div>

          {/* Client Care */}
          <div className="lg:col-span-4 space-y-3">
            <p className="text-xs font-mono uppercase tracking-widest text-white font-bold">
              CLIENT CARE &amp; LOGISTICS
            </p>
            <ul className="space-y-2 text-xs text-neutral-400 font-medium">
              <li>
                <Link href="/about" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-neutral-600 font-mono">/</span>
                  <span>About CALVIZ Atelier</span>
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
                  <span>Live Consignment Tracking</span>
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
                  <span>Sizing &amp; Fitment Blueprint</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="text-neutral-600 font-mono">/</span>
                  <span>Direct Client Relations</span>
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
              <li className="pt-2">
                <a
                  href="https://wa.me/94704901027"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/40 font-mono text-[11px] font-bold transition-all shadow-xs hover:scale-102"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>WhatsApp(+94 70 490 1027)</span>
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
          <p className="font-mono text-[11px] text-neutral-400 uppercase tracking-widest font-medium">
            MADE IN SRI LANKA // READY-TO-WEAR
          </p>
        </div>
      </div>
    </footer>
  );
}

