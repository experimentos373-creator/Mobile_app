const {
  applyStripeEvent,
  constructStripeEvent,
  guardCors,
  missingWebhookEnv,
  sendJson
} = require("../_shared/stripe-billing");

module.exports = async (req, res) => {
  if (!guardCors(req, res, { allowMissingOrigin: true })) return;

  if (req.method === "GET") {
    sendJson(res, 200, { ok: true, message: "Stripe billing webhook is ready." });
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: `Metodo ${req.method} nao permitido.` });
    return;
  }

  const missing = missingWebhookEnv();
  if (missing.length > 0) {
    sendJson(res, 500, { error: `Configuracao ausente: ${missing.join(", ")}.` });
    return;
  }

  try {
    const event = await constructStripeEvent(req);
    const result = await applyStripeEvent(event);

    sendJson(res, 200, {
      ok: true,
      eventType: event.type,
      ...result
    });
  } catch (error) {
    sendJson(res, error.status || 502, {
      error: error.message || "Falha ao processar webhook Stripe."
    });
  }
};
