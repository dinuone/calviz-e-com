"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, ShieldCheck } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-between">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-8 pt-36 md:pt-44 pb-20">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 font-bold block mb-2">
            CLIENT CONCIERGE &amp; ATELIER SUPPORT
          </span>
          <h1 className="text-3xl md:text-4xl font-black uppercase text-black tracking-tight font-mono">
            GET IN TOUCH WITH CALVIZ
          </h1>
          <p className="text-sm text-neutral-600 mt-3 font-medium leading-relaxed">
            Have questions regarding sizing, custom capsule orders, bank transfer confirmations, or courier dispatch? Our team is at your disposal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Contact Details & Channels (5 cols) */}
          <div className="md:col-span-5 space-y-6">
            {/* WhatsApp VIP Concierge Card */}
            <div className="bg-emerald-950 text-white p-6 sm:p-7 rounded-2xl shadow-lg border border-emerald-800/60 relative overflow-hidden">
              <div className="relative z-10 space-y-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400 font-bold block">
                  FASTEST RESPONSE CHANNEL
                </span>
                <h3 className="text-lg font-black uppercase text-white font-mono tracking-tight">
                  WHATSAPP DIRECT CONCIERGE
                </h3>
                <p className="text-xs text-emerald-200/90 leading-relaxed">
                  Connect directly with our Colombo client desk for instant sizing assistance, order status lookups, and bank transfer slip verification.
                </p>
                <div className="pt-2">
                  <a
                    href="https://wa.me/94704901027"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-mono font-bold uppercase rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    <span>CHAT ON WHATSAPP (+94 70 490 1027)</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Direct Contact Points */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-5 shadow-xs font-mono text-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-black shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-neutral-500 uppercase text-[10px] block font-bold">CLIENT HELPLINE</span>
                  <a href="tel:+94704901027" className="text-sm font-bold text-black hover:underline mt-0.5 block">
                    +94 70 490 1027
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-neutral-100">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-black shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-neutral-500 uppercase text-[10px] block font-bold">ELECTRONIC DESK</span>
                  <a href="mailto:info@calviz.lk" className="text-sm font-bold text-black hover:underline mt-0.5 block">
                    info@calviz.lk
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-neutral-100">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-black shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-neutral-500 uppercase text-[10px] block font-bold">ATELIER STUDIO</span>
                  <p className="text-xs font-semibold text-neutral-800 mt-0.5">
                    Kandy, Sri Lanka (Island-Wide Logistics &amp; Atelier Hub)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-neutral-100">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-black shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-neutral-500 uppercase text-[10px] block font-bold">OPERATING HOURS</span>
                  <p className="text-xs font-semibold text-neutral-800 mt-0.5">
                    Monday – Sunday: 9:00 AM – 8:00 PM (IST)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form (7 cols) */}
          <div className="md:col-span-7 bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-sm">
            <div className="mb-6">
              <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 font-bold block mb-1">
                TRANSMIT INQUIRY
              </span>
              <h2 className="text-xl font-black uppercase text-black font-mono tracking-tight">
                SEND A MESSAGE TO OUR TEAM
              </h2>
            </div>

            {submitted ? (
              <div className="p-8 bg-neutral-50 border border-neutral-200 rounded-2xl text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-black uppercase font-mono">
                  MESSAGE TRANSMITTED
                </h3>
                <p className="text-xs text-neutral-600 font-medium max-w-md mx-auto">
                  Thank you for contacting CALVIZ. Our atelier client support desk has received your message and will follow up within 2–4 hours.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setMessage("");
                  }}
                  className="mt-4 px-4 py-2 bg-black text-white text-xs font-mono font-bold uppercase rounded-xl hover:bg-neutral-800 transition-colors"
                >
                  SEND ANOTHER MESSAGE
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Kasun Perera"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-black focus:bg-white focus:outline-none focus:ring-2 focus:ring-black font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="kasun@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-black focus:bg-white focus:outline-none focus:ring-2 focus:ring-black font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="077 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-black focus:bg-white focus:outline-none focus:ring-2 focus:ring-black font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Your Message / Inquiry *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Inquiry regarding sizing, capsule orders, or delivery dispatch..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-black focus:bg-white focus:outline-none focus:ring-2 focus:ring-black font-medium resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 mt-2 bg-black text-white rounded-xl font-mono text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>TRANSMIT MESSAGE TO ATELIER</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
