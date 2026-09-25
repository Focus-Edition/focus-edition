export type SubscriptionTier = 'free' | 'pro';
export type SubscriptionPlanId = 'monthly_pro' | 'annual_pro';

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  priceFormatted: string;
  period: 'month' | 'year';
  description: string;
  trialDays: number;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'monthly_pro',
    name: 'Pro Monthly',
    priceFormatted: '£4.99 / month',
    period: 'month',
    description: 'Unlimited documents, OCR for scanned PDFs & photos, multi-device cloud backup.',
    trialDays: 7
  },
  {
    id: 'annual_pro',
    name: 'Pro Annual (Best Value)',
    priceFormatted: '£39.99 / year (£3.33/mo)',
    period: 'year',
    description: 'Save 33% with annual billing. Cancel anytime with one tap.',
    trialDays: 14
  }
];

export interface SubscriptionState {
  tier: SubscriptionTier;
  isActive: boolean;
  planId?: SubscriptionPlanId;
  expiryDate?: string;
  isTestMode: boolean;
  receiptToken?: string;
}

class SubscriptionService {
  private state: SubscriptionState = {
    tier: 'free',
    isActive: false,
    isTestMode: true // Test mode enabled by default in development
  };

  public getState(): SubscriptionState {
    return { ...this.state };
  }

  public setTestMode(enabled: boolean): void {
    this.state.isTestMode = enabled;
  }

  public async purchasePlan(planId: SubscriptionPlanId): Promise<{ success: boolean; state: SubscriptionState; error?: string }> {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) {
      return { success: false, state: this.state, error: `Invalid subscription plan: "${planId}".` };
    }

    // Generate simulated App Store / Google Play receipt token
    const receiptToken = `rcpt_${this.state.isTestMode ? 'sandbox' : 'prod'}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    const expiry = new Date();
    if (plan.period === 'year') {
      expiry.setFullYear(expiry.getFullYear() + 1);
    } else {
      expiry.setMonth(expiry.getMonth() + 1);
    }

    this.state = {
      tier: 'pro',
      isActive: true,
      planId,
      expiryDate: expiry.toISOString().slice(0, 10),
      isTestMode: this.state.isTestMode,
      receiptToken
    };

    return {
      success: true,
      state: this.state
    };
  }

  public async restorePurchases(): Promise<{ restored: boolean; state: SubscriptionState }> {
    // If state has an active receipt or simulated sandbox purchase
    if (this.state.receiptToken && this.state.isActive) {
      return { restored: true, state: this.state };
    }

    // If sandbox test mode, simulate restoring Pro entitlement
    if (this.state.isTestMode) {
      this.state.tier = 'pro';
      this.state.isActive = true;
      this.state.planId = 'monthly_pro';
      this.state.receiptToken = `restored_sandbox_${Date.now()}`;
      return { restored: true, state: this.state };
    }

    return { restored: false, state: this.state };
  }

  public cancelSubscription(): void {
    this.state = {
      tier: 'free',
      isActive: false,
      isTestMode: this.state.isTestMode
    };
  }

  // Feature gate checks
  public canCreateEdition(currentCount: number): { allowed: boolean; reason?: string } {
    if (this.state.tier === 'pro' && this.state.isActive) {
      return { allowed: true };
    }

    const FREE_LIMIT = 3;
    if (currentCount >= FREE_LIMIT) {
      return {
        allowed: false,
        reason: `Free tier allows up to ${FREE_LIMIT} active editions. Upgrade to Pro for unlimited documents.`
      };
    }

    return { allowed: true };
  }

  public canUseAdvancedOcr(): { allowed: boolean; reason?: string } {
    // Allow basic OCR in test mode, or require Pro in production
    if (this.state.tier === 'pro' && this.state.isActive) {
      return { allowed: true };
    }
    if (this.state.isTestMode) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'OCR for scanned PDFs and photos requires Focus Edition Pro.'
    };
  }
}

export const subscriptionService = new SubscriptionService();
