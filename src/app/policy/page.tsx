import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ShieldCheck, Truck, RefreshCw, Clock, Lock, CheckCircle2, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Client Care & Policies | CALVIZ Atelier",
  description: "Explore CALVIZ 24-hour express courier delivery SLA, 7-day effortless size exchange protocol, payment security, and privacy standards.",
};

export default function PolicyPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-between">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-8 pt-36 md:pt-44 pb-20">
        {/* Header Banner */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 font-bold block mb-2">
            CLIENT ASSURANCE PROTOCOLS
          </span>
          <h1 className="text-3xl md:text-4xl font-black uppercase text-black tracking-tight font-mono">
            SHIPPING, EXCHANGES &amp; ATELIER POLICIES
          </h1>
          <p className="text-sm text-neutral-600 mt-3 font-medium leading-relaxed">
            CALVIZ operates with strict quality control, sealed packaging standards, and island-wide express courier fulfillment.
          </p>
        </div>

        {/* Policy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1: 24h Express Delivery */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-7 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center mb-4">
              <Truck className="w-5 h-5" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-600 font-bold block mb-1">
              LOGISTICS SLA
            </span>
            <h3 className="text-lg font-black uppercase text-black font-mono tracking-tight">
              24-Hour Doorstep Delivery
            </h3>
            <p className="text-xs text-neutral-600 mt-2 leading-relaxed font-medium">
              Orders confirmed before 2:00 PM are dispatched immediately. Standard delivery across Colombo within 24 hours, and 48–72 hours island-wide via Royal Express Courier & Logistics.
            </p>
          </div>

          {/* Card 2: 7-Day Size Exchange */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-7 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center mb-4">
              <RefreshCw className="w-5 h-5" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-purple-600 font-bold block mb-1">
              GUARANTEE
            </span>
            <h3 className="text-lg font-black uppercase text-black font-mono tracking-tight">
              7-Day Size Exchange
            </h3>
            <p className="text-xs text-neutral-600 mt-2 leading-relaxed font-medium">
              If your garment requires sizing adjustments, notify our WhatsApp concierge within 7 calendar days of delivery. Replacement sizes are dispatched directly to your doorstep.
            </p>
          </div>

          {/* Card 3: Sealed Packaging & Payment */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-7 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-blue-600 font-bold block mb-1">
              HANDOVER STANDARDS
            </span>
            <h3 className="text-lg font-black uppercase text-black font-mono tracking-tight">
              Sealed Courier Handover
            </h3>
            <p className="text-xs text-neutral-600 mt-2 leading-relaxed font-medium">
              All garments are dispatched in hermetically sealed luxury packaging to ensure untouched quality. Open-box doorstep inspection is strictly not permitted prior to payment.
            </p>
          </div>
        </div>

        {/* Detailed Policy Sections */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 sm:p-10 space-y-10 shadow-sm">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-black uppercase text-black font-mono tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-black inline-block" />
              1. Island-Wide Shipping Rates &amp; Schedules
            </h2>
            <div className="text-xs sm:text-sm text-neutral-700 leading-relaxed space-y-2">
              <p>
                • <strong>Colombo &amp; Suburbs:</strong> Flat rate of LKR 425. Guaranteed doorstep delivery within 24 hours of dispatch.
              </p>
              <p>
                • <strong>Outstation Island-Wide:</strong> Flat rate of LKR 425 (or as calculated by city). Delivered within 48 to 72 business hours.
              </p>
              <p>
                • <strong>Complimentary Shipping Privilege:</strong> Orders with a bag subtotal exceeding LKR 10,000 qualify for automatic free island-wide delivery.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 pt-6 border-t border-neutral-100">
            <h2 className="text-xl font-black uppercase text-black font-mono tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-black inline-block" />
              2. 7-Day Size Exchange Procedure
            </h2>
            <div className="text-xs sm:text-sm text-neutral-700 leading-relaxed space-y-2">
              <p>
                To maintain the highest hygiene and quality benchmarks, size exchanges are governed by the following criteria:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-neutral-600">
                <li>Garment must be unworn, unwashed, and in its original pristine condition with all hangtags intact.</li>
                <li>Request must be submitted within 7 days of delivery through our WhatsApp Concierge at <strong>+94 70 490 1027</strong>.</li>
                <li>Once verified, our courier partner will deliver the new size and collect the previous item in a single coordinated handover.</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 pt-6 border-t border-neutral-100">
            <h2 className="text-xl font-black uppercase text-black font-mono tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-black inline-block" />
              3. Payment Verification &amp; Bank Transfers
            </h2>
            <div className="text-xs sm:text-sm text-neutral-700 leading-relaxed space-y-2">
              <p>
                • <strong>Cash on Delivery (COD):</strong> Pay exact invoice amount in cash to the courier rider upon delivery.
              </p>
              <p>
                • <strong>Direct Bank Transfer:</strong> Transfer order total to our verified Commercial Bank or Sampath Bank accounts and upload your deposit slip or transaction receipt at checkout or via order tracking. Orders are dispatched once verified by our finance desk.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 pt-6 border-t border-neutral-100">
            <h2 className="text-xl font-black uppercase text-black font-mono tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-black inline-block" />
              4. Client Privacy &amp; Data Security
            </h2>
            <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
              CALVIZ is committed to protecting your client data. Phone numbers and delivery addresses are encrypted and exclusively utilized for courier dispatch, delivery SMS notifications, and VIP capsule announcements. We do not sell or share client records with third parties.
            </p>
          </section>
        </div>

        {/* Contact CTA */}
        <div className="mt-8 p-6 bg-black text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 font-bold block">
              NEED IMMEDIATE ASSISTANCE?
            </span>
            <p className="text-sm font-bold uppercase mt-0.5">
              Our Colombo Atelier Client Concierge is available 9:00 AM – 8:00 PM daily.
            </p>
          </div>
          <a
            href="https://wa.me/94704901027"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-white text-black hover:bg-neutral-200 text-xs font-mono font-bold uppercase rounded-xl transition-all inline-flex items-center gap-1.5 shrink-0 justify-center shadow-md"
          >
            <span>WHATSAPP CONCIERGE →</span>
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
