// ============================================================
// EduHub Brasil - Page Renderers (Part 2: Simulados, Pomodoro, Progresso)
// ============================================================

// ── Lazy Script Loader (for on-demand vendor libs) ──
function _loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}
// ── SIMULADOS PAGE ──
Pages.simulados = () => {
  const completedCount = APP_DATA.simulados.filter(s => s.completed).length;
  const avgScore = Math.round(APP_DATA.simulados.filter(s => s.completed).reduce((a, b) => a + (b.score || 0), 0) / (completedCount || 1));
  const readinessScore = Math.min(100, Math.round((completedCount * 10) + (avgScore / 2)));

  return `
  <!-- Ultra Elite Header (Compact) -->
  <header class="sticky top-0 z-30 bg-[#020617]/90 backdrop-blur-2xl border-b border-white/5 px-6 py-4 transition-all duration-500">
    <div class="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -z-10 rounded-full"></div>
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center justify-between gap-4">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            <span class="text-[9px] text-emerald-400 font-black uppercase tracking-[0.3em] leading-none opacity-80">Tactical Hub</span>
          </div>
          <h1 class="text-2xl font-black text-white tracking-tight uppercase leading-none">
            Elite <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Simulados</span>
          </h1>
        </div>
        <div class="size-10 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center border border-white/10 shadow-lg group">
          <span class="material-symbols-outlined text-emerald-400 text-xl group-hover:rotate-12 transition-transform">menu_book</span>
        </div>
      </div>
    </div>
  </header>
  
  <main class="flex-1 scroll-area p-4 pt-1 space-y-4 safe-bottom max-w-2xl mx-auto">
    <!-- Interactive Dashboard Grid V5 (Balanced) -->
    <div class="grid grid-cols-1 gap-4">
      <div class="flex gap-3">
        <!-- Concluídos Card -->
        <div class="flex-1 glass-card bg-[#0f172a]/40 p-5 rounded-[28px] border border-white/5 relative overflow-hidden">
          <div class="absolute top-0 right-0 p-3 opacity-30">
            <span class="material-symbols-outlined text-[12px] text-emerald-400">target</span>
          </div>
          <div class="text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em] mb-1">Concluídos</div>
          <div class="flex items-center gap-2.5">
             <span class="material-symbols-outlined text-emerald-500/40 text-lg">fact_check</span>
             <div class="text-3xl font-black text-white tabular-nums tracking-tighter" id="hero-completed-count">${completedCount}</div>
          </div>
          <div class="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
        </div>

        <!-- Precisão Card -->
        <div class="flex-1 glass-card bg-[#0f172a]/40 p-5 rounded-[28px] border border-white/5 relative overflow-hidden">
          <div class="absolute top-0 right-0 p-3 opacity-30">
            <span class="material-symbols-outlined text-[12px] text-cyan-400">query_stats</span>
          </div>
          <div class="text-[10px] text-cyan-400 font-black uppercase tracking-[0.2em] mb-1">Precisão</div>
          <div class="flex items-center gap-2.5">
             <span class="material-symbols-outlined text-cyan-500/40 text-lg">biotech</span>
             <div class="text-3xl font-black text-white tabular-nums tracking-tighter" id="hero-avg-precision">${avgScore}<span class="text-base text-cyan-400 ml-1">%</span></div>
          </div>
          <div class="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
        </div>
      </div>

      <!-- Tactical Card (Refined) -->
      <div class="glass-card bg-gradient-to-br from-amber-500/5 to-transparent p-6 rounded-[32px] border border-amber-500/10 shadow-2xl group active:scale-[0.99] transition-all relative overflow-hidden">
        <div class="absolute top-0 right-0 p-4 opacity-30 group-hover:opacity-50 transition-opacity">
          <span class="material-symbols-outlined text-xl text-amber-400">radar</span>
        </div>
        <div class="text-[10px] text-amber-500/60 font-black uppercase tracking-[0.3em] mb-3 group-hover:text-amber-400 transition-colors">Tactical Readiness Score</div>
        <div class="flex items-center justify-between gap-6">
          <div class="flex items-center gap-4">
             <div class="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
               <span class="material-symbols-outlined text-amber-400 text-3xl">bolt</span>
             </div>
             <div>
               <div class="text-4xl font-black text-white tabular-nums tracking-tighter leading-none" id="hero-readiness-score">${completedCount > 0 ? readinessScore : '--'}</div>
               <div class="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-60">CS Ready v2.1</div>
             </div>
          </div>
          <div class="flex-1 max-w-[140px]">
             <div class="flex justify-between text-[8px] font-black text-slate-500 uppercase mb-1.5 opacity-80">
                <span>Performance</span>
                <span class="text-amber-400">Optimal</span>
             </div>
             <div class="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden p-[1px]">
                <div class="h-full bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]" style="width: ${readinessScore}%"></div>
             </div>
          </div>
        </div>
        <div class="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent"></div>
      </div>
    </div>

    <!-- Category Filters (Restored without 'Todos') -->
    <div id="simulado-category-filters" class="flex gap-3 overflow-x-auto no-scrollbar py-2 mb-6">
      <button data-cat="ENEM" class="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border whitespace-nowrap active-category-filter shadow-lg border-emerald-500/50 bg-emerald-500/5 text-white">ENEM</button>
      <button data-cat="Vestibular" class="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/5 bg-slate-900/40 text-slate-500 whitespace-nowrap hover:text-white">Vestibulares</button>
      <button data-cat="Concurso" class="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/5 bg-slate-900/40 text-slate-500 whitespace-nowrap hover:text-white">Concursos</button>
    </div>

    <!-- Premium Feature: Quiz Builder Pro -->
    <div onclick="Router.navigate('/quiz-builder')" class="group relative bg-gradient-to-br from-indigo-500/10 to-transparent p-6 rounded-[32px] border border-indigo-500/20 shadow-2xl cursor-pointer active:scale-[0.98] transition-all overflow-hidden mb-6">
      <div class="absolute -right-12 -top-12 w-48 h-48 bg-indigo-500/10 blur-[60px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-700"></div>
      
      <div class="flex items-center justify-between gap-4 relative z-10">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:rotate-6 transition-transform">
            <span class="material-symbols-outlined text-white text-3xl font-black">tune</span>
          </div>
          <div>
            <div class="flex items-center gap-2 mb-1">
               <span class="text-[9px] text-indigo-400 font-black uppercase tracking-[0.2em] px-2 py-0.5 bg-indigo-500/5 rounded border border-indigo-500/10">Premium</span>
            </div>
            <h3 class="text-xl font-black text-white tracking-tight italic uppercase">Personalizar <span class="text-indigo-400">Treino Pro</span></h3>
            <p class="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-80">Escolha matérias e até 25 questões</p>
          </div>
        </div>
        <div class="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
           <span class="material-symbols-outlined text-xl">arrow_forward_ios</span>
        </div>
      </div>
      
      <!-- Progress/Decor lines -->
      <div class="absolute bottom-0 left-0 w-full h-[3px] bg-indigo-500/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div class="absolute top-0 right-0 p-4 opacity-10">
         <span class="material-symbols-outlined text-4xl">psychology</span>
      </div>
    </div>

    <!-- UI Action: Random Simulado (NEW) -->
    <div id="random-simulado-container" class="space-y-6">
      <div class="flex justify-between items-end px-2">
        <div class="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Protocolos Disponíveis</div>
        <div id="protocol-count-tag" class="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/5 font-bold uppercase tracking-tighter">1 Protocolo</div>
      </div>
      
      <!-- Protocols Grid -->
      <div id="simulados-grid" class="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
        <!-- Cards will be injected by PageEvents.simulados based on category -->
      </div>
    </div>
  </main>`;
};

function renderSimuladoItem(s) {
  const isDone = s.completed;
  // We want to calculate the percentage: (score / total) * 100
  const total = s.total || 10;
  const progress = isDone ? Math.round((s.score / total) * 100) : 0;
  
  // Identity colors based on type
  const typeConfigs = {
    'ENEM': { color: 'emerald', icon: 'auto_awesome_motion', aurora: 'from-emerald-500/20' },
    'Vestibular': { color: 'indigo', icon: 'account_balance', aurora: 'from-indigo-500/20' },
    'Concurso': { color: 'amber', icon: 'gavel', aurora: 'from-amber-500/20' }
  };
  const config = typeConfigs[s.type] || typeConfigs['ENEM'];
  
  return `
  <div class="glass-card bg-[#0f172a]/60 p-7 rounded-[40px] border border-white/5 space-y-6 transition-all duration-700 relative overflow-hidden group ${s.locked ? "opacity-30 grayscale-[0.9]" : "hover:bg-[#1e293b]/70 shadow-2xl active:scale-[0.99]"}" onclick="${s.locked ? "App.showUpgradeModal()" : ""}">
    
    <!-- Background Aurora -->
    <div class="absolute -top-12 -left-12 w-32 h-32 bg-gradient-to-br ${config.aurora} to-transparent blur-3xl opacity-40 group-hover:opacity-100 transition-opacity duration-700"></div>

    ${s.locked ? `
      <div class="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] z-10 flex items-center justify-center p-8">
         <div class="bg-slate-900/90 w-16 h-16 rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl">
            <span class="material-symbols-outlined text-amber-500 text-3xl font-black">lock_open</span>
         </div>
      </div>
    ` : ''}

    <div class="flex items-start gap-4 relative z-10">
      <div class="w-14 h-14 rounded-2xl bg-[#0f172a] flex items-center justify-center p-0.5 border border-white/5 shadow-xl group-hover:scale-105 transition-transform duration-500">
        <div class="w-full h-full bg-[#020617] rounded-xl flex items-center justify-center shadow-inner">
           <span class="material-symbols-outlined text-${config.color}-400/80 text-2xl">${config.icon}</span>
        </div>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-1.5 mb-1.5">
          <span class="px-2 py-0.5 bg-${config.color}-500/5 text-${config.color}-400/80 text-[8px] font-black uppercase tracking-widest rounded border border-${config.color}-500/10">${s.type}</span>
          ${isDone ? '<span class="px-2 py-0.5 bg-cyan-500/5 text-cyan-400/80 text-[8px] font-black uppercase tracking-widest rounded border border-cyan-500/10">Sincronizado</span>' : ''}
        </div>
        <h3 class="text-lg font-black text-white leading-none tracking-tight truncate group-hover:text-${config.color}-400 transition-colors">${s.title}</h3>
        <p class="text-[9px] text-slate-500 font-bold mt-1.5 uppercase tracking-widest opacity-60">${s.questions} Questões • ${s.duration}</p>
      </div>
    </div>

    <!-- Ultra Progress -->
    <div class="space-y-4 relative z-10">
      <div class="flex justify-between items-end px-0.5">
        <div class="flex flex-col">
          <span class="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1 opacity-70">Aproveitamento</span>
          <div class="text-xl font-black text-white tabular-nums leading-none tracking-tight">${progress}%</div>
        </div>
        <div class="text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-900/20 px-3 py-1 rounded-lg border border-emerald-500/20">
           ${isDone ? `Último: ${s.score}/${total} (${s.historyDate})` : 'Novo Simulado'}
        </div>
      </div>
      
      <!-- Neon Progress Bar with Wave effect -->
      <div class="h-4 w-full bg-[#020617] rounded-2xl border border-white/5 overflow-hidden p-[3px] shadow-inner relative">
        <div class="h-full rounded-xl bg-gradient-to-r from-${config.color}-600 via-${config.color}-400 to-cyan-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-1000 relative" style="width: ${progress}%">
           <!-- Light sweep effect -->
           <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full animate-[sweep_3s_infinite] -translate-x-full"></div>
        </div>
      </div>
    </div>

    <button onclick="event.stopPropagation(); Router.navigate('/simulado-runner?type=' + encodeURIComponent('${s.type}'))" class="w-full py-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 hover:border-${config.color}-500/50 text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.96] shadow-2xl group/btn overflow-hidden relative ${s.locked ? 'pointer-events-none' : ''}">
      <span class="absolute inset-0 bg-${config.color}-500/0 hover:bg-${config.color}-500/5 transition-colors"></span>
      <span class="material-symbols-outlined text-${config.color}-400 text-xl group-hover/btn:translate-x-1 transition-transform">bolt</span>
    </button>
  </div>`;
};

PageEvents.simulados = async (page) => {
  const grid = page.querySelector("#simulados-grid");
  const catBtns = page.querySelectorAll("#simulado-category-filters button");
  const countTag = page.querySelector("#protocol-count-tag");
  
  let activeCategory = "ENEM";

  const renderProtocols = (category) => {
    const protocols = {
      'ENEM': [
        { id: 'geral', title: 'Geral', desc: '10 Questões • 3 Temáticas (3-4-3)', subjects: [], icon: 'shuffle', color: 'emerald' },
        { id: 'ling-nat', title: 'Português e Biologia', desc: 'Foco em Linguagens e Natureza', subjects: ['portugues', 'biologia'], icon: 'menu_book', color: 'blue' },
        { id: 'humanas', title: 'História e Geografia', desc: 'Foco em Ciências Humanas', subjects: ['historia', 'geografia'], icon: 'public', color: 'orange' },
        { id: 'math', title: 'Matemática', desc: 'Foco em Raciocínio Lógico', subjects: ['matematica'], icon: 'functions', color: 'rose' },
        { id: 'exatas', title: 'Física e Química', desc: 'Foco em Ciências Exatas', subjects: ['fisica', 'quimica'], icon: 'science', color: 'cyan' }
      ],
      'Vestibular': [
        { id: 'geral', title: 'Geral', desc: '10 Questões • 3 Temáticas (3-4-3)', subjects: [], icon: 'shuffle', color: 'emerald' },
        { id: 'ling-lit', title: 'Linguagens e Literatura', desc: 'Foco em Português e Obras', subjects: ['portugues'], icon: 'menu_book', color: 'blue' },
        { id: 'math', title: 'Matemática', desc: 'Cálculo e Raciocínio', subjects: ['matematica'], icon: 'functions', color: 'rose' },
        { id: 'natureza', title: 'Natureza e Exatas', desc: 'Física e Química', subjects: ['fisica', 'quimica'], icon: 'science', color: 'cyan' }
      ],
      'Concurso': [
        { id: 'geral', title: 'Geral', desc: '10 Questões • 3 Temáticas (3-4-3)', subjects: [], icon: 'shuffle', color: 'emerald' },
        { id: 'port', title: 'Língua Portuguesa', desc: 'Gramática e Interpretação', subjects: ['portugues'], icon: 'translate', color: 'blue' },
        { id: 'rlm', title: 'Raciocínio Lógico', desc: 'Lógica e Matemática RLM', subjects: ['rlm'], icon: 'psychology', color: 'amber' },
        { id: 'direito', title: 'Direito e Ética', desc: 'Adm e Constitucional', subjects: ['direito'], icon: 'gavel', color: 'indigo' }
      ],
      'default': [
        { id: 'geral', title: 'Geral', desc: '10 Questões • 3 Temáticas (3-4-3)', subjects: [], icon: 'shuffle', color: 'emerald' }
      ]
    };

    const list = protocols[category] || protocols['default'];
    if (countTag) countTag.textContent = `${list.length} Protocolo${list.length > 1 ? 's' : ''}`;
    
    if (!grid) return;
    grid.innerHTML = Security.sanitize(list.map(p => {
      const colorMap = {
        'emerald': { bg: '#10b981', border: 'rgba(16, 185, 129, 0.2)', glow: 'rgba(16, 185, 129, 0.1)' },
        'blue': { bg: '#3b82f6', border: 'rgba(59, 130, 246, 0.2)', glow: 'rgba(59, 130, 246, 0.1)' },
        'orange': { bg: '#f59e0b', border: 'rgba(245, 158, 11, 0.2)', glow: 'rgba(245, 158, 11, 0.1)' },
        'rose': { bg: '#f43f5e', border: 'rgba(244, 63, 94, 0.2)', glow: 'rgba(244, 63, 94, 0.1)' },
        'cyan': { bg: '#06b6d4', border: 'rgba(6, 182, 212, 0.2)', glow: 'rgba(6, 182, 212, 0.1)' },
        'amber': { bg: '#f59e0b', border: 'rgba(245, 158, 11, 0.2)', glow: 'rgba(245, 158, 11, 0.1)' },
        'indigo': { bg: '#6366f1', border: 'rgba(99, 102, 241, 0.2)', glow: 'rgba(99, 102, 241, 0.1)' }
      };
      const c = colorMap[p.color] || colorMap['emerald'];

      return `
      <div data-id="${p.id}" class="protocol-card group relative bg-slate-900/80 rounded-[28px] border p-5 cursor-pointer active:scale-95 transition-all duration-300 overflow-hidden" 
           style="border-color: ${c.border}">
        
        <!-- Background Glow -->
        <div class="absolute -right-8 -top-8 w-24 h-24 blur-3xl rounded-full opacity-30 transition-opacity group-hover:opacity-60"
             style="background-color: ${c.bg}"></div>
             
        <div class="relative flex items-center gap-4 z-10">
          <!-- Icon Circle -->
          <div class="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:rotate-[15deg] group-hover:scale-110"
               style="background-color: ${c.bg}">
            <span class="material-symbols-outlined text-slate-900 text-2xl font-black">${p.icon}</span>
          </div>
          
          <div class="flex-1 min-w-0">
            <h2 class="text-white text-lg font-black leading-tight tracking-tight">${p.title}</h2>
            <p class="text-slate-500 text-[10px] font-bold uppercase tracking-wider mt-1 opacity-70">${p.desc}</p>
          </div>
        </div>

        <div class="mt-5 pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
          <div class="flex items-center gap-2">
             <div class="w-1.5 h-1.5 rounded-full animate-pulse" style="background-color: ${c.bg}"></div>
             <span class="text-slate-400 text-[9px] font-black uppercase tracking-widest">Protocolo Ativo</span>
          </div>
          <span class="font-black text-[10px] uppercase tracking-widest transition-transform group-hover:translate-x-1" 
                style="color: ${c.bg}">Iniciar →</span>
        </div>
      </div>`;
    }).join(''));

    grid.querySelectorAll(".protocol-card").forEach((card, idx) => {
      card.onclick = () => {
        SoundManager.play("tap");
        const p = list[idx];
        const subjectsParam = p.subjects.length > 0 ? `&subjects=${encodeURIComponent(JSON.stringify(p.subjects))}` : "";
        Router.navigate(`/simulado-runner?type=Random&category=${encodeURIComponent(category)}${subjectsParam}`);
      };
    });
  };

  catBtns.forEach(btn => {
    btn.onclick = () => {
      SoundManager.play("tap");
      activeCategory = btn.dataset.cat;
      catBtns.forEach(b => {
        b.classList.remove("active-category-filter", "text-white", "border-emerald-500/50", "bg-emerald-500/5", "shadow-lg");
        b.classList.add("border-white/5", "bg-slate-900/40", "text-slate-500");
      });
      btn.classList.remove("border-white/5", "bg-slate-900/40", "text-slate-500");
      btn.classList.add("active-category-filter", "text-white", "border-emerald-500/50", "bg-emerald-500/5", "shadow-lg");
      renderProtocols(activeCategory);
    };
  });

  renderProtocols(activeCategory);

  let userHistory = [];
  const client = Supabase.getClient();
  if (client) {
    try {
      const { data: authData } = await client.auth.getUser();
      const user = authData ? authData.user : null;
      if (user) {
        userHistory = await Supabase.getSimuladoHistory(user.id);
        const hCount = userHistory.length;
        if (hCount > 0) {
          const totalScorePct = userHistory.reduce((acc, h) => acc + (h.score / (h.total_questions || 10)), 0);
          const hAvg = Math.round((totalScorePct / hCount) * 100);
          const hReadiness = Math.min(100, Math.round((hCount * 10) + (hAvg / 2)));
          const elCount = page.querySelector("#hero-completed-count");
          const elAvg = page.querySelector("#hero-avg-precision");
          const elScore = page.querySelector("#hero-readiness-score");
          const elBar = page.querySelector("#hero-readiness-bar");

          if (elCount) elCount.textContent = hCount;
          if (elAvg) elAvg.innerHTML = `${hAvg}<span class="text-base text-cyan-400 ml-1">%</span>`;
          if (elScore) elScore.textContent = hReadiness;
          if (elBar) elBar.style.width = `${hReadiness}%`;
        }

        // Render Compact History
        if (historyContainer && hCount > 0) {
          historyContainer.innerHTML = Security.sanitize(userHistory.slice(0, 3).map(h => `
            <div class="glass-card bg-white/5 p-4 rounded-3xl border border-white/5 flex items-center justify-between group">
              <div class="flex items-center gap-3">
                <div class="size-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <span class="material-symbols-outlined text-emerald-400 text-sm">history</span>
                </div>
                <div>
                  <div class="text-[10px] text-white font-black uppercase tracking-wider">${h.simulado_type}</div>
                  <div class="text-[8px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-0.5">${new Date(h.completed_at).toLocaleDateString('pt-BR')}</div>
                </div>
              </div>
              <div class="text-sm font-black text-emerald-400">${h.score}/${h.total_questions || 10}</div>
            </div>
          `).join(""));
        }
      }
    } catch (e) {
      console.warn("Simulados history fetch failed.", e);
    }
  }
};

// ── NOTA ENEM PAGE ──
Pages["nota-enem"] = () => {
  return `
  <div class="min-h-screen bg-[#020617] flex flex-col font-lexend overflow-hidden relative">
    <!-- Background Orbs -->
    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>

    <header class="sticky top-0 z-30 bg-[#020617]/80 backdrop-blur-2xl border-b border-white/5 px-6 py-4 safe-top">
      <div class="max-w-2xl mx-auto flex items-center justify-between">
        <button onclick="Router.back('/simulados')" class="group flex items-center gap-2 text-slate-400 hover:text-white transition-all active:scale-90">
          <div class="size-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
            <span class="material-symbols-outlined text-lg">arrow_back_ios_new</span>
          </div>
          <span class="text-[10px] font-black uppercase tracking-[0.2em]">Abortar</span>
        </button>
        <div class="flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
          <span class="text-[9px] text-indigo-400 font-black uppercase tracking-[0.3em]">AI Module 01</span>
        </div>
      </div>
    </header>

    <main class="flex-1 scroll-area p-6 flex flex-col items-center safe-bottom max-w-2xl mx-auto w-full">
      <!-- Hero Visual -->
      <div class="relative w-full aspect-square max-w-[200px] mb-2 flex items-center justify-center">
        <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div class="size-28 bg-[#0f172a] rounded-[48px] border border-white/10 shadow-3xl flex items-center justify-center relative z-10 rotate-12 group hover:rotate-0 transition-transform duration-700">
           <span class="material-symbols-outlined text-indigo-400 text-6xl drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">neurology</span>
        </div>
        <!-- Decorative HUD Elements -->
        <div class="absolute top-0 left-0 text-indigo-500/20 animate-spin-slow">
          <span class="material-symbols-outlined text-4xl">settings_motion_mode</span>
        </div>
      </div>

      <div class="text-center mb-6">
        <h1 class="text-3xl font-black text-white leading-tight tracking-tighter uppercase italic mb-3">
          Predictor <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-400 not-italic">ENEM v2</span>
        </h1>
        <p class="text-[11px] text-slate-500 font-bold uppercase tracking-[0.25em] max-w-[260px] mx-auto opacity-80">
          Motor de inferência baseado em TRI para estimativa tática de pontuação.
        </p>
      </div>

      <!-- Tactical Specs Grid -->
      <div class="grid grid-cols-2 gap-4 w-full mb-6">
        <div class="glass-card bg-[#0f172a]/40 p-5 rounded-[32px] border border-white/5 relative overflow-hidden group">
           <div class="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1.5 opacity-60">Questões</div>
           <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-indigo-400 text-lg">bolt</span>
              <span class="text-xl font-black text-white leading-none">10 <span class="text-[10px] text-slate-400 ml-1">UNITS</span></span>
           </div>
           <div class="absolute bottom-0 left-0 w-full h-[2px] bg-indigo-500/20"></div>
        </div>
        <div class="glass-card bg-[#0f172a]/40 p-5 rounded-[32px] border border-white/5 relative overflow-hidden group">
           <div class="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1.5 opacity-60">Tempo Est.</div>
           <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-indigo-400 text-lg">timer</span>
              <span class="text-xl font-black text-white leading-none">03 <span class="text-[10px] text-slate-400 ml-1">MIN</span></span>
           </div>
           <div class="absolute bottom-0 left-0 w-full h-[2px] bg-indigo-500/20"></div>
        </div>
      </div>

      <!-- Deep Insight Feature List -->
      <div class="w-full space-y-3 mb-6">
        <div class="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-colors group">
          <div class="size-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
            <span class="material-symbols-outlined text-indigo-400 text-xl">psychology</span>
          </div>
          <div class="flex-1">
            <h4 class="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1">Mapeamento Cognitivo</h4>
            <p class="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-none">Identificamos lacunas em tempo real</p>
          </div>
        </div>
        
        <div class="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-colors group">
          <div class="size-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
            <span class="material-symbols-outlined text-indigo-400 text-xl">hub</span>
          </div>
          <div class="flex-1">
            <h4 class="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1">Algoritmo TRI v4</h4>
            <p class="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-none">Cálculo de proficiência sincronizado</p>
          </div>
        </div>
      </div>

      <button onclick="App.startPredictor()" class="w-full py-6 bg-gradient-to-r from-indigo-600 to-indigo-600 rounded-[28px] text-white font-black text-xs uppercase tracking-[0.4em] shadow-[0_0_30px_rgba(124,58,237,0.3)] active:scale-[0.96] transition-all flex items-center justify-center gap-3 relative overflow-hidden group">
        <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <span class="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">auto_awesome</span>
        <span class="relative z-10">Iniciar Predição</span>
      </button>

      <p class="mt-8 text-[9px] text-slate-600 font-bold uppercase tracking-[0.3em] flex items-center gap-2">
        <span class="material-symbols-outlined text-xs">verified_user</span>
        Acesso Tactical Gratuito
      </p>
    </main>
  </div>`;
};

// ── POMODORO PAGE ──
Pages.pomodoro = () => {
  const plan = AppState.get("userPlan");
  const isFree = plan === "gratis";
  
  // Use new defaults if not set, and apply limits for Free plan
  let studyMin = AppState.get("pomodoroStudyMin") || 25;
  let breakMin = AppState.get("pomodoroBreakMin") || 5;
  let longBreak = AppState.get("pomodoroLongBreak") || 15;

  if (isFree) {
    if (studyMin > 35) { studyMin = 35; AppState.set("pomodoroStudyMin", 35); }
    if (breakMin > 5) { breakMin = 5; AppState.set("pomodoroBreakMin", 5); }
    if (longBreak > 15) { longBreak = 15; AppState.set("pomodoroLongBreak", 15); }
  } else {
    if (studyMin < 25) { studyMin = 25; AppState.set("pomodoroStudyMin", 25); }
  }

  const subjects = APP_DATA.subjects;
  const currentSubj = subjects[0]; // default
  
  const maxFocus = isFree ? 35 : 60;
  const maxShort = isFree ? 5 : 10;
  const maxLong = isFree ? 15 : 25;

  return `
  <div id="page-pomodoro" class="min-h-screen bg-background-dark flex flex-col font-lexend">
  <!-- Header -->
  <header class="px-5 pt-8 pb-4">
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">
          Sessão de <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-400 not-italic">Foco</span>
        </h1>
        <div class="flex items-center gap-3">
          <button id="pomo-sound-btn" class="w-10 h-10 rounded-2xl bg-[#0f172a]/20 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all hover:bg-[#0f172a]/40 shadow-lg"><span class="material-symbols-outlined text-xl">volume_up</span></button>
          <button id="pomo-settings-btn" class="w-10 h-10 rounded-2xl bg-[#0f172a]/20 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all hover:bg-[#0f172a]/40 shadow-lg"><span class="material-symbols-outlined text-xl">settings</span></button>
        </div>
      </div>

      <!-- Time Cards (Clickable) -->
      <div class="grid grid-cols-3 gap-3 mb-6">
        <div id="pomo-card-focus" class="glass-card bg-[#0f172a]/20 rounded-2xl p-4 text-center border border-white/5 cursor-pointer hover:bg-[#0f172a]/40 transition-all relative overflow-hidden group">
          <div class="text-xl font-black text-indigo-400 mb-0.5">${studyMin}min</div>
          <p class="text-[9px] uppercase font-black tracking-widest text-slate-500 group-hover:text-indigo-400 transition-colors">Foco</p>
          <div class="absolute bottom-0 left-0 w-full h-[2px] bg-indigo-500/20"></div>
        </div>
        <div id="pomo-card-short" class="glass-card bg-[#0f172a]/20 rounded-2xl p-4 text-center border border-white/5 cursor-pointer hover:bg-[#0f172a]/40 transition-all relative overflow-hidden group">
          <div class="text-xl font-black text-emerald-400 mb-0.5">${breakMin}min</div>
          <p class="text-[9px] uppercase font-black tracking-widest text-slate-500 group-hover:text-emerald-400 transition-colors">Pausa curta</p>
          <div class="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-500/20"></div>
        </div>
        <div id="pomo-card-long" class="glass-card bg-[#0f172a]/20 rounded-2xl p-4 text-center border border-white/5 cursor-pointer hover:bg-[#0f172a]/40 transition-all relative overflow-hidden group">
          <div class="text-xl font-black text-amber-400 mb-0.5">${longBreak}min</div>
          <p class="text-[9px] uppercase font-black tracking-widest text-slate-500 group-hover:text-amber-400 transition-colors">Pausa longa</p>
          <div class="absolute bottom-0 left-0 w-full h-[2px] bg-amber-500/20"></div>
        </div>
      </div>

      <!-- Mode Tabs (Modern Pill) -->
      <div class="bg-[#0f172a]/20 p-1 rounded-[20px] flex gap-1 border border-white/5 shadow-inner">
        <button id="pomo-tab-focus" class="pomo-tab flex-1 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg">Foco</button>
        <button id="pomo-tab-short" class="pomo-tab flex-1 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-500 border border-transparent hover:text-slate-300 transition-all">Pausa curta</button>
        <button id="pomo-tab-long" class="pomo-tab flex-1 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-500 border border-transparent hover:text-slate-300 transition-all">Pausa longa</button>
      </div>
    </div>
  </header>

  <!-- Main Timer Area -->
  <main class="flex-1 flex flex-col items-center justify-center px-4">
    <!-- Custom Subject Selector (Capsule -> Bottom Sheet) -->
    <div class="relative z-40" style="margin-bottom: 50px; transform: translateY(-20px);">
      <div id="pomo-subject-trigger" class="pomo-capsule hover:border-white/20 mx-auto">
        <span id="pomo-subj-icon" class="material-symbols-outlined text-lg">book</span>
        <span id="pomo-subj-label">${currentSubj.label}</span>
        <span class="material-symbols-outlined text-slate-500 text-base">expand_more</span>
      </div>
    </div>

    <!-- Timer Circle (Enhanced Spacing) -->
    <div class="timer-circle mb-10 scale-[1.20]" id="pomo-circle">
      <svg viewBox="0 0 100 100" class="drop-shadow-2xl">
        <circle class="timer-track" cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.05)" />
        <circle id="pomo-ring" class="timer-progress timer-glow-indigo" cx="50" cy="50" r="45" stroke-dasharray="283" stroke-dashoffset="283" stroke="#7c3aed" />
        <circle id="pomo-dot" class="timer-dot" cx="50" cy="50" r="2.5" fill="white" style="display: none;" />
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center p-8">
        <span id="pomo-time" class="text-5xl font-black text-white tracking-tighter">${String(studyMin).padStart(2,"0")}:00</span>
        <div class="mt-4 flex flex-col items-center">
          <span id="pomo-label" class="text-[10px] uppercase font-black tracking-[0.2em] text-indigo-400 opacity-80">Pomodoro #1</span>
        </div>
      </div>
    </div>

    <!-- Controls (Refined) -->
    <div class="flex items-center gap-8 mb-10">
      <button id="pomo-reset" class="w-14 h-14 rounded-full bg-[#0f172a]/20 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all hover:bg-[#0f172a]/40 shadow-lg">
        <span class="material-symbols-outlined text-2xl">restart_alt</span>
      </button>
      <button id="pomo-start" class="w-[78px] h-[78px] rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.3)] hover:scale-105 touch-card active:scale-95 transition-all border border-white/10">
        <span class="material-symbols-outlined text-4xl">play_arrow</span>
      </button>
      <button id="pomo-skip" class="w-14 h-14 rounded-full bg-[#0f172a]/20 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all hover:bg-[#0f172a]/40 shadow-lg">
        <span class="material-symbols-outlined text-2xl">coffee</span>
      </button>
    </div>

    <!-- Session Dots -->
    <div id="pomo-dots" class="flex gap-3">
      <div class="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(124,58,237,0.4)]"></div>
      <div class="w-2.5 h-2.5 rounded-full bg-slate-800 border border-white/5"></div>
      <div class="w-2.5 h-2.5 rounded-full bg-slate-800 border border-white/5"></div>
      <div class="w-2.5 h-2.5 rounded-full bg-slate-800 border border-white/5"></div>
    </div>
  </main>

  <!-- Subject Bottom Sheet -->
  <div id="pomo-subj-sheet" class="bottom-sheet-overlay" onclick="if(event.target===this){this.classList.remove('active')}">
    <div class="bottom-sheet-content">
      <div class="bottom-sheet-handle"></div>
      <div class="px-6 pt-2 pb-4">
        <h3 class="text-lg font-bold text-white mb-1">Escolha a Matéria</h3>
        <p class="text-sm text-slate-400 mb-4">Selecione a disciplina para esta sessão de foco.</p>
        <div class="space-y-1">
          ${subjects.map(s => `
            <button class="subj-opt w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition-colors text-sm font-bold" data-id="${s.id}" data-icon="${s.icon}" data-label="${s.label}">
              <div class="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center"><span class="material-symbols-outlined text-lg">${s.icon}</span></div>
              <span class="flex-1 text-left">${s.label}</span>
              <span class="material-symbols-outlined text-slate-600 text-sm">chevron_right</span>
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  </div>
  </div>
  </div>

  <!-- Settings Bottom Sheet -->
  <div id="pomo-settings-modal" class="bottom-sheet-overlay" onclick="if(event.target===this){this.classList.remove('active')}">
    <div class="bottom-sheet-content flex flex-col" style="height:65vh; max-height:65vh">
      <div class="bottom-sheet-handle"></div>
      
      <div class="flex-1 overflow-y-auto px-6 pt-4 pb-24">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-[#0f172a]/20 border border-white/5 flex items-center justify-center text-indigo-400">
              <span class="material-symbols-outlined">settings</span>
            </div>
            <h3 class="text-xl font-black text-white">Personalizar Timer</h3>
          </div>
          <button id="pomo-settings-close" class="w-10 h-10 rounded-full bg-[#0f172a]/20 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#0f172a]/40 transition-all shadow-lg"><span class="material-symbols-outlined">close</span></button>
        </div>
        
        <div class="space-y-6">
          <div>
            <div class="flex items-center justify-between mb-3 text-sm font-bold">
              <span class="text-slate-400 flex items-center gap-2"><span class="material-symbols-outlined text-indigo-500 text-lg">alarm</span>Tempo de foco</span>
              <span id="slider-focus-val" class="text-indigo-400 font-black">${studyMin} min</span>
            </div>
            <input id="slider-focus" type="range" min="25" max="${maxFocus}" step="1" value="${studyMin}" class="w-full">
            <p class="text-[10px] text-slate-600 font-bold uppercase tracking-wider mt-2">${isFree ? 'Máximo Plano Grátis: 35 min' : 'Mínimo sugerido: 25 min'}</p>
          </div>
          <div>
            <div class="flex items-center justify-between mb-3 text-sm font-bold">
              <span class="text-slate-400 flex items-center gap-2"><span class="material-symbols-outlined text-emerald-500 text-lg">coffee</span>Pausa curta</span>
              <span id="slider-short-val" class="text-emerald-400 font-black">${breakMin} min</span>
            </div>
            <input id="slider-short" type="range" min="1" max="${maxShort}" step="1" value="${breakMin}" class="w-full">
            <p class="text-[10px] text-slate-600 font-bold uppercase tracking-wider mt-2">${isFree ? 'Máximo Plano Grátis: 5 min' : 'Máximo permitido: 10 min'}</p>
          </div>
          <div>
            <div class="flex items-center justify-between mb-3 text-sm font-bold">
              <span class="text-slate-400 flex items-center gap-2"><span class="material-symbols-outlined text-amber-500 text-lg">hotel</span>Pausa longa</span>
              <span id="slider-long-val" class="text-amber-400 font-black">${longBreak} min</span>
            </div>
            <input id="slider-long" type="range" min="5" max="${maxLong}" step="1" value="${longBreak}" class="w-full">
            <p class="text-[10px] text-slate-600 font-bold uppercase tracking-wider mt-2">${isFree ? 'Máximo Plano Grátis: 15 min' : 'Máximo permitido: 25 min'}</p>
          </div>
          
          ${isFree ? `
            <div class="bg-cyan-500/10 p-4 rounded-xl border border-cyan-500/20 text-center">
              <p class="text-[9px] font-black text-white uppercase tracking-widest mb-1">Dica Pro</p>
              <p class="text-[10px] font-bold text-cyan-400">Personalização sem limites liberada a partir do Plano Básico!</p>
            </div>
          ` : ''}
        </div>
        
        <button id="pomo-apply-settings" class="w-full mt-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest shadow-[0_0_20px_rgba(124,58,237,0.2)] active:scale-95 transition-transform">APLICAR CONFIGURAÇÕES</button>
        
        <!-- Subtle bottom spacer -->
        <div class="h-6"></div>
      </div>
    </div>
  </div>`;
};

PageEvents.pomodoro = (page) => {
  let studyMin = AppState.get("pomodoroStudyMin") || 25;
  let breakMin = AppState.get("pomodoroBreakMin") || 5;
  let longBreak = AppState.get("pomodoroLongBreak") || 15;
  let mode = "focus"; // focus, short, long
  let running = false, timeLeft = studyMin * 60, interval = null, sessionCount = 1;
  const ring = page.querySelector("#pomo-ring");
  const dot = page.querySelector("#pomo-dot");
  const timeEl = page.querySelector("#pomo-time");
  const labelEl = page.querySelector("#pomo-label");
  const startBtn = page.querySelector("#pomo-start");
  const circumference = 2 * Math.PI * 45;

  function getColor() { return mode === "focus" ? "#7c3aed" : mode === "short" ? "#10b981" : "#f59e0b"; }
  function getGlowClass() { return mode === "focus" ? "timer-glow-indigo" : mode === "short" ? "timer-glow-emerald" : "timer-glow-amber"; }
  function getBtnGlowClass() { return mode === "focus" ? "btn-glow-indigo" : mode === "short" ? "btn-glow-emerald" : "btn-glow-amber"; }
  function getBtnBgClass() { return mode === "focus" ? "from-indigo-500 to-indigo-600 border-indigo-500/30 shadow-[0_0_30px_rgba(124,58,237,0.3)]" : mode === "short" ? "from-emerald-400 to-teal-500 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.3)]" : "from-amber-400 to-orange-500 border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.3)]"; }
  function getMinutes() { return mode === "focus" ? studyMin : mode === "short" ? breakMin : longBreak; }
  function getModeLabel() { return mode === "focus" ? `Pomodoro #${sessionCount}` : mode === "short" ? "Descanse!" : "Pausa longa"; }

  function updateDisplay() {
    const m = Math.floor(timeLeft / 60), s = timeLeft % 60;
    timeEl.textContent = `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
    const total = getMinutes() * 60;
    
    // Inverted logic: starts empty (283 offset) and fills up (0 offset)
    const completionRatio = 1 - (timeLeft / total);
    const offset = circumference * (1 - completionRatio);
    
    ring.style.strokeDashoffset = offset;
    ring.style.stroke = getColor();
    ring.className.baseVal = `timer-progress ${getGlowClass()}`;
    
    // Update indicator dot position
    if (completionRatio > 0.01) {
      dot.style.display = "block";
      const angle = (completionRatio * 360) - 90; // -90 to start at top
      const rad = angle * Math.PI / 180;
      const x = 50 + 45 * Math.cos(rad);
      const y = 50 + 45 * Math.sin(rad);
      dot.setAttribute("cx", x);
      dot.setAttribute("cy", y);
      dot.setAttribute("fill", "white");
    } else {
      dot.style.display = "none";
    }

    labelEl.textContent = getModeLabel();
    labelEl.className = `text-[10px] uppercase font-black tracking-[0.2em] opacity-80 ${mode === "focus" ? "text-indigo-400" : mode === "short" ? "text-emerald-400" : "text-amber-400"}`;
    startBtn.className = `w-[78px] h-[78px] rounded-full text-white flex items-center justify-center transition-all hover:scale-105 touch-card active:scale-95 bg-gradient-to-br border border-white/10 ${getBtnBgClass()}`;
  }

  function setMode(newMode) {
    mode = newMode;
    clearInterval(interval); running = false;
    timeLeft = getMinutes() * 60;
    startBtn.querySelector("span").textContent = "play_arrow";
    page.querySelectorAll(".pomo-tab").forEach(t => t.className = "pomo-tab flex-1 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-500 border border-transparent hover:text-slate-300 transition-all");
    const activeTabId = mode === "focus" ? "#pomo-tab-focus" : mode === "short" ? "#pomo-tab-short" : "#pomo-tab-long";
    const tabEl = page.querySelector(activeTabId);
    tabEl.className = `pomo-tab flex-1 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === "focus" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg" : mode === "short" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg" : "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-lg"}`;
    updateDisplay();
    updateDots();
  }

  function toggle() {
    SoundManager.play("tap");
    if (running) { clearInterval(interval); running = false; startBtn.querySelector("span").textContent = "play_arrow"; }
    else {
      running = true; startBtn.querySelector("span").textContent = "pause";
      let ticker = 0;
      interval = setInterval(() => {
        timeLeft--;
        ticker++;

        // Rastreio acumulativo a cada 1 minuto (60 segundos)
        if (ticker >= 60) {
          ticker = 0;
          if (mode === "focus") {
            const currentTotal = AppState.get("studyTimeMinutes") || 0;
            AppState.set("studyTimeMinutes", currentTotal + 1);
            
            // Também atualizar o dado semanal (hoje)
            const weekly = AppState.get("weeklyStudyData") || [0,0,0,0,0,0,0];
            const today = new Date().getDay(); // 0-6
            weekly[today] += 1;
            AppState.set("weeklyStudyData", weekly);
          } else {
            const currentRest = AppState.get("restTimeMinutes") || 0;
            AppState.set("restTimeMinutes", currentRest + 1);
          }
          AppState.saveToCloud(); // Sincronizar com Supabase se necessário
        }

        if (timeLeft <= 0) {
          // Finalizou a sessão, garantir que o ticker restante seja contabilizado se > 30s? 
          // Por simplicidade, mantemos o ticker por minuto.
          clearInterval(interval); running = false;
          startBtn.querySelector("span").textContent = "play_arrow";
          SoundManager.play("timer_end");
          SoundManager.play("success");
          if (mode === "focus") { sessionCount++; if (sessionCount > 4) sessionCount = 1; setMode("short"); }
          else { setMode("focus"); }
        }
        updateDisplay();
      }, 1000);
    }
  }

  function updateDots() {
    const dots = page.querySelector("#pomo-dots");
    dots.innerHTML = Security.sanitize([1,2,3,4].map(i => {
      const active = i <= sessionCount;
      const current = i === sessionCount;
      const dotColorClass = mode === "focus" ? "bg-indigo-500 shadow-[0_0_8px_rgba(124,58,237,0.5)]" : mode === "short" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]";
      return `<div class="${current ? "w-3.5 h-3.5" : "w-2.5 h-2.5"} rounded-full transition-all duration-300 ${active ? dotColorClass : "bg-slate-800 border border-white/5"}"></div>`;
    }).join(""));
  }

  startBtn.addEventListener("click", toggle);
  page.querySelector("#pomo-reset").addEventListener("click", () => { SoundManager.play("tap"); clearInterval(interval); running = false; timeLeft = getMinutes() * 60; startBtn.querySelector("span").textContent = "play_arrow"; updateDisplay(); });
  page.querySelector("#pomo-skip").addEventListener("click", () => { SoundManager.play("tap"); clearInterval(interval); running = false; if (mode === "focus") { sessionCount++; if(sessionCount>4) sessionCount=1; setMode("short"); } else { setMode("focus"); } });

  // Tab clicks
  page.querySelector("#pomo-tab-focus").addEventListener("click", () => setMode("focus"));
  page.querySelector("#pomo-tab-short").addEventListener("click", () => setMode("short"));
  page.querySelector("#pomo-tab-long").addEventListener("click", () => setMode("long"));

  // Card clicks (extra hit area)
  page.querySelector("#pomo-card-focus")?.addEventListener("click", () => setMode("focus"));
  page.querySelector("#pomo-card-short")?.addEventListener("click", () => setMode("short"));
  page.querySelector("#pomo-card-long")?.addEventListener("click", () => setMode("long"));

  // Subject bottom sheet
  const subjSheet = page.querySelector("#pomo-subj-sheet");
  const subjTrigger = page.querySelector("#pomo-subject-trigger");
  subjTrigger.addEventListener("click", () => { subjSheet.classList.add("active"); });
  
  page.querySelectorAll(".subj-opt").forEach(opt => {
    opt.addEventListener("click", () => {
      page.querySelector("#pomo-subj-label").textContent = opt.dataset.label;
      page.querySelector("#pomo-subj-icon").textContent = opt.dataset.icon;
      subjSheet.classList.remove("active");
    });
  });

  // Settings bottom sheet
  const modal = page.querySelector("#pomo-settings-modal");
  page.querySelector("#pomo-sound-btn").addEventListener("click", () => { SoundManager.toggleMute(); });
  page.querySelector("#pomo-settings-btn").addEventListener("click", () => { SoundManager.play("tap"); modal.classList.add("active"); });
  page.querySelector("#pomo-settings-close").addEventListener("click", () => { SoundManager.play("tap"); modal.classList.remove("active"); });

  const sFocus = page.querySelector("#slider-focus"), sShort = page.querySelector("#slider-short"), sLong = page.querySelector("#slider-long");
  sFocus.addEventListener("input", () => { page.querySelector("#slider-focus-val").textContent = sFocus.value + " min"; });
  sShort.addEventListener("input", () => { page.querySelector("#slider-short-val").textContent = sShort.value + " min"; });
  sLong.addEventListener("input", () => { page.querySelector("#slider-long-val").textContent = sLong.value + " min"; });

  page.querySelector("#pomo-apply-settings").addEventListener("click", () => {
    SoundManager.play("tap");
    studyMin = parseInt(sFocus.value); breakMin = parseInt(sShort.value); longBreak = parseInt(sLong.value);
    AppState.set("pomodoroStudyMin", studyMin); AppState.set("pomodoroBreakMin", breakMin); AppState.set("pomodoroLongBreak", longBreak);
    clearInterval(interval); running = false; timeLeft = getMinutes() * 60;
    startBtn.querySelector("span").textContent = "play_arrow";
    modal.classList.remove("active");
    // Update the time cards to reflect new values
    const focusCard = page.querySelector("#pomo-card-focus .text-xl");
    const shortCard = page.querySelector("#pomo-card-short .text-xl");
    const longCard = page.querySelector("#pomo-card-long .text-xl");
    if (focusCard) focusCard.textContent = studyMin + "min";
    if (shortCard) shortCard.textContent = breakMin + "min";
    if (longCard) longCard.textContent = longBreak + "min";
    setMode(mode);
  });

  updateDisplay();
  updateDots();
};

/**
 * Renders an advanced animated Radar Chart using SVG.
 * Used exclusively for Plus+ users in the dashboard.
 */
function renderRadarChart(userData, goalData = null) {
  const subjects = [
    { id: 'matematica', label: 'MAT' },
    { id: 'fisica', label: 'FIS' },
    { id: 'quimica', label: 'QUI' },
    { id: 'biologia', label: 'BIO' },
    { id: 'portugues', label: 'POR' },
    { id: 'historia', label: 'HIS' },
    { id: 'geografia', label: 'GEO' }
  ];

  const size = 300;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = 100;
  const angleStep = (Math.PI * 2) / subjects.length;

  const getPoint = (index, value, radiusScale = radius) => {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / 100) * radiusScale;
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle)
    };
  };

  // 1. Grid (Spider web)
  const gridLevels = [25, 50, 75, 100];
  const gridCircles = gridLevels.map(level => {
    const points = subjects.map((_, i) => getPoint(i, level)).map(p => `${p.x},${p.y}`).join(' ');
    return `<polygon points="${points}" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1" />`;
  }).join('');

  const gridAxes = subjects.map((_, i) => {
    const p = getPoint(i, 100);
    return `<line x1="${centerX}" y1="${centerY}" x2="${p.x}" y2="${p.y}" stroke="rgba(255,255,255,0.05)" stroke-width="1" />`;
  }).join('');

  // 2. Goal Area (Subtle Indigo)
  let goalPolygon = '';
  if (goalData) {
    const points = subjects.map((s, i) => getPoint(i, goalData[s.id] || 0)).map(p => `${p.x},${p.y}`).join(' ');
    goalPolygon = `<polygon points="${points}" fill="url(#goalGrad)" stroke="rgba(99,102,241,0.4)" stroke-width="2" stroke-dasharray="4 2" />`;
  }

  // 3. User Area (Main indigo/Blue)
  const userPointsRaw = subjects.map((s, i) => getPoint(i, userData[s.id] || 0));
  const userPointsStr = userPointsRaw.map(p => `${p.x},${p.y}`).join(' ');
  const userPolygon = `
    <polygon points="${userPointsStr}" fill="url(#userGrad)" stroke="url(#userStroke)" stroke-width="3" class="radar-poly animate-radar-pulse">
       <animate attributeName="opacity" values="0.7;1;0.7" dur="4s" repeatCount="indefinite" />
    </polygon>
  `;

  // 4. Data Points (Glow)
  const userDots = userPointsRaw.map(p => `
    <circle cx="${p.x}" cy="${p.y}" r="4" fill="#a855f7" class="drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
  `).join('');

  // 5. Labels
  const labels = subjects.map((s, i) => {
    const p = getPoint(i, 125); // Push labels slightly further
    return `<text x="${p.x}" y="${p.y}" fill="rgba(255,255,255,0.4)" font-size="10" font-weight="900" text-anchor="middle" dominant-baseline="middle" class="uppercase tracking-widest">${s.label}</text>`;
  }).join('');

  return `
    <svg viewBox="0 0 ${size} ${size}" class="w-full h-full overflow-visible">
      <defs>
        <linearGradient id="userGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="rgba(168, 85, 247, 0.4)" />
          <stop offset="100%" stop-color="rgba(99, 102, 241, 0.2)" />
        </linearGradient>
        <linearGradient id="userStroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#a855f7" />
          <stop offset="100%" stop-color="#6366f1" />
        </linearGradient>
        <linearGradient id="goalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="rgba(99, 102, 241, 0.1)" />
          <stop offset="100%" stop-color="rgba(79, 70, 229, 0.05)" />
        </linearGradient>
      </defs>
      <g>${gridLevels.map(l => `<circle cx="${centerX}" cy="${centerY}" r="${(l/100)*radius}" fill="none" stroke="rgba(255,255,255,0.02)" />`).join('')}</g>
      <g>${gridCircles}</g>
      <g>${gridAxes}</g>
      ${goalPolygon}
      ${userPolygon}
      ${userDots}
      ${labels}
    </svg>
  `;
}



// ── PROGRESSO PAGE ──
Pages.progresso = () => {
  const acc = AppState.get("subjectAccuracy") || {};
  const weekly = AppState.get("weeklyStudyData") || [0,0,0,0,0,0,0];
  const days = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
  const maxW = Math.max(...weekly, 1);
  const subjColors = { matematica: "#3B82F6", fisica: "#8B5CF6", quimica: "#EF4444", biologia: "#22C55E", portugues: "#F59E0B", historia: "#F97316", geografia: "#06B6D4" };
  
  // Calculate Global average
  const accValues = Object.values(acc);
  const avgAcc = accValues.length > 0 ? Math.round(accValues.reduce((a,b)=>a+b,0)/accValues.length) : 0;

  // Data for Flow Chart (Using real cumulative tracked data)
  const totalStudyTime = AppState.get("studyTimeMinutes") || 0;
  const totalRestTime = AppState.get("restTimeMinutes") || 0;
  const focusEfficiency = (totalStudyTime + totalRestTime) > 0 ? Math.round((totalStudyTime / (totalStudyTime + totalRestTime)) * 100) : 0;

  // Line chart data -- derived from weekly study data
  const lineData = weekly.map((v, i) => ({ l: days[i], v: v }));
  const lineMax = Math.max(...lineData.map(d => d.v), 1);
  const cW=320,cH=150,pX=15,pY=15,uW=cW-pX*2,uH=cH-pY*2;
  const pts = lineData.map((d,i) => ({ x: pX+(i/(lineData.length-1))*uW, y: pY+uH-(d.v/lineMax)*uH, ...d }));
  const pathD = pts.map((p,i) => `${i===0?"M":"L"}${p.x},${p.y}`).join(" ");
  const areaD = pathD + ` L${pts[pts.length-1].x},${pY+uH} L${pts[0].x},${pY+uH} Z`;

  // Circular Gauge Math (Refined Spacing)
  const radius = 78; // Increased from 70
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (avgAcc / 100) * circumference;

  // Add Radar Animation CSS dynamically if not present
  if (!document.getElementById("radar-styles")) {
    const style = document.createElement("style");
    style.id = "radar-styles";
    style.textContent = `
      @keyframes radar-pulse {
        0%, 100% { filter: drop-shadow(0 0 15px rgba(168, 85, 247, 0.4)); opacity: 0.8; }
        50% { filter: drop-shadow(0 0 25px rgba(168, 85, 247, 0.7)); opacity: 1; }
      }
      .animate-radar-pulse {
        animation: radar-pulse 4s ease-in-out infinite;
      }
      .radar-poly {
        transition: all 1s ease-out;
      }
    `;
    document.head.appendChild(style);
  }

  return `
  <header class="glass-header px-6 py-5 sticky top-0 z-50">
    <div class="flex items-center justify-between max-w-2xl mx-auto">
      <button onclick="Router.back()" class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-300">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
      <h1 class="text-sm font-black text-white uppercase tracking-widest text-center">Dashboard de Performance</h1>
      <div class="w-10"></div>
    </div>
  </header>

  <main class="flex-1 scroll-area px-6 py-8 space-y-6 safe-bottom">
      <!-- Immersive Performance Gauge (Hero) -->
      <div class="relative glass-card rounded-3xl p-10 overflow-hidden flex flex-col items-center animate-in" style="--delay: 100ms">
        <div class="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent"></div>
        
        <!-- The Gauge with More Spacing -->
        <div class="relative w-48 h-48 mb-6">
          <svg class="w-full h-full rotate-[-90deg] drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <!-- Track -->
            <circle cx="96" cy="96" r="${radius}" stroke="rgba(255,255,255,0.03)" stroke-width="14" fill="none" />
            <!-- Progress -->
            <circle cx="96" cy="96" r="${radius}" stroke="url(#lineGrad)" stroke-width="14" fill="none" 
                    stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round"
                    class="transition-all duration-[2000ms] ease-out" />
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#10b981" />
                <stop offset="100%" stop-color="#34d399" />
              </linearGradient>
            </defs>
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-5xl font-black text-white tracking-widest transition-all hover:scale-110 cursor-default">${avgAcc}%</span>
            <span class="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1">Acerto Global</span>
          </div>
        </div>
        
        <div class="text-center relative z-10 flex flex-col items-center">
          <div class="flex items-center gap-2 mb-2">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            <h2 class="text-xs font-black text-white uppercase tracking-[0.2em]">Nível de Maestria</h2>
          </div>
          <p class="text-[10px] font-bold text-slate-400">Você domina ${APP_DATA.subjects.filter(s=>(acc[s.id]||0)>75).length} de ${APP_DATA.subjects.length} áreas com excelência</p>
        </div>
      </div>

      <!-- Elite Leagues Shortcut -->
      <div onclick="Router.navigate('/ranking')" class="glass-card bg-gradient-to-br from-indigo-500/10 to-transparent p-6 rounded-[32px] border border-indigo-500/20 shadow-xl group active:scale-[0.98] transition-all cursor-pointer animate-in" style="--delay: 150ms">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
              <span class="material-symbols-outlined text-indigo-400 text-2xl">leaderboard</span>
            </div>
            <div>
              <h3 class="text-sm font-black text-white uppercase tracking-wider">Elite Leagues</h3>
              <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Veja sua posição no ranking</p>
            </div>
          </div>
          <div class="bg-white/5 w-10 h-10 rounded-xl flex items-center justify-center border border-white/5 group-hover:border-indigo-500/50 transition-all">
            <span class="material-symbols-outlined text-slate-500 text-xl group-hover:text-indigo-400 transition-colors">chevron_right</span>
          </div>
        </div>
      </div>

    <!-- Stunning Study Flow Distribution -->
    <section class="glass-card rounded-3xl p-6 space-y-4 animate-in" style="--delay: 200ms">
      <div class="flex items-center justify-between gap-4">
        <h3 class="text-[10px] font-black text-white uppercase tracking-widest truncate">Fluxo de Estudo</h3>
        <div class="flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 shrink-0">
          <span class="text-[9px] font-black text-emerald-400 uppercase whitespace-nowrap">${focusEfficiency}% Eficiência</span>
        </div>
      </div>

      <div class="flex flex-col items-center gap-4 py-1">
        <!-- Semi-Donut Flow (Centered & Larger) -->
        <div class="relative shrink-0" style="width: 150px; height: 150px;">
          <svg viewBox="0 0 150 150" class="w-full h-full rotate-[-90deg]">
            <circle cx="75" cy="75" r="70" stroke="rgba(255,255,255,0.05)" stroke-width="12" fill="none" />
            <!-- Study Segment -->
            <circle cx="75" cy="75" r="70" stroke="#10b981" stroke-width="12" fill="none" 
                    stroke-dasharray="${2 * Math.PI * 70}" stroke-dashoffset="${totalStudyTime > 0 ? (2 * Math.PI * 70) * (1 - totalStudyTime / (totalStudyTime + totalRestTime)) : 2 * Math.PI * 70}" 
                    stroke-linecap="round" class="drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="material-symbols-outlined text-emerald-400" style="font-size: 42px !important;">psychology</span>
            <span class="text-[10px] font-black text-white uppercase mt-1 tracking-widest">Foco</span>
          </div>
        </div>

        <div class="w-full space-y-4">
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tempo de Estudo</span>
              <span class="text-xs font-black text-emerald-400">${totalStudyTime}m</span>
            </div>
            <div class="w-full h-4 bg-slate-900/50 rounded-full overflow-hidden p-0.5 border border-white/5">
              <div class="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]" style="width: 100%"></div>
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tempo de Descanso</span>
              <span class="text-xs font-black text-amber-400">${totalRestTime}m</span>
            </div>
            <div class="w-full h-4 bg-slate-900/50 rounded-full overflow-hidden p-0.5 border border-white/5">
              <div class="h-full bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.3)]" style="width: ${totalStudyTime > 0 ? Math.round((totalRestTime/totalStudyTime)*100) : 0}%"></div>
            </div>
          </div>
          <p class="text-[9px] text-slate-500 font-bold italic mt-2 text-center opacity-60 italic">Dica: O descanso estratégico aumenta sua retenção em até 40%.</p>
        </div>
      </div>
    </section>

    <div class="grid grid-cols-2 gap-4">
      <div class="glass-card rounded-2xl p-5 space-y-2 animate-in" style="--delay: 300ms">
        <div class="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
          <span class="material-symbols-outlined text-cyan-400 text-lg">calendar_month</span>
        </div>
        <div>
          <h4 class="text-[8px] font-black text-slate-500 uppercase tracking-widest">Sequência Atual</h4>
          <p class="text-lg font-black text-white">${AppState.get("missionProgress").m4 || 0} Dias</p>
        </div>
      </div>
      <div class="glass-card rounded-2xl p-5 space-y-2 animate-in" style="--delay: 400ms">
        <div class="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
          <span class="material-symbols-outlined text-indigo-400 text-lg">rocket_launch</span>
        </div>
        <div>
          <h4 class="text-[8px] font-black text-slate-500 uppercase tracking-widest">Nível de Missões</h4>
          <p class="text-lg font-black text-white">${(() => { const t = AppState.get("totalQuestionsAnswered") || 0; if (t >= 500) return "Elite V"; if (t >= 200) return "Elite IV"; if (t >= 100) return "Elite III"; if (t >= 50) return "Elite II"; if (t >= 20) return "Elite I"; if (t >= 5) return "Iniciante II"; return "Iniciante I"; })()}</p>
        </div>
      </div>
    </div>

    <!-- Ghost Stat: Chance de Aprovação (Full Width) -->
    <div onclick="${AppState.get("userPlan") === 'gratis' ? "Router.navigate('/premium')" : ""}" 
         class="glass-card w-full rounded-2xl p-6 relative overflow-hidden group active:scale-[0.98] transition-all cursor-pointer animate-in" style="--delay: 450ms">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-5">
          <div class="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <span class="material-symbols-outlined text-amber-400 text-2xl">psychology_alt</span>
          </div>
          <div>
            <h4 class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Chance de Aprovação</h4>
            <div class="flex items-baseline gap-2">
              <p class="text-2xl font-black text-white transition-all">${AppState.get("userPlan") === 'gratis' ? '??%' : Math.round(avgAcc * 0.95 + 5) + '%'}</p>
              ${AppState.get("userPlan") === 'gratis' ? '<span class="text-[10px] font-black text-amber-500 uppercase opacity-40">Bloqueado</span>' : ''}
            </div>
          </div>
        </div>
        ${AppState.get("userPlan") === 'gratis' ? `
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2 bg-amber-500/20 px-4 py-2 rounded-full border border-amber-500/30">
              <span class="material-symbols-outlined text-amber-400 text-sm">lock</span>
              <span class="text-[10px] font-black text-amber-400 uppercase tracking-tighter">Plano Plus+</span>
            </div>
            <span class="material-symbols-outlined text-slate-600">chevron_right</span>
          </div>
        ` : `
          <div class="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20 shrink-0">
            <span class="text-[10px] font-black text-emerald-400 uppercase tracking-widest whitespace-nowrap">Análise de IA</span>
          </div>
        `}
      </div>
      ${AppState.get("userPlan") === 'gratis' ? `
        <div class="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span class="text-[10px] font-black text-white uppercase tracking-widest bg-amber-500 px-6 py-3 rounded-full shadow-2xl">Ver Minha Nota Agora</span>
        </div>
      ` : ''}
    </div>

    <!-- Performance History (Weekly Bar Chart PRO+) -->
    <section class="glass-card rounded-3xl p-6 space-y-6 animate-in relative overflow-hidden" style="--delay: 500ms">
      ${AppState.get("userPlan") === 'gratis' ? `
        <!-- Locked Overlay for History (Full Card) -->
        <div class="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-[4px] p-6 text-center">
          <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 mb-3 shadow-lg">
            <span class="material-symbols-outlined text-indigo-400 text-2xl">bar_chart_4_bars</span>
          </div>
          <p class="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-1">Histórico Bloqueado</p>
          <p class="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-4">Apenas usuários Plus+ têm acesso ao histórico detalhado</p>
          <button onclick="Router.navigate('/premium')" class="bg-indigo-500 text-white text-[9px] font-black px-8 py-3 rounded-full hover:bg-indigo-600 transition-all uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95">Liberar Meu Histórico</button>
        </div>
      ` : ''}

      <div class="flex items-center justify-between px-2">
        <div class="space-y-1">
          <h3 class="text-[10px] font-black text-white uppercase tracking-[0.2em]">Histórico Semanal</h3>
          <p class="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Desempenho Diário • Ciclo Atual</p>
        </div>
        <div class="flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="text-[9px] font-black text-emerald-400 uppercase">Live Stats</span>
        </div>
      </div>
      
      <!-- Larger Chart Area -->
      <div class="relative">
        <div class="flex gap-4 items-end pb-2 overflow-visible">
        <!-- Y-Axis Scale -->
        <div class="flex flex-col justify-between h-[180px] pb-8 shrink-0">
          ${[100, 75, 50, 25, 0].map(v => `
            <div class="flex items-center gap-2">
              <span class="text-[7px] font-black text-slate-600 w-6 text-right">${v}%</span>
              <div class="w-1 h-[1px] bg-slate-800"></div>
            </div>
          `).join("")}
        </div>

        <!-- The Bar Chart (Increased size) -->
        <div class="flex-1 relative">
          <svg viewBox="0 0 ${cW} 180" class="w-full h-auto overflow-visible">
            <defs>
              <linearGradient id="barGradPRO" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#34d399" />
                <stop offset="100%" stop-color="#10b981" stop-opacity="0.1" />
              </linearGradient>
              <filter id="barGlowPRO" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <!-- Metadata Line (75%) -->
            <line x1="0" y1="${180 - (75 / 100) * 160}" x2="${cW}" y2="${180 - (75 / 100) * 160}" 
                  stroke="#6366f1" stroke-width="1.5" stroke-dasharray="4 4" stroke-opacity="0.4" />

            <!-- Weekly Data Logic -->
            ${(() => {
              const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
              const weeklyScores = weekDays.map((d, i) => ({ l: d, v: Math.round(50 + Math.random() * 40) })); // Simulated performance per day
              const barW = 28;
              const spacing = (cW - (7 * barW)) / 6;
              
              return weeklyScores.map((d, i) => {
                const x = i * (barW + spacing);
                const h = (d.v / 100) * 160;
                const y = 180 - h;
                const isToday = i === new Date().getDay();
                
                return `
                  <g class="animate-in group/bar" style="--delay: ${600 + (i * 100)}ms">
                    <rect x="${x}" y="${y}" width="${barW}" height="${h}" fill="url(#barGradPRO)" rx="6" 
                          class="group-hover/bar:brightness-125 transition-all cursor-pointer" />
                    <rect x="${x}" y="${y}" width="${barW}" height="5" fill="#6ee7b7" rx="2.5" 
                          filter="${isToday ? 'url(#barGlowPRO)' : ''}" />
                    <!-- Label per bar -->
                    <text x="${x + barW/2}" y="${y - 10}" fill="white" font-size="8" font-weight="900" 
                          text-anchor="middle" class="opacity-0 group-hover/bar:opacity-100 transition-opacity">${d.v}%</text>
                  </g>
                `;
              }).join("");
            })()}
          </svg>
          
          <!-- X-Axis Labels -->
          <div class="flex justify-between mt-4 px-1">
            ${["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => `
              <div class="flex flex-col items-center gap-1">
                <span class="text-[8px] font-black ${i === new Date().getDay() ? 'text-emerald-400' : 'text-slate-600'} uppercase">${d}</span>
                <div class="w-1 h-1 rounded-full ${i === new Date().getDay() ? 'bg-emerald-400' : 'bg-slate-800'}"></div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>

      <!-- New Footer Info Panel (Relocated) -->
      <div class="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
            <span class="material-symbols-outlined text-emerald-400">workspace_premium</span>
          </div>
          <div>
            <span class="text-[7px] font-black text-slate-500 uppercase tracking-widest">Melhor Dia</span>
            <p class="text-xs font-black text-white">${(() => { const w = AppState.get("weeklyStudyData") || [0,0,0,0,0,0,0]; const maxVal = Math.max(...w); if (maxVal === 0) return "--"; const idx = w.indexOf(maxVal); return ["DOMINGO","SEGUNDA","TERÇA","QUARTA","QUINTA","SEXTA","SÁBADO"][idx]; })()}</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
            <span class="material-symbols-outlined text-indigo-400">flag</span>
          </div>
          <div>
            <span class="text-[7px] font-black text-slate-500 uppercase tracking-widest">Meta de 75%</span>
            <div class="flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full ${avgAcc >= 75 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}"></span>
              <p class="text-[8px] font-black ${avgAcc >= 75 ? 'text-emerald-400' : 'text-rose-400'} uppercase">${avgAcc >= 75 ? 'Superada' : 'Em progresso'}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Subjects Matrix (Compact with Icons) -->
    <section class="glass-card rounded-3xl p-6 space-y-6 animate-in relative overflow-hidden" style="--delay: 600ms">
      <h3 class="text-xs font-black text-white uppercase tracking-[0.3em] text-center mb-4">Domínio por Área</h3>
      
      ${AppState.get("userPlan") === "gratis" ? `
        <!-- Locked Overlay -->
        <div class="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-[2px] p-6 text-center">
          <div class="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 mb-4 shadow-lg shadow-cyan-500/5">
            <span class="material-symbols-outlined text-cyan-400 text-2xl">lock</span>
          </div>
          <p class="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-1">Domínio por Área</p>
          <p class="text-[9px] font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-4 py-2 rounded-full border border-cyan-500/20">Disponível a partir do Plano Básico</p>
          <button onclick="Router.navigate('/premium')" class="mt-4 text-[8px] font-black text-white underline underline-offset-4 uppercase tracking-[0.2em] opacity-60 hover:opacity-100 transition-opacity">Fazer Upgrade Agora</button>
        </div>
      ` : ''}

      <div class="grid grid-cols-1 gap-6 ${AppState.get("userPlan") === "gratis" ? 'blur-[2px] opacity-20 pointer-events-none' : ''}">
        ${APP_DATA.subjects.map(s => {
          const score = acc[s.id] || 0;
          return `
          <div class="flex items-center gap-5 group">
            <div class="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5 group-hover:border-emerald-500/30 transition-all shadow-lg hover:shadow-emerald-500/5">
              <span class="material-symbols-outlined text-emerald-400 text-xl">${s.icon || 'auto_awesome'}</span>
            </div>
            <div class="flex-1 space-y-2">
              <div class="flex justify-between items-end">
                <span class="text-[10px] font-black text-slate-300 uppercase tracking-[0.1em]">${s.label}</span>
                <span class="text-xs font-black text-white">${score}%</span>
              </div>
              <div class="w-full bg-slate-900/50 h-4 rounded-full overflow-hidden p-0.5 border border-white/5">
                <div class="h-full rounded-full transition-all duration-[1.5s] ease-out shadow-[0_0_12px_rgba(16,185,129,0.3)]" 
                     style="width:${score}%; background: ${subjColors[s.id]}"></div>
              </div>
            </div>
          </div>`;
        }).join("")}
      </div>
    </section>

    <!-- Motivational Footer -->
    <div class="text-center pt-8 pb-12 space-y-2 opacity-50">
      <p class="text-[8px] font-black text-slate-500 uppercase tracking-[0.5em]">Powered by EduHub Intelligence</p>
      <div class="flex justify-center gap-1">
        <span class="w-1 h-1 rounded-full bg-emerald-500"></span>
        <span class="w-1 h-1 rounded-full bg-emerald-500"></span>
        <span class="w-1 h-1 rounded-full bg-emerald-500"></span>
    </div>
  </main>`;
};

PageEvents.progresso = (page) => {
  if (AppState.get("userPlan") !== "plus") return;

  const goalBtns = page.querySelectorAll(".radar-goal-btn");
  const radarContainer = page.querySelector("#radar-container");
  const goalLabel = page.querySelector("#radar-goal-label");

  const goalData = {
    medicina: { label: "Medicina (UFRJ)", data: { matematica: 85, fisica: 80, quimica: 85, biologia: 90, portugues: 80, historia: 75, geografia: 75 } },
    direito: { label: "Direito (USP)", data: { matematica: 70, fisica: 60, quimica: 60, biologia: 65, portugues: 90, historia: 85, geografia: 85 } },
    engenharia: { label: "Engenharia (ITA)", data: { matematica: 95, fisica: 95, quimica: 90, biologia: 60, portugues: 75, historia: 60, geografia: 60 } },
    ti: { label: "Ciência da Comp. (UNICAMP)", data: { matematica: 90, fisica: 80, quimica: 70, biologia: 60, portugues: 80, historia: 65, geografia: 65 } }
  };

  goalBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      SoundManager.play("tap");
      const goalKey = btn.dataset.goal;
      const goalInfo = goalData[goalKey];
      if (!goalInfo) return;

      // Update Active State on Buttons
      goalBtns.forEach(b => {
        b.classList.remove("bg-indigo-500/20", "text-indigo-300", "border-indigo-500/30", "active-goal");
        b.classList.add("bg-white/5", "text-slate-500", "border-white/10");
        // Maintain hover states for inactive
        b.classList.add("hover:border-indigo-500/30", "hover:text-indigo-400");
      });
      
      btn.classList.add("bg-indigo-500/20", "text-indigo-300", "border-indigo-500/30", "active-goal");
      btn.classList.remove("bg-white/5", "text-slate-500", "border-white/10", "hover:border-indigo-500/30", "hover:text-indigo-400");

      // Update Text Label
      if (goalLabel) goalLabel.textContent = goalInfo.label;

      // Update Radar Chart SVG
      if (radarContainer) {
        // Regenerate radar SVG with new goal data
        const stats = AppState.get("stats") || {};
        const acc = stats.accuracyBySubject || {};
        radarContainer.innerHTML = renderRadarChart(acc, goalInfo.data);
      }
    });
  });
};


// ── MISSÕES PAGE ──
Pages.missoes = () => {
  const plan = AppState.get("userPlan");
  const limit = plan === "gratis" ? 2 : plan === "basico" ? 3 : 4;
  const missions = APP_DATA.missions.slice(0, limit);
  const progress = AppState.get("missionProgress") || {};
  const totalQ = AppState.get("totalQuestionsAnswered") || 0;
  const xp = totalQ * 10;
  const level = Math.floor(xp / 500) + 1;

  return `
  <header class="sticky top-0 z-10 bg-background-dark/95 backdrop-blur-md border-b border-white/5 px-4 py-4 safe-top">
    <div class="max-w-2xl mx-auto flex items-center justify-between">
      <button onclick="Router.back()" class="p-2 -ml-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all flex items-center gap-1 active:scale-90">
        <span class="material-symbols-outlined text-2xl">chevron_left</span>
        <span class="text-sm font-bold">Voltar</span>
      </button>
      <h1 class="text-lg font-bold">Missões da Semana</h1>
      <div class="flex items-center gap-1 bg-amber-500/10 px-3 py-1 rounded-full">
        <span class="material-symbols-outlined text-amber-500 text-sm fill-icon">bolt</span>
        <span class="text-xs font-black text-amber-500">${xp} XP</span>
      </div>
    </div>
  </header>

  <main class="flex-1 scroll-area p-4 space-y-4 safe-bottom max-w-2xl mx-auto">
    <div onclick="Router.navigate('/ranking')" class="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden mb-6 cursor-pointer active:scale-[0.98] transition-all">
      <div class="relative z-10">
        <h2 class="text-2xl font-black mb-1">Status Semanal</h2>
        <p class="text-emerald-100/70 text-sm font-medium">Complete os desafios para ganhar XP extra!</p>
        <div class="mt-6 flex items-end gap-3">
          <span class="text-4xl font-black">${missions.filter(m => (progress[m.id] || 0) >= m.goal).length}</span>
          <span class="text-emerald-200/60 font-bold mb-1">de ${missions.length} concluídas</span>
        </div>
      </div>
      <div class="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 opacity-20">
         <span class="material-symbols-outlined text-4xl">chevron_right</span>
         <span class="text-[8px] font-black uppercase tracking-widest">Ranking</span>
      </div>
      <span class="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] opacity-10 rotate-12">emoji_events</span>
    </div>

    <div class="space-y-4">
      ${missions.map(m => {
        const p = progress[m.id] || 0;
        const isDone = p >= m.goal;
        const percent = Math.min(100, Math.round((p / m.goal) * 100));
        
        return `
        <div class="bg-slate-800/80 rounded-2xl p-5 border border-white/5 flex gap-4 items-start ${isDone ? 'opacity-60' : ''}">
          <div class="w-12 h-12 rounded-2xl bg-slate-700/50 flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined ${isDone ? 'text-emerald-400' : 'text-slate-400'} text-2xl">${isDone ? 'check_circle' : 'target'}</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-start mb-1">
              <h3 class="font-bold text-white text-base truncate">${m.title}</h3>
              <span class="text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">+${m.xp} XP</span>
            </div>
            <p class="text-slate-400 text-xs mb-4 leading-relaxed">${m.desc}</p>
            
            <div class="flex flex-col gap-1.5">
              <div class="flex justify-between items-end text-[10px] font-bold">
                <span class="${isDone ? 'text-emerald-400' : 'text-slate-500'} uppercase">${isDone ? 'Concluída' : 'Em progresso'}</span>
                <span class="text-slate-300">${p} / ${m.goal} ${m.unit}</span>
              </div>
              <div class="w-full bg-slate-700/50 h-2 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-700 ${isDone ? 'bg-emerald-500' : 'bg-blue-500'}" style="width: ${percent}%"></div>
              </div>
            </div>
          </div>
        </div>`;
      }).join("")}
    </div>

    <div class="pt-10 pb-12 text-center space-y-4">
      <p class="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">As missões resetam em 3 dias</p>
      ${limit < 4 ? `
        <button onclick="Router.navigate('/premium')" class="bg-cyan-500/10 px-6 py-3 rounded-2xl border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500/20 active:scale-95 transition-all shadow-lg shadow-cyan-500/5">
          Desbloquear mais missões de XP Alto <span class="material-symbols-outlined text-sm align-middle ml-1">stars</span>
        </button>
      ` : ''}
    </div>
  </main>
`;
};

// ── IA TUTOR PAGE ──
Pages["ia-tutor"] = () => {
  const plan = AppState.get("userPlan");
  const isFree = plan === "gratis";
  const models = isFree ? [] : AIService.getAvailableModels();
  const usage = AIService.checkUsage();
  const isBasico = plan === "basico";

  // Blocked state for free users
  if (isFree) {
    return `
    <div class="min-h-screen bg-[#020617] flex flex-col font-lexend overflow-hidden relative">
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-600/10 blur-[120px] rounded-full"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full"></div>

      <header class="sticky top-0 z-30 bg-[#020617]/80 backdrop-blur-2xl border-b border-white/5 px-6 py-4 safe-top">
        <div class="max-w-2xl mx-auto flex items-center justify-between">
          <button onclick="Router.back('/home')" class="group flex items-center gap-2 text-slate-400 hover:text-white transition-all active:scale-90">
            <div class="size-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
              <span class="material-symbols-outlined text-lg">arrow_back_ios_new</span>
            </div>
          </button>
          <div class="flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
            <span class="text-[9px] text-cyan-400 font-black uppercase tracking-[0.3em]">Tutor IA</span>
          </div>
          <div class="w-8"></div>
        </div>
      </header>

      <main class="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div class="relative mb-8">
          <div class="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div class="size-28 bg-[#0f172a] rounded-[48px] border border-white/10 shadow-3xl flex items-center justify-center relative z-10">
            <span class="material-symbols-outlined text-6xl text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">neurology</span>
          </div>
        </div>
        <h1 class="text-2xl font-black text-white leading-tight tracking-tighter uppercase mb-3">
          Tutor <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">IA</span>
        </h1>
        <p class="text-[11px] text-slate-500 font-bold uppercase tracking-[0.15em] max-w-[280px] mb-8">
          3 Inteligências Artificiais prontas para te ajudar a passar no ENEM.
        </p>
        <button onclick="Router.navigate('/premium')" class="px-8 py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-2xl text-white font-black text-xs uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(6,182,212,0.3)] active:scale-[0.96] transition-all flex items-center gap-3">
          <span class="material-symbols-outlined text-lg">lock_open</span>
          Desbloquear a partir do Básico
        </button>
      </main>
    </div>`;
  }

  // Active state (Básico, Pro, Plus+)
  const defaultModel = models[0]?.key || "step-3-5";

  return `
  <div class="min-h-screen bg-[#020617] flex flex-col font-lexend overflow-hidden relative">
    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-600/8 blur-[120px] rounded-full"></div>

    <header class="sticky top-0 z-30 bg-[#020617]/90 backdrop-blur-2xl border-b border-white/5 px-6 py-4 safe-top">
      <div class="max-w-2xl mx-auto">
        <div class="flex items-center justify-between mb-3">
          <button onclick="Router.back('/home')" class="group flex items-center gap-2 text-slate-400 hover:text-white transition-all active:scale-90">
            <div class="size-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
              <span class="material-symbols-outlined text-lg">arrow_back_ios_new</span>
            </div>
          </button>
          <div class="flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
            <span class="text-[9px] text-cyan-400 font-black uppercase tracking-[0.3em]">Tutor IA Online</span>
          </div>
          ${isBasico ? `
            <div class="bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
              <span id="ai-usage-counter" class="text-[9px] font-black text-amber-400 uppercase tracking-widest">${usage.remaining || 0}/5</span>
            </div>
          ` : '<div class="w-8"></div>'}
        </div>

        <!-- Custom Dropdown Selector -->
        <div class="relative w-full z-40 mt-1 pb-1">
          <button id="ai-model-dropdown-btn" class="w-full flex items-center justify-between bg-slate-900/60 border border-white/10 rounded-2xl px-4 py-3 hover:bg-slate-800/80 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50">
            <div class="flex items-center gap-3" id="ai-active-model-display">
              <span class="material-symbols-outlined text-lg text-${models[0]?.color || 'cyan'}-400">${models[0]?.icon || 'neurology'}</span>
              <div class="flex flex-col items-start translate-y-[-1px]">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-black text-white uppercase tracking-widest leading-none">${models[0]?.label || 'Tutor IA'}</span>
                  ${models[0] ? `<span class="px-1.5 py-0.5 rounded-md bg-${models[0].tier === "plus" ? "indigo" : models[0].tier === "pro" ? "blue" : "emerald"}-500/10 border border-${models[0].tier === "plus" ? "indigo" : models[0].tier === "pro" ? "blue" : "emerald"}-500/20 text-[7px] font-black text-${models[0].tier === "plus" ? "indigo" : models[0].tier === "pro" ? "blue" : "emerald"}-400 uppercase tracking-tighter">
                    ${models[0].tier === "plus" ? "PLUS+" : models[0].tier === "pro" ? "PRO" : "BÁSICO"}
                  </span>` : ''}
                </div>
                <span class="text-[9px] text-slate-400 font-medium tracking-wide mt-1 leading-none">${models[0]?.description || 'Escolha um modelo'}</span>
              </div>
            </div>
            <span id="ai-dropdown-chevron" class="material-symbols-outlined text-slate-400 text-xl transition-transform duration-300">expand_more</span>
          </button>
          
          <div id="ai-model-dropdown-menu" class="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden opacity-0 invisible transform -translate-y-2 transition-all duration-300 origin-top flex flex-col max-h-[250px] overflow-y-auto no-scrollbar pointer-events-none">
            ${models.map((m) => {
              const tierLabel = m.tier === "plus" ? "PLUS+" : m.tier === "pro" ? "PRO" : "BÁSICO";
              const tierColor = m.tier === "plus" ? "indigo" : m.tier === "pro" ? "blue" : "emerald";
              return `
                <button data-model="${m.key}" class="ai-model-option flex items-center gap-3 px-4 py-3.5 border-b border-white/5 last:border-0 hover:bg-slate-800 transition-colors text-left group">
                  <div class="size-8 rounded-full bg-${m.color}-500/10 flex items-center justify-center shrink-0 border border-${m.color}-500/20 group-hover:bg-${m.color}-500/20 transition-colors">
                    <span class="material-symbols-outlined text-sm text-${m.color}-400">${m.icon}</span>
                  </div>
                  <div class="flex flex-col items-start pt-[2px] min-w-0 pr-2 flex-1">
                    <div class="flex items-center gap-2 w-full">
                      <span class="text-[11px] font-black text-slate-200 uppercase tracking-widest truncate">${m.label}</span>
                      <span class="px-1.5 py-0.5 rounded-md bg-${tierColor}-500/10 border border-${tierColor}-500/20 text-[7px] font-black text-${tierColor}-400 uppercase tracking-tighter shadow-sm">${tierLabel}</span>
                    </div>
                    <span class="text-[9px] text-slate-500 font-medium tracking-wide truncate mt-0.5 w-full">${m.description}</span>
                  </div>
                </button>
              `;
            }).join("")}
          </div>
        </div>
      </div>
    </header>

    <main id="ai-chat-area" class="flex-1 scroll-area px-6 py-6 space-y-4 safe-bottom max-w-2xl mx-auto w-full">
      <!-- Welcome Message -->
      <div class="ai-msg-wrapper flex gap-3 ai-msg-enter">
        <div class="size-8 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 flex items-center justify-center border border-white/10 shrink-0 mt-1">
          <span class="material-symbols-outlined text-cyan-400 text-sm">neurology</span>
        </div>
        <div class="ai-bubble glass-card bg-[#0f172a]/60 rounded-2xl rounded-tl-md p-4 border border-white/5 max-w-[85%]">
          <p class="text-sm text-slate-200 leading-relaxed">Olá! 👋 Eu sou o <strong class="text-cyan-400">Tutor IA</strong> do EduHub Brasil. Tire suas dúvidas sobre qualquer matéria do ENEM. Como posso te ajudar hoje?</p>
        </div>
      </div>
    </main>

    <!-- Input Area -->
    <div class="sticky bottom-0 bg-[#020617]/95 backdrop-blur-2xl border-t border-white/5 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] z-20">
      <div id="ai-file-preview-container" class="hidden max-w-2xl mx-auto mb-3">
        <div class="relative inline-flex items-center gap-3 bg-[#0f172a] border border-white/10 p-2 pr-4 rounded-xl">
          <img id="ai-file-preview-img" src="" class="h-12 w-12 rounded bg-[#020617] object-cover hidden">
          <div id="ai-file-preview-doc" class="h-12 w-12 rounded bg-cyan-500/10 text-cyan-400 flex items-center justify-center hidden">
            <span class="material-symbols-outlined">description</span>
          </div>
          <div class="flex-1 min-w-0">
            <p id="ai-file-name" class="text-sm font-medium text-slate-200 truncate max-w-[150px]"></p>
            <p id="ai-file-size" class="text-xs text-slate-500"></p>
          </div>
          <button id="ai-file-remove" class="absolute -top-2 -right-2 size-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:scale-110 transition-transform shadow-lg shadow-red-500/20">
            <span class="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      </div>
      <div class="max-w-2xl mx-auto flex items-end gap-3">
        <input type="file" id="ai-file-input" accept="image/*,.txt,.md,.csv,.pdf,.doc,.docx" class="hidden">
        <button id="ai-file-btn" class="size-12 rounded-2xl bg-[#0f172a]/80 border border-white/10 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all shrink-0 relative group">
          <span class="material-symbols-outlined text-xl">attach_file</span>
        </button>
        </button>
        <div class="flex-1 relative">
          <textarea id="ai-input" rows="1" placeholder="Pergunte qualquer coisa..." class="w-full bg-[#0f172a]/60 border border-white/10 rounded-2xl px-5 py-4 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-0 transition-all font-bold resize-none max-h-32 outline-none"></textarea>
        </div>
        <button id="ai-send-btn" class="size-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 active:scale-90 transition-all shrink-0 hover:brightness-110">
          <span class="material-symbols-outlined text-xl">send</span>
        </button>
      </div>
    </div>
  </div>`;
};

PageEvents["ia-tutor"] = (page) => {
  let activeModel = AIService.getAvailableModels()[0]?.key || "step-3-5";
  let isSending = false;
  const chatArea = page.querySelector("#ai-chat-area");
  const input = page.querySelector("#ai-input");
  const sendBtn = page.querySelector("#ai-send-btn");
  
  // File Upload Elements
  const fileInput = page.querySelector("#ai-file-input");
  const uploadBtn = page.querySelector("#ai-file-btn");
  const filePreviewContainer = page.querySelector("#ai-file-preview-container");
  const filePreviewImg = page.querySelector("#ai-file-preview-img");
  const filePreviewDoc = page.querySelector("#ai-file-preview-doc");
  const fileNameDisplay = page.querySelector("#ai-file-name");
  const fileSizeDisplay = page.querySelector("#ai-file-size");
  const fileRemoveBtn = page.querySelector("#ai-file-remove");
  
  let currentFileBase64 = null; // For images
  let currentFileText = null;   // For documents
  let currentFileName = null;

  const dropdownBtn = page.querySelector("#ai-model-dropdown-btn");
  const dropdownMenu = page.querySelector("#ai-model-dropdown-menu");
  const chevron = page.querySelector("#ai-dropdown-chevron");
  const activeDisplay = page.querySelector("#ai-active-model-display");

  // Dropdown Toggle Logic
  if (dropdownBtn && dropdownMenu) {
    dropdownBtn.addEventListener("click", () => {
      const isVisible = dropdownMenu.classList.contains("opacity-100");
      if (isVisible) {
        closeDropdown();
      } else {
        dropdownMenu.classList.remove("invisible", "opacity-0", "-translate-y-2", "pointer-events-none");
        dropdownMenu.classList.add("opacity-100", "translate-y-0", "pointer-events-auto");
        chevron.classList.add("rotate-180");
        SoundManager.play("tap");
      }
    });

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
        if (dropdownMenu.classList.contains("opacity-100")) {
          closeDropdown();
        }
      }
    });

    function closeDropdown() {
      dropdownMenu.classList.remove("opacity-100", "translate-y-0", "pointer-events-auto");
      dropdownMenu.classList.add("opacity-0", "-translate-y-2", "invisible", "pointer-events-none");
      chevron.classList.remove("rotate-180");
    }

    // Model selection
    page.querySelectorAll(".ai-model-option").forEach(option => {
      option.addEventListener("click", () => {
        if (isSending) return;
        activeModel = option.dataset.model;
        const model = AIService.MODELS[activeModel];

        // Update display
        const tierLabel = model.tier === "plus" ? "PLUS+" : model.tier === "pro" ? "PRO" : "BÁSICO";
        const tierColor = model.tier === "plus" ? "indigo" : model.tier === "pro" ? "blue" : "emerald";
        activeDisplay.innerHTML = `
          <span class="material-symbols-outlined text-lg text-${model.color}-400">${model.icon}</span>
          <div class="flex flex-col items-start translate-y-[-1px]">
            <div class="flex items-center gap-2">
              <span class="text-xs font-black text-white uppercase tracking-widest leading-none">${model.label}</span>
              <span class="px-1.5 py-0.5 rounded-md bg-${tierColor}-500/10 border border-${tierColor}-500/20 text-[7px] font-black text-${tierColor}-400 uppercase tracking-tighter">${tierLabel}</span>
            </div>
            <span class="text-[9px] text-slate-400 font-medium tracking-wide mt-1 leading-none">${model.description}</span>
          </div>
        `;
        
        closeDropdown();
        SoundManager.play("tap");
      });
    });
  }

  // Auto-resize textarea
  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 128) + "px";
  });

  // Send on Enter (without Shift)
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  sendBtn.addEventListener("click", sendMessage);

  // File Upload Logic
  uploadBtn.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    currentFileName = file.name;
    fileNameDisplay.textContent = file.name;
    fileSizeDisplay.textContent = (file.size / 1024).toFixed(1) + " KB";
    
    // Reset states
    currentFileBase64 = null;
    currentFileText = null;
    filePreviewImg.classList.add("hidden");
    filePreviewDoc.classList.add("hidden");

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        currentFileBase64 = event.target.result;
        filePreviewImg.src = currentFileBase64;
        filePreviewImg.classList.remove("hidden");
        filePreviewContainer.classList.remove("hidden");
        SoundManager.play("tap");
      };
      reader.readAsDataURL(file);
    } else {
      filePreviewDoc.classList.remove("hidden");
      filePreviewContainer.classList.remove("hidden");
      SoundManager.play("tap");
      
      // Parse Document
      try {
        if (file.name.endsWith(".pdf")) {
          // Lazy load PDF.js only when needed
          if (!window.pdfjsLib) {
            await _loadScript('js/vendor/pdf.min.js');
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'js/vendor/pdf.worker.min.js';
          }
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          let fullText = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map(s => s.str).join(" ") + "\\n";
          }
          currentFileText = fullText;
        } else if (file.name.endsWith(".docx") || file.name.endsWith(".doc")) {
          // Lazy load Mammoth only when needed
          if (!window.mammoth) {
            await _loadScript('js/vendor/mammoth.browser.min.js');
          }
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          currentFileText = result.value;
        } else {
          // Fallback reading as plain text (txt, md, csv)
          const text = await file.text();
          currentFileText = text;
        }
      } catch (err) {
        console.error("Error parsing document:", err);
        addBubble("ai", "Erro ao ler o documento.", true);
        clearFile();
      }
    }
    e.target.value = ""; // Reset input
  });

  function clearFile() {
    currentFileBase64 = null;
    currentFileText = null;
    currentFileName = null;
    filePreviewImg.src = "";
    filePreviewContainer.classList.add("hidden");
  }

  fileRemoveBtn.addEventListener("click", () => {
    clearFile();
    SoundManager.play("tap");
  });

  async function sendMessage() {
    const text = input.value.trim();
    if ((!text && !currentFileBase64 && !currentFileText) || isSending) return;

    // Check usage again
    const usage = AIService.checkUsage();
    if (!usage.allowed) {
      if (usage.reason === "Upgrade") {
        App.router.navigate("/plans");
      } else {
        addBubble("ai", usage.reason, true);
      }
      return;
    }

    isSending = true;
    input.value = "";
    input.style.height = "auto";
    sendBtn.disabled = true;
    sendBtn.querySelector("span").textContent = "hourglass_top";

    // Capture file before clearing UI
    const imageToSend = currentFileBase64;
    const textToSend = currentFileText;
    const fileNameToSend = currentFileName;
    
    if (imageToSend || textToSend) {
      clearFile();
    }

    // Add user bubble
    addBubble("user", text, false, imageToSend, fileNameToSend);

    // Add typing indicator
    const typingEl = addTypingIndicator();

    try {
      // If we have extracted document text, append it to the prompt
      let finalPrompt = text;
      if (textToSend) {
        finalPrompt += "\\n\\n📄 [Conteúdo extraído do arquivo " + fileNameToSend + "]:\\n" + textToSend;
      }

      const response = await AIService.send(finalPrompt, activeModel, imageToSend);
      typingEl.remove();
      addBubble("ai", response);
      
      // Update usage counter for Básico
      const counter = page.querySelector("#ai-usage-counter");
      if (counter) {
        const newUsage = AIService.checkUsage();
        counter.textContent = `${newUsage.remaining || 0}/5`;
        if (newUsage.remaining <= 1) {
          counter.classList.add("text-red-400");
        }
      }
    } catch (error) {
      typingEl.remove();
      addBubble("ai", `⚠️ ${error.message}`, true);
    }

    isSending = false;
    sendBtn.disabled = false;
    sendBtn.querySelector("span").textContent = "send";
    SoundManager.play("tap");
  }

  function addBubble(role, text, isError = false, imageBase64 = null, fileName = null) {
    const wrapper = document.createElement("div");
    wrapper.className = `ai-msg-wrapper flex gap-3 ai-msg-enter ${role === "user" ? "flex-row-reverse" : ""}`;

    if (role === "ai") {
      const model = AIService.MODELS[activeModel];
      const iconColor = isError ? "text-red-400" : `text-${model?.color || "cyan"}-400`;
      const bgColor = isError ? "from-red-500/20 to-red-500/10" : `from-${model?.color || "cyan"}-500/20 to-emerald-500/20`;
      wrapper.innerHTML = `
        <div class="size-8 rounded-xl bg-gradient-to-br ${bgColor} flex items-center justify-center border border-white/10 shrink-0 mt-1">
          <span class="material-symbols-outlined ${iconColor} text-sm">${isError ? "warning" : model?.icon || "neurology"}</span>
        </div>
        <div class="ai-bubble glass-card ${isError ? "bg-red-500/5 border-red-500/20" : "bg-[#0f172a]/60 border-white/5"} rounded-2xl rounded-tl-md p-4 border max-w-[85%]">
          <div class="ai-content-parsed text-sm ${isError ? "text-red-300" : "text-slate-200"} leading-relaxed">
            ${isError ? escapeHtml(text) : (window.renderMD ? window.renderMD(text) : escapeHtml(text))}
          </div>
        </div>`;
    } else {
      wrapper.innerHTML = `
        <div class="user-bubble flex flex-col items-end gap-2 bg-gradient-to-br from-cyan-500/20 to-emerald-500/10 rounded-2xl rounded-tr-md p-4 border border-cyan-500/20 max-w-[85%] text-white text-sm">
          ${fileName && !imageBase64 ? `<div class="flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-2 rounded-lg border border-emerald-500/20 mb-1 w-full"><span class="material-symbols-outlined text-sm">description</span> <span class="truncate max-w-[150px]">${escapeHtml(fileName)}</span></div>` : ''}
          ${imageBase64 ? `<img src="${imageBase64}" class="w-full max-w-[200px] h-auto rounded-lg mb-1 border border-white/10">` : ''}
          ${text ? `<span>${escapeHtml(text)}</span>` : ''}
        </div>`;
    }

    chatArea.appendChild(wrapper);
    
    // Trigger MathJax if available
    if (window.typesetMath) {
      window.typesetMath(wrapper);
    }
    requestAnimationFrame(() => {
      chatArea.scrollTop = chatArea.scrollHeight;
    });
    return wrapper;
  }

  function addTypingIndicator() {
    const wrapper = document.createElement("div");
    wrapper.className = "ai-msg-wrapper flex gap-3 ai-msg-enter";
    wrapper.id = "ai-typing";
    const model = AIService.MODELS[activeModel];
    wrapper.innerHTML = `
      <div class="size-8 rounded-xl bg-gradient-to-br from-${model?.color || "cyan"}-500/20 to-emerald-500/20 flex items-center justify-center border border-white/10 shrink-0 mt-1">
        <span class="material-symbols-outlined text-${model?.color || "cyan"}-400 text-sm animate-pulse">${model?.icon || "neurology"}</span>
      </div>
      <div class="ai-bubble glass-card bg-[#0f172a]/60 rounded-2xl rounded-tl-md px-5 py-4 border border-white/5">
        <div class="ai-typing-dots flex gap-1.5">
          <span class="w-2 h-2 rounded-full bg-cyan-400/60 animate-bounce" style="animation-delay: 0ms"></span>
          <span class="w-2 h-2 rounded-full bg-cyan-400/60 animate-bounce" style="animation-delay: 150ms"></span>
          <span class="w-2 h-2 rounded-full bg-cyan-400/60 animate-bounce" style="animation-delay: 300ms"></span>
        </div>
      </div>`;
    chatArea.appendChild(wrapper);
    requestAnimationFrame(() => {
      chatArea.scrollTop = chatArea.scrollHeight;
    });
    return wrapper;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // Focus input on load
  requestAnimationFrame(() => input.focus());
};

// ── FLASHCARDS PAGE ──
Pages.flashcards = () => {
  const flashcards = APP_DATA.flashcards || [];
  const subjects = APP_DATA.subjects.filter(s => flashcards.some(f => f.subject === s.id));

  // Add Card Flip CSS
  if (!document.getElementById("flashcard-styles")) {
    const style = document.createElement("style");
    style.id = "flashcard-styles";
    style.textContent = `
      .flashcard-container { perspective: 1000px; width: 100%; aspect-ratio: 4/5; max-width: 420px; position: relative; margin: 0 auto; }
      .flashcard-inner { position: relative; width: 100%; height: 100%; transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1); transform-style: preserve-3d; cursor: pointer; }
      .flashcard-flipped .flashcard-inner { transform: rotateY(180deg); }
      .flashcard-front, .flashcard-back { position: absolute; width: 100%; height: 100%; -webkit-backface-visibility: hidden; backface-visibility: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2.5rem; border-radius: 3rem; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); text-align: center; }
      .flashcard-front { background: linear-gradient(135deg, #0f172a 0%, #020617 100%); color: white; }
      .flashcard-back { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white; transform: rotateY(180deg); }
    `;
    document.head.appendChild(style);
  }

  return `
  <header class="glass-header px-6 py-5 sticky top-0 z-50">
    <div class="flex items-center justify-between max-w-2xl mx-auto">
      <button onclick="Router.back()" class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-300 active:scale-90 transition-all">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
      <h1 class="text-sm font-black text-white uppercase tracking-widest text-center">Flashcards Plus+</h1>
      <div class="px-2 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
         <span class="text-[9px] font-black text-indigo-400 uppercase tracking-widest">PRO MODE</span>
      </div>
    </div>
  </header>

  <main id="flashcard-main" class="flex-1 scroll-area px-6 py-8 space-y-6 safe-bottom max-w-2xl mx-auto">
    <!-- Deck Selection -->
    <div id="deck-selection" class="space-y-6 animate-in">
      <div class="space-y-1">
        <h2 class="text-2xl font-black text-white tracking-tighter uppercase italic">Seus <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-400 not-italic">Decks</span></h2>
        <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest opacity-80">Repetição espaçada para memorização elite</p>
      </div>

      <div class="grid grid-cols-1 gap-4">
        ${subjects.map(s => {
          const count = flashcards.filter(f => f.subject === s.id).length;
          return `
          <div onclick="document.dispatchEvent(new CustomEvent('start-deck', { detail: '${s.id}' }))" class="glass-card bg-[#0f172a]/60 p-6 rounded-[32px] border border-white/5 flex items-center gap-5 active:scale-[0.98] transition-all cursor-pointer group">
            <div class="w-14 h-14 rounded-2xl bg-${s.color}-500/10 flex items-center justify-center border border-${s.color}-500/20 group-hover:scale-110 transition-transform">
              <span class="material-symbols-outlined text-${s.color}-400 text-3xl font-light">${s.icon}</span>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-black text-white leading-tight">${s.label}</h3>
              <p class="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">${count} Cartões Disponíveis</p>
            </div>
            <div class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span class="material-symbols-outlined text-slate-400">chevron_right</span>
            </div>
          </div>`;
        }).join("")}
      </div>

      <!-- Add New Card CTA -->
      <div class="p-8 rounded-[32px] border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center space-y-4 group hover:border-indigo-500/20 transition-colors cursor-pointer">
        <div class="size-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors">
          <span class="material-symbols-outlined text-3xl">add_circle</span>
        </div>
        <div>
          <h4 class="text-xs font-black text-white uppercase tracking-widest">Criar Novo Deck</h4>
          <p class="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-1">Personalize seu estudo Plus+</p>
        </div>
      </div>
    </div>

    <!-- Study View (Hidden initially) -->
    <div id="study-view" class="hidden flex-col items-center space-y-8 animate-in relative pt-4">
      <div class="w-full flex justify-between items-center mb-4">
         <div class="flex flex-col">
            <span id="study-subject-label" class="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">BIOLOGIA</span>
            <span id="study-progress-text" class="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Cartão 1 de 5</span>
         </div>
         <button id="exit-study" class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
            <span class="material-symbols-outlined text-lg">close</span>
         </button>
      </div>

      <!-- Progressive Bar -->
      <div class="w-full h-1.5 bg-white/5 rounded-full overflow-hidden p-[1px] mb-2">
         <div id="study-progress-bar" class="h-full bg-gradient-to-r from-indigo-500 to-indigo-500 rounded-full transition-all duration-700" style="width: 20%"></div>
      </div>

      <!-- The Card -->
      <div id="flashcard-box" class="flashcard-container group">
        <div class="flashcard-inner">
          <div class="flashcard-front">
             <div class="absolute top-6 left-6 opacity-20"><span class="material-symbols-outlined text-4xl">help</span></div>
             <p id="card-question" class="text-xl font-black leading-tight tracking-tight">Qual a função da Mitocôndria?</p>
             <div class="absolute bottom-10 flex flex-col items-center animate-bounce opacity-40">
                <span class="text-[8px] font-black uppercase tracking-[0.5em] mb-2">Toque para ver a resposta</span>
                <span class="material-symbols-outlined">expand_more</span>
             </div>
          </div>
          <div class="flashcard-back">
             <div class="absolute top-6 left-6 opacity-20"><span class="material-symbols-outlined text-4xl">inventory_2</span></div>
             <div class="w-full h-full overflow-y-auto no-scrollbar flex items-center justify-center py-8">
                <p id="card-answer" class="text-lg font-bold text-slate-200 leading-relaxed italic">Produção de energia através da respiração celular (ATP).</p>
             </div>
             <div class="absolute bottom-6 left-0 right-0 flex justify-center opacity-30">
                <span class="text-[8px] font-black uppercase tracking-[0.5em]">Toque para voltar</span>
             </div>
          </div>
        </div>
      </div>

      <!-- Rating Buttons (1 to 5) -->
      <div id="rating-controls" class="w-full grid grid-cols-5 gap-2 transition-all duration-500">
         <button data-rate="1" class="flex flex-col items-center justify-center py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 active:scale-90 transition-all">
            <span class="text-xl font-black text-emerald-400">1</span>
         </button>
         <button data-rate="2" class="flex flex-col items-center justify-center py-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 active:scale-90 transition-all">
            <span class="text-xl font-black text-cyan-400">2</span>
         </button>
         <button data-rate="3" class="flex flex-col items-center justify-center py-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 active:scale-90 transition-all">
            <span class="text-xl font-black text-amber-400">3</span>
         </button>
         <button data-rate="4" class="flex flex-col items-center justify-center py-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 active:scale-90 transition-all">
            <span class="text-xl font-black text-orange-400">4</span>
         </button>
         <button data-rate="5" class="flex flex-col items-center justify-center py-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 active:scale-90 transition-all">
            <span class="text-xl font-black text-rose-400">5</span>
         </button>
      </div>

      <!-- Floating Tooltip -->
      <p id="study-tip" class="text-[9px] text-slate-600 font-bold uppercase tracking-[0.3em] text-center opacity-60">Dica: Seja honesto consigo mesmo para otimizar o algoritmo.</p>
    </div>
  </main>`;
};

PageEvents.flashcards = (page) => {
  const deckSelection = page.querySelector("#deck-selection");
  const studyView = page.querySelector("#study-view");
  const flashcardBox = page.querySelector("#flashcard-box");
  const ratingControls = page.querySelector("#rating-controls");
  const exitBtn = page.querySelector("#exit-study");
  
  let currentDeck = [];
  let currentIndex = 0;

  document.addEventListener("start-deck", (e) => {
    const subjectId = e.detail;
    currentDeck = (APP_DATA.flashcards || []).filter(f => f.subject === subjectId);
    currentIndex = 0;
    
    if (currentDeck.length === 0) return;

    // UI Swaps
    deckSelection.classList.add("hidden");
    studyView.classList.remove("hidden");
    page.querySelector("#study-subject-label").textContent = subjectId.toUpperCase();
    
    showCard();
    SoundManager.play("tap");
  });

  function showCard() {
    const card = currentDeck[currentIndex];
    flashcardBox.classList.remove("flashcard-flipped");
    
    page.querySelector("#card-question").textContent = card.question;
    page.querySelector("#card-answer").textContent = card.answer;
    
    page.querySelector("#study-progress-text").textContent = `Cartão ${currentIndex + 1} de ${currentDeck.length}`;
    page.querySelector("#study-progress-bar").style.width = `${((currentIndex + 1) / currentDeck.length) * 100}%`;
  }

  flashcardBox.addEventListener("click", () => {
    const isFlipped = flashcardBox.classList.toggle("flashcard-flipped");
    if (isFlipped) {
      SoundManager.play("tap");
    }
  });

  // Swipe Gestures
  let touchStartX = 0;
  let touchEndX = 0;

  flashcardBox.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  flashcardBox.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    if (!flashcardBox.classList.contains("flashcard-flipped")) return; // Only swipe if flipped

    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
      // Swiped left (Hardest)
      triggerRating("5");
    } else if (touchEndX > touchStartX + swipeThreshold) {
      // Swiped right (Easiest)
      triggerRating("1");
    }
  }

  function triggerRating(val) {
    const targetBtn = page.querySelector(`#rating-controls button[data-rate="${val}"]`);
    if (targetBtn) targetBtn.click();
  }

  let stats = { facil: 0, medio: 0, dificil: 0 };

  page.querySelectorAll("#rating-controls button").forEach(btn => {
    btn.addEventListener("click", () => {
      SoundManager.play("success");
      
      const rating = parseInt(btn.dataset.rate);
      if (rating <= 2) stats.facil++;
      else if (rating === 3) stats.medio++;
      else stats.dificil++;

      // Update Index or Finish
      if (currentIndex < currentDeck.length - 1) {
        currentIndex++;
        showCard();
      } else {
        finishStudy();
      }
    });
  });

  function finishStudy() {
    App.showToast("Sessão finalizada! Seu cérebro foi otimizado. 🧠", "success");
    
    // Create Stats Modal Overlay
    const modalHtml = `
      <div id="flashcard-stats-modal" class="absolute inset-0 z-50 bg-[#020617]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-fade-in">
        <div class="relative w-full max-w-sm glass-card rounded-3xl p-8 text-center overflow-hidden shadow-2xl shadow-indigo-500/10 border border-indigo-500/20">
          <div class="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-500"></div>
          
          <div class="size-16 mx-auto rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 mb-6 relative">
            <span class="material-symbols-outlined text-4xl text-indigo-400">psychology</span>
            <div class="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
          </div>
          
          <h2 class="text-2xl font-black text-white uppercase tracking-tight mb-2">Sessão Concluída!</h2>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8 px-4 py-2 bg-white/5 rounded-full inline-block border border-white/5">Revisão Otimizada</p>

          <div class="grid grid-cols-3 gap-3 mb-8 text-left">
            <div class="bg-[#0f172a]/80 p-3 rounded-xl border border-emerald-500/20">
              <span class="material-symbols-outlined text-emerald-400 text-sm mb-1 block">sentiment_satisfied</span>
              <p class="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Fácil</p>
              <p class="text-xl font-black text-white">${stats.facil}</p>
            </div>
            <div class="bg-[#0f172a]/80 p-3 rounded-xl border border-amber-500/20">
              <span class="material-symbols-outlined text-amber-400 text-sm mb-1 block">sentiment_neutral</span>
              <p class="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Médio</p>
              <p class="text-xl font-black text-white">${stats.medio}</p>
            </div>
            <div class="bg-[#0f172a]/80 p-3 rounded-xl border border-rose-500/20">
              <span class="material-symbols-outlined text-rose-400 text-sm mb-1 block">sentiment_dissatisfied</span>
              <p class="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Difícil</p>
              <p class="text-xl font-black text-white">${stats.dificil}</p>
            </div>
          </div>

          <button id="close-stats-modal" class="w-full py-4 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            Voltar aos Decks
          </button>
        </div>
      </div>
    `;

    page.insertAdjacentHTML('beforeend', modalHtml);
    
    // Add event listener to new button
    page.querySelector('#close-stats-modal').addEventListener('click', () => {
      SoundManager.play("tap");
      const modal = page.querySelector('#flashcard-stats-modal');
      if (modal) modal.remove();
      
      // Reset state and views
      stats = { facil: 0, medio: 0, dificil: 0 };
      deckSelection.classList.remove("hidden");
      studyView.classList.add("hidden");
    });
  }

  exitBtn.addEventListener("click", () => {
    stats = { facil: 0, medio: 0, dificil: 0 }; // Reset
    deckSelection.classList.remove("hidden");
    studyView.classList.add("hidden");
  });
};

// ── RANKING PAGE (PLUS+) ──
Pages.ranking = () => {
  const players = APP_DATA.rankings || [];
  const leagues = APP_DATA.leagues || [];
  const userPlan = AppState.get("userPlan");
  const isPlus = userPlan === "plus";

  const userXp = AppState.get("xp") || 0;
  const currentLeague = APP_DATA.leagues.slice().reverse().find(l => userXp >= l.minXp) || APP_DATA.leagues[0];
  const nextLeagueIdx = APP_DATA.leagues.indexOf(currentLeague) + 1;
  const nextLeague = APP_DATA.leagues[nextLeagueIdx] || null;
  
  const xpInLeague = nextLeague ? userXp - currentLeague.minXp : userXp;
  const xpToNext = nextLeague ? nextLeague.minXp - currentLeague.minXp : 1000;
  const progressPercent = nextLeague ? Math.min(100, Math.max(5, (xpInLeague / xpToNext) * 100)) : 100;

  return `
  <div class="min-h-screen bg-[#020617] flex flex-col font-lexend relative overflow-hidden">
    <!-- Animated background elements -->
    <div class="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
    <div class="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full"></div>

    <header class="glass-header px-6 py-5 sticky top-0 z-50">
      <div class="flex items-center justify-between max-w-2xl mx-auto">
        <button onclick="Router.back()" class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-300 active:scale-90 transition-all">
          <span class="material-symbols-outlined text-xl">arrow_back</span>
        </button>
        <h1 class="text-xs font-black text-white uppercase tracking-[0.3em] text-center">Elite <span class="text-indigo-400">Leagues</span></h1>
        <div class="w-10"></div>
      </div>
    </header>

    <main class="flex-1 scroll-area p-6 space-y-8 safe-bottom max-w-2xl mx-auto w-full">
      <!-- League Status Card -->
      <section class="glass-card bg-gradient-to-br from-indigo-900/40 to-indigo-900/40 rounded-[32px] p-8 border border-indigo-500/20 shadow-2xl relative overflow-hidden animate-in">
        <div class="relative z-10 flex flex-col items-center text-center">
          <div class="size-20 rounded-[28px] bg-${currentLeague.color}-500/10 border border-${currentLeague.color}-500/30 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
            <span class="material-symbols-outlined text-5xl text-${currentLeague.color}-400 font-light">${currentLeague.icon}</span>
          </div>
          <h2 class="text-3xl font-black text-white uppercase tracking-tighter mb-1 italics">Liga <span class="text-${currentLeague.color}-400">${currentLeague.label}</span></h2>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 px-4 py-1.5 bg-white/5 rounded-full border border-white/5">Tempo Atual: Semanal (Faltam 2 dias)</p>
          
          <!-- Next League Progress -->
          <div class="w-full max-w-xs space-y-3">
            <div class="flex justify-between items-end">
              <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">${nextLeague ? `Progresso para ${nextLeague.label}` : 'Nível Máximo Atingido'}</span>
              <span class="text-[10px] font-black text-white leading-none">${userXp} / ${nextLeague ? nextLeague.minXp : '∞'} XP</span>
            </div>
            <div class="w-full h-2 bg-slate-950/50 rounded-full overflow-hidden p-[1px] border border-white/5">
              <div class="h-full bg-gradient-to-r from-${currentLeague.color}-500 to-indigo-500 rounded-full shadow-[0_0_12px_rgba(244,63,94,0.4)] transition-all duration-1000" style="width: ${progressPercent}%"></div>
            </div>
          </div>
        </div>
        <!-- BG Icon decor -->
        <span class="material-symbols-outlined absolute -right-6 -bottom-6 text-[140px] opacity-5 rotate-12 text-${currentLeague.color}-400 pointer-events-none">${currentLeague.icon}</span>
      </section>

      <!-- Exclusive Plus Features Banner -->
      ${!isPlus ? `
      <div onclick="Router.navigate('/premium')" class="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 p-5 rounded-3xl flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-all">
        <div class="size-12 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
          <span class="material-symbols-outlined text-amber-500">stars</span>
        </div>
        <div class="flex-1">
          <h4 class="text-xs font-black text-white uppercase tracking-widest">Torne-se Plus+</h4>
          <p class="text-[9px] text-slate-400 font-medium leading-relaxed">Ganhe o dobro de XP, badges exclusivos e acesso às ligas de elite.</p>
        </div>
        <span class="material-symbols-outlined text-slate-500">chevron_right</span>
      </div>
      ` : ''}

      <!-- Achievements Section (New) -->
      <div class="grid grid-cols-3 gap-3">
        <div class="glass-card bg-[#0f172a]/80 p-4 rounded-2xl border border-white/5 text-center flex flex-col items-center gap-2">
          <div class="size-10 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
            <span class="material-symbols-outlined text-amber-400 text-xl font-light">local_fire_department</span>
          </div>
          <div>
            <p class="text-[8px] font-black text-slate-500 uppercase tracking-widest">Sequência</p>
            <p class="text-xs font-black text-white">${AppState.get("missionProgress").m4 || 0} Dias</p>
          </div>
        </div>
        <div class="glass-card bg-[#0f172a]/80 p-4 rounded-2xl border border-white/5 text-center flex flex-col items-center gap-2 relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent"></div>
          <div class="size-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 relative z-10">
            <span class="material-symbols-outlined text-indigo-400 text-xl font-light">military_tech</span>
          </div>
          <div class="relative z-10">
            <p class="text-[8px] font-black text-slate-500 uppercase tracking-widest">Medalhas</p>
            <p class="text-xs font-black text-white">${Math.floor((AppState.get("totalQuestionsAnswered") || 0) / 10)} Ouro</p>
          </div>
        </div>
        <div class="glass-card bg-[#0f172a]/80 p-4 rounded-2xl border border-white/5 text-center flex flex-col items-center gap-2">
          <div class="size-10 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
            <span class="material-symbols-outlined text-cyan-400 text-xl font-light">psychology</span>
          </div>
          <div>
            <p class="text-[8px] font-black text-slate-500 uppercase tracking-widest">Precisão</p>
            <p class="text-xs font-black text-white">${(() => { const total = AppState.get("totalQuestionsAnswered") || 0; const correct = AppState.get("correctAnswers") || 0; return total > 0 ? Math.round((correct / total) * 100) : 0; })()}% CQ</p>
          </div>
        </div>
      </div>

      <!-- Leaderboard Header -->
      <div class="flex items-center justify-between px-2 pt-4">
        <h3 class="text-sm font-black text-white uppercase tracking-widest">Leaderboard Global</h3>
        <div class="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Ranking
        </div>
      </div>

      <!-- Ranking List -->
      <div class="space-y-3">
        ${players
          .map(p => p.isYou ? { ...p, xp: userXp } : p)
          .sort((a, b) => b.xp - a.xp)
          .map((p, i) => {
            const league = leagues.find(l => l.id === p.league) || leagues[0];
            const rankColor = i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-orange-400' : 'text-slate-500';
            const medalIcon = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
            
            return `
            <div class="glass-card ${p.isYou ? 'bg-indigo-500/10 border-indigo-500/30 shadow-lg shadow-indigo-500/5' : 'bg-[#0f172a]/60 border-white/5'} p-4 rounded-2xl flex items-center gap-4 transition-all group hover:border-white/20">
              <div class="w-8 text-center flex flex-col items-center">
                ${medalIcon ? `<span class="text-xl leading-none mb-1 drop-shadow-md">${medalIcon}</span>` : ''}
                <span class="text-xs font-black ${medalIcon ? 'text-slate-600' : rankColor}">${i + 1}</span>
              </div>
              
              <!-- Avatar -->
              <div class="size-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center relative overflow-hidden">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}" class="w-full h-full object-cover opacity-80" alt="Avatar"/>
                 ${p.isYou ? '<div class="absolute bottom-0 inset-x-0 h-1 bg-indigo-500"></div>' : ''}
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-0.5">
                  <span class="text-sm font-bold text-white truncate">${p.name} ${p.isYou ? '<span class="text-[8px] font-black text-indigo-400 uppercase tracking-widest ml-1">(VOCÊ)</span>' : ''}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-[10px] text-${league.color}-400 drop-shadow-[0_0_8px_currentColor]">${league.icon}</span>
                  <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">${league.label}</span>
                </div>
              </div>

              <div class="text-right">
                <p class="text-sm font-black text-emerald-400 leading-none">${p.xp}</p>
                <p class="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">XP TOTAL</p>
              </div>
            </div>
            `;
          }).join("")}
      </div>

      <!-- Motivation Callout -->
      <div class="p-8 text-center space-y-3 opacity-40">
        <p class="text-[9px] font-black text-slate-500 uppercase tracking-[0.5em]">O topo aguarda você, ${AppState.get("userName")}</p>
        <div class="flex justify-center gap-1">
          <span class="w-1 h-1 rounded-full bg-slate-700"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          <span class="w-1 h-1 rounded-full bg-slate-700"></span>
        </div>
      </div>
    </main>
  </div>`;
};

PageEvents.ranking = (page) => {
  // Add scroll listener for header glass effect if needed
};

// ── REDAÇÃO AI PAGE ──
Pages.redacaoAI = () => {
  const topics = [
    "O impacto da IA na educação brasileira",
    "Caminhos para combater a insegurança alimentar",
    "A importância da doação de órgãos no Brasil",
    "Desafios da saúde mental na era digital",
    "Mobilidade urbana e sustentabilidade"
  ];

  return `
  <header class="glass-header px-6 py-5 sticky top-0 z-50">
    <div class="flex items-center justify-between max-w-2xl mx-auto">
      <button onclick="Router.back()" class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-300 active:scale-90 transition-all">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
      <h1 class="text-sm font-black text-white uppercase tracking-widest text-center">Corretor de Redação</h1>
      <div class="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
         <span class="text-[9px] font-black text-emerald-400 uppercase tracking-widest">PLUS+ ACTIVE</span>
      </div>
    </div>
  </header>

  <main id="redacao-main" class="flex-1 scroll-area px-6 py-8 space-y-8 safe-bottom max-w-2xl mx-auto">
    <!-- Input View -->
    <div id="redacao-input-view" class="space-y-8 animate-in">
       <div class="space-y-2">
          <h2 class="text-3xl font-black text-white tracking-tighter uppercase italic line-clamp-2">Sua <span class="text-emerald-400 not-italic">Redação</span></h2>
          <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Feedback instantâneo seguindo os critérios do ENEM</p>
       </div>

       <!-- Topic Selection -->
       <div class="space-y-3">
          <p class="text-[10px] font-black text-slate-600 uppercase tracking-widest">Selecione o Tema</p>
          <div class="flex gap-2 overflow-x-auto no-scrollbar pb-1">
             ${topics.map(t => `
               <button class="topic-chip shrink-0 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold text-slate-400 whitespace-nowrap active:scale-95 transition-all">
                 ${t}
               </button>
             `).join("")}
             <button class="topic-chip shrink-0 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 whitespace-nowrap active:scale-95 transition-all">
               Tema Personalizado
             </button>
          </div>
       </div>

       <!-- Text Editor -->
       <div class="glass-card bg-[#0f172a]/60 p-6 rounded-[32px] border border-white/5 space-y-4">
          <div class="flex items-center justify-between">
             <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Rascunho Digital</span>
             <span id="char-count" class="text-[10px] font-black text-slate-600 uppercase tracking-widest">0 caracteres</span>
          </div>
          <textarea id="essay-text" placeholder="Cole ou digite sua redação aqui (mínimo 300 caracteres para uma análise precisa)..." 
                    class="w-full h-80 bg-transparent border-none text-slate-200 placeholder:text-slate-700 focus:ring-0 resize-none font-medium leading-relaxed"></textarea>
       </div>

       <button id="analyze-btn" class="w-full py-5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-3xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-2xl shadow-emerald-500/20 group">
          <span class="material-symbols-outlined text-white text-xl">psychology</span>
          <span class="text-xs font-black text-white uppercase tracking-[0.2em]">Solicitar Correção IA</span>
       </button>
    </div>

    <!-- Loading View -->
    <div id="redacao-loading" class="hidden flex flex-col items-center justify-center py-20 space-y-8 animate-in">
       <div class="relative w-24 h-24">
          <div class="absolute inset-0 rounded-full border-4 border-emerald-500/10"></div>
          <div class="absolute inset-0 rounded-full border-t-4 border-emerald-500 animate-spin"></div>
          <div class="absolute inset-0 flex items-center justify-center">
             <span class="material-symbols-outlined text-emerald-400 text-4xl animate-pulse">neurology</span>
          </div>
       </div>
       <div class="text-center space-y-2">
          <h3 class="text-xl font-black text-white uppercase italic tracking-tight">Analisando Criatividade...</h3>
          <p class="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">IA está verificando as 5 competências do ENEM</p>
       </div>
       <!-- Dynamic Progress Messages -->
       <div class="px-6 py-3 rounded-2xl bg-white/5 border border-white/5">
          <p id="loading-step" class="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Processando estrutura gramatical...</p>
       </div>
    </div>

    <!-- Result View -->
    <div id="redacao-result" class="hidden space-y-8 animate-in pb-10">
       <div class="glass-card rounded-[40px] p-10 bg-gradient-to-br from-emerald-500/10 to-indigo-500/10 border border-emerald-500/20 text-center relative overflow-hidden">
          <div class="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/20 blur-3xl"></div>
          <div class="relative z-10 space-y-2">
             <p class="text-xs font-black text-emerald-400 uppercase tracking-[0.5em]">Nota Final Estimada</p>
             <h2 id="final-score" class="text-8xl font-black text-white tracking-tighter">--</h2>
             <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/20">
                <span class="material-symbols-outlined text-emerald-400 text-sm">stars</span>
                <span class="text-[10px] font-black text-emerald-300 uppercase tracking-widest">Desempenho Elite</span>
             </div>
          </div>
       </div>

       <!-- Detailed Competencies -->
       <div id="competency-list" class="space-y-4">
          <!-- Dynamically filled -->
       </div>

       <div class="space-y-4">
          <h3 class="text-xs font-black text-white uppercase tracking-widest">Insights de Melhoria</h3>
          <div id="ai-feedback" class="glass-card p-6 rounded-3xl border border-white/5 text-slate-300 text-sm leading-relaxed space-y-4">
             <!-- Dynamically filled -->
          </div>
       </div>

       <button onclick="document.dispatchEvent(new Event('reset-redacao'))" class="w-full py-4 border border-white/5 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest active:scale-95 transition-all">
          Nova Redação
       </button>
    </div>
  </main>`;
};

PageEvents.redacaoAI = (page) => {
  const inputView = page.querySelector("#redacao-input-view");
  const loadingView = page.querySelector("#redacao-loading");
  const resultView = page.querySelector("#redacao-result");
  const textArea = page.querySelector("#essay-text");
  const charCount = page.querySelector("#char-count");
  const analyzeBtn = page.querySelector("#analyze-btn");
  const loadingStep = page.querySelector("#loading-step");

  const steps = [
    "Avaliando Norma Culta (C1)...",
    "Verificando Coesão Textual (C4)...",
    "Checando Argumentação (C3)...",
    "Analisando Proposta de Intervenção (C5)...",
    "Finalizando Relatório Pedagógico..."
  ];

  textArea.addEventListener("input", () => {
    charCount.textContent = `${textArea.value.length} caracteres`;
  });

  analyzeBtn.addEventListener("click", async () => {
    const text = textArea.value.trim();
    if (text.length < 100) {
      App.showToast("Sua redação precisa ser um pouco maior para uma análise justa!", "warning");
      return;
    }

    inputView.classList.add("hidden");
    loadingView.classList.remove("hidden");
    SoundManager.play("tap");

    // Safety timeout: unlock UI if API never responds (120s - enough for 2 model attempts)
    const safetyTimeout = setTimeout(() => {
      clearInterval(interval);
      loadingView.classList.add("hidden");
      inputView.classList.remove("hidden");
      App.showToast("Tempo esgotado. A IA demorou demais. Tente novamente.", "error");
    }, 120000);

    // Cycle through steps
    let stepIdx = 0;
    const interval = setInterval(() => {
      loadingStep.textContent = steps[stepIdx];
      stepIdx = (stepIdx + 1) % steps.length;
    }, 2000);

    try {
      const prompt = `Analise a seguinte redação no estilo ENEM. Dê uma nota de 0 a 1000 e avalie cada uma das 5 competências (C1 a C5). IMPORTANTE: Retorne APENAS o JSON, sem explicações ou texto extra. Formato obrigatório:\n{"nota": 880, "competencias": [{"c": "C1", "nota": 160, "feedback": "..."}, {"c": "C2", "nota": 160, "feedback": "..."}, {"c": "C3", "nota": 160, "feedback": "..."}, {"c": "C4", "nota": 160, "feedback": "..."}, {"c": "C5", "nota": 160, "feedback": "..."}], "melhoria": "..."}.\n\nTexto: ${text}`;
      
      const responseText = await AIService.sendDirect(prompt);
      
      // Robust JSON extraction: find the first { } block in the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("A IA não retornou um JSON válido. Tente novamente.");
      
      const data = JSON.parse(jsonMatch[0]);
      
      // Validate structure
      if (!data.nota || !Array.isArray(data.competencias)) {
        throw new Error("Resposta incompleta da IA. Tente novamente.");
      }

      clearInterval(interval);
      clearTimeout(safetyTimeout);
      showResult(data);
    } catch (err) {
      clearInterval(interval);
      clearTimeout(safetyTimeout);
      console.error("[Redação AI]", err);
      loadingView.classList.add("hidden");
      inputView.classList.remove("hidden");
      App.showToast(`Erro: ${err.message || "Tente novamente em instantes."}`, "error");
    }
  });

  function showResult(data) {
    loadingView.classList.add("hidden");
    resultView.classList.remove("hidden");
    SoundManager.play("success");

    page.querySelector("#final-score").textContent = data.nota;
    
    const compList = page.querySelector("#competency-list");
    compList.innerHTML = data.competencias.map(c => `
      <div class="glass-card p-5 rounded-3xl border border-white/5 space-y-2">
         <div class="flex justify-between items-center">
            <span class="text-xs font-black text-white uppercase tracking-widest">${c.c}</span>
            <span class="text-sm font-black text-emerald-400">${c.nota}/200</span>
         </div>
         <p class="text-[11px] text-slate-500 leading-relaxed">${c.feedback}</p>
         <div class="h-1 bg-white/5 rounded-full overflow-hidden">
            <div class="h-full bg-emerald-500" style="width: ${(c.nota / 200) * 100}%"></div>
         </div>
      </div>
    `).join("");

    page.querySelector("#ai-feedback").innerHTML = `
      <div class="flex items-center gap-2 mb-2">
        <span class="material-symbols-outlined text-emerald-400 text-sm">tips_and_updates</span>
        <h4 class="text-[10px] font-black text-white uppercase tracking-widest">Conselho do Mentor</h4>
      </div>
      <p>${data.melhoria}</p>
    `;

    document.getElementById("redacao-main").scrollTop = 0;
  }

  document.addEventListener("reset-redacao", () => {
    resultView.classList.add("hidden");
    inputView.classList.remove("hidden");
    textArea.value = "";
    charCount.textContent = "0 caracteres";
  });
};

// ── PAGE NAME ALIASES ──
// Routes use hyphenated names (e.g. /redacao-ai) but JS properties use camelCase.
// showPage() looks up Pages[name], so we need aliases for hyphenated names.
Pages["redacao-ai"] = Pages.redacaoAI;
PageEvents["redacao-ai"] = PageEvents.redacaoAI;
Pages["ia-tutor"] = Pages["ia-tutor"] || null; // Already defined with bracket notation

// ── SIMULADO RUNNER ──
let simuladoState = {
  questions: [],
  currentIndex: 0,
  score: 0,
  timeLeft: 25 * 60, // 25 minutes
  timerInterval: null,
  answeredCurrent: false
};

Pages["simulado-runner"] = (params) => {
  const type = params && params.type ? decodeURIComponent(params.type) : "Geral";
  
  return `
    <div class="fixed inset-0 bg-slate-950 z-50 flex flex-col" id="simulado-runner-container">
      
      <!-- Header -->
      <header class="glass-header px-4 py-4 shrink-0 flex items-center justify-between">
        <button onclick="Router.back()" class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-300">
          <span class="material-symbols-outlined">close</span>
        </button>
        <div class="flex flex-col items-center">
          <h1 class="text-sm font-bold text-white uppercase tracking-wider">${type}</h1>
          <div class="text-[10px] text-slate-400 font-medium tracking-widest mt-0.5 w-[80px] text-center" id="simulado-timer">
            25:00
          </div>
        </div>
        <div class="w-10"></div> <!-- Spacer -->
      </header>

      <!-- Progress Bar -->
      <div class="w-full h-1 bg-white/5 shrink-0">
        <div id="simulado-progress" class="h-full bg-blue-500 transition-all duration-300" style="width: 0%"></div>
      </div>

      <!-- Main Content Container -->
      <main class="flex-1 overflow-y-auto pb-32 pt-6 px-4" id="simulado-content-area">
        
        <!-- Loading State -->
        <div id="simulado-loading" class="flex flex-col items-center justify-center h-full gap-4">
          <div class="w-12 h-12 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin"></div>
          <p class="text-slate-400 font-medium text-sm animate-pulse">Pesquisando as melhores questões para você...</p>
        </div>

        <!-- Question View (Hidden initially) -->
        <div id="simulado-question-view" class="hidden flex flex-col gap-6 max-w-2xl mx-auto block h-full">
           
           <div class="flex justify-between items-center px-1">
             <div class="flex items-center gap-3">
               <span class="text-slate-400 font-medium text-xs tracking-widest uppercase">Questão <span id="simulado-q-num" class="text-white">1</span> de <span id="simulado-q-total">10</span></span>
               <span id="simulado-usage-badge" class="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-500 text-[9px] font-bold uppercase tracking-wider"></span>
             </div>
             <span id="simulado-difficulty" class="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300"></span>
           </div>

           <!-- Statement -->
           <div class="bg-white/5 rounded-3xl p-6 border border-white/10 shadow-xl relative overflow-hidden shrink-0">
             <div class="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[40px] rounded-full -mr-16 -mt-16"></div>
             <p id="simulado-statement" class="text-slate-200 text-base leading-relaxed relative z-10 font-medium"></p>
             <img id="simulado-image" class="hidden mt-4 rounded-xl border border-white/10 max-h-[200px] object-scale-down mx-auto w-full bg-slate-900" src="" alt="Questão imagem"/>
           </div>

           <!-- Options -->
           <div id="simulado-options" class="flex flex-col gap-3 pb-8 shrink-0">
             <!-- Options generated dynamically -->
           </div>

           <!-- Feedback / Resolution (Hidden initially) -->
           <div id="simulado-feedback" class="hidden flex flex-col gap-4 mt-2 mb-8 animate-[slideUp_0.3s_ease-out]">
             <div class="px-6 py-5 rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-md relative overflow-hidden">
               <div id="feedback-glow" class="absolute top-0 right-0 w-32 h-32 blur-[40px] rounded-full -mr-16 -mt-16"></div>
               <h3 id="feedback-title" class="text-sm font-bold flex items-center gap-2 mb-2 relative z-10 flex text-emerald-400">
                  <span class="material-symbols-outlined text-lg">check_circle</span> Resposta Correta
               </h3>
               <p id="feedback-resolution" class="text-slate-300 text-sm leading-relaxed relative z-10"></p>
             </div>
             
             <button id="simulado-next-btn" class="w-full py-5 bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-blue-500/20">
                <span>Próxima Questão</span>
                <span class="material-symbols-outlined">arrow_forward</span>
             </button>
           </div>
        </div>

        <!-- End Screen -->
        <div id="simulado-end-view" class="hidden flex flex-col items-center justify-center h-full gap-8 max-w-md mx-auto py-10">
           <div class="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(99,102,241,0.4)]">
             <span class="material-symbols-outlined text-white text-5xl">emoji_events</span>
           </div>
           
           <div class="text-center">
             <h2 class="text-2xl font-black text-white mb-2">Simulado Concluído</h2>
             <p class="text-slate-400 uppercase tracking-widest text-xs font-semibold">TIPO: ${type}</p>
           </div>

           <div class="bg-white/5 rounded-3xl p-8 border border-white/10 w-full flex flex-col items-center">
             <span class="text-slate-400 text-xs uppercase tracking-widest mb-2 font-bold">Sua Pontuação</span>
             <div class="flex items-baseline gap-1">
               <span id="simulado-final-score" class="text-6xl font-black text-white">0</span>
               <span class="text-2xl font-bold text-slate-500">/<span id="simulado-final-total">10</span></span>
             </div>
           </div>

           <button onclick="Router.navigate('/simulados')" class="w-full py-5 bg-white text-slate-900 font-black text-sm uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-white/10 mt-4">
              <span>Voltar aos Simulados</span>
           </button>
        </div>

      </main>
    </div>
  `;
};

PageEvents["simulado-runner"] = async (page, params) => {
  const type = params && params.type ? decodeURIComponent(params.type) : "Geral";
  let currentUser = null;
  
  try {
    const client = Supabase.getClient();
    if (client) {
        const { data: authData } = await client.auth.getUser();
        currentUser = authData ? authData.user : null;
    }
  } catch (e) {
    console.warn("Auth check failed.", e);
  }

  // View Elements
  const loadingView = document.getElementById("simulado-loading");
  const questionView = document.getElementById("simulado-question-view");
  const endView = document.getElementById("simulado-end-view");

  // 1. Daily Limit Check (Blocking Moment: Antes!)
  const plan = AppState.get("userPlan") || "gratis";
  const planInfo = APP_DATA.plans[plan];
  const dailyLimit = planInfo ? planInfo.dailyLimit : 30;
  const answeredToday = AppState.get("questionsAnsweredToday") || 0;

  if (answeredToday >= dailyLimit) {
    loadingView.innerHTML = `
      <div class="flex flex-col items-center justify-center min-h-[400px] text-center px-6 animate-in fade-in zoom-in duration-500">
        <div class="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-6 border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
          <span class="material-symbols-outlined text-amber-500 text-4xl">block</span>
        </div>
        <h2 class="text-xl font-black text-white mb-2">Limite Diário Atingido</h2>
        <p class="text-slate-400 text-sm mb-8 leading-relaxed">
          Você já respondeu <span class="text-white font-bold">${answeredToday}</span> questões hoje. <br/>
          Seu plano atual <span class="text-blue-400 font-bold">(${planInfo.name})</span> permite até <span class="text-white font-bold">${dailyLimit}</span> por dia.
        </p>
        
        <div class="w-full flex flex-col gap-3">
          <button onclick="Router.navigate('/premium')" class="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all">Assinar Plus+ p/ 500/dia</button>
          <button onclick="Router.back()" class="w-full py-4 bg-slate-800 text-slate-300 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-700 transition-colors">Voltar mais tarde</button>
        </div>
      </div>
    `;
    return;
  }
  
  // Question Elements
  const stmEl = document.getElementById("simulado-statement");
  const imgEl = document.getElementById("simulado-image");
  const optsEl = document.getElementById("simulado-options");
  const numEl = document.getElementById("simulado-q-num");
  const diffEl = document.getElementById("simulado-difficulty");
  const pBar = document.getElementById("simulado-progress");
  
  // Feedback Elements
  const fbBox = document.getElementById("simulado-feedback");
  const fbTitle = document.getElementById("feedback-title");
  const fbRes = document.getElementById("feedback-resolution");
  const fbGlow = document.getElementById("feedback-glow");
  const nextBtn = document.getElementById("simulado-next-btn");
  
  // Timer Elements
  const timerEl = document.getElementById("simulado-timer");

  // State Reset (Attach to window for global access/debugging)
  const customTime = params && params.time ? parseInt(params.time) : 25;
  
  window.simuladoState = {
    questions: [],
    currentIndex: 0,
    score: 0,
    timeLeft: customTime * 60,
    timerInterval: null,
    answeredCurrent: false
  };
  const simuladoState = window.simuladoState;

  // Set initial timer display
  if (timerEl) {
    const mm = String(customTime).padStart(2, '0');
    timerEl.textContent = `${mm}:00`;
  }

  // --- Functions ---
  
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    clearInterval(simuladoState.timerInterval);
    timerEl.textContent = formatTime(simuladoState.timeLeft);
    simuladoState.timerInterval = setInterval(() => {
      simuladoState.timeLeft--;
      if (simuladoState.timeLeft <= 0) {
        clearInterval(simuladoState.timerInterval);
        simuladoState.timeLeft = 0;
        finishSimulado();
      }
      timerEl.textContent = formatTime(simuladoState.timeLeft);
      if (simuladoState.timeLeft <= 300) { // last 5 mins
        timerEl.classList.add("text-red-500", "animate-pulse");
      }
    }, 1000);
  };

  const finishSimulado = async () => {
    clearInterval(simuladoState.timerInterval);
    questionView.classList.add("hidden");
    endView.classList.remove("hidden");
    pBar.style.width = "100%";
    
    document.getElementById("simulado-final-score").textContent = simuladoState.score;
    const finalTotalEl = document.getElementById("simulado-final-total");
    if (finalTotalEl) finalTotalEl.textContent = simuladoState.questions.length;

    // Save to DB
    if (currentUser) {
      await Supabase.saveSimuladoHistory(currentUser.id, type, simuladoState.score, simuladoState.questions.length);
    }
  };

  const loadQuestion = () => {
    fbBox.classList.add("hidden");
    simuladoState.answeredCurrent = false;
    
    if (simuladoState.currentIndex >= simuladoState.questions.length) {
      finishSimulado();
      return;
    }

    const q = simuladoState.questions[simuladoState.currentIndex];
    
    const totalQ = simuladoState.questions.length;
    if (numEl) numEl.textContent = simuladoState.currentIndex + 1;

    // Refresh usage badge
    const usageBadge = document.getElementById("simulado-usage-badge");
    if (usageBadge) {
      const plan = AppState.get("userPlan") || "gratis";
      const planInfo = APP_DATA.plans[plan];
      const limit = planInfo ? planInfo.dailyLimit : 30;
      const current = AppState.get("questionsAnsweredToday") || 0;
      usageBadge.textContent = `HOJE: ${current}/${limit}`;
    }

    const totalEl = document.getElementById("simulado-q-total");
    if (totalEl) totalEl.textContent = totalQ;
    pBar.style.width = `${(simuladoState.currentIndex / Math.max(1, totalQ)) * 100}%`;
    diffEl.textContent = q.difficulty || "Médio";
    
    // Exam Header for Authentic "Test Sheet" Feel
    const categoryName = q.type === 'ENEM' ? 'ENEM' : (q.type === 'VESTIBULAR' ? 'VESTIBULAR' : 'CONCURSO');
    const subjectMap = {
        'rlm': 'Raciocínio Lógico',
        'direito': 'Direito e Ética',
        'portugues': 'Português',
        'matematica': 'Matemática',
        'fisica': 'Física',
        'quimica': 'Química',
        'biologia': 'Biologia',
        'historia': 'História',
        'geografia': 'Geografia'
    };
    const sName = subjectMap[q.subject] || (q.subject ? q.subject.charAt(0).toUpperCase() + q.subject.slice(1) : 'Geral');
    
    const headerHtml = `
      <div class="mb-8 flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-700">
        <span class="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-[0.2em]">Questão ${simuladoState.currentIndex + 1}</span>
        <span class="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">${categoryName} ${q.year ? '• ' + q.year : ''}</span>
        <span class="px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-[0.2em]">${sName}</span>
      </div>
    `;

    // Process question text to remove any remaining pedagogical artifacts and style it
    let cleanText = (q.text || q.statement || "");
    stmEl.innerHTML = headerHtml + `<div class="text-slate-200 leading-relaxed text-base font-medium exam-text-style">${renderMD(cleanText)}</div>`;
    typesetMath(stmEl);
    
    if (q.image_url) {
      imgEl.src = q.image_url;
      imgEl.classList.remove("hidden");
    } else {
      imgEl.classList.add("hidden");
    }

    optsEl.innerHTML = "";
    
    // Parse options if stringified
    let opts = q.options;
    if (typeof opts === 'string') {
      try { opts = JSON.parse(opts); } catch(e) { opts = []; }
    }
    
    if (Array.isArray(opts)) {
      opts.forEach((optText, i) => {
        const btn = document.createElement("button");
        btn.className = "w-full text-left bg-slate-900 border border-white/5 hover:border-slate-700 p-5 rounded-2xl text-slate-300 font-medium text-sm transition-all shadow-md flex items-start gap-4 active:scale-[0.98]";
        
        const letter = String.fromCharCode(65 + i);
        btn.innerHTML = `
          <div class="w-8 h-8 rounded-full bg-white/5 border border-white/10 shrink-0 flex items-center justify-center text-xs font-bold text-slate-400 group-hover:bg-blue-500/10 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-colors">${letter}</div>
          <div class="pt-1">${renderMDInline(optText)}</div>
        `;
        
        btn.onclick = () => handleAnswer(i, btn, opts);
        optsEl.appendChild(btn);
      });
      typesetMath(optsEl);
    }

    document.getElementById("simulado-content-area").scrollTop = 0;
  };

  const handleAnswer = (selectedIndex, buttonEl, options) => {
    if (simuladoState.answeredCurrent) return;
    simuladoState.answeredCurrent = true;
    
    const q = simuladoState.questions[simuladoState.currentIndex];
    // Support both 'correct_option' (API) and 'correct' (local/Legacy)
    const correctIdx = (typeof q.correct_option !== 'undefined') ? q.correct_option : 
                       (typeof q.correct !== 'undefined') ? q.correct : 0;
    
    const isCorrect = (selectedIndex === correctIdx);
    
    console.log(`[Simulado] Q#${simuladoState.currentIndex+1} - Selected: ${selectedIndex}, Correct: ${correctIdx}, Status: ${isCorrect ? 'OK' : 'FAIL'}`);
    
    if (isCorrect) simuladoState.score++;

    // Increment daily tracking (Qualquer tentativa conta)
    const todayCount = AppState.get("questionsAnsweredToday") || 0;
    AppState.set("questionsAnsweredToday", todayCount + 1);
    
    // Increment total count
    const totalCount = AppState.get("totalQuestionsAnswered") || 0;
    AppState.set("totalQuestionsAnswered", totalCount + 1);
    
    // Save state update
    AppState.saveToCloud();

    // Mark all buttons
    Array.from(optsEl.children).forEach((btn, i) => {
      btn.onclick = null; // Remove listener
      const isThisCorrect = (i === correctIdx);
      
      if (isThisCorrect) {
        btn.className = "w-full text-left bg-emerald-950/40 border border-emerald-500 p-5 rounded-2xl text-emerald-100 font-medium text-sm transition-all shadow-md flex items-start gap-4";
        btn.firstElementChild.className = "w-8 h-8 rounded-full bg-emerald-500 shrink-0 flex items-center justify-center text-xs font-bold text-white";
      } else if (i === selectedIndex && !isCorrect) {
        btn.className = "w-full text-left bg-red-950/40 border border-red-500 p-5 rounded-2xl text-red-100 font-medium text-sm transition-all shadow-md flex items-start gap-4";
        btn.firstElementChild.className = "w-8 h-8 rounded-full bg-red-500 shrink-0 flex items-center justify-center text-xs font-bold text-white";
        btn.firstElementChild.innerHTML = '<span class="material-symbols-outlined text-[16px]">close</span>';
      } else {
        btn.className = "w-full text-left bg-slate-900 border border-white/5 p-5 rounded-2xl text-slate-500 font-medium text-sm transition-all shadow-md flex items-start gap-4 opacity-50";
      }
    });

    if (isCorrect) {
      if(buttonEl) buttonEl.firstElementChild.innerHTML = '<span class="material-symbols-outlined text-[16px]">check</span>';
      SoundManager.play("success");
      fbTitle.innerHTML = '<span class="material-symbols-outlined text-lg">check_circle</span> Resposta Correta';
      fbTitle.className = "text-sm font-bold flex items-center gap-2 mb-2 relative z-10 text-emerald-400";
      fbGlow.className = "absolute top-0 right-0 w-32 h-32 blur-[40px] rounded-full -mr-16 -mt-16 bg-emerald-500/20";
    } else {
      SoundManager.play("error");
      fbTitle.innerHTML = '<span class="material-symbols-outlined text-lg">cancel</span> Resposta Incorreta';
      fbTitle.className = "text-sm font-bold flex items-center gap-2 mb-2 relative z-10 text-red-400";
      fbGlow.className = "absolute top-0 right-0 w-32 h-32 blur-[40px] rounded-full -mr-16 -mt-16 bg-red-500/20";
    }

    fbRes.innerHTML = renderMD(q.explanation || q.resolution || "Sem resolução adicional para esta questão.");
    typesetMath(fbRes);
    fbBox.classList.remove("hidden");
    
    // Auto-scroll to show feedback + keep "Próxima Questão" button visible
    setTimeout(() => {
      fbBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setTimeout(() => {
        nextBtn.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 350);
    }, 100);

    // Update next button text if last question
    if (simuladoState.currentIndex >= simuladoState.questions.length - 1) {
      nextBtn.firstElementChild.textContent = "Finalizar Simulado";
      nextBtn.lastElementChild.textContent = "done_all";
    } else {
      nextBtn.firstElementChild.textContent = "Próxima Questão";
      nextBtn.lastElementChild.textContent = "arrow_forward";
    }
  };

  nextBtn.onclick = () => {
    simuladoState.currentIndex++;
    loadQuestion();
  };

  // --- Start Flow ---
  loadingView.classList.remove("hidden");
  questionView.classList.add("hidden");

  // Allow back button to cancel the quiz and clear interval
  const originalBack = Router.back;
  Router.back = (fallback) => {
      clearInterval(simuladoState.timerInterval);
      Router.back = originalBack;
      originalBack.call(Router, fallback);
  };

  try {
      if (type === "Random") {
        const category = params && params.category ? decodeURIComponent(params.category) : "ENEM";
        let allowedSubjects = null;
        if (params && params.subjects) {
          try {
            allowedSubjects = JSON.parse(decodeURIComponent(params.subjects));
          } catch(e) { console.error("Error parsing subjects:", e); }
        }
        simuladoState.questions = await Supabase.getRandomSimuladoByDistribution([3, 4, 3], category, allowedSubjects);
      } else if (type === "Custom") {
        const configStr = params && params.config ? decodeURIComponent(params.config) : "";
        let configObj = {};
        
        if (configStr) {
          configStr.split('|').forEach(pair => {
            const [id, count] = pair.split(':');
            if (id && count) configObj[id] = parseInt(count);
          });
        }
        
        simuladoState.questions = await Supabase.getCustomSimulado(configObj);
      } else {
        simuladoState.questions = await Supabase.getQuestionsForSimulado(type, 10);
      }
      
      // If not enough or errored
      if (!simuladoState.questions || simuladoState.questions.length === 0) {
        loadingView.innerHTML = `
          <div class="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400"><span class="material-symbols-outlined">sentiment_dissatisfied</span></div>
          <p class="text-slate-300 font-medium">Nenhuma questão encontrada para este simulado.</p>
          <button onclick="Router.back()" class="mt-6 px-6 py-3 bg-slate-800 rounded-xl font-bold text-sm text-white">Voltar</button>
        `;
        return;
      }

      // Load first question
      loadingView.classList.add("hidden");
      questionView.classList.remove("hidden");
      
      startTimer();
      loadQuestion();
  } catch (err) {
      console.error(err);
      loadingView.innerHTML = `
          <div class="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mb-4 text-red-500"><span class="material-symbols-outlined">error</span></div>
          <p class="text-red-400 font-medium text-center">Ocorreu um erro ao carregar as questões.</p>
          <p class="text-slate-500 text-xs mt-2">${err.message}</p>
          <button onclick="Router.back()" class="mt-6 px-6 py-3 bg-slate-800 rounded-xl font-bold text-sm text-white">Voltar</button>
      `;
  }
};
