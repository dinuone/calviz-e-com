"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Suspense } from "react";

function PageLoaderContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Initial load animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setIsInitialLoad(false);
    }, 750);

    return () => clearTimeout(timer);
  }, []);

  // Route change animation
  useEffect(() => {
    if (!isInitialLoad) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams, isInitialLoad]);

  if (!loading) return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      aria-label="Loading page content"
      className="fixed inset-0 z-99999 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md transition-opacity duration-500 ease-out"
    >
      <div className="flex flex-col items-center justify-center px-6 max-w-sm w-full animate-fade-in">
        {/* Animated Brand Asset */}
        <div className="relative w-64 sm:w-72 h-28 flex items-center justify-center animate-pulse">
          <Image
            src="/calviz-loader.gif"
            alt="CALVIZ - TRY IT, WEAR IT, LOVE IT"
            fill
            priority
            sizes="(max-width: 640px) 256px, 288px"
            className="object-contain drop-shadow-xs"
          />
        </div>

        {/* Minimalist Luxury Progress Bar */}
        <div className="w-44 h-0.5 bg-neutral-100 rounded-full overflow-hidden mt-6 relative">
          <div className="absolute inset-y-0 left-0 bg-black rounded-full animate-calviz-loader-bar" />
        </div>

        {/* Atelier Coordinates Status */}
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-neutral-400 font-bold mt-4 animate-pulse">
          CALVIZ  // LOADING
        </span>
      </div>
    </aside>
  );
}

export default function PageLoader() {
  return (
    <Suspense fallback={null}>
      <PageLoaderContent />
    </Suspense>
  );
}
