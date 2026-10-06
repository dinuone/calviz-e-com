"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCartStore } from "@/lib/store/useCartStore";
import { createOrder, fetchCheckoutConfig, validatePromoCode } from "@/lib/api";
import { validateSafePlainText } from "@/lib/sanitizer";
import { PaymentMethod, CheckoutConfig, City, PromoValidationResult } from "@/types";
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
  const freeThreshold = checkoutConfig?.freeDeliveryThreshold;
  const isFreeDelivery = freeThreshold && currentSubtotal >= freeThreshold;

  // Selected city delivery fee override
  const selectedCityObj = useMemo(() => {
    return (checkoutConfig?.cities || []).find(
      (c) => c.name.toLowerCase() === formData.city.trim().toLowerCase()
    );
  }, [checkoutConfig, formData.city]);

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

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (formData.phone.trim().length < 9) {
      errors.phone = "Please enter a valid contact number (e.g. 077 123 4567)";
    }

    if (!formData.streetAddress.trim()) errors.streetAddress = "Delivery address is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.postalCode.trim()) errors.postalCode = "Postal code is required";

    // Anti-XSS / Malicious script injection validation
    const nameCheck = validateSafePlainText(formData.firstName, "First name") || validateSafePlainText(formData.lastName, "Last name");
    if (nameCheck) errors.firstName = nameCheck;

    const emailCheck = validateSafePlainText(formData.email, "Email");
    if (emailCheck) errors.email = emailCheck;

    const addrCheck = validateSafePlainText(formData.streetAddress, "Street address");
    if (addrCheck) errors.streetAddress = addrCheck;

    const cityCheck = validateSafePlainText(formData.city, "City");
    if (cityCheck) errors.city = cityCheck;

    if (formData.notes) {
      const notesCheck = validateSafePlainText(formData.notes, "Order notes");
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

      const response = await createOrder({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
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

      // Redirect to confirmation / tracking page
      router.push(`/orders/${response.orderId}`);
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
      setValidatedPromo(null);
      setPromoError(err instanceof Error ? err.message : "Failed to validate promo code.");
      setPromoSuccess(null);
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setValidatedPromo(null);
    setCouponCode("");
    setPromoError(null);
    setPromoSuccess(null);
  };

  const bank = checkoutConfig?.bankDetails || {
    bankName: "Commercial Bank of Ceylon",
    accountName: "CALVIZ APPAREL (PVT) LTD",
    accountNumber: "8010045231",
    branch: "Colombo Main Branch",
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-24 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#09090b] flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-36 md:pt-44 pb-20">
        {/* Breadcrumb navigation */}
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400 mb-8">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-neutral-500">Bag</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-black font-bold">Secure Checkout</span>
        </div>

        {/* Page Title */}
        <div className="border-b border-neutral-200 pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-neutral-900 text-white text-[10px] font-mono uppercase tracking-widest mb-2">
              <Lock className="w-3 h-3" />
              <span>256-Bit Encrypted Order</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-950">
              Checkout & Delivery
            </h1>
          </div>
          <div className="text-xs font-mono text-neutral-500 flex items-center gap-2">
            <Truck className="w-4 h-4 text-neutral-800" />
            <span>Island-Wide Delivery ({checkoutConfig?.estimatedDeliveryDays || "2–3 Working Days"})</span>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 rounded-none animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
            <div className="text-xs">
              <p className="font-bold uppercase tracking-wider">Unable to complete order</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="bg-white border border-neutral-200 p-12 text-center max-w-md mx-auto my-12 shadow-xs">
            <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto mb-4 stroke-[1.5]" />
            <h2 className="text-lg font-bold uppercase tracking-wide mb-2">Your Bag is Empty</h2>
            <p className="text-xs text-neutral-500 mb-6">
              You haven&apos;t added any items to your bag yet. Explore our latest heavyweight drops.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors w-full"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Form Details */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-8">
              <form onSubmit={handleSubmit} id="checkout-form" className="space-y-8">
                {/* 1. Contact & Customer Details */}
                <div className="bg-white border border-neutral-200 p-6 sm:p-8 shadow-xs">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-6">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-mono font-bold flex items-center justify-center">
                        1
                      </span>
                      <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                        Customer & Contact Information
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 mb-1.5">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="e.g. Liam"
                        className={`w-full px-3.5 py-2.5 bg-neutral-50 border text-xs text-neutral-900 focus:bg-white focus:outline-hidden transition-all ${formErrors.firstName ? "border-red-500 ring-1 ring-red-500" : "border-neutral-300 focus:border-black"
                          }`}
                      />
                      {formErrors.firstName && (
                        <p className="text-[10px] text-red-500 mt-1">{formErrors.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 mb-1.5">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="e.g. Silva"
                        className={`w-full px-3.5 py-2.5 bg-neutral-50 border text-xs text-neutral-900 focus:bg-white focus:outline-hidden transition-all ${formErrors.lastName ? "border-red-500 ring-1 ring-red-500" : "border-neutral-300 focus:border-black"
                          }`}
                      />
                      {formErrors.lastName && (
                        <p className="text-[10px] text-red-500 mt-1">{formErrors.lastName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="e.g. liam@example.com"
                        className={`w-full px-3.5 py-2.5 bg-neutral-50 border text-xs text-neutral-900 focus:bg-white focus:outline-hidden transition-all ${formErrors.email ? "border-red-500 ring-1 ring-red-500" : "border-neutral-300 focus:border-black"
                          }`}
                      />
                      <p className="text-[10px] text-neutral-400 mt-1">Invoice PDF & dispatch tracking will be sent here.</p>
                      {formErrors.email && (
                        <p className="text-[10px] text-red-500 mt-1">{formErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 mb-1.5">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="e.g. 077 123 4567"
                        className={`w-full px-3.5 py-2.5 bg-neutral-50 border text-xs text-neutral-900 focus:bg-white focus:outline-hidden transition-all ${formErrors.phone ? "border-red-500 ring-1 ring-red-500" : "border-neutral-300 focus:border-black"
                          }`}
                      />
                      <p className="text-[10px] text-neutral-400 mt-1">Courier will call this number before arrival.</p>
                      {formErrors.phone && (
                        <p className="text-[10px] text-red-500 mt-1">{formErrors.phone}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Shipping Address */}
                <div className="bg-white border border-neutral-200 p-6 sm:p-8 shadow-xs">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-6">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-mono font-bold flex items-center justify-center">
                        2
                      </span>
                      <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                        Delivery Destination (Sri Lanka)
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 mb-1.5">
                        Street Address & Apartment / Unit <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="streetAddress"
                        value={formData.streetAddress}
                        onChange={handleInputChange}
                        placeholder="e.g. No. 42, Galle Road, Apt 3B"
                        className={`w-full px-3.5 py-2.5 bg-neutral-50 border text-xs text-neutral-900 focus:bg-white focus:outline-hidden transition-all ${formErrors.streetAddress ? "border-red-500 ring-1 ring-red-500" : "border-neutral-300 focus:border-black"
                          }`}
                      />
                      {formErrors.streetAddress && (
                        <p className="text-[10px] text-red-500 mt-1">{formErrors.streetAddress}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 mb-1.5">
                          City / District <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="city"
                            list="sri-lanka-cities"
                            value={formData.city}
                            onChange={(e) => handleCitySelect(e.target.value)}
                            placeholder="Select or type city..."
                            className={`w-full px-3.5 py-2.5 bg-neutral-50 border text-xs text-neutral-900 focus:bg-white focus:outline-hidden transition-all ${formErrors.city ? "border-red-500 ring-1 ring-red-500" : "border-neutral-300 focus:border-black"
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
                          <p className="text-[10px] text-red-500 mt-1">{formErrors.city}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 mb-1.5">
                          Postal Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          placeholder="e.g. 00300"
                          className={`w-full px-3.5 py-2.5 bg-neutral-50 border text-xs text-neutral-900 focus:bg-white focus:outline-hidden transition-all ${formErrors.postalCode ? "border-red-500 ring-1 ring-red-500" : "border-neutral-300 focus:border-black"
                            }`}
                        />
                        {formErrors.postalCode && (
                          <p className="text-[10px] text-red-500 mt-1">{formErrors.postalCode}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 mb-1.5">
                        Special Delivery Notes (Optional)
                      </label>
                      <textarea
                        name="notes"
                        rows={2}
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="e.g. Please leave at guard room or call before delivering."
                        className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 text-xs text-neutral-900 focus:bg-white focus:border-black focus:outline-hidden transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Payment Method */}
                <div className="bg-white border border-neutral-200 p-6 sm:p-8 shadow-xs">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-6">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-mono font-bold flex items-center justify-center">
                        3
                      </span>
                      <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                        Payment Selection
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Option 1: Cash on Delivery */}
                    <label
                      className={`block p-4 border transition-all cursor-pointer ${formData.paymentMethod === PaymentMethod.CashOnDelivery
                        ? "border-black bg-neutral-50/80 ring-1 ring-black"
                        : "border-neutral-200 hover:border-neutral-300 bg-white"
                        }`}
                    >
                      <div className="flex items-start gap-4">
                        <input
                          type="radio"
                          name="paymentMethodRadio"
                          checked={formData.paymentMethod === PaymentMethod.CashOnDelivery}
                          onChange={() =>
                            setFormData((prev) => ({ ...prev, paymentMethod: PaymentMethod.CashOnDelivery }))
                          }
                          className="mt-1 accent-black w-4 h-4"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Banknote className="w-4 h-4 text-neutral-900" />
                              <span className="text-xs font-bold uppercase tracking-wider text-neutral-950">
                                Cash on Delivery (COD)
                              </span>
                            </div>
                            <span className="text-[10px] font-mono uppercase bg-neutral-200 text-neutral-800 px-2 py-0.5">
                              Recommended
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-500 mt-1">
                            Pay in cash to the delivery courier when your apparel arrives at your door.
                          </p>
                        </div>
                      </div>
                    </label>

                    {/* Option 2: Bank Transfer */}
                    <label
                      className={`block p-4 border transition-all cursor-pointer ${formData.paymentMethod === PaymentMethod.BankTransfer
                        ? "border-black bg-neutral-50/80 ring-1 ring-black"
                        : "border-neutral-200 hover:border-neutral-300 bg-white"
                        }`}
                    >
                      <div className="flex items-start gap-4">
                        <input
                          type="radio"
                          name="paymentMethodRadio"
                          checked={formData.paymentMethod === PaymentMethod.BankTransfer}
                          onChange={() =>
                            setFormData((prev) => ({ ...prev, paymentMethod: PaymentMethod.BankTransfer }))
                          }
                          className="mt-1 accent-black w-4 h-4"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              {bank.logoUrl ? (
                                <div className="w-5 h-5 rounded bg-white border border-neutral-200 p-0.5 flex items-center justify-center flex-shrink-0">
                                  <img
                                    src={bank.logoUrl}
                                    alt={bank.bankName}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              ) : (
                                <Building2 className="w-4 h-4 text-neutral-900" />
                              )}
                              <span className="text-xs font-bold uppercase tracking-wider text-neutral-950">
                                Direct Bank Transfer / CDM
                              </span>
                            </div>
                            <span className="text-[10px] font-mono uppercase bg-neutral-100 text-neutral-600 px-2 py-0.5">
                              {bank.bankName}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-500 mt-1">
                            Transfer directly to our corporate bank account and upload your deposit slip or transaction receipt on the next step.
                          </p>

                          {formData.paymentMethod === PaymentMethod.BankTransfer && (
                            <div className="mt-3 p-3.5 bg-neutral-100/80 border border-neutral-200 text-[11px] text-neutral-700 space-y-1.5 font-mono">
                              <div className="flex items-center gap-2 pb-1.5 border-b border-neutral-200">
                                {bank.logoUrl && (
                                  <div className="w-7 h-7 bg-white p-1 border border-neutral-200 rounded flex items-center justify-center flex-shrink-0">
                                    <img
                                      src={bank.logoUrl}
                                      alt={bank.bankName}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                )}
                                <div>
                                  <p className="font-bold text-neutral-900">{bank.bankName}</p>
                                  <p className="text-[10px] text-neutral-500">{bank.branch}</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between pt-0.5">
                                <span>Account: <span className="font-bold text-black">{bank.accountNumber}</span></span>
                                {bank.swiftCode && <span className="text-[10px] text-neutral-500">SWIFT: {bank.swiftCode}</span>}
                              </div>
                              <p>Beneficiary: {bank.accountName}</p>
                              {bank.instructions && (
                                <p className="text-[10px] text-neutral-500 pt-1 border-t border-neutral-200/60">{bank.instructions}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </form>
            </div>

            {/* Right Column: Order Summary Sidebar */}
            <div className="lg:col-span-5 xl:col-span-4 sticky top-24 space-y-6">
              <div className="bg-white border border-neutral-200 p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                    Order Summary ({items.reduce((acc, i) => acc + i.quantity, 0)} Items)
                  </h3>
                  <Link
                    href="/"
                    className="text-[11px] font-mono text-neutral-500 hover:text-black transition-colors"
                  >
                    Edit Bag
                  </Link>
                </div>

                {/* Cart Items List */}
                <div className="divide-y divide-neutral-100 max-h-72 overflow-y-auto pr-1 no-scrollbar space-y-3 pb-3">
                  {items.map((item) => (
                    <div key={item.variantId} className="pt-3 first:pt-0 flex gap-3">
                      <div className="w-16 h-20 bg-neutral-100 overflow-hidden flex-shrink-0 relative border border-neutral-200">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-400 font-mono text-[9px]">
                            CALVIZ
                          </div>
                        )}
                        <span className="absolute bottom-0 right-0 bg-black text-white text-[9px] font-mono font-bold px-1">
                          x{item.quantity}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="text-xs font-bold text-neutral-900 truncate">
                              {item.productName}
                            </h4>
                            <button
                              type="button"
                              onClick={() => removeItem(item.variantId)}
                              className="text-neutral-400 hover:text-red-600 transition-colors ml-1"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-[10px] font-mono text-neutral-500 mt-0.5">
                            SIZE: {item.size} • {item.color || "Standard"}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          {/* Quantity control */}
                          <div className="flex items-center border border-neutral-200">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                              className="px-2 py-0.5 text-xs text-neutral-600 hover:bg-neutral-100"
                            >
                              -
                            </button>
                            <span className="px-2 text-xs font-mono font-bold text-neutral-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                              className="px-2 py-0.5 text-xs text-neutral-600 hover:bg-neutral-100"
                            >
                              +
                            </button>
                          </div>

                          <span className="text-xs font-bold text-neutral-900 font-mono">
                            LKR {(item.unitPrice * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promo Code Input & Condition Feedback */}
                <div className="pt-4 border-t border-neutral-100 mb-4 space-y-2">
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
                          placeholder="Promo code (e.g. CALVIZ1500)"
                          className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 text-xs uppercase font-mono tracking-wider focus:bg-white focus:border-black focus:outline-hidden"
                          disabled={validatingPromo}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={validatingPromo || !couponCode.trim()}
                        className="px-4 py-2 bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {validatingPromo ? (
                          <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                          <span>Apply</span>
                        )}
                      </button>
                    </form>
                  ) : (
                    <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-sm flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-200/60 px-1.5 py-0.5 rounded-xs tracking-wider">
                            {validatedPromo.code}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-medium">
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
                        <div className="flex flex-wrap gap-2 text-[10px] text-emerald-700 font-mono pt-0.5">
                          {validatedPromo.minItemQuantity > 1 && (
                            <span className="bg-emerald-100/70 px-1.5 py-0.5 rounded-xs">
                              ✓ Min {validatedPromo.minItemQuantity} garments verified ({totalItemCount} in bag)
                            </span>
                          )}
                          <span className="bg-emerald-100/70 px-1.5 py-0.5 rounded-xs">
                            ✓ 1-use client limit active
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemovePromo}
                        className="text-neutral-400 hover:text-neutral-900 p-1 rounded-xs transition-colors"
                        title="Remove promo code"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Promo Error Message */}
                  {promoError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200/80 rounded-xs flex items-start gap-2 text-rose-800 text-[11px]">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="font-semibold">{promoError}</p>
                        {couponCode.toUpperCase() === "CALVIZ1500" && totalItemCount < 2 && (
                          <p className="text-[10px] text-rose-700">
                            💡 Tip: Add at least 2 items to your bag to claim this LKR 1,500 privilege discount.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Promo Success Message */}
                  {promoSuccess && !promoError && (
                    <p className="text-[10px] text-emerald-700 font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {promoSuccess}
                    </p>
                  )}
                </div>

                {/* Pricing Breakdown */}
                <div className="border-t border-neutral-100 pt-4 space-y-2.5 text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal</span>
                    <span className="font-mono font-medium text-neutral-900">
                      LKR {currentSubtotal.toLocaleString()}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span className="flex items-center gap-1 font-medium">
                        <Sparkles className="w-3 h-3" />
                        Privilege Discount ({validatedPromo?.code})
                      </span>
                      <span className="font-mono font-bold">
                        - LKR {discountAmount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-neutral-600">
                    <span className="flex items-center gap-1.5">
                      Island-wide Delivery
                      {isFreeDelivery && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-mono px-1.5 py-0.2">FREE</span>
                      )}
                    </span>
                    <span className="font-mono font-medium text-neutral-900">
                      {isFreeDelivery ? "FREE" : `LKR ${deliveryFee.toLocaleString()}`}
                    </span>
                  </div>

                  <div className="border-t border-neutral-200 pt-3 flex justify-between items-baseline">
                    <span className="text-sm font-bold uppercase tracking-wider text-neutral-950">
                      Total
                    </span>
                    <span className="text-lg font-black text-neutral-950 font-mono">
                      LKR {totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 font-mono text-right">
                    Including all taxes & logistics
                  </p>
                </div>

                {/* Submit Order Button */}
                <div className="mt-6 pt-4 border-t border-neutral-100">
                  <button
                    type="submit"
                    form="checkout-form"
                    disabled={submitting || items.length === 0}
                    className="w-full py-4 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>PROCESSING ORDER...</span>
                      </>
                    ) : (
                      <>
                        <span>CONFIRM & PLACE ORDER</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>

                {/* Trust Guarantees */}
                <div className="mt-6 pt-6 border-t border-neutral-100 space-y-3">
                  <div className="flex items-center gap-2.5 text-[11px] text-neutral-600">
                    <ShieldCheck className="w-4 h-4 text-neutral-800 flex-shrink-0" />
                    <span>100% Premium Cotton Guarantee</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[11px] text-neutral-600">
                    <Truck className="w-4 h-4 text-neutral-800 flex-shrink-0" />
                    <span>Courier doorstep</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[11px] text-neutral-600">
                    <Package className="w-4 h-4 text-neutral-800 flex-shrink-0" />
                    <span>Hassle-free 7-day exchange policy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
