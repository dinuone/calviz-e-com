"use client";

import React, { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    if (orderId) {
      router.replace(`/orders/${orderId}`);
    }
  }, [orderId, router]);

  return (
    <div className="py-24 text-center max-w-md mx-auto px-4">
      <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <h2 className="text-base font-bold uppercase tracking-wider mb-2">Redirecting to Order Status...</h2>
      <p className="text-xs text-neutral-500 mb-6">
        Please wait while we route you to your secure tracking dashboard.
      </p>
      {!orderId && (
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors"
        >
          <span>Return to Store</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-[#09090b] flex flex-col font-sans">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 pt-36 md:pt-44 pb-20 flex items-center justify-center">
        <Suspense fallback={<div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />}>
          <ConfirmationContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
