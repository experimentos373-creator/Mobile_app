const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";
const APP_BASE_URL = process.env.APP_BASE_URL || "https://eduhub.vercel.app";
const MAX_AI_BODY_BYTES = Number(process.env.MAX_AI_BODY_BYTES || 128 * 1024);
const MAX_CHAT_MESSAGE_CHARS = Number(process.env.MAX_CHAT_MESSAGE_CHARS || 6000);
const MAX_REDACTION_PROMPT_CHARS = Number(process.env.MAX_REDACTION_PROMPT_CHARS || 12000);
const MAX_AI_IMAGE_BYTES = Number(process.env.MAX_AI_IMAGE_BYTES || 5 * 1024 * 1024);
const ALLOW_MISSING_ORIGIN = String(process.env.ALLOW_MISSING_ORIGIN || "").toLowerCase() === "true";

const DEFAULT_ALLOWED_ORIGINS = [
  "https://eduhub.vercel.app",
  "https://www.eduhub.com.br",
  "https://mobileapp-taupe.vercel.app",
  "http://localhost:3000",
  "http://localhost:4173",
  "http://localhost",
  "capacitor://localhost"
];

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || DEFAULT_ALLOWED_ORIGINS.join(","))
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const DAILY_REQUEST_LIMITS = {
  gratis: 5,
  basico: 40,
  pro: 120,
  plus: 220
};

const RATE_LIMIT_BUCKETS = new Map();
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;
let RATE_LIMIT_OP_COUNT = 0;

const MODELS = {
  "step-3-5": {
    id: "liquid/lfm-2.5-1.2b-thinking:free",
    label: "LFM 2.5 Thinking",
    tier: "basico",
    supportsReasoning: false,
    supportsVision: false,
    timeout: 35000
  },
  minimax: {
    id: "inclusionai/ling-2.6-flash:free",
    label: "Ling 2.6 Flash",
    tier: "pro",
    supportsReasoning: false,
    supportsVision: false,
    timeout: 35000
  },
  "trinity-large": {
    id: "meta-llama/llama-3.3-70b-instruct:free",
    label: "Llama 3.3 70B",
    tier: "plus",
    supportsReasoning: false,
    supportsVision: false,
    timeout: 35000
  },
  "nemotron-super": {
    id: "nvidia/nemotron-3-super-120b-a12b:free",
    label: "Nemotron Super 120B",
    tier: "plus",
    supportsReasoning: true,
    supportsVision: false,
    timeout: 35000
  }
};

const REDACAO_MODELS = [
  { id: "nvidia/nemotron-3-super-120b-a12b:free", label: "Nemotron Super 120B", timeout: 35000 },
  { id: "inclusionai/ling-2.6-flash:free", label: "Ling 2.6 Flash", timeout: 35000 }
];

const TIER_LEVELS = { gratis: 0, basico: 1, pro: 2, plus: 3 };

const SYSTEM_PROMPT = `Voce e o Tutor IA do EduHub Brasil, o assistente pedagogico definitivo para ENEM e concursos. Sua missao e transformar duvidas em conhecimento estruturado no formato "Elite Edu-Card".

Sua resposta DEVE seguir RIGOROSAMENTE esta estrutura e sequencia:

## Cabecalho de Disciplina
Comece com o icone e o tema (Ex: 📐 **Matemática — Geometria Analítica**).

## Contextualização
Explique brevemente o cenario da questao e o topico abordado.

## Dados e Parâmetros
Extraia TODOS os valores numericos e variaveis em uma tabela Markdown. 
**Importante**: Use obrigatoriamente barras verticais (|) como separadores de tabela. Nunca use "I" ou outros caracteres.
**Importante**: Deixe uma linha em branco antes e depois da tabela.

## O Comando
Restate o que a questao pede de forma curta e em negrito.

## Fundamentação e Fórmulas
Apresente a base teorica e as formulas em blocos LaTeX centrais exclusivos ($$...$$).

## Resolução Integrada
Resolva o problema passo a passo, usando obrigatoriamente LaTeX ($$...$$) para todos os calculos e variaveis, mantendo unidades de medida (Ex: $$v = 10 \text{ m/s}$$).

## Conclusao
Resultado final destacado e indicacao da alternativa correta (se houver).

Regras de Ouro:
- **Visual Premium**: Use tabelas, negritos e espacamento para evitar blocos densos de texto.
- **LaTeX Total**: Qualquer simbolo matematico ($x$, $\Delta$, $\pi$) deve estar em LaTeX.
- **Tone**: Profissional e encorajador.`;

function getRequestOrigin(req) {
  return String(req.headers.origin || "").trim();
}

function isOriginAllowed(origin) {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some((allowedOrigin) => origin === allowedOrigin);
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
  const current = String(currentValue || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  if (!current.includes(value)) current.push(value);
  if (current.length > 0) res.setHeader("Vary", current.join(", "));
}

function setCorsHeaders(res, origin) {
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  appendVaryHeader(res, "Origin");
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  setSecurityHeaders(res);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function guardCors(req, res) {
  setSecurityHeaders(res);
  const origin = getRequestOrigin(req);

  if (!origin) {
    if (!ALLOW_MISSING_ORIGIN) {
      sendJson(res, 403, { error: "Origin nao autorizada." });
      return false;
    }
  } else if (!isOriginAllowed(origin)) {
    sendJson(res, 403, { error: "Origin nao autorizada." });
    return false;
  } else {
    setCorsHeaders(res, origin);
  }

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return false;
  }

  return true;
}

function getMissingEnvVars() {
  const missing = [];
  if (!process.env.OPENROUTER_API_KEY) missing.push("OPENROUTER_API_KEY");
  if (!SUPABASE_URL) missing.push("SUPABASE_URL");
  if (!SUPABASE_ANON_KEY) missing.push("SUPABASE_ANON_KEY");
  return missing;
}

function isPayloadTooLarge(req, maxBytes = MAX_AI_BODY_BYTES) {
  const contentLength = Number(req.headers["content-length"] || 0);
  return Number.isFinite(contentLength) && contentLength > maxBytes;
}

function readBody(req) {
  if (isPayloadTooLarge(req)) return null;

  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string" && req.body.trim()) {
    if (Buffer.byteLength(req.body, "utf8") > MAX_AI_BODY_BYTES) {
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

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;
  return header.slice(7).trim();
}

async function getAuthenticatedContext(req) {
  const missingEnvVars = getMissingEnvVars();
  if (missingEnvVars.length > 0) {
    return {
      error: `Configuracao de ambiente ausente: ${missingEnvVars.join(", ")}.`,
      status: 500
    };
  }

  const token = getBearerToken(req);
  if (!token) {
    return { error: "Sessao expirada. Faca login novamente.", status: 401 };
  }

  let user;
  try {
    const userResponse = await fetchWithTimeout(
      `${SUPABASE_URL}/auth/v1/user`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: SUPABASE_ANON_KEY
        }
      },
      5000
    );

    if (!userResponse.ok) {
      const rawError = await userResponse.json().catch(() => null);
      const message = String(rawError?.message || rawError?.error || "").toLowerCase();
      if (message.includes("user") && message.includes("not found")) {
        return {
          error: "Usuario nao encontrado no projeto Supabase da API. Verifique SUPABASE_URL/SUPABASE_ANON_KEY da Vercel.",
          status: 401
        };
      }
      return { error: "Sessao invalida. Faca login novamente.", status: 401 };
    }

    user = await userResponse.json().catch(() => null);
    if (!user || !user.id) {
      return { error: "Sessao invalida. Faca login novamente.", status: 401 };
    }
  } catch (error) {
    return { error: "Nao foi possivel validar sua sessao no momento.", status: 503 };
  }

  let userPlan = "gratis";

  try {
    const profileUrl = new URL(`${SUPABASE_URL}/rest/v1/profiles`);
    profileUrl.searchParams.set("id", `eq.${user.id}`);
    profileUrl.searchParams.set("select", "userPlan");

    const profileResponse = await fetchWithTimeout(profileUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_ANON_KEY,
        Accept: "application/json"
      }
    }, 4000);

    if (profileResponse.ok) {
      const profile = await profileResponse.json();
      userPlan = profile?.[0]?.userPlan || "gratis";
    }
  } catch (error) {
    // Keep free tier on profile lookup failure.
  }

  return { user, userPlan, token };
}

function assertMethod(req, res, allowedMethod = "POST") {
  if (req.method !== allowedMethod) {
    sendJson(res, 405, { error: `Metodo ${req.method} nao permitido.` });
    return false;
  }
  return true;
}

function requireOpenRouterKey(res) {
  const missingEnvVars = getMissingEnvVars();
  if (missingEnvVars.length > 0) {
    sendJson(res, 500, {
      error: `Configuracao de ambiente ausente: ${missingEnvVars.join(", ")}.`
    });
    return false;
  }
  return true;
}

function fetchWithTimeout(url, options = {}, timeoutMs = 60000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const nextOptions = {
    ...options,
    signal: controller.signal
  };

  return fetch(url, nextOptions).finally(() => {
    clearTimeout(timeoutId);
  });
}

function getSafeReferer(req) {
  const origin = getRequestOrigin(req);
  if (isOriginAllowed(origin)) return origin;
  return APP_BASE_URL;
}

function getModel(modelKey) {
  return MODELS[modelKey] || null;
}

function requirePlan(res, userPlan, requiredTier) {
  const currentLevel = TIER_LEVELS[userPlan] || 0;
  const requiredLevel = TIER_LEVELS[requiredTier] || 0;

  if (currentLevel < requiredLevel) {
    const tierLabel = { basico: "Basico", pro: "Pro", plus: "Plus+" }[requiredTier] || requiredTier;
    sendJson(res, 403, { error: `Este recurso requer o plano ${tierLabel}.` });
    return false;
  }

  return true;
}

async function callOpenRouter(req, body, timeoutMs = 60000) {
  const response = await fetchWithTimeout(
    OPENROUTER_API_URL,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": getSafeReferer(req),
        "X-Title": "EduHub Brasil"
      },
      body: JSON.stringify(body)
    },
    timeoutMs
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error?.message || `Erro ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

function getDailyLimitForPlan(userPlan) {
  return DAILY_REQUEST_LIMITS[userPlan] || DAILY_REQUEST_LIMITS.gratis;
}

function buildRateBucketKey(userId, scope, windowMs) {
  const window = Math.floor(Date.now() / windowMs);
  return `${scope}:${userId}:${window}`;
}

function pruneRateLimitBuckets(windowMs) {
  RATE_LIMIT_OP_COUNT += 1;
  if (RATE_LIMIT_OP_COUNT % 250 !== 0) return;

  const currentWindow = Math.floor(Date.now() / windowMs);
  for (const key of RATE_LIMIT_BUCKETS.keys()) {
    const parts = key.split(":");
    const bucketWindow = Number(parts[parts.length - 1]);
    if (Number.isFinite(bucketWindow) && bucketWindow < currentWindow - 1) {
      RATE_LIMIT_BUCKETS.delete(key);
    }
  }
}

function consumeRateLimit(userId, userPlan, scope, windowMs = RATE_LIMIT_WINDOW_MS) {
  pruneRateLimitBuckets(windowMs);
  const limit = getDailyLimitForPlan(userPlan);
  const bucketKey = buildRateBucketKey(userId, scope, windowMs);
  const used = RATE_LIMIT_BUCKETS.get(bucketKey) || 0;
  const nextUsed = used + 1;
  RATE_LIMIT_BUCKETS.set(bucketKey, nextUsed);

  const allowed = nextUsed <= limit;
  const remaining = Math.max(0, limit - nextUsed);
  const retryAfter = Math.max(1, Math.ceil(windowMs / 1000));

  return { allowed, limit, remaining, retryAfter };
}

async function buildVisionFallback(req, imageBase64) {
  const body = {
    model: "openrouter/free",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              "Descreva o conteudo desta imagem de forma extremamente detalhada e academica, transcrevendo fielmente todos os textos, numeros, alternativas, tabelas e formulas (use LaTeX $$...$$) nela contidos. Esta descricao sera usada por outra IA cega para resolver a questao."
          },
          { type: "image_url", image_url: { url: imageBase64 } }
        ]
      }
    ],
    temperature: 0.1,
    max_tokens: 2000
  };

  const data = await callOpenRouter(req, body, 60000);
  return data?.choices?.[0]?.message?.content || "";
}

function normalizeAiError(error, fallbackMessage) {
  if (error?.name === "AbortError") {
    return fallbackMessage || "A IA demorou demais para responder. Tente novamente.";
  }
  if (error?.message?.includes("Failed to fetch") || error?.message?.includes("Network")) {
    return "Sem conexao com a internet. Verifique sua rede e tente novamente.";
  }
  return error?.message || "Nao foi possivel obter uma resposta. Tente novamente.";
}

module.exports = {
  MODELS,
  REDACAO_MODELS,
  SYSTEM_PROMPT,
  assertMethod,
  buildVisionFallback,
  callOpenRouter,
  consumeRateLimit,
  getDailyLimitForPlan,
  getAuthenticatedContext,
  getModel,
  guardCors,
  isPayloadTooLarge,
  MAX_AI_BODY_BYTES,
  MAX_AI_IMAGE_BYTES,
  MAX_CHAT_MESSAGE_CHARS,
  MAX_REDACTION_PROMPT_CHARS,
  normalizeAiError,
  readBody,
  requireOpenRouterKey,
  requirePlan,
  sendJson
};
