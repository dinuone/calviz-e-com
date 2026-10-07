"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Navigation,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { validateSafePlainText, validateSafeTextInput, validateSriLankanMobile } from "@/lib/sanitizer";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [inquiryType, setInquiryType] = useState("Sizing & Fit Advice");
  const [message, setMessage] = useState("");

  // Honeypot & Timing Defence
  const [hpWebsiteUrl, setHpWebsiteUrl] = useState("");
  const [formMountTime, setFormMountTime] = useState<number>(0);

  useEffect(() => {
    setFormMountTime(Date.now());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Validate inputs against SQL Injection and Script/HTML injection
    const nameErr = validateSafePlainText(name, "Name");
    if (nameErr) {
      setErrorMessage(nameErr);
      return;
    }

    const emailErr = validateSafePlainText(email, "Email");
    if (emailErr) {
      setErrorMessage(emailErr);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email.trim())) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    // Strict 9-digit Sri Lankan mobile validation
    const phoneCheck = validateSriLankanMobile(phone);
    if (!phoneCheck.isValid) {
      setErrorMessage(phoneCheck.error || "Please enter a valid 9-digit mobile number starting with 7.");
      return;
    }

    const msgErr = validateSafeTextInput(message, "Message");
    if (msgErr) {
      setErrorMessage(msgErr);
      return;
    }

    setSubmitting(true);
    const elapsedSeconds = (Date.now() - formMountTime) / 1000;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5070/api";
      const res = await fetch(`${apiUrl}/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          inquiryType,
          message: message.trim(),
          hpWebsiteUrl,
          submitElapsedSeconds: elapsedSeconds,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to submit message. Please try again.");
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred. Please try again or message our WhatsApp directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-between selection:bg-black selection:text-white">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 pt-32 md:pt-40 pb-20">
        {/* Header Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-neutral-200 bg-neutral-900 text-white p-8 sm:p-12 mb-12 shadow-xl">
          <img
            src="/atelier-studio.jpg"
            alt="CALVIZ Atelier"
            className="absolute inset-0 w-full h-full object-cover opacity-20 filter grayscale contrast-125"
          />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white font-mono text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>DIRECT CLIENT</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight font-mono">
              CONNECT WITH CALVIZ
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-neutral-300 leading-relaxed font-medium">
              Have questions regarding sizing, custom order inquiries, bank transfer verifications, or urgent express courier dispatches? Our Colombo desk is ready to assist you.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details & Channels (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* WhatsApp VIP Concierge Card */}
            <div className="bg-gradient-to-br from-emerald-950 via-neutral-900 to-black text-white p-6 sm:p-7 rounded-2xl shadow-xl border border-emerald-800/60 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400 font-bold">
                    ⚡ FASTEST RESPONSE // &lt; 2 MINS
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                </div>

                <h3 className="text-lg font-black uppercase text-white font-mono tracking-tight">
                  WHATSAPP
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Chat directly with our Colombo client desk for instant sizing assistance, live stock checks, and rapid payment slip verification.
                </p>
                <div className="pt-2">
                  <a
                    href="https://wa.me/94704901027"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-mono font-bold uppercase rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:scale-102"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    <span>WHATSAPP (+94 70 490 1027)</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Direct Contact Points */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-5 shadow-xs font-mono text-xs">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-black shrink-0 border border-neutral-200">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-neutral-500 uppercase text-[10px] block font-bold">TELEPHONE HOTLINE</span>
                  <a href="tel:+94704901027" className="text-sm font-bold text-black hover:underline mt-0.5 block">
                    +94 70 490 1027
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5 pt-3.5 border-t border-neutral-100">
                <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-black shrink-0 border border-neutral-200">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-neutral-500 uppercase text-[10px] block font-bold">ELECTRONIC DISPATCH</span>
                  <a href="mailto:info@calviz.lk" className="text-sm font-bold text-black hover:underline mt-0.5 block">
                    info@calviz.lk
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5 pt-3.5 border-t border-neutral-100">
                <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-black shrink-0 border border-neutral-200">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-neutral-500 uppercase text-[10px] block font-bold">ATELIER STUDIO</span>
                  <p className="text-xs font-semibold text-neutral-800 mt-0.5">
                    Island-Wide Logistics, Sri Lanka
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 pt-3.5 border-t border-neutral-100">
                <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-black shrink-0 border border-neutral-200">
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

            {/* Google Business Direct Action */}
            <div className="p-4 bg-white rounded-2xl border border-neutral-200 flex items-center justify-between shadow-xs font-mono text-xs">
              <div className="flex items-center gap-2 text-neutral-700">
                <Navigation className="w-4 h-4 text-black" />
                <span className="font-bold">Locate on Google Maps</span>
              </div>
              <a
                href="https://share.google/Hr1ChY38IMVGX469a"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:underline font-bold flex items-center gap-1 text-[11px]"
              >
                <span>Navigate</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Contact Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 md:p-10 shadow-sm">
            <div className="mb-6">
              <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 font-bold block mb-1">
                TRANSMIT INQUIRY
              </span>
              <h2 className="text-2xl font-black uppercase text-black font-mono tracking-tight">
                SEND A MESSAGE TO US
              </h2>
              <p className="text-xs text-neutral-600 mt-1 font-medium">
                Our client relations desk responds to all formal inquiries within 2 to 4 working hours.
              </p>
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
                  Thank you for contacting CALVIZ. Our atelier client support desk has received your message and will follow up shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setMessage("");
                  }}
                  className="mt-4 px-5 py-2.5 bg-black text-white text-xs font-mono font-bold uppercase rounded-xl hover:bg-neutral-800 transition-colors"
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
                    Inquiry Classification
                  </label>
                  <select
                    value={inquiryType}
                    onChange={(e) => setInquiryType(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-black focus:bg-white focus:outline-none focus:ring-2 focus:ring-black font-medium font-mono text-xs"
                  >
                    <option value="Sizing & Fit Advice">Sizing &amp; Fit Advice</option>
                    <option value="Order Tracking & Courier Status">Order Tracking &amp; Courier Status</option>
                    <option value="Bank Transfer Payment Verification">Bank Transfer Payment Verification</option>
                    <option value="7-Day Size Exchange Request">7-Day Size Exchange Request</option>
                    <option value="Corporate / Custom Capsule Order">Corporate / Custom Capsule Order</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Your Message / Inquiry *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide details regarding your order or inquiry..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-black focus:bg-white focus:outline-none focus:ring-2 focus:ring-black font-medium resize-none"
                  />
                </div>


                {errorMessage && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-mono flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Invisible Anti-Bot Honeypot Field */}
                <div style={{ display: "none", opacity: 0, position: "absolute", left: "-9999px" }} aria-hidden="true">
                  <label htmlFor="hp_website_url">Website URL (leave blank)</label>
                  <input
                    id="hp_website_url"
                    type="text"
                    name="hp_website_url"
                    value={hpWebsiteUrl}
                    onChange={(e) => setHpWebsiteUrl(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 mt-2 btn-add-to-bag text-white rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>ENCRYPTING &amp; TRANSMITTING...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>TRANSMIT MESSAGE TO ATELIER</span>
                    </>
                  )}
                </button>

                {/* Security Trust Pillars */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] text-neutral-500 border-t border-neutral-100">
                  <div className="flex items-center gap-1 text-neutral-600">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>256-Bit SSL Encrypted</span>
                  </div>
                  <div className="flex items-center gap-1 text-neutral-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified Colombo Desk</span>
                  </div>
                  <div className="flex items-center gap-1 text-neutral-600">
                    <span>⚡ 2-4h Response SLA</span>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
