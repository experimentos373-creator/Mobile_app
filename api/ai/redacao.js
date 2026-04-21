const {
  REDACAO_MODELS,
  assertMethod,
  callOpenRouter,
  consumeRateLimit,
  getAuthenticatedContext,
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

  if (!requirePlan(res, auth.userPlan, "plus")) return;

  const rateScope = "ai-redacao";
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

  const body = readBody(req);
  if (!body) {
    sendJson(res, 400, { error: "Payload JSON invalido." });
    return;
  }

  const prompt = String(body.prompt || "").trim();
  if (!prompt) {
    sendJson(res, 400, { error: "Envie o texto da redacao para correcao." });
    return;
  }

  let lastError = null;

  for (const model of REDACAO_MODELS) {
    try {
      const requestBody = {
        model: model.id,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 2000
      };

      const data = await callOpenRouter(req, requestBody, model.timeout);
      let content = data?.choices?.[0]?.message?.content || "";
      content = content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

      if (content) {
        sendJson(res, 200, { content });
        return;
      }

      throw new Error("Resposta vazia da IA.");
    } catch (error) {
      lastError = error;
    }
  }

  sendJson(res, 502, {
    error: normalizeAiError(
      lastError,
      "Nao foi possivel obter uma resposta. Os servidores de IA estao sobrecarregados. Tente novamente em 1 minuto."
    )
  });
};
