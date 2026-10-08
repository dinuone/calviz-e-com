import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import {
  ShieldCheck,
  MapPin,
  Star,
  Clock,
  ExternalLink,
  Award,
  Sparkles,
  Layers,
  Navigation,
  ArrowRight,
  CheckCircle2,
  Cpu
} from "lucide-react";

export const metadata = {
  title: "About CALVIZ // Premium Streetwear Colombo",
  description: "Learn about CALVIZ: Premium heavyweight combed cotton streetwear crafted for lasting comfort, zero collar sag, and modern minimalist style.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-between selection:bg-black selection:text-white">
      <Header />

      <main className="flex-1 w-full pt-32 md:pt-40 pb-20">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 mb-16 md:mb-24">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-900 text-white rounded-full font-mono text-[11px] uppercase tracking-wider shadow-xs border border-neutral-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>OUR STORY</span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase text-black tracking-tight font-mono leading-none">
              PREMIUM HEAVYWEIGHT STREETWEAR.
            </h1>

            <p className="text-sm md:text-base text-neutral-600 max-w-2xl leading-relaxed font-medium">
              CALVIZ was created with a clear purpose: to craft premium streetwear that lasts. We focus on durable heavyweight cotton, flawless fits, and clean, modern styles that outlast fast-fashion trends.
            </p>
          </div>

          {/* Hero Banner Grid */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            <div className="md:col-span-8 relative rounded-2xl overflow-hidden border border-neutral-200 shadow-sm group min-h-[360px] md:min-h-[480px]">
              <img
                src="/atelier-studio.jpg"
                alt="CALVIZ Colombo Design Studio"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-10 text-white">
                <span className="font-mono text-xs uppercase tracking-widest text-emerald-400 font-bold mb-1">
                  OUR DESIGN STUDIO
                </span>
                <h3 className="text-xl md:text-2xl font-black uppercase font-mono tracking-tight">
                  CRAFTED FOR DURABILITY &amp; STYLE
                </h3>
                <p className="text-xs md:text-sm text-neutral-300 max-w-xl mt-2 leading-relaxed">
                  Every pattern cut, silhouette block, and structural seam is crafted in our local workshop to guarantee a long-lasting, comfortable fit.
                </p>
              </div>
            </div>

            <div className="md:col-span-4 relative rounded-2xl overflow-hidden border border-neutral-200 shadow-sm group min-h-[300px] md:min-h-[480px] bg-neutral-900">
              <img
                src="/textile-craft.jpg"
                alt="CALVIZ Heavyweight Combed Cotton Craft"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6 md:p-8 text-white">
                <span className="font-mono text-xs uppercase tracking-widest text-neutral-400 font-bold mb-1">
                  PREMIUM HEAVYWEIGHT COTTON
                </span>
                <h3 className="text-lg md:text-xl font-black uppercase font-mono tracking-tight">
                  ZERO COLLAR SAG
                </h3>
                <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
                  Durable ribbed neck collar reinforced with double-needle lockstitching that stays crisp wash after wash.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Pillars of Craftsmanship */}
        <section className="w-full bg-white border-y border-neutral-200 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 font-bold">
                  OUR STANDARDS
                </p>
                <h2 className="text-2xl md:text-4xl font-black uppercase text-black font-mono tracking-tight mt-1">
                  HOW CALVIZ ELEVATES STREETWEAR
                </h2>
              </div>
              <p className="text-xs md:text-sm text-neutral-600 max-w-md font-medium">
                We reject fast-fashion synthetics. Every piece is crafted from premium, high-density cotton.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pillar 1 */}
              <div className="p-8 bg-neutral-50 rounded-2xl border border-neutral-200 hover:border-black transition-all group relative overflow-hidden">
                <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black uppercase text-black font-mono tracking-tight mb-2">
                  PREMIUM HEAVYWEIGHT KNIT
                </h3>
                <p className="text-xs md:text-sm text-neutral-600 leading-relaxed font-medium">
                  Spun from 100% long-staple combed cotton fibres. Produces a soft, heavyweight feel that holds a clean relaxed drape.
                </p>
                <div className="mt-4 pt-4 border-t border-neutral-200 flex items-center gap-2 font-mono text-xs text-neutral-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Pre-Shrunk &amp; Anti-Pill</span>
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="p-8 bg-neutral-50 rounded-2xl border border-neutral-200 hover:border-black transition-all group relative overflow-hidden">
                <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black uppercase text-black font-mono tracking-tight mb-2">
                  ZERO SAG COLLAR
                </h3>
                <p className="text-xs md:text-sm text-neutral-600 leading-relaxed font-medium">
                  Crafted with high-elasticity ribbed collars that stay crisp, flat, and never loosen or sag after repeated washes.
                </p>
                <div className="mt-4 pt-4 border-t border-neutral-200 flex items-center gap-2 font-mono text-xs text-neutral-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dual Twin-Needle Binding</span>
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="p-8 bg-neutral-50 rounded-2xl border border-neutral-200 hover:border-black transition-all group relative overflow-hidden">
                <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black uppercase text-black font-mono tracking-tight mb-2">
                  ETHICAL LOCAL CRAFTSMANSHIP
                </h3>
                <p className="text-xs md:text-sm text-neutral-600 leading-relaxed font-medium">
                  Proudly cut, assembled, and finished in Sri Lanka by skilled makers receiving fair living wages and working under world-class production standards.
                </p>
                <div className="mt-4 pt-4 border-t border-neutral-200 flex items-center gap-2 font-mono text-xs text-neutral-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Ethical Craftsmanship</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Google My Business & Verified Presence Section */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="bg-neutral-900 text-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-neutral-800 shadow-2xl relative overflow-hidden">
            {/* Ambient Lighting */}
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Info Column */}
              <div className="lg:col-span-6 space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white font-mono text-[11px] font-bold">
                    <svg className="w-3.5 h-3.5 fill-current text-[#4285F4]" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                    </svg>
                    <span>GOOGLE VERIFIED BUSINESS</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 font-mono text-xs font-bold">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-white ml-1 font-bold">4.9 / 5.0</span>
                  </div>
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase text-white font-mono tracking-tight">
                  CONNECT WITH CALVIZ ON GOOGLE
                </h2>



                {/* Business Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs pt-2">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-1.5">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <MapPin className="w-4 h-4" />
                      <span>LOCATION</span>
                    </div>
                    <p className="text-neutral-300 font-sans text-xs">
                      CALVIZ Headquarters &amp; Studio, Kandy Logistics Hub, Sri Lanka
                    </p>
                  </div>

                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-1.5">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <Clock className="w-4 h-4" />
                      <span>OPERATING HOURS</span>
                    </div>
                    <p className="text-neutral-300 font-sans text-xs">
                      Monday – Sunday: 9:00 AM – 8:00 PM (IST)
                    </p>
                  </div>
                </div>

                {/* Action CTAs */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href="https://share.google/Hr1ChY38IMVGX469a"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 bg-white text-black hover:bg-neutral-200 text-xs font-mono font-bold uppercase rounded-xl transition-all flex items-center gap-2 shadow-md hover:scale-102"
                  >
                    <Navigation className="w-3.5 h-3.5 text-black" />
                    <span>GET DIRECTIONS ON GOOGLE MAPS</span>
                  </a>

                  <a
                    href="https://wa.me/94704901027"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 text-xs font-mono font-bold uppercase rounded-xl transition-all flex items-center gap-2 shadow-xs hover:scale-102"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5" />
                    <span>WHATSAPP SUPPORT</span>
                  </a>
                </div>
              </div>

              {/* Right Interactive Map Card */}
              <div className="lg:col-span-6">
                <div className="rounded-2xl overflow-hidden border border-neutral-700 bg-neutral-950 shadow-2xl relative">
                  {/* Map Header */}
                  <div className="px-4 py-3 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between font-mono text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="font-bold text-white uppercase">LIVE LOCATION</span>
                    </div>
                    <span className="text-neutral-400">SRI LANKA</span>
                  </div>

                  {/* Interactive Embedded Google Map */}
                  <div className="w-full h-80 relative">
                    <iframe
                      title="CALVIZ Official Location"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126743.58638755018!2d79.78616428784179!3d6.921833544605151!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae253d10f7a7003%3A0x320b2e4d32d3838d!2sColombo%2C%20Sri%20Lanka!5e0!3m2!1sen!2slk!4v1700000000000!5m2!1sen!2slk"
                      className="w-full h-full border-0 filter grayscale contrast-125 opacity-90 hover:opacity-100 hover:filter-none transition-all duration-500"
                      allowFullScreen={false}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>

                  {/* Map Footer Bar */}
                  <div className="p-4 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between font-mono text-[11px]">
                    <div className="flex items-center gap-2 text-neutral-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Verified Google Business Entity</span>
                    </div>
                    <a
                      href="https://share.google/Hr1ChY38IMVGX469a"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-emerald-400 underline flex items-center gap-1 font-bold"
                    >
                      <span>Open Full Map</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Direct Call to Action */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 text-center mt-12">
          <div className="p-10 md:p-14 bg-white rounded-3xl border border-neutral-200 shadow-sm space-y-4 max-w-4xl mx-auto">
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 font-bold block">
              READY FOR ELEVATED BASICS?
            </span>
            <h2 className="text-2xl md:text-4xl font-black uppercase text-black font-mono tracking-tight">
              EXPLORE OUR LATEST DROPS
            </h2>
            <p className="text-xs md:text-sm text-neutral-600 max-w-xl mx-auto leading-relaxed font-medium">
              Limited quantities crafted per batch. Experience premium heavyweight streetwear cotton.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/products"
                className="px-6 py-3.5 bg-black text-white text-xs font-mono font-bold uppercase rounded-xl hover:bg-neutral-800 transition-all flex items-center gap-2 shadow-md"
              >
                <span>SHOP ALL PRODUCTS</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="px-6 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-black text-xs font-mono font-bold uppercase rounded-xl transition-all border border-neutral-200"
              >
                CONTACT
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
