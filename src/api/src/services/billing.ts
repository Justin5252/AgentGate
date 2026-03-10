import Stripe from "stripe";
import { eq } from "drizzle-orm";
import type { Database } from "../db/index.js";
import { schema } from "../db/index.js";
import type { BillingInterval, BillingPlan, Subscription } from "@agentgate/shared";

const PLANS = {
  free: {
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    agentLimit: 5,
    evalLimit: 10_000,
    stripePriceId: null,
    features: [
      "Up to 5 agents",
      "10,000 evaluations/month",
      "Basic audit logs",
      "Community support",
    ],
  },
  pro: {
    name: "Pro",
    monthlyPrice: 49900,
    yearlyPrice: 478800,
    agentLimit: -1,
    evalLimit: 1_000_000,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || null,
    features: [
      "Unlimited agents",
      "1M evaluations/month",
      "Advanced anomaly detection",
      "A2A governance",
      "Priority support",
      "Custom policies",
    ],
  },
  enterprise: {
    name: "Enterprise",
    monthlyPrice: 0,
    yearlyPrice: 0,
    agentLimit: -1,
    evalLimit: -1,
    stripePriceId: null,
    features: [
      "Unlimited agents",
      "Unlimited evaluations",
      "Dedicated infrastructure",
      "SSO & SAML",
      "SLA guarantee",
      "24/7 support",
      "Custom integrations",
    ],
  },
} as const;

type PlanKey = keyof typeof PLANS;

export class BillingService {
  private stripe: Stripe | null;

  constructor(private db: Database) {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    this.stripe = stripeKey ? new Stripe(stripeKey) : null;

    if (!this.stripe) {
      console.warn("[BillingService] No STRIPE_SECRET_KEY set — running in local/demo mode. Checkout and portal will return null URLs.");
    }
  }

  getPlans(): BillingPlan[] {
    const plans: BillingPlan[] = [];

    for (const [id, plan] of Object.entries(PLANS)) {
      // Monthly variant
      plans.push({
        id,
        name: plan.name,
        price: plan.monthlyPrice,
        interval: "monthly",
        agentLimit: plan.agentLimit,
        evalLimit: plan.evalLimit,
        features: [...plan.features],
      });

      // Yearly variant (only if different from monthly)
      if (plan.yearlyPrice !== plan.monthlyPrice) {
        plans.push({
          id,
          name: plan.name,
          price: plan.yearlyPrice,
          interval: "yearly",
          agentLimit: plan.agentLimit,
          evalLimit: plan.evalLimit,
          features: [...plan.features],
        });
      }
    }

    return plans;
  }

  async createCheckout(
    tenantId: string,
    plan: string,
    interval: BillingInterval = "monthly",
    successUrl: string,
    cancelUrl: string,
  ): Promise<{ url: string | null; message?: string }> {
    if (!this.stripe) {
      return { url: null, message: "Stripe is not configured. Set STRIPE_SECRET_KEY to enable billing." };
    }

    const planConfig = PLANS[plan as PlanKey];
    if (!planConfig) {
      throw new Error(`Unknown plan: ${plan}`);
    }

    if (plan === "free") {
      return { url: null, message: "Free plan does not require checkout." };
    }

    if (plan === "enterprise") {
      return { url: null, message: "Enterprise plan requires contacting sales." };
    }

    const priceId = planConfig.stripePriceId;
    if (!priceId) {
      return { url: null, message: "Stripe price ID not configured for this plan." };
    }

    // Check for existing Stripe customer
    let stripeCustomerId: string | undefined;
    const existing = await this.db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.tenantId, tenantId))
      .limit(1);

    if (existing.length > 0) {
      stripeCustomerId = existing[0].stripeCustomerId;
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { tenantId, plan, interval },
    };

    if (stripeCustomerId) {
      sessionParams.customer = stripeCustomerId;
    }

    const session = await this.stripe.checkout.sessions.create(sessionParams);
    return { url: session.url };
  }

  async createBillingPortal(
    tenantId: string,
    returnUrl: string,
  ): Promise<{ url: string | null; message?: string }> {
    if (!this.stripe) {
      return { url: null, message: "Stripe is not configured. Set STRIPE_SECRET_KEY to enable billing." };
    }

    const existing = await this.db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.tenantId, tenantId))
      .limit(1);

    if (existing.length === 0 || !existing[0].stripeCustomerId) {
      return { url: null, message: "No billing account found for this tenant." };
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: existing[0].stripeCustomerId,
      return_url: returnUrl,
    });

    return { url: session.url };
  }

  async handleWebhook(payload: string, signature: string): Promise<void> {
    if (!this.stripe) {
      throw new Error("Stripe is not configured.");
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");
    }

    const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const tenantId = session.metadata?.tenantId;
        const plan = session.metadata?.plan || "pro";

        if (!tenantId) {
          console.error("[BillingService] checkout.session.completed missing tenantId in metadata");
          return;
        }

        const stripeCustomerId = typeof session.customer === "string"
          ? session.customer
          : session.customer?.id || "";
        const stripeSubscriptionId = typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id || null;

        // Look up subscription details from Stripe
        let periodStart: Date | null = null;
        let periodEnd: Date | null = null;

        if (stripeSubscriptionId && this.stripe) {
          const sub = await this.stripe.subscriptions.retrieve(stripeSubscriptionId);
          // In Stripe v20+, period dates are on subscription items
          const firstItem = sub.items?.data?.[0];
          if (firstItem) {
            periodStart = new Date(firstItem.current_period_start * 1000);
            periodEnd = new Date(firstItem.current_period_end * 1000);
          }
        }

        // Upsert subscription record
        const existing = await this.db
          .select()
          .from(schema.subscriptions)
          .where(eq(schema.subscriptions.tenantId, tenantId))
          .limit(1);

        if (existing.length > 0) {
          await this.db
            .update(schema.subscriptions)
            .set({
              stripeCustomerId,
              stripeSubscriptionId,
              plan,
              status: "active",
              currentPeriodStart: periodStart,
              currentPeriodEnd: periodEnd,
              cancelAtPeriodEnd: false,
            })
            .where(eq(schema.subscriptions.tenantId, tenantId));
        } else {
          await this.db.insert(schema.subscriptions).values({
            id: crypto.randomUUID(),
            tenantId,
            stripeCustomerId,
            stripeSubscriptionId,
            plan,
            status: "active",
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd: false,
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeSubId = subscription.id;

        // In Stripe v20+, period dates are on subscription items
        const firstItem = subscription.items?.data?.[0];
        const updateData: Record<string, unknown> = {
          status: this.mapStripeStatus(subscription.status),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        };
        if (firstItem) {
          updateData.currentPeriodStart = new Date(firstItem.current_period_start * 1000);
          updateData.currentPeriodEnd = new Date(firstItem.current_period_end * 1000);
        }

        await this.db
          .update(schema.subscriptions)
          .set(updateData)
          .where(eq(schema.subscriptions.stripeSubscriptionId, stripeSubId));
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeSubId = subscription.id;

        await this.db
          .update(schema.subscriptions)
          .set({ status: "canceled" })
          .where(eq(schema.subscriptions.stripeSubscriptionId, stripeSubId));
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        // In Stripe v20+, subscription is accessed via parent.subscription_details
        const subDetails = invoice.parent?.subscription_details;
        const subRef = subDetails?.subscription;
        const stripeSubId = typeof subRef === "string"
          ? subRef
          : subRef?.id || null;

        if (stripeSubId) {
          await this.db
            .update(schema.subscriptions)
            .set({ status: "past_due" })
            .where(eq(schema.subscriptions.stripeSubscriptionId, stripeSubId));
        }
        break;
      }

      default:
        // Unhandled event type — ignore silently
        break;
    }
  }

  async getSubscription(tenantId: string): Promise<Subscription | null> {
    const rows = await this.db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.tenantId, tenantId))
      .limit(1);

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      id: row.id,
      tenantId: row.tenantId,
      stripeCustomerId: row.stripeCustomerId,
      stripeSubscriptionId: row.stripeSubscriptionId,
      plan: row.plan,
      status: row.status as Subscription["status"],
      currentPeriodStart: row.currentPeriodStart?.toISOString() ?? new Date().toISOString(),
      currentPeriodEnd: row.currentPeriodEnd?.toISOString() ?? new Date().toISOString(),
      cancelAtPeriodEnd: row.cancelAtPeriodEnd,
      createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
    };
  }

  async cancelSubscription(tenantId: string): Promise<void> {
    const rows = await this.db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.tenantId, tenantId))
      .limit(1);

    if (rows.length === 0) {
      throw new Error("No subscription found for this tenant.");
    }

    const sub = rows[0];

    // Cancel in Stripe (at period end)
    if (this.stripe && sub.stripeSubscriptionId) {
      await this.stripe.subscriptions.update(sub.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    }

    // Update local record
    await this.db
      .update(schema.subscriptions)
      .set({ cancelAtPeriodEnd: true })
      .where(eq(schema.subscriptions.tenantId, tenantId));
  }

  private mapStripeStatus(
    status: Stripe.Subscription.Status,
  ): Subscription["status"] {
    switch (status) {
      case "active":
        return "active";
      case "past_due":
        return "past_due";
      case "canceled":
        return "canceled";
      case "trialing":
        return "trialing";
      default:
        return "active";
    }
  }
}
