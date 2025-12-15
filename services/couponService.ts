import { Coupon, UserContext, CartItem, DiscountType, BestCouponResponse } from '../types';

class CouponService {
  private coupons: Map<string, Coupon> = new Map();
  // Usage tracking: couponCode -> userId -> count
  private usageMap: Map<string, Map<string, number>> = new Map();

  constructor() {
    // Seed some demo coupons
    this.createCoupon({
      code: 'WELCOME10',
      description: 'Flat ₹10 off for new users',
      discountType: DiscountType.FLAT,
      discountValue: 10,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 86400000 * 30).toISOString(), // +30 days
      eligibility: {
        minCartValue: 50,
        firstOrderOnly: true,
      },
    });

    this.createCoupon({
      code: 'SUMMER20',
      description: '20% off on Electronics',
      discountType: DiscountType.PERCENT,
      discountValue: 20,
      maxDiscountAmount: 50,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 86400000 * 7).toISOString(),
      eligibility: {
        applicableCategories: ['electronics'],
      },
    });
    
    this.createCoupon({
      code: 'VIP50',
      description: 'Flat ₹50 off for Gold/Platinum users on high value orders',
      discountType: DiscountType.FLAT,
      discountValue: 50,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 86400000 * 60).toISOString(),
      eligibility: {
        allowedUserTiers: ['Gold', 'Platinum'],
        minCartValue: 200,
      },
    });
  }

  createCoupon(coupon: Coupon): void {
    if (this.coupons.has(coupon.code)) {
      throw new Error(`Coupon with code ${coupon.code} already exists.`);
    }
    this.coupons.set(coupon.code, coupon);
  }

  getAllCoupons(): Coupon[] {
    return Array.from(this.coupons.values());
  }

  recordUsage(code: string, userId: string) {
     if (!this.coupons.has(code)) return;
     const couponUsage = this.usageMap.get(code) || new Map();
     const current = couponUsage.get(userId) || 0;
     couponUsage.set(userId, current + 1);
     this.usageMap.set(code, couponUsage);
  }

  private getUserUsage(code: string, userId: string): number {
    return this.usageMap.get(code)?.get(userId) || 0;
  }

  findBestCoupon(user: UserContext, cart: CartItem[]): BestCouponResponse | null {
    const applicableCoupons: { coupon: Coupon; discountAmount: number }[] = [];
    const now = new Date();

    for (const coupon of this.coupons.values()) {
      // 1. Date Validation
      const start = new Date(coupon.startDate);
      const end = new Date(coupon.endDate);
      if (now < start || now > end) continue;

      // 2. Usage Limit Validation
      if (coupon.usageLimitPerUser !== undefined) {
        const usage = this.getUserUsage(coupon.code, user.userId);
        if (usage >= coupon.usageLimitPerUser) continue;
      }

      // 3. Eligibility Rules
      const { eligibility } = coupon;
      if (eligibility) {
        // User-based
        if (eligibility.allowedUserTiers && eligibility.allowedUserTiers.length > 0) {
          if (!user.userTier || !eligibility.allowedUserTiers.includes(user.userTier)) continue;
        }
        if (eligibility.minLifetimeSpend !== undefined) {
          if ((user.lifetimeSpend || 0) < eligibility.minLifetimeSpend) continue;
        }
        if (eligibility.minOrdersPlaced !== undefined) {
          if ((user.ordersPlaced || 0) < eligibility.minOrdersPlaced) continue;
        }
        if (eligibility.firstOrderOnly) {
          // Assuming first order means 0 previous orders
          if ((user.ordersPlaced || 0) > 0) continue;
        }
        if (eligibility.allowedCountries && eligibility.allowedCountries.length > 0) {
          if (!user.country || !eligibility.allowedCountries.includes(user.country)) continue;
        }

        // Cart-based calculations
        const cartTotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
        const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

        if (eligibility.minCartValue !== undefined) {
          if (cartTotal < eligibility.minCartValue) continue;
        }
        if (eligibility.minItemsCount !== undefined) {
          if (cartItemsCount < eligibility.minItemsCount) continue;
        }

        if (eligibility.applicableCategories && eligibility.applicableCategories.length > 0) {
           const hasApplicable = cart.some(item => eligibility.applicableCategories!.includes(item.category));
           if (!hasApplicable) continue;
        }
      }

      // 4. Compute Discount
      let discountAmount = 0;
      const cartTotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      
      // Determine eligible items for discount calculation
      const eligibleItems = cart.filter(item => {
        if (eligibility?.excludedCategories?.includes(item.category)) return false;
        if (eligibility?.applicableCategories && eligibility.applicableCategories.length > 0) {
          return eligibility.applicableCategories.includes(item.category);
        }
        return true;
      });

      const eligibleTotal = eligibleItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

      if (coupon.discountType === DiscountType.FLAT) {
        // Flat discount applies to the whole order if conditions met
        discountAmount = coupon.discountValue;
      } else {
        // Percent discount applies to eligible total
        discountAmount = (eligibleTotal * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount) {
          discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
        }
      }

      // Cap discount at cart total to avoid negative payment
      discountAmount = Math.min(discountAmount, cartTotal);
      
      applicableCoupons.push({ coupon, discountAmount });
    }

    if (applicableCoupons.length === 0) return null;

    // 5. Select Best Coupon
    // - Highest discount
    // - Tie: Earliest endDate
    // - Tie: Lexicographically smallest code
    applicableCoupons.sort((a, b) => {
      if (b.discountAmount !== a.discountAmount) {
        return b.discountAmount - a.discountAmount; // Descending discount
      }
      
      const endA = new Date(a.coupon.endDate).getTime();
      const endB = new Date(b.coupon.endDate).getTime();
      if (endA !== endB) {
        return endA - endB; // Ascending end date
      }

      return a.coupon.code.localeCompare(b.coupon.code); // Ascending code
    });

    return applicableCoupons[0];
  }
}

export const couponService = new CouponService();