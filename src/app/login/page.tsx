"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { customerLogin, customerRegister, customerSocialLogin } from "@/lib/api";
import { validateSafePlainText, validateSriLankanMobile } from "@/lib/sanitizer";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { ShieldCheck, ArrowRight, Lock, Mail, User, Phone, MapPin, Eye, EyeOff } from "lucide-react";

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "593576295015-dol9gfb4dcbuth3t9g6delidfo5djod7.apps.googleusercontent.com";

// Google G SVG Icon
function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}


function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";

  const { setAuth } = useAuthStore();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regCity, setRegCity] = useState("Colombo");
  const [regPostalCode, setRegPostalCode] = useState("");

  // Initialize Google Identity Services
  useEffect(() => {
    if (typeof window === "undefined" || !window.google?.accounts?.id) return;

    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
    } catch (e) {
      console.warn("Google Identity initialization error:", e);
    }
  }, []);

  const handleGoogleCredentialResponse = async (response: any) => {
    // If one-tap triggered, launch interactive token popup to obtain verified accessToken
    handleGoogleClick();
  };

  const handleGoogleClick = () => {
    setErrorMessage(null);

    if (typeof window === "undefined" || !window.google?.accounts) {
      setErrorMessage("Google Sign In service is loading. Please check your internet connection or try again in a moment.");
      return;
    }

    setSocialLoading(true);

    try {
      // Use OAuth2 Token Client for interactive Google Account selection popup
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: "email profile openid",
        callback: async (tokenResponse: any) => {
          if (tokenResponse?.error) {
            setSocialLoading(false);
            setErrorMessage(`Google authentication error: ${tokenResponse.error_description || tokenResponse.error}`);
            return;
          }

          if (!tokenResponse?.access_token) {
            setSocialLoading(false);
            setErrorMessage("Google did not return an access token. Please try again.");
            return;
          }

          try {
            // Send verified token to server for server-side Google signature validation
            const result = await customerSocialLogin({
              provider: "Google",
              accessToken: tokenResponse.access_token,
            });

            setAuth(result.customer, result.token);
            router.push(redirectUrl);
          } catch (err: any) {
            setErrorMessage(err.message || "Failed to sign in with Google.");
          } finally {
            setSocialLoading(false);
          }
        },
        error_callback: (err: any) => {
          setSocialLoading(false);
          if (err?.message) {
            setErrorMessage(err.message);
          }
        },
      });

      client.requestAccessToken({ prompt: "select_account" });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to open Google Sign In popup.");
      setSocialLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const emailErr = validateSafePlainText(loginEmail, "Email");
    if (emailErr) {
      setErrorMessage(emailErr);
      return;
    }

    setLoading(true);

    try {
      const result = await customerLogin({
        email: loginEmail,
        password: loginPassword,
      });

      setAuth(result.customer, result.token);
      router.push(redirectUrl);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to authenticate. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate inputs against HTML/script injection
    const nameErr = validateSafePlainText(regFullName, "Full Name");
    if (nameErr) { setErrorMessage(nameErr); return; }

    const emailErr = validateSafePlainText(regEmail, "Email");
    if (emailErr) { setErrorMessage(emailErr); return; }

    const phoneValidation = validateSriLankanMobile(regPhone);
    if (!phoneValidation.isValid) {
      setErrorMessage(phoneValidation.error || "Please enter a valid 9-digit mobile number starting with 7.");
      return;
    }

    if (regAddress) {
      const addrErr = validateSafePlainText(regAddress, "Street Address");
      if (addrErr) { setErrorMessage(addrErr); return; }
    }

    if (regCity) {
      const cityErr = validateSafePlainText(regCity, "City");
      if (cityErr) { setErrorMessage(cityErr); return; }
    }

    if (regPostalCode) {
      const postalErr = validateSafePlainText(regPostalCode, "Postal Code");
      if (postalErr) { setErrorMessage(postalErr); return; }
    }

    if (regPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const result = await customerRegister({
        fullName: regFullName.trim(),
        email: regEmail.trim().toLowerCase(),
        phoneNumber: phoneValidation.normalized,
        password: regPassword,
        addressLine1: regAddress.trim() || undefined,
        city: regCity.trim() || undefined,
        postalCode: regPostalCode.trim() || undefined,
      });

      setAuth(result.customer, result.token);
      router.push(redirectUrl);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create account. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-between">
      <Header />

      <main className="flex-1 max-w-lg w-full mx-auto px-4 pt-36 md:pt-44 pb-20">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 font-bold block mb-2">
            CALVIZ CLIENT PRIVILEGE ACCESS
          </span>
          <h1 className="text-2xl md:text-3xl font-black uppercase text-black tracking-tight">
            {tab === "login" ? "SIGN IN TO ATELIER" : "CREATE CLIENT PROFILE"}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-2 font-medium">
            {tab === "login"
              ? "Access order history, live tracking, and saved delivery coordinates."
              : "Register to unlock 1-click checkout, express order lookup, and drop passes."}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 bg-neutral-200/80 p-1 rounded-xl mb-6 font-mono text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setTab("login");
              setErrorMessage(null);
            }}
            className={`py-2.5 rounded-lg transition-all ${
              tab === "login"
                ? "bg-white text-black shadow-xs"
                : "text-neutral-600 hover:text-black"
            }`}
          >
            CLIENT SIGN IN
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("register");
              setErrorMessage(null);
            }}
            className={`py-2.5 rounded-lg transition-all ${
              tab === "register"
                ? "bg-white text-black shadow-xs"
                : "text-neutral-600 hover:text-black"
            }`}
          >
            CREATE ACCOUNT
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2.5 animate-fade-in">
            <span className="font-bold font-mono uppercase text-[10px] bg-red-200 px-1.5 py-0.5 rounded text-red-900 mt-0.5">
              ERROR
            </span>
            <p className="flex-1 font-medium leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* Card Form */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xl p-6 sm:p-8">
          {/* Quick Social Authentication (Google) */}
          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={socialLoading || loading}
              className="w-full py-3.5 px-4 bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-300 hover:border-neutral-400 rounded-xl font-mono text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-3 shadow-xs hover:shadow-sm disabled:opacity-50"
            >
              {socialLoading ? (
                <span className="inline-block animate-spin text-neutral-600">✦</span>
              ) : (
                <GoogleIcon className="w-4 h-4" />
              )}
              <span>CONTINUE WITH GOOGLE</span>
            </button>
          </div>

          {/* Luxury Divider */}
          <div className="relative flex items-center justify-center my-6">
            <div className="border-t border-neutral-200 w-full" />
            <span className="bg-white px-3 text-[10px] font-mono uppercase tracking-widest text-neutral-400 whitespace-nowrap">
              OR CONTINUE WITH ATELIER ID
            </span>
            <div className="border-t border-neutral-200 w-full" />
          </div>

          {tab === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="client@atelier.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-black placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-black placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black font-medium transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || socialLoading !== null}
                className="w-full py-3.5 mt-2 bg-black text-white rounded-xl font-mono text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
              >
                {loading ? (
                  <span className="inline-block animate-spin">✦</span>
                ) : (
                  <>
                    <span>AUTHENTICATE &amp; SIGN IN</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="Kasun Perera"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-black placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black font-medium transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="kasun@gmail.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-black placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black font-medium transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      placeholder="077 123 4567"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-black placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black font-medium transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Create Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-black placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black font-medium transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Delivery Coordinates (Optional) */}
              <div className="pt-2 border-t border-neutral-100 space-y-3">
                <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest font-bold block">
                  DEFAULT DELIVERY COORDINATES (OPTIONAL)
                </span>

                <div>
                  <input
                    type="text"
                    placeholder="Street Address / Suite No."
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-black placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black font-medium transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="City (e.g. Colombo)"
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-black placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black font-medium transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Postal Code"
                    value={regPostalCode}
                    onChange={(e) => setRegPostalCode(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-black placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black font-medium transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || socialLoading}
                className="w-full py-3.5 mt-2 bg-black text-white rounded-xl font-mono text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
              >
                {loading ? (
                  <span className="inline-block animate-spin">✦</span>
                ) : (
                  <>
                    <span>REGISTER CLIENT ACCOUNT</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Security Assurance Badge */}
        <div className="mt-8 flex items-center justify-center gap-2 text-neutral-500 font-mono text-[11px]">
          <ShieldCheck className="w-4 h-4 text-black" />
          <span>256-BIT ENCRYPTED CLIENT PROFILE LEDGER</span>
        </div>
      </main>

      <Footer />

      {/* Google Identity Services SDK */}
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window !== "undefined" && window.google?.accounts?.id) {
            try {
              window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleCredentialResponse,
                auto_select: false,
                cancel_on_tap_outside: true,
              });
            } catch (e) {
              console.warn("Google Identity script onLoad init error:", e);
            }
          }
        }}
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fafafa] flex items-center justify-center font-mono text-xs">LOADING CLIENT PORTAL...</div>}>
      <LoginForm />
    </Suspense>
  );
}
