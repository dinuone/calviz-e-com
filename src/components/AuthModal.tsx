"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useWishlistStore } from "@/lib/store/useWishlistStore";
import { useAuthModalStore } from "@/lib/store/useAuthModalStore";
import { customerLogin, customerRegister, customerSocialLogin } from "@/lib/api";
import { validateSafePlainText, validateSriLankanMobile } from "@/lib/sanitizer";

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "593576295015-dol9gfb4dcbuth3t9g6delidfo5djod7.apps.googleusercontent.com";

export default function AuthModal() {
  const { isOpen, tab, title, description, closeModal, setTab, onSuccessCallback } =
    useAuthModalStore();
  const { setAuth } = useAuthStore();
  const { pendingProductId, addItem, setPendingProduct } = useWishlistStore();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reset errors when modal opens/closes or tab changes
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen, tab]);

  if (!isOpen) return null;

  const handlePostAuthSuccess = (customer: any, token: string) => {
    setAuth(customer, token);
    if (pendingProductId) {
      addItem(pendingProductId);
      setPendingProduct(null);
      setSuccessMessage("Signed in successfully. Product saved to your wishlist!");
    } else {
      setSuccessMessage("Welcome back! Signed in successfully.");
    }

    if (onSuccessCallback) {
      onSuccessCallback();
    }

    setTimeout(() => {
      closeModal();
      setSuccessMessage(null);
    }, 1200);
  };

  const handleGoogleClick = () => {
    setErrorMessage(null);
    if (typeof window === "undefined" || !window.google?.accounts) {
      setErrorMessage("Google Sign In service is initializing. Please try again in a moment.");
      return;
    }

    setSocialLoading(true);

    try {
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
            setErrorMessage("Google did not return a valid session token.");
            return;
          }

          try {
            const result = await customerSocialLogin({
              provider: "Google",
              accessToken: tokenResponse.access_token,
            });

            handlePostAuthSuccess(result.customer, result.token);
          } catch (err: any) {
            setErrorMessage(err.message || "Failed to sign in with Google.");
          } finally {
            setSocialLoading(false);
          }
        },
        error_callback: (err: any) => {
          setSocialLoading(false);
          if (err?.message) setErrorMessage(err.message);
        },
      });

      client.requestAccessToken({ prompt: "select_account" });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to launch Google Sign In popup.");
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

      handlePostAuthSuccess(result.customer, result.token);
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const nameErr = validateSafePlainText(regFullName, "Full Name");
    if (nameErr) { setErrorMessage(nameErr); return; }

    const emailErr = validateSafePlainText(regEmail, "Email");
    if (emailErr) { setErrorMessage(emailErr); return; }

    const phoneValidation = validateSriLankanMobile(regPhone);
    if (!phoneValidation.isValid) {
      setErrorMessage(phoneValidation.error || "Please enter a valid 9-digit mobile number starting with 7.");
      return;
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
      });

      handlePostAuthSuccess(result.customer, result.token);
    } catch (err: any) {
      setErrorMessage(err.message || "Registration failed. Please check your information.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <div className="relative w-full max-w-md bg-white border border-neutral-200 shadow-2xl overflow-hidden rounded-none animate-scale-up">
        {/* Top Architectural Accent Bar */}
        <div className="h-1 bg-black w-full" />

        {/* Close Button */}
        <button
          onClick={closeModal}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-black transition-colors z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-neutral-100 border border-neutral-200 text-[10px] font-mono tracking-widest text-neutral-700 uppercase mb-2">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>CALVIZ CLIENT</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-950 font-mono">
              {title || (tab === "login" ? "SIGN IN TO ATELIER" : "CREATE CLIENT PROFILE")}
            </h2>
            <p className="text-xs text-neutral-500 font-mono mt-1">
              {description ||
                (tab === "login"
                  ? "Access your private wishlist, curated orders, and priority capsule drops."
                  : "Register to unlock client privileges, doorstep tracking, and wishlist syncing.")}
            </p>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-neutral-100 border border-neutral-200 mb-5">
            <button
              type="button"
              onClick={() => {
                setTab("login");
                setErrorMessage(null);
              }}
              className={`py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${tab === "login"
                  ? "bg-black text-white shadow-xs"
                  : "text-neutral-600 hover:text-black"
                }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("register");
                setErrorMessage(null);
              }}
              className={`py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${tab === "register"
                  ? "bg-black text-white shadow-xs"
                  : "text-neutral-600 hover:text-black"
                }`}
            >
              New Client
            </button>
          </div>

          {/* Success Notification */}
          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Notification */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-mono flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Google One-Click Auth */}
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={socialLoading || loading}
            className="w-full mb-4 py-3 px-4 bg-white border border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 text-neutral-800 text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-3 cursor-pointer shadow-xs disabled:opacity-50"
          >
            {socialLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            )}
            <span>Continue with Google</span>
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono">
              <span className="bg-white px-3 text-neutral-400">or with email</span>
            </div>
          </div>

          {/* Form */}
          {tab === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-mono uppercase text-neutral-600 font-bold mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="client@calviz.lk"
                    className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-300 text-black text-xs font-mono focus:bg-white focus:outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-neutral-600 font-bold mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 bg-neutral-50 border border-neutral-300 text-black text-xs font-mono focus:bg-white focus:outline-none focus:border-black transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-black text-white text-xs font-mono font-bold uppercase tracking-widest hover:bg-neutral-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Wishlist</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono uppercase text-neutral-600 font-bold mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="Kasun Perera"
                    className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 text-black text-xs font-mono focus:bg-white focus:outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-600 font-bold mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="client@calviz.lk"
                      className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 text-black text-xs font-mono focus:bg-white focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-600 font-bold mb-1">
                    Mobile Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="0771234567"
                      className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 text-black text-xs font-mono focus:bg-white focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-neutral-600 font-bold mb-1">
                  Password (min 8 characters)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type={showRegPassword ? "text" : "password"}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2 bg-neutral-50 border border-neutral-300 text-black text-xs font-mono focus:bg-white focus:outline-none focus:border-black transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black cursor-pointer"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-black text-white text-xs font-mono font-bold uppercase tracking-widest hover:bg-neutral-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Create Client Profile</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
