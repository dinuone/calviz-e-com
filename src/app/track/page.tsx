"use client";

import React, { useEffect, useState, useTransition, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { trackOrder, uploadBankTransferProof, getInvoiceDownloadUrl, fetchBankDetails } from "@/lib/api";
import { OrderDetail, OrderStatus, PaymentMethod, PaymentStatus, BankDetails } from "@/types";
import {
  Search,
  Truck,
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Building2,
  Download,
  MessageCircle,
  Copy,
  Check,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Phone,
  Mail,
  Receipt,
  Navigation
} from "lucide-react";

function TrackingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("query") || searchParams.get("order") || searchParams.get("id") || "";
  const initialContact = searchParams.get("contact") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [contactQuery, setContactQuery] = useState(initialContact);
  const [activeIdentifier, setActiveIdentifier] = useState(initialQuery);
  const [activeContact, setActiveContact] = useState(initialContact);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [bankInfo, setBankInfo] = useState<BankDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Bank Slip Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bankRef, setBankRef] = useState("");
  const [uploadingSlip, setUploadingSlip] = useState(false);
  const [slipSuccess, setSlipSuccess] = useState<string | null>(null);
  const [slipError, setSlipError] = useState<string | null>(null);

  // Perform search
  const performLookup = async (identifier: string, contact?: string) => {
    const cleanId = identifier.trim();
    const contactParam = (contact !== undefined ? contact : contactQuery).trim();
    if (!cleanId && !contactParam) return;

    const mainIdentifier = cleanId || contactParam;
    const secondaryContact = cleanId && contactParam ? contactParam : undefined;

    try {
      setLoading(true);
      setError(null);
      setSlipSuccess(null);
      setSlipError(null);

      const result = await trackOrder(mainIdentifier, secondaryContact);
      if (result) {
        setOrder(result);
        setActiveIdentifier(mainIdentifier);
        setActiveContact(secondaryContact || "");
        setLastRefreshedAt(new Date());

        if (String(result.paymentMethod).toLowerCase().includes("bank")) {
          fetchBankDetails().then((b) => setBankInfo(b)).catch(() => {});
        }
      } else {
        setOrder(null);
        setError(`No active ongoing order found matching "${mainIdentifier}". Note: Completed or delivered orders are archived from active tracking.`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to retrieve order tracking information.";
      setError(msg);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery || initialContact) {
      setSearchQuery(initialQuery);
      setContactQuery(initialContact);
      performLookup(initialQuery || initialContact, initialQuery && initialContact ? initialContact : undefined);
    }
  }, [initialQuery, initialContact]);

  // Live Auto-Refresh (every 12 seconds when enabled)
  useEffect(() => {
    if (!autoRefresh || !activeIdentifier || !order) return;

    const interval = setInterval(() => {
      trackOrder(activeIdentifier, activeContact || order.customerEmail || order.customerPhone).then((res) => {
        if (res) {
          setOrder(res);
          setLastRefreshedAt(new Date());
        }
      }).catch(() => {});
    }, 12000);

    return () => clearInterval(interval);
  }, [autoRefresh, activeIdentifier, activeContact, order]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSearch = searchQuery.trim();
    const cleanContact = contactQuery.trim();
    if (!cleanSearch && !cleanContact) return;

    const mainId = cleanSearch || cleanContact;
    const secContact = cleanSearch && cleanContact ? cleanContact : "";

    router.replace(
      `/track?query=${encodeURIComponent(mainId)}${
        secContact ? `&contact=${encodeURIComponent(secContact)}` : ""
      }`
    );
    performLookup(mainId, secContact || undefined);
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUploadSlip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !selectedFile) {
      setSlipError("Please choose a receipt file to upload.");
      return;
    }

    setUploadingSlip(true);
    setSlipError(null);
    setSlipSuccess(null);

    try {
      await uploadBankTransferProof(order.id, selectedFile, bankRef.trim() || undefined);
      setSlipSuccess("Bank transfer slip uploaded successfully! Fulfillment team will verify it shortly.");
      setSelectedFile(null);
      setBankRef("");

      // Refresh order
      const refreshed = await trackOrder(order.id, order.customerEmail || order.customerPhone);
      if (refreshed) setOrder(refreshed);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed. Please try again.";
      setSlipError(msg);
    } finally {
      setUploadingSlip(false);
    }
  };

  const getStatusStep = (status?: string | number | OrderStatus) => {
    if (!status) return 1;
    const s = String(status).toLowerCase();
    switch (s) {
      case "pending":
      case "placed":
      case "1":
        return 1;
      case "processing":
      case "confirmed":
      case "2":
        return 2;
      case "shipped":
      case "dispatched":
      case "3":
        return 3;
      case "delivered":
      case "4":
        return 4;
      case "cancelled":
      case "5":
        return 0;
      default:
        return 1;
    }
  };

  const currentStep = order ? getStatusStep(order.orderStatus) : 1;
  const isCancelled = order && String(order.orderStatus).toLowerCase() === "cancelled";

  const getProgressPercentage = () => {
    if (isCancelled) return 0;
    switch (currentStep) {
      case 1:
        return 25;
      case 2:
        return 50;
      case 3:
        return 80;
      case 4:
        return 100;
      default:
        return 25;
    }
  };

  const formattedDate = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const isColombo = order?.city?.toLowerCase().includes("colombo");
  const deliveryDays = isColombo ? 1 : 3;
  const deliverySlaLabel = isColombo ? "Within 24 Hours (Colombo Express)" : "2–3 Working Days (Island-Wide)";

  const estimatedDeliveryDate = order?.createdAt
    ? `${new Date(new Date(order.createdAt).getTime() + deliveryDays * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })} (${deliverySlaLabel})`
    : deliverySlaLabel;

  const whatsappMessage = encodeURIComponent(
    `Hi Calviz Concierge, I am tracking my Order #${order?.orderNumber || searchQuery}. Please provide a live dispatch update.`
  );

  return (
    <div className="space-y-8">
      {/* Search Header Banner */}
      <div className="bg-neutral-950 text-white p-6 sm:p-10 border border-neutral-800 shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-neutral-300 text-[10px] font-mono uppercase tracking-widest mb-4 border border-white/10">
            <Navigation className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>Real-Time Logistics Telemetry</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-2">
            Track Your Calviz Drop
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mb-6">
            Enter your Order Number (e.g. <span className="text-white font-mono font-bold">CLV-2610-9364</span>), Contact Phone Number, or Email to inspect live package dispatch status.
          </p>

          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Order Number, Phone or Email"
                className="w-full pl-10 pr-4 py-3 bg-neutral-900 border border-neutral-700 text-white text-xs font-mono placeholder:text-neutral-500 focus:outline-none focus:border-white transition-colors"
              />
            </div>
            <div className="relative sm:w-64">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={contactQuery}
                onChange={(e) => setContactQuery(e.target.value)}
                placeholder="Phone or Email (optional)"
                className="w-full pl-10 pr-4 py-3 bg-neutral-900 border border-neutral-700 text-white text-xs font-mono placeholder:text-neutral-500 focus:outline-none focus:border-white transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading || (!searchQuery.trim() && !contactQuery.trim())}
              className="px-6 py-3 bg-white text-black text-xs font-bold font-mono uppercase tracking-wider hover:bg-neutral-200 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Track Package</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick sample chips */}
          <div className="mt-4 flex items-center gap-2 flex-wrap text-[11px] font-mono text-neutral-400">
            <span className="text-neutral-500">Quick Track:</span>
            {["CLV-2610-9364"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setSearchQuery(s);
                  router.replace(`/track?query=${s}`);
                  performLookup(s);
                }}
                className="underline hover:text-white transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && !order && (
        <div className="py-20 text-center bg-white border border-neutral-200 p-8 shadow-xs">
          <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-mono uppercase tracking-widest text-neutral-600">
            Querying Island-Wide Logistics Registry...
          </p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-white border border-red-200 p-8 text-center max-w-lg mx-auto shadow-xs">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-1">
            Order Not Located
          </h2>
          <p className="text-xs text-neutral-500 mb-4">{error}</p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-mono uppercase transition-colors"
            >
              Clear Search
            </button>
            <a
              href={`https://wa.me/94704901027?text=${encodeURIComponent("Hi Calviz Support, I need help finding my order.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-mono uppercase font-bold transition-colors flex items-center gap-2 rounded shadow-xs cursor-pointer"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>WhatsApp Help</span>
            </a>
          </div>
        </div>
      )}

      {/* Active Order Live Tracking Dashboard */}
      {order && (
        <div className="space-y-8 animate-fade-in">
          {/* Status Overview Card */}
          <div className="bg-white border border-neutral-200 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-6 mb-6">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[10px] font-mono uppercase text-neutral-500">Live Manifest</span>
                  {currentStep === 4 ? (
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 text-[10px] font-mono uppercase font-bold">
                      Delivered
                    </span>
                  ) : currentStep === 3 ? (
                    <span className="px-2.5 py-1 bg-indigo-100 text-indigo-900 text-[10px] font-mono uppercase font-bold flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      Shipped / Dispatched
                    </span>
                  ) : currentStep === 2 ? (
                    <span className="px-2.5 py-1 bg-purple-100 text-purple-900 text-[10px] font-mono uppercase font-bold">
                      Packaging & Quality Control
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-900 text-[10px] font-mono uppercase font-bold">
                      Order Placed (In Queue)
                    </span>
                  )}
                  {String(order.paymentStatus).toLowerCase().includes("paid") || String(order.paymentStatus).toLowerCase().includes("verified") ? (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono uppercase font-bold">
                      Payment Verified
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 text-[10px] font-mono uppercase">
                      Payment Pending
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-950 font-mono">
                  {order.orderNumber}
                </h2>
                <p className="text-xs text-neutral-500 font-mono mt-0.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                  Placed on {formattedDate}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 sm:self-start">
                <button
                  type="button"
                  onClick={() => performLookup(activeIdentifier)}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-mono uppercase transition-colors"
                  title="Refresh status"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-mono uppercase transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Share Link"}</span>
                </button>

                <a
                  href={getInvoiceDownloadUrl(order.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-mono uppercase transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Invoice PDF</span>
                </a>

                <a
                  href={`https://wa.me/94704901027?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-mono uppercase font-bold transition-colors rounded shadow-xs cursor-pointer"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>Logistics Help</span>
                </a>
              </div>
            </div>

            {/* Live Progress Bar */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                  Dispatch Progression
                </span>
                <span className="font-bold text-black">{getProgressPercentage()}% Complete</span>
              </div>
              <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden border border-neutral-200">
                <div
                  className="bg-neutral-950 h-full transition-all duration-700 ease-out rounded-full"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>

            {/* 4-Step Logistics Pipeline */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {[
                { step: 1, label: "Order Placed", desc: "Received in queue", icon: Package },
                { step: 2, label: "Packaging & QC", desc: "Inspection & tagging", icon: Sparkles },
                { step: 3, label: "Dispatched", desc: "Courier out for delivery", icon: Truck },
                { step: 4, label: "Delivered", desc: "Handed over to customer", icon: CheckCircle2 },
              ].map((st) => {
                const isComplete = currentStep >= st.step;
                const isCurrent = currentStep === st.step;
                const IconComponent = st.icon;

                return (
                  <div
                    key={st.step}
                    className={`p-4 border transition-all ${
                      isCurrent
                        ? "border-black bg-neutral-950 text-white shadow-md"
                        : isComplete
                        ? "border-neutral-200 bg-neutral-50 text-neutral-900"
                        : "border-dashed border-neutral-200 text-neutral-400 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest font-bold opacity-80">
                        0{st.step}
                      </span>
                      {isComplete ? (
                        <Check className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
                      ) : (
                        <IconComponent className="w-3.5 h-3.5 opacity-60" />
                      )}
                    </div>
                    <p className="font-bold uppercase tracking-wider text-[11px] truncate">{st.label}</p>
                    <p className="text-[10px] font-mono mt-0.5 opacity-80 truncate">{st.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Telemetry & Courier Route Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Courier Dispatch Specs */}
            <div className="p-6 bg-white border border-neutral-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                <Truck className="w-4 h-4 text-neutral-800" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-950">
                  Logistics Carrier
                </h3>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <span className="text-neutral-500 text-[10px] uppercase block">Carrier Partner</span>
                  <span className="font-bold text-neutral-900">Prompt Xpress / Domex Logistics</span>
                </div>
                <div>
                  <span className="text-neutral-500 text-[10px] uppercase block">Waybill Consignment #</span>
                  <span className="font-bold text-neutral-900">WB-LK-{order.orderNumber.replace("CLV-", "")}</span>
                </div>
                <div>
                  <span className="text-neutral-500 text-[10px] uppercase block">Target Delivery Window</span>
                  <span className="font-bold text-emerald-700">{estimatedDeliveryDate}</span>
                </div>
              </div>
            </div>

            {/* Origin & Destination Hubs */}
            <div className="p-6 bg-white border border-neutral-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                <MapPin className="w-4 h-4 text-neutral-800" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-950">
                  Delivery Destination
                </h3>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div>
                  <span className="text-neutral-500 text-[10px] uppercase block">Recipient</span>
                  <span className="font-bold text-neutral-900">{order.customerFirstName} {order.customerLastName}</span>
                </div>
                <div>
                  <span className="text-neutral-500 text-[10px] uppercase block">Address</span>
                  <span className="text-neutral-800 block truncate">{order.streetAddress}</span>
                  <span className="font-bold text-black">{order.city} ({order.postalCode})</span>
                </div>
                <div>
                  <span className="text-neutral-500 text-[10px] uppercase block">Phone</span>
                  <span className="text-neutral-800">{order.customerPhone}</span>
                </div>
              </div>
            </div>

            {/* Financial Settlement */}
            <div className="p-6 bg-white border border-neutral-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                <Receipt className="w-4 h-4 text-neutral-800" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-950">
                  Payment Manifest
                </h3>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Method:</span>
                  <span className="font-bold text-neutral-900">
                    {String(order.paymentMethod).toLowerCase().includes("cash")
                      ? "Cash On Delivery (COD)"
                      : "Bank Transfer / CDM"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Subtotal:</span>
                  <span>LKR {order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Delivery Fee:</span>
                  <span>LKR {order.deliveryFee.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-neutral-200 flex justify-between font-bold text-black">
                  <span>Total Amount:</span>
                  <span>LKR {order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bank Transfer Receipt Upload (if bank transfer) */}
          {String(order.paymentMethod).toLowerCase().includes("bank") && (
            <div className="bg-white border border-neutral-200 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-3 border-b border-neutral-100 pb-4 mb-6">
                {bankInfo?.logoUrl ? (
                  <div className="w-10 h-10 p-1 bg-white border border-neutral-200 rounded flex items-center justify-center shrink-0">
                    <img src={bankInfo.logoUrl} alt="Bank Logo" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-neutral-100 border border-neutral-200 rounded flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-neutral-900" />
                  </div>
                )}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                    Bank Transfer Verification Receipt
                  </h3>
                  <p className="text-[11px] text-neutral-500 font-mono">
                    {bankInfo?.bankName || "Commercial Bank of Ceylon"} • Account: {bankInfo?.accountNumber || "8010045231"}
                  </p>
                </div>
              </div>

              {slipSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{slipSuccess}</span>
                </div>
              )}

              {slipError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{slipError}</span>
                </div>
              )}

              <form onSubmit={handleUploadSlip} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="text-xs file:mr-3 file:py-2 file:px-3 file:border-0 file:text-xs file:font-mono file:bg-neutral-100 file:text-neutral-900 hover:file:bg-neutral-200 border border-neutral-200 p-1"
                />
                <input
                  type="text"
                  value={bankRef}
                  onChange={(e) => setBankRef(e.target.value)}
                  placeholder="Bank Reference / Txn #"
                  className="px-3 py-2 border border-neutral-200 text-xs font-mono focus:outline-none focus:border-black"
                />
                <button
                  type="submit"
                  disabled={uploadingSlip || !selectedFile}
                  className="px-4 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-mono uppercase tracking-wider font-bold disabled:opacity-50 transition-colors"
                >
                  {uploadingSlip ? "Uploading Slip..." : "Upload Transfer Proof"}
                </button>
              </form>
            </div>
          )}

          {/* Ordered Items Manifest */}
          <div className="bg-white border border-neutral-200 p-6 sm:p-8 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-4 mb-4">
              Items In This Consignment ({order.items.length})
            </h3>
            <div className="divide-y divide-neutral-100">
              {order.items.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-20 bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[9px] font-mono text-neutral-400 uppercase">Calviz</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-950 uppercase">{item.productName}</h4>
                      <p className="text-[11px] font-mono text-neutral-500 mt-0.5">
                        SIZE: {item.size} • COLOR: {item.color}
                      </p>
                      <p className="text-[11px] font-mono text-neutral-500">
                        Qty: {item.quantity} × LKR {item.unitPrice.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs font-bold text-neutral-950">
                    LKR {item.totalPrice.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-[#09090b] flex flex-col font-sans">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-36 md:pt-44 pb-20">
        <Suspense fallback={<div className="py-24 text-center"><div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" /></div>}>
          <TrackingContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
