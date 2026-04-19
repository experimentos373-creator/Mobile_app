const Stripe = require("stripe");

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

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
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string" && req.body.trim()) {
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

function getAppBaseUrl(req) {
  return process.env.BILLING_APP_BASE_URL || process.env.APP_BASE_URL || getOrigin(req);
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
  res.setHeader("Vary", "Origin");
}

function guardCors(req, res, options = {}) {
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
  return normalized;
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

async function createStripeCheckoutSession(req, user, payload) {
  const { planId, billingCycle } = payload;
  const priceId = getPriceId(planId, billingCycle);
  if (!priceId) {
    throw new Error(`Price ID nao configurado para ${planId}/${billingCycle}.`);
  }

  const appBaseUrl = getAppBaseUrl(req);
  const successUrl = process.env.STRIPE_SUCCESS_URL || `${appBaseUrl}/#/premium`;
  const cancelUrl = process.env.STRIPE_CANCEL_URL || `${appBaseUrl}/#/premium`;
  const checkoutMode = getCheckoutMode();

  const metadata = {
    user_id: user.id,
    plan_id: String(planId || "").toLowerCase(),
    billing_cycle: normalizeBillingCycle(billingCycle)
  };

  const session = await getStripe().checkout.sessions.create({
    mode: checkoutMode,
    customer_email: user.email || undefined,
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    subscription_data: checkoutMode === "subscription" ? { metadata } : undefined
  });

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
    const planId = String(metadata.plan_id || "").toLowerCase();

    if (!userId || !planId) return { applied: false, reason: "missing-metadata" };

    await updateProfilePlan(userId, planId);
    return { applied: true, userId, planId, source: type };
  }

  if (type === "invoice.paid") {
    const metadata = object.parent?.subscription_details?.metadata || object.lines?.data?.[0]?.metadata || {};
    const userId = String(metadata.user_id || "");
    const planId = String(metadata.plan_id || "").toLowerCase();

    if (!userId || !planId) return { applied: false, reason: "missing-metadata" };

    await updateProfilePlan(userId, planId);
    return { applied: true, userId, planId, source: type };
  }

  if (type === "customer.subscription.deleted") {
    const metadata = object.metadata || {};
    const userId = String(metadata.user_id || "");
    if (!userId) return { applied: false, reason: "missing-metadata" };

    await updateProfilePlan(userId, "gratis");
    return { applied: true, userId, planId: "gratis", source: type };
  }

  if (type === "customer.subscription.updated") {
    const metadata = object.metadata || {};
    const userId = String(metadata.user_id || "");
    const planId = String(metadata.plan_id || "").toLowerCase();
    const status = String(object.status || "");

    if (!userId || !planId) return { applied: false, reason: "missing-metadata" };

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
  readBody,
  sendJson
};
