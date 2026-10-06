import {
  ProductSummary,
  ProductDetail,
  Category,
  ColorAttribute,
  CreateOrderRequest,
  OrderConfirmation,
  OrderDetail,
  BankDetails,
  City,
  CheckoutConfig,
} from "@/types";
import { validateFileMagicBytes } from "@/lib/fileValidation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5089/api";

export function getMediaUrl(url?: string | null): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }
  const origin = API_BASE.replace(/\/api\/?$/, "");
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${origin}${cleanPath}`;
}

export async function fetchProducts(categoryId?: string): Promise<ProductSummary[]> {
  try {
    const url = new URL(`${API_BASE}/products`);
    if (categoryId && categoryId !== "all" && categoryId !== "featured") {
      url.searchParams.append("category", categoryId);
    }
    const res = await fetch(url.toString(), {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      throw new Error(`Failed to load products: ${res.statusText}`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : data.items || [];
  } catch (error) {
    console.warn("Backend API unreachable:", error);
    return [];
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE}/categories`, {
      next: { revalidate: 60 },
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      throw new Error(`Failed to load categories: ${res.statusText}`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn("Backend API unreachable, using fallback categories:", error);
    return [
      { id: "all", name: "All Products", slug: "all", isActive: true },
      { id: "heavyweight-tees", name: "Heavyweight Tees", slug: "heavyweight-tees", isActive: true },
      { id: "boxy-hoodies", name: "Boxy Hoodies", slug: "boxy-hoodies", isActive: true },
      { id: "utility-pants", name: "Utility Cargo", slug: "utility-pants", isActive: true },
    ];
  }
}

export async function fetchColors(): Promise<ColorAttribute[]> {
  try {
    const res = await fetch(`${API_BASE}/colors?includeInactive=false`, {
      next: { revalidate: 60 },
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      throw new Error(`Failed to load colors: ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    console.warn("Backend colors unreachable:", error);
    return [];
  }
}

export async function fetchProductBySlug(slug: string): Promise<ProductDetail | null> {
  try {
    const res = await fetch(`${API_BASE}/products/${encodeURIComponent(slug)}`, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to load product: ${res.statusText}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.warn("Backend API unreachable for product details:", error);
    return null;
  }
}

export async function fetchCheckoutConfig(): Promise<CheckoutConfig> {
  try {
    const res = await fetch(`${API_BASE}/checkout/config`, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      throw new Error(`Failed to load checkout configuration: ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    console.warn("Backend checkout config unreachable, using default store configuration:", error);
    return {
      bankDetails: {
        bankName: "Commercial Bank of Ceylon",
        accountName: "CALVIZ APPAREL (PVT) LTD",
        accountNumber: "8010045231",
        branch: "Colombo Main Branch",
        swiftCode: "CCEYLKX",
        instructions: "Please use your Order Number or Phone Number as the deposit reference and upload the deposit receipt.",
      },
      standardDeliveryFee: 330.00,
      freeDeliveryThreshold: 15000.00,
      estimatedDeliveryDays: "2-4 Business Days",

      currency: "LKR",
      cities: [
        { name: "Colombo 01 (Fort)", district: "Colombo", postalCode: "00100", province: "Western" },
        { name: "Colombo 03 (Kollupitiya)", district: "Colombo", postalCode: "00300", province: "Western" },
        { name: "Colombo 07 (Cinnamon Gardens)", district: "Colombo", postalCode: "00700", province: "Western" },
        { name: "Dehiwala", district: "Colombo", postalCode: "10350", province: "Western" },
        { name: "Mount Lavinia", district: "Colombo", postalCode: "10370", province: "Western" },
        { name: "Nugegoda", district: "Colombo", postalCode: "10250", province: "Western" },
        { name: "Battaramulla", district: "Colombo", postalCode: "10120", province: "Western" },
        { name: "Rajagiriya", district: "Colombo", postalCode: "10107", province: "Western" },
        { name: "Gampaha", district: "Gampaha", postalCode: "11000", province: "Western" },
        { name: "Negombo", district: "Gampaha", postalCode: "11500", province: "Western" },
        { name: "Kandy", district: "Kandy", postalCode: "20000", province: "Central" },
        { name: "Galle", district: "Galle", postalCode: "80000", province: "Southern" },
        { name: "Matara", district: "Matara", postalCode: "81000", province: "Southern" },
        { name: "Kurunegala", district: "Kurunegala", postalCode: "60000", province: "North Western" },
      ],
    };
  }
}

export async function fetchCities(search?: string): Promise<City[]> {
  try {
    const url = new URL(`${API_BASE}/checkout/cities`);
    if (search) {
      url.searchParams.append("search", search);
    }
    const res = await fetch(url.toString(), {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      throw new Error(`Failed to load cities: ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    console.warn("Backend cities unreachable:", error);
    return [];
  }
}

export async function fetchBankDetails(): Promise<BankDetails> {
  try {
    const res = await fetch(`${API_BASE}/checkout/bank-details`, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      throw new Error(`Failed to load bank details: ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    console.warn("Backend bank details unreachable:", error);
    return {
      bankName: "Commercial Bank of Ceylon",
      accountName: "CALVIZ APPAREL (PVT) LTD",
      accountNumber: "8010045231",
      branch: "Colombo Main Branch",
      swiftCode: "CCEYLKX",
      instructions: "Please use your Order Number or Phone Number as the deposit reference and upload the deposit receipt.",
    };
  }
}

export async function createOrder(data: CreateOrderRequest, captchaToken?: string): Promise<OrderConfirmation> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (captchaToken) {
    headers["X-Captcha-Token"] = captchaToken;
  }

  const res = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    let errorMessage = "Unable to process your order. Please review your details and try again.";
    try {
      const errJson = await res.json();
      if (errJson.errors && typeof errJson.errors === "object") {
        const errorEntries = Object.entries(errJson.errors);
        const meaningfulErrors = errorEntries
          .flatMap(([, val]) => (Array.isArray(val) ? val : [String(val)]))
          .filter((msg) => typeof msg === "string" && msg.trim().length > 0)
          .map((msg) => {
            if (msg.includes("JSON value could not be converted") || msg.includes("productVariantId")) {
              return "An item in your bag has an outdated reference. Please remove and re-add it.";
            }
            if (msg.includes("command field is required")) {
              return "Invalid order request.";
            }
            return msg;
          });

        if (meaningfulErrors.length > 0) {
          errorMessage = meaningfulErrors.join(" • ");
        }
      } else if (errJson.detail || errJson.message) {
        errorMessage = errJson.detail || errJson.message;
      } else if (errJson.title && errJson.title !== "One or more validation errors occurred.") {
        errorMessage = errJson.title;
      }
    } catch {
      const text = await res.text().catch(() => "");
      if (text && text.length < 300) errorMessage = text;
    }
    throw new Error(errorMessage);
  }

  return await res.json();
}

export async function getOrderById(orderId: string): Promise<OrderDetail | null> {
  try {
    const res = await fetch(`${API_BASE}/orders/${orderId}`, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to load order: ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    console.warn("Backend API error retrieving order:", error);
    throw error;
  }
}

export async function trackOrder(identifier: string, contact?: string): Promise<OrderDetail | null> {
  try {
    const clean = identifier.trim();
    if (!clean) return null;
    const url = new URL(`${API_BASE}/orders/track/${encodeURIComponent(clean)}`);
    if (contact && contact.trim()) {
      url.searchParams.set("contact", contact.trim());
    }
    const res = await fetch(url.toString(), {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Tracking query failed: ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    console.warn("Backend API error tracking order:", error);
    throw error;
  }
}

export async function uploadBankTransferProof(
  orderId: string,
  file: File,
  referenceNumber?: string
): Promise<boolean> {
  // Validate magic bytes before upload
  const validation = await validateFileMagicBytes(file, { allowPdf: true, maxSizeMb: 15 });
  if (!validation.isValid) {
    throw new Error(validation.error || "File security check failed.");
  }

  const formData = new FormData();
  formData.append("file", file);
  if (referenceNumber) {
    formData.append("referenceNumber", referenceNumber);
  }

  const res = await fetch(`${API_BASE}/orders/${orderId}/bank-transfer-proof`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Failed to upload payment slip.");
    throw new Error(errorText || "Failed to upload payment slip.");
  }

  const result = await res.json().catch(() => true);
  return result;
}

export function getInvoiceDownloadUrl(orderId: string): string {
  return `${API_BASE}/orders/${orderId}/invoice`;
}

// ---------------------------------------------------------------------------
// CUSTOMER REVIEWS API
// ---------------------------------------------------------------------------

export async function fetchApprovedReviews(params?: {
  productId?: string;
  productSlug?: string;
  limit?: number;
}): Promise<import("@/types").ProductReviewSummary> {
  const url = new URL(`${API_BASE}/reviews`);
  if (params?.productId) url.searchParams.set("productId", params.productId);
  if (params?.productSlug) url.searchParams.set("productSlug", params.productSlug);
  if (params?.limit) url.searchParams.set("limit", String(params.limit));

  const res = await fetch(url.toString(), {
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Failed to load reviews: ${res.statusText}`);
  }

  return await res.json();
}

export async function submitCustomerReview(
  input: import("@/types").SubmitReviewInput,
  captchaToken?: string
): Promise<{ reviewId: string; message: string }> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (captchaToken) {
    headers["X-Captcha-Token"] = captchaToken;
  }

  const res = await fetch(`${API_BASE}/reviews`, {
    method: "POST",
    headers,
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    let errorMessage = "Unable to submit your review. Please verify your details and try again.";
    try {
      const errJson = await res.json();
      if (errJson.errors && typeof errJson.errors === "object") {
        const errorEntries = Object.entries(errJson.errors);
        const meaningfulErrors = errorEntries
          .flatMap(([, val]) => (Array.isArray(val) ? val : [String(val)]))
          .filter((msg) => typeof msg === "string" && msg.trim().length > 0);
        if (meaningfulErrors.length > 0) {
          errorMessage = meaningfulErrors.join(" • ");
        }
      } else if (errJson.detail && !errJson.detail.includes("internal server error")) {
        errorMessage = errJson.detail;
      } else if (errJson.message) {
        errorMessage = errJson.message;
      }
    } catch {
      const text = await res.text().catch(() => "");
      if (text && text.length < 200 && !text.startsWith("{")) {
        errorMessage = text;
      }
    }
    throw new Error(errorMessage);
  }

  return await res.json();
}

export async function uploadReviewPhoto(file: File): Promise<{ imageUrl: string; relativePath: string }> {
  // Validate magic bytes before upload (images only)
  const validation = await validateFileMagicBytes(file, { allowPdf: false, maxSizeMb: 15 });
  if (!validation.isValid) {
    throw new Error(validation.error || "File security check failed.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/reviews/upload-photo`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Failed to upload photo.");
    throw new Error(errorText || "Failed to upload photo.");
  }

  return await res.json();
}

export async function fetchLookbookBanners(): Promise<import("@/types").LookbookBanner[]> {
  try {
    const res = await fetch(`${API_BASE}/lookbooks`, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      console.warn("Failed to fetch lookbook banners, returning empty array");
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn("Error loading lookbook banners:", error);
    return [];
  }
}

export async function fetchHeroSection(): Promise<import("@/types").HeroSectionConfig | null> {
  try {
    const res = await fetch(`${API_BASE}/herosection`, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });

    if (res.status === 404) return null;
    if (!res.ok) {
      console.warn("Failed to fetch hero section from backend");
      return null;
    }

    return await res.json();
  } catch (error) {
    console.warn("Error loading hero section:", error);
    return null;
  }
}

export async function fetchOffersSection(): Promise<import("@/types").OffersSectionConfig | null> {
  try {
    const res = await fetch(`${API_BASE}/offerssection`, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });

    if (res.status === 404) return null;
    if (!res.ok) {
      console.warn("Failed to fetch offers section from backend");
      return null;
    }

    return await res.json();
  } catch (error) {
    console.warn("Error loading offers section:", error);
    return null;
  }
}

export async function validatePromoCode(
  code: string,
  items: Array<{ productVariantId: string; quantity: number }>,
  customerPhone?: string,
  customerEmail?: string
): Promise<import("@/types").PromoValidationResult> {
  try {
    const res = await fetch(`${API_BASE}/promocodes/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        items,
        customerPhone: customerPhone || undefined,
        customerEmail: customerEmail || undefined,
      }),
    });

    if (!res.ok) {
      return {
        isValid: false,
        code,
        discountValue: 0,
        calculatedDiscount: 0,
        minItemQuantity: 0,
        minOrderSubtotal: 0,
        maxUsesPerCustomer: 0,
        errorMessage: `Failed to validate promo code (${res.status})`,
      };
    }

    return await res.json();
  } catch (err: unknown) {
    return {
      isValid: false,
      code,
      discountValue: 0,
      calculatedDiscount: 0,
      minItemQuantity: 0,
      minOrderSubtotal: 0,
      maxUsesPerCustomer: 0,
      errorMessage: err instanceof Error ? err.message : "Unable to reach validation server.",
    };
  }
}

// Customer Authentication & Profile API
export async function customerRegister(
  data: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    postalCode?: string;
    province?: string;
  },
  captchaToken?: string
): Promise<import("@/types").CustomerAuthResult> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (captchaToken) {
    headers["X-Captcha-Token"] = captchaToken;
  }

  const res = await fetch(`${API_BASE}/customer/auth/register`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg =
      body.detail ||
      body.message ||
      (body.errors ? Object.values(body.errors).flat().join(", ") : "") ||
      "Failed to register account.";
    throw new Error(errorMsg);
  }
  return body;
}

export async function customerLogin(
  credentials: {
    email: string;
    password: string;
  },
  captchaToken?: string
): Promise<import("@/types").CustomerAuthResult> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (captchaToken) {
    headers["X-Captcha-Token"] = captchaToken;
  }

  const res = await fetch(`${API_BASE}/customer/auth/login`, {
    method: "POST",
    headers,
    body: JSON.stringify(credentials),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg =
      body.detail ||
      body.message ||
      (body.errors ? Object.values(body.errors).flat().join(", ") : "") ||
      "Invalid email or password.";
    throw new Error(errorMsg);
  }
  return body;
}

export async function customerSocialLogin(payload: {
  provider: string;
  accessToken: string;
}): Promise<import("@/types").CustomerAuthResult> {
  const res = await fetch(`${API_BASE}/customer/auth/social-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg =
      body.detail ||
      body.message ||
      `Failed to sign in with ${payload.provider}.`;
    throw new Error(errorMsg);
  }
  return body;
}

export async function fetchCustomerProfile(token: string): Promise<import("@/types").Customer> {
  const res = await fetch(`${API_BASE}/customer/profile`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || "Failed to load customer profile.");
  }
  return body;
}

export async function updateCustomerProfile(
  token: string,
  data: {
    fullName: string;
    phoneNumber: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    postalCode?: string;
    province?: string;
  }
): Promise<import("@/types").Customer> {
  const res = await fetch(`${API_BASE}/customer/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.message || "Failed to update profile.");
  }
  return body;
}

export async function fetchCustomerOrders(token: string): Promise<import("@/types").CustomerOrderHistory[]> {
  const res = await fetch(`${API_BASE}/customer/orders`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    return [];
  }
  return await res.json();
}

export async function fetchSizeCharts(): Promise<import("@/types").SizeChart[]> {
  try {
    const res = await fetch(`${API_BASE}/sizecharts?includeInactive=false`, {
      next: { revalidate: 60 },
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      return [];
    }
    return await res.json();
  } catch (error) {
    console.warn("Backend size charts unreachable:", error);
    return [];
  }
}









