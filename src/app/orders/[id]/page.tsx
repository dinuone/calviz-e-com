"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { getOrderById, uploadBankTransferProof, getInvoiceDownloadUrl, fetchBankDetails, getMediaUrl } from "@/lib/api";
import { OrderDetail, OrderStatus, PaymentMethod, PaymentStatus, BankDetails } from "@/types";
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Download,
  MessageCircle,
  Copy,
  Check,
  Upload,
  AlertCircle,
  Building2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  ShieldCheck,
  FileText,
  ExternalLink,
} from "lucide-react";

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = Array.isArray(params.id) ? params.id[0] : params.id || "";

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [bankInfo, setBankInfo] = useState<BankDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // Bank Slip Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [uploadingSlip, setUploadingSlip] = useState(false);
  const [slipSuccessMessage, setSlipSuccessMessage] = useState<string | null>(null);
  const [slipErrorMessage, setSlipErrorMessage] = useState<string | null>(null);

  // Copy state
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    // Load bank details from backend immediately
    fetchBankDetails().then((b) => setBankInfo(b)).catch(() => {});

    async function loadOrder() {
      if (!orderId) return;
      try {
        setLoading(true);
        setError(null);
        const data = await getOrderById(orderId);
        if (data) {
          setOrder(data);
        } else {
          setError("Order not found. Please check your order reference ID.");
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load order information.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setSlipErrorMessage(null);
      setSlipSuccessMessage(null);
    }
  };

  const handleUploadSlip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setSlipErrorMessage("Please select an image or PDF of your transfer receipt.");
      return;
    }

    setUploadingSlip(true);
    setSlipErrorMessage(null);
    setSlipSuccessMessage(null);

    try {
      await uploadBankTransferProof(orderId, selectedFile, referenceNumber.trim() || undefined);
      setSlipSuccessMessage("Bank transfer proof uploaded successfully! Our team will verify it shortly.");
      setSelectedFile(null);
      setReferenceNumber("");

      // Refresh order details from backend
      const refreshed = await getOrderById(orderId);
      if (refreshed) {
        setOrder(refreshed);
      }
    } catch (err: unknown) {
      let msg = "Failed to upload transfer proof.";
      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message);
          msg = parsed.detail || parsed.title || err.message;
        } catch {
          msg = err.message;
        }
      }
      setSlipErrorMessage(msg);
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

  const getOrderStatusBadge = (status?: string | number | OrderStatus) => {
    const s = String(status || "").toLowerCase();
    switch (s) {
      case "pending":
      case "placed":
      case "1":
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-900 text-[10px] font-mono uppercase tracking-wider font-bold">Pending Confirmation</span>;
      case "processing":
      case "2":
        return <span className="px-2.5 py-1 bg-purple-100 text-purple-900 text-[10px] font-mono uppercase tracking-wider font-bold">Packaging / Processing</span>;
      case "shipped":
      case "dispatched":
      case "3":
        return <span className="px-2.5 py-1 bg-indigo-100 text-indigo-900 text-[10px] font-mono uppercase tracking-wider font-bold">Shipped / Dispatched</span>;
      case "delivered":
      case "4":
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 text-[10px] font-mono uppercase tracking-wider font-bold">Delivered</span>;
      case "cancelled":
      case "5":
        return <span className="px-2.5 py-1 bg-red-100 text-red-900 text-[10px] font-mono uppercase tracking-wider font-bold">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 bg-neutral-100 text-neutral-800 text-[10px] font-mono uppercase tracking-wider font-bold">{String(status || "Pending")}</span>;
    }
  };

  const getPaymentStatusBadge = (status?: string | number | PaymentStatus) => {
    const s = String(status || "").toLowerCase();
    switch (s) {
      case "pending":
      case "1":
        return <span className="px-2 py-0.5 bg-neutral-100 text-neutral-800 text-[10px] font-mono uppercase">Payment Pending</span>;
      case "verified":
      case "paid":
      case "2":
        return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono uppercase font-bold">Payment Verified</span>;
      case "failed":
      case "3":
        return <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-mono uppercase font-bold">Payment Failed</span>;
      default:
        return null;
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

  const whatsappMessage = encodeURIComponent(
    `Hi Calviz Support, I would like to inquire regarding my Order #${order?.orderNumber || orderId}.`
  );

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#09090b] flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-36 md:pt-44 pb-20">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs font-mono uppercase tracking-wider text-neutral-500">
              Retrieving Order Status...
            </p>
          </div>
        ) : error || !order ? (
          <div className="bg-white border border-neutral-200 p-12 text-center max-w-md mx-auto my-12 shadow-xs">
            <AlertCircle className="w-12 h-12 text-neutral-400 mx-auto mb-4 stroke-[1.5]" />
            <h2 className="text-lg font-bold uppercase tracking-wide mb-2">Order Not Found</h2>
            <p className="text-xs text-neutral-500 mb-6">
              {error || "We could not find the order matching this identifier."}
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors w-full"
            >
              <span>Return to Store</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top Success & Status Banner */}
            <div className="bg-white border border-neutral-200 p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-black text-white flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono uppercase text-neutral-500">Order Confirmed</span>
                      {getOrderStatusBadge(order.orderStatus)}
                      {getPaymentStatusBadge(order.paymentStatus)}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-950 mt-1">
                      {order.orderNumber}
                    </h1>
                    <p className="text-xs text-neutral-500 font-mono mt-0.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      Placed on {formattedDate}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 sm:self-start">
                  <Link
                    href={`/track?query=${encodeURIComponent(order.orderNumber)}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                    <span>Live Tracking Portal</span>
                  </Link>
                  <a
                    href={getInvoiceDownloadUrl(order.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-mono font-bold uppercase tracking-wider transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Invoice PDF</span>
                  </a>
                  <a
                    href={`https://wa.me/94704901027?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors rounded shadow-xs"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    <span>WhatsApp Support</span>
                  </a>
                </div>
              </div>

              {/* Order Status Stepper */}
              {String(order.orderStatus).toLowerCase() !== "cancelled" && (
                <div className="py-4">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-4">
                    Fulfillment & Logistics Progress
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    {[
                      { step: 1, label: "Order Placed", desc: "Received in queue" },
                      { step: 2, label: "Processing", desc: "Packaging apparel" },
                      { step: 3, label: "Dispatched", desc: "Courier out for delivery" },
                      { step: 4, label: "Delivered", desc: "Handed over to customer" },
                    ].map((st) => {
                      const currentStep = getStatusStep(order.orderStatus);
                      const isComplete = currentStep >= st.step;
                      const isCurrent = currentStep === st.step;

                      return (
                        <div
                          key={st.step}
                          className={`p-3 border transition-all ${
                            isCurrent
                              ? "border-black bg-neutral-950 text-white"
                              : isComplete
                              ? "border-neutral-200 bg-neutral-50 text-neutral-800"
                              : "border-dashed border-neutral-200 text-neutral-400 opacity-60"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono uppercase tracking-widest font-bold">
                              0{st.step}
                            </span>
                            {isComplete && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                          </div>
                          <p className="font-bold uppercase tracking-wider text-[11px] truncate">{st.label}</p>
                          <p className="text-[10px] font-mono mt-0.5 opacity-80 truncate">{st.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Bank Transfer Information & Slip Upload (if Bank Transfer) */}
            {String(order.paymentMethod).toLowerCase().includes("bank") && (
              <div className="bg-white border border-neutral-200 p-6 sm:p-8 shadow-xs">
                <div className="flex items-center gap-3 border-b border-neutral-100 pb-4 mb-6">
                  {bankInfo?.logoUrl ? (
                    <div className="w-11 h-11 bg-white p-1 border border-neutral-200 rounded flex items-center justify-center flex-shrink-0">
                      <img
                        src={bankInfo.logoUrl}
                        alt={bankInfo.bankName || "Bank Logo"}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-neutral-100 border border-neutral-200 rounded flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-neutral-900" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                      Bank Transfer Verification & Receipt
                    </h2>
                    <p className="text-xs text-neutral-500 font-mono">
                      {bankInfo?.bankName || "Commercial Bank of Ceylon"} • Corporate Account
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  {/* Bank Account Details Card */}
                  <div className="p-5 bg-neutral-50 border border-neutral-200 space-y-3 font-mono text-xs">
                    <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
                      <span className="text-neutral-500 uppercase text-[10px]">Bank Name</span>
                      <div className="flex items-center gap-2">
                        {bankInfo?.logoUrl && (
                          <img
                            src={bankInfo.logoUrl}
                            alt=""
                            className="w-4 h-4 object-contain"
                          />
                        )}
                        <span className="font-bold text-neutral-900">{bankInfo?.bankName || "Commercial Bank of Ceylon"}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
                      <span className="text-neutral-500 uppercase text-[10px]">Account Number</span>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-black">{bankInfo?.accountNumber || "8010045231"}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(bankInfo?.accountNumber || "8010045231", "acc")}
                          className="p-1 hover:bg-neutral-200 text-neutral-600 transition-colors"
                          title="Copy Account Number"
                        >
                          {copiedField === "acc" ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
                      <span className="text-neutral-500 uppercase text-[10px]">Account Name</span>
                      <span className="font-bold text-neutral-900">{bankInfo?.accountName || "CALVIZ APPAREL (PVT) LTD"}</span>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
                      <span className="text-neutral-500 uppercase text-[10px]">Branch</span>
                      <span className="font-bold text-neutral-900">{bankInfo?.branch || "Colombo Main Branch"}</span>
                    </div>

                    {bankInfo?.swiftCode && (
                      <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
                        <span className="text-neutral-500 uppercase text-[10px]">SWIFT / BIC</span>
                        <span className="font-bold text-neutral-900">{bankInfo.swiftCode}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-1">
                      <span className="text-neutral-500 uppercase text-[10px]">Payable Amount</span>
                      <span className="font-black text-sm text-neutral-950">
                        LKR {order.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>


                  {/* Upload Slip Form */}
                  <div className="space-y-4">
                    {order.bankSlipUrl ? (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Bank Slip Received</span>
                          </div>
                          <a
                            href={getMediaUrl(order.bankSlipUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-800 hover:text-emerald-950 underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View Slip
                          </a>
                        </div>
                        <p className="text-[11px] text-emerald-700 font-mono">
                          {order.bankSlipApproved
                            ? "Payment slip verified and approved by admin."
                            : "Your transfer slip is currently undergoing verification. Our dispatch team will confirm receipt soon."}
                        </p>
                        {order.bankTransferRef && (
                          <p className="text-[11px] text-emerald-900 font-mono font-bold">
                            Ref: {order.bankTransferRef}
                          </p>
                        )}
                      </div>
                    ) : null}

                    <form onSubmit={handleUploadSlip} className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 mb-1">
                          {order.bankSlipUrl ? "Upload New / Updated Slip" : "Upload Transfer Proof / CDM Slip"}
                        </label>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleFileChange}
                          className="w-full text-xs font-mono file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-bold file:uppercase file:bg-neutral-900 file:text-white hover:file:bg-black file:cursor-pointer border border-neutral-300 p-1"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-600 mb-1">
                          Bank Reference / Transaction ID (Optional)
                        </label>
                        <input
                          type="text"
                          value={referenceNumber}
                          onChange={(e) => setReferenceNumber(e.target.value)}
                          placeholder="e.g. TXN-99881122"
                          className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 text-xs font-mono uppercase focus:bg-white focus:border-black focus:outline-hidden"
                        />
                      </div>

                      {slipSuccessMessage && (
                        <p className="text-xs text-emerald-600 font-mono flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {slipSuccessMessage}
                        </p>
                      )}

                      {slipErrorMessage && (
                        <p className="text-xs text-red-500 font-mono flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" /> {slipErrorMessage}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={uploadingSlip || !selectedFile}
                        className="w-full py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {uploadingSlip ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>UPLOADING RECEIPT...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>SUBMIT PAYMENT PROOF</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Order Items & Summary Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Items List */}
              <div className="lg:col-span-8 bg-white border border-neutral-200 p-6 sm:p-8 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-4 mb-4">
                  Purchased Items ({order.items.length})
                </h3>

                <div className="divide-y divide-neutral-100">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-4 first:pt-0 flex gap-4 items-center">
                      <div className="w-16 h-20 bg-neutral-100 flex-shrink-0 flex items-center justify-center font-mono text-[9px] text-neutral-400 border border-neutral-200 overflow-hidden relative">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-mono text-[9px] text-neutral-400">CALVIZ</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-neutral-900">{item.productName}</h4>
                        <p className="text-[10px] font-mono text-neutral-500 mt-0.5">
                          SIZE: {item.size} • COLOR: {item.color}
                        </p>
                        <p className="text-[11px] font-mono text-neutral-600 mt-1">
                          LKR {item.unitPrice.toLocaleString()} × {item.quantity}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-neutral-950 font-mono">
                          LKR {item.totalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Financial Totals */}
                <div className="border-t border-neutral-200 pt-4 mt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal</span>
                    <span className="font-mono font-medium text-neutral-900">
                      LKR {order.subtotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between text-neutral-600">
                    <span>Island-wide Delivery</span>
                    <span className="font-mono font-medium text-neutral-900">
                      LKR {order.deliveryFee.toLocaleString()}
                    </span>
                  </div>

                  <div className="border-t border-neutral-200 pt-3 flex justify-between items-baseline">
                    <span className="text-sm font-bold uppercase tracking-wider text-neutral-950">
                      Total Paid / Due
                    </span>
                    <span className="text-lg font-black text-neutral-950 font-mono">
                      LKR {order.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="lg:col-span-4 bg-white border border-neutral-200 p-6 shadow-xs space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-3 mb-3">
                    Delivery Address
                  </h3>
                  <div className="space-y-2 text-xs text-neutral-700">
                    <p className="font-bold text-neutral-900">
                      {order.customerFirstName} {order.customerLastName}
                    </p>
                    <p className="flex items-start gap-2 text-neutral-600">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-neutral-400" />
                      <span>
                        {order.streetAddress}, {order.city} ({order.postalCode})
                      </span>
                    </p>
                    <p className="flex items-center gap-2 text-neutral-600 font-mono text-[11px]">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0 text-neutral-400" />
                      <span>{order.customerPhone}</span>
                    </p>
                    <p className="flex items-center gap-2 text-neutral-600 text-[11px]">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0 text-neutral-400" />
                      <span>{order.customerEmail}</span>
                    </p>
                  </div>
                </div>

                {order.notes && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-3 mb-2">
                      Delivery Instructions
                    </h3>
                    <p className="text-xs text-neutral-600 italic bg-neutral-50 p-3 border border-neutral-200">
                      &ldquo;{order.notes}&rdquo;
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-3 mb-3">
                    Payment Method
                  </h3>
                  <div className="text-xs text-neutral-700 space-y-1">
                    <p className="font-bold">
                      {String(order.paymentMethod).toLowerCase().includes("cash")
                        ? "Cash On Delivery (COD)"
                        : "Bank Transfer / CDM"}
                    </p>
                    <p className="text-[11px] text-neutral-500 font-mono">
                      {String(order.paymentMethod).toLowerCase().includes("cash")
                        ? "Doorstep cash settlement"
                        : "Commercial Bank Account"}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/"
                    className="w-full py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>Continue Shopping</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
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
