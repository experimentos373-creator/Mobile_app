const crypto = require("crypto");
const Stripe = require("stripe");

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
const APP_BASE_URL = process.env.APP_BASE_URL || "https://eduhub.vercel.app";
const MAX_BILLING_BODY_BYTES = Number(process.env.MAX_BILLING_BODY_BYTES || 64 * 1024);
const MAX_STRIPE_WEBHOOK_BODY_BYTES = Number(
  process.env.MAX_STRIPE_WEBHOOK_BODY_BYTES || 1024 * 1024
);

const DEFAULT_ALLOWED_ORIGINS = [
  "https://eduhub.vercel.app",
  "https://www.eduhub.com.br",
  "https://mobileapp-taupe.vercel.app",
  "http://localhost:3000",
  "http://localhost:4173"
];

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || DEFAULT_ALLOWED_ORIGINS.join(","))
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const PLAN_FIELD_BY_KEY = {
  basico: "STRIPE_PRICE_BASICO_MONTHLY",
  basico_monthly: "STRIPE_PRICE_BASICO_MONTHLY",
  basico_mensal: "STRIPE_PRICE_BASICO_MONTHLY",
  basico_semestral: "STRIPE_PRICE_BASICO_SEMESTRAL",
  pro: "STRIPE_PRICE_PRO_MONTHLY",
  pro_monthly: "STRIPE_PRICE_PRO_MONTHLY",
  pro_mensal: "STRIPE_PRICE_PRO_MONTHLY",
  pro_semestral: "STRIPE_PRICE_PRO_SEMESTRAL",
  plus: "STRIPE_PRICE_PLUS_MONTHLY",
  plus_monthly: "STRIPE_PRICE_PLUS_MONTHLY",
  plus_mensal: "STRIPE_PRICE_PLUS_MONTHLY",
  plus_semestral: "STRIPE_PRICE_PLUS_SEMESTRAL"
};

// Fallback inline prices (BRL cents) used when STRIPE_PRICE_* env vars are not configured.
const INLINE_PRICE_CENTS_BY_PLAN = {
  basico: {
    monthly: 1990,
    semestral: 7960
  },
  pro: {
    monthly: 4990,
    semestral: 19960
  },
  plus: {
    monthly: 6490,
    semestral: 25960
  }
};
const ALLOWED_PLAN_IDS = new Set(["basico", "pro", "plus"]);

let stripeClient = null;

function getStripe() {
  if (!stripeClient) {
    stripeClient = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20"
    });
  }
  return stripeClient;
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  setSecurityHeaders(res);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function setSecurityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Cache-Control", "no-store");
}

function appendVaryHeader(res, value) {
  const currentValue =
    typeof res.getHeader === "function"
      ? res.getHeader("Vary")
      : (res.headers && (res.headers.Vary || res.headers.vary)) || "";
  const entries = String(currentValue || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  if (!entries.includes(value)) entries.push(value);
  if (entries.length > 0) res.setHeader("Vary", entries.join(", "));
}

function isPayloadTooLarge(req, maxBytes = MAX_BILLING_BODY_BYTES) {
  const contentLength = Number(req.headers["content-length"] || 0);
  return Number.isFinite(contentLength) && contentLength > maxBytes;
}

function readBody(req) {
  if (isPayloadTooLarge(req)) return null;

  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string" && req.body.trim()) {
    if (Buffer.byteLength(req.body, "utf8") > MAX_BILLING_BODY_BYTES) {
      return null;
    }
    try {
      return JSON.parse(req.body);
    } catch (error) {
      return null;
    }
  }
  return null;
}

async function getRawBody(req) {
  if (typeof req.body === "string") return req.body;
  if (Buffer.isBuffer(req.body)) return req.body.toString("utf8");
  if (req.body && typeof req.body === "object") return JSON.stringify(req.body);

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
  }

  return Buffer.concat(chunks).toString("utf8");
}

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;
  return header.slice(7).trim();
}

function getOrigin(req) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost:3000";
  return `${proto}://${host}`;
}

function normalizeBaseUrl(rawValue) {
  const value = String(rawValue || "").trim();
  if (!value) return "";
  try {
    const parsed = new URL(value);
    if (!["https:", "http:"].includes(parsed.protocol)) return "";
    if (parsed.protocol === "http:" && parsed.hostname !== "localhost" && parsed.hostname !== "127.0.0.1") {
      return "";
    }
    parsed.hash = "";
    parsed.search = "";
    return parsed.toString().replace(/\/$/, "");
  } catch (error) {
    return "";
  }
}

function getAppBaseUrl(req) {
  const configuredBase = normalizeBaseUrl(process.env.BILLING_APP_BASE_URL || process.env.APP_BASE_URL);
  if (configuredBase) return configuredBase;

  const requestOrigin = normalizeBaseUrl(getOrigin(req));
  if (isOriginAllowed(requestOrigin)) return requestOrigin;
  return normalizeBaseUrl(APP_BASE_URL) || DEFAULT_ALLOWED_ORIGINS[0];
}

function getRequestOrigin(req) {
  return String(req.headers.origin || "").trim();
}

function isOriginAllowed(origin) {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some((allowedOrigin) => allowedOrigin === origin);
}

function setCorsHeaders(res, origin) {
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, Stripe-Signature");
  appendVaryHeader(res, "Origin");
}

function guardCors(req, res, options = {}) {
  setSecurityHeaders(res);
  const { allowMissingOrigin = false } = options;
  const origin = getRequestOrigin(req);

  if (!origin) {
    if (!allowMissingOrigin) {
      sendJson(res, 403, { error: "Origin nao autorizada." });
      return false;
    }
  } else {
    if (!isOriginAllowed(origin)) {
      sendJson(res, 403, { error: "Origin nao autorizada." });
      return false;
    }
    setCorsHeaders(res, origin);
  }

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return false;
  }

  return true;
}

function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timeoutId));
}

function makeHttpError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function normalizePlanId(value) {
  return String(value || "").trim().toLowerCase();
}

function missingCheckoutEnv() {
  const missing = [];
  if (!SUPABASE_URL) missing.push("SUPABASE_URL");
  if (!SUPABASE_ANON_KEY) missing.push("SUPABASE_ANON_KEY");
  if (!STRIPE_SECRET_KEY) missing.push("STRIPE_SECRET_KEY");
  return missing;
}

function missingWebhookEnv() {
  const missing = [];
  if (!SUPABASE_URL) missing.push("SUPABASE_URL");
  if (!SUPABASE_SERVICE_ROLE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!STRIPE_SECRET_KEY) missing.push("STRIPE_SECRET_KEY");
  if (!STRIPE_WEBHOOK_SECRET) missing.push("STRIPE_WEBHOOK_SECRET");
  return missing;
}

async function getAuthenticatedUser(req) {
  const missing = missingCheckoutEnv();
  if (missing.length > 0) {
    return { error: `Configuracao ausente: ${missing.join(", ")}.`, status: 500 };
  }

  const token = getBearerToken(req);
  if (!token) {
    return { error: "Sessao expirada. Faca login novamente.", status: 401 };
  }

  try {
    const userResponse = await fetchWithTimeout(
      `${SUPABASE_URL}/auth/v1/user`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: SUPABASE_ANON_KEY
        }
      },
      8000
    );

    if (!userResponse.ok) {
      return { error: "Sessao invalida. Faca login novamente.", status: 401 };
    }

    const user = await userResponse.json().catch(() => null);
    if (!user || !user.id) {
      return { error: "Sessao invalida. Faca login novamente.", status: 401 };
    }

    return { user, token };
  } catch (error) {
    return { error: "Nao foi possivel validar sua sessao no momento.", status: 503 };
  }
}

function normalizeBillingCycle(value) {
  const normalized = String(value || "monthly").trim().toLowerCase();
  if (normalized === "semestral") return "semestral";
  if (normalized === "monthly" || normalized === "mensal") return "monthly";
  return null;
}

function getPriceId(planId, billingCycle) {
  const normalizedPlan = String(planId || "").trim().toLowerCase();
  const normalizedCycle = normalizeBillingCycle(billingCycle);

  const key = `${normalizedPlan}_${normalizedCycle}`;
  const envField = PLAN_FIELD_BY_KEY[key] || PLAN_FIELD_BY_KEY[normalizedPlan];
  if (!envField) return null;

  return process.env[envField] || null;
}

function getCheckoutMode() {
  const mode = String(process.env.STRIPE_CHECKOUT_MODE || "subscription").toLowerCase();
  if (mode === "payment") return "payment";
  return "subscription";
}

function getCheckoutPaymentMethodTypes() {
  const configured = String(process.env.STRIPE_CHECKOUT_PAYMENT_METHOD_TYPES || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (configured.length > 0) return configured;

  // Safe default for most accounts while preserving ability to override via env.
  return ["card"];
}

function buildStripeLineItem(planId, billingCycle, checkoutMode, priceId) {
  if (priceId) {
    return {
      price: priceId,
      quantity: 1
    };
  }

  const normalizedPlan = String(planId || "").trim().toLowerCase();
  const normalizedCycle = normalizeBillingCycle(billingCycle);
  if (!normalizedCycle) {
    throw makeHttpError("Ciclo de cobranca invalido.", 400);
  }
  const amount = INLINE_PRICE_CENTS_BY_PLAN?.[normalizedPlan]?.[normalizedCycle] || null;

  if (!amount) {
    throw makeHttpError(`Price ID nao configurado para ${planId}/${billingCycle}.`, 400);
  }

  const productLabel = `EduHub ${normalizedPlan.toUpperCase()} ${normalizedCycle}`;
  const recurring = checkoutMode === "subscription"
    ? {
        interval: "month",
        interval_count: normalizedCycle === "semestral" ? 6 : 1
      }
    : undefined;

  return {
    quantity: 1,
    price_data: {
      currency: "brl",
      unit_amount: amount,
      recurring,
      product_data: {
        name: productLabel
      }
    }
  };
}

async function createStripeCheckoutSession(req, user, payload) {
  const normalizedPlanId = normalizePlanId(payload?.planId);
  const normalizedCycle = normalizeBillingCycle(payload?.billingCycle);
  if (!ALLOWED_PLAN_IDS.has(normalizedPlanId)) {
    throw makeHttpError("Plano invalido.", 400);
  }
  if (!normalizedCycle) {
    throw makeHttpError("Ciclo de cobranca invalido.", 400);
  }

  const priceId = getPriceId(normalizedPlanId, normalizedCycle);

  const appBaseUrl = getAppBaseUrl(req);
  const successUrl = process.env.STRIPE_SUCCESS_URL || `${appBaseUrl}/#/premium`;
  const cancelUrl = process.env.STRIPE_CANCEL_URL || `${appBaseUrl}/#/premium`;
  const checkoutMode = getCheckoutMode();
  const paymentMethodTypes = getCheckoutPaymentMethodTypes();
  const lineItem = buildStripeLineItem(normalizedPlanId, normalizedCycle, checkoutMode, priceId);

  const metadata = {
    user_id: user.id,
    plan_id: normalizedPlanId,
    billing_cycle: normalizedCycle
  };

  const session = await getStripe().checkout.sessions.create(
    {
      mode: checkoutMode,
      payment_method_types: paymentMethodTypes,
      customer_email: user.email || undefined,
      line_items: [lineItem],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
      subscription_data: checkoutMode === "subscription" ? { metadata } : undefined
    },
    {
      idempotencyKey: crypto.randomUUID()
    }
  );

  return {
    checkoutUrl: session.url || "",
    checkoutSessionId: session.id || "",
    planId: metadata.plan_id,
    billingCycle: metadata.billing_cycle
  };
}

function getEventPlanMetadata(eventObject) {
  const directMetadata = eventObject?.metadata || {};
  if (directMetadata.user_id && directMetadata.plan_id) {
    return {
      userId: String(directMetadata.user_id),
      planId: String(directMetadata.plan_id).toLowerCase()
    };
  }

  const lines = eventObject?.lines?.data || [];
  for (const line of lines) {
    const m = line?.metadata || {};
    if (m.user_id && m.plan_id) {
      return { userId: String(m.user_id), planId: String(m.plan_id).toLowerCase() };
    }
  }

  return { userId: "", planId: "" };
}

async function updateProfilePlan(userId, planId) {
  const response = await fetchWithTimeout(
    `${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`,
    {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify({ userPlan: planId })
    },
    12000
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.message || data?.error || `Supabase update error ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

async function applyStripeEvent(event) {
  const type = String(event?.type || "");
  const object = event?.data?.object || {};

  if (type === "checkout.session.completed") {
    const metadata = object.metadata || {};
    const userId = String(metadata.user_id || "");
    const planId = normalizePlanId(metadata.plan_id);

    if (!userId || !planId) return { applied: false, reason: "missing-metadata" };
    if (!ALLOWED_PLAN_IDS.has(planId)) return { applied: false, reason: "invalid-plan" };

    await updateProfilePlan(userId, planId);
    return { applied: true, userId, planId, source: type };
  }

  if (type === "invoice.paid" || type === "invoice.payment_succeeded") {
    const metadata = object.parent?.subscription_details?.metadata || object.lines?.data?.[0]?.metadata || {};
    const userId = String(metadata.user_id || "");
    const planId = normalizePlanId(metadata.plan_id);

    if (!userId || !planId) return { applied: false, reason: "missing-metadata" };
    if (!ALLOWED_PLAN_IDS.has(planId)) return { applied: false, reason: "invalid-plan" };

    await updateProfilePlan(userId, planId);
    return { applied: true, userId, planId, source: type };
  }

  if (type === "customer.subscription.deleted" || type === "subscription.deleted") {
    const metadata = object.metadata || {};
    const userId = String(metadata.user_id || "");
    if (!userId) return { applied: false, reason: "missing-metadata" };

    await updateProfilePlan(userId, "gratis");
    return { applied: true, userId, planId: "gratis", source: type };
  }

  if (type === "customer.subscription.updated" || type === "subscription.updated") {
    const metadata = object.metadata || {};
    const userId = String(metadata.user_id || "");
    const planId = normalizePlanId(metadata.plan_id);
    const status = String(object.status || "");

    if (!userId || !planId) return { applied: false, reason: "missing-metadata" };
    if (!ALLOWED_PLAN_IDS.has(planId)) return { applied: false, reason: "invalid-plan" };

    if (["active", "trialing", "past_due"].includes(status)) {
      await updateProfilePlan(userId, planId);
      return { applied: true, userId, planId, source: type };
    }

    if (["canceled", "unpaid", "incomplete_expired"].includes(status)) {
      await updateProfilePlan(userId, "gratis");
      return { applied: true, userId, planId: "gratis", source: type };
    }

    return { applied: false, reason: `status-ignored:${status}` };
  }

  return { applied: false, reason: `event-ignored:${type}` };
}

async function constructStripeEvent(req) {
  const signature = req.headers["stripe-signature"];
  if (!signature) {
    const error = new Error("Stripe-Signature ausente.");
    error.status = 400;
    throw error;
  }

  const payload = await getRawBody(req);
  if (!payload) {
    const error = new Error("Payload vazio no webhook Stripe.");
    error.status = 400;
    throw error;
  }
  if (Buffer.byteLength(payload, "utf8") > MAX_STRIPE_WEBHOOK_BODY_BYTES) {
    const error = new Error("Payload do webhook excede o limite.");
    error.status = 413;
    throw error;
  }

  try {
    return getStripe().webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    error.status = 400;
    throw error;
  }
}

module.exports = {
  applyStripeEvent,
  constructStripeEvent,
  createStripeCheckoutSession,
  getAuthenticatedUser,
  guardCors,
  missingCheckoutEnv,
  missingWebhookEnv,
  isPayloadTooLarge,
  readBody,
  sendJson
};
