const {
  applyApprovedPayment,
  extractWebhookEvent,
  fetchMercadoPagoPayment,
  missingWebhookEnv,
  readBody,
  sendJson,
  verifyWebhookSignature
} = require("../_shared/billing");

module.exports = async (req, res) => {
  if (req.method === "GET") {
    sendJson(res, 200, { ok: true, message: "Billing webhook is ready." });
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

  const body = readBody(req) || {};
  const event = extractWebhookEvent(req, body);

  if (!event.paymentId) {
    sendJson(res, 200, {
      ok: true,
      ignored: true,
      reason: "missing-payment-id"
    });
    return;
  }

  if (event.type && event.type !== "payment") {
    sendJson(res, 200, {
      ok: true,
      ignored: true,
      reason: `unsupported-topic:${event.type}`
    });
    return;
  }

  const signature = verifyWebhookSignature(req, event.paymentId);
  if (!signature.ok) {
    sendJson(res, 401, { error: "Webhook signature invalida." });
    return;
  }

  try {
    const payment = await fetchMercadoPagoPayment(event.paymentId);
    const result = await applyApprovedPayment(payment);

    sendJson(res, 200, {
      ok: true,
      paymentId: event.paymentId,
      ...result
    });
  } catch (error) {
    sendJson(res, error.status || 502, {
      error: error.message || "Falha ao processar webhook de pagamento.",
      paymentId: event.paymentId
    });
  }
};
