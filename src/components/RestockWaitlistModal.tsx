"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Bell,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Phone,
  Mail,
  User,
  ShieldCheck,
  Package,
} from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { getMediaUrl } from "@/lib/api";
import {
  validateSafePlainText,
  validateSafeTextInput,
  validateSriLankanMobile,
} from "@/lib/sanitizer";

export interface WaitlistProductData {
  id: string;
  name: string;
  slug: string;
  basePrice?: number;
  primaryImageUrl?: string;
  images?: { imageUrl: string }[];
  availableSizes?: string[];
  availableColors?: string[];
}

interface RestockWaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: WaitlistProductData | null;
  initialSize?: string;
  initialColor?: string;
  onSuccess?: (productId: string, size?: string) => void;
}

const STORAGE_KEY = "calviz_restock_waitlist";

export function getWaitlistedProductIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveWaitlistProductId(productId: string): void {
  if (typeof window === "undefined" || !productId) return;
  try {
    const existing = getWaitlistedProductIds();
    if (!existing.includes(productId)) {
      existing.push(productId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    }
  } catch {
    // Ignore storage errors
  }
}

export default function RestockWaitlistModal({
  isOpen,
  onClose,
  product,
  initialSize,
  initialColor,
  onSuccess,
}: RestockWaitlistModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Anti-Bot & Honeypot Defence
  const [hpWebsiteUrl, setHpWebsiteUrl] = useState("");
  const [formMountTime, setFormMountTime] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setFormMountTime(Date.now());
      setSubmitted(false);
      setErrorMessage("");
      if (initialSize) {
        setSelectedSize(initialSize);
      } else if (product?.availableSizes && product.availableSizes.length > 0) {
        setSelectedSize(product.availableSizes[0]);
      } else {
        setSelectedSize("M");
      }
    }
  }, [isOpen, product, initialSize]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !submitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, submitting, onClose]);

  if (!isOpen || !product) return null;

  const productImage =
    product.primaryImageUrl ||
    product.images?.[0]?.imageUrl ||
    "/placeholder-product.jpg";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // 1. Validate Name
    const nameErr = validateSafePlainText(name, "Full Name");
    if (nameErr) {
      setErrorMessage(nameErr);
      return;
    }

    // 2. Validate Mobile Number (Strict 9-digit LK format or standard international)
    const phoneCheck = validateSriLankanMobile(phone);
    if (!phoneCheck.isValid) {
      setErrorMessage(
        phoneCheck.error ||
          "Please enter a valid 9-digit mobile number (e.g., 077 123 4567 or 77 123 4567)."
      );
      return;
    }

    // 3. Optional Email Validation
    if (email && email.trim()) {
      const emailErr = validateSafePlainText(email, "Email");
      if (emailErr) {
        setErrorMessage(emailErr);
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setErrorMessage("Please enter a valid email address.");
        return;
      }
    }

    setSubmitting(true);
    const elapsedSeconds = (Date.now() - formMountTime) / 1000;

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5089/api";

      const formattedPhone = phoneCheck.normalized || phone.trim();
      const colorText =
        initialColor ||
        product.availableColors?.[0] ||
        "Default Colorway";

      const imgToSubmit =
        product.primaryImageUrl ||
        product.images?.[0]?.imageUrl ||
        "";

      const restockMessage = [
        `RESTOCK WAITLIST REQUEST`,
        `Product: ${product.name}`,
        `SKU/Slug: ${product.slug}`,
        `Requested Size: ${selectedSize}`,
        `Color: ${colorText}`,
        imgToSubmit ? `Image: ${imgToSubmit}` : null,
        `Customer: ${name.trim()}`,
        `Contact Phone: ${formattedPhone}`,
        email ? `Email: ${email.trim()}` : null,
      ]
        .filter(Boolean)
        .join(" | ");

      const payload = {
        name: name.trim(),
        phone: formattedPhone,
        email: email ? email.trim() : undefined,
        inquiryType: "Restock Waitlist",
        message: restockMessage,
        hpWebsiteUrl: hpWebsiteUrl || undefined,
        submitElapsedSeconds: Math.max(elapsedSeconds, 1.5),
      };

      const res = await fetch(`${apiUrl}/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.message ||
            "Unable to record restock request right now. Please try via WhatsApp."
        );
      }

      saveWaitlistProductId(product.id);
      if (onSuccess) {
        onSuccess(product.id, selectedSize);
      }
      setSubmitted(true);
    } catch (err: any) {
      console.error("Restock waitlist submission error:", err);
      // Fallback: If network issue, still treat gracefully and offer WhatsApp
      setErrorMessage(
        err.message ||
          "Network connectivity issue. You can also message our team directly on WhatsApp."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formattedPrice =
    typeof product.basePrice === "number"
      ? `LKR ${Number(product.basePrice).toLocaleString()}`
      : null;

  const whatsappMessage = encodeURIComponent(
    `Hi Calviz Team, I'm interested in the sold out "${product.name}" in Size: ${selectedSize}. Could you please let me know when this will be restocked?`
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="waitlist-modal-title"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-200">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
              <Bell className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div>
              <h2
                id="waitlist-modal-title"
                className="text-xs font-mono uppercase tracking-widest font-bold"
              >
                RESTOCK NOTIFICATION
              </h2>
              <p className="text-[10px] font-mono text-neutral-400">
                Get notified when this item is back in stock
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {submitted ? (
            /* Success State */
            <div className="py-6 text-center space-y-5 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-[11px] font-mono font-bold uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>RESTOCK ALERT CONFIRMED</span>
                </div>
                <h3 className="text-lg font-mono font-black uppercase text-neutral-900">
                  YOU&apos;RE ON THE LIST
                </h3>
                <p className="text-xs text-neutral-600 max-w-sm mx-auto leading-relaxed">
                  We have registered your interest for{" "}
                  <strong className="text-black font-bold">
                    {product.name} ({selectedSize})
                  </strong>
                  . Our team will notify you via WhatsApp or SMS
                  the moment fresh stock arrives.
                </p>
              </div>

              {/* Direct WhatsApp Quick Connect */}
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-neutral-500">
                    WANT AN INSTANT RESTOCK ETA?
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">
                    LIVE SUPPORT
                  </span>
                </div>
                <a
                  href={`https://wa.me/94704901027?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-lg flex items-center justify-center gap-2 font-mono text-xs font-bold uppercase transition-all shadow-xs cursor-pointer"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>CHAT ON WHATSAPP (+94 70 490 1027)</span>
                </a>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 bg-black text-white hover:bg-neutral-800 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                RETURN TO CATALOG
              </button>
            </div>
          ) : (
            /* Submission Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Product Card Preview */}
              <div className="flex items-center gap-3.5 p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
                <div className="w-14 h-18 bg-neutral-200 rounded-lg overflow-hidden shrink-0 border border-neutral-200/80">
                  <img
                    src={getMediaUrl(productImage)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 text-red-700 font-mono text-[9px] font-bold uppercase mb-1">
                    <span>CURRENTLY SOLD OUT</span>
                  </div>
                  <h4 className="text-xs font-bold uppercase text-neutral-900 truncate font-mono">
                    {product.name}
                  </h4>
                  {formattedPrice && (
                    <p className="text-[11px] font-mono text-neutral-500">
                      {formattedPrice}
                    </p>
                  )}
                </div>
              </div>

              {/* Size Selector */}
              {product.availableSizes && product.availableSizes.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-700">
                    SELECT SIZE TO BE NOTIFIED FOR *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.availableSizes.map((s) => {
                      const isSelected = selectedSize === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSelectedSize(s)}
                          className={`h-9 px-3.5 rounded-lg font-mono text-xs font-bold uppercase border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-black text-white border-black shadow-xs scale-102"
                              : "bg-white text-neutral-800 border-neutral-200 hover:border-black"
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Contact Information Fields */}
              <div className="space-y-3.5">
                <div>
                  <label
                    htmlFor="waitlist-name"
                    className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-700 mb-1"
                  >
                    FULL NAME *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="waitlist-name"
                      type="text"
                      required
                      placeholder="e.g. Kasun Perera"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={100}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-xs font-medium text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="waitlist-phone"
                    className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-700 mb-1"
                  >
                    WHATSAPP / MOBILE NUMBER *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="waitlist-phone"
                      type="tel"
                      required
                      placeholder="077 123 4567 or +94 77 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      maxLength={20}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-xs font-medium text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black font-mono"
                    />
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500 mt-0.5 block">
                    We will send a single WhatsApp or SMS dispatch notification.
                  </span>
                </div>

                <div>
                  <label
                    htmlFor="waitlist-email"
                    className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-700 mb-1"
                  >
                    EMAIL ADDRESS{" "}
                    <span className="text-neutral-400 text-[10px] font-normal">
                      (OPTIONAL)
                    </span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="waitlist-email"
                      type="email"
                      placeholder="kasun@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      maxLength={120}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-xs font-medium text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                </div>
              </div>

              {/* Honeypot field for anti-bot defense */}
              <div
                style={{
                  display: "none",
                  opacity: 0,
                  position: "absolute",
                  left: "-9999px",
                }}
                aria-hidden="true"
              >
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={hpWebsiteUrl}
                  onChange={(e) => setHpWebsiteUrl(e.target.value)}
                />
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 btn-black-animated shadow-md"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>SUBMITTING REQUEST...</span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-3.5 h-3.5 text-amber-400" />
                      <span>NOTIFY ME WHEN BACK IN STOCK</span>
                    </>
                  )}
                </button>

                <p className="text-[10px] font-mono text-neutral-400 text-center flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>
                    Zero spam guaranteed. Single-use stock alert only.
                  </span>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
