import Link from "next/link";
import WhatsAppIcon from "@/components/WhatsAppIcon";

export default function Footer() {
  return (
    <footer className="w-full bg-white text-[#0a0a0a] border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand & Communiqué */}
          <div className="lg:col-span-5 space-y-4">
            <span className="text-2xl tracking-tighter uppercase text-black font-extrabold font-mono block">
              CALVIZ
            </span>
            <p className="text-sm text-neutral-600 max-w-sm leading-relaxed">
              Rigorous tailoring and heavyweight archival textiles engineered in Colombo. Designed with architectural permanence and understated modern luxury.
            </p>
            <div className="pt-2">
              {/* <p className="text-xs uppercase font-mono tracking-widest text-black font-bold mb-2">
                COMMUNICATE
              </p>
              <p className="text-xs text-neutral-500 mb-3">
                Receive invitation-only textile dispatches and early capsule access.
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="flex max-w-md">
                <input
                  type="email"
                  placeholder="ENTER YOUR EMAIL"
                  className="flex-1 bg-white border border-neutral-300 px-3.5 py-2 font-mono text-xs text-[#0a0a0a] placeholder:text-neutral-400 outline-none focus:border-black rounded-l"
                />
                <button
                  type="submit"
                  className="bg-black text-white px-5 py-2 text-xs font-mono font-bold uppercase hover:bg-neutral-800 transition-colors rounded-r"
                >
                  JOIN
                </button>
              </form> */}
            </div>
          </div>

          {/* Client Care */}
          <div className="lg:col-span-3 space-y-3">
            <p className="text-xs font-mono uppercase tracking-widest text-black font-bold">
              CLIENT CARE
            </p>
            <ul className="space-y-2 text-xs text-neutral-600 font-medium">
              <li>
                <Link href="/policy" className="hover:text-black transition-colors">
                  Shipping &amp; Returns
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-black transition-colors">
                  Order Tracking
                </Link>
              </li>
              <li>
                <Link href="/policy" className="hover:text-black transition-colors">
                  7-Day Size Exchange
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="hover:text-black transition-colors">
                  Sizing &amp; Fit Guide
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-black transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/#doorstep-delivery" className="hover:text-black transition-colors">
                  24-Hour Doorstep Delivery
                </Link>
              </li>
              <li className="pt-2">
                <a
                  href="https://wa.me/94704901027"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#075E54] border border-[#25D366]/30 font-mono text-[11px] font-bold transition-colors"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>WhatsApp </span>
                </a>
              </li>
            </ul>
          </div>

          {/* Archive & Lab */}
          {/* <div className="lg:col-span-2 space-y-3">
            <p className="text-xs font-mono uppercase tracking-widest text-black font-bold">
              ARCHIVE &amp; LAB
            </p>
            <ul className="space-y-2 text-xs text-neutral-600 font-medium">
              <li>
                <Link href="#offers" className="hover:text-black transition-colors">
                  Capsule Privileges
                </Link>
              </li>
              <li>
                <Link href="#lookbook" className="hover:text-black transition-colors">
                  Seasonal Monographs
                </Link>
              </li>
              <li>
                <Link href="#vip-reservation" className="hover:text-black transition-colors">
                  Colombo Flagship Atelier
                </Link>
              </li>
              <li>
                <Link href="/policy" className="hover:text-black transition-colors">
                  Terms &amp; Privacy Policy
                </Link>
              </li>
            </ul>
          </div> */}

          {/* Payment Modes */}
          <div className="lg:col-span-2 space-y-3">
            <p className="text-xs font-mono uppercase tracking-widest text-black font-bold">
              PAYMENT MODES
            </p>
            <div className="space-y-1.5 font-mono text-[11px] text-neutral-700 font-semibold">
              <div className="p-2 bg-neutral-50 border border-neutral-200 rounded">
                ISLAND-WIDE COD
              </div>
              <div className="p-2 bg-neutral-50 border border-neutral-200 rounded">
                DIRECT BANK TRANSFER
              </div>
              {/* <div className="p-2 bg-neutral-50 border border-neutral-200 rounded">
                VISA / MASTERCARD
              </div>
              <div className="p-2 bg-neutral-50 border border-neutral-200 rounded">
                KOKO PAY LATER (3X)
              </div> */}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-200">
          <p className="font-mono text-[11px] text-neutral-500 font-medium">
            © 2025 CALVIZ. ALL RIGHTS RESERVED.
          </p>
          <p className="font-mono text-[11px] text-neutral-500 uppercase tracking-widest font-medium">
            MADE IN SRI LANKA // ARCHITECTURAL READY-TO-WEAR
          </p>
        </div>
      </div>
    </footer>
  );
}
