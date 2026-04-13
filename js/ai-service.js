// ============================================================
// EduHub Brasil - AI Service Module
// OpenRouter integration with tier-based model routing
// ============================================================

const AIService = {
  // ── Configuration ──
  API_KEY: "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",
  API_URL: "https://openrouter.ai/api/v1/chat/completions",

  // ── Model Registry ──
  // All models are confirmed :free on OpenRouter as of March 2026
  MODELS: {
    "step-3-5": {
      id: "google/gemma-4-26b-a4b-it:free",
      label: "Gemma 4 26B (Especialista)",
      description: "Extremamente inteligente e muito veloz",
      icon: "bolt",
      color: "emerald",
      tier: "basico",
      supportsReasoning: true,
      supportsVision: false,
      timeout: 60000
    },
    "minimax": {
      id: "minimax/minimax-m2.5:free",
      label: "MiniMax M2.5",
      description: "Raciocínio lógico estruturado",
      icon: "psychology",
      color: "blue",
      tier: "pro",
      supportsReasoning: true,
      supportsVision: false,
      timeout: 50000
    },
    "nemotron-super": {
      id: "nvidia/nemotron-3-super-120b-a12b:free",
      label: "Nemotron 3 Super",
      description: "Especialista em matemática e exatas",
      icon: "neurology",
      color: "amber",
      tier: "plus",
      supportsReasoning: true,
      supportsVision: false,
      timeout: 60000
    },
    "trinity-large": {
      id: "arcee-ai/trinity-large-preview:free",
      label: "Trinity Large",
      description: "Raciocínio profundo e analítico",
      icon: "water_drop",
      color: "cyan",
      tier: "plus",
      supportsReasoning: true,
      supportsVision: false,
      timeout: 50000
    }
  },

  // ── Tier Hierarchy (for permission checks) ──
  TIER_LEVELS: { gratis: 0, basico: 1, pro: 2, plus: 3 },

  // ── Daily Limit for Básico ──
  BASIC_DAILY_LIMIT: 5,

  // ── System Prompt ──
  SYSTEM_PROMPT: `Você é o Tutor IA do EduHub Brasil, um assistente pedagógico especializado em preparação para o ENEM e vestibulares brasileiros.

Sua missão é resolver questões e explicar conceitos seguindo EXATAMENTE este padrão de formatação:

1. **Título e Contexto**: Identifique o tema da questão (Ex: Estequiometria, Termodinâmica).
2. **Tabela de Dados**: Extraia todos os valores numéricos e organize-os em uma tabela Markdown com colunas: 'Grandeza', 'Valor' e 'Unidade'.
3. **O Comando**: Destaque em negrito qual é a pergunta final (o que deve ser calculado).
4. **Fórmulas**: Liste as fórmulas necessárias em blocos de LaTeX ($$...$$).
5. **Resolução Passo a Passo**: Resolva de forma lógica, usando LaTeX para todos os cálculos intermediários. Garanta que as unidades de medida apareçam nos cálculos para facilitar o entendimento.

Regras Críticas:
- **NÃO despadronize**: Mantenha valores na mesma linha que seus rótulos (Ex: "Valor de x: 22,05").
- **Pedagogia**: Ajude o aluno a RACIOCINAR, não dê apenas a resposta direta.
- **Linguagem**: Use Português do Brasil, tom motivador e exemplos do cotidiano brasileiro.
- **LaTeX**: Use obrigatoriamente $$...$$ para todas as expressões matemáticas e cálculos intermediários.`,

  // ── Public API ──

  /**
   * Returns available models filtered by the user's plan
   */
  getAvailableModels() {
    const plan = AppState.get("userPlan");
    const userLevel = this.TIER_LEVELS[plan] || 0;

    return Object.entries(this.MODELS)
      .filter(([, model]) => userLevel >= this.TIER_LEVELS[model.tier])
      .map(([key, model]) => ({ key, ...model }));
  },

  /**
   * Checks if the user can send a message right now
   */
  checkUsage() {
    const planId = AppState.get("userPlan") || "gratis";
    this._resetDailyIfNeeded();
    const used = AppState.get("aiDailyUsage") || 0;
    
    // Pega o limite do APP_DATA.plans
    // Se APP_DATA não estiver carregado por algum motivo, usa limites padrão da nova regra
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
      if (planId === "gratis") upgradeMsg = "Faça upgrade para o Plano Básico para ter mais perguntas.";
      else if (planId === "basico") upgradeMsg = "Faça upgrade para o Plano Pro para ter mais perguntas.";
      else if (planId === "pro") upgradeMsg = "Faça upgrade para o Plano Plus+ para ter mais perguntas.";
      else upgradeMsg = "Volte amanhã para continuar!";
      
      return { allowed: false, reason: `Você atingiu o limite diário de ${aiDailyLimit} usos da IA. ${upgradeMsg}` };
    }

    return { allowed: true, remaining };
  },

  /**
   * Send a message to the AI and return the response text.
   * Includes retry logic (up to 2 attempts) with per-model timeouts.
   */
  async send(message, modelKey = "step-3-5", imageBase64 = null) {
    const usage = this.checkUsage();
    if (!usage.allowed) throw new Error(usage.reason);

    const model = this.MODELS[modelKey];
    if (!model) throw new Error("Modelo não encontrado.");

    const plan = AppState.get("userPlan");
    const userLevel = this.TIER_LEVELS[plan] || 0;
    if (userLevel < this.TIER_LEVELS[model.tier]) {
      const tierLabel = { plus: "Plus+", pro: "Pro", basico: "Básico" }[model.tier] || model.tier;
      throw new Error(`O modelo ${model.label} requer o plano ${tierLabel}.`);
    }

    // If there is an image but the model doesn't support vision, use Gemini Fallback
    let processedMessage = message;
    let finalImageBase64 = imageBase64;

    if (imageBase64 && !model.supportsVision) {
      try {
        console.log("Model", model.id, "does not support vision. Falling back to Gemini 2.0 Flash Lite for image analysis...");
        const visionBody = {
          model: "openrouter/free",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: "Descreva o conteúdo desta imagem de forma extremamente detalhada e acadêmica, transcrevendo fielmente todos os textos, números, alternativas, tabelas e fórmulas (use LaTeX $$...$$) nela contidos. Esta descrição será usada por outra IA cega para resolver a questão." },
                { type: "image_url", image_url: { url: imageBase64 } }
              ]
            }
          ],
          temperature: 0.1,
          max_tokens: 2000
        };

        const visionResponse = await fetch(this.API_URL, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${this.API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5500",
            "X-Title": "EduHub Brasil"
          },
          body: JSON.stringify(visionBody)
        });

        if (visionResponse.ok) {
          const visionData = await visionResponse.json();
          const imageDescription = visionData.choices[0].message.content;
          processedMessage = `${message}\\n\\n[Descrição da imagem fornecida pelo sistema de visão automática]:\\n${imageDescription}`;
          finalImageBase64 = null; // Do not send the image to the target model
        } else {
          console.error("Vision fallback failed", await visionResponse.text());
        }
      } catch (err) {
        console.error("Error in vision fallback:", err);
      }
    }

    const maxRetries = 3;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), model.timeout || 50000);

      try {
        let userContent = processedMessage;
        if (finalImageBase64) {
          userContent = [
            { type: "text", text: processedMessage || "Qual é a sua análise sobre esta imagem?" },
            { type: "image_url", image_url: { url: finalImageBase64 } }
          ];
        }

        const body = {
          model: model.id,
          messages: [
            { role: "system", content: this.SYSTEM_PROMPT },
            { role: "user", content: userContent }
          ],
          temperature: 0.7,
          max_tokens: 1500
        };

        // Structured reasoning for supported models
        if (model.supportsReasoning) {
          body.reasoning = { enabled: true };
        }

        const response = await fetch(this.API_URL, {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Authorization": `Bearer ${this.API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin || "https://eduhub.brasil.app",
            "X-Title": "EduHub Brasil"
          },
          body: JSON.stringify(body)
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const msg = errorData?.error?.message || `Erro ${response.status}`;
          throw new Error(msg);
        }

        const data = await response.json();
        let content = data?.choices?.[0]?.message?.content || "";

        // Strip <think>...</think> blocks some models (Qwen) prepend before the answer
        if (model.hasThinkingBlocks && content) {
          content = content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
        }

        if (!content) throw new Error("A IA não retornou uma resposta. Tente novamente.");

        // Incrementar uso para todos os planos caso tenha sucesso
        this._incrementUsage();

        return content;

      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error;
        console.warn(`[AIService] Tentativa ${attempt}/${maxRetries} falhou (${model.label}):`, error.message);

        // Don't retry on auth or plan errors
        if (error.message.includes("requires") || error.message.includes("plano")) throw error;

        if (attempt < maxRetries) {
          const delay = 1200 + (attempt * 1000); // Exponential backoff Lite
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    if (lastError?.name === "AbortError" || lastError?.message?.includes("abort")) {
      throw new Error(`O modelo ${model.label} demorou demais. Tente um modelo mais rápido como Step 3.5 Flash.`);
    }
    if (lastError?.message?.includes("Failed to fetch") || lastError?.message?.includes("Network")) {
      throw new Error("Sem conexão com a internet. Verifique sua rede e tente novamente.");
    }
    throw lastError || new Error("Não foi possível obter uma resposta. Tente novamente.");
  },

  async sendDirect(prompt) {
    if (!this.API_KEY) throw new Error("Chave da API não configurada.");

    // Verifica limite antes de enviar
    const usage = this.checkUsage();
    if (!usage.allowed) throw new Error(usage.reason);

    // Cadeia de modelos Google (ambos confirmados :free no OpenRouter)
    // NÃO usamos reasoning aqui pois a redação precisa de JSON puro e rápido
    const modelChain = [
      { id: "google/gemma-4-26b-a4b-it:free", label: "Gemma 4 26B A4B", timeout: 55000 },
      { id: "google/gemma-4-31b-it:free", label: "Gemma 4 31B", timeout: 55000 }
    ];

    const fullPrompt = prompt + "\n\nIMPORTANTE: Você PRECISA analisar todas as 5 competências e retornar o JSON completo sem exceções.";
    let lastError = null;

    for (const model of modelChain) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), model.timeout);

      try {
        console.log(`[Redação AI] Tentando modelo: ${model.label}...`);

        const body = {
          model: model.id,
          messages: [{ role: "user", content: fullPrompt }],
          temperature: 0.3,
          max_tokens: 3000
        };

        const response = await fetch(this.API_URL, {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Authorization": `Bearer ${this.API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://eduhub.brasil.app",
            "X-Title": "EduHub Brasil"
          },
          body: JSON.stringify(body)
        });

        clearTimeout(timeoutId);

        // Se 429 (rate limit), pula para o próximo modelo
        if (response.status === 429) {
          console.warn(`[Redação AI] ${model.label} retornou 429 (rate limit). Tentando próximo modelo...`);
          lastError = new Error(`Rate limit no modelo ${model.label}`);
          continue;
        }

        if (!response.ok) throw new Error(`Erro API ${response.status} (${model.label})`);

        const data = await response.json();
        let content = data?.choices?.[0]?.message?.content || "";

        // Remove blocos <think>...</think> de modelos com reasoning
        content = content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

        if (content) {
          console.log(`[Redação AI] Sucesso com ${model.label}`);
          this._incrementUsage();
          return content;
        }

        throw new Error("Resposta vazia da IA.");
      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error;
        console.warn(`[Redação AI] ${model.label} falhou:`, error.message);
        // Continua para o próximo modelo da cadeia
      }
    }

    if (lastError?.name === "AbortError") {
      throw new Error("A IA excedeu o tempo limite. Verifique sua conexão ou tente um texto menor.");
    }
    throw new Error("Não foi possível obter uma resposta. Os servidores de IA estão sobrecarregados. Tente novamente em 1 minuto.");
  },

  // ── Private Helpers ──

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
