const {
  SYSTEM_PROMPT,
  assertMethod,
  buildVisionFallback,
  callOpenRouter,
  consumeRateLimit,
  getAuthenticatedContext,
  getModel,
  guardCors,
  normalizeAiError,
  readBody,
  requireOpenRouterKey,
  requirePlan,
  sendJson
} = require("../_shared/openrouter");

module.exports = async (req, res) => {
  if (!guardCors(req, res)) return;
  if (!assertMethod(req, res) || !requireOpenRouterKey(res)) return;

  const auth = await getAuthenticatedContext(req);
  if (auth.error) {
    sendJson(res, auth.status, { error: auth.error });
    return;
  }

  const body = readBody(req);
  if (!body) {
    sendJson(res, 400, { error: "Payload JSON invalido." });
    return;
  }

  const message = String(body.message || "").trim();
  const modelKey = String(body.modelKey || "").trim();
  const imageBase64 = typeof body.imageBase64 === "string" ? body.imageBase64 : null;

  if (imageBase64) {
    if (!imageBase64.startsWith("data:image/")) {
      sendJson(res, 400, { error: "Formato de imagem invalido." });
      return;
    }

    const delimiterIndex = imageBase64.indexOf(",");
    if (delimiterIndex === -1) {
      sendJson(res, 400, { error: "Imagem invalida." });
      return;
    }

    const base64Payload = imageBase64.slice(delimiterIndex + 1);
    const estimatedBytes = Math.floor((base64Payload.length * 3) / 4);
    const maxBytes = 5 * 1024 * 1024;

    if (estimatedBytes > maxBytes) {
      sendJson(res, 413, { error: "Imagem muito grande. Limite de 5MB." });
      return;
    }
  }

  if (!message && !imageBase64) {
    sendJson(res, 400, { error: "Envie uma pergunta ou imagem para a IA." });
    return;
  }

  const model = getModel(modelKey);
  if (!model) {
    sendJson(res, 400, { error: "Modelo de IA invalido." });
    return;
  }

  if (!requirePlan(res, auth.userPlan, model.tier)) return;

  const rateScope = "ai-chat";
  const rateState = consumeRateLimit(auth.user.id, auth.userPlan, rateScope);
  if (!rateState.allowed) {
    res.setHeader("Retry-After", String(rateState.retryAfter));
    sendJson(res, 429, {
      error: "Limite diario de uso de IA atingido. Tente novamente mais tarde.",
      limit: rateState.limit,
      remaining: 0
    });
    return;
  }

  let processedMessage = message;
  let finalImageBase64 = imageBase64;

  try {
    if (imageBase64 && !model.supportsVision) {
      const description = await buildVisionFallback(req, imageBase64);
      if (description) {
        processedMessage =
          (message || "Analise esta imagem.") +
          "\n\n[Descricao da imagem fornecida pelo sistema de visao automatica]:\n" +
          description;
        finalImageBase64 = null;
      }
    }

    const userContent = finalImageBase64
      ? [
          { type: "text", text: processedMessage || "Qual e a sua analise sobre esta imagem?" },
          { type: "image_url", image_url: { url: finalImageBase64 } }
        ]
      : processedMessage;

    const requestBody = {
      model: model.id,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent }
      ],
      temperature: 0.4,
      max_tokens: 1500
    };

    if (model.supportsReasoning) {
      requestBody.reasoning = { enabled: true };
    }

    let lastError = null;
    const fallbackModelId = "meta-llama/llama-3.1-8b-instruct:free";
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const data = await callOpenRouter(req, requestBody, model.timeout || 60000);
        const content = data?.choices?.[0]?.message?.content || "";
        if (!content) {
          throw new Error("A IA nao retornou uma resposta. Tente novamente.");
        }

        sendJson(res, 200, { content });
        return;
      } catch (error) {
        lastError = error;
        if (attempt < 3) {
          const baseDelayMs = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
          const jitterMs = Math.floor(Math.random() * 250);
          await new Promise((resolve) => setTimeout(resolve, baseDelayMs + jitterMs));
        }
      }
    }

    // Last-resort fallback: if the selected upstream model is unstable,
    // retry once with a highly available baseline model.
    if (requestBody.model !== fallbackModelId) {
      try {
        const fallbackBody = {
          ...requestBody,
          model: fallbackModelId
        };

        const fallbackData = await callOpenRouter(req, fallbackBody, 60000);
        const fallbackContent = fallbackData?.choices?.[0]?.message?.content || "";
        if (fallbackContent) {
          sendJson(res, 200, {
            content: fallbackContent,
            fallbackModel: fallbackModelId
          });
          return;
        }
      } catch (fallbackError) {
        lastError = fallbackError;
      }
    }

    sendJson(res, 502, {
      error: normalizeAiError(
        lastError,
        `O modelo ${model.label} demorou demais. Tente novamente em instantes.`
      )
    });
  } catch (error) {
    sendJson(res, error.status || 500, { error: normalizeAiError(error) });
  }
};
