"use client";

import React, { useState, useEffect, useCallback } from "react";
import MaintenanceModeView from "@/components/MaintenanceModeView";
import ComingSoonModeView from "@/components/ComingSoonModeView";

interface SiteModeGatekeeperProps {
  children: React.ReactNode;
}

interface SiteModeData {
  mode: "LIVE" | "MAINTENANCE" | "COMING_SOON";
  headline?: string;
  message?: string;
  targetDateUtc?: string;
  enableVipSignup?: boolean;
  supportPhone?: string;
}

export default function SiteModeGatekeeper({ children }: SiteModeGatekeeperProps) {
  const [siteMode, setSiteMode] = useState<SiteModeData | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSiteMode = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5089/api";
      const res = await fetch(`${apiUrl}/sitemode`, { 
        cache: "no-store",
        headers: { "Pragma": "no-cache" }
      });
      if (res.ok) {
        const data = await res.json();
        setSiteMode(data);
      }
    } catch {
      // Default to live store if probe fails
      setSiteMode((prev) => prev || { mode: "LIVE" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSiteMode();

    // Re-check every 10 seconds for real-time mode transitions
    const interval = setInterval(checkSiteMode, 10000);

    // Re-check on window focus or visibility change
    const onFocus = () => checkSiteMode();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [checkSiteMode]);

  // If still checking initial state, allow children
  if (loading || !siteMode) {
    return <>{children}</>;
  }

  if (siteMode.mode === "MAINTENANCE") {
    return (
      <MaintenanceModeView
        headline={siteMode.headline}
        message={siteMode.message}
        targetDateUtc={siteMode.targetDateUtc}
        enableVipSignup={siteMode.enableVipSignup}
        supportPhone={siteMode.supportPhone}
      />
    );
  }

  if (siteMode.mode === "COMING_SOON") {
    return (
      <ComingSoonModeView
        headline={siteMode.headline}
        message={siteMode.message}
        targetDateUtc={siteMode.targetDateUtc}
        enableVipSignup={siteMode.enableVipSignup}
        supportPhone={siteMode.supportPhone}
      />
    );
  }

  return <>{children}</>;
}


