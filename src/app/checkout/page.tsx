"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCartStore } from "@/lib/store/useCartStore";
import { createOrder, fetchCheckoutConfig, validatePromoCode } from "@/lib/api";
import { validateSafePlainText, validateSafeTextInput, validateSriLankanMobile } from "@/lib/sanitizer";
import { PaymentMethod, CheckoutConfig, City, PromoValidationResult } from "@/types";
import OrderSuccessCelebration from "@/components/OrderSuccessCelebration";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Banknote,
  Building2,
  Trash2,
  ChevronRight,
  Lock,
  Package,
  Search,
  Tag,
  X,
  Sparkles,
  Check,
  Copy,
  Phone,
  Mail,
  MapPin,
  HelpCircle,
  CreditCard,
  Zap,
  RotateCcw,
  MessageCircle,
  Calendar,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, removeItem, updateQuantity, clearCart } = useCartStore();
  const { customer, isAuthenticated } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dynamic configuration fetched from backend
  const [checkoutConfig, setCheckoutConfig] = useState<CheckoutConfig | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    streetAddress: "",
    city: "",
    postalCode: "",
    notes: "",
    paymentMethod: PaymentMethod.CashOnDelivery,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [couponCode, setCouponCode] = useState("");
  const [validatedPromo, setValidatedPromo] = useState<PromoValidationResult | null>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);
  const [copiedBankAcc, setCopiedBankAcc] = useState(false);

  // Completed order state for animated celebration modal
  const [completedOrder, setCompletedOrder] = useState<{
    orderId: string;
    orderNumber?: string;
    customerName: string;
    totalAmount: number;
    paymentMethod: string;
    itemCount: number;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
    async function loadConfig() {
      try {
        const config = await fetchCheckoutConfig();
        setCheckoutConfig(config);
      } catch (err) {
        console.warn("Failed to load backend checkout config:", err);
      }
    }
    loadConfig();
  }, []);

  // Autofill customer profile data if available
  useEffect(() => {
    if (customer) {
      const parts = (customer.fullName || "").trim().split(" ");
      const first = parts[0] || "";
      const last = parts.slice(1).join(" ") || "";
      setFormData((prev) => ({
        ...prev,
        firstName: prev.firstName || first,
        lastName: prev.lastName || last,
        email: prev.email || customer.email || "",
        phone: prev.phone || customer.phoneNumber || "",
        streetAddress: prev.streetAddress || customer.addressLine1 || "",
        city: prev.city || customer.city || "",
        postalCode: prev.postalCode || customer.postalCode || "",
      }));
    }
  }, [customer]);

  const currentSubtotal = mounted ? subtotal() : 0;
  const baseDeliveryFee = checkoutConfig?.standardDeliveryFee ?? 330;
  const freeThreshold = checkoutConfig?.freeDeliveryThreshold ?? 15000;
  const isFreeDelivery = freeThreshold && currentSubtotal >= freeThreshold;

  // Selected city delivery fee override
  const selectedCityObj = useMemo(() => {
    return (checkoutConfig?.cities || []).find(
      (c) => c.name.toLowerCase() === formData.city.trim().toLowerCase()
    );
  }, [checkoutConfig, formData.city]);

  const isColomboCity = useMemo(() => {
    if (!formData.city) return false;
    const nameLower = formData.city.toLowerCase();
    const districtLower = selectedCityObj?.district?.toLowerCase();
    return nameLower.includes("colombo") || districtLower === "colombo";
  }, [formData.city, selectedCityObj]);

  const dynamicEstimatedDelivery = useMemo(() => {
    if (selectedCityObj?.estimatedDeliveryDays) {
      return selectedCityObj.estimatedDeliveryDays;
    }
    if (isColomboCity) {
      return checkoutConfig?.colomboEstimatedDeliveryDays || "Within 24 Hours";
    }
    if (formData.city.trim()) {
      return checkoutConfig?.outstationEstimatedDeliveryDays || "2-3 Working Days";
    }
    return (
      checkoutConfig?.estimatedDeliveryDays ||
      "Within 24 Hours (Colombo) / 2-3 Working Days (Island-Wide)"
    );
  }, [selectedCityObj, isColomboCity, formData.city, checkoutConfig]);

  const calculatedArrivalDate = useMemo(() => {
    const today = new Date();
    let minDays = 1;
    let maxDays = 2;
    const estLower = dynamicEstimatedDelivery.toLowerCase();
    if (estLower.includes("24 hour") || isColomboCity) {
      minDays = 1;
      maxDays = 1;
    } else if (estLower.includes("2") && estLower.includes("3")) {
      minDays = 2;
      maxDays = 3;
    } else if (estLower.includes("3") && estLower.includes("5")) {
      minDays = 3;
      maxDays = 5;
    } else if (estLower.includes("2 day") || estLower.includes("2 days")) {
      minDays = 2;
      maxDays = 2;
    }

    const minDate = new Date(today);
    minDate.setDate(today.getDate() + minDays);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + maxDays);

    const formatOpt: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" };
    if (minDays === maxDays) {
      return minDate.toLocaleDateString("en-US", formatOpt);
    }
    return `${minDate.toLocaleDateString("en-US", formatOpt)} – ${maxDate.toLocaleDateString("en-US", formatOpt)}`;
  }, [dynamicEstimatedDelivery, isColomboCity]);

  const activeDeliveryFee = selectedCityObj?.deliveryFee ?? baseDeliveryFee;
  const deliveryFee = items.length > 0 ? (isFreeDelivery ? 0 : activeDeliveryFee) : 0;

  // Recalculate promo discount if subtotal or items change
  const totalItemCount = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  const discountAmount = useMemo(() => {
    if (!validatedPromo || !validatedPromo.isValid) return 0;
    if (validatedPromo.minItemQuantity > 0 && totalItemCount < validatedPromo.minItemQuantity) {
      return 0;
    }
    if (validatedPromo.discountType === "FixedAmount") {
      return Math.min(validatedPromo.discountValue, currentSubtotal);
    }
    return Math.round(currentSubtotal * (validatedPromo.discountValue / 100));
  }, [validatedPromo, currentSubtotal, totalItemCount]);

  const totalAmount = Math.max(0, currentSubtotal + deliveryFee - discountAmount);

  // Auto check minimum item threshold if cart items change
  useEffect(() => {
    if (validatedPromo && validatedPromo.minItemQuantity > 1 && totalItemCount < validatedPromo.minItemQuantity) {
      const min = validatedPromo.minItemQuantity;
      const code = validatedPromo.code;
      setValidatedPromo(null);
      setPromoError(`Promo "${code}" requires at least ${min} items in your bag. Discount removed.`);
      setPromoSuccess(null);
    }
  }, [totalItemCount, validatedPromo]);

  // City selection helper
  const availableCities = useMemo(() => {
    return checkoutConfig?.cities || [];
  }, [checkoutConfig]);

  const handleCitySelect = (cityName: string) => {
    const matchedCity = availableCities.find(
      (c) => c.name.toLowerCase() === cityName.toLowerCase()
    );

    setFormData((prev) => ({
      ...prev,
      city: cityName,
      postalCode: matchedCity ? matchedCity.postalCode : prev.postalCode,
    }));

    if (formErrors.city) {
      setFormErrors((prev) => {
        const updated = { ...prev };
        delete updated.city;
        return updated;
      });
    }
    if (matchedCity && formErrors.postalCode) {
      setFormErrors((prev) => {
        const updated = { ...prev };
        delete updated.postalCode;
        return updated;
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";

    if (!formData.email.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    // Strict 9-Digit Sri Lankan Mobile Phone Validation
    const phoneCheck = validateSriLankanMobile(formData.phone);
    if (!phoneCheck.isValid) {
      errors.phone = phoneCheck.error || "Please enter a valid 9-digit mobile number starting with 7.";
    }

    if (!formData.streetAddress.trim()) errors.streetAddress = "Delivery address is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.postalCode.trim()) errors.postalCode = "Postal code is required";

    // Anti-XSS and Anti-SQL Injection validation across all text fields
    const nameCheck =
      validateSafePlainText(formData.firstName, "First name") ||
      validateSafePlainText(formData.lastName, "Last name");
    if (nameCheck) errors.firstName = nameCheck;

    const emailCheck = validateSafePlainText(formData.email, "Email");
    if (emailCheck) errors.email = emailCheck;

    const addrCheck = validateSafePlainText(formData.streetAddress, "Street address");
    if (addrCheck) errors.streetAddress = addrCheck;

    const cityCheck = validateSafePlainText(formData.city, "City");
    if (cityCheck) errors.city = cityCheck;

    const postalCheck = validateSafePlainText(formData.postalCode, "Postal code");
    if (postalCheck) errors.postalCode = postalCheck;

    if (formData.notes) {
      const notesCheck = validateSafeTextInput(formData.notes, "Order notes");
      if (notesCheck) errors.notes = notesCheck;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (items.length === 0) {
      setErrorMessage("Your shopping bag is empty. Please add items before checking out.");
      return;
    }

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);

    try {
      // Map cart items into request structure
      const orderItems = items.map((item) => ({
        productVariantId: item.variantId,
        quantity: item.quantity,
      }));

      const phoneValidation = validateSriLankanMobile(formData.phone);

      const response = await createOrder({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: phoneValidation.normalized || formData.phone.trim(),
        streetAddress: formData.streetAddress.trim(),
        city: formData.city.trim(),
        postalCode: formData.postalCode.trim(),
        paymentMethod: formData.paymentMethod,
        notes: formData.notes.trim() || undefined,
        items: orderItems,
        promoCode: validatedPromo?.code || undefined,
      });

      // Clear the cart on successful placement
      clearCart();

      // Trigger rich animated celebration screen
      setCompletedOrder({
        orderId: response.orderId,
        orderNumber: response.orderNumber,
        customerName: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
        totalAmount: totalAmount,
        paymentMethod: formData.paymentMethod,
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to place order. Please try again.";
      setErrorMessage(msg);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = couponCode.trim().toUpperCase();
    if (!cleanCode) return;

    setValidatingPromo(true);
    setPromoError(null);
    setPromoSuccess(null);

    try {
      const orderItems = items.map((i) => ({
        productVariantId: i.variantId,
        quantity: i.quantity,
      }));

      const res = await validatePromoCode(
        cleanCode,
        orderItems,
        formData.phone.trim() || undefined,
        formData.email.trim().toLowerCase() || undefined
      );

      if (res.isValid) {
        setValidatedPromo(res);
        setPromoSuccess(res.message || `Promo code "${res.code}" applied successfully!`);
        setPromoError(null);
      } else {
        setValidatedPromo(null);
        setPromoError(res.errorMessage || `Promo code "${cleanCode}" is not valid.`);
        setPromoSuccess(null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to validate promo code.";
      setPromoError(msg);
      setValidatedPromo(null);
      setPromoSuccess(null);
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setValidatedPromo(null);
    setCouponCode("");
    setPromoSuccess(null);
    setPromoError(null);
  };

  const handleCopyBankDetails = (accountNum: string) => {
    navigator.clipboard.writeText(accountNum);
    setCopiedBankAcc(true);
    setTimeout(() => setCopiedBankAcc(false), 2000);
  };

  const bankDetails = checkoutConfig?.bankDetails || {
    bankName: "Commercial Bank of Ceylon",
    accountName: "CALVIZ APPAREL (PVT) LTD",
    accountNumber: "8010045231",
    branch: "Colombo Main Branch",
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-36 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#09090b] flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-36 md:pt-44 pb-20">
        {/* Breadcrumb & Trust Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400">
            <Link href="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-neutral-500">Shopping Bag</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-black font-bold">Secure Checkout</span>
          </div>

          <div className="inline-flex items-center gap-3 px-3.5 py-1.5 bg-neutral-900 text-white rounded-full text-[11px] font-mono shadow-xs self-start sm:self-auto">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Lock className="w-3.5 h-3.5" />
              256-Bit SSL Encrypted
            </span>
            <span className="text-neutral-600">|</span>
            <span className="text-neutral-300">
              ⚡ SLA: <strong className="text-white">{dynamicEstimatedDelivery}</strong>
            </span>
          </div>
        </div>

        {/* Global Error Alert */}
        {errorMessage && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 rounded-xl animate-fade-in shadow-xs">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
            <div className="text-xs space-y-0.5">
              <p className="font-bold uppercase tracking-wider text-rose-900">Checkout Notice</p>
              <p className="font-sans leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="bg-white border border-neutral-200 p-12 text-center max-w-md mx-auto my-12 rounded-2xl shadow-sm">
            <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto mb-4 stroke-[1.5]" />
            <h2 className="text-lg font-bold uppercase tracking-wide mb-2 font-mono">Your Bag is Empty</h2>
            <p className="text-xs text-neutral-500 mb-6 font-mono">
              You haven&apos;t added any items to your bag yet. Explore our latest heavyweight editions.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all rounded-xl shadow-md w-full font-mono"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Form Details (8 Columns) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              <form onSubmit={handleSubmit} id="checkout-form" className="space-y-6">

                {/* 1. Contact & Customer Details Card */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-black text-white text-xs font-mono font-bold flex items-center justify-center">
                        1
                      </span>
                      <div>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-950 font-mono">
                          Customer Information
                        </h2>
                        <p className="text-[11px] text-neutral-500 font-mono">
                          Enter your contact info for order updates and tracking.
                        </p>
                      </div>
                    </div>

                    {isAuthenticated && customer && (
                      <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-mono font-semibold">
                        <Check className="w-3 h-3 text-emerald-600" />
                        Logged in as {customer.fullName?.split(" ")[0]}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-700 font-semibold mb-1.5">
                        First Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="e.g. Dinuwan"
                        className={`w-full px-3.5 py-2.5 bg-neutral-50 border text-xs text-neutral-900 rounded-lg focus:bg-white focus:outline-hidden transition-all ${formErrors.firstName ? "border-rose-500 ring-1 ring-rose-500" : "border-neutral-300 focus:border-black"
                          }`}
                      />
                      {formErrors.firstName && (
                        <p className="text-[10px] font-mono text-rose-500 mt-1">{formErrors.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-700 font-semibold mb-1.5">
                        Last Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="e.g. Kalubowila"
                        className={`w-full px-3.5 py-2.5 bg-neutral-50 border text-xs text-neutral-900 rounded-lg focus:bg-white focus:outline-hidden transition-all ${formErrors.lastName ? "border-rose-500 ring-1 ring-rose-500" : "border-neutral-300 focus:border-black"
                          }`}
                      />
                      {formErrors.lastName && (
                        <p className="text-[10px] font-mono text-rose-500 mt-1">{formErrors.lastName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-700 font-semibold mb-1.5">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="client@example.com"
                          className={`w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 border text-xs text-neutral-900 rounded-lg focus:bg-white focus:outline-hidden transition-all ${formErrors.email ? "border-rose-500 ring-1 ring-rose-500" : "border-neutral-300 focus:border-black"
                            }`}
                        />
                      </div>
                      <p className="text-[10px] font-mono text-neutral-400 mt-1">Official invoice &amp; tracking dispatched here.</p>
                      {formErrors.email && (
                        <p className="text-[10px] font-mono text-rose-500 mt-1">{formErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-700 font-semibold mb-1.5">
                        Mobile Phone (WhatsApp Active) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="077 123 4567"
                          className={`w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 border text-xs text-neutral-900 rounded-lg focus:bg-white focus:outline-hidden font-mono transition-all ${formErrors.phone ? "border-rose-500 ring-1 ring-rose-500" : "border-neutral-300 focus:border-black"
                            }`}
                        />
                      </div>
                      <p className="text-[10px] font-mono text-neutral-400 mt-1">Courier rider will call before doorstep arrival.</p>
                      {formErrors.phone && (
                        <p className="text-[10px] font-mono text-rose-500 mt-1">{formErrors.phone}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Delivery Destination Card */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-black text-white text-xs font-mono font-bold flex items-center justify-center">
                        2
                      </span>
                      <div>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-950 font-mono">
                          Delivery Destination (Sri Lanka)
                        </h2>
                        <p className="text-[11px] text-neutral-500 font-mono">
                          Direct express doorstep courier fulfillment across all 25 districts.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-700 font-semibold mb-1.5">
                        Street Address &amp; Apartment / Unit <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          name="streetAddress"
                          value={formData.streetAddress}
                          onChange={handleInputChange}
                          placeholder="e.g. No. 42, Galle Road, Apt 3B"
                          className={`w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 border text-xs text-neutral-900 rounded-lg focus:bg-white focus:outline-hidden transition-all ${formErrors.streetAddress ? "border-rose-500 ring-1 ring-rose-500" : "border-neutral-300 focus:border-black"
                            }`}
                        />
                      </div>
                      {formErrors.streetAddress && (
                        <p className="text-[10px] font-mono text-rose-500 mt-1">{formErrors.streetAddress}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-700 font-semibold mb-1.5">
                          City / District <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="city"
                            list="sri-lanka-cities"
                            value={formData.city}
                            onChange={(e) => handleCitySelect(e.target.value)}
                            placeholder="Type or select city (e.g. Colombo 03, Kandy)..."
                            className={`w-full px-3.5 py-2.5 bg-neutral-50 border text-xs text-neutral-900 rounded-lg focus:bg-white focus:outline-hidden transition-all ${formErrors.city ? "border-rose-500 ring-1 ring-rose-500" : "border-neutral-300 focus:border-black"
                              }`}
                          />
                          <datalist id="sri-lanka-cities">
                            {availableCities.map((c) => (
                              <option key={`${c.name}-${c.postalCode}`} value={c.name}>
                                {c.district} ({c.postalCode})
                              </option>
                            ))}
                          </datalist>
                        </div>
                        {formErrors.city && (
                          <p className="text-[10px] font-mono text-rose-500 mt-1">{formErrors.city}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-700 font-semibold mb-1.5">
                          Postal Code <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          placeholder="e.g. 00300"
                          className={`w-full px-3.5 py-2.5 bg-neutral-50 border text-xs text-neutral-900 rounded-lg focus:bg-white focus:outline-hidden font-mono transition-all ${formErrors.postalCode ? "border-rose-500 ring-1 ring-rose-500" : "border-neutral-300 focus:border-black"
                            }`}
                        />
                        {formErrors.postalCode && (
                          <p className="text-[10px] font-mono text-rose-500 mt-1">{formErrors.postalCode}</p>
                        )}
                      </div>
                    </div>

                    {/* Live Destination Delivery Feedback Badge */}
                    {formData.city.trim() && (
                      <div className="p-4 bg-neutral-950 border-2 border-emerald-500/40 text-white rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono shadow-md animate-fade-in relative overflow-hidden">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
                            <Truck className="w-5 h-5 animate-pulse" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                                {isColomboCity ? "⚡ Colombo 24H Express" : "🚚 Island-Wide Priority Courier"}
                              </span>
                            </div>
                            <span className="font-bold text-white text-xs block mt-0.5">
                              {formData.city}: <span className="text-emerald-300 font-semibold">{dynamicEstimatedDelivery}</span>
                            </span>
                            <span className="text-[10px] text-neutral-400 block mt-0.5">
                              Estimated Arrival: <strong className="text-emerald-300">{calculatedArrivalDate}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="sm:text-right flex items-center justify-between sm:block">
                          <span className="text-[11px] bg-neutral-800/90 px-3 py-1.5 rounded-lg text-emerald-400 font-bold border border-emerald-500/30">
                            {isFreeDelivery ? "FREE DELIVERY" : `LKR ${activeDeliveryFee.toLocaleString()}`}
                          </span>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-700 font-semibold mb-1.5">
                        Special Delivery Instructions (Optional)
                      </label>
                      <textarea
                        name="notes"
                        rows={2}
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="e.g. Leave at reception / security gate or ring bell."
                        className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs text-neutral-900 rounded-lg focus:bg-white focus:border-black focus:outline-hidden transition-all resize-none font-sans"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Payment Method Card */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-black text-white text-xs font-mono font-bold flex items-center justify-center">
                        3
                      </span>
                      <div>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-950 font-mono">
                          Payment Selection
                        </h2>
                        <p className="text-[11px] text-neutral-500 font-mono">
                          Choose how you prefer to settle your order.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Option 1: Cash on Delivery */}
                    <label
                      className={`block p-4 sm:p-5 border rounded-xl transition-all cursor-pointer relative overflow-hidden ${formData.paymentMethod === PaymentMethod.CashOnDelivery
                        ? "border-black bg-neutral-950 text-white shadow-md ring-1 ring-black"
                        : "border-neutral-200 hover:border-neutral-300 bg-white text-neutral-900"
                        }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <input
                          type="radio"
                          name="paymentMethodRadio"
                          checked={formData.paymentMethod === PaymentMethod.CashOnDelivery}
                          onChange={() =>
                            setFormData((prev) => ({ ...prev, paymentMethod: PaymentMethod.CashOnDelivery }))
                          }
                          className="mt-1 accent-white w-4 h-4 cursor-pointer"
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Banknote className={`w-4 h-4 ${formData.paymentMethod === PaymentMethod.CashOnDelivery ? "text-emerald-400" : "text-neutral-900"}`} />
                              <span className="text-xs font-bold uppercase tracking-wider font-mono">
                                Cash on Delivery (COD)
                              </span>
                            </div>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 uppercase font-bold border border-amber-500/30">
                              POPULAR
                            </span>
                          </div>
                          <p className={`text-[11px] font-mono ${formData.paymentMethod === PaymentMethod.CashOnDelivery ? "text-neutral-300" : "text-neutral-500"}`}>
                            Pay cash at your doorstep when courier arrives.
                          </p>
                        </div>
                      </div>
                    </label>

                    {/* Option 2: Bank Transfer / Online CDM */}
                    <label
                      className={`block p-4 sm:p-5 border rounded-xl transition-all cursor-pointer relative overflow-hidden ${formData.paymentMethod === PaymentMethod.BankTransfer
                        ? "border-black bg-neutral-950 text-white shadow-md ring-1 ring-black"
                        : "border-neutral-200 hover:border-neutral-300 bg-white text-neutral-900"
                        }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <input
                          type="radio"
                          name="paymentMethodRadio"
                          checked={formData.paymentMethod === PaymentMethod.BankTransfer}
                          onChange={() =>
                            setFormData((prev) => ({ ...prev, paymentMethod: PaymentMethod.BankTransfer }))
                          }
                          className="mt-1 accent-white w-4 h-4 cursor-pointer"
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Building2 className={`w-4 h-4 ${formData.paymentMethod === PaymentMethod.BankTransfer ? "text-indigo-400" : "text-neutral-900"}`} />
                              <span className="text-xs font-bold uppercase tracking-wider font-mono">
                                Bank Transfer / CDM
                              </span>
                            </div>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 uppercase font-bold border border-indigo-500/30">
                              DIRECT
                            </span>
                          </div>
                          <p className={`text-[11px] font-mono ${formData.paymentMethod === PaymentMethod.BankTransfer ? "text-neutral-300" : "text-neutral-500"}`}>
                            Direct Commercial Bank transfer or online CDM slip upload.
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Bank Details Display Card (When Bank Transfer is active) */}
                  {formData.paymentMethod === PaymentMethod.BankTransfer && (
                    <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3 font-mono text-xs animate-fade-in">
                      <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-black" />
                          <span className="font-bold text-neutral-950 uppercase">{bankDetails.bankName}</span>
                        </div>
                        <span className="text-[10px] text-neutral-500 uppercase">Corporate Account</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <span className="text-[10px] text-neutral-500 uppercase block">Account Name</span>
                          <span className="font-bold text-neutral-900">{bankDetails.accountName}</span>
                        </div>

                        <div>
                          <span className="text-[10px] text-neutral-500 uppercase block">Account Number</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-black text-sm text-black tracking-wider">{bankDetails.accountNumber}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyBankDetails(bankDetails.accountNumber)}
                              className="p-1 hover:bg-neutral-200 rounded text-neutral-600 transition-colors cursor-pointer"
                              title="Copy Account Number"
                            >
                              {copiedBankAcc ? (
                                <span className="inline-flex items-center text-[10px] text-emerald-600 font-bold gap-0.5">
                                  <Check className="w-3 h-3" /> Copied
                                </span>
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      <p className="text-[10px] text-neutral-500 pt-2 border-t border-neutral-200 leading-relaxed">
                        💡 You can easily upload your payment slip on the order confirmation screen right after placing your order or send it to our WhatsApp.
                      </p>
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Right Column: Order Summary & Review (4 Columns) */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-6 sticky top-28">
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-950 font-mono flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    <span>Order Summary ({totalItemCount})</span>
                  </h3>
                  <Link
                    href="/products"
                    className="text-[11px] font-mono text-neutral-500 hover:text-black uppercase underline"
                  >
                    Edit Bag
                  </Link>
                </div>

                {/* Highlighted Estimated Delivery & Expected Arrival Badge */}
                <div className="p-3.5 bg-neutral-950 border-2 border-emerald-500/40 rounded-xl space-y-2 text-white font-mono shadow-md relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-emerald-400 animate-pulse" />
                      Estimated Delivery
                    </span>
                    <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold rounded-full">
                      {dynamicEstimatedDelivery}
                    </span>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-neutral-800 text-xs">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      Expected Arrival
                    </span>
                    <span className="text-xs font-bold text-emerald-300 tracking-wide">
                      {calculatedArrivalDate}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="divide-y divide-neutral-100 max-h-64 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.variantId} className="py-3.5 first:pt-0 flex gap-3 items-center">
                      <div className="w-14 h-18 bg-neutral-100 rounded-lg flex-shrink-0 flex items-center justify-center font-mono text-[9px] text-neutral-400 border border-neutral-200 overflow-hidden relative">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="w-full h-full object-cover object-top"
                          />
                        ) : (
                          <span>CALVIZ</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-neutral-900 uppercase truncate">
                          {item.productName}
                        </h4>
                        <p className="text-[10px] font-mono text-neutral-500 mt-0.5">
                          SIZE: <span className="font-bold text-black">{item.size}</span>
                          {item.color ? ` • ${item.color}` : ""}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          {/* Quantity control */}
                          <div className="flex items-center border border-neutral-200 rounded-md overflow-hidden">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                              className="px-2 py-0.5 text-xs text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                            >
                              -
                            </button>
                            <span className="px-2 text-xs font-mono font-bold text-neutral-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                              className="px-2 py-0.5 text-xs text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                            >
                              +
                            </button>
                          </div>

                          <span className="text-xs font-bold text-neutral-950 font-mono">
                            LKR {(item.unitPrice * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promo Code Input & Condition Feedback */}
                <div className="pt-4 border-t border-neutral-100 space-y-2">
                  {!validatedPromo ? (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value);
                            setPromoError(null);
                          }}
                          placeholder="Promo code..."
                          className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 text-xs uppercase font-mono tracking-wider rounded-lg focus:bg-white focus:border-black focus:outline-hidden"
                          disabled={validatingPromo}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={validatingPromo || !couponCode.trim()}
                        className="px-4 py-2 bg-neutral-900 text-white text-xs font-mono uppercase font-bold tracking-wider hover:bg-black rounded-lg transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                      >
                        {validatingPromo ? (
                          <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                          <span>Apply</span>
                        )}
                      </button>
                    </form>
                  ) : (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-200/60 px-2 py-0.5 rounded tracking-wider">
                            {validatedPromo.code}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-700 font-bold">
                            {validatedPromo.discountType === "FixedAmount"
                              ? `LKR ${validatedPromo.discountValue.toLocaleString()} OFF`
                              : `${validatedPromo.discountValue}% OFF`}
                          </span>
                        </div>
                        {validatedPromo.title && (
                          <p className="text-[11px] text-emerald-800 font-medium leading-tight">
                            {validatedPromo.title}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleRemovePromo}
                        className="text-neutral-400 hover:text-neutral-900 p-1 rounded transition-colors cursor-pointer"
                        title="Remove promo code"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Promo Error Message */}
                  {promoError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-rose-800 text-[11px] font-mono">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <p>{promoError}</p>
                    </div>
                  )}

                  {/* Promo Success Message */}
                  {promoSuccess && !promoError && (
                    <p className="text-[10px] text-emerald-700 font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {promoSuccess}
                    </p>
                  )}
                </div>

                {/* Financial Totals Breakdown */}
                <div className="border-t border-neutral-100 pt-4 space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-neutral-900">
                      LKR {currentSubtotal.toLocaleString()}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span className="flex items-center gap-1 font-medium">
                        <Sparkles className="w-3.5 h-3.5" />
                        Privilege Discount
                      </span>
                      <span className="font-bold">
                        - LKR {discountAmount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-neutral-600">
                    <span className="flex items-center gap-1.5">
                      Island-wide Courier
                      {isFreeDelivery && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                          FREE
                        </span>
                      )}
                    </span>
                    <span className="font-medium text-neutral-900">
                      {isFreeDelivery ? "FREE" : `LKR ${deliveryFee.toLocaleString()}`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs py-2 px-3 bg-emerald-50/60 border border-emerald-200/80 rounded-lg">
                    <span className="text-emerald-900 flex items-center gap-1.5 text-[11px] font-semibold">
                      <Truck className="w-3.5 h-3.5 text-emerald-700" />
                      Estimated Delivery
                    </span>
                    <span className="font-bold text-emerald-800 text-right text-[11px]">
                      {dynamicEstimatedDelivery} ({calculatedArrivalDate})
                    </span>
                  </div>

                  <div className="border-t border-neutral-200 pt-3 flex justify-between items-baseline">
                    <span className="text-sm font-bold uppercase tracking-wider text-neutral-950">
                      Total Due
                    </span>
                    <span className="text-xl font-black text-neutral-950">
                      LKR {totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 text-right">
                    Includes all island-wide logistics &amp; packaging
                  </p>
                </div>

                {/* Primary Complete Order CTA Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    form="checkout-form"
                    disabled={submitting || items.length === 0}
                    className="w-full py-4 bg-black text-white hover:bg-neutral-800 active:scale-98 font-mono text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-xl flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>PROCESSING ORDER...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                        <span>PLACE ORDER • LKR {totalAmount.toLocaleString()}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Trust & Guarantee Pills */}
                <div className="pt-4 border-t border-neutral-100 grid grid-cols-2 gap-2 text-[10px] font-mono text-neutral-600">
                  <div className="flex items-center gap-1.5 p-2 bg-neutral-50 rounded-lg">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>256-Bit SSL Security</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 bg-neutral-50 rounded-lg">
                    <RotateCcw className="w-3.5 h-3.5 text-neutral-800 shrink-0" />
                    <span>7-Day Size Exchange</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 bg-neutral-50 rounded-lg">
                    <Truck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Doorstep Dispatch</span>
                  </div>
                  <a
                    href="https://wa.me/94704901027"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 p-2 bg-neutral-50 hover:bg-emerald-50 rounded-lg transition-colors text-neutral-800"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Animated Order Success Celebration Modal */}
      {completedOrder && (
        <OrderSuccessCelebration
          orderId={completedOrder.orderId}
          orderNumber={completedOrder.orderNumber}
          customerName={completedOrder.customerName}
          totalAmount={completedOrder.totalAmount}
          paymentMethod={completedOrder.paymentMethod}
          itemCount={completedOrder.itemCount}
          onClose={() => setCompletedOrder(null)}
        />
      )}
    </div>
  );
}
