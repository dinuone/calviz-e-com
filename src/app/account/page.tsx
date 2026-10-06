"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { fetchCustomerOrders, updateCustomerProfile } from "@/lib/api";
import { CustomerOrderHistory } from "@/types";
import {
  User,
  Package,
  MapPin,
  LogOut,
  ExternalLink,
  FileText,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  Tag,
  ArrowRight,
  ShieldCheck,
  Edit2,
  Check,
} from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const { customer, token, isAuthenticated, logout, updateCustomer } = useAuthStore();

  const [activeTab, setActiveTab] = useState<"orders" | "profile" | "privileges">("orders");
  const [orders, setOrders] = useState<CustomerOrderHistory[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Profile Edit Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push("/login?redirect=/account");
      return;
    }

    if (customer) {
      setFullName(customer.fullName || "");
      setPhone(customer.phoneNumber || "");
      setAddressLine1(customer.addressLine1 || "");
      setAddressLine2(customer.addressLine2 || "");
      setCity(customer.city || "");
      setPostalCode(customer.postalCode || "");
    }

    async function loadOrders() {
      setLoadingOrders(true);
      try {
        const data = await fetchCustomerOrders(token!);
        setOrders(data);
      } catch (e) {
        console.warn("Could not load customer orders", e);
      } finally {
        setLoadingOrders(false);
      }
    }

    loadOrders();
  }, [isAuthenticated, token, router, customer]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(false);

    try {
      const updated = await updateCustomerProfile(token, {
        fullName,
        phoneNumber: phone,
        addressLine1,
        addressLine2,
        city,
        postalCode,
      });

      updateCustomer(updated);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError(err.message || "Failed to update profile coordinates.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!customer) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col justify-between">
        <Header />
        <div className="flex-1 flex items-center justify-center font-mono text-xs text-neutral-500">
          <span className="animate-spin mr-2">✦</span> VERIFYING CLIENT CREDENTIALS...
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-between">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 pt-36 md:pt-44 pb-20">
        {/* Client Top Banner Card */}
        <div className="bg-black text-white rounded-2xl p-6 sm:p-8 mb-8 relative overflow-hidden shadow-2xl">
          <div className="absolute right-0 top-0 w-96 h-96 bg-neutral-800/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white text-black font-mono font-black text-xl flex items-center justify-center shadow-lg border border-neutral-200 overflow-hidden relative">
                {customer.avatarUrl ? (
                  <img
                    src={customer.avatarUrl}
                    alt={customer.fullName || "Client Profile"}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  customer.fullName
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "CL"
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                    VERIFIED CLIENT ATELIER ID
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mt-0.5">
                  {customer.fullName}
                </h1>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">{customer.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/products"
                className="px-4 py-2 bg-neutral-900 border border-neutral-700 hover:border-white text-white text-xs font-mono font-bold uppercase rounded-xl transition-all"
              >
                BROWSE CAPSULE →
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3.5 py-2 bg-neutral-900 border border-neutral-800 hover:bg-red-950/40 hover:border-red-800 text-neutral-300 hover:text-red-400 text-xs font-mono font-bold uppercase rounded-xl transition-all flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>SIGN OUT</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-neutral-800 font-mono text-xs">
            <div>
              <span className="text-neutral-500 uppercase text-[10px] block font-bold">LIFETIME ORDERS</span>
              <span className="text-lg font-black text-white mt-0.5 block">{orders.length}</span>
            </div>
            <div>
              <span className="text-neutral-500 uppercase text-[10px] block font-bold">DELIVERY SLA</span>
              <span className="text-sm font-bold text-emerald-400 mt-0.5 block">24H DOORSTEP</span>
            </div>
            <div>
              <span className="text-neutral-500 uppercase text-[10px] block font-bold">PRIVILEGE TIER</span>
              <span className="text-sm font-bold text-amber-400 mt-0.5 block">TIER 01 CLIENT</span>
            </div>
            <div>
              <span className="text-neutral-500 uppercase text-[10px] block font-bold">COURIER PARTNERS</span>
              <span className="text-xs font-bold text-neutral-300 mt-0.5 block">ROYAL EXPRESS</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-200 mb-8 font-mono text-xs font-bold space-x-2 sm:space-x-4">
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "orders"
                ? "border-black text-black"
                : "border-transparent text-neutral-400 hover:text-neutral-700"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>ORDER HISTORY ({orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "profile"
                ? "border-black text-black"
                : "border-transparent text-neutral-400 hover:text-neutral-700"
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>SAVED COORDINATES</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("privileges")}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "privileges"
                ? "border-black text-black"
                : "border-transparent text-neutral-400 hover:text-neutral-700"
            }`}
          >
            <Tag className="w-4 h-4 text-amber-500" />
            <span>CLIENT PRIVILEGES</span>
          </button>
        </div>

        {/* Tab 1: Orders History */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            {loadingOrders ? (
              <div className="py-16 text-center font-mono text-xs text-neutral-500">
                <span className="animate-spin inline-block mr-2">✦</span> RETRIEVING CLIENT ARCHIVE ORDERS...
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center shadow-xs">
                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4 text-neutral-400">
                  <Package className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-black uppercase font-mono">No Orders Placed Yet</h3>
                <p className="text-xs text-neutral-600 mt-1 max-w-sm mx-auto font-medium">
                  Your client order archive is currently empty. Explore our latest heavyweight drop to start your collection.
                </p>
                <Link
                  href="/products"
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-xs font-mono font-bold uppercase rounded-xl hover:bg-neutral-800 transition-colors shadow-sm"
                >
                  <span>SHOP DROP 01 ARCHIVE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden hover:border-neutral-300 transition-all"
                >
                  {/* Order Header */}
                  <div className="p-5 sm:p-6 bg-neutral-50/70 border-b border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-sm font-black text-black tracking-tight uppercase">
                          {order.orderNumber}
                        </span>
                        <span
                          className={`font-mono text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border ${
                            order.orderStatus === "Delivered"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : order.orderStatus === "Dispatched"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : order.orderStatus === "Confirmed"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : order.orderStatus === "Cancelled"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-neutral-500 mt-1 block">
                        Placed on {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href={`/track?orderId=${encodeURIComponent(order.orderNumber)}`}
                        className="px-3.5 py-2 bg-white border border-neutral-200 hover:border-black text-black text-xs font-mono font-bold uppercase rounded-xl transition-all inline-flex items-center gap-1.5 shadow-xs"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>TRACK DISPATCH</span>
                      </Link>
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5089/api"}/orders/${order.id}/invoice`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 bg-black text-white hover:bg-neutral-800 text-xs font-mono font-bold uppercase rounded-xl transition-all inline-flex items-center gap-1.5 shadow-xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>INVOICE PDF</span>
                      </a>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-5 sm:p-6 divide-y divide-neutral-100">
                    {order.items?.map((item) => (
                      <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center font-mono text-xs font-bold text-neutral-700 uppercase">
                            {item.size}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-black uppercase tracking-tight font-mono">
                              {item.productName}
                            </h4>
                            <span className="text-xs font-mono text-neutral-500">
                              Size: {item.size} {item.color ? `// Color: ${item.color}` : ""} // Qty: {item.quantity}
                            </span>
                          </div>
                        </div>
                        <div className="text-right font-mono">
                          <span className="text-sm font-bold text-black block">
                            LKR {item.totalPrice.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            (LKR {item.unitPrice.toLocaleString()} ea)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer Summary */}
                  <div className="p-4 sm:p-5 bg-neutral-50 border-t border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                    <div className="text-neutral-600">
                      <span className="font-bold text-black uppercase">Delivery Address:</span> {order.streetAddress}, {order.city}
                    </div>
                    <div className="flex items-center gap-4 text-neutral-700">
                      {order.discountAmount > 0 && (
                        <span className="text-emerald-700 font-bold">
                          Promo ({order.promoCode}): -LKR {order.discountAmount.toLocaleString()}
                        </span>
                      )}
                      <span className="font-black text-black text-sm">
                        TOTAL: LKR {order.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Saved Delivery Coordinates */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8 max-w-2xl">
            <div className="mb-6">
              <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 font-bold block mb-1">
                DISPATCH COORDINATES
              </span>
              <h2 className="text-xl font-black uppercase text-black tracking-tight">
                SAVED DELIVERY PROFILE
              </h2>
              <p className="text-xs text-neutral-600 mt-1">
                Save your default delivery address to enable 1-click express checkout.
              </p>
            </div>

            {profileSuccess && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-mono font-bold animate-fade-in">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>PROFILE AND DELIVERY COORDINATES UPDATED SUCCESSFULLY.</span>
              </div>
            )}

            {profileError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2 font-mono font-bold">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-black focus:bg-white focus:outline-none focus:ring-2 focus:ring-black font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Email Address (Read-Only)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={customer.email}
                    className="w-full px-4 py-3 bg-neutral-100 border border-neutral-200 rounded-xl text-sm text-neutral-500 font-mono cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-black focus:bg-white focus:outline-none focus:ring-2 focus:ring-black font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Street Address / Apartment
                </label>
                <input
                  type="text"
                  placeholder="No. 45, Alfred House Gardens"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-black focus:bg-white focus:outline-none focus:ring-2 focus:ring-black font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="Colombo 03"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-black focus:bg-white focus:outline-none focus:ring-2 focus:ring-black font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    placeholder="00300"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-black focus:bg-white focus:outline-none focus:ring-2 focus:ring-black font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-3.5 mt-4 bg-black text-white rounded-xl font-mono text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md"
              >
                {savingProfile ? (
                  <span className="inline-block animate-spin">✦</span>
                ) : (
                  <>
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>SAVE DISPATCH COORDINATES</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Client Privileges */}
        {activeTab === "privileges" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  ACTIVE PRIVILEGE
                </span>
                <span className="font-mono text-xs text-neutral-500 font-bold">10% PRIVILEGE</span>
              </div>
              <h3 className="text-lg font-black uppercase text-black tracking-tight font-mono">
                DUO ARCHIVE CAPSULE
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                Save 10% on any 2 or more heavyweight garments across Drop 01. Stacks automatically with island-wide complimentary dispatch.
              </p>
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between font-mono">
                <span className="text-sm font-black text-black">CALVIZ10</span>
                <span className="text-[10px] text-neutral-500 font-bold">MIN 2 GARMENTS</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                  VIP ALLOCATION
                </span>
                <span className="font-mono text-xs text-neutral-500 font-bold">LKR 1,500 OFF</span>
              </div>
              <h3 className="text-lg font-black uppercase text-black tracking-tight font-mono">
                DROP 01 PRIVILEGE PASS
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                Flat LKR 1,500 privilege discount for registered atelier clients on orders with 2 or more items.
              </p>
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between font-mono">
                <span className="text-sm font-black text-black">CALVIZ1500</span>
                <span className="text-[10px] text-neutral-500 font-bold">1 USE / CLIENT</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
