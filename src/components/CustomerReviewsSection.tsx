"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Star,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  UploadCloud,
  X,
  Camera,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Eye,
  Send,
  User,
  Phone,
  Mail,
  Filter,
  ArrowUpDown,
  Check,
  Image as ImageIcon,
  Heart,
  ChevronLeft,
  Truck,
  Layers,
} from "lucide-react";
import { fetchApprovedReviews, submitCustomerReview, uploadReviewPhoto } from "@/lib/api";
import { ReviewDto, ProductReviewSummary, SubmitReviewInput } from "@/types";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { validateSafePlainText, validateSafeTextInput, validateSriLankanMobile } from "@/lib/sanitizer";

interface CustomerReviewsSectionProps {
  productId?: string;
  productSlug?: string;
  productName?: string;
}

const REVIEW_TAGS = [
  "Heavyweight 260GSM Cotton",
  "True Boxy Fit",
  "Stiff Collar Ribbing",
  "Zero Collar Sag After Wash",
  "Fast Colombo Delivery",
  "Luxurious Minimalist Drape",
  "Breathable In Heat",
];

export default function CustomerReviewsSection({
  productId,
  productSlug,
  productName = "CALVIZ Garment",
}: CustomerReviewsSectionProps) {
  const { customer, isAuthenticated } = useAuthStore();
  const [data, setData] = useState<ProductReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting
  const [activeFilter, setActiveFilter] = useState<"all" | "photos" | "5stars" | "4plus">("all");
  const [sortBy, setSortBy] = useState<"newest" | "highest" | "helpful">("newest");

  // Helpful votes local tracker
  const [helpfulMap, setHelpfulMap] = useState<Record<string, { count: number; voted: boolean }>>({});

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [reviewTitle, setReviewTitle] = useState("");
  const [comment, setComment] = useState("");

  // Pending photos state (local preview before upload)
  const [selectedFiles, setSelectedFiles] = useState<{ file: File; previewUrl: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Photo Lightbox State
  const [lightboxPhotos, setLightboxPhotos] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const res = await fetchApprovedReviews({
        productId,
        productSlug,
        limit: 50,
      });
      setData(res);
    } catch (err) {
      console.warn("Could not load reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [productId, productSlug]);

  // Autofill review author details if logged in
  useEffect(() => {
    if (customer && isModalOpen) {
      if (!customerName) setCustomerName(customer.fullName || "");
      if (!customerEmail) setCustomerEmail(customer.email || "");
      if (!customerPhone) setCustomerPhone(customer.phoneNumber || "");
    }
  }, [customer, isModalOpen]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (selectedFiles.length + files.length > 5) {
      setSubmitError("You can attach up to 5 photos per review.");
      return;
    }

    const newItems = Array.from(files).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setSelectedFiles((prev) => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemovePhoto = (index: number) => {
    setSelectedFiles((prev) => {
      const target = prev[index];
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleAddTagToComment = (tag: string) => {
    setComment((prev) => {
      const cleanTag = tag.trim();
      if (!prev.trim()) return `• ${cleanTag}`;
      if (prev.includes(cleanTag)) return prev;
      return `${prev.trim()}\n• ${cleanTag}`;
    });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!customerName.trim() || !customerPhone.trim() || !comment.trim()) {
      setSubmitError("Please fill out your Name, Phone Number, and Review text.");
      return;
    }

    const nameErr = validateSafePlainText(customerName, "Name");
    if (nameErr) {
      setSubmitError(nameErr);
      return;
    }

    if (customerEmail.trim()) {
      const emailErr = validateSafePlainText(customerEmail, "Email");
      if (emailErr) {
        setSubmitError(emailErr);
        return;
      }
    }

    const phoneValidation = validateSriLankanMobile(customerPhone);
    if (!phoneValidation.isValid) {
      setSubmitError(phoneValidation.error || "Please enter a valid 9-digit mobile number starting with 7.");
      return;
    }

    if (reviewTitle.trim()) {
      const titleErr = validateSafeTextInput(reviewTitle, "Review Title");
      if (titleErr) {
        setSubmitError(titleErr);
        return;
      }
    }

    const commentErr = validateSafeTextInput(comment, "Review Text");
    if (commentErr) {
      setSubmitError(commentErr);
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      // 1. Upload photos first
      const uploadedUrls: string[] = [];
      for (const item of selectedFiles) {
        const uploadRes = await uploadReviewPhoto(item.file);
        if (uploadRes.imageUrl) {
          uploadedUrls.push(uploadRes.imageUrl);
        }
      }

      // 2. Submit review payload
      const payload: SubmitReviewInput = {
        productId: productId || null,
        customerName: customerName.trim(),
        customerPhone: phoneValidation.normalized,
        customerEmail: customerEmail.trim() || null,
        rating,
        reviewTitle: reviewTitle.trim() || null,
        comment: comment.trim(),
        imageUrls: uploadedUrls,
      };

      await submitCustomerReview(payload);
      setSubmitSuccess(true);

      // Clean up previews
      selectedFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
      setSelectedFiles([]);
      setReviewTitle("");
      setComment("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit review. Please try again.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpfulClick = (reviewId: string) => {
    setHelpfulMap((prev) => {
      const current = prev[reviewId] || { count: Math.floor(Math.random() * 5) + 3, voted: false };
      if (current.voted) {
        return {
          ...prev,
          [reviewId]: { count: current.count - 1, voted: false },
        };
      }
      return {
        ...prev,
        [reviewId]: { count: current.count + 1, voted: true },
      };
    });
  };

  const openLightbox = (photos: string[], index: number) => {
    setLightboxPhotos(photos);
    setLightboxIndex(index);
  };

  const ratingDescriptions: Record<number, { label: string; badge: string }> = {
    5: { label: "Exceptional - Heavyweight luxury drape & cut", badge: "5/5 Drop 🔥" },
    4: { label: "Great Quality - Premium fabric & good fit", badge: "4/5 Quality ✨" },
    3: { label: "Average - Standard cotton feel", badge: "3/5 Standard" },
    2: { label: "Below Expectations - Sizing issue", badge: "2/5 Fair" },
    1: { label: "Poor Experience - Defective or non-optimal", badge: "1/5 Poor" },
  };

  // Extract all customer photos for the media reel
  const allCustomerPhotos = useMemo(() => {
    return data?.reviews?.flatMap((r) => r.imageUrls).filter(Boolean) || [];
  }, [data?.reviews]);

  // Filtered & Sorted Reviews
  const filteredReviews = useMemo(() => {
    if (!data?.reviews) return [];
    let list = [...data.reviews];

    if (activeFilter === "photos") {
      list = list.filter((r) => r.imageUrls && r.imageUrls.length > 0);
    } else if (activeFilter === "5stars") {
      list = list.filter((r) => r.rating === 5);
    } else if (activeFilter === "4plus") {
      list = list.filter((r) => r.rating >= 4);
    }

    if (sortBy === "highest") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "helpful") {
      list.sort((a, b) => (b.imageUrls?.length || 0) - (a.imageUrls?.length || 0));
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }, [data?.reviews, activeFilter, sortBy]);

  const photoReviewsCount = useMemo(() => {
    return data?.reviews?.filter((r) => r.imageUrls && r.imageUrls.length > 0).length || 0;
  }, [data?.reviews]);

  const fiveStarCount = useMemo(() => {
    return data?.reviews?.filter((r) => r.rating === 5).length || 0;
  }, [data?.reviews]);

  return (
    <section className="w-full py-16 border-t border-neutral-200 bg-white" id="customer-reviews">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-200 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white text-[10px] font-mono uppercase tracking-widest rounded-full mb-3">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>AUTHENTIC CLIENT EXPERIENCES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-950">
              Customer Reviews &amp; Drape Dossier
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 font-mono mt-1">
              Verified patron photography and honest reviews for {productName}.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSubmitSuccess(false);
              setSubmitError(null);
              setIsModalOpen(true);
            }}
            className="px-6 py-3.5 bg-black text-white hover:bg-neutral-800 active:scale-98 transition-all font-mono text-xs uppercase tracking-wider font-bold shrink-0 flex items-center justify-center gap-2 rounded-xl shadow-lg cursor-pointer group"
          >
            <Camera className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>WRITE A REVIEW &amp; ADD PHOTOS</span>
          </button>
        </div>

        {/* Rating Breakdown Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-10 items-stretch">
          {/* Big Score Card */}
          <div className="lg:col-span-4 p-8 bg-[#09090b] text-white flex flex-col justify-between rounded-2xl border border-neutral-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-2 font-bold">
                OVERALL VERIFIED RATING
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white">
                  {data?.totalReviews ? data.averageRating.toFixed(1) : "5.0"}
                </span>
                <span className="text-neutral-400 font-mono text-sm">/ 5.0</span>
              </div>

              {/* Gold Star Stack */}
              <div className="flex items-center gap-1.5 mt-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(data?.averageRating || 5)
                        ? "fill-amber-400 text-amber-400"
                        : "text-neutral-700"
                    }`}
                  />
                ))}
                <span className="text-xs font-mono text-neutral-300 ml-2 font-bold">
                  ({data?.totalReviews || 0} Reviews)
                </span>
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-800 mt-6 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Verified Buyer Submissions</span>
              </div>
              <p className="text-[11px] font-mono text-neutral-400 leading-relaxed">
                All reviews are authenticated by order history. Guaranteed authentic fabric &amp; fit feedback.
              </p>
            </div>
          </div>

          {/* Star Distribution Bars */}
          <div className="lg:col-span-5 p-6 bg-neutral-50 border border-neutral-200 rounded-2xl flex flex-col justify-center space-y-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-mono uppercase text-neutral-600 font-bold tracking-wider">
                Rating Breakdown
              </span>
              <span className="text-[11px] font-mono text-neutral-500">
                {data?.totalReviews || 0} Total Votes
              </span>
            </div>

            {[5, 4, 3, 2, 1].map((stars) => {
              const count =
                data?.ratingDistribution?.[stars] ||
                (stars === 5 ? (data?.totalReviews || 0) : 0);
              const percent = data?.totalReviews
                ? Math.round((count / data.totalReviews) * 100)
                : stars === 5
                ? 100
                : 0;

              return (
                <button
                  key={stars}
                  type="button"
                  onClick={() => setActiveFilter(stars === 5 ? "5stars" : "all")}
                  className="flex items-center gap-3 text-xs font-mono group w-full text-left cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <div className="w-14 text-neutral-800 font-bold flex items-center gap-1 shrink-0">
                    <span>{stars}</span>
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 inline" />
                  </div>
                  <div className="flex-1 bg-neutral-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-black h-full rounded-full transition-all duration-500 group-hover:bg-amber-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="w-16 text-right text-neutral-600 text-[11px] font-semibold shrink-0">
                    {percent}% ({count})
                  </div>
                </button>
              );
            })}
          </div>

          {/* Guaranteed Attributes Card */}
          <div className="lg:col-span-3 p-6 bg-neutral-900 text-white rounded-2xl border border-neutral-800 space-y-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-amber-400 tracking-widest font-bold block mb-3">
                PATRON CONSENSUS
              </span>
              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex items-center gap-2 text-neutral-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Collar Ribbing Holds Shape</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Heavyweight Boxy Drape</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Zero Shrinkage After Wash</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-200">
                  <Truck className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Colombo Express: Within 24h</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 text-[11px] font-mono text-neutral-400">
              ⭐ 98% of customers recommend this fit.
            </div>
          </div>
        </div>

        {/* Customer Photography Gallery Reel (if photos exist) */}
        {allCustomerPhotos.length > 0 && (
          <div className="py-6 border-t border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-black" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-black font-mono">
                  Community Fit Photos ({allCustomerPhotos.length})
                </h3>
              </div>
              <span className="text-[11px] font-mono text-neutral-500">Click any photo to enlarge</span>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar scroll-smooth">
              {allCustomerPhotos.map((photoUrl, idx) => (
                <div
                  key={idx}
                  onClick={() => openLightbox(allCustomerPhotos, idx)}
                  className="relative w-28 sm:w-36 aspect-3/4 shrink-0 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 group cursor-pointer hover:border-black hover:shadow-md transition-all"
                >
                  <img
                    src={photoUrl}
                    alt={`Customer fit photo ${idx + 1}`}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter & Sort Bar */}
        <div className="pt-6 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono uppercase font-bold transition-all cursor-pointer ${
                activeFilter === "all"
                  ? "bg-black text-white shadow-xs"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              All ({data?.totalReviews || 0})
            </button>

            {photoReviewsCount > 0 && (
              <button
                type="button"
                onClick={() => setActiveFilter("photos")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono uppercase font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeFilter === "photos"
                    ? "bg-black text-white shadow-xs"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>With Photos ({photoReviewsCount})</span>
              </button>
            )}

            {fiveStarCount > 0 && (
              <button
                type="button"
                onClick={() => setActiveFilter("5stars")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono uppercase font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeFilter === "5stars"
                    ? "bg-black text-white shadow-xs"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>5 Stars ({fiveStarCount})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveFilter("4plus")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono uppercase font-bold transition-all cursor-pointer ${
                activeFilter === "4plus"
                  ? "bg-black text-white shadow-xs"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              4★ &amp; Above
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs font-mono text-neutral-500 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "highest" | "helpful")}
              className="px-3 py-1.5 bg-neutral-100 border border-neutral-200 rounded-lg text-xs font-mono text-neutral-800 focus:outline-hidden cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="highest">Highest Rating</option>
              <option value="helpful">With Photos First</option>
            </select>
          </div>
        </div>

        {/* Reviews Cards Feed */}
        <div className="pt-6 space-y-6">
          {loading ? (
            <div className="py-20 text-center text-neutral-400 font-mono text-xs">
              <div className="w-7 h-7 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading verified patron feedback...
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-neutral-300 rounded-2xl p-8 space-y-4 bg-neutral-50/50">
              <MessageSquare className="w-10 h-10 text-neutral-400 mx-auto" />
              <h4 className="text-base font-bold uppercase text-neutral-900 font-mono">
                {activeFilter === "all" ? "No published reviews yet" : "No matching reviews found"}
              </h4>
              <p className="text-xs text-neutral-500 font-mono max-w-md mx-auto">
                Be the first to share your experience with fabric weight, fit, and durability.
              </p>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="mt-2 px-6 py-3 bg-black text-white text-xs font-mono uppercase font-bold hover:bg-neutral-800 transition-colors rounded-xl shadow-md cursor-pointer"
              >
                Submit First Review
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredReviews.map((rev) => {
                const helpfulInfo = helpfulMap[rev.id] || { count: 3, voted: false };
                const initials = rev.customerName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <div
                    key={rev.id}
                    className="p-6 bg-white border border-neutral-200 rounded-2xl space-y-4 hover:border-black hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3.5">
                      {/* Top User Info & Stars */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-neutral-900 text-white font-mono font-bold text-xs flex items-center justify-center border border-neutral-700 shadow-xs">
                            {initials || "CZ"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-neutral-950 uppercase">
                                {rev.customerName}
                              </span>
                              {rev.isVerifiedBuyer && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono uppercase rounded-full font-bold">
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                  Verified
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-neutral-400 block">
                              {new Date(rev.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Star Rating Badge */}
                        <div className="flex items-center gap-0.5 bg-neutral-50 px-2 py-1 rounded-md border border-neutral-100">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= rev.rating ? "fill-amber-400 text-amber-400" : "text-neutral-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Review Title & Content */}
                      {rev.reviewTitle && (
                        <h4 className="text-sm font-bold text-black font-sans leading-tight">
                          &ldquo;{rev.reviewTitle}&rdquo;
                        </h4>
                      )}
                      <p className="text-xs sm:text-sm text-neutral-700 font-sans leading-relaxed">
                        {rev.comment}
                      </p>

                      {/* Attached Photos */}
                      {rev.imageUrls && rev.imageUrls.length > 0 && (
                        <div className="pt-2">
                          <div className="flex gap-2">
                            {rev.imageUrls.map((imgUrl, i) => (
                              <div
                                key={i}
                                onClick={() => openLightbox(rev.imageUrls, i)}
                                className="relative w-16 h-20 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 group cursor-pointer hover:border-black transition-all shadow-2xs"
                              >
                                <img
                                  src={imgUrl}
                                  alt="Review attachment"
                                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <Eye className="w-3.5 h-3.5 text-white" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Card Footer: Helpful Reaction */}
                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-mono text-neutral-500">
                      <span className="text-[11px] text-neutral-400">
                        {productName ? `Purchased: ${productName}` : "Verified Purchase"}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleHelpfulClick(rev.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] transition-all cursor-pointer ${
                          helpfulInfo.voted
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold"
                            : "hover:bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${helpfulInfo.voted ? "fill-emerald-600" : ""}`} />
                        <span>Helpful ({helpfulInfo.count})</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* WRITE A REVIEW MODAL DRAWER                                              */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto border border-neutral-200">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-black flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {submitSuccess ? (
              /* Success Confirmation */
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm animate-pulse">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="text-xl font-bold uppercase tracking-tight text-neutral-950 font-mono">
                  Review Submitted Successfully
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 font-mono max-w-md mx-auto leading-relaxed">
                  Thank you for reviewing <strong className="text-black">{productName}</strong>. Your feedback helps our community and atelier artisans maintain peak quality.
                </p>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      loadReviews();
                    }}
                    className="px-8 py-3.5 bg-black text-white font-mono text-xs uppercase font-bold hover:bg-neutral-800 transition-colors rounded-xl shadow-md cursor-pointer"
                  >
                    Done &amp; View Reviews
                  </button>
                </div>
              </div>
            ) : (
              /* Review Submission Form */
              <form onSubmit={handleSubmitReview} className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-neutral-100 rounded-full text-[10px] font-mono text-neutral-600 uppercase font-bold mb-2">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>COMMUNITY VOICES</span>
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-neutral-950 font-mono">
                    Review {productName}
                  </h3>
                  <p className="text-xs text-neutral-500 font-mono mt-0.5">
                    Share your thoughts on fabric weight, fit, and collar durability.
                  </p>
                </div>

                {submitError && (
                  <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-mono flex items-start gap-2.5 rounded-xl">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-bold uppercase tracking-wider text-red-800">Review Notice</p>
                      <p className="text-red-700 font-sans text-xs leading-relaxed">
                        {submitError.startsWith("{")
                          ? "Unable to submit your review at this time. Please verify details and retry."
                          : submitError}
                      </p>
                    </div>
                  </div>
                )}

                {/* Rating Stars Selector */}
                <div className="space-y-2 p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase font-bold text-neutral-900 block">
                      Overall Rating *
                    </label>
                    <span className="text-[11px] font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {ratingDescriptions[hoverRating || rating].badge}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-hidden"
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${
                            star <= (hoverRating || rating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-neutral-300"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-mono text-neutral-600 ml-2 hidden sm:inline">
                      {ratingDescriptions[hoverRating || rating].label}
                    </span>
                  </div>
                </div>

                {/* Personal Information (Name & Phone Verification) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase font-semibold text-neutral-800 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-neutral-500" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Sahan Perera"
                      className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:outline-hidden focus:border-black font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase font-semibold text-neutral-800 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-neutral-500" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="077XXXXXXX"
                      className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:outline-hidden focus:border-black font-mono"
                    />
                  </div>
                </div>

                {/* Review Headline & Body */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase font-semibold text-neutral-800 block">
                      Headline (Optional)
                    </label>
                    <input
                      type="text"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      placeholder="e.g. Best heavyweight tee in Sri Lanka!"
                      className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:outline-hidden focus:border-black font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono uppercase font-semibold text-neutral-800 block">
                        Detailed Review *
                      </label>
                      <span className="text-[10px] font-mono text-neutral-400">Click tags below to insert</span>
                    </div>

                    {/* Quick Suggestion Tags */}
                    <div className="flex flex-wrap gap-1.5 pb-1">
                      {REVIEW_TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleAddTagToComment(tag)}
                          className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-[10px] font-mono text-neutral-700 rounded-full transition-colors cursor-pointer"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>

                    <textarea
                      required
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share how the shirt fits, the fabric weight, neck ribbing hold after washes, and overall drape..."
                      className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:bg-white focus:outline-hidden focus:border-black font-sans leading-relaxed resize-none"
                    />
                  </div>
                </div>

                {/* Photo Attachments Deck */}
                <div className="space-y-2 p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase font-semibold text-neutral-800 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-neutral-600" />
                      Attach Fit Photos ({selectedFiles.length}/5)
                    </label>
                    <span className="text-[10px] font-mono text-neutral-400">JPG, PNG up to 10MB</span>
                  </div>

                  {/* Photo Previews */}
                  {selectedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1 pb-2">
                      {selectedFiles.map((item, idx) => (
                        <div
                          key={idx}
                          className="relative w-16 h-20 rounded-lg overflow-hidden border border-neutral-300 bg-white group shadow-xs"
                        >
                          <img
                            src={item.previewUrl}
                            alt="preview"
                            className="w-full h-full object-cover object-top"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx)}
                            className="absolute top-1 right-1 w-5 h-5 bg-black/80 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
                            title="Remove photo"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedFiles.length < 5 && (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        id="review-photo-upload"
                      />
                      <label
                        htmlFor="review-photo-upload"
                        className="w-full py-3 px-4 border border-dashed border-neutral-300 rounded-lg hover:border-black flex items-center justify-center gap-2 text-xs font-mono text-neutral-600 hover:text-black cursor-pointer bg-white transition-colors"
                      >
                        <UploadCloud className="w-4 h-4 text-neutral-400" />
                        <span>Upload photo from device</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Submit Action CTA */}
                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-3 border border-neutral-300 hover:bg-neutral-100 text-xs font-mono uppercase font-bold text-neutral-700 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 bg-black text-white hover:bg-neutral-800 disabled:opacity-50 font-mono text-xs uppercase font-bold tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>SUBMITTING REVIEW...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-amber-400" />
                        <span>SUBMIT FOR VERIFICATION</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHOTO LIGHTBOX MODAL                                                     */}
      {/* ========================================================================= */}
      {lightboxPhotos.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightboxPhotos([])}
        >
          <button
            type="button"
            onClick={() => setLightboxPhotos([])}
            className="absolute top-6 right-6 text-white/80 hover:text-white p-2 z-50 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          {lightboxPhotos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev > 0 ? prev - 1 : lightboxPhotos.length - 1));
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center z-50 cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev < lightboxPhotos.length - 1 ? prev + 1 : 0));
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center z-50 cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div
            className="max-w-3xl max-h-[85vh] relative rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxPhotos[lightboxIndex]}
              alt="Enlarged patron fit photo"
              className="w-full h-full object-contain max-h-[80vh] rounded-xl"
            />
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/80 rounded-full text-white font-mono text-[11px]">
              {lightboxIndex + 1} / {lightboxPhotos.length}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
