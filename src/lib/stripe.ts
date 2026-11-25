import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder";

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-02-24.acacia" as any,
  appInfo: {
    name: "MindBalance AI Psychology Coach",
    version: "1.0.0",
  },
});

export const STRIPE_PRO_PLAN = {
  name: "MindBalance Pro",
  description: "Неограниченная практика с AI коучем, глубинная деконструкция ошибок, проверка шагов действий и доступ ко всем 3 этапам обучения.",
  priceUsd: 19,
  priceRub: 1490,
  priceId: process.env.STRIPE_PRO_PRICE_ID || "price_pro_monthly",
};

export const isMockPaymentsEnabled =
  process.env.NEXT_PUBLIC_MOCK_PAYMENTS === "true" ||
  !process.env.STRIPE_SECRET_KEY ||
  process.env.STRIPE_SECRET_KEY.includes("placeholder") ||
  process.env.STRIPE_SECRET_KEY.includes("Mock");
