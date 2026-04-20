// ============================================================
// EduHub Brasil - Main App Controller
// ============================================================

const App = {
  _authHandled: false,
  _hasSession: false,

  needsOnboarding() {
    const onboardingDone = Boolean(AppState.get("onboardingDone"));

    // Do not lock legacy users out of the app because optional profile fields
    // were not historically persisted in cloud profiles.
    if (onboardingDone) return false;

    const userName = String(AppState.get("userName") || "").trim();
    const userAge = String(AppState.get("userAge") || "").trim();
    return !userName || !userAge;
  },

  async init() {
    this._authHandled = false;
    this._hasSession = false;
    this.checkDailyReset();

    // One-time data reset or migration (v3): ensure all users have the new state structure
    if (localStorage.getItem("eduhub_data_version") !== "v3") {
      AppState.migrate();
      localStorage.setItem("eduhub_data_version", "v3");
    }

    // Handle Supabase auth state changes (especially after Google redirect)
    const client = Supabase.getClient();
    if (client) {
      client.auth.onAuthStateChange(async (event, session) => {
        this._hasSession = Boolean(session);

        // Handle sign-in and OAuth restore exactly once per app boot.
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session && !this._authHandled) {
          this._authHandled = true;
          const currentUserId = String(session.user?.id || "");
          const previousUserId = String(localStorage.getItem("eduhub_last_user_id") || "");

          // If another user signs in on the same device, clear stale local data before syncing.
          if (previousUserId && currentUserId && previousUserId !== currentUserId) {
            AppState.reset();
            AppState.migrate();
          }

          if (currentUserId) {
            localStorage.setItem("eduhub_last_user_id", currentUserId);
          }

          await AppState.syncFull();

          if (this.needsOnboarding()) {
            Router.navigate("/onboarding", false, true);
          } else {
            Router.navigate("/home", false, true);
          }
        }
        if (event === 'SIGNED_OUT') {
          this._authHandled = false;
          this._hasSession = false;
          if (window.location.hash !== "#/login") {
            Router.navigate("/login", false, true);
          }
        }
      });
    }

    // Check onboarding logic (routing)
    Router.register("/onboarding", (p) => this.showPage("onboarding", p));
    // Register routes
    Router.register("/home", (p) => this.showPage("home", p));
    Router.register("/videos", (p) => this.showPage("videos", p));
    Router.register("/simulados", (p) => this.showPage("simulados", p));
    Router.register("/simulado-runner", (p) => this.showPage("simulado-runner", p));
    Router.register("/resultados", (p) => this.showPage("resultados", p));
    Router.register("/pomodoro", (p) => this.showPage("pomodoro", p));
    Router.register("/progresso", (p) => this.showPage("progresso", p));
    Router.register("/perfil", (p) => this.showPage("perfil", p));
    Router.register("/definicoes", (p) => this.showPage("perfil", p));
    Router.register("/configuracoes", (p) => this.showPage("perfil", p));
    Router.register("/settings", (p) => this.showPage("perfil", p));
    Router.register("/premium", (p) => this.showPage("premium", p));
    Router.register("/ia-tutor", (p) => this.showPage("ia-tutor", p));
    Router.register("/missoes", (p) => this.showPage("missoes", p));
    Router.register("/login", (p) => this.showPage("login", p));
    Router.register("/cadastro", (p) => this.showPage("cadastro", p));
    Router.register("/onboarding-loading", (p) => this.showPage("onboarding-loading", p));
    Router.register("/materia/:id", (p) => this.showPage("materia", p));
    Router.register("/flashcards", (p) => this.showPage("flashcards", p));
    Router.register("/redacao-ai", (p) => this.showPage("redacao-ai", p));
    Router.register("/ranking", (p) => this.showPage("ranking", p));
    Router.register("/quiz-builder", (p) => this.showPage("quiz-builder", p));
    Router.register("/termos", (p) => this.showPage("termos", p));
    Router.register("/privacidade", (p) => this.showPage("privacidade", p));

    // Apply dark mode
    if (AppState.get("darkMode")) document.documentElement.classList.add("dark");

    // Start router
    if (!AppState.get("onboardingDone") && !window.location.hash) {
      window.location.hash = "/login";
    }
    // Initialize Sound
    SoundManager.init();
    this._bindShellUI();
    this._registerServiceWorker();

    // Global Action Button Feedback
    document.addEventListener("click", (e) => {
      const target = e.target.closest("button, a, .touch-card, #bottom-nav a");
      if (target) {
        SoundManager.play("tap");
      }
    });

    Router.init();
  },

  checkDailyReset() {
    const today = new Date().toDateString();
    const lastDate = AppState.get("lastActivityDate");
    
    if (today !== lastDate) {
      console.log("[App] Novo dia detectado. Resetando contadores diários.");
      AppState.set("questionsAnsweredToday", 0);
      AppState.set("aiDailyUsage", 0);
      AppState.set("missionProgress", { m1: 0, m2: 0, m3: 0, m4: 0 });
      AppState.set("lastActivityDate", today);
      // Opcional: AppState.saveToCloud(); 
    }
  },

  showPage(name, params) {
    const container = document.getElementById("app-pages");
    const isTab = Router.TAB_ROUTES.has("/" + name);
    const alreadyCached = isTab && Router._renderedTabs.has(name);

    // Bottom nav visibility is now handled completely by Router.js

    // If this tab was already rendered and cached, skip re-rendering
    if (alreadyCached) {
      return;
    }

    let page = document.getElementById("page-" + name);
    if (!page) {
      page = document.createElement("div");
      page.id = "page-" + name;
      page.className = "page";
      container.appendChild(page);
    }

    // Render content
    const renderer = Pages[name];
    if (!renderer) {
      page.innerHTML = Security.sanitize(
        '<div class="p-6 text-center text-slate-500">Pagina indisponivel no momento.</div>'
      );
      if (typeof Router !== "undefined") {
        setTimeout(() => Router.navigate("/home", false), 0);
      }
      return;
    }

    // Sanitize and render
    page.innerHTML = Security.sanitize(renderer(params));
    // Attach events after render
    requestAnimationFrame(() => {
      if (PageEvents[name]) PageEvents[name](page, params);
      // Setup pull-to-refresh on scrollable pages
      this._setupPullToRefresh(page, name, params);
    });
  },

  // Pull-to-refresh on scroll areas
  _setupPullToRefresh(page, name, params) {
    const scrollArea = page.querySelector("main.scroll-area");
    if (!scrollArea) return;

    // Create pull indicator
    const indicator = document.createElement("div");
    indicator.className = "pull-indicator";
    indicator.innerHTML = Security.sanitize('<div class="spinner"></div>');
    scrollArea.style.position = "relative";
    scrollArea.insertBefore(indicator, scrollArea.firstChild);

    let startY = 0;
    let pulling = false;

    scrollArea.addEventListener("touchstart", (e) => {
      if (scrollArea.scrollTop <= 0) {
        startY = e.touches[0].clientY;
        pulling = true;
      }
    }, { passive: true });

    scrollArea.addEventListener("touchmove", (e) => {
      if (!pulling) return;
      const dy = e.touches[0].clientY - startY;
      if (dy > 10 && scrollArea.scrollTop <= 0) {
        indicator.classList.add("pulling");
      } else {
        indicator.classList.remove("pulling");
      }
    }, { passive: true });

    scrollArea.addEventListener("touchend", () => {
      if (indicator.classList.contains("pulling")) {
        indicator.classList.add("refreshing");
        // Simulate refresh
        setTimeout(() => {
          indicator.classList.remove("pulling", "refreshing");
          // Re-render the page content
          if (Router.TAB_ROUTES.has("/" + name)) {
            Router.invalidateTab(name);
            Router.navigate("/" + name, false);
          }
        }, 800);
      }
      pulling = false;
    }, { passive: true });
  },

  _bindShellUI() {
    const nav = document.getElementById("bottom-nav");
    if (nav && !nav.dataset.bound) {
      nav.dataset.bound = "true";
      nav.addEventListener("click", (event) => {
        const link = event.target.closest("a[data-route]");
        if (!link) return;
        event.preventDefault();
        const route = link.getAttribute("data-route");
        if (route) Router.navigate(route);
      });
    }

    const upgradeModal = document.getElementById("upgrade-modal");
    if (upgradeModal && !upgradeModal.dataset.bound) {
      upgradeModal.dataset.bound = "true";
      upgradeModal.addEventListener("click", (event) => {
        if (event.target === upgradeModal) {
          this.hideUpgradeModal();
          return;
        }

        const actionEl = event.target.closest("[data-upgrade-action]");
        if (!actionEl) return;

        const action = actionEl.getAttribute("data-upgrade-action");
        if (action === "plans") {
          this.hideUpgradeModal();
          Router.navigate("/premium");
          return;
        }

        if (action === "dismiss") {
          this.hideUpgradeModal();
        }
      });
    }
  },

  async _registerServiceWorker() {
    if (!("serviceWorker" in navigator) || window.location.protocol === "file:") return;

    try {
      await navigator.serviceWorker.register("/sw.js");
    } catch (error) {
      AppState.set("_swDisabled", true);
      console.warn("Service worker registration failed, online-only mode enabled:", error);
    }
  },

  showUpgradeModal(customMsg) {
    const m = document.getElementById("upgrade-modal");
    if (customMsg) {
      const desc = m.querySelector("p");
      if (desc) desc.textContent = customMsg;
    }
    m.classList.add("active");
  },
  hideUpgradeModal() {
    const m = document.getElementById("upgrade-modal");
    if (m) m.classList.remove("active");
  },

  showToast(message, type = "info") {
    // Remove existing toast if any
    const existing = document.getElementById("app-toast");
    if (existing) existing.remove();

    const colors = {
      success: "from-emerald-600 to-emerald-700 border-emerald-500/30",
      error: "from-red-600 to-red-700 border-red-500/30",
      warning: "from-amber-600 to-amber-700 border-amber-500/30",
      info: "from-blue-600 to-blue-700 border-blue-500/30"
    };
    const icons = {
      success: "check_circle",
      error: "error",
      warning: "warning",
      info: "info"
    };

    const toast = document.createElement("div");
    toast.id = "app-toast";
    toast.className = `fixed top-6 left-4 right-4 z-[9999] flex items-center gap-3 px-5 py-4 rounded-2xl bg-gradient-to-r ${colors[type] || colors.info} border text-white text-sm font-bold shadow-2xl transition-all duration-500 animate-in fade-in slide-in-from-top-4`;

    const icon = document.createElement("span");
    icon.className = "material-symbols-outlined text-lg";
    icon.textContent = icons[type] || icons.info;

    const label = document.createElement("span");
    label.className = "flex-1";
    label.textContent = message;

    toast.appendChild(icon);
    toast.appendChild(label);
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-20px)";
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  },
  toggleDark() {
    const d = !AppState.get("darkMode");
    AppState.set("darkMode", d);
    document.documentElement.classList.toggle("dark", d);
  },
  async switchPlan(tierId, redirectPath = '/perfil') {
    // 1. Update State
    AppState.set("userPlan", tierId);
    
    // 2. Invalidate Tabs (so they re-render with new plan permissions)
    const tabsToInvalidate = ['home', 'simulados', 'pomodoro', 'progresso'];
    tabsToInvalidate.forEach(tab => Router.invalidateTab(tab));

    // 3. Save to Cloud (Async background)
    AppState.saveToCloud().catch(err => console.error("Cloud sync failed:", err));

    // 4. Force UI Refresh
    Router.navigate(redirectPath, false, true);
    
    // 5. Success Feedback
    SoundManager.play("success");
  },
  async logout() {
    this._authHandled = false;
    this._hasSession = false;

    const clearSupabaseStorage = () => {
      const clearFrom = (storage) => {
        const keysToRemove = [];
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (!key) continue;
          const lower = key.toLowerCase();
          if (key.startsWith("sb-") || lower.includes("supabase") || lower.includes("auth-token")) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((key) => storage.removeItem(key));
      };

      try {
        clearFrom(localStorage);
        clearFrom(sessionStorage);
      } catch (storageError) {
        console.warn("Falha ao limpar storage de auth:", storageError);
      }
    };

    try {
      const client = Supabase.getClient();
      if (client) {
        const localResult = await client.auth.signOut({ scope: "local" });
        if (localResult?.error) {
          console.warn("Logout local retornou erro:", localResult.error);
        }

        // Global sign-out revokes refresh tokens server-side when possible.
        const globalResult = await client.auth.signOut({ scope: "global" });
        if (globalResult?.error) {
          console.warn("Logout global retornou erro:", globalResult.error);
        }
      }
    } catch (e) {
      console.error("Supabase logout error:", e);
    }

    clearSupabaseStorage();
    AppState.reset();
    localStorage.removeItem("eduhub_last_user_id");

    // Ensure tab cache from authenticated screens does not bleed into login state.
    if (typeof Router !== "undefined" && Router && Router.TAB_ROUTES) {
      Array.from(Router.TAB_ROUTES).forEach((route) => {
        const name = route.replace("/", "");
        if (typeof Router.invalidateTab === "function") Router.invalidateTab(name);
      });
      Router.history = [];
    }

    Router.navigate("/login", false, true);
  },
  async deleteAccount() {
    try {
      const { error } = await Supabase.deleteAccount();
      if (error) throw error;
      
      AppState.reset();
      SoundManager.play("success");
      window.location.hash = "/login";
      window.location.reload(); // Force full reload after deletion
    } catch (e) {
      console.error("Delete account error:", e);
      alert("Erro ao excluir conta. Tente novamente mais tarde.");
    }
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => App.init());
} else {
  App.init();
}

// ============================================================
// Utility helpers
// ============================================================
function enemCountdown() {
  const customDate = AppState.get("examDate");
  const target = customDate ? new Date(customDate + "T13:00:00-03:00") : APP_DATA.enemDate;
  const now = new Date();
  const diff = target - now;
  if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0 };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins: Math.floor((diff % 3600000) / 60000),
    secs: Math.floor((diff % 60000) / 1000)
  };
}

function diffBadge(d) {
  const m = { facil: ["Fácil", "badge-facil"], media: ["Média", "badge-media"], dificil: ["Difícil", "badge-dificil"] };
  const [l, c] = m[d] || m.media;
  return `<span class="px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${c}">${l}</span>`;
}

function subjColor(id) {
  const s = APP_DATA.subjects.find(s => s.id === id);
  return s ? s.color : "blue";
}

function videoCard(v, featured) {
  const thumbUrl = v.thumbnail; 
  const mqFallback = v.thumbnail.replace('hqdefault','mqdefault');
  const isPro = v.isPro;

  if (featured) {
    return `
    <div class="relative w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 cursor-pointer touch-card group" 
         onclick="window.open('${v.youtubeUrl}','_blank')">
      
      <!-- Immersive Image Layer -->
      <div class="relative aspect-[16/10] w-full bg-slate-900 overflow-hidden">
        <img class="h-full w-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" 
             src="${thumbUrl}" alt="${v.title}" 
             onerror="if(!this.src.includes('mqdefault')) this.src='${mqFallback}';" />
        
        <!-- Premium Overlays -->
        <div class="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>
        <div class="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <!-- Badges -->
        <div class="absolute top-6 left-6 z-10 flex flex-col gap-2">
          ${isPro ? `
            <div class="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl shadow-orange-500/40 border border-amber-300/30 backdrop-blur-md">
              <span class="material-symbols-outlined text-[14px] fill-icon">stars</span>
              Premium Masterclass
            </div>
          ` : `
            <div class="flex items-center gap-2 bg-white/10 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-white/20 backdrop-blur-xl">
              <span class="material-symbols-outlined text-[14px] fill-icon">auto_awesome</span>
              Recomendado
            </div>
          `}
          <div class="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-emerald-500/30 backdrop-blur-md w-fit">
            <span class="material-symbols-outlined text-[14px]">play_circle</span>
            Assista Agora
          </div>
        </div>

        <!-- Duration Badge -->
        <div class="absolute top-6 right-6 z-10 bg-black/60 text-white text-[10px] font-black px-3 py-1.5 rounded-xl backdrop-blur-lg border border-white/10">
          ${v.duration}
        </div>

        <!-- Center Play Button -->
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="w-16 h-16 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-2xl transform transition-all duration-500 group-hover:scale-110 group-active:scale-90 overflow-hidden relative">
             <span class="material-symbols-outlined text-3xl font-black z-10">play_arrow</span>
             <div class="absolute inset-0 bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
             <span class="material-symbols-outlined text-3xl font-black z-10 absolute opacity-0 group-hover:opacity-100 text-white transition-opacity">play_arrow</span>
          </div>
        </div>

        <!-- Title & Info Overlay -->
        <div class="absolute bottom-6 left-6 right-6 z-20">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">${v.subjectLabel}</span>
            <span class="w-1 h-1 rounded-full bg-slate-600"></span>
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Prof. ${v.professor}</span>
          </div>
          <h3 class="text-white font-black text-2xl leading-tight group-hover:text-emerald-400 transition-colors drop-shadow-lg">${v.title}</h3>
        </div>
      </div>
    </div>`;
  }

  // Standard List Card (Enhanced)
  return `
  <div class="flex items-center gap-4 p-4 glass-card rounded-[1.5rem] border border-white/5 cursor-pointer touch-card hover:bg-white/10 transition-all group relative overflow-hidden" 
       onclick="window.open('${v.youtubeUrl}','_blank')">
    
    <!-- Thumbnail with Hover Zoom -->
    <div class="relative w-36 h-20 rounded-2xl overflow-hidden bg-slate-900 shrink-0 shadow-lg">
      <img class="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110" 
           src="${thumbUrl}" alt="${v.title}" loading="lazy" 
           onerror="if(!this.src.includes('mqdefault')) this.src='${mqFallback}';" />
      
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent"></div>
      <div class="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[8px] font-black px-1.5 py-0.5 rounded-lg backdrop-blur-sm border border-white/10">
        ${v.duration}
      </div>

      <!-- Play Icon Overlay -->
      <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div class="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40">
          <span class="material-symbols-outlined text-lg fill-icon">play_arrow</span>
        </div>
      </div>
    </div>

    <!-- Content Area -->
    <div class="flex-1 min-w-0">
      <div class="flex flex-col h-full justify-between">
        <div class="space-y-0.5">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-[8px] font-black text-emerald-500 uppercase tracking-widest">${v.subjectLabel}</span>
            ${isPro ? '<span class="px-1.5 py-0.5 bg-amber-500/10 text-amber-500 text-[8px] font-black rounded-full border border-amber-500/20 uppercase tracking-widest">Elite</span>' : ''}
          </div>
          <h4 class="text-white text-sm font-bold leading-tight line-clamp-2 group-hover:text-emerald-400 transition-colors uppercase tracking-tight">${v.title}</h4>
        </div>
        
        <div class="flex items-center justify-between mt-2">
          <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Prof. ${v.professor}</span>
          <div class="flex items-center gap-1.5">
             ${diffBadge(v.difficulty)}
          </div>
        </div>
      </div>
    </div>

    <!-- Background Accents -->
    <div class="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-3xl -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity"></div>
  </div>`;
}
