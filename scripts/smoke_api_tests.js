process.env.OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "test-openrouter-key";
process.env.SUPABASE_URL = process.env.SUPABASE_URL || "https://supabase.test.local";
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "test-anon-key";
process.env.ALLOWED_ORIGINS = "https://eduhub.vercel.app,http://localhost:3000";

const chatHandler = require("../api/ai/chat.js");
const redacaoHandler = require("../api/ai/redacao.js");
const shared = require("../api/_shared/openrouter.js");

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

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
  const planByToken = {
    "valid-gratis": "gratis",
    "valid-basico": "basico",
    "valid-pro": "pro",
    "valid-plus": "plus"
  };

  global.fetch = async (url, options = {}) => {
    const urlString = String(url);
    const token = extractToken(options.headers || {});

    if (urlString.includes("/auth/v1/user")) {
      if (!planByToken[token]) {
        return jsonResponse({ error: "invalid token" }, 401);
      }
      return jsonResponse({ id: `user-${token}` }, 200);
    }

    if (urlString.includes("/rest/v1/profiles")) {
      const userPlan = planByToken[token] || "gratis";
      return jsonResponse([{ userPlan }], 200);
    }

    if (urlString === OPENROUTER_API_URL) {
      return jsonResponse(
        {
          choices: [{ message: { content: "Resposta simulada de IA" } }]
        },
        200
      );
    }

    return jsonResponse({ error: "Unexpected URL in fetch mock", url: urlString }, 500);
  };
}

function makeReq({ method = "POST", origin = "https://eduhub.vercel.app", token, body }) {
  const headers = { origin };
  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  return {
    method,
    headers,
    body
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

  return { statusCode: res.statusCode, headers: res.headers, json, body: res.body };
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}. Esperado=${expected}, atual=${actual}`);
  }
}

function assertIncludes(text, expectedFragment, message) {
  if (!String(text || "").includes(expectedFragment)) {
    throw new Error(`${message}. Texto='${text}'`);
  }
}

async function run() {
  installFetchMock();

  const tests = [
    {
      name: "chat blocks unauthorized origin",
      run: async () => {
        const result = await invoke(
          chatHandler,
          makeReq({ method: "POST", origin: "https://malicious.example", body: {} })
        );
        assertEqual(result.statusCode, 403, "CORS should block unknown origin");
      }
    },
    {
      name: "chat supports CORS preflight for allowed origin",
      run: async () => {
        const result = await invoke(chatHandler, makeReq({ method: "OPTIONS" }));
        assertEqual(result.statusCode, 204, "Preflight must return 204");
        assertEqual(
          result.headers["Access-Control-Allow-Origin"],
          "https://eduhub.vercel.app",
          "Preflight should return allowed origin"
        );
      }
    },
    {
      name: "chat fails fast when OPENROUTER key missing",
      run: async () => {
        const prev = process.env.OPENROUTER_API_KEY;
        delete process.env.OPENROUTER_API_KEY;
        try {
          const result = await invoke(
            chatHandler,
            makeReq({ token: "valid-basico", body: { message: "oi", modelKey: "step-3-5" } })
          );
          assertEqual(result.statusCode, 500, "Missing env must return 500");
          assertIncludes(
            result.json && result.json.error,
            "OPENROUTER_API_KEY",
            "Error must mention missing OPENROUTER_API_KEY"
          );
        } finally {
          process.env.OPENROUTER_API_KEY = prev;
        }
      }
    },
    {
      name: "chat rejects non-POST methods",
      run: async () => {
        const result = await invoke(
          chatHandler,
          makeReq({ method: "GET", token: "valid-basico", body: {} })
        );
        assertEqual(result.statusCode, 405, "GET method must be rejected");
      }
    },
    {
      name: "chat rejects invalid JSON payload",
      run: async () => {
        const result = await invoke(
          chatHandler,
          makeReq({ token: "valid-basico", body: "{invalid-json" })
        );
        assertEqual(result.statusCode, 400, "Invalid JSON should return 400");
      }
    },
    {
      name: "chat validates image MIME type",
      run: async () => {
        const result = await invoke(
          chatHandler,
          makeReq({
            token: "valid-basico",
            body: { message: "", modelKey: "step-3-5", imageBase64: "not-image-data" }
          })
        );
        assertEqual(result.statusCode, 400, "Invalid image MIME should return 400");
      }
    },
    {
      name: "chat validates image size limit",
      run: async () => {
        const hugeImage = `data:image/png;base64,${"A".repeat(8_000_000)}`;
        const result = await invoke(
          chatHandler,
          makeReq({
            token: "valid-basico",
            body: { message: "", modelKey: "step-3-5", imageBase64: hugeImage }
          })
        );
        assertEqual(result.statusCode, 413, "Large image payload should return 413");
      }
    },
    {
      name: "chat enforces plan restrictions",
      run: async () => {
        const result = await invoke(
          chatHandler,
          makeReq({
            token: "valid-basico",
            body: { message: "teste", modelKey: "minimax" }
          })
        );
        assertEqual(result.statusCode, 403, "Model tier above user plan should return 403");
      }
    },
    {
      name: "chat returns successful AI answer",
      run: async () => {
        const result = await invoke(
          chatHandler,
          makeReq({
            token: "valid-pro",
            body: { message: "quanto e 2+2?", modelKey: "minimax" }
          })
        );
        assertEqual(result.statusCode, 200, "Valid chat request should return 200");
        assertIncludes(result.json && result.json.content, "Resposta simulada", "Missing AI content");
      }
    },
    {
      name: "chat endpoint enforces 429 after plan limit",
      run: async () => {
        let lastResult = null;
        for (let i = 0; i < 41; i += 1) {
          lastResult = await invoke(
            chatHandler,
            makeReq({
              token: "valid-basico",
              body: { message: `pergunta-${i}`, modelKey: "step-3-5" }
            })
          );
        }

        if (!lastResult) {
          throw new Error("No result from rate-limit endpoint test");
        }

        assertEqual(lastResult.statusCode, 429, "Expected 429 on request above basico limit");
      }
    },
    {
      name: "rate limiter helper blocks after gratis threshold",
      run: async () => {
        let state = null;
        for (let i = 0; i < 6; i += 1) {
          state = shared.consumeRateLimit("user-rate-test", "gratis", "scope-rate-test");
        }
        if (!state) {
          throw new Error("Rate state not produced");
        }
        assertEqual(state.allowed, false, "Rate limit should block after 5 requests for gratis");
        assertEqual(state.limit, 5, "Gratis limit should be 5");
      }
    },
    {
      name: "redacao endpoint requires plus plan",
      run: async () => {
        const result = await invoke(
          redacaoHandler,
          makeReq({
            token: "valid-pro",
            body: { prompt: "corrija minha redacao" }
          })
        );
        assertEqual(result.statusCode, 403, "Redacao should require plus plan");
      }
    },
    {
      name: "redacao endpoint succeeds for plus plan",
      run: async () => {
        const result = await invoke(
          redacaoHandler,
          makeReq({
            token: "valid-plus",
            body: { prompt: "corrija minha redacao" }
          })
        );
        assertEqual(result.statusCode, 200, "Redacao request should return 200 for plus");
        assertIncludes(result.json && result.json.content, "Resposta simulada", "Missing redacao content");
      }
    }
  ];

  const results = [];
  for (const testCase of tests) {
    try {
      await testCase.run();
      results.push({ name: testCase.name, ok: true });
      console.log(`[PASS] ${testCase.name}`);
    } catch (error) {
      results.push({ name: testCase.name, ok: false, error: error.message });
      console.error(`[FAIL] ${testCase.name} -> ${error.message}`);
    }
  }

  const failed = results.filter((item) => !item.ok);
  const passed = results.length - failed.length;
  console.log("\nSmoke test summary:");
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed.length}`);

  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error("Unhandled test runner error:", error);
  process.exitCode = 1;
});
