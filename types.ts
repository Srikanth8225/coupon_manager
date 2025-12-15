export enum DiscountType {
  FLAT = 'FLAT',
  PERCENT = 'PERCENT',
}

export interface Eligibility {
  allowedUserTiers?: string[];
  minLifetimeSpend?: number;
  minOrdersPlaced?: number;
  firstOrderOnly?: boolean;
  allowedCountries?: string[];
  minCartValue?: number;
  applicableCategories?: string[];
  excludedCategories?: string[];
  minItemsCount?: number;
}

export interface Coupon {
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number;
  startDate: string; // ISO Date
  endDate: string; // ISO Date
  usageLimitPerUser?: number;
  eligibility?: Eligibility;
  isActive?: boolean; // Controls whether the coupon is currently usable
}

export interface CartItem {
  productId: string;
  category: string;
  unitPrice: number;
  quantity: number;
}

export interface UserContext {
  userId: string;
  userTier?: string;
  country?: string;
  lifetimeSpend?: number;
  ordersPlaced?: number;
}

export interface BestCouponResponse {
  coupon: Coupon;
  discountAmount: number;
}