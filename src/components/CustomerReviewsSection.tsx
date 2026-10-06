"use client";

import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { fetchApprovedReviews, submitCustomerReview, uploadReviewPhoto } from "@/lib/api";
import { ReviewDto, ProductReviewSummary, SubmitReviewInput } from "@/types";

interface CustomerReviewsSectionProps {
  productId?: string;
  productSlug?: string;
  productName?: string;
}

export default function CustomerReviewsSection({
  productId,
  productSlug,
  productName = "Calviz Garment",
}: CustomerReviewsSectionProps) {
  const [data, setData] = useState<ProductReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);

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
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const res = await fetchApprovedReviews({
        productId,
        productSlug,
        limit: 20,
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

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

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !comment.trim()) {
      setSubmitError("Please fill out your Name, Phone Number, and Review text.");
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
        customerPhone: customerPhone.trim(),
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
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setReviewTitle("");
      setComment("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit review. Please try again.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const ratingDescriptions: Record<number, string> = {
    5: "Exceptional - True heavyweight luxury drape & cut",
    4: "Great Quality - Premium fabric & good fit",
    3: "Average - Standard cotton feel",
    2: "Below Expectations",
    1: "Poor Experience",
  };

  // Extract all customer photos for the media reel
  const allCustomerPhotos = data?.reviews?.flatMap((r) => r.imageUrls) || [];

  return (
    <section className="w-full py-16 border-t border-neutral-200 bg-[#fdfdfd]" id="customer-reviews">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-200 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white text-[10px] font-mono uppercase tracking-widest mb-3">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Verified Patron Experiences</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-950">
              Customer Reviews & Community Drape
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 font-mono mt-1">
              Real unfiltered feedback and customer photography wearing the {productName}.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSubmitSuccess(false);
              setSubmitError(null);
              setIsModalOpen(true);
            }}
            className="px-6 py-3.5 bg-black text-white hover:bg-neutral-800 transition-all font-mono text-xs uppercase tracking-wider font-bold shrink-0 flex items-center justify-center gap-2 shadow-sm"
          >
            <Camera className="w-4 h-4 text-amber-400" />
            <span>Write a Review & Add Photos</span>
          </button>
        </div>

        {/* Rating Breakdown Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-10 items-center">
          {/* Big Score Card */}
          <div className="lg:col-span-4 p-8 bg-neutral-950 text-white flex flex-col justify-between rounded-none border border-neutral-900 shadow-xl">
            <div>
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-2">
                OVERALL VERIFIED SCORE
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white">
                  {data?.totalReviews ? data.averageRating.toFixed(1) : "5.0"}
                </span>
                <span className="text-neutral-500 font-mono text-sm">/ 5.0</span>
              </div>

              {/* Gold Star Stack */}
              <div className="flex items-center gap-1 mt-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${star <= Math.round(data?.averageRating || 5)
                        ? "fill-amber-400 text-amber-400"
                        : "text-neutral-700"
                      }`}
                  />
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-neutral-800/80 mt-8 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Genuine Verified Purchases</span>
              </div>
              <p className="text-[11px] font-mono text-neutral-400 leading-relaxed">
                Based on {data?.totalReviews || 0} registered patron submissions. Every review is manually authenticated with contact verification.
              </p>
            </div>
          </div>

          {/* Star Distribution Bars */}
          <div className="lg:col-span-5 space-y-3 px-2">
            <span className="text-[11px] font-mono uppercase text-neutral-500 tracking-wider block mb-1">
              Rating Distribution
            </span>
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = data?.ratingDistribution?.[stars] || (stars === 5 ? (data?.totalReviews || 0) : 0);
              const percent = data?.totalReviews ? Math.round((count / data.totalReviews) * 100) : stars === 5 ? 100 : 0;

              return (
                <div key={stars} className="flex items-center gap-3 text-xs font-mono">
                  <div className="w-12 text-neutral-800 font-bold flex items-center gap-1 shrink-0">
                    <span>{stars}</span>
                    <Star className="w-3 h-3 fill-black text-black inline" />
                  </div>
                  <div className="flex-1 bg-neutral-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-neutral-950 h-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="w-14 text-right text-neutral-500 text-[11px] shrink-0">
                    {percent}% ({count})
                  </div>
                </div>
              );
            })}
          </div>

          {/* Guaranteed Attributes Card */}
          <div className="lg:col-span-3 p-6 bg-neutral-100 border border-neutral-200 space-y-4">
            <span className="text-[10px] font-mono uppercase text-neutral-500 tracking-widest block">
              PATRON HIGHLIGHTS
            </span>
            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex items-center gap-2 text-neutral-900">
                <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                <span>Zero Collar Sagging After Wash</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-900">
                <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                <span>Heavyweight Boxy Drape</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-900">
                <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                <span>Breathable In Colombo Humidity</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-900">
                <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
                <span>Dispatched Within 24-48 Hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Photography Gallery Reel (if photos exist) */}
        {allCustomerPhotos.length > 0 && (
          <div className="py-6 border-t border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-black" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-black">
                  Customer Fit Photos ({allCustomerPhotos.length})
                </h3>
              </div>
              <span className="text-[11px] font-mono text-neutral-400">Click to enlarge</span>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar scroll-smooth">
              {allCustomerPhotos.map((photoUrl, idx) => (
                <div
                  key={idx}
                  onClick={() => setLightboxPhoto(photoUrl)}
                  className="relative w-28 sm:w-36 aspect-3/4 shrink-0 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 group cursor-pointer hover:border-black transition-all shadow-xs"
                >
                  <img
                    src={photoUrl}
                    alt={`Customer photo ${idx + 1}`}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Cards Feed */}
        <div className="pt-8 border-t border-neutral-200 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold uppercase tracking-tight text-neutral-950">
              Patron Reviews ({data?.reviews?.length || 0})
            </h3>
            <span className="text-xs font-mono text-neutral-400">Showing verified feedback</span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-neutral-400 font-mono text-xs">
              <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading verified reviews...
            </div>
          ) : !data?.reviews || data.reviews.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-neutral-300 p-8 space-y-3 bg-neutral-50/50">
              <MessageSquare className="w-8 h-8 text-neutral-400 mx-auto" />
              <h4 className="text-sm font-bold uppercase text-neutral-800">No published reviews yet</h4>
              <p className="text-xs text-neutral-500 font-mono max-w-md mx-auto">
                Be the first to review this garment. Share your thoughts on fabric weight, fit, and collar resilience to help the community.
              </p>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="mt-2 px-5 py-2.5 bg-black text-white text-xs font-mono uppercase font-bold hover:bg-neutral-800 transition-colors"
              >
                Submit First Review
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-6 bg-white border border-neutral-200 space-y-4 hover:border-black transition-all shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Top User Info & Stars */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${s <= rev.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-neutral-300"
                              }`}
                          />
                        ))}
                      </div>

                      <span className="text-[11px] font-mono text-neutral-400">
                        {new Date(rev.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Customer Identification */}
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-neutral-900 uppercase">
                        {rev.customerName}
                      </span>
                      {rev.isVerifiedBuyer && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono uppercase rounded">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          Verified Buyer
                        </span>
                      )}
                    </div>

                    {/* Review Title & Content */}
                    {rev.reviewTitle && (
                      <h4 className="text-sm font-bold text-black font-sans leading-tight">
                        &quot;{rev.reviewTitle}&quot;
                      </h4>
                    )}
                    <p className="text-xs sm:text-sm text-neutral-700 font-sans leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>

                  {/* Attached Photos */}
                  {rev.imageUrls && rev.imageUrls.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[10px] font-mono text-neutral-400 uppercase block mb-1.5">
                        Customer Photo Uploads
                      </span>
                      <div className="flex gap-2">
                        {rev.imageUrls.map((imgUrl, i) => (
                          <div
                            key={i}
                            onClick={() => setLightboxPhoto(imgUrl)}
                            className="relative w-16 h-20 rounded overflow-hidden border border-neutral-200 bg-neutral-100 group cursor-pointer hover:border-black transition-all"
                          >
                            <img
                              src={imgUrl}
                              alt="Review attachment"
                              className="w-full h-full object-cover object-top"
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
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* WRITE A REVIEW MODAL DRAWER                                              */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white border border-neutral-300 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-black p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {submitSuccess ? (
              /* Success Confirmation */
              <div className="text-center py-8 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold uppercase tracking-tight text-neutral-950">
                  Review Submitted for Verification
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 font-mono max-w-md mx-auto leading-relaxed">
                  Thank you for submitting your feedback on <strong className="text-black">{productName}</strong>. Our atelier team will verify your submission and publish it to the community reviews gallery shortly.
                </p>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 bg-black text-white font-mono text-xs uppercase font-bold hover:bg-neutral-800 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Review Submission Form */
              <form onSubmit={handleSubmitReview} className="space-y-6">
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">
                    COMMUNITY FEEDBACK
                  </span>
                  <h3 className="text-xl font-black uppercase tracking-tight text-neutral-950">
                    Review {productName}
                  </h3>
                  <p className="text-xs text-neutral-500 font-mono mt-0.5">
                    Share your experience with fit, fabric drape, and collar durability.
                  </p>
                </div>

                {submitError && (
                  <div className="p-3.5 bg-red-50/90 border border-red-200 text-red-700 text-xs font-mono flex items-start gap-2.5 rounded">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-bold uppercase tracking-wider text-red-800">Review Submission Notice</p>
                      <p className="text-red-700 font-sans text-xs leading-relaxed">
                        {submitError.startsWith("{")
                          ? "Unable to submit your review at this time. Please verify your details and try again."
                          : submitError}
                      </p>
                    </div>
                  </div>
                )}

                {/* Rating Stars Selector */}
                <div className="space-y-2 p-4 bg-neutral-50 border border-neutral-200">
                  <label className="text-xs font-mono uppercase font-bold text-neutral-900 block">
                    Your Overall Rating *
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 cursor-pointer transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-7 h-7 ${star <= (hoverRating || rating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-neutral-300"
                            }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-mono text-neutral-600 ml-2">
                      {ratingDescriptions[hoverRating || rating]}
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
                      className="w-full px-3 py-2 text-xs border border-neutral-300 focus:outline-none focus:border-black font-sans"
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
                      placeholder="077XXXXXXX (Order verification)"
                      className="w-full px-3 py-2 text-xs border border-neutral-300 focus:outline-none focus:border-black font-mono"
                    />
                    <span className="text-[10px] font-mono text-neutral-400 block">
                      Used by admin to confirm verified customer purchase.
                    </span>
                  </div>
                </div>

                {/* Review Headline & Body */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase font-semibold text-neutral-800 block">
                      Headline / Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      placeholder="e.g. Best heavyweight t-shirt in Sri Lanka!"
                      className="w-full px-3 py-2 text-xs border border-neutral-300 focus:outline-none focus:border-black font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase font-semibold text-neutral-800 block">
                      Detailed Review & Feedback *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share how the shirt fits, the fabric weight, neck ribbing hold after washes, and overall drape..."
                      className="w-full px-3 py-2 text-xs border border-neutral-300 focus:outline-none focus:border-black font-sans leading-relaxed"
                    />
                  </div>
                </div>

                {/* Photo Uploads with Drag & Drop & Live Previews */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase font-semibold text-neutral-800 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-neutral-500" />
                      Upload Fit & Fabric Photos
                    </label>
                    <span className="text-[10px] font-mono text-neutral-400">Multiple images permitted</span>
                  </div>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />

                  {/* Upload Box */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-neutral-300 hover:border-black bg-neutral-50 p-5 rounded text-center transition-all cursor-pointer group flex flex-col items-center justify-center gap-1.5"
                  >
                    <UploadCloud className="w-6 h-6 text-neutral-400 group-hover:text-black transition-colors" />
                    <span className="text-xs font-bold text-neutral-900">
                      Click to Select Photos from Device
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500">
                      PNG, JPG, WebP supported
                    </span>
                  </div>

                  {/* Selected Photos Grid Preview */}
                  {selectedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {selectedFiles.map((item, index) => (
                        <div
                          key={index}
                          className="relative w-16 h-20 rounded overflow-hidden border border-neutral-300 bg-neutral-100 group"
                        >
                          <img
                            src={item.previewUrl}
                            alt="Selected upload"
                            className="w-full h-full object-cover object-top"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemovePhoto(index);
                            }}
                            className="absolute top-1 right-1 p-1 bg-black/80 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex items-center justify-end gap-3 border-t border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-mono uppercase font-semibold text-neutral-600 hover:text-black"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-black text-white font-mono text-xs uppercase font-bold hover:bg-neutral-800 transition-all flex items-center gap-2 shadow-sm disabled:bg-neutral-400"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Uploading & Submitting...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Send className="w-3.5 h-3.5" />
                        Submit Review for Approval
                      </span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Full Photo Lightbox Modal */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setLightboxPhoto(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-black p-2 rounded-lg overflow-hidden shadow-2xl">
            <button
              type="button"
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 text-white hover:bg-white hover:text-black transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxPhoto}
              alt="Customer submission full view"
              className="max-h-[80vh] w-auto mx-auto object-contain rounded"
            />
          </div>
        </div>
      )}
    </section>
  );
}
