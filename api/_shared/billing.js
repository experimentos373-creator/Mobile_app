const crypto = require("crypto");

const MERCADOPAGO_API_BASE = "https://api.mercadopago.com";
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || "";
const MERCADOPAGO_WEBHOOK_SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET || "";

const DEFAULT_ALLOWED_ORIGINS = [
  "https://eduhub.vercel.app",
  "https://www.eduhub.com.br",
  "http://localhost:3000",
  "http://localhost:4173"
];

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || DEFAULT_ALLOWED_ORIGINS.join(","))
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const PLAN_CATALOG = {
  basico: {
    monthly: { amount: 19.9, label: "Plano Basico Mensal" },
    semestral: { amount: 79.6, label: "Plano Basico Semestral" }
  },
  pro: {
    monthly: { amount: 49.9, label: "Plano Pro Mensal" },
    semestral: { amount: 199.6, label: "Plano Pro Semestral" }
  },
  plus: {
    monthly: { amount: 64.9, label: "Plano Plus Mensal" },
    semestral: { amount: 259.6, label: "Plano Plus Semestral" }
  }
};

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
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
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
  if (!MERCADOPAGO_ACCESS_TOKEN) missing.push("MERCADOPAGO_ACCESS_TOKEN");
  return missing;
}

function missingWebhookEnv() {
  const missing = [];
  if (!SUPABASE_URL) missing.push("SUPABASE_URL");
  if (!SUPABASE_SERVICE_ROLE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!MERCADOPAGO_ACCESS_TOKEN) missing.push("MERCADOPAGO_ACCESS_TOKEN");
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

function getPlanOffer(planId, billingCycle) {
  const normalizedPlan = String(planId || "").trim().toLowerCase();
  const normalizedCycle = String(billingCycle || "monthly").trim().toLowerCase();

  if (!PLAN_CATALOG[normalizedPlan]) return null;
  if (!PLAN_CATALOG[normalizedPlan][normalizedCycle]) return null;

  return {
    planId: normalizedPlan,
    billingCycle: normalizedCycle,
    ...PLAN_CATALOG[normalizedPlan][normalizedCycle]
  };
}

function buildPreferencePayload(req, user, offer) {
  const appBaseUrl = getAppBaseUrl(req);
  const cycleLabel = offer.billingCycle === "semestral" ? "Semestral" : "Mensal";
  const notificationUrl = process.env.BILLING_WEBHOOK_URL || `${appBaseUrl}/api/billing/webhook`;

  return {
    external_reference: user.id,
    metadata: {
      user_id: user.id,
      plan_id: offer.planId,
      billing_cycle: offer.billingCycle,
      product: "eduhub-plan"
    },
    items: [
      {
        id: `${offer.planId}-${offer.billingCycle}`,
        title: `EduHub Brasil - ${offer.label}`,
        description: `Assinatura ${cycleLabel} do plano ${offer.planId.toUpperCase()}`,
        quantity: 1,
        currency_id: "BRL",
        unit_price: offer.amount
      }
    ],
    payer: {
      email: user.email || undefined
    },
    notification_url: notificationUrl,
    back_urls: {
      success: `${appBaseUrl}/#/premium`,
      pending: `${appBaseUrl}/#/premium`,
      failure: `${appBaseUrl}/#/premium`
    },
    auto_return: "approved"
  };
}

async function createMercadoPagoPreference(req, user, offer) {
  const payload = buildPreferencePayload(req, user, offer);
  const response = await fetchWithTimeout(
    `${MERCADOPAGO_API_BASE}/checkout/preferences`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": crypto.randomUUID()
      },
      body: JSON.stringify(payload)
    },
    15000
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.message || data?.error || `Mercado Pago error ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

function parseSignatureHeader(headerValue) {
  const parts = String(headerValue || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const out = {};
  for (const part of parts) {
    const [key, value] = part.split("=");
    if (key && value) out[key] = value;
  }
  return out;
}

function safeTimingEqualHex(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  const aBuffer = Buffer.from(a, "hex");
  const bBuffer = Buffer.from(b, "hex");
  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

function extractWebhookEvent(req, body) {
  const query = req.query || {};
  const type = body?.type || body?.topic || query.type || query.topic || "";

  let paymentId =
    body?.data?.id ||
    query["data.id"] ||
    query.id ||
    body?.resource_id ||
    "";

  if (!paymentId && typeof body?.resource === "string") {
    const parts = body.resource.split("/").filter(Boolean);
    paymentId = parts[parts.length - 1] || "";
  }

  return {
    type: String(type || "").toLowerCase(),
    paymentId: String(paymentId || "")
  };
}

function verifyWebhookSignature(req, paymentId) {
  if (!MERCADOPAGO_WEBHOOK_SECRET) {
    return { ok: true, skipped: true };
  }

  const signature = parseSignatureHeader(req.headers["x-signature"]);
  const ts = signature.ts;
  const v1 = signature.v1;
  const requestId = String(req.headers["x-request-id"] || "");

  if (!ts || !v1 || !paymentId || !requestId) {
    return { ok: false, reason: "missing-signature-fields" };
  }

  const manifest = `id:${paymentId};request-id:${requestId};ts:${ts};`;
  const digest = crypto
    .createHmac("sha256", MERCADOPAGO_WEBHOOK_SECRET)
    .update(manifest)
    .digest("hex");

  return {
    ok: safeTimingEqualHex(digest, v1),
    skipped: false
  };
}

async function fetchMercadoPagoPayment(paymentId) {
  const response = await fetchWithTimeout(
    `${MERCADOPAGO_API_BASE}/v1/payments/${paymentId}`,
    {
      headers: {
        Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`
      }
    },
    15000
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.message || data?.error || `Payment fetch error ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

function normalizePlanId(rawPlanId) {
  return String(rawPlanId || "").trim().toLowerCase();
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

async function applyApprovedPayment(payment) {
  if (String(payment?.status || "").toLowerCase() !== "approved") {
    return { applied: false, reason: "payment-not-approved" };
  }

  const metadata = payment?.metadata || {};
  const planId = normalizePlanId(metadata.plan_id || metadata.planId);
  const userId = String(metadata.user_id || metadata.userId || payment?.external_reference || "");

  if (!planId || !PLAN_CATALOG[planId]) {
    return { applied: false, reason: "invalid-plan-metadata" };
  }

  if (!userId) {
    return { applied: false, reason: "missing-user-metadata" };
  }

  await updateProfilePlan(userId, planId);
  return { applied: true, userId, planId };
}

module.exports = {
  applyApprovedPayment,
  createMercadoPagoPreference,
  extractWebhookEvent,
  fetchMercadoPagoPayment,
  getAuthenticatedUser,
  getPlanOffer,
  guardCors,
  missingCheckoutEnv,
  missingWebhookEnv,
  readBody,
  sendJson,
  verifyWebhookSignature
};
