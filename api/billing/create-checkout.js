const {
  createStripeCheckoutSession,
  getAuthenticatedUser,
  guardCors,
  isPayloadTooLarge,
  missingCheckoutEnv,
  readBody,
  sendJson
} = require("../_shared/stripe-billing");

module.exports = async (req, res) => {
  if (!guardCors(req, res)) return;

  if (req.method !== "POST") {
    sendJson(res, 405, { error: `Metodo ${req.method} nao permitido.` });
    return;
  }

  const missing = missingCheckoutEnv();
  if (missing.length > 0) {
    sendJson(res, 500, { error: `Configuracao ausente: ${missing.join(", ")}.` });
    return;
  }

  const auth = await getAuthenticatedUser(req);
  if (auth.error) {
    sendJson(res, auth.status || 401, { error: auth.error });
    return;
  }

  if (isPayloadTooLarge(req)) {
    sendJson(res, 413, { error: "Payload muito grande." });
    return;
  }

  const body = readBody(req);
  if (!body) {
    sendJson(res, 400, { error: "Payload JSON invalido." });
    return;
  }

  if (body.planId != null && typeof body.planId !== "string") {
    sendJson(res, 400, { error: "Campo planId invalido." });
    return;
  }
  if (body.billingCycle != null && typeof body.billingCycle !== "string") {
    sendJson(res, 400, { error: "Campo billingCycle invalido." });
    return;
  }

  const planId = String(body.planId || "").trim().toLowerCase();
  const billingCycle = String(body.billingCycle || "monthly").trim().toLowerCase();

  try {
    const session = await createStripeCheckoutSession(req, auth.user, {
      planId,
      billingCycle
    });

    sendJson(res, 200, session);
  } catch (error) {
    sendJson(res, error.status || 502, {
      error: error.message || "Falha ao criar checkout no gateway."
    });
  }
};
