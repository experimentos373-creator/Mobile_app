// ============================================================
// EduHub Brasil - AI Service Module
// Frontend client for the internal Vercel AI endpoints
// ============================================================

const AIService = {
  API_BASE: "/api/ai",

  // Fast, reliable models configured for the free tier heavily prioritized queue evasion
  MODELS: {
    "step-3-5": {
      id: "liquid/lfm-2.5-1.2b-thinking:free",
      label: "LFM 2.5 Thinking",
      description: "Extremamente r\u00e1pido e eficiente",
      icon: "bolt",
      color: "emerald",
      tier: "basico",
      supportsReasoning: false,
      supportsVision: false,
      timeout: 35000
    },
    "minimax": {
      id: "inclusionai/ling-2.6-flash:free",
      label: "Ling 2.6 Flash",
      description: "Ultra r\u00e1pido e inteligente",
      icon: "psychology",
      color: "blue",
      tier: "pro",
      supportsReasoning: false,
      supportsVision: false,
      timeout: 35000
    },
    "trinity-large": {
      id: "meta-llama/llama-3.3-70b-instruct:free",
      label: "Llama 3.3 70B",
      description: "Alta Performance: Pot\u00eancia e versatilidade (70B)",
      icon: "water_drop",
      color: "cyan",
      tier: "plus",
      supportsReasoning: false,
      supportsVision: false,
      timeout: 35000
    },
    "nemotron-super": {
      id: "nvidia/nemotron-3-super-120b-a12b:free",
      label: "Nemotron Super 120B",
      description: "A Melhor IA: Racioc\u00ednio profundo e precis\u00e3o extrema (120B)",
      icon: "neurology",
      color: "amber",
      tier: "plus",
      supportsReasoning: true,
      supportsVision: false,
      timeout: 35000
    }
  },

  TIER_LEVELS: { gratis: 0, basico: 1, pro: 2, plus: 3 },
  BASIC_DAILY_LIMIT: 5,

  getAvailableModels() {
    const plan = AppState.get("userPlan");
    const userLevel = this.TIER_LEVELS[plan] || 0;

    return Object.entries(this.MODELS)
      .filter(([, model]) => userLevel >= this.TIER_LEVELS[model.tier])
      .map(([key, model]) => ({ key, ...model }));
  },

  checkUsage() {
    const planId = AppState.get("userPlan") || "gratis";
    this._resetDailyIfNeeded();
    const used = AppState.get("aiDailyUsage") || 0;

    let aiDailyLimit = 5;
    if (typeof APP_DATA !== "undefined" && APP_DATA.plans && APP_DATA.plans[planId]) {
      aiDailyLimit = APP_DATA.plans[planId].aiDailyLimit;
    } else {
      if (planId === "basico") aiDailyLimit = 15;
      else if (planId === "pro") aiDailyLimit = 50;
      else if (planId === "plus") aiDailyLimit = 100;
    }

    const remaining = aiDailyLimit - used;
    if (remaining <= 0) {
      let upgradeMsg = "";
      if (planId === "gratis") upgradeMsg = "Fa\u00e7a upgrade para o Plano B\u00e1sico para ter mais perguntas.";
      else if (planId === "basico") upgradeMsg = "Fa\u00e7a upgrade para o Plano Pro para ter mais perguntas.";
      else if (planId === "pro") upgradeMsg = "Fa\u00e7a upgrade para o Plano Plus+ para ter mais perguntas.";
      else upgradeMsg = "Volte amanh\u00e3 para continuar!";

      return {
        allowed: false,
        reason: "Voc\u00ea atingiu o limite di\u00e1rio de " + aiDailyLimit + " usos da IA. " + upgradeMsg
      };
    }

    return { allowed: true, remaining };
  },

  async send(message, modelKey = "step-3-5", imageBase64 = null) {
    const usage = this.checkUsage();
    if (!usage.allowed) throw new Error(usage.reason);

    const model = this.MODELS[modelKey];
    if (!model) throw new Error("Modelo n\u00e3o encontrado.");

    const plan = AppState.get("userPlan");
    const userLevel = this.TIER_LEVELS[plan] || 0;
    if (userLevel < this.TIER_LEVELS[model.tier]) {
      const tierLabel = { plus: "Plus+", pro: "Pro", basico: "B\u00e1sico" }[model.tier] || model.tier;
      throw new Error("O modelo " + model.label + " requer o plano " + tierLabel + ".");
    }

    const data = await this._postJSON(
      "/chat",
      { message, modelKey, imageBase64 },
      (model.timeout || 50000) + 10000
    );

    const content = data?.content || "";
    if (!content) throw new Error("A IA n\u00e3o retornou uma resposta. Tente novamente.");

    this._incrementUsage();
    return content;
  },

  async sendDirect(prompt) {
    const usage = this.checkUsage();
    if (!usage.allowed) throw new Error(usage.reason);

    const fullPrompt =
      prompt +
      "\n\nIMPORTANTE: Voc\u00ea PRECISA analisar todas as 5 compet\u00eancias e retornar o JSON completo sem exce\u00e7\u00f5es.";

    const data = await this._postJSON("/redacao", { prompt: fullPrompt }, 70000);
    const content = data?.content || "";
    if (!content) throw new Error("A IA n\u00e3o retornou uma resposta. Tente novamente.");

    this._incrementUsage();
    return content;
  },

  async _buildHeaders() {
    const headers = {
      "Content-Type": "application/json"
    };

    try {
      if (typeof Supabase !== "undefined") {
        if (typeof Supabase.getPublicConfig === "function") {
          const cfg = Supabase.getPublicConfig();
          if (cfg?.url) headers["X-Supabase-Url"] = cfg.url;
          if (cfg?.anonKey) headers["X-Supabase-Anon-Key"] = cfg.anonKey;
        }

        const client = Supabase.getClient();
        if (client) {
          let session = null;
          try {
            const sessionPromise = client.auth.getSession();
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Auth timeout')), 2000));
            const { data } = await Promise.race([sessionPromise, timeoutPromise]);
            session = data?.session;
          } catch (lockErr) {
            try {
               const lSession = localStorage.getItem("sb-" + SupabaseConfig.URL.split("//")[1].split(".")[0] + "-auth-token");
               if (lSession) session = JSON.parse(lSession);
            } catch (e) {}
          }
          if (session?.access_token) {
            headers.Authorization = "Bearer " + session.access_token;
          }
        }
      }
    } catch (error) {
      console.warn("[AIService] Failed to attach auth token:", error);
    }

    return headers;
  },

  async _postJSON(path, payload, timeoutMs = 65000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(this.API_BASE + path, {
        method: "POST",
        headers: await this._buildHeaders(),
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = data?.error || ("Erro " + response.status);
        throw new Error(message);
      }

      return data;
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("A IA demorou demais para responder. Tente novamente.");
      }
      if (error.message?.includes("Failed to fetch") || error.message?.includes("Network")) {
        throw new Error("Sem conex\u00e3o com a internet. Verifique sua rede e tente novamente.");
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  },

  _resetDailyIfNeeded() {
    const today = new Date().toISOString().split("T")[0];
    const storedDate = AppState.get("aiDailyUsageDate");
    if (storedDate !== today) {
      AppState.set("aiDailyUsage", 0);
      AppState.set("aiDailyUsageDate", today);
    }
  },

  _incrementUsage() {
    this._resetDailyIfNeeded();
    const current = AppState.get("aiDailyUsage") || 0;
    AppState.set("aiDailyUsage", current + 1);
  }
};