const BillingService = {
  API_BASE: "/api/billing",
  _focusSyncBound: false,

  async _buildHeaders() {
    const headers = {
      "Content-Type": "application/json"
    };

    try {
      if (typeof Supabase !== "undefined") {
        const client = Supabase.getClient();
        if (client) {
          const {
            data: { session }
          } = await client.auth.getSession();
          if (session && session.access_token) {
            headers.Authorization = `Bearer ${session.access_token}`;
          }
        }
      }
    } catch (error) {
      console.warn("[BillingService] Failed to build auth headers:", error);
    }

    return headers;
  },

  async _postJSON(path, payload, timeoutMs = 20000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${this.API_BASE}${path}`, {
        method: "POST",
        headers: await this._buildHeaders(),
        body: JSON.stringify(payload || {}),
        signal: controller.signal
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = data.error || `Erro ${response.status}`;
        throw new Error(message);
      }

      return data;
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("Checkout demorou demais para responder.");
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  },

  async createCheckout(planId, billingCycle) {
    return this._postJSON("/create-checkout", {
      planId,
      billingCycle
    });
  },

  _bindFocusSync() {
    if (this._focusSyncBound) return;
    this._focusSyncBound = true;

    window.addEventListener("focus", async () => {
      await this.syncPlanFromCloud();
    });
  },

  async syncPlanFromCloud() {
    if (typeof AppState === "undefined" || typeof AppState.syncFull !== "function") return;

    const previousPlan = AppState.get("userPlan");
    await AppState.syncFull();
    const currentPlan = AppState.get("userPlan");

    if (previousPlan !== currentPlan) {
      const tabsToInvalidate = ["home", "simulados", "progresso", "perfil", "premium"];
      if (typeof Router !== "undefined") {
        tabsToInvalidate.forEach((tab) => {
          if (typeof Router.invalidateTab === "function") Router.invalidateTab(tab);
        });
      }

      if (typeof App !== "undefined" && typeof App.showToast === "function") {
        const planName = (APP_DATA && APP_DATA.plans && APP_DATA.plans[currentPlan] && APP_DATA.plans[currentPlan].name) || currentPlan;
        App.showToast(`Plano atualizado: ${planName}`, "success");
      }
    }
  },

  async startCheckout(planId, billingCycle) {
    this._bindFocusSync();

    const data = await this.createCheckout(planId, billingCycle);
    const checkoutUrl = data.checkoutUrl || data.sandboxCheckoutUrl;

    if (!checkoutUrl) {
      throw new Error("Gateway nao retornou URL de checkout.");
    }

    window.open(checkoutUrl, "_blank", "noopener,noreferrer");
    return data;
  }
};

window.BillingService = BillingService;
