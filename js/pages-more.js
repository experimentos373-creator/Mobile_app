// ── LOGIN PAGE ──
Pages.login = () => `
  <main class="flex-1 scroll-area bg-slate-900 flex flex-col justify-center p-6 text-white relative">
    <div class="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
    <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
    
    <div class="relative z-10 w-full max-w-sm mx-auto">
      <div class="flex flex-col items-center mb-10">
        <div class="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center mb-4 border border-emerald-500/30">
          <span class="material-symbols-outlined text-4xl text-emerald-400">school</span>
        </div>
        <h1 class="text-3xl font-black tracking-tight">EduHub Brasil</h1>
        <p class="text-slate-400 text-sm mt-2">Acesse sua conta para continuar</p>
      </div>

      <div class="space-y-4 mb-8">
        <div>
          <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2 ml-1">E-mail</label>
          <input type="email" id="login-email" class="w-full bg-slate-800/50 border border-white/10 rounded-2xl p-4 text-white focus:border-emerald-500 focus:ring-0 transition-all font-bold" placeholder="seu@email.com">
        </div>
        <div>
          <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2 ml-1">Senha</label>
          <input type="password" id="login-pass" class="w-full bg-slate-800/50 border border-white/10 rounded-2xl p-4 text-white focus:border-emerald-500 focus:ring-0 transition-all font-bold" placeholder="••••••••">
        </div>
      </div>

      <div id="login-error" class="hidden bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg mb-4"></div>

      <button id="login-btn" class="w-full py-4 bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transform transition-all active:scale-95 mb-3">
        ENTRAR <span class="material-symbols-outlined font-black">login</span>
      </button>

      <div class="flex items-center gap-4 my-4">
        <div class="flex-1 h-px bg-white/10"></div>
        <span class="text-[10px] font-black text-slate-600 uppercase tracking-widest">ou</span>
        <div class="flex-1 h-px bg-white/10"></div>
      </div>

      <button id="google-login-btn" class="w-full py-4 bg-white text-slate-900 font-bold rounded-2xl shadow-xl flex items-center justify-center gap-3 transform transition-all active:scale-95 mb-8">
        <svg class="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          <path fill="none" d="M0 0h24v24H0z"/>
        </svg>
        Continuar com Google
      </button>

      <p class="text-center text-sm text-slate-500">
        Não tem uma conta? 
        <button onclick="Router.navigate('/cadastro')" class="text-emerald-400 font-bold hover:underline">Cadastre-se</button>
      </p>
    </div>
  </main>`;

PageEvents.login = (page) => {
    const btn = page.querySelector("#login-btn");
    const errorEl = page.querySelector("#login-error");

    function showError(msg) {
        errorEl.textContent = msg;
        errorEl.classList.remove("hidden");
        btn.disabled = false;
        btn.innerHTML = 'ENTRAR <span class="material-symbols-outlined font-black">login</span>';
    }

    function friendlyError(msg) {
        if (!msg) return "Erro desconhecido. Tente novamente.";
        if (msg.includes("Invalid login") || msg.includes("invalid_credentials")) return "E-mail ou senha incorretos.";
        if (msg.includes("Email not confirmed")) return "Confirme seu e-mail antes de entrar.";
        if (msg.includes("not configured") || msg.includes("não configurada")) return "Modo offline ativo.";
        return msg;
    }

    btn.addEventListener("click", async () => {
        const email = page.querySelector("#login-email").value.trim();
        const pass = page.querySelector("#login-pass").value;
        errorEl.classList.add("hidden");

        if (!email || !pass) return showError("Preencha todos os campos.");

        btn.disabled = true;
        btn.innerHTML = '<div class="spinner size-5 border-2 border-white/30 border-t-white"></div>';

        try {
            const { data, error } = await Supabase.signIn(email, pass);
            if (error) {
                return showError(friendlyError(error.message));
            }

            if (data?.session?.user?.id && typeof Supabase.ensureProfile === "function") {
                await Supabase.ensureProfile(data.session.user.id);
            }

            // Sucesso real no Supabase
            await AppState.syncFull();
          const shouldOnboard =
            typeof App !== "undefined" && typeof App.needsOnboarding === "function"
              ? App.needsOnboarding()
              : !AppState.get("onboardingDone");
          Router.navigate(shouldOnboard ? "/onboarding" : "/home");
        } catch (e) {
            showError("Sem conexão com o servidor. Tente novamente.");
        }
    });

    page.querySelector("#google-login-btn").addEventListener("click", async () => {
        try {
            const { data, error } = await Supabase.signInWithGoogle();
            if (error) showError(friendlyError(error.message));
        } catch(e) {
            showError("Falha ao abrir Google. Tente outro método.");
        }
    });
};


// ── CADASTRO PAGE ──
Pages.cadastro = () => `
  <main class="flex-1 scroll-area bg-slate-900 flex flex-col justify-center p-6 text-white relative">
    <div class="absolute -top-24 -left-24 w-64 h-64 bg-primary/30 rounded-full blur-3xl"></div>
    
    <div class="relative z-10 w-full max-w-sm mx-auto">
      <div class="flex items-center gap-2 mb-8"><button onclick="Router.back()"><span class="material-symbols-outlined text-slate-400">arrow_back</span></button></div>
      
      <div class="mb-10">
        <h1 class="text-3xl font-black tracking-tight">Criar Conta</h1>
        <p class="text-slate-400 text-sm mt-2">Junte-se a milhares de estudantes</p>
      </div>

      <div class="space-y-4 mb-8">
        <div>
          <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2 ml-1">Nome Completo</label>
          <input type="text" id="reg-name" class="w-full bg-slate-800/50 border border-white/10 rounded-2xl p-4 text-white focus:border-emerald-500 focus:ring-0 transition-all font-bold" placeholder="Seu nome">
        </div>
        <div>
          <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2 ml-1">E-mail</label>
          <input type="email" id="reg-email" class="w-full bg-slate-800/50 border border-white/10 rounded-2xl p-4 text-white focus:border-emerald-500 focus:ring-0 transition-all font-bold" placeholder="seu@email.com">
        </div>
        <div>
          <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2 ml-1">Senha (mín. 6 chars)</label>
          <input type="password" id="reg-pass" class="w-full bg-slate-800/50 border border-white/10 rounded-2xl p-4 text-white focus:border-emerald-500 focus:ring-0 transition-all font-bold" placeholder="••••••••">
        </div>
      </div>

      <div id="reg-error" class="hidden bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg mb-4"></div>

      <button id="reg-btn" class="w-full py-4 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 transform transition-all active:scale-95 mb-4">
        CRIAR CONTA <span class="material-symbols-outlined font-black">person_add</span>
      </button>

      <p class="text-center text-sm text-slate-500">
        Já tem uma conta? 
        <button onclick="Router.navigate('/login')" class="text-emerald-400 font-bold hover:underline">Entre aqui</button>
      </p>
    </div>
  </main>`;

PageEvents.cadastro = (page) => {
  function showRegError(errorEl, buttonEl, message) {
    errorEl.textContent = message;
    errorEl.classList.remove("hidden");
    buttonEl.disabled = false;
    buttonEl.innerHTML = 'CRIAR CONTA <span class="material-symbols-outlined font-black">person_add</span>';
  }

  function friendlySignUpError(message) {
    if (!message) return "Nao foi possivel criar sua conta. Tente novamente.";
    if (message.includes("User already registered") || message.includes("already registered")) {
      return "Este e-mail ja esta cadastrado. Tente entrar no login.";
    }
    if (message.includes("Password should be at least")) {
      return "Senha muito curta. Use pelo menos 6 caracteres.";
    }
    if (message.includes("Invalid email")) {
      return "E-mail invalido. Confira e tente novamente.";
    }
    return message;
  }

    page.querySelector("#reg-btn").addEventListener("click", async () => {
        try {
            const name = page.querySelector("#reg-name").value;
            const email = page.querySelector("#reg-email").value;
            const pass = page.querySelector("#reg-pass").value;
            const errorEl = page.querySelector("#reg-error");
            
            if (!name || !email || !pass) {
                errorEl.textContent = "Preencha todos os campos.";
                errorEl.classList.remove("hidden");
                return;
            }
            if (pass.length < 6) {
                errorEl.textContent = "Senha deve ter pelo menos 6 caracteres.";
                errorEl.classList.remove("hidden");
                return;
            }

            const btn = page.querySelector("#reg-btn");
            btn.disabled = true;
            btn.innerHTML = '<div class="spinner size-5 border-2 border-white/30 border-t-white"></div>';

            const { data, error } = await Supabase.signUp(email, pass, { full_name: name });
            if (error) {
              showRegError(errorEl, btn, friendlySignUpError(error.message));
              return;
            }

            if (!data || !data.user) {
              showRegError(errorEl, btn, "Cadastro nao concluido. Tente novamente em instantes.");
              return;
            }

            if (data?.session?.user?.id && typeof Supabase.ensureProfileFromSession === "function") {
              await Supabase.ensureProfileFromSession(name);
            }

            // Salvar dados locais apenas apos criacao real no auth.
            AppState.set("userName", name);
            AppState.set("userEmail", email);
            AppState.set("onboardingDone", false);

            // Sempre avançar para onboarding
            Router.navigate("/onboarding");
        } catch (e) {
            const errorEl = page.querySelector("#reg-error");
            const btn = page.querySelector("#reg-btn");
            showRegError(errorEl, btn, "Sem conexao com o servidor. Tente novamente.");
        }
    });
};

// ── UTILS ──
const handlePlanSelect = (tierId) => {
    const plan = APP_DATA.plans[tierId];
    const isSemestral = document.querySelector("#premium-page")?.classList.contains("is-semestral");
    const cycleLabel = isSemestral ? "SEMESTRAL" : "MENSAL";
  const billingCycle = isSemestral ? "semestral" : "monthly";

    // Create Premium Overlay
    const overlay = document.createElement("div");
    overlay.className = "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-xl animate-fade-in";
    overlay.innerHTML = `
        <div class="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-500/40 animate-bounce-in">
            <span class="material-symbols-outlined text-5xl text-slate-950 font-black">check</span>
        </div>
        <h2 class="mt-8 text-2xl font-black text-white tracking-tight uppercase animate-slide-up">Plano ${cycleLabel} Ativado!</h2>
        <p class="mt-2 text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-slide-up">Preparando sua experiência Elite...</p>
    `;
    document.body.appendChild(overlay);

    // Audio Feedback
    SoundManager.play("success");

    // Set Plan & Navigate using the centralized App.switchPlan
    setTimeout(async () => {
      AppState.set("billingCycle", billingCycle);

      try {
        if (tierId !== "gratis" && typeof BillingService !== "undefined") {
          await BillingService.startCheckout(tierId, billingCycle);
          if (typeof App !== "undefined" && typeof App.showToast === "function") {
            App.showToast(
              "Checkout aberto. Apos pagar, seu plano sera liberado automaticamente.",
              "success"
            );
          }
          setTimeout(() => overlay.remove(), 500);
          return;
        }
      } catch (error) {
        console.warn("[Premium] Checkout indisponivel, usando fallback local:", error.message);
        if (typeof App !== "undefined" && typeof App.showToast === "function") {
          App.showToast("Gateway indisponivel agora. Modo teste local ativado.", "warning");
        }
      }

      App.switchPlan(tierId, "/progresso");
      setTimeout(() => overlay.remove(), 500);
    }, 1800);
};

  window.handlePlanSelect = handlePlanSelect;

// ── PREMIUM PAGE ──
Pages.premium = () => {
  const planInfo = APP_DATA.plans;
  const currentPlan = AppState.get("userPlan");
  
  // Custom CSS for Billing Toggle (Semestral)
  if (!document.getElementById("premium-toggle-styles")) {
    const style = document.createElement("style");
    style.id = "premium-toggle-styles";
    style.textContent = `
      .billing-toggle-container { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-bottom: 2rem; }
      .toggle-switch { width: 48px; height: 24px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; position: relative; cursor: pointer; transition: all 0.3s ease; }
      .toggle-circle { width: 18px; height: 18px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 3px; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); box-shadow: 0 0 10px rgba(0,0,0,0.5); }
      .is-semestral .toggle-switch { background: #06b6d4; border-color: #06b6d4; }
      .is-semestral .toggle-circle { transform: translateX(23px); }
      .price-monthly, .price-semestral { transition: all 0.3s ease; }
      .is-semestral .price-monthly { display: none; }
      .price-semestral { display: none; }
      .is-semestral .price-semestral { display: block; }

      .elite-badge {
        position: absolute;
        top: -12px;
        right: 20px;
        padding: 6px 14px;
        border-radius: 12px;
        font-weight: 900;
        font-size: 11px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: white;
        z-index: 40;
        box-shadow: 0 4px 15px rgba(0,0,0,0.4);
        animation: badgePulse 2s infinite ease-in-out;
      }
      @keyframes badgePulse {
        0%, 100% { transform: scale(1); filter: brightness(1); }
        50% { transform: scale(1.05); filter: brightness(1.2); }
      }
    `;
    document.head.appendChild(style);
  }

  return `
  <div id="premium-page" class="relative flex min-h-full flex-col bg-slate-950 overflow-x-hidden">
    <main class="flex-1 scroll-area px-6 safe-bottom relative z-20 space-y-8">
      <!-- Premium Glass Header -->
      <header class="pt-12 pb-6 text-white relative overflow-hidden">
        <div class="relative z-10 max-w-2xl mx-auto">
          <div class="flex items-center gap-4 mb-4">
            <button onclick="Router.back()" class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white/80 hover:bg-white/10 transition-colors">
              <span class="material-symbols-outlined">arrow_back</span>
            </button>
            <p class="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">Loja EduHub Brasil</p>
          </div>
          <h1 class="text-4xl font-black leading-tight mb-4 tracking-tight-compact text-display">Sua Jornada <span class="text-emerald-400 italic">Elite</span> Começa Aqui</h1>
          <p class="text-slate-400 text-sm font-medium max-w-[300px] leading-relaxed">Desbloqueie ferramentas exclusivas e acelere sua aprovação com IA e métricas PRO.</p>
        </div>
        
        <!-- Abstract Decors -->
        <div class="absolute -top-10 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -z-0"></div>
      </header>

      <!-- Launch Banner -->
      <div class="max-w-2xl mx-auto w-full px-2 mb-4 animate-in">
         <div class="relative overflow-hidden p-6 rounded-[32px] bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 border border-emerald-500/30">
            <div class="absolute -top-6 -right-6 size-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
            <div class="relative z-10 flex items-center gap-4">
               <div class="size-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <span class="material-symbols-outlined text-emerald-400 animate-pulse">rocket_launch</span>
               </div>
               <div>
                  <h4 class="text-sm font-black text-white uppercase tracking-widest leading-none mb-1">Oferta de Lançamento</h4>
                  <p class="text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest">Os maiores descontos da história do EduHub</p>
               </div>
            </div>
         </div>
      </div>

      <!-- Billing Cycle Toggle -->
      <div class="max-w-2xl mx-auto w-full px-2">
         <div class="billing-toggle-container group">
            <span class="text-[11px] font-black uppercase tracking-widest text-slate-400 transition-colors duration-300 toggle-label-monthly">Mensal</span>
            <div id="billing-cycle-toggle" class="toggle-switch">
               <div class="toggle-circle shadow-lg shadow-black/50"></div>
            </div>
            <div class="flex items-center gap-2">
               <span class="text-[11px] font-black uppercase tracking-widest text-slate-600 transition-colors duration-300 toggle-label-semestral">Semestral</span>
               <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-400 uppercase tracking-widest whitespace-nowrap animate-pulse">OFERTA 6 MESES</span>
            </div>
         </div>
      </div>

      <!-- Plan Cards Container -->
      <div id="plans-container" class="flex flex-col gap-10 pb-10">
        
        <!-- Plan: Grátis (Permanent) -->
        <div class="glass-card bg-slate-900/40 p-6 rounded-[32px] border ${currentPlan === 'gratis' ? 'border-emerald-500/50 shadow-2xl shadow-emerald-500/10' : 'border-white/5'} relative group transition-all duration-500 pt-12 opacity-60 grayscale-[0.5]">
          <div class="absolute -top-5 left-1/2 -translate-x-1/2 z-30">
            <span class="bg-slate-800 text-white/50 text-[11px] font-black px-6 py-2 rounded-full uppercase tracking-widest border border-white/5">
              ACESSO INICIAL
            </span>
          </div>
          <div class="flex justify-between items-start mb-6">
            <div>
              <h3 class="text-xl font-black text-white/80 tracking-tight uppercase">${planInfo.gratis.name}</h3>
              <p class="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-1">Experimente o Essencial</p>
            </div>
            <div class="text-right">
              <div class="text-2xl font-black text-white/40 tracking-tighter">Grátis</div>
            </div>
          </div>
          <button class="w-full py-4 rounded-2xl bg-white/5 text-white/30 font-black text-[9px] uppercase tracking-[0.2em] mb-6 border border-white/5 pointer-events-none">
            ${currentPlan === "gratis" ? "Plano Ativo" : "Permanecer no Grátis"}
          </button>
          <ul class="space-y-3">
            ${planInfo.gratis.features.map(f => `
              <li class="flex items-center gap-3 text-[11px] font-medium text-slate-600">
                <span class="material-symbols-outlined text-slate-700 text-base">check_circle</span>
                <span>${f}</span>
              </li>
            `).join("")}
          </ul>
        </div>

        <!-- Tiered Plans Wrapper -->
        ${['basico', 'pro', 'plus'].map(tier => {
          const info = planInfo[tier];
          const color = tier === 'basico' ? 'cyan' : (tier === 'pro' ? 'indigo' : 'indigo');
          const borderClass = currentPlan === tier ? `border-${color}-500/50 shadow-2xl shadow-${color}-500/20` : 'border-white/10';
          const badgeGradient = tier === 'plus' ? 'from-amber-500 to-orange-600' : 'from-rose-500 to-red-600';
          
          return `
          <div class="glass-card bg-slate-900/90 p-6 rounded-[40px] border ${borderClass} relative group transition-all duration-500 shadow-2xl pt-12 overflow-visible">
            <!-- Floating Elite Badge -->
            <div class="elite-badge bg-gradient-to-r ${badgeGradient} shadow-${tier}-500/30">
              <span class="price-monthly">${info.monthly.discount}% OFF</span>
              <span class="price-semestral">${info.semestral.discount}% OFF</span>
            </div>

            <!-- Background Glow -->
            <div class="absolute -top-10 -right-10 w-32 h-32 bg-${color}-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>

            <div class="absolute -top-5 left-1/2 -translate-x-1/2 z-30">
              <span class="bg-${color}-600 text-white text-[13px] font-black px-6 py-2.5 rounded-full uppercase tracking-tighter shadow-lg shadow-${color}-500/20 whitespace-nowrap">
                ${info.name}
              </span>
            </div>

            <div class="mb-6 flex flex-col">
              <div class="flex justify-between items-start">
                <h3 class="text-3xl font-black text-white tracking-tighter uppercase mb-0.5">${info.name}</h3>
                <div class="text-right text-display">
                  <!-- Prices Monthly -->
                  <div class="price-monthly">
                    <span class="text-sm font-bold text-slate-500 line-through opacity-70">${info.monthly.original}</span>
                    <div class="text-3xl font-black text-white tracking-tighter">${info.monthly.price}<span class="text-xs text-slate-500 lowercase ml-1">/mês</span></div>
                  </div>
                  <!-- Prices Semestral -->
                  <div class="price-semestral scale-110 origin-right transition-all">
                    <span class="text-sm font-bold text-slate-500 line-through opacity-70">${info.semestral.original}</span>
                    <div class="text-3xl font-black text-emerald-400 tracking-tighter">${info.semestral.price}<span class="text-[10px] text-slate-500 lowercase ml-1">/6m</span></div>
                    <p class="text-[10px] font-black text-cyan-400 uppercase tracking-widest mt-1">Pague 4, Leve 6! 🎁</p>
                    <p class="text-[9px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">2 MESES GRÁTIS</p>
                  </div>
                </div>
              </div>
              <p class="text-[10px] font-black text-${color}-400 uppercase tracking-widest -mt-1">Evolução acelerada</p>
            </div>
            
            <button onclick="handlePlanSelect('${tier}')" 
                    class="w-full py-5 rounded-3xl bg-${color}-600 text-white font-black text-[11px] uppercase tracking-[0.2em] mb-8 shadow-xl shadow-${color}-600/30 hover:brightness-110 active:scale-95 transition-all outline-none border border-${color}-400/20">
              ${currentPlan === tier ? "Seu Plano Atual" : `Assinar ${info.name}`}
            </button>
            
            <ul class="grid grid-cols-1 gap-4">
              ${info.features.map(f => `
                <li class="flex items-center gap-3 text-xs font-semibold text-slate-300">
                  <div class="size-6 rounded-full bg-${color}-500/10 flex items-center justify-center border border-${color}-500/20">
                     <span class="material-symbols-outlined text-${color}-400 text-sm">check_circle</span>
                  </div>
                  <span>${f}</span>
                </li>
              `).join("")}
            </ul>
          </div>
          `;
        }).join("")}

      </div>
    </main>
  </div>`;
};

PageEvents.premium = (page) => {
  const toggle = page.querySelector("#billing-cycle-toggle");
  const container = page.querySelector("#premium-page");
  if (!toggle || !container) return;
  
  toggle.addEventListener("click", () => {
    container.classList.toggle("is-semestral");
    SoundManager.play("tap");
  });
};



// ── PERFIL PAGE ──
Pages.perfil = () => {
  const safeName = String(AppState.get("userName") || "").trim() || "Estudante";
  const avatarInitial = safeName.charAt(0).toUpperCase();
  const plan = AppState.get("userPlan");
  const dark = AppState.get("darkMode");
  const totalQ = AppState.get("totalQuestionsAnswered");
  const xp = totalQ * 10;
  const level = Math.floor(xp / 500) + 1;
  const rank = getRankInfo(level);
  
  const planLabels = {
    "gratis": "Plano Grátis",
    "basico": "Pack Básico Elite",
    "pro": "Estudante Pro",
    "plus": "Estudante Plus+ Master"
  };
  const planLabel = planLabels[plan] || `Plano Especial (${plan})`;

  const planBadge = getPlanBadge(plan);
  
  return `
  <!-- Glass Header -->
  <header class="glass-header px-6 py-5 sticky top-0 z-20">
    <div class="flex items-center justify-between max-w-2xl mx-auto">
      <button onclick="Router.back()" class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-300">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
      <h1 class="text-sm font-black text-white uppercase tracking-widest">Seu Perfil</h1>
      <div class="w-10"></div>
    </div>
  </header>

  <main class="flex-1 scroll-area px-6 py-8 space-y-8 safe-bottom">
    
    <!-- User Branding Section -->
    <section class="flex flex-col items-center text-center relative">
      <div class="relative mb-6">
        <div class="w-28 h-28 rounded-3xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-white font-black text-4xl shadow-2xl shadow-emerald-500/20">
          ${avatarInitial}
        </div>
        <div class="absolute -bottom-2 -right-2 rank-shield ${planBadge.class} w-10 h-10 shadow-xl">
           <span class="material-symbols-outlined text-xl text-white font-normal">${planBadge.icon}</span>
        </div>
      </div>
      
      <h2 class="text-2xl font-black text-white tracking-tight-compact mb-1">${safeName}</h2>
      <div class="flex items-center gap-2 justify-center">
        <span class="text-[10px] font-black text-emerald-400 uppercase tracking-widest">${rank.name}</span>
        <span class="w-1 h-1 rounded-full bg-slate-700"></span>
        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${planLabel}</span>
      </div>

      ${plan === "gratis" ? `
        <button onclick="Router.navigate('/premium')" class="mt-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-black px-6 py-2 rounded-xl uppercase tracking-widest shadow-lg shadow-purple-500/20 active:scale-95 transition-all">
          Upgrade para Plus+ <span class="ml-1 opacity-70">40% OFF</span>
        </button>
      ` : ''}
      
      <!-- Abstract Decors -->
      <div class="absolute -top-10 -left-20 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl -z-10"></div>
    </section>

    <!-- Plan Switcher (Dev Mode / Practice) -->
    <section class="space-y-4">
      <div class="flex items-center justify-between ml-2">
        <p class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Sua Assinatura</p>
        <span class="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Modo Prático</span>
      </div>
      
      <div class="glass-card p-1.5 rounded-2xl border border-white/5 flex gap-1 relative overflow-hidden">
        <button onclick="App.switchPlan('gratis')" 
                class="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${plan === 'gratis' ? 'bg-white/10 text-white shadow-inner scale-105 border border-white/20' : 'text-slate-500 hover:text-slate-300'}">
          GRÁTIS
        </button>
        <button onclick="App.switchPlan('basico')" 
                class="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${plan === 'basico' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)] scale-105 text-white' : 'text-slate-500 hover:text-slate-300'}">
          BÁSICO
        </button>
        <button onclick="App.switchPlan('pro')" 
                class="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${plan === 'pro' ? 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20 scale-105' : 'text-slate-500 hover:text-slate-300'}">
          PRO
        </button>
        <button onclick="App.switchPlan('plus')" 
                class="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${plan === 'plus' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20 scale-105 border border-violet-400/30' : 'text-slate-500 hover:text-slate-300'}">
          PLUS+
        </button>
      </div>
      
      <p class="text-[9px] text-center text-slate-600 font-bold uppercase tracking-tight">Troque o plano acima para testar recursos exclusivos</p>
    </section>

    <!-- Settings Groups -->
    <div class="space-y-4">
      <p class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Geral</p>
      <div class="glass-card rounded-2xl overflow-hidden divide-y divide-white/5 border border-white/5">
        <button onclick="Router.navigate('/progresso')" class="flex items-center w-full p-5 gap-4 text-left hover:bg-white/5 transition-colors group">
          <div class="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
            <span class="material-symbols-outlined text-cyan-400">trending_up</span>
          </div>
          <div class="flex-1">
            <span class="block text-sm font-bold text-white">Meu Progresso</span>
            <span class="block text-[10px] text-slate-500 font-medium italic">Veja sua evolução detalhada</span>
          </div>
          <span class="material-symbols-outlined text-slate-600 group-hover:text-slate-400 transition-colors">chevron_right</span>
        </button>

        <button onclick="Router.navigate('/premium')" class="flex items-center w-full p-5 gap-4 text-left hover:bg-white/5 transition-colors group">
          <div class="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
            <span class="material-symbols-outlined text-amber-400">stars</span>
          </div>
          <div class="flex-1">
            <span class="block text-sm font-bold text-white">Gerenciar Assinatura</span>
          </div>
          <span class="material-symbols-outlined text-slate-600 group-hover:text-slate-400 transition-colors">chevron_right</span>
        </button>

        <div class="flex items-center p-5 gap-4">
          <div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <span class="material-symbols-outlined text-blue-400">dark_mode</span>
          </div>
          <div class="flex-1 text-sm font-bold text-white">Modo Escuro</div>
          <button id="dark-toggle" onclick="App.toggleDark(); this.classList.toggle('bg-emerald-500'); this.classList.toggle('bg-slate-700'); const knob=this.querySelector('div'); knob.classList.toggle('left-7'); knob.classList.toggle('left-1');" class="w-12 h-6 rounded-full ${dark ? "bg-emerald-500" : "bg-slate-700"} relative transition-all duration-300">
            <div class="absolute top-1 ${dark ? "left-7" : "left-1"} w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm"></div>
          </button>
        </div>
      </div>

      <p class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-8 ml-2">Estudos</p>
      <div class="glass-card rounded-2xl overflow-hidden divide-y divide-white/5 border border-white/5">
        <button onclick="Router.navigate('/questoes')" class="flex items-center w-full p-5 gap-4 text-left hover:bg-white/5 transition-colors group">
          <div class="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
            <span class="material-symbols-outlined text-indigo-400">quiz</span>
          </div>
          <div class="flex-1">
            <span class="block text-sm font-bold text-white">Banco de Questões</span>
          </div>
          <span class="material-symbols-outlined text-slate-600 group-hover:text-slate-400 transition-colors">chevron_right</span>
        </button>
      </div>

      <p class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-8 ml-2">Conta e Suporte</p>
      <div class="glass-card rounded-2xl overflow-hidden divide-y divide-white/5 border border-white/5">
        <button onclick="AppState.syncFull().then(() => { SoundManager.play('success'); Router.navigate('/progresso', false, true); })" 
                class="flex items-center w-full p-5 gap-4 text-left hover:bg-white/5 transition-colors group">
          <div class="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
            <span class="material-symbols-outlined text-indigo-400">sync</span>
          </div>
          <div class="flex-1">
            <span class="block text-sm font-bold text-white">Sincronizar Agora</span>
            <span class="block text-[9px] text-slate-500 font-medium">Forçar atualização dos dados da nuvem</span>
          </div>
          <span class="material-symbols-outlined text-slate-600">chevron_right</span>
        </button>

        <button onclick="App.logout()" class="flex items-center w-full p-5 gap-4 text-left hover:bg-slate-500/10 transition-colors group">
          <div class="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center group-hover:bg-slate-500/20 transition-colors">
            <span class="material-symbols-outlined text-slate-400">logout</span>
          </div>
          <div class="flex-1">
            <span class="block text-sm font-bold text-white">Sair da Conta</span>
          </div>
          <span class="material-symbols-outlined text-slate-600">chevron_right</span>
        </button>

        <button id="delete-account-trigger" class="flex items-center w-full p-5 gap-4 text-left hover:bg-red-500/10 transition-colors group">
          <div class="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
            <span class="material-symbols-outlined text-red-400">delete_forever</span>
          </div>
          <div class="flex-1">
            <span class="block text-sm font-bold text-white">Apagar Conta</span>
            <span class="block text-[9px] text-red-500 font-black uppercase tracking-tighter">Ação Irreversível</span>
          </div>
          <span class="material-symbols-outlined text-slate-600">chevron_right</span>
        </button>
      </div>

      <p class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-8 ml-2">Jurídico</p>
      <div class="glass-card rounded-2xl overflow-hidden divide-y divide-white/5 border border-white/5">
        <button onclick="window.open('/termos.html', '_blank')" class="flex items-center w-full p-5 gap-4 text-left hover:bg-white/5 transition-colors group">
          <div class="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
            <span class="material-symbols-outlined text-slate-400">description</span>
          </div>
          <div class="flex-1">
            <span class="block text-sm font-bold text-white">Termos de Uso</span>
          </div>
          <span class="material-symbols-outlined text-slate-600">chevron_right</span>
        </button>

        <button onclick="window.open('/privacidade.html', '_blank')" class="flex items-center w-full p-5 gap-4 text-left hover:bg-white/5 transition-colors group">
          <div class="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
            <span class="material-symbols-outlined text-slate-400">gavel</span>
          </div>
          <div class="flex-1">
            <span class="block text-sm font-bold text-white">Política de Privacidade</span>
          </div>
          <span class="material-symbols-outlined text-slate-600">chevron_right</span>
        </button>
      </div>
    </div>
    
    <p class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-8 ml-2">Apoie o Desenvolvedor</p>
    <div class="glass-card rounded-2xl overflow-hidden border border-white/5 bg-amber-500/5 hover:bg-amber-500/10 transition-colors group mt-2">
      <button onclick="window.open('https://buymeacoffee.com/paulolssj4', '_blank')" class="flex items-center w-full p-5 gap-4 text-left">
        <div class="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
          <span class="material-symbols-outlined text-amber-500">coffee</span>
        </div>
        <div class="flex-1">
          <span class="block text-sm font-bold text-white">Buy Me a Coffee</span>
          <span class="block text-[10px] text-slate-500 font-medium italic">Se você gosta do app, considere apoiar!</span>
        </div>
        <span class="material-symbols-outlined text-slate-600 group-hover:text-slate-400 transition-colors">open_in_new</span>
      </button>
    </div>

    </div>
    
    <!-- Account Deletion Modal -->
    <div id="delete-account-modal" class="fixed inset-0 z-[100] hidden">
       <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
       <div class="absolute inset-0 flex items-center justify-center p-6">
          <div class="glass-card w-full max-w-sm rounded-3xl p-8 space-y-6 border border-red-500/20 shadow-2xl shadow-red-500/10 animate-scale-up">
             <div class="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto border border-red-500/20">
                <span class="material-symbols-outlined text-red-400 text-4xl">warning</span>
             </div>
             <div class="text-center space-y-2">
                <h3 class="text-xl font-black text-white uppercase tracking-tight">Apagar sua Conta?</h3>
                <p class="text-xs font-medium text-slate-400 leading-relaxed italic">Esta ação é permanente. Todos os seus simulados, acertos, XP e horas de estudo serão deletados para sempre dos nossos servidores.</p>
             </div>
             <div class="space-y-3">
                <button id="confirm-delete-account-btn" class="w-full h-14 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-500/20 active:scale-95 transition-all">
                   Sim, Apagar Tudo
                </button>
                <button id="cancel-delete-account-btn" class="w-full py-4 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">
                   Cancelar e Voltar
                </button>
             </div>
          </div>
       </div>
    </div>

    <div class="text-center pt-8 pb-10">
      <p class="text-[10px] font-black text-slate-600 uppercase tracking-widest">EduHub Brasil • Versão 1.2.0</p>
    </div>
  </main>`;
};

PageEvents.perfil = (page) => {
    const trigger = page.querySelector("#delete-account-trigger");
    const modal = page.querySelector("#delete-account-modal");
    const confirmBtn = page.querySelector("#confirm-delete-account-btn");
    const cancelBtn = page.querySelector("#cancel-delete-account-btn");

    if (!trigger || !modal) return;

    trigger.addEventListener("click", () => {
        SoundManager.play("tap");
        modal.classList.remove("hidden");
    });

    cancelBtn.addEventListener("click", () => {
        SoundManager.play("tap");
        modal.classList.add("hidden");
    });

    confirmBtn.addEventListener("click", async () => {
        SoundManager.play("tap");
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<span class="animate-spin material-symbols-outlined">sync</span> APAGANDO...';
        await App.deleteAccount();
    });
};

// ── LEGAL PAGES ──
Pages.termos = () => `
  <header class="glass-header px-6 py-5 sticky top-0 z-20">
    <div class="flex items-center gap-4 max-w-2xl mx-auto">
      <button onclick="Router.back('/perfil')" class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-300">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
      <h1 class="text-sm font-black text-white uppercase tracking-widest">Termos de Uso</h1>
    </div>
  </header>
  <main class="flex-1 scroll-area px-6 py-8 safe-bottom text-slate-300 space-y-6 text-justify">
    <section>
      <h2 class="text-lg font-black text-white mb-3">1. Bem-vindo ao EduHub Brasil</h2>
      <p class="text-sm leading-relaxed text-justify">Obrigado por escolher o EduHub Brasil para sua jornada de estudos. Ao utilizar nosso aplicativo, você faz parte de uma comunidade focada em evolução constante. Estes termos explicam como trabalhamos juntos.</p>
    </section>
    <section>
      <h2 class="text-lg font-black text-white mb-3">2. Sua Jornada e Responsabilidade</h2>
      <p class="text-sm leading-relaxed text-justify">O EduHub é uma ferramenta potente de apoio, mas <b>o sucesso acadêmico é um esforço conjunto</b> que depende da sua dedicação. Como qualquer tecnologia em constante evolução, o serviço é oferecido conforme disponível. Pedimos que utilize o app como um complemento e sempre consulte fontes oficiais para informações críticas de exames.</p>
    </section>
    <section>
      <h2 class="text-lg font-black text-white mb-3">3. Limites da Experiência Digital</h2>
      <p class="text-sm leading-relaxed text-justify">Buscamos sempre a perfeição técnica, porém o desenvolvedor não pode ser responsabilizado por eventuais instabilidades temporárias, perda de dados ou imprecisões em respostas de IA. O uso do aplicativo é de sua livre escolha e responsabilidade.</p>
    </section>
    <section>
      <h2 class="text-lg font-black text-white mb-3">4. Respeito e Propriedade</h2>
      <p class="text-sm leading-relaxed text-justify">Todo o design, código e conteúdos são frutos de muito trabalho e pertencem ao desenvolvedor. Pedimos que respeite esses direitos, não realizando cópias ou engenharia reversa do sistema.</p>
    </section>
    <section>
      <h2 class="text-lg font-black text-white mb-3">5. Compromisso Mútuo</h2>
      <p class="text-sm leading-relaxed text-justify">Para garantir a sustentabilidade do projeto, o usuário concorda em utilizar o app de forma ética. Em casos de mau uso que causem prejuízos ao sistema, o usuário se compromete a isentar o desenvolvedor de responsabilidades legais.</p>
    </section>
    <section>
      <h2 class="text-lg font-black text-white mb-3">6. Evolução e Atualizações</h2>
      <p class="text-sm leading-relaxed text-justify">O app está sempre evoluindo! Podemos atualizar recursos e estes termos para melhorar sua experiência. Caso ocorra qualquer divergência legal, resolvemos isso preferencialmente no foro de domicílio do desenvolvedor.</p>
    </section>
    <p class="text-[10px] text-slate-500 font-bold uppercase mt-10">Última atualização: 31 de Março de 2026</p>
  </main>
`;

Pages.privacidade = () => `
  <header class="glass-header px-6 py-5 sticky top-0 z-20">
    <div class="flex items-center gap-4 max-w-2xl mx-auto">
      <button onclick="Router.back('/perfil')" class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-300">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
      <h1 class="text-sm font-black text-white uppercase tracking-widest">Privacidade</h1>
    </div>
  </header>
  <main class="flex-1 scroll-area px-6 py-8 safe-bottom text-slate-300 space-y-6 text-justify">
    <section>
      <h2 class="text-lg font-black text-white mb-3">1. Sua Privacidade e Controle</h2>
      <p class="text-sm leading-relaxed text-justify">Valorizamos sua confiança. Coletamos apenas o essencial (Nome, e-mail e métricas de estudo) para garantir que seu progresso seja salvo e suas recomendações sejam precisas, tudo em conformidade com a LGPD.</p>
    </section>
    <section>
      <h2 class="text-lg font-black text-white mb-3">2. Parcerias de Confiança</h2>
      <p class="text-sm leading-relaxed text-justify">Seus dados são protegidos por infraestruturas robustas oferecidas pelo Supabase e Google. Embora busquemos os melhores parceiros, o desenvolvedor atua dentro dos limites técnicos desses serviços para garantir a integridade dos seus dados.</p>
    </section>
    <section>
      <h2 class="text-lg font-black text-white mb-3">3. Uso Consciente e Tutor IA</h2>
      <p class="text-sm leading-relaxed text-justify">Suas dúvidas com o Tutor IA nos ajudam a evoluir o sistema. Para sua maior segurança, evite compartilhar senhas ou dados sensíveis reais durante as conversas no chat.</p>
    </section>
    <section>
      <h2 class="text-lg font-black text-white mb-3">4. Seus Direitos Mundiais</h2>
      <p class="text-sm leading-relaxed text-justify">Você é o dono dos seus dados. A qualquer momento, você pode solicitar a correção ou exclusão definitiva da sua conta através deste aplicativo. Estamos aqui para ajudar com qualquer preocupação sobre sua privacidade.</p>
    </section>
    <section>
      <h2 class="text-lg font-black text-white mb-3">5. Transparência</h2>
      <p class="text-sm leading-relaxed text-justify">Esta política é um documento vivo e pode ser atualizada para refletir melhorias no app. O uso continuado do serviço demonstra que você caminha conosco nessas evoluções.</p>
    </section>
    <p class="text-[10px] text-slate-500 font-bold uppercase mt-10">Última atualização: 31 de Março de 2026</p>
  </main>
`;

// ── ONBOARDING PAGE ──
Pages.onboarding = () => `
  <main class="flex-1 scroll-area bg-slate-900 flex flex-col p-6 text-white relative">
    <!-- Progress Indicator -->
    <div class="flex gap-1.5 w-full mb-8" id="onb-dots">
        ${[1,2,3,4,5,6,7].map(i => `<div class="flex-1 h-1 rounded-full ${i===1 ? "bg-emerald-500" : "bg-white/10"} transition-colors" data-step="${i}"></div>`).join("")}
    </div>

    <!-- Step Container -->
    <div id="onb-step-container" class="flex-1 flex flex-col">
        <!-- Passo 1: Nome e Idade -->
        <div class="onboarding-step flex flex-col h-full" data-step="1">
            <h1 class="text-3xl font-black mb-2 tracking-tight">Bem-vindo(a)!</h1>
            <p class="text-slate-400 text-sm mb-10">Vamos começar criando seu perfil de estudos.</p>
            
            <div class="space-y-6 flex-1">
              <div>
                <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2 ml-1">Seu Nome</label>
                <input type="text" id="onb-name" class="w-full bg-slate-800/50 border border-white/10 rounded-2xl p-4 text-white placeholder:text-slate-600 focus:border-emerald-500 focus:ring-0 transition-all font-bold" placeholder="Como podemos te chamar?">
              </div>
              <div>
                <label class="block text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2 ml-1">Sua Idade</label>
                <input type="number" id="onb-age" class="w-full bg-slate-800/50 border border-white/10 rounded-2xl p-4 text-white placeholder:text-slate-600 focus:border-emerald-500 focus:ring-0 transition-all font-bold" placeholder="Ex: 17">
              </div>
            </div>

            <button id="onb-start-btn" class="w-full py-4 bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transform transition-all active:scale-95">
              CONTINUAR <span class="material-symbols-outlined font-black">arrow_forward</span>
            </button>
        </div>
    </div>
  </main>`;

PageEvents.onboarding = (page) => {
    let currentStep = 1;
    const TOTAL_STEPS = 6;

    const dynamicSteps = [
        {
            title: "Qual seu objetivo principal?",
            desc: "Personalizaremos seu plano de acordo com sua meta.",
            key: "studyGoal",
            type: "options",
            options: [
                { label: "ENEM e Vestibulares", val: "enem", icon: "school" },
                { label: "Concursos Públicos", val: "concurso", icon: "work" },
                { label: "Ensino Médio", val: "medio", icon: "menu_book" }
            ]
        },
        {
            title: "Quais matérias você quer focar?",
            desc: "Selecione as disciplinas que deseja estudar.",
            key: "favoriteSubjects",
            type: "checkboxes",
            options: APP_DATA.subjects.map(s => ({ label: s.label, val: s.id, icon: s.icon }))
        },
        {
            title: "Data do Exame",
            desc: "Quando será sua prova principal?",
            key: "examDate",
            type: "calendar"
        },
        {
            title: "Quanto pretende estudar por dia?",
            desc: "Seu cronograma será ajustado para este tempo.",
            key: "studyCommitment",
            type: "options",
            options: [
                { label: "30 minutos", val: "30m", icon: "timer" },
                { label: "1 hora", val: "1h", icon: "schedule" },
                { label: "2 horas", val: "2h", icon: "hourglass_empty" },
                { label: "3+ horas", val: "3h+", icon: "all_inclusive" }
            ]
        },
        {
            title: "Qual é sua maior barreira hoje?",
            desc: "O EduHub ajuda você a superar isso.",
            key: "mainDifficulty",
            type: "options",
            options: [
                { label: "Falta de Foco", val: "foco", icon: "target" },
                { label: "Não sei por onde começar", val: "inicio", icon: "map" },
                { label: "Erros nas provas", val: "erros", icon: "warning" },
                { label: "Falta de disciplina", val: "disciplina", icon: "calendar_today" }
            ]
        }
    ];

    function renderStep(idx) {
        const container = page.querySelector("#onb-step-container");
        const dots = page.querySelectorAll("#onb-dots div");
        dots.forEach((d, i) => d.className = `flex-1 h-1 rounded-full ${i+1 <= currentStep ? "bg-emerald-500" : "bg-white/10"} transition-colors`);

        const step = dynamicSteps[idx - 1];
        let content = `<div class="onboarding-step flex flex-col h-full">
            <h2 class="text-2xl font-black mb-2 tracking-tight">${step.title}</h2>
            <p class="text-slate-400 text-sm mb-10">${step.desc}</p>`;

        if (step.type === "input-number") {
            content += `
            <div class="flex-1 flex flex-col justify-center gap-6">
              <input type="number" id="onb-input-age" class="w-full bg-slate-800/50 border border-white/10 rounded-2xl p-6 text-2xl font-black text-center text-white focus:border-emerald-500 focus:ring-0" placeholder="${step.placeholder}">
              <button id="onb-next-age" class="w-full py-4 bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2">CONTINUAR</button>
            </div>`;
        } else if (step.type === "calendar") {
            const today = new Date();
            let calYear = today.getFullYear();
            let calMonth = today.getMonth();
            let selectedDateStr = AppState.get("examDate") || "2026-11-01";
            
            function renderCalendar() {
                const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
                const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
                const firstDayIdx = new Date(calYear, calMonth, 1).getDay();
                
                let html = `
                <div class="calendar-header">
                    <button class="calendar-btn" id="cal-prev"><span class="material-symbols-outlined">chevron_left</span></button>
                    <div class="calendar-month-year">${monthNames[calMonth]} ${calYear}</div>
                    <button class="calendar-btn" id="cal-next"><span class="material-symbols-outlined">chevron_right</span></button>
                </div>
                <div class="calendar-grid">
                    <div class="calendar-weekday">Dom</div><div class="calendar-weekday">Seg</div><div class="calendar-weekday">Ter</div>
                    <div class="calendar-weekday">Qua</div><div class="calendar-weekday">Qui</div><div class="calendar-weekday">Sex</div><div class="calendar-weekday">Sáb</div>
                `;
                
                // Empty slots
                for (let i = 0; i < firstDayIdx; i++) html += `<div class="calendar-day empty"></div>`;
                
                // Days
                for (let d = 1; d <= daysInMonth; d++) {
                    const dStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                    const isSelected = dStr === selectedDateStr;
                    const isToday = dStr === today.toISOString().split('T')[0];
                    html += `<div class="calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}" data-date="${dStr}">${d}</div>`;
                }
                
                html += `</div>`;
                page.querySelector("#premium-calendar-root").innerHTML = html;
                
                // Attach inner events
                page.querySelector("#cal-prev").onclick = () => { calMonth--; if(calMonth<0){calMonth=11;calYear--;} renderCalendar(); };
                page.querySelector("#cal-next").onclick = () => { calMonth++; if(calMonth>11){calMonth=0;calYear++;} renderCalendar(); };
                page.querySelectorAll(".calendar-day:not(.empty)").forEach(el => {
                    el.onclick = () => {
                        selectedDateStr = el.dataset.date;
                        renderCalendar();
                        SoundManager.play("tap");
                    };
                });
            }

            content += `
            <div class="flex-1 flex flex-col justify-center items-center py-4">
                <div id="premium-calendar-root" class="premium-calendar mb-8"></div>
                <button id="onb-next-date" class="w-full py-4 bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transform active:scale-95 transition-all">
                    CONFIRMAR DATA <span class="material-symbols-outlined font-black">check</span>
                </button>
            </div>`;
            
            // Initial render
            setTimeout(() => renderCalendar(), 0);

        } else if (step.type === "options") {
            content += `<div class="space-y-3 w-full">
                ${step.options.map(o => `
                <button class="onb-opt-btn w-full p-4 rounded-xl border border-white/10 bg-slate-800 text-left flex items-center gap-4 hover:border-emerald-500 transition-colors" data-val="${o.val}">
                    <span class="material-symbols-outlined text-slate-400 bg-white/5 p-2 rounded-lg">${o.icon}</span>
                    <span class="font-bold">${o.label}</span>
                </button>`).join("")}
            </div>`;
        } else if (step.type === "checkboxes") {
            content += `
            <div class="mb-4 flex gap-2">
                <button id="onb-select-all" class="text-xs font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">Selecionar Todas</button>
            </div>
            <div class="space-y-2 flex-1 overflow-y-auto no-scrollbar pb-6">
                ${step.options.map(o => `
                <div class="onb-check-item flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-slate-800/50 cursor-pointer transition-all hover:bg-slate-800" data-val="${o.val}">
                    <div class="check-box w-6 h-6 rounded-lg border-2 border-white/10 flex items-center justify-center transition-all">
                        <span class="material-symbols-outlined text-sm font-black text-white scale-0 transition-transform">check</span>
                    </div>
                    <span class="material-symbols-outlined text-slate-400 text-lg">${o.icon}</span>
                    <span class="flex-1 font-bold text-sm text-slate-300">${o.label}</span>
                </div>`).join("")}
            </div>
            <button id="onb-next-checks" class="w-full py-4 bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 mt-4">PRÓXIMO</button>`;
        }

        content += `</div>`;
        container.innerHTML = content;

        // Attach events
        if (step.type === "input-number") {
            page.querySelector("#onb-next-age").addEventListener("click", () => {
                const val = page.querySelector("#onb-input-age").value;
                if (!val) return;
                AppState.set(step.key, val);
                nextStep();
            });
        } else if (step.type === "calendar") {
            page.querySelector("#onb-next-date").addEventListener("click", () => {
                // If there's a selected element in the current month view, use it
                const elDate = page.querySelector(".calendar-day.selected")?.dataset.date;
                const finalizedDate = elDate || selectedDateStr;

                if (finalizedDate) {
                    AppState.set("examDate", finalizedDate);
                    nextStep();
                } else {
                    // Fallback to default if somehow everything is empty
                    AppState.set("examDate", "2026-11-01"); 
                    nextStep();
                }
            });
        } else if (step.type === "options") {
            page.querySelectorAll(".onb-opt-btn").forEach(btn => btn.addEventListener("click", () => {
                AppState.set(step.key, btn.dataset.val);
                nextStep();
            }));
        } else if (step.type === "checkboxes") {
            let selected = [];
            const items = page.querySelectorAll(".onb-check-item");
            
            function toggleItem(item) {
                const val = item.dataset.val;
                if (selected.includes(val)) {
                    selected = selected.filter(v => v !== val);
                    item.classList.remove("border-emerald-500", "bg-emerald-500/10");
                    item.querySelector(".check-box").classList.remove("bg-emerald-500", "border-emerald-500");
                    item.querySelector(".check-box span").classList.add("scale-0");
                } else {
                    selected.push(val);
                    item.classList.add("border-emerald-500", "bg-emerald-500/10");
                    item.querySelector(".check-box").classList.add("bg-emerald-500", "border-emerald-500");
                    item.querySelector(".check-box span").classList.remove("scale-0");
                }
            }

            items.forEach(item => item.addEventListener("click", () => toggleItem(item)));

            page.querySelector("#onb-select-all").addEventListener("click", (e) => {
                const isAll = selected.length === step.options.length;
                selected = [];
                items.forEach(item => {
                    item.classList.remove("border-emerald-500", "bg-emerald-500/10");
                    item.querySelector(".check-box").classList.remove("bg-emerald-500", "border-emerald-500");
                    item.querySelector(".check-box span").classList.add("scale-0");
                    if (!isAll) toggleItem(item);
                });
                e.target.textContent = isAll ? "Selecionar Todas" : "Desmarcar Todas";
            });

            page.querySelector("#onb-next-checks").addEventListener("click", () => {
                if (selected.length === 0) return alert("Selecione pelo menos uma matéria!");
                AppState.set(step.key, selected);
                nextStep();
            });
        }
    }

    async function nextStep() {
        currentStep++;
        SoundManager.play("transition");
        if (currentStep > TOTAL_STEPS) {
            SoundManager.play("success");
            AppState.set("onboardingDone", true);
            const localUserOnboardingKeyPrefix = "eduhub_onboarding_done_user_";

        try {
          if (typeof Supabase !== "undefined" && typeof Supabase.ensureProfileFromSession === "function") {
            await Supabase.ensureProfileFromSession(AppState.get("userName"));
          }

          if (typeof Supabase !== "undefined" && typeof Supabase.getClient === "function") {
            const client = Supabase.getClient();
            if (client) {
              const { data: { session } } = await client.auth.getSession();
              const userId = String(session?.user?.id || "").trim();
              if (userId) {
                localStorage.setItem(`${localUserOnboardingKeyPrefix}${userId}`, "1");
              }
            }
          }

          await AppState.saveToCloud();
        } catch (error) {
          console.warn("Falha ao salvar onboarding na nuvem:", error);
        }

            Router.navigate("/onboarding-loading", false);
        } else {
            renderStep(currentStep - 1);
        }
    }

    // Passo 1 Event
    const startBtn = page.querySelector("#onb-start-btn");
    startBtn.addEventListener("click", () => {
        SoundManager.play("tap");
        const name = page.querySelector("#onb-name").value;
        const age = page.querySelector("#onb-age").value;
        if (!name || !age) return alert("Por favor preencha nome e idade.");
        AppState.set("userName", name);
        AppState.set("userAge", age);
        nextStep();
    });
};

// ── RESULTADOS PAGE ──
Pages.resultados = () => {
  const isPlus = AppState.get("userPlan") === "plus";
  
  const contentHTML = `
    <div class="grid grid-cols-2 gap-3">
      <button class="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500 text-white rounded-lg font-semibold">
        <span class="material-symbols-outlined text-sm">fact_check</span>Ver Gabarito</button>
      <button onclick="Router.navigate('/questoes')" class="flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 text-slate-200 rounded-lg font-semibold border border-white/5">
        <span class="material-symbols-outlined text-sm">replay</span>Refazer Erros</button>
    </div>
    <section class="relative overflow-hidden border-2 border-amber-500/30 bg-amber-500/5 rounded-xl p-5 space-y-4">
      <div class="absolute top-0 right-0 p-3 opacity-10"><span class="material-symbols-outlined text-6xl text-amber-500">psychology</span></div>
      <div class="flex items-center gap-2 text-amber-400 font-bold"><span class="material-symbols-outlined">auto_awesome</span><h2 class="text-lg uppercase tracking-tight">Knowledge Bridge</h2></div>
      <p class="text-slate-300 leading-relaxed">Parece que você teve dificuldade em <span class="font-bold text-amber-400 bg-amber-500/10 px-1 rounded">Geometria Espacial</span>. Que tal rever este conteúdo?</p>
      <div onclick="window.open('${APP_DATA.videos[4].youtubeUrl}','_blank')" class="bg-slate-800 rounded-lg overflow-hidden shadow-md border border-amber-500/20 cursor-pointer">
        <div class="relative aspect-video bg-slate-700"><img src="${APP_DATA.videos[4].thumbnail}" class="w-full h-full object-cover" alt="Aula"/>
          <div class="absolute inset-0 flex items-center justify-center bg-black/30"><div class="bg-amber-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg"><span class="material-symbols-outlined text-3xl">play_arrow</span></div></div>
          <div class="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">18:42</div></div>
        <div class="p-4"><h4 class="font-bold text-white leading-snug">Geometria Espacial: Prismas e Cilindros</h4><p class="text-sm text-slate-400 mt-1">Professor Ferretto • Matemática</p></div>
      </div>
      <button onclick="window.open('${APP_DATA.videos[4].youtubeUrl}','_blank')" class="w-full py-3 bg-amber-500 text-white font-bold rounded-lg shadow-lg shadow-amber-500/20">Iniciar Revisão Guiada</button>
    </section>
    <section class="space-y-3">
      <h3 class="font-bold text-lg text-white px-1">Desempenho por Tópico</h3>
      <div class="space-y-2">
        <div class="flex items-center justify-between p-3 bg-slate-800/80 rounded-lg border border-white/5"><span class="text-sm font-medium text-slate-200">Interpretação de Texto</span><span class="text-sm font-bold text-emerald-400">12/12</span></div>
        <div class="flex items-center justify-between p-3 bg-slate-800/80 rounded-lg border border-white/5"><span class="text-sm font-medium text-slate-200">Literatura Brasileira</span><span class="text-sm font-bold text-emerald-400">8/10</span></div>
        <div class="flex items-center justify-between p-3 bg-slate-800/80 rounded-lg border border-white/5 ring-1 ring-amber-500/50"><span class="text-sm font-medium text-slate-200">Figuras de Linguagem</span><span class="text-sm font-bold text-amber-400">4/8</span></div>
      </div>
    </section>
    <button onclick="Router.navigate('/home')" class="w-full py-3 bg-emerald-500 text-white font-bold rounded-lg mt-4 pointer-events-auto">Voltar ao Início</button>
  `;

  return `
  <header class="sticky top-0 z-10 bg-background-dark/95 backdrop-blur-md border-b border-white/5 px-4 py-4">
    <div class="max-w-md mx-auto flex items-center justify-between">
      <button onclick="Router.back()" class="p-2 hover:bg-white/10 rounded-full"><span class="material-symbols-outlined">arrow_back</span></button>
      <h1 class="text-lg font-bold">Resultados do Simulado</h1>
      <button class="p-2 hover:bg-white/10 rounded-full"><span class="material-symbols-outlined">share</span></button>
    </div>
  </header>
  <main class="flex-1 scroll-area p-4 space-y-6 safe-bottom">
    <section class="bg-slate-800/80 rounded-xl p-6 border border-white/5 relative z-30">
      <h2 class="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Simulado ENEM 2024</h2>
      <h3 class="text-2xl font-bold text-white mb-4">Linguagens e Códigos</h3>
      <div class="flex items-end gap-2 mb-6"><span class="text-5xl font-bold text-white">35</span><span class="text-2xl text-slate-500 font-medium mb-1">/ 45</span>
        <div class="ml-auto bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-semibold">77% Acerto</div></div>
      <div class="w-full bg-slate-700 h-3 rounded-full overflow-hidden"><div class="bg-emerald-500 h-full rounded-full animate-bar" style="width:77%"></div></div>
    </section>
    
    <div class="relative">
      ${!isPlus ? `
        <div class="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-[#020617]/70 backdrop-blur-[2px] rounded-xl border border-white/5 mt-4">
          <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(124,58,237,0.4)]">
            <span class="material-symbols-outlined text-3xl text-white">lock</span>
          </div>
          <h3 class="text-xl font-black text-white mb-2 leading-tight">Análise Detalhada Premium</h3>
          <p class="text-slate-300 text-sm mb-6 leading-relaxed">Desbloqueie o Knowledge Bridge (Mentoria IA), gabaritos em vídeo e estatísticas de erros por tópico com o Plus+.</p>
          <button onclick="Router.navigate('/premium')" class="px-8 py-3 bg-white text-slate-900 font-black rounded-xl uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-transform shadow-xl">
            Conhecer Plus+
          </button>
        </div>
      ` : ''}
      
      <div class="${!isPlus ? 'opacity-30 blur-[4px] pointer-events-none select-none transition-all' : ''}">
        ${contentHTML}
      </div>
    </div>
    
    ${!isPlus ? `<button onclick="Router.navigate('/home')" class="w-full py-4 bg-slate-800/80 text-white font-bold rounded-xl mt-4 border border-white/5">Voltar ao Início</button>` : ''}
  </main>`;
};

// ── ONBOARDING LOADING PAGE ──
Pages["onboarding-loading"] = () => {
    const userName = AppState.get("userName") || "Estudante";
    const goal = AppState.get("studyGoal") || "enem";
    const commitment = AppState.get("studyCommitment") || "1h";
    const difficulty = AppState.get("mainDifficulty") || "inicio";
    const examDate = AppState.get("examDate") || "";
    const subjects = AppState.get("favoriteSubjects") || [];
    
    const goalLabels = { enem: "ENEM & Vestibulares", concurso: "Concursos Públicos", medio: "Ensino Médio" };
    const commitLabels = { "30m": "30 min/dia", "1h": "1 hora/dia", "2h": "2 horas/dia", "3h+": "3+ horas/dia" };
    const diffLabels = { foco: "Falta de Foco", inicio: "Por onde começar", erros: "Erros nas provas", disciplina: "Falta de disciplina" };
    
    // Map subject IDs to labels
    const subjectMap = {};
    (APP_DATA.subjects || []).forEach(s => { subjectMap[s.id] = s.label; });
    const subjectNames = subjects.map(id => subjectMap[id] || id).slice(0, 6);
    
    // Improved date handling
    const targetDate = new Date(examDate + "T13:00:00-03:00");
    const today = new Date();
    
    let examInfo = "Não definido";
    let examFormatted = "";

    if (examDate) {
        const diffMs = targetDate - today;
        const diffDays = Math.ceil(diffMs / 86400000);
        
        if (diffDays === 0) examInfo = "É Hoje!";
        else if (diffDays === 1) examInfo = "Amanhã!";
        else if (diffDays > 1) examInfo = `${diffDays} dias`;
        else examInfo = "Já passou";

        // Format: 15 Set 2026
        const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const dParts = examDate.split("-");
        if (dParts.length === 3) {
            examFormatted = `${dParts[2]} ${months[parseInt(dParts[1]) - 1]} ${dParts[0]}`;
        }
    }

    return `
  <main class="flex-1 scroll-area bg-slate-950 flex flex-col items-center justify-center p-6 text-white relative min-h-full">
    <!-- Animated Gradients -->
    <div class="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/30 rounded-full blur-[120px] animate-float-slow"></div>
        <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/30 rounded-full blur-[120px] animate-float-slow" style="animation-delay: -2s"></div>
        <div class="absolute top-1/2 left-1/2 w-64 h-64 bg-violet-500/20 rounded-full blur-[100px] animate-float-slow" style="animation-delay: -3s"></div>
    </div>

    <div class="relative z-10 w-full max-w-sm flex flex-col items-center text-center">
        <!-- Personalized Greeting -->
        <p class="text-emerald-400 text-xs font-black uppercase tracking-[0.3em] mb-2 opacity-0" id="onb-greeting">${userName.split(" ")[0]}, seu plano está sendo criado</p>
        
        <!-- Radar Chart Container -->
        <div class="relative w-56 h-56 mb-8 animate-radar">
            <svg viewBox="0 0 200 200" class="w-full h-full">
                <!-- Pentagonal Grid -->
                ${[0.2, 0.4, 0.6, 0.8, 1].map(r => `
                    <polygon points="${[0,1,2,3,4].map(idx => {
                        const angle = (idx * 72 - 90) * Math.PI / 180;
                        const dist = r * 80;
                        return `${100 + Math.cos(angle) * dist},${100 + Math.sin(angle) * dist}`;
                    }).join(" ")}" class="radar-grid" />
                `).join("")}
                
                <!-- Axis -->
                ${[0,1,2,3,4].map(idx => {
                    const angle = (idx * 72 - 90) * Math.PI / 180;
                    return `<line x1="100" y1="100" x2="${100 + Math.cos(angle) * 80}" y2="${100 + Math.sin(angle) * 80}" class="radar-axis" />`;
                }).join("")}

                <!-- Data Area (Animated) -->
                <polygon id="radar-data-area" points="100,100 100,100 100,100 100,100 100,100" class="radar-area transition-all duration-1000 ease-out" />
                
                <!-- Data Points -->
                <circle id="p0" cx="100" cy="100" r="3" class="radar-point transition-all duration-1000" />
                <circle id="p1" cx="100" cy="100" r="3" class="radar-point transition-all duration-1000" />
                <circle id="p2" cx="100" cy="100" r="3" class="radar-point transition-all duration-1000" />
                <circle id="p3" cx="100" cy="100" r="3" class="radar-point transition-all duration-1000" />
                <circle id="p4" cx="100" cy="100" r="3" class="radar-point transition-all duration-1000" />
            </svg>

            <!-- Labels -->
            <div class="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-black text-white/50 tracking-widest uppercase">Humanas</div>
            <div class="absolute top-[30%] -right-7 text-[9px] font-black text-white/50 tracking-widest uppercase">Exatas</div>
            <div class="absolute -bottom-5 right-4 text-[9px] font-black text-white/50 tracking-widest uppercase">Natureza</div>
            <div class="absolute -bottom-5 left-4 text-[9px] font-black text-white/50 tracking-widest uppercase">Línguas</div>
            <div class="absolute top-[30%] -left-7 text-[9px] font-black text-white/50 tracking-widest uppercase">Redação</div>
        </div>

        <!-- Status Messages -->
        <h2 id="onb-loading-title" class="text-xl font-black text-white mb-2 tracking-tight">Analisando Perfil...</h2>
        <p id="onb-loading-desc" class="text-slate-400 text-xs font-medium animate-shimmer-text mb-6">Mapeando suas métricas de estudo</p>
        
        <!-- Progress Bar -->
        <div class="w-full h-1.5 bg-white/5 rounded-full mb-8 overflow-hidden">
            <div id="onb-progress-bar" class="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-700 ease-out" style="width: 0%"></div>
        </div>
        
        <!-- Info Cards Grid -->
        <div class="grid grid-cols-2 gap-3 w-full mb-6" id="onb-info-cards">
            <div class="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center gap-1.5 scale-0 transition-transform duration-500" style="transition-delay:200ms">
                <span class="material-symbols-outlined text-emerald-400 text-lg">target</span>
                <span class="text-[9px] font-black text-white/40 uppercase tracking-widest">Objetivo</span>
                <span class="text-xs font-bold text-white">${goalLabels[goal] || goal}</span>
            </div>
            <div class="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center gap-1.5 scale-0 transition-transform duration-500" style="transition-delay:400ms">
                <span class="material-symbols-outlined text-cyan-400 text-lg">schedule</span>
                <span class="text-[9px] font-black text-white/40 uppercase tracking-widest">Dedicação</span>
                <span class="text-xs font-bold text-white">${commitLabels[commitment] || commitment}</span>
            </div>
            <div class="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center gap-1.5 scale-0 transition-transform duration-500" style="transition-delay:600ms">
                <span class="material-symbols-outlined text-amber-400 text-lg">event</span>
                <span class="text-[9px] font-black text-white/40 uppercase tracking-widest">Exame em</span>
                <span class="text-xs font-bold text-white">${examInfo}</span>
                ${examFormatted ? `<span class="text-[8px] text-slate-500 font-bold uppercase tracking-wider">${examFormatted}</span>` : ''}
            </div>
            <div class="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center gap-1.5 scale-0 transition-transform duration-500" style="transition-delay:800ms">
                <span class="material-symbols-outlined text-rose-400 text-lg">psychology</span>
                <span class="text-[9px] font-black text-white/40 uppercase tracking-widest">Desafio</span>
                <span class="text-xs font-bold text-white">${diffLabels[difficulty] || difficulty}</span>
            </div>
        </div>

        <!-- Selected Subjects -->
        ${subjectNames.length > 0 ? `
        <div class="flex flex-wrap justify-center gap-1.5 mb-4 opacity-0" id="onb-subjects-chips">
            ${subjectNames.map(s => `<span class="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold px-3 py-1 rounded-full">${s}</span>`).join("")}
        </div>` : ''}
    </div>
  </main>
`;
};

PageEvents["onboarding-loading"] = (page) => {
    const title = page.querySelector("#onb-loading-title");
    const desc = page.querySelector("#onb-loading-desc");
    const radar = page.querySelector("#radar-data-area");
    const progressBar = page.querySelector("#onb-progress-bar");
    const greeting = page.querySelector("#onb-greeting");
    const infoCards = page.querySelectorAll("#onb-info-cards > div");
    const subjectsChips = page.querySelector("#onb-subjects-chips");
    
    // 1. Animate Greeting
    setTimeout(() => {
        greeting.style.transition = "opacity 0.8s ease";
        greeting.style.opacity = "1";
    }, 200);
    
    // 2. Animate Info Cards
    setTimeout(() => {
        infoCards.forEach(c => c.classList.remove("scale-0"));
    }, 600);
    
    // 3. Show subject chips
    if (subjectsChips) {
        setTimeout(() => {
            subjectsChips.style.transition = "opacity 0.6s ease";
            subjectsChips.style.opacity = "1";
        }, 1200);
    }

    // 4. Animate Radar based on choices
    const mainDifficulty = AppState.get("mainDifficulty") || 'inicio';
    
    let values = [0.65, 0.45, 0.55, 0.7, 0.8]; // Humanas, Exatas, Natureza, Linguas, Redação
    
    if (mainDifficulty === 'foco') values = values.map(v => Math.min(v * 1.1, 1));
    if (mainDifficulty === 'disciplina') { values[4] *= 0.6; values[0] *= 1.15; }
    if (mainDifficulty === 'erros') { values[1] *= 0.7; values[2] *= 0.8; }
    if (mainDifficulty === 'inicio') values = values.map(v => v * 0.85);
    
    const points = values.map((v, i) => {
        const angle = (i * 72 - 90) * Math.PI / 180;
        const x = 100 + Math.cos(angle) * (v * 80);
        const y = 100 + Math.sin(angle) * (v * 80);
        
        const dot = page.querySelector(`#p${i}`);
        if (dot) { dot.setAttribute("cx", x); dot.setAttribute("cy", y); }
        
        return `${x},${y}`;
    });
    
    setTimeout(() => {
        radar.setAttribute("points", points.join(" "));
    }, 1000);

    // 5. Message Sequence with Progress
    const userName = (AppState.get("userName") || "").split(" ")[0] || "Estudante";
    const sequence = [
        { t: "Mapeando Áreas de Foco...", d: "Identificando seus pontos fortes e fracos", p: 20 },
        { t: "Calculando Probabilidades...", d: "Otimizando cronograma personalizado", p: 40 },
        { t: "Configurando IA Tutor...", d: "Selecionando melhor modelo de IA para você", p: 60 },
        { t: "Montando Simulados...", d: "Criando banco de questões sob medida", p: 80 },
        { t: `Tudo pronto, ${userName}! 🚀`, d: "Seu plano de estudos foi criado com sucesso", p: 100 }
    ];

    let step = 0;
    progressBar.style.width = "5%";
    
    const interval = setInterval(() => {
        if (step < sequence.length) {
            title.innerHTML = sequence[step].t;
            desc.innerHTML = sequence[step].d;
            progressBar.style.width = sequence[step].p + "%";
            SoundManager.play("transition");
            step++;
        } else {
            clearInterval(interval);
            desc.classList.remove("animate-shimmer-text");
            setTimeout(() => {
                Router.navigate("/home");
            }, 1200);
        }
    }, 1500);
};

PageEvents.perfil = (page) => {
    // No events needed here for now
};

// ── QUIZ BUILDER PAGE (PRO/PLUS ONLY) ──
Pages["quiz-builder"] = (params) => {
  const plan = AppState.get("userPlan");
  const isPremium = plan === "pro" || plan === "plus";

  return `
  <div class="fixed inset-0 bg-[#020617] z-50 flex flex-col overflow-hidden">
    <!-- Header -->
    <header class="px-6 py-5 flex items-center justify-between border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl">
      <button onclick="Router.back()" class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
        <span class="material-symbols-outlined text-xl">arrow_back</span>
      </button>
      <h1 class="text-xs font-black uppercase tracking-[0.3em] text-white">Treino Customizado Pro</h1>
      <div class="w-10"></div>
    </header>

    <main class="flex-1 scroll-area px-6 pt-3 pb-32 space-y-8">
      <!-- Info Section -->
      <section class="space-y-2">
        <h2 class="text-2xl font-black text-white leading-tight italic">Carga de Elite</h2>
        <p class="text-slate-400 text-sm leading-relaxed">Defina a quantidade de questões para cada módulo. O limite total por sessão é de <span class="text-indigo-400 font-black">25 questões</span>.</p>
      </section>

      <!-- Subject Selection with Counters -->
      <section class="space-y-4">
        <div class="grid grid-cols-2 gap-4" id="builder-subjects-grid">
           ${APP_DATA.subjects.map(s => `
             <div data-id="${s.id}" class="subject-card group relative bg-[#0f172a]/40 border border-white/5 p-6 rounded-[40px] transition-all duration-300 h-[200px] flex flex-col items-center text-center overflow-hidden">
                
                <!-- Icon & Label (Flex-1 to push controls down but not to the edge) -->
                <div class="flex-1 flex flex-col items-center justify-center gap-3 w-full">
                   <div class="w-16 h-16 rounded-[24px] bg-${s.color}-500/10 border border-${s.color}-500/20 flex items-center justify-center text-${s.color}-400 group-hover:scale-110 transition-transform">
                      <span class="material-symbols-outlined text-4xl font-light">${s.icon}</span>
                   </div>
                   <div class="flex flex-col gap-1">
                      <span class="text-[11px] font-black text-white uppercase tracking-[0.1em] truncate px-2">${s.label}</span>
                      <span class="text-[8px] text-slate-500 font-bold uppercase tracking-widest opacity-40">Tactical Módulo</span>
                   </div>
                </div>

                <!-- Counter Controls (With explicit bottom margin for breathing room) -->
                <div class="mt-4 flex items-center gap-2 bg-slate-950/60 p-2 rounded-2xl border border-white/5 shadow-inner w-full justify-between relative z-10">
                   <button data-action="minus" data-id="${s.id}" class="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 active:scale-90 transition-all hover:bg-white/10">
                      <span class="material-symbols-outlined text-base">remove</span>
                   </button>
                   <div class="min-w-[24px]">
                      <span id="count-${s.id}" class="text-base font-black text-white tracking-tighter">0</span>
                   </div>
                   <button data-action="plus" data-id="${s.id}" class="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 active:scale-90 transition-all hover:bg-white/10">
                      <span class="material-symbols-outlined text-base">add</span>
                   </button>
                </div>
                
                <div class="h-2 w-full shrink-0"></div> <!-- Final breathing room at the bottom -->

                <!-- Glow background indicator (active) -->
                <div id="glow-${s.id}" class="absolute inset-0 bg-gradient-to-b from-${s.color}-500/0 to-${s.color}-500/10 rounded-[24px] opacity-0 group-[.active]:opacity-100 pointer-events-none transition-all duration-500"></div>
             </div>
           `).join('')}
        </div>
      </section>
    </main>

    <!-- Bottom Action & Total -->
    <footer class="px-6 py-6 bg-slate-950 border-t border-white/5 flex flex-col gap-4">
       <div class="flex justify-between items-center px-2">
          <div class="flex flex-col">
             <span class="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Total da Sessão</span>
             <div class="flex items-baseline gap-1">
                <span id="total-selected-count" class="text-3xl font-black text-white">0</span>
                <span class="text-slate-500 font-bold">/25</span>
             </div>
          </div>
          <div id="limit-warning" class="hidden text-[9px] font-black text-amber-500 uppercase tracking-widest animate-pulse border border-amber-500/20 px-3 py-1.5 rounded-lg bg-amber-500/5">
             Limite Máximo Atingido
          </div>
       </div>
       <button id="start-builder-btn" class="w-full h-16 bg-white text-slate-900 rounded-[24px] font-black flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all text-xs tracking-widest uppercase disabled:opacity-30 disabled:grayscale" disabled>
          Gerar Treino sob Medida <span class="material-symbols-outlined font-black">bolt</span>
       </button>
    </footer>

    <!-- CONFIRMATION MODAL -->
    <div id="confirm-modal" class="fixed inset-0 z-[100] hidden flex items-center justify-center px-6">
       <!-- Backdrop Blur -->
       <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-2xl modal-close-trigger"></div>
       
       <!-- Modal Card -->
       <div class="relative w-full max-w-sm bg-[#0f172a] border border-white/10 rounded-[40px] p-8 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in duration-300">
          <div class="absolute top-0 right-0 p-8 opacity-20">
             <span class="material-symbols-outlined text-8xl text-indigo-500">verified_user</span>
          </div>

          <div class="relative z-10 space-y-8">
             <header class="space-y-2">
                <div class="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                   <span class="material-symbols-outlined font-black">checklist</span>
                </div>
                <h3 class="text-2xl font-black text-white leading-tight italic">Protocolo Pronto</h3>
                <p class="text-slate-400 text-sm">Resumo do treinamento gerado pelo Tactical Engine.</p>
             </header>

             <!-- Summary Stats -->
             <div class="grid grid-cols-2 gap-4">
                <div class="bg-white/5 p-4 rounded-3xl border border-white/5">
                   <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Carga Total</span>
                   <span id="modal-total-questions" class="text-xl font-black text-white italic">0 Questões</span>
                </div>
                <div class="bg-white/5 p-4 rounded-3xl border border-white/5">
                   <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Nível IA</span>
                   <span class="text-xl font-black text-indigo-400 italic uppercase">Elite</span>
                </div>
             </div>

             <!-- Time Customization INSIDE MODAL -->
             <div class="space-y-4">
                <span class="text-[10px] text-slate-500 font-black uppercase tracking-widest block px-1">Definir Tempo Limite</span>
                <div class="bg-slate-950/50 border border-white/5 p-4 rounded-3xl flex items-center justify-between shadow-inner">
                   <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                         <span class="material-symbols-outlined text-xl">timer</span>
                      </div>
                      <span id="display-trial-time" class="text-xl font-black text-white tracking-tighter italic">25 <span class="text-[10px] uppercase text-slate-500 not-italic ml-0.5">Min</span></span>
                   </div>
                   <div class="flex items-center gap-2">
                      <button id="modal-time-minus" class="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-slate-300 active:scale-90 transition-all">
                         <span class="material-symbols-outlined text-lg">remove</span>
                      </button>
                      <button id="modal-time-plus" class="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-slate-300 active:scale-90 transition-all">
                         <span class="material-symbols-outlined text-lg">add</span>
                      </button>
                   </div>
                </div>
             </div>

             <div class="flex flex-col gap-3">
                <button id="confirm-training-btn" class="w-full h-16 bg-white text-slate-950 rounded-[20px] font-black flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all text-xs tracking-widest uppercase">
                   Iniciar Treino Agora <span class="material-symbols-outlined font-black">play_arrow</span>
                </button>
                <button class="w-full py-4 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors modal-close-trigger">
                   Voltar e Ajustar
                </button>
             </div>
          </div>
       </div>
    </div>

    <style>
      .subject-card.active {
        border-color: rgba(99, 102, 241, 0.3);
        background: rgba(15, 23, 42, 0.8);
      }
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-4px); }
        75% { transform: translateX(4px); }
      }
      .animate-shake {
        animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
      }
    </style>
  </div>`;
};

PageEvents["quiz-builder"] = async (page) => {
  const plan = AppState.get("userPlan");
  const isPremium = plan === "pro" || plan === "plus";

  if (!isPremium) {
    Router.navigate("/simulados");
    App.showUpgradeModal();
    return;
  }

  // Main screen elements
  const grid = page.querySelector("#builder-subjects-grid");
  const totalDisplay = page.querySelector("#total-selected-count");
  const limitWarning = page.querySelector("#limit-warning");
  const startBtn = page.querySelector("#start-builder-btn");

  // Modal elements
  const modal = page.querySelector("#confirm-modal");
  const modalQuestions = page.querySelector("#modal-total-questions");
  const timeDisplay = page.querySelector("#display-trial-time");
  const btnTimeMinus = page.querySelector("#modal-time-minus");
  const btnTimePlus = page.querySelector("#modal-time-plus");
  const confirmBtn = page.querySelector("#confirm-training-btn");
  const closeTriggers = page.querySelectorAll(".modal-close-trigger");

  const MAX_TOTAL = 25;
  const STEP = 5;
  let config = {}; // { id: count }
  let trialTime = 25;

  const updateTotal = () => {
    const total = Object.values(config).reduce((acc, val) => acc + val, 0);
    totalDisplay.textContent = total;
    modalQuestions.textContent = `${total} Questão${total !== 1 ? 's' : ''}`;
    
    if (total >= MAX_TOTAL) {
      limitWarning.classList.remove("hidden");
    } else {
      limitWarning.classList.add("hidden");
    }

    startBtn.disabled = total === 0;
  };

  const updateTimeUI = () => {
    timeDisplay.innerHTML = `${trialTime} <span class="text-[10px] uppercase text-slate-500 not-italic ml-0.5">Min</span>`;
  };

  // Time logic
  btnTimePlus.addEventListener("click", () => {
    if (trialTime < 60) {
      trialTime += 5;
      updateTimeUI();
      SoundManager.play("tap");
    } else {
      SoundManager.play("error");
    }
  });

  btnTimeMinus.addEventListener("click", () => {
    if (trialTime > 5) {
      trialTime -= 5;
      updateTimeUI();
      SoundManager.play("tap");
    } else {
      SoundManager.play("error");
    }
  });

  // Modal control
  startBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
    SoundManager.play("tap");
  });

  closeTriggers.forEach(t => {
    t.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
  });

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const action = btn.getAttribute("data-action");
    const id = btn.getAttribute("data-id");
    const currentCount = config[id] || 0;
    const totalCurrent = Object.values(config).reduce((acc, val) => acc + val, 0);

    const countEl = page.querySelector(`#count-${id}`);
    const card = page.querySelector(`.subject-card[data-id="${id}"]`);

    if (action === "plus") {
      if (totalCurrent + STEP <= MAX_TOTAL) {
        config[id] = currentCount + STEP;
        SoundManager.play("tap");
      } else {
        const remaining = MAX_TOTAL - totalCurrent;
        if (remaining > 0) {
          config[id] = currentCount + remaining;
          SoundManager.play("tap");
        } else {
          SoundManager.play("error");
          limitWarning.classList.add("animate-shake");
          setTimeout(() => limitWarning.classList.remove("animate-shake"), 500);
        }
      }
    } else if (action === "minus") {
      if (currentCount > 0) {
        config[id] = Math.max(0, currentCount - STEP);
        SoundManager.play("tap");
      }
    }

    countEl.textContent = config[id] || 0;
    if (config[id] > 0) {
      card.classList.add("active");
    } else {
      card.classList.remove("active");
      delete config[id];
    }

    updateTotal();
  });

  confirmBtn.addEventListener("click", () => {
    const total = Object.values(config).reduce((acc, val) => acc + val, 0);
    if (total === 0) return;

    const configParam = Object.entries(config)
      .map(([id, count]) => `${id}:${count}`)
      .join('|');

    Router.navigate(`/simulado-runner?type=Custom&config=${encodeURIComponent(configParam)}&time=${trialTime}`);
  });
};
