process.env.SUPABASE_URL = "https://supabase.test.local";
process.env.SUPABASE_ANON_KEY = "anon-test-key";
process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-test-key";
process.env.MERCADOPAGO_ACCESS_TOKEN = "mp-access-token-test";
process.env.ALLOWED_ORIGINS = "https://eduhub.vercel.app,http://localhost:4173";

const checkoutHandler = require("../api/billing/create-checkout.js");
const webhookHandler = require("../api/billing/webhook.js");

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function extractToken(headers = {}) {
  const authHeader = headers.Authorization || headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) return "";
  return authHeader.slice(7).trim();
}

function installFetchMock() {
  global.__updatedPlanPayload = null;

  global.fetch = async (url, options = {}) => {
    const urlString = String(url);
    const token = extractToken(options.headers || {});

    if (urlString.includes("/auth/v1/user")) {
      if (token !== "valid-session-token") {
        return jsonResponse({ error: "invalid token" }, 401);
      }
      return jsonResponse({ id: "user-123", email: "student@test.local" }, 200);
    }

    if (urlString.includes("/checkout/preferences")) {
      const body = JSON.parse(options.body || "{}");
      return jsonResponse(
        {
          id: "pref-abc",
          init_point: "https://checkout.mercadopago.com/pref-abc",
          metadata: body.metadata || {}
        },
        200
      );
    }

    if (urlString.includes("/v1/payments/987")) {
      return jsonResponse(
        {
          id: 987,
          status: "approved",
          external_reference: "user-123",
          metadata: {
            user_id: "user-123",
            plan_id: "pro",
            billing_cycle: "monthly"
          }
        },
        200
      );
    }

    if (urlString.includes("/rest/v1/profiles?id=eq.user-123")) {
      global.__updatedPlanPayload = JSON.parse(options.body || "{}");
      return jsonResponse([{ id: "user-123", userPlan: global.__updatedPlanPayload.userPlan }], 200);
    }

    return jsonResponse({ error: "Unexpected URL", url: urlString }, 500);
  };
}

function makeReq({
  method = "POST",
  origin = "https://eduhub.vercel.app",
  token,
  body,
  query,
  headers = {}
}) {
  const reqHeaders = { ...headers };
  if (origin) reqHeaders.origin = origin;
  if (token) reqHeaders.authorization = `Bearer ${token}`;

  return {
    method,
    headers: reqHeaders,
    body,
    query: query || {}
  };
}

function makeRes() {
  const headers = {};
  return {
    statusCode: 200,
    headers,
    body: "",
    setHeader(name, value) {
      headers[name] = value;
    },
    end(chunk = "") {
      this.body = String(chunk);
    }
  };
}

async function invoke(handler, req) {
  const res = makeRes();
  await handler(req, res);

  let json = null;
  if (res.body) {
    try {
      json = JSON.parse(res.body);
    } catch (error) {
      json = null;
    }
  }

  return { statusCode: res.statusCode, json, headers: res.headers };
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}. Esperado=${expected}, atual=${actual}`);
  }
}

async function run() {
  installFetchMock();

  const tests = [
    {
      name: "checkout requires auth",
      run: async () => {
        const result = await invoke(
          checkoutHandler,
          makeReq({
            body: { planId: "pro", billingCycle: "monthly" }
          })
        );
        assertEqual(result.statusCode, 401, "Expected 401 when auth token is missing");
      }
    },
    {
      name: "checkout returns init point",
      run: async () => {
        const result = await invoke(
          checkoutHandler,
          makeReq({
            token: "valid-session-token",
            body: { planId: "pro", billingCycle: "monthly" }
          })
        );
        assertEqual(result.statusCode, 200, "Expected 200 for valid checkout creation");
        assertEqual(
          result.json && result.json.preferenceId,
          "pref-abc",
          "Expected preference id from gateway"
        );
      }
    },
    {
      name: "webhook applies approved payment to profile",
      run: async () => {
        const result = await invoke(
          webhookHandler,
          makeReq({
            body: {
              type: "payment",
              data: { id: 987 }
            }
          })
        );
        assertEqual(result.statusCode, 200, "Expected 200 on webhook processing");
        assertEqual(global.__updatedPlanPayload.userPlan, "pro", "Expected profile plan update to pro");
      }
    }
  ];

  let failed = 0;

  for (const testCase of tests) {
    try {
      await testCase.run();
      console.log(`[PASS] ${testCase.name}`);
    } catch (error) {
      failed += 1;
      console.error(`[FAIL] ${testCase.name} -> ${error.message}`);
    }
  }

  console.log("\nBilling smoke summary:");
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error("Unhandled billing smoke error:", error);
  process.exitCode = 1;
});
