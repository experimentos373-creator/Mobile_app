// ============================================================
// Eduuhub Brasil - Page Renderers (Part 1: Home, Videos, Materia)
// ============================================================

const Pages = {};
const PageEvents = {};

const getRankInfo = (level) => {
  if (level <= 5) return { name: "Bronze", class: "rank-bronze", icon: "workspace_premium" };
  if (level <= 15) return { name: "Prata", class: "rank-silver", icon: "military_tech" };
  if (level <= 30) return { name: "Ouro", class: "rank-gold", icon: "stars" };
  return { name: "Estelar", class: "rank-stellar", icon: "auto_awesome" };
};

const getPlanBadge = (plan) => {
  switch(plan) {
    case 'gratis': return { name: "Bronze", class: 'rank-bronze', icon: 'workspace_premium' };
    case 'basico': return { name: "Prata", class: 'rank-silver', icon: 'military_tech' };
    case 'pro': return { name: "Ouro", class: 'rank-gold', icon: 'stars' };
    case 'plus': return { name: "Diamante", class: 'rank-plus', icon: 'diamond' };
    default: return { name: "Bronze", class: 'rank-bronze', icon: 'workspace_premium' };
  }
};

// ── HOME PAGE ──
Pages.home = () => {
  const c = enemCountdown();
  const name = AppState.get("userName");
  const plan = AppState.get("userPlan");
  const planLabels = {
    gratis: "Plano Grátis",
    basico: "Plano Básico",
    pro: "Plano Pro",
    plus: "Plano Plus+"
  };
  const planLabel = planLabels[plan] || "Plano Grátis";
  const studyMin = AppState.get("studyTimeMinutes");
  const studyH = Math.floor(studyMin / 60);
  const totalQ = AppState.get("totalQuestionsAnswered");
  const xp = totalQ * 10;
  const level = Math.floor(xp / 500) + 1;
  const xpInLevel = xp % 500;
  
  const rank = getRankInfo(level);
  const planBadge = getPlanBadge(plan);
  
  const subjects = APP_DATA.subjects;
  const videos = APP_DATA.videos;
  
  const missionProgress = AppState.get("missionProgress") || {};
  const missions = APP_DATA.missions;

    const targetExam = AppState.get("targetExam") || "ENEM 2026";

  return `
  <!-- Glass Header -->
  <header class="glass-header px-6 py-2 sticky top-0 z-20">
    <div class="flex items-center justify-between max-w-2xl mx-auto">
      <div class="flex items-center gap-4">
        <div class="relative">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-500/20">
            ${name[0]}
          </div>
          <div class="absolute -bottom-1 -right-1 rank-shield ${planBadge.class} w-6 h-6">
             <span class="material-symbols-outlined text-[12px] text-white font-normal">${planBadge.icon}</span>
          </div>
        </div>
        <div>
          <h1 class="text-lg font-black text-white tracking-tight-compact">${name.split(' ')[0]}</h1>
          <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">${planBadge.name}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="Router.navigate('/ranking')" class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-amber-400 hover:text-amber-300 transition-all hover:bg-white/10 shadow-lg active:scale-95">
          <span class="material-symbols-outlined text-xl fill-icon">leaderboard</span>
        </button>
        <button onclick="Router.navigate('/premium')" class="bg-emerald-500/10 text-emerald-400 text-[11px] font-black px-5 py-3 rounded-xl border border-emerald-500/20 uppercase tracking-[0.1em] hover:bg-emerald-500/20 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/5 hover:scale-105 active:scale-95">
          <span class="material-symbols-outlined text-base">workspace_premium</span>
          Upgrade
        </button>
        <button onclick="Router.navigate('/perfil')" class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-300 hover:text-white transition-all hover:bg-white/10 shadow-lg active:scale-95">
          <span class="material-symbols-outlined text-xl">settings_heart</span>
        </button>
      </div>
    </div>
  </header>

  <main class="flex-1 scroll-area px-0 py-2 space-y-8 safe-bottom">
    
    <!-- Unified Stats Dashboard -->
    <section class="max-w-2xl mx-auto px-6">
      <div onclick="Router.navigate('/ranking')" class="stats-dashboard rounded-3xl p-6 relative overflow-hidden shimmer-effect cursor-pointer active:scale-[0.99] transition-all">
        <div class="flex justify-between items-start mb-6 relative z-10">
          <div>
            <p class="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Nível de Estudo</p>
            <h2 class="text-4xl font-black text-white tracking-tight-compact">Nv. ${level}</h2>
          </div>
          <div class="text-right">
            <p class="text-[13px] font-black text-cyan-400 uppercase tracking-widest mb-1">XP Total</p>
            <h2 class="text-4xl font-black text-white tracking-tighter">${xp}</h2>
          </div>
        </div>
        
        <!-- Animated XP Bar -->
        <div class="relative z-10">
          <div class="flex justify-between text-sm font-black text-slate-400 mb-2 uppercase tracking-tight">
            <span>Progressão</span>
            <span class="text-white/90">${xpInLevel}/500 XP</span>
          </div>
          <div class="w-full bg-slate-900/50 h-3 rounded-full overflow-hidden p-0.5 border border-white/5">
            <div class="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full rounded-full animate-bar" style="width:${(xpInLevel / 500) * 100}%"></div>
          </div>
        </div>

        <!-- Quick Mini Stats -->
        <div class="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/5 relative z-10">
           <div class="flex items-center gap-3">
             <div class="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center glow-orange overflow-hidden">
               <span class="material-symbols-outlined text-orange-400 text-sm">local_fire_department</span>
             </div>
              <div>
                <div class="text-lg font-black text-white">${AppState.get("weeklyStudyData").filter(d => d > 0).length} dias</div>
                <p class="text-[13px] text-slate-500 font-bold uppercase">Sequência</p>
              </div>
           </div>
           <div class="flex items-center gap-3">
             <div class="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center glow-cyan overflow-hidden">
               <span class="material-symbols-outlined text-cyan-400 text-sm">schedule</span>
             </div>
              <div>
                <div class="text-lg font-black text-white">${studyH}h totais</div>
                <p class="text-[13px] text-slate-500 font-bold uppercase">Tempo</p>
              </div>
           </div>
        </div>

        <!-- Abstract Decorations -->
        <div class="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-10 -left-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>
    </section>

    <!-- Countdown Section (Compact Glass) -->
    <section class="max-w-2xl mx-auto px-6">
      <div id="countdown-card" onclick="window.openExamDatePicker && window.openExamDatePicker()" class="glass-card rounded-2xl p-4 flex items-center justify-between border border-white/5 shimmer-effect cursor-pointer active:scale-[0.99] transition-all" role="button" aria-label="Alterar data do exame" tabindex="0">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center glow-orange shrink-0">
            <span class="material-symbols-outlined text-orange-400">timer</span>
          </div>
          <div class="flex flex-col">
            <h4 class="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">D-Day ${targetExam}</h4>
            <div id="countdown-display" class="flex items-baseline gap-2">
               <span class="text-xl font-black text-white tracking-tight">${c.days}d</span>
               <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Para o grande dia</span>
            </div>
          </div>
        </div>
        <div class="text-[9px] font-black text-orange-500/20 uppercase tracking-[0.2em] [writing-mode:vertical-lr] rotate-180">
          FOCO ATIVO
        </div>
      </div>
    </section>

    <!-- AI Tutor Card -->
    <section class="max-w-2xl mx-auto px-6">
      <div onclick="${plan === 'gratis' ? "App.showUpgradeModal('O Tutor IA está disponível a partir do Plano Básico. Faça upgrade!')" : "Router.navigate('/ia-tutor')"}" 
           class="relative p-[1px] rounded-[24px] bg-gradient-to-r from-emerald-500/40 via-teal-500/30 to-emerald-500/40 overflow-hidden group active:scale-[0.98] transition-all cursor-pointer">
        <div class="bg-slate-900/90 rounded-[23px] p-5 flex items-center justify-between backdrop-blur-xl relative overflow-hidden border border-white/5">
          <div class="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div class="flex items-center gap-4 relative z-10">
            <div class="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-emerald-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20 group-hover:scale-110 transition-all shadow-lg shadow-cyan-500/10 shrink-0">
              <span class="material-symbols-outlined text-cyan-400" style="font-size: 45px !important;">neurology</span>
            </div>
            <div>
              <div class="inline-flex items-center px-2 py-0.5 bg-cyan-500/20 rounded mb-1.5">
                <span class="text-[8px] font-black text-cyan-300 uppercase tracking-widest leading-none">3 IAs Disponíveis</span>
              </div>
              <h3 class="text-lg font-black text-white leading-tight tracking-tight">Tutor IA</h3>
              <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5 opacity-60">Tire dúvidas com IA</p>
            </div>
          </div>
          <div class="relative z-10 flex items-center gap-2">
            ${plan === "gratis" ? '<span class="text-[8px] font-black text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 uppercase tracking-widest">Plus+</span>' : ''}
            <div class="bg-white/5 w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-cyan-500/50 transition-all">
              <span class="material-symbols-outlined text-slate-400 text-xl group-hover:text-cyan-400 transition-colors">chevron_right</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Flashcards Plus Entry (For Plus+) -->
    <section class="max-w-2xl mx-auto px-6">
      <div onclick="${plan !== 'plus' ? "App.showUpgradeModal('Flashcards Plus+ com repetição espaçada é exclusivo do Plano Plus+. Faça upgrade!')" : "Router.navigate('/flashcards')"}" 
           class="relative p-[1px] rounded-[24px] bg-gradient-to-r from-violet-500/40 via-purple-500/30 to-violet-500/40 overflow-hidden group active:scale-[0.98] transition-all cursor-pointer">
        <div class="bg-slate-900/90 rounded-[23px] p-5 flex items-center justify-between backdrop-blur-xl relative overflow-hidden border border-white/5 shadow-2xl">
          <div class="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div class="flex items-center gap-4 relative z-10">
            <div class="w-14 h-14 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/20 group-hover:scale-105 transition-all shadow-lg shadow-indigo-500/10">
              <span class="material-symbols-outlined text-indigo-400 text-3xl">style</span>
            </div>
            <div>
              <div class="inline-flex items-center px-2 py-0.5 bg-indigo-500/20 rounded mb-1.5">
                <span class="text-[8px] font-black text-indigo-300 uppercase tracking-widest leading-none">Memorização Elite</span>
              </div>
              <h3 class="text-lg font-black text-white leading-tight tracking-tight">Flashcards Plus+</h3>
              <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5 opacity-60">Repetição Espaçada IA</p>
            </div>
          </div>
          <div class="relative z-10 flex items-center gap-2">
            ${plan !== "plus" ? '<span class="text-[8px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20 uppercase tracking-widest">Plus+</span>' : ''}
            <div class="bg-white/5 w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-indigo-500/50 transition-all">
              <span class="material-symbols-outlined text-slate-400 text-xl group-hover:text-indigo-400 transition-colors">chevron_right</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- AI Essay Grading Entry -->
    <section class="max-w-2xl mx-auto px-6">
      <div onclick="${plan !== 'plus' ? "App.showUpgradeModal('O Corretor de Redação com IA é exclusivo do Plano Plus+. Faça upgrade!')" : "Router.navigate('/redacao-ai')"}" 
           class="relative p-[1px] rounded-[24px] bg-gradient-to-r from-emerald-500/40 via-cyan-500/30 to-emerald-500/40 overflow-hidden group active:scale-[0.98] transition-all cursor-pointer">
        <div class="bg-[#0f172a]/90 rounded-[23px] p-5 flex items-center justify-between backdrop-blur-xl relative overflow-hidden border border-white/5 shadow-2xl">
          <div class="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div class="flex items-center gap-4 relative z-10">
            <div class="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-all shadow-lg shadow-emerald-500/10">
              <span class="material-symbols-outlined text-emerald-400 text-3xl">edit_note</span>
            </div>
            <div>
              <div class="inline-flex items-center px-2 py-0.5 bg-emerald-500/20 rounded mb-1.5">
                <span class="text-[8px] font-black text-emerald-300 uppercase tracking-widest leading-none">Correção Instantânea</span>
              </div>
              <h3 class="text-lg font-black text-white leading-tight tracking-tight">Redação AI</h3>
              <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5 opacity-60">Feedback por Competência</p>
            </div>
          </div>
          <div class="relative z-10 flex items-center gap-2">
            ${plan !== "plus" ? '<span class="text-[8px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20 uppercase tracking-widest">Plus+</span>' : ''}
            <div class="bg-white/5 w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-emerald-500/50 transition-all">
              <span class="material-symbols-outlined text-slate-400 text-xl group-hover:text-emerald-400 transition-colors">chevron_right</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Quests Section (New Gamification) -->
    <section class="max-w-2xl mx-auto px-6 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
           <span class="material-symbols-outlined text-emerald-400 text-lg">bolt</span>
           Missões Diárias
        </h3>
        <button onclick="Router.navigate('/missoes')" class="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 hover:bg-emerald-500/20 active:scale-95 transition-all">Ver Tudo</button>
      </div>
      
      <div class="space-y-3">
        ${(() => {
          const plan = AppState.get("userPlan");
          const limit = plan === "gratis" ? 2 : plan === "basico" ? 3 : 4;
          const activeMissions = APP_DATA.missions.slice(0, limit);
          
          return activeMissions.map(m => {
            const progress = missionProgress[m.id] || 0;
            const isDone = progress >= m.goal;
            return `
              <div class="quest-card rounded-2xl p-4 flex items-center gap-4 ${isDone ? 'completed' : ''}">
                 <div class="w-10 h-10 rounded-xl ${isDone ? 'bg-emerald-500/20' : 'bg-white/5'} flex items-center justify-center transition-all">
                    <span class="material-symbols-outlined ${isDone ? 'text-emerald-400 fill-icon' : 'text-slate-400'}">${isDone ? 'check_circle' : m.icon || 'star'}</span>
                 </div>
                 <div class="flex-1">
                    <h4 class="text-sm font-bold text-white mb-1">${m.title}</h4>
                    <div class="flex items-center gap-3">
                       <div class="flex-1 bg-slate-900/50 h-1.5 rounded-full overflow-hidden p-0.5 border border-white/5">
                          <div class="bg-emerald-500 h-full rounded-full transition-all duration-500" style="width: ${Math.min(100, (progress / m.goal) * 100)}%"></div>
                       </div>
                       <span class="text-[10px] font-black text-slate-500">${progress}/${m.goal}</span>
                    </div>
                 </div>
                 <div class="text-right">
                    <span class="${isDone ? 'text-emerald-400' : 'text-slate-500'} font-black text-[10px] uppercase tracking-widest">+${m.xp} XP</span>
                 </div>
              </div>
            `;
          }).join("");
        })()}
      </div>
    </section>

    <!-- Subjects Carousel (Horizontal) -->
    <section class="space-y-4">
      <div class="flex items-center justify-between px-6">
        <h3 class="text-sm font-black text-white uppercase tracking-widest">Suas Matérias</h3>
        <button onclick="Router.navigate('/progresso')" class="text-[10px] font-bold text-cyan-400 underline underline-offset-4">Ver Tudo</button>
      </div>
      <div class="horizontal-scroll pr-6">
        <div class="w-7 shrink-0"></div>
        ${subjects.map(s => {
          const colorMap = { matematica: "#3B82F6", fisica: "#8B5CF6", quimica: "#EF4444", biologia: "#22C55E", portugues: "#F59E0B", historia: "#F97316", geografia: "#06B6D4", redacao: "#F43F5E", geral: "#6366F1" };
          const borderCol = colorMap[s.id] || "#64748b";
          return `
          <div onclick="Router.navigate('/materia/${s.id}')" class="w-40 glass-card rounded-2xl pl-3 py-4 pr-4 touch-card hover-float group transition-all" style="border-left: 4px solid ${borderCol}">
            <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
              <span class="material-symbols-outlined" style="color: ${borderCol}">${s.icon}</span>
            </div>
            <h4 class="text-sm font-bold text-white mb-1 line-clamp-1">${s.label}</h4>
            <div class="flex items-center gap-1.5">
               <div class="w-1.5 h-1.5 rounded-full" style="background-color: ${borderCol}"></div>
               <p class="text-[9px] text-slate-400 font-black uppercase">${s.progress}% Concluído</p>
            </div>
          </div>`;
        }).join("")}
      </div>
    </section>

    <!-- Recommended Videos (Carousel) -->
    <section class="space-y-4 pb-10">
      <div class="flex items-center justify-between px-6">
        <h3 class="text-sm font-black text-white uppercase tracking-widest">Aulas Recomendadas</h3>
        <button onclick="Router.navigate('/videos')" class="text-[10px] font-bold text-cyan-400 underline underline-offset-4">Mais Aulas</button>
      </div>
      <div class="horizontal-scroll pr-6">
        <div class="w-7 shrink-0"></div>
        ${videos.map((v, index) => `
          <div onclick="window.open('${v.youtubeUrl}', '_blank')" class="w-64 glass-card rounded-2xl overflow-hidden touch-card hover-float group transition-all" style="border-left: 4px solid #10b981">
            <div class="relative aspect-video">
              <img src="${v.thumbnail}" ${index > 1 ? 'loading="lazy"' : ''} class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="${v.title}">
              <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
              <div class="absolute bottom-2 right-2 bg-black/70 text-[10px] font-black text-white px-2 py-0.5 rounded backdrop-blur">
                PROF. ${v.professor}
              </div>
            </div>
            <div class="pl-3 py-4 pr-4">
              <h4 class="text-xs font-bold text-white line-clamp-2 leading-tight">${v.title}</h4>
            </div>
          </div>
        `).join("")}
      </div>
    </section>
  </main>`;
};

PageEvents.home = (page) => {
  // Live countdown update if element exists
  const update = () => {
    const c = enemCountdown();
    const el = page.querySelector("#countdown-display");
    if (!el) return;
    
    const d = el.querySelector("span:nth-child(1)");
    if (d) d.textContent = c.days + "d";
  };

  const closeExamDateModal = () => {
    const existing = document.getElementById("exam-date-modal");
    if (existing && existing._onKeyDown) {
      document.removeEventListener("keydown", existing._onKeyDown);
    }
    if (existing) existing.remove();
    document.body.style.overflow = "";
  };

  const openExamDateModal = () => {
    closeExamDateModal();

    const existingDate = String(AppState.get("examDate") || "2026-11-01");
    const parsed = existingDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    let selectedDateStr = parsed ? existingDate : "2026-11-01";
    let calYear = parsed ? Number(parsed[1]) : 2026;
    let calMonth = parsed ? Number(parsed[2]) - 1 : 10;

    const modal = document.createElement("div");
    modal.id = "exam-date-modal";
    modal.className = "fixed inset-0";
    modal.style.cssText = "position:fixed;inset:0;z-index:2147483647;background:rgba(2,6,23,0.9);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:18px;";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = Security.sanitize(`
      <div id="exam-date-panel" class="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
        <div class="w-12 h-1 rounded-full bg-white/15 mx-auto mb-5"></div>

        <div class="flex items-center justify-between mb-4">
          <h3 class="text-[11px] font-black text-white uppercase tracking-[0.15em]">Escolher Data do Exame</h3>
          <button id="exam-date-close" class="w-9 h-9 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <p class="text-xs text-slate-400 mb-5 leading-relaxed">Atualize sua data alvo e o contador D-Day será recalculado.</p>

        <div class="mb-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-3 text-center">
          <span class="text-[10px] font-black uppercase tracking-[0.12em] text-emerald-300">Data selecionada: </span>
          <span id="exam-date-selected-label" class="text-[11px] font-black text-white"></span>
        </div>

        <div id="exam-calendar-root" class="premium-calendar mb-6"></div>

        <div class="flex items-center gap-4 pt-1">
          <button id="exam-date-cancel" class="flex-1 py-3.5 rounded-xl border border-white/10 bg-white/5 text-slate-300 font-bold text-sm">Cancelar</button>
          <button id="exam-date-save" class="flex-1 py-3.5 rounded-xl bg-emerald-500 text-white font-black text-sm">Confirmar</button>
        </div>
      </div>
    `);

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const formatDateLabel = (iso) => {
      const m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!m) return "";
      const year = Number(m[1]);
      const monthIdx = Number(m[2]) - 1;
      const day = Number(m[3]);
      return `${String(day).padStart(2, "0")} de ${monthNames[monthIdx]} de ${year}`;
    };

    const panel = modal.querySelector("#exam-date-panel");
    if (panel) {
      panel.style.maxHeight = "92vh";
      panel.style.overflowY = "auto";
      panel.style.width = "100%";
      panel.style.maxWidth = "470px";
      panel.style.background = "rgba(15,23,42,0.98)";
      panel.style.border = "1px solid rgba(148,163,184,0.25)";
      panel.style.padding = "24px";
      panel.style.boxShadow = "0 30px 80px rgba(2,6,23,0.65)";
      panel.style.transform = "translateY(-14px)";
    }

    const renderCalendar = () => {
      const today = new Date();
      const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
      const firstDayIdx = new Date(calYear, calMonth, 1).getDay();

      let html = `
        <div class="calendar-header">
          <button class="calendar-btn" id="exam-cal-prev"><span class="material-symbols-outlined">chevron_left</span></button>
          <div class="calendar-month-year">${monthNames[calMonth]} ${calYear}</div>
          <button class="calendar-btn" id="exam-cal-next"><span class="material-symbols-outlined">chevron_right</span></button>
        </div>
        <div class="calendar-grid">
          <div class="calendar-weekday">Dom</div><div class="calendar-weekday">Seg</div><div class="calendar-weekday">Ter</div>
          <div class="calendar-weekday">Qua</div><div class="calendar-weekday">Qui</div><div class="calendar-weekday">Sex</div><div class="calendar-weekday">Sáb</div>
      `;

      for (let i = 0; i < firstDayIdx; i++) html += `<div class="calendar-day empty"></div>`;

      for (let d = 1; d <= daysInMonth; d++) {
        const dStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const isSelected = dStr === selectedDateStr;
        const isToday = dStr === today.toISOString().split("T")[0];
        html += `<div class="calendar-day ${isSelected ? "selected" : ""} ${isToday ? "today" : ""}" data-date="${dStr}">${d}</div>`;
      }

      html += `</div>`;
      const root = modal.querySelector("#exam-calendar-root");
      if (!root) return;
      root.innerHTML = html;
      root.style.maxWidth = "380px";
      root.style.padding = "22px";
      root.style.paddingTop = "28px";
      root.style.borderRadius = "26px";
      root.style.marginTop = "10px";
      root.style.marginBottom = "24px";

      const selectedLabel = modal.querySelector("#exam-date-selected-label");
      if (selectedLabel) selectedLabel.textContent = formatDateLabel(selectedDateStr);

      const prevBtn = modal.querySelector("#exam-cal-prev");
      const nextBtn = modal.querySelector("#exam-cal-next");
      if (prevBtn) {
        prevBtn.onclick = () => {
          calMonth--;
          if (calMonth < 0) {
            calMonth = 11;
            calYear--;
          }
          renderCalendar();
        };
      }
      if (nextBtn) {
        nextBtn.onclick = () => {
          calMonth++;
          if (calMonth > 11) {
            calMonth = 0;
            calYear++;
          }
          renderCalendar();
        };
      }

      modal.querySelectorAll(".calendar-day:not(.empty)").forEach((el) => {
        el.onclick = () => {
          selectedDateStr = el.dataset.date;
          renderCalendar();
          SoundManager.play("tap");
        };
      });
    };

    document.body.appendChild(modal);
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") closeExamDateModal();
    };
    modal._onKeyDown = onKeyDown;
    document.addEventListener("keydown", onKeyDown);
    renderCalendar();

    const closeBtn = modal.querySelector("#exam-date-close");
    const cancelBtn = modal.querySelector("#exam-date-cancel");
    const saveBtn = modal.querySelector("#exam-date-save");

    if (closeBtn) closeBtn.addEventListener("click", closeExamDateModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeExamDateModal);
    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        AppState.set("examDate", selectedDateStr);
        AppState.saveToCloud().catch((error) => {
          console.warn("Falha ao salvar nova data do exame:", error);
        });
        update();
        if (typeof App !== "undefined" && typeof App.showToast === "function") {
          App.showToast("Data do exame atualizada com sucesso!", "success");
        }
        closeExamDateModal();
      });
    }

    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeExamDateModal();
    });
  };

  const countdownCard = page.querySelector("#countdown-card");
  window.openExamDatePicker = openExamDateModal;
  if (countdownCard && !countdownCard.dataset.bound) {
    countdownCard.dataset.bound = "true";
    countdownCard.addEventListener("click", openExamDateModal);
    countdownCard.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openExamDateModal();
      }
    });
  }

  update();
  if (window._countdownInterval) clearInterval(window._countdownInterval);
  window._countdownInterval = setInterval(update, 1000);
};

// ── VIDEOS PAGE ──
Pages.videos = () => {
  const plan = AppState.get("userPlan");
  
  const areas = [
    { id: "todas", name: "Todas as Áreas", desc: "Ver catálogo completo", icon: "dashboard", color: "slate" },
    { id: "linguagens", name: "Linguagens", desc: "Português e Redação", icon: "translate", color: "amber" },
    { id: "natureza", name: "Natureza", desc: "Biol., Quím. e Física", icon: "science", color: "emerald" },
    { id: "humanas", name: "Humanas", desc: "História e Geografia", icon: "public", color: "cyan" },
    { id: "matematica", name: "Matemática", desc: "Raciocínio e Cálculo", icon: "calculate", color: "blue" },
    { id: "estrategia", name: "Estratégia", desc: "Métodos e TRI", icon: "tips_and_updates", color: "indigo" }
  ];

  let availableVideos = APP_DATA.videos;
  if (plan === "gratis") {
    availableVideos = availableVideos.slice(0, 5);
  } else if (plan === "basico") {
    availableVideos = availableVideos.filter(v => !v.isPro);
  }

  const featuredVideo = availableVideos[0];
  const restVideos = availableVideos.slice(1);

  return `
  <!-- Immersive Glass Header -->
  <header class="glass-header px-6 pt-8 pb-6 sticky top-0 z-50 transition-all duration-300">
    <div class="flex items-center justify-between max-w-2xl mx-auto mb-8">
      <button onclick="Router.back()" class="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 text-slate-300 hover:bg-white/10 hover:scale-105 active:scale-95 transition-all border border-white/5">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
      <div class="text-center">
        <p class="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-1">Elite Learning</p>
        <h1 class="text-sm font-black text-white uppercase tracking-[0.2em]">Biblioteca de Vídeos</h1>
      </div>
      <div class="w-12 h-12 flex items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <span class="material-symbols-outlined fill-icon">movie</span>
      </div>
    </div>
    
    <!-- Ultra-Modern Search Bar -->
    <div class="max-w-2xl mx-auto relative group mb-6">
      <div class="absolute inset-y-0 left-5 flex items-center pointer-events-none">
        <span class="material-symbols-outlined text-slate-500 group-focus-within:text-emerald-400 group-focus-within:scale-110 transition-all">search</span>
      </div>
      <input id="video-search" type="text" placeholder="O que você quer dominar hoje?" 
             class="w-full bg-slate-950/40 border border-white/10 rounded-[1.5rem] py-5 pl-14 pr-6 text-white placeholder:text-slate-600 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-400/5 transition-all font-bold text-sm backdrop-blur-md">
    </div>

    <!-- Tiered Vertical Selectors (AI Style) -->
    <div class="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-3">
      
      <!-- Area Selector -->
      <div class="relative z-40">
        <button id="area-dropdown-btn" class="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-[1.25rem] px-4 py-3.5 hover:bg-white/10 transition-all active:scale-[0.98]">
          <div class="flex items-center gap-3 overflow-hidden">
            <div id="active-area-icon" class="size-8 rounded-xl bg-slate-500/10 flex items-center justify-center border border-slate-500/20 shrink-0">
               <span class="material-symbols-outlined text-sm text-slate-400">dashboard</span>
            </div>
            <div class="flex flex-col items-start min-w-0">
              <span id="active-area-name" class="text-[11px] font-black text-white uppercase tracking-wider leading-none">Área Acadêmica</span>
              <span id="active-area-desc" class="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 truncate w-full">Selecione uma área</span>
            </div>
          </div>
          <span id="area-chevron" class="material-symbols-outlined text-slate-500 text-lg transition-transform duration-300">expand_more</span>
        </button>
        
        <div id="area-dropdown-menu" class="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-white/10 rounded-[1.5rem] shadow-2xl opacity-0 invisible transform -translate-y-2 transition-all duration-300 origin-top flex flex-col max-h-[75vh] overflow-y-auto pointer-events-none" style="-webkit-overflow-scrolling: touch;">
          ${areas.map(area => `
            <button data-area="${area.id}" class="area-option flex items-center gap-3 px-4 py-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors text-left group">
              <div class="size-9 rounded-xl bg-${area.color}-500/10 flex items-center justify-center shrink-0 border border-${area.color}-500/20 group-hover:bg-${area.color}-500/20 transition-colors">
                <span class="material-symbols-outlined text-sm text-${area.color}-400">${area.icon}</span>
              </div>
              <div class="flex flex-col items-start pt-[2px] min-w-0 pr-2 flex-1">
                <span class="text-[11px] font-black text-slate-200 uppercase tracking-widest truncate">${area.name}</span>
                <span class="text-[9px] text-slate-500 font-bold uppercase tracking-widest truncate mt-0.5 w-full">${area.desc}</span>
              </div>
            </button>
          `).join("")}
        </div>
      </div>

      <!-- Subject Selector (Dependent) -->
      <div class="relative z-30">
        <button id="subject-dropdown-btn" class="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-[1.25rem] px-4 py-3.5 opacity-50 cursor-not-allowed transition-all">
          <div class="flex items-center gap-3 overflow-hidden">
            <div id="active-subj-icon" class="size-8 rounded-xl bg-slate-500/10 flex items-center justify-center border border-slate-500/20 shrink-0">
               <span class="material-symbols-outlined text-sm text-slate-400">subject</span>
            </div>
            <div class="flex flex-col items-start min-w-0">
              <span id="active-subj-name" class="text-[11px] font-black text-white uppercase tracking-wider leading-none">Disciplina</span>
              <span id="active-subj-desc" class="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 truncate w-full">Escolha uma área primeiro</span>
            </div>
          </div>
          <span id="subj-chevron" class="material-symbols-outlined text-slate-500 text-lg transition-transform duration-300">expand_more</span>
        </button>
        
        <div id="subject-dropdown-menu" class="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-white/10 rounded-[1.5rem] shadow-2xl opacity-0 invisible transform -translate-y-2 transition-all duration-300 origin-top flex flex-col max-h-[75vh] overflow-y-auto pointer-events-none" style="-webkit-overflow-scrolling: touch;">
          <!-- Dynamic Subjects injected here -->
        </div>
      </div>

    </div>
  </header>

  <main class="flex-1 scroll-area px-6 py-6 pb-24 space-y-10 safe-bottom">
    
    <!-- Hero Recommendation -->
    <div id="video-featured-area" class="space-y-6">
       <div class="flex items-center justify-between px-2">
         <div class="flex items-center gap-3">
           <div class="w-1.5 h-6 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full"></div>
           <p class="text-xs font-black text-white uppercase tracking-[0.2em]">Seleção para Você</p>
         </div>
         <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Masterclass</span>
       </div>
       <div id="video-featured" class="transition-all duration-500 transform hover:scale-[1.02]">
         ${videoCard(featuredVideo, true)}
       </div>
    </div>
    
    <!-- Categorized Exploration -->
    <div class="space-y-6">
      <div class="flex items-center justify-between px-2">
        <div class="flex items-center gap-3">
          <div class="w-1.5 h-6 bg-slate-700 rounded-full"></div>
          <p class="text-xs font-black text-white uppercase tracking-[0.2em]">Explorar Catálogo</p>
        </div>
        <button class="text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:underline">Ver Todos</button>
      </div>
      
      <div id="video-list" class="grid grid-cols-1 gap-4">
        ${restVideos.map((v, i) => `
          <div class="transition-all duration-500 delay-[${i*100}ms] animate-fade-in-up">
            ${videoCard(v, false)}
          </div>
        `).join("")}
      </div>
    </div>
    
    <!-- Gamified Encouragement -->
    <div class="relative py-12 px-8 rounded-[2rem] overflow-hidden bg-gradient-to-br from-emerald-500/10 to-transparent border border-white/5 text-center">
      <div class="relative z-10 space-y-3">
        <p class="text-emerald-400 font-black text-lg">Pronto para subir de nível?</p>
        <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">
          Cada minuto estudado fortalece sua base de conhecimento para o ENEM.
        </p>
      </div>
      <div class="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl opacity-50"></div>
    </div>
  </main>`;
};

PageEvents.videos = (page) => {
  let activeAreaId = "todas";
  let activeSubjectId = "todos";
  const searchInput = page.querySelector("#video-search");
  
  const areasMapping = {
    todas: [],
    linguagens: ["portugues", "redacao"],
    natureza: ["fisica", "quimica", "biologia"],
    humanas: ["historia", "geografia"],
    matematica: ["matematica"],
    estrategia: ["geral"]
  };

  const areaData = {
    todas: { name: "Todas as Áreas", desc: "Ver catálogo completo", icon: "dashboard", color: "slate" },
    linguagens: { name: "Linguagens", desc: "Português e Redação", icon: "translate", color: "amber" },
    natureza: { name: "Natureza", desc: "Biol., Quím. e Física", icon: "science", color: "emerald" },
    humanas: { name: "Humanas", desc: "História e Geografia", icon: "public", color: "cyan" },
    matematica: { name: "Matemática", desc: "Raciocínio e Cálculo", icon: "calculate", color: "blue" },
    estrategia: { name: "Estratégia", desc: "Métodos e TRI", icon: "tips_and_updates", color: "indigo" }
  };

  const subjectLabels = { todos: "Todas as Disciplinas", ...Object.fromEntries(APP_DATA.subjects.map(s => [s.id, s.label])) };
  const subjectIcons = Object.fromEntries(APP_DATA.subjects.map(s => [s.id, s.icon]));
  const subjectColors = Object.fromEntries(APP_DATA.subjects.map(s => [s.id, s.color || 'emerald']));

  const filterVideos = () => {
    const q = searchInput.value.toLowerCase();
    const filtered = APP_DATA.videos.filter(v => {
      const currentAreaSubjects = areasMapping[activeAreaId];
      const matchArea = activeAreaId === "todas" || currentAreaSubjects.includes(v.subject);
      const matchSubj = activeSubjectId === "todos" || v.subject === activeSubjectId;
      const matchSearch = !q || v.title.toLowerCase().includes(q) || v.professor.toLowerCase().includes(q) || v.subjectLabel.toLowerCase().includes(q);
      return matchArea && matchSubj && matchSearch;
    });

    const listArea = page.querySelector("#video-list");
    const featuredArea = page.querySelector("#video-featured-area");

    listArea.style.opacity = "0.5";
    setTimeout(() => {
      if (filtered.length === 0) {
        featuredArea.style.display = "none";
        listArea.innerHTML = Security.sanitize(`
          <div class="flex flex-col items-center justify-center py-24 text-center space-y-6">
            <div class="size-24 rounded-full bg-white/5 flex items-center justify-center border border-white/5 relative">
              <span class="material-symbols-outlined text-4xl text-slate-700">video_library_off</span>
            </div>
            <p class="text-white text-lg font-black uppercase tracking-widest">Nada encontrado</p>
            <button id="clear-filters-btn" class="px-8 py-3 bg-emerald-500 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest">Limpar Filtros</button>
          </div>
        `);
        page.querySelector("#clear-filters-btn").onclick = () => {
          searchInput.value = "";
          activeAreaId = "todas";
          activeSubjectId = "todos";
          updateAreaUI();
          updateSubjectDropdown();
          filterVideos();
        };
      } else {
        featuredArea.style.display = "block";
        const feat = filtered[0];
        const rest = filtered.slice(1);
        page.querySelector("#video-featured").innerHTML = Security.sanitize(videoCard(feat, true));
        listArea.innerHTML = Security.sanitize(rest.map((v, i) => `
          <div class="animate-fade-in-up" style="animation-delay:${i * 50}ms">
            ${videoCard(v, false)}
          </div>
        `).join(""));
      }
      listArea.style.opacity = "1";
    }, 200);
  };

  const toggleDropdown = (btnId, menuId, chevronId) => {
    const btn = page.querySelector(btnId);
    const menu = page.querySelector(menuId);
    const chevron = page.querySelector(chevronId);
    const isOpen = menu.classList.contains("opacity-100");

    // Close others
    page.querySelectorAll("[id$='-dropdown-menu']").forEach(m => {
      if (m !== menu) {
        m.classList.add("opacity-0", "invisible", "-translate-y-2", "pointer-events-none");
        m.classList.remove("opacity-100", "visible", "translate-y-0", "pointer-events-auto");
      }
    });
    page.querySelectorAll("[id$='-chevron']").forEach(c => {
      if (c !== chevron) c.style.transform = "rotate(0deg)";
    });

    if (isOpen) {
      menu.classList.add("opacity-0", "invisible", "-translate-y-2", "pointer-events-none");
      menu.classList.remove("opacity-100", "visible", "translate-y-0", "pointer-events-auto");
      chevron.style.transform = "rotate(0deg)";
    } else {
      menu.classList.remove("opacity-0", "invisible", "-translate-y-2", "pointer-events-none");
      menu.classList.add("opacity-100", "visible", "translate-y-0", "pointer-events-auto");
      chevron.style.transform = "rotate(180deg)";
    }
  };

  const updateAreaUI = () => {
    const data = areaData[activeAreaId];
    page.querySelector("#active-area-name").textContent = data.name;
    page.querySelector("#active-area-desc").textContent = data.desc;
    const iconCont = page.querySelector("#active-area-icon");
    iconCont.className = `size-8 rounded-xl bg-${data.color}-500/10 flex items-center justify-center border border-${data.color}-500/20 shrink-0`;
    iconCont.innerHTML = Security.sanitize(`<span class="material-symbols-outlined text-sm text-${data.color}-400">${data.icon}</span>`);
  };

  const updateSubjectDropdown = () => {
    const subjectsList = areasMapping[activeAreaId];
    const subjBtn = page.querySelector("#subject-dropdown-btn");
    const subjMenu = page.querySelector("#subject-dropdown-menu");

    if (activeAreaId === "todas") {
      subjBtn.classList.add("opacity-50", "cursor-not-allowed");
      page.querySelector("#active-subj-desc").textContent = "Escolha uma área primeiro";
      subjMenu.innerHTML = Security.sanitize("");
      activeSubjectId = "todos";
    } else {
      subjBtn.classList.remove("opacity-50", "cursor-not-allowed");
      page.querySelector("#active-subj-desc").textContent = "Todas as Disciplinas";
      
      const options = ["todos", ...subjectsList];
      subjMenu.innerHTML = Security.sanitize(options.map(sId => {
        const label = subjectLabels[sId];
        const icon = sId === "todos" ? "subject" : (subjectIcons[sId] || "school");
        const color = sId === "todos" ? "slate" : (subjectColors[sId] || "emerald");
        return `
          <button data-subject="${sId}" class="subject-option flex items-center gap-3 px-4 py-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors text-left group">
            <div class="size-9 rounded-xl bg-${color}-500/10 flex items-center justify-center shrink-0 border border-${color}-500/20 group-hover:bg-${color}-500/20 transition-colors">
              <span class="material-symbols-outlined text-sm text-${color}-400">${icon}</span>
            </div>
            <div class="flex flex-col items-start pt-[2px] min-w-0 pr-2 flex-1">
              <span class="text-[11px] font-black text-slate-200 uppercase tracking-widest truncate">${label}</span>
              <span class="text-[9px] text-slate-500 font-bold uppercase tracking-widest truncate mt-0.5 w-full">${sId === 'todos' ? 'Ver tudo da área' : 'Explorar conteúdo'}</span>
            </div>
          </button>
        `;
      }).join(""));

      page.querySelectorAll(".subject-option").forEach(opt => {
        opt.onclick = () => {
          activeSubjectId = opt.dataset.subject;
          const sId = activeSubjectId;
          page.querySelector("#active-subj-name").textContent = subjectLabels[sId];
          page.querySelector("#active-subj-desc").textContent = sId === 'todos' ? 'Todas da área' : 'Disciplina selecionada';
          const iconCont = page.querySelector("#active-subj-icon");
          const icon = sId === "todos" ? "subject" : (subjectIcons[sId] || "school");
          const color = sId === "todos" ? "slate" : (subjectColors[sId] || "emerald");
          iconCont.className = `size-8 rounded-xl bg-${color}-500/10 flex items-center justify-center border border-${color}-500/20 shrink-0`;
          iconCont.innerHTML = Security.sanitize(`<span class="material-symbols-outlined text-sm text-${color}-400">${icon}</span>`);
          
          toggleDropdown("#subject-dropdown-btn", "#subject-dropdown-menu", "#subj-chevron");
          filterVideos();
          SoundManager.play("tap");
        };
      });
    }
    
    // Reset subject display
    page.querySelector("#active-subj-name").textContent = "Disciplina";
    page.querySelector("#active-subj-icon").innerHTML = `<span class="material-symbols-outlined text-sm text-slate-400">subject</span>`;
  };

  // Events
  page.querySelector("#area-dropdown-btn").onclick = () => toggleDropdown("#area-dropdown-btn", "#area-dropdown-menu", "#area-chevron");
  page.querySelector("#subject-dropdown-btn").onclick = () => {
    if (activeAreaId !== "todas") toggleDropdown("#subject-dropdown-btn", "#subject-dropdown-menu", "#subj-chevron");
  };

  page.querySelectorAll(".area-option").forEach(opt => {
    opt.onclick = () => {
      activeAreaId = opt.dataset.area;
      activeSubjectId = "todos";
      updateAreaUI();
      updateSubjectDropdown();
      toggleDropdown("#area-dropdown-btn", "#area-dropdown-menu", "#area-chevron");
      filterVideos();
      SoundManager.play("tap");
    };
  });

  searchInput.addEventListener("input", filterVideos);

  // Close dropdowns on outside click
  page.onclick = (e) => {
    if (!e.target.closest("#area-dropdown-btn") && !e.target.closest("#area-dropdown-menu") &&
        !e.target.closest("#subject-dropdown-btn") && !e.target.closest("#subject-dropdown-menu")) {
      page.querySelectorAll("[id$='-dropdown-menu']").forEach(m => {
        m.classList.add("opacity-0", "invisible", "-translate-y-2", "pointer-events-none");
        m.classList.remove("opacity-100", "visible", "translate-y-0", "pointer-events-auto");
      });
      page.querySelectorAll("[id$='-chevron']").forEach(c => c.style.transform = "rotate(0deg)");
    }
  };
};

// ── MATERIA (Subject Details) PAGE ──
Pages.materia = (params) => {
  const id = params.id || "matematica";
  const subj = APP_DATA.subjects.find(s => s.id === id) || APP_DATA.subjects[0];
  const profs = APP_DATA.professors[id] || [];
  const topics = [
    { name: "Geometria Plana", lessons: 8, status: "done" },
    { name: "Funções do 1º e 2º Grau", lessons: 12, status: "progress" },
    { name: "Trigonometria", lessons: 10, status: "locked" }
  ];

  return `
  <header class="bg-primary text-white pt-8 pb-12 px-6 rounded-b-xl shadow-lg relative overflow-hidden">
    <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20"></div>
    <div class="flex items-center justify-between mb-8 relative z-10">
      <button onclick="Router.back()" class="p-2 hover:bg-white/10 rounded-full transition-colors"><span class="material-symbols-outlined text-white">arrow_back</span></button>
      <h1 class="text-xl font-bold">Detalhes da Disciplina</h1>
      <div class="w-10"></div>
    </div>
    <div class="flex flex-col items-center text-center relative z-10">
      <div class="w-24 h-24 bg-white/10 rounded-xl flex items-center justify-center mb-4 border border-white/20"><span class="material-symbols-outlined text-5xl text-white">${subj.icon}</span></div>
      <h2 class="text-3xl font-bold tracking-tight mb-1">${subj.label}</h2>
      <p class="text-white/70 text-sm font-light">Foco em Vestibulares e ENEM</p>
    </div>
  </header>
  <main class="flex-1 scroll-area px-4 safe-bottom relative z-20">
    <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md border border-slate-200 dark:border-slate-700 mb-6">
      <div class="flex justify-between items-end mb-4"><div><p class="text-slate-500 text-xs uppercase tracking-wider font-semibold">Progresso Geral</p><h3 class="text-2xl font-bold text-primary dark:text-white">${subj.progress}%</h3></div><p class="text-xs text-slate-400 mb-1">${subj.completed} de ${subj.modules} módulos</p></div>
      <div class="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden"><div class="bg-emerald-500 h-full rounded-full animate-bar" style="width:${subj.progress}%"></div></div>
    </div>

    ${profs.length ? `<section class="mb-8"><h3 class="text-lg font-bold text-primary dark:text-white mb-4 px-2">Corpo Docente</h3>
      <div class="flex gap-4 overflow-x-auto pb-2 no-scrollbar">${profs.map(p => `
        <div onclick="window.open('${p.channel}','_blank')" class="flex flex-col items-center min-w-[100px] cursor-pointer">
          <div class="w-16 h-16 rounded-full border-2 border-primary/20 p-1 mb-2"><div class="w-full h-full rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary dark:text-white">${p.name.slice(0, 2)}</div></div>
          <span class="text-xs font-medium text-center">${p.name}</span>
        </div>`).join("")}</div></section>` : ""}

    <section class="mb-8">
      <div class="flex items-center justify-between mb-4 px-2"><h3 class="text-lg font-bold text-primary dark:text-white">Trilha de Aprendizagem</h3></div>
      <div class="space-y-3">
        ${topics.map((t, idx) => {
    const plan = AppState.get("userPlan");
    const isDone = t.status === "done";
    const isProgress = t.status === "progress";
    const isLocked = (plan === "gratis" && idx >= 1) || (plan === "basico" && idx >= 2);
    return `<div class="flex items-center p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm ${isProgress ? "border-l-4 border-l-emerald-500" : ""} ${isLocked ? "opacity-60" : "hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"}" ${isLocked ? 'onclick="App.showUpgradeModal()"' : ""}>
            <div class="w-10 h-10 rounded-xl ${isLocked ? "bg-slate-100" : "bg-emerald-500/10"} flex items-center justify-center mr-4"><span class="material-symbols-outlined ${isLocked ? "text-slate-400" : "text-emerald-500"}">${isLocked ? "lock" : subj.icon}</span></div>
            <div class="flex-1"><h4 class="font-black text-sm text-slate-800 dark:text-white">${t.name}</h4><p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">${t.lessons} Aulas • ${isDone ? "Finalizado" : isProgress ? "Em andamento" : isLocked ? "Pano Pro+" : "Pendente"}</p></div>
            <span class="material-symbols-outlined ${isDone ? "text-emerald-500 fill-icon" : isLocked ? "text-slate-400" : "text-slate-300"}">${isDone ? "check_circle" : isLocked ? "lock" : "play_circle"}</span>
          </div>`;
  }).join("")}
      </div>
    </section>
  </main>`;
};
