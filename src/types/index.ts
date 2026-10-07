export interface ColorAttribute {
  id: string;
  name: string;
  hexCode: string;
  isActive: boolean;
  displayOrder: number;
}

export interface ProductVariant {
  id: string;
  size: string;
  sku: string;
  color?: string;
  stockQuantity: number;
  priceAdjustment: number;
  isActive: boolean;
}

export interface ProductImage {
  id: string;
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface ProductSummary {
  id: string;
  categoryId?: string;
  categoryIds?: string[];
  categoryName?: string;
  categorySlug?: string;
  categories?: { id: string; name: string; slug: string }[];
  name: string;
  slug: string;
  basePrice: number;
  gsm?: number;
  lowStockThreshold?: number;
  isFeatured: boolean;
  primaryImageUrl?: string;
  availableSizes?: string[];
  availableColors?: string[];
  totalStock?: number;
  variants: ProductVariant[];
  images: ProductImage[];
}

export interface ProductVariantDetail {
  id: string;
  size: string;
  color: string;
  colorHex?: string;
  sku: string;
  stockQuantity: number;
  priceAdjustment: number;
}

export interface SizeMeasurementRow {
  size: string;
  [key: string]: string | undefined;
}

export interface SizeChart {
  id: string;
  name: string;
  description?: string | null;
  fitType?: string | null;
  categoryHint?: string | null;
  modelStats?: string | null;
  careInstructions?: string | null;
  imageUrl?: string | null;
  measurementsJson: string;
  isDefault: boolean;
  isActive: boolean;
  displayOrder: number;
  productCount?: number;
}

export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  gsm: number;
  lowStockThreshold?: number;
  isFeatured: boolean;
  sizeChartImageUrl?: string | null;
  sizeMeasurementsJson?: string | null;
  sizeGuideNotes?: string | null;
  categoryId?: string;
  categoryIds?: string[];
  categoryName?: string;
  categorySlug?: string;
  categories?: { id: string; name: string; slug: string }[];
  variants: ProductVariantDetail[];
  images: ProductImage[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface CartItem {
  variantId: string;
  productId: string;
  productName: string;
  slug?: string;
  size: string;
  color?: string;
  unitPrice: number;
  quantity: number;
  imageUrl?: string;
  maxStock?: number;
}

export enum PaymentMethod {
  CashOnDelivery = "CashOnDelivery",
  BankTransfer = "BankTransfer",
}

export enum PaymentStatus {
  Pending = "Pending",
  Verified = "Verified",
  Paid = "Paid",
  Failed = "Failed",
}

export enum OrderStatus {
  Pending = "Pending",
  Placed = "Placed",
  Processing = "Processing",
  Shipped = "Shipped",
  Delivered = "Delivered",
  Cancelled = "Cancelled",
}

export interface OrderItemRequest {
  productVariantId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  postalCode: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  items: OrderItemRequest[];
  promoCode?: string;
}

export interface PromoValidationResult {
  isValid: boolean;
  code: string;
  title?: string;
  description?: string;
  discountType?: string;
  discountValue: number;
  calculatedDiscount: number;
  minItemQuantity: number;
  minOrderSubtotal: number;
  maxUsesPerCustomer: number;
  message?: string;
  errorMessage?: string;
}

export interface OrderConfirmation {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  invoiceNumber: string;
  bankAccountDetails?: string | null;
}

export interface OrderItemDetail {
  id: string;
  productVariantId: string;
  productName: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string | null;
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  streetAddress: string;
  city: string;
  postalCode: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  notes?: string | null;
  createdAt: string;
  invoiceNumber?: string | null;
  invoicePdfUrl?: string | null;
  bankSlipUrl?: string | null;
  bankTransferRef?: string | null;
  bankSlipApproved?: boolean | null;
  items: OrderItemDetail[];
}

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  swiftCode?: string;
  instructions?: string;
  logoUrl?: string | null;
}

export interface City {
  id?: string;
  name: string;
  district: string;
  postalCode: string;
  province?: string;
  deliveryFee?: number | null;
  estimatedDeliveryDays?: string | null;
}


export interface CheckoutConfig {
  bankDetails: BankDetails;
  standardDeliveryFee: number;
  freeDeliveryThreshold?: number | null;
  estimatedDeliveryDays: string;
  colomboEstimatedDeliveryDays?: string;
  outstationEstimatedDeliveryDays?: string;
  currency: string;
  cities: City[];
}

export interface ReviewDto {
  id: string;
  productId?: string | null;
  productName?: string | null;
  productSlug?: string | null;
  customerName: string;
  rating: number;
  reviewTitle?: string | null;
  comment: string;
  isVerifiedBuyer: boolean;
  imageUrls: string[];
  createdAt: string;
}

export interface ProductReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  reviews: ReviewDto[];
}

export interface SubmitReviewInput {
  productId?: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  rating: number;
  reviewTitle?: string | null;
  comment: string;
  imageUrls?: string[];
}

export interface LookbookBanner {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  badgeText?: string | null;
  isLarge: boolean;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
}

export interface HeroSlide {
  id: number;
  title: string;
  tag: string;
  img: string;
}

export interface HeroSectionConfig {
  id?: string;
  badgeText: string;
  locationText: string;
  titleLine1: string;
  titleLine2: string;
  titleLine3: string;
  description: string;
  primaryButtonText: string;
  primaryButtonUrl: string;
  secondaryButtonText: string;
  secondaryButtonUrl: string;
  spec1Label: string;
  spec1Value: string;
  spec2Label: string;
  spec2Value: string;
  spec3Label: string;
  spec3Value: string;
  slidesJson: string;
  isActive: boolean;
}

export interface OfferCard {
  id: number;
  icon: string;
  badge: string;
  title: string;
  description: string;
  footerTag: string;
  buttonText: string;
  buttonUrl: string;
  imageUrl: string;
}

export interface OffersSectionConfig {
  id?: string;
  tagline: string;
  title: string;
  subtitle: string;
  noteBadge: string;
  marqueeText: string;
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
  heroPromoCode: string;
  heroButtonText: string;
  heroButtonUrl: string;
  heroImageUrl: string;
  heroPerk1Title: string;
  heroPerk1Description: string;
  heroPerk2Title: string;
  heroPerk2Description: string;
  cardsJson: string;
  isActive: boolean;
}

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  avatarUrl?: string | null;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  province?: string;
  createdAt: string;
}

export interface CustomerAuthResult {
  token: string;
  customer: Customer;
  expiresAt: string;
}

export interface CustomerOrderItem {
  id: string;
  productVariantId: string;
  productName: string;
  size: string;
  color?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CustomerOrderHistory {
  id: string;
  orderNumber: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  promoCode?: string;
  totalAmount: number;
  createdAt: string;
  streetAddress: string;
  city: string;
  postalCode: string;
  items: CustomerOrderItem[];
}







