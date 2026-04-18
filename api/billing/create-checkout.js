const {
  createMercadoPagoPreference,
  getAuthenticatedUser,
  getPlanOffer,
  guardCors,
  missingCheckoutEnv,
  readBody,
  sendJson
} = require("../_shared/billing");

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

  const body = readBody(req);
  if (!body) {
    sendJson(res, 400, { error: "Payload JSON invalido." });
    return;
  }

  const planId = String(body.planId || "").trim().toLowerCase();
  const billingCycle = String(body.billingCycle || "monthly").trim().toLowerCase();

  const offer = getPlanOffer(planId, billingCycle);
  if (!offer) {
    sendJson(res, 400, { error: "Plano ou ciclo invalido para checkout." });
    return;
  }

  try {
    const preference = await createMercadoPagoPreference(req, auth.user, offer);
    sendJson(res, 200, {
      checkoutUrl: preference.init_point || "",
      sandboxCheckoutUrl: preference.sandbox_init_point || "",
      preferenceId: preference.id || "",
      planId: offer.planId,
      billingCycle: offer.billingCycle
    });
  } catch (error) {
    sendJson(res, error.status || 502, {
      error: error.message || "Falha ao criar checkout no gateway."
    });
  }
};
