const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";

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
  "nemotron-super": {
    id: "nvidia/nemotron-3-super-120b-a12b:free",
    label: "Nemotron Super 120B",
    tier: "plus",
    supportsReasoning: true,
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
  }
};

const REDACAO_MODELS = [
  { id: "nvidia/nemotron-3-super-120b-a12b:free", label: "Nemotron Super 120B", timeout: 35000 },
  { id: "inclusionai/ling-2.6-flash:free", label: "Ling 2.6 Flash", timeout: 35000 }
];

const TIER_LEVELS = { gratis: 0, basico: 1, pro: 2, plus: 3 };

const SYSTEM_PROMPT = `Voce e o Tutor IA do EduHub Brasil, um assistente pedagogico especializado em preparacao para o ENEM e vestibulares brasileiros.

Sua missao e resolver questoes e explicar conceitos seguindo EXATAMENTE este padrao de formatacao:

1. **Titulo e Contexto**: Identifique o tema da questao (Ex: Estequiometria, Termodinamica).
2. **Tabela de Dados**: Extraia todos os valores numericos e organize-os em uma tabela Markdown com colunas: 'Grandeza', 'Valor' e 'Unidade'.
3. **O Comando**: Destaque em negrito qual e a pergunta final (o que deve ser calculado).
4. **Formulas**: Liste as formulas necessarias em blocos de LaTeX ($$...$$).
5. **Resolucao Passo a Passo**: Resolva de forma logica, usando LaTeX para todos os calculos intermediarios. Garanta que as unidades de medida aparecam nos calculos para facilitar o entendimento.

Regras Criticas:
- **NAO despadronize**: Mantenha valores na mesma linha que seus rotulos (Ex: "Valor de x: 22,05").
- **Pedagogia**: Ajude o aluno a RACIOCINAR, nao de apenas a resposta direta.
- **Linguagem**: Use Portugues do Brasil, tom motivador e exemplos do cotidiano brasileiro.
- **LaTeX**: Use obrigatoriamente $$...$$ para todas as expressoes matematicas e calculos intermediarios.`;

function getOrigin(req) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost:3000";
  return `${proto}://${host}`;
}

function getRequestOrigin(req) {
  return String(req.headers.origin || "").trim();
}

function isOriginAllowed(origin) {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some((allowedOrigin) => origin === allowedOrigin);
}

function normalizeSupabaseUrl(input) {
  const raw = String(input || "").trim();
  if (!raw) return "";

  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "https:") return "";
    if (!parsed.hostname.endsWith(".supabase.co")) return "";
    return `${parsed.protocol}//${parsed.hostname}`;
  } catch (error) {
    return "";
  }
}

function resolveSupabaseConfig(req) {
  const headerUrl = normalizeSupabaseUrl(req.headers["x-supabase-url"]);
  const headerAnonKey = String(req.headers["x-supabase-anon-key"] || "").trim();

  const resolvedUrl = headerUrl || normalizeSupabaseUrl(SUPABASE_URL);
  const resolvedAnonKey = headerAnonKey || SUPABASE_ANON_KEY;

  return {
    url: resolvedUrl,
    anonKey: String(resolvedAnonKey || "").trim()
  };
}

function setCorsHeaders(res, origin) {
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Authorization, Content-Type, X-Supabase-Url, X-Supabase-Anon-Key"
  );
  res.setHeader("Vary", "Origin");
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function guardCors(req, res) {
  const origin = getRequestOrigin(req);
  const requestOrigin = getOrigin(req);
  // Allow if origin matches request, is in allowed list, or is missing/null (common in Mobile App wrappers)
  const allowed = !origin || origin === "null" || origin === requestOrigin || isOriginAllowed(origin);
  
  if (!allowed) {
    sendJson(res, 403, { error: "Origin nao autorizada." });
    return false;
  }

  setCorsHeaders(res, origin || "*");
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
  return missing;
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

  const supabaseConfig = resolveSupabaseConfig(req);
  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    return {
      error: "Configuracao do Supabase ausente no servidor. Defina SUPABASE_URL/SUPABASE_ANON_KEY ou envie headers do cliente.",
      status: 500
    };
  }

  let user;
  try {
    const userResponse = await fetchWithTimeout(
      `${supabaseConfig.url}/auth/v1/user`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: supabaseConfig.anonKey
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
    const profileUrl = new URL(`${supabaseConfig.url}/rest/v1/profiles`);
    profileUrl.searchParams.set("id", `eq.${user.id}`);
    profileUrl.searchParams.set("select", "userPlan");

    const profileResponse = await fetchWithTimeout(profileUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: supabaseConfig.anonKey,
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
        "HTTP-Referer": getOrigin(req),
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

function consumeRateLimit(userId, userPlan, scope, windowMs = RATE_LIMIT_WINDOW_MS) {
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
  normalizeAiError,
  readBody,
  requireOpenRouterKey,
  requirePlan,
  sendJson
};
