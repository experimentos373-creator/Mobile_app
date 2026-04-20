// ============================================================
// EduHub Brasil - Data Layer
// All mock data, professors, videos, questions, subjects
// ============================================================

const APP_DATA = {
  // ── Professors & YouTube Channels ──
  professors: {
    matematica: [
      { name: "Prof. Ferretto", channel: "https://www.youtube.com/@ProfessorFerretto", specialty: "Matemática para ENEM e vestibulares", avatar: "https://yt3.googleusercontent.com/ytc/AIdro_lSEg5EYXE2BdETrWTg8D2ZicLn-UEH9TP-0EB3Cz_X8Q=s176" },
      { name: "Matemática Rio", channel: "https://www.youtube.com/@MatematicaRio", specialty: "Explicações simples e focadas", avatar: "https://yt3.googleusercontent.com/ytc/AIdro_nPjSMKFLYUAVBe1N1p2e5c0V-9K0JG6Z2l0k_Ib-OwZg=s176" },
      { name: "Equaciona", channel: "https://www.youtube.com/@equacionacompaulopereira", specialty: "Resolução de exercícios ENEM", avatar: "https://yt3.googleusercontent.com/ytc/AIdro_ne2z2z2z2z2z2z2z2z2z=s176" }
    ],
    fisica: [
      { name: "Física Total", channel: "https://www.youtube.com/@FisicaTotal", specialty: "Aulas completas para ENEM", avatar: "" },
      { name: "Universo Narrado", channel: "https://www.youtube.com/@UniversoNarrado", specialty: "Física e matemática profundas", avatar: "" }
    ],
    quimica: [
      { name: "Café com Química", channel: "https://www.youtube.com/@CafeComQuimica", specialty: "Explicações claras", avatar: "" },
      { name: "Química do Monstro", channel: "https://www.youtube.com/@QuimicadoMonstro", specialty: "Aulas práticas e diretas", avatar: "" }
    ],
    biologia: [
      { name: "Prof. Jubilut", channel: "https://www.youtube.com/@BiologiaTotal", specialty: "Biologia Total para ENEM", avatar: "" },
      { name: "Samuel Cunha", channel: "https://www.youtube.com/@SamuelCunhaBio", specialty: "Explicações claras e organizadas", avatar: "" }
    ],
    portugues: [
      { name: "Prof. Noslen", channel: "https://www.youtube.com/@ProfessorNoslen", specialty: "Gramática e interpretação", avatar: "" },
      { name: "Português com Letícia", channel: "https://www.youtube.com/@PortuguescomLeticia", specialty: "Português para concursos", avatar: "" }
    ],
    historia: [
      { name: "Parabólica História", channel: "https://www.youtube.com/@ParabolicaHistoria", specialty: "História para vestibulares", avatar: "" },
      { name: "Se Liga Nessa História", channel: "https://www.youtube.com/@SeLigaNessaHistoria", specialty: "História dinâmica", avatar: "" }
    ],
    geografia: [
      { name: "Prof. Ricardo Marcílio", channel: "https://www.youtube.com/@RicardoMarcilio", specialty: "Geografia e atualidades", avatar: "" }
    ],
    redacao: [
      { name: "Profinho da Redação", channel: "https://www.youtube.com/@profinho", specialty: "Redação (Modelos e Estratégia)", avatar: "" },
      { name: "Felipe Araujo", channel: "https://www.youtube.com/@felipearaujooficial", specialty: "Redação e Modelos Prontos", avatar: "" }
    ],
    geral: [
      { name: "Pedro Assaad", channel: "https://www.youtube.com/@PedroAssaad", specialty: "Dicas de Estudo e Cronograma", avatar: "" },
      { name: "Método Questiona", channel: "https://www.youtube.com/@MetodoQuestiona", specialty: "Estratégia de Prova", avatar: "" }
    ]
  },

  // ── Video Recommendations ──
  videos: [
    { id: "v1", title: "Logaritmos: Propriedades Fundamentais", professor: "Prof. Ferretto", subject: "matematica", subjectLabel: "Matemática", topic: "Funções", difficulty: "media", duration: "15:00", durationMin: 15, views: "12k", thumbnail: "https://i.ytimg.com/vi_webp/esdFuyG7zGs/mqdefault.webp", youtubeUrl: "https://www.youtube.com/watch?v=esdFuyG7zGs" },
    { id: "v2", title: "Estequiometria: Do Básico ao Avançado", professor: "Café com Química", subject: "quimica", subjectLabel: "Química", topic: "Estequiometria", difficulty: "dificil", duration: "22:45", durationMin: 22, views: "8.5k", thumbnail: "https://i.ytimg.com/vi_webp/FV_hXHh3vNg/mqdefault.webp", youtubeUrl: "https://www.youtube.com/watch?v=FV_hXHh3vNg" },
    { id: "v3", title: "Análise Sintática: Sujeito e Predicado", professor: "Prof. Noslen", subject: "portugues", subjectLabel: "Português", topic: "Gramática", difficulty: "facil", duration: "12:10", durationMin: 12, views: "25k", thumbnail: "https://i.ytimg.com/vi_webp/ZR_Ou01WsK0/mqdefault.webp", youtubeUrl: "https://www.youtube.com/watch?v=ZR_Ou01WsK0" },
    { id: "v4", title: "Citologia: Membrana Plasmática e Organelas", professor: "Prof. Jubilut", subject: "biologia", subjectLabel: "Biologia", topic: "Citologia", difficulty: "media", duration: "20:30", durationMin: 20, views: "18k", thumbnail: "https://i.ytimg.com/vi_webp/yaiEgmOboq0/mqdefault.webp", youtubeUrl: "https://www.youtube.com/watch?v=yaiEgmOboq0" },
    { id: "v5", title: "Geometria Espacial: Prismas e Cilindros", professor: "Prof. Ferretto", subject: "matematica", subjectLabel: "Matemática", topic: "Geometria", difficulty: "media", duration: "18:42", durationMin: 18, views: "15k", thumbnail: "https://i.ytimg.com/vi_webp/n_ahun94Wgw/mqdefault.webp", youtubeUrl: "https://www.youtube.com/watch?v=n_ahun94Wgw" },
    { id: "v6", title: "Leis de Newton: Resumo Completo", professor: "Física Total", subject: "fisica", subjectLabel: "Física", topic: "Mecânica", difficulty: "media", duration: "25:10", durationMin: 25, views: "10k", thumbnail: "https://i.ytimg.com/vi_webp/yhIL_numOX0/mqdefault.webp", youtubeUrl: "https://www.youtube.com/watch?v=yhIL_numOX0" },
    { id: "v7", title: "Revolução Francesa: Aula Completa", professor: "Prof. Walter Solla", subject: "historia", subjectLabel: "História", topic: "Idade Moderna", difficulty: "facil", duration: "16:30", durationMin: 16, views: "20k", thumbnail: "https://i.ytimg.com/vi_webp/j9ysbOLC7xU/mqdefault.webp", youtubeUrl: "https://www.youtube.com/watch?v=j9ysbOLC7xU" },
    { id: "v8", title: "Climas do Brasil para o ENEM", professor: "Geografia Irada", subject: "geografia", subjectLabel: "Geografia", topic: "Climatologia", difficulty: "facil", duration: "14:20", durationMin: 14, views: "9k", thumbnail: "https://i.ytimg.com/vi_webp/KeV-hfTNu7M/mqdefault.webp", youtubeUrl: "https://www.youtube.com/watch?v=KeV-hfTNu7M" },
    { id: "v9", title: "O QUE MAIS CAI NO ENEM? (ATUALIZADO 2024)", professor: "Método Questiona", subject: "geral", subjectLabel: "Estratégia", topic: "Revisão", difficulty: "media", duration: "18:00", durationMin: 18, views: "45k", thumbnail: "https://i.ytimg.com/vi_webp/mTH0nkO3PVI/mqdefault.webp", youtubeUrl: "https://www.youtube.com/watch?v=mTH0nkO3PVI", isPro: true },
    { id: "v10", title: "REVISÃO COMPLETA PARA O ENEM", professor: "Professor Boaro", subject: "fisica", subjectLabel: "Física", topic: "Física", difficulty: "dificil", duration: "45:00", durationMin: 45, views: "120k", thumbnail: "https://i.ytimg.com/vi_webp/sxaQIgacrWw/mqdefault.webp", youtubeUrl: "https://www.youtube.com/watch?v=sxaQIgacrWw" },
    { id: "v11", title: "Macetes de MATEMÁTICA p/ ENEM!", professor: "Marcos Vasconcellos", subject: "matematica", subjectLabel: "Matemática", topic: "Cálculo", difficulty: "facil", duration: "12:30", durationMin: 12, views: "88k", thumbnail: "https://i.ytimg.com/vi_webp/d8N1udiLwLk/mqdefault.webp", youtubeUrl: "https://www.youtube.com/watch?v=d8N1udiLwLk" },
    { id: "v12", title: "COMO USAR O TRI E PASSAR NO ENEM", professor: "Prof. Ferretto", subject: "matematica", subjectLabel: "Matemática", topic: "TRI", difficulty: "media", duration: "22:15", durationMin: 22, views: "200k", thumbnail: "https://i.ytimg.com/vi_webp/VD3SQnsnS2c/mqdefault.webp", youtubeUrl: "https://www.youtube.com/watch?v=VD3SQnsnS2c" },
    { id: "v13", title: "REVISÃO DE REDAÇÃO PARA O ENEM 2025", professor: "Débora Aladim", subject: "redacao", subjectLabel: "Redação", topic: "Escrita", difficulty: "facil", duration: "25:40", durationMin: 25, views: "350k", thumbnail: "https://i.ytimg.com/vi_webp/vzl2yMcI0Mo/mqdefault.webp", youtubeUrl: "https://www.youtube.com/watch?v=vzl2yMcI0Mo", isPro: true },
    { id: "v14", title: "TUDO de LITERATURA pro ENEM 2026", professor: "Pedro Assaad", subject: "portugues", subjectLabel: "Português", topic: "Literatura", difficulty: "media", duration: "32:00", durationMin: 32, views: "15k", thumbnail: "https://i.ytimg.com/vi_webp/23SV4BxZesU/mqdefault.webp", youtubeUrl: "https://www.youtube.com/watch?v=23SV4BxZesU", isPro: true },
    { id: "v15", title: "O melhor ARGUMENTO para a redação", professor: "Profinho", subject: "redacao", subjectLabel: "Redação", topic: "Argumentação", difficulty: "media", duration: "14:20", durationMin: 14, views: "92k", thumbnail: "https://i.ytimg.com/vi_webp/n5hd1R647pk/mqdefault.webp", youtubeUrl: "https://www.youtube.com/watch?v=n5hd1R647pk", isPro: true },
    { id: "v16", title: "SUPER REVISÃO ENEM 2024 NATUREZA", professor: "Samuel Cunha", subject: "biologia", subjectLabel: "Biologia", topic: "Natureza", difficulty: "dificil", duration: "58:00", durationMin: 58, views: "150k", thumbnail: "https://i.ytimg.com/vi_webp/fjwZFfC6FHE/mqdefault.webp", youtubeUrl: "https://www.youtube.com/watch?v=fjwZFfC6FHE" },
    { id: "v17", title: "Estratégia Simples pra melhorar seu TRI", professor: "Bruno de Paula", subject: "matematica", subjectLabel: "Matemática", topic: "TRI", difficulty: "facil", duration: "10:15", durationMin: 10, views: "30k", thumbnail: "https://i.ytimg.com/vi_webp/j_vZ_FuZPd0/mqdefault.webp", youtubeUrl: "https://www.youtube.com/watch?v=j_vZ_FuZPd0" },
    { id: "v18", title: "O que mais cai no ENEM", professor: "Felipe Araujo", subject: "geral", subjectLabel: "Estratégia", topic: "Cronograma", difficulty: "facil", duration: "20:00", durationMin: 20, views: "110k", thumbnail: "https://i.ytimg.com/vi_webp/hso4HtZ-5zE/mqdefault.webp", youtubeUrl: "https://www.youtube.com/watch?v=hso4HtZ-5zE", isPro: true }
  ],

  // ── Subjects ──
  subjects: [
    { id: "matematica", label: "Matemática", icon: "calculate", color: "blue", progress: 0, modules: 20, completed: 0 },
    { id: "fisica", label: "Física", icon: "bolt", color: "purple", progress: 0, modules: 15, completed: 0 },
    { id: "quimica", label: "Química", icon: "science", color: "teal", progress: 0, modules: 12, completed: 0 },
    { id: "biologia", label: "Biologia", icon: "biotech", color: "green", progress: 0, modules: 18, completed: 0 },
    { id: "portugues", label: "Português", icon: "menu_book", color: "amber", progress: 0, modules: 14, completed: 0 },
    { id: "historia", label: "História", icon: "history", color: "red", progress: 0, modules: 16, completed: 0 },
    { id: "geografia", label: "Geografia", icon: "public", color: "cyan", progress: 0, modules: 10, completed: 0 },
    { id: "geral", label: "Estratégia", icon: "auto_awesome", color: "indigo", progress: 0, modules: 5, completed: 0 }
  ],

  // ── Simulados ──
  simulados: [
    { id: "s1", title: "Simulado ENEM 2024 - Linguagens", questions: 45, duration: "5h 30min", type: "ENEM", locked: false, completed: false, score: null },
    { id: "s2", title: "Simulado ENEM 2024 - Matemática", questions: 45, duration: "5h 30min", type: "ENEM", locked: false, completed: false, score: null },
    { id: "s3", title: "Simulado ENEM 2024 - Ciências da Natureza", questions: 45, duration: "5h 30min", type: "ENEM", locked: false, completed: false, score: null },
    { id: "s4", title: "Simulado Fuvest 2024 - 1ª Fase", questions: 90, duration: "5h", type: "Vestibular", locked: false, completed: false, score: null },
    { id: "s5", title: "Prova Concurso Público - Nível Médio", questions: 60, duration: "4h", type: "Concurso", locked: false, completed: false, score: null },
    { id: "s6", title: "Simulado ENEM 2023 - Ciências Humanas", questions: 45, duration: "5h 30min", type: "ENEM", locked: false, completed: false, score: null }
  ],


  plans: {
    gratis: { 
      name: "Plano Grátis", 
      priceLabel: "Grátis", 
      dailyLimit: 30,
      aiDailyLimit: 5,
      features: ["30 questões por dia", "Estatísticas básicas", "Acesso a vídeos públicos"] 
    },
    basico: { 
      name: "Básico",
      monthly: { price: "R$ 19,90", original: "R$ 29,90", discount: "33" },
      semestral: { price: "R$ 79,60", original: "R$ 179", discount: "55" },
      dailyLimit: 100,
      aiDailyLimit: 15,
      features: ["100 questões por dia", "Domínio por Área", "Suporte prioritário"] 
    },
    pro: { 
      name: "Pro",
      monthly: { price: "R$ 49,90", original: "R$ 89,90", discount: "45" },
      semestral: { price: "R$ 199,60", original: "R$ 539", discount: "63" },
      dailyLimit: 300,
      aiDailyLimit: 50,
      features: ["300 questões por dia", "Simulados mensais", "Análise de erros", "Materiais em PDF"] 
    },
    plus: { 
      name: "Plus+",
      monthly: { price: "R$ 64,90", original: "R$ 149,90", discount: "57" },
      semestral: { price: "R$ 259,60", original: "R$ 899", discount: "71" },
      dailyLimit: 500,
      aiDailyLimit: 100,
      features: ["500 questões por dia", "Mentor IA Personalizado", "Ligas exclusivas", "Estatísticas Avançadas"] 
    }
  },

  // ── Weekly Missions ──
  missions: [
    { id: "m1", title: "Foco Total", desc: "Estude por 30 minutos hoje", goal: 30, unit: "min", type: "study_time", xp: 40, icon: "timer" },
    { id: "m2", title: "Mestre das Questões", desc: "Acerte 5 questões no banco", goal: 5, unit: "acertos", type: "correct_answers", xp: 60, icon: "quiz" },
    { id: "m3", title: "Simulado em Dia", desc: "Complete 1 simulado qualquer", goal: 1, unit: "simulado", type: "simulados_completed", xp: 150, icon: "history_edu" },
    { id: "m4", title: "Ritmo Elite", desc: "Estude por 5 dias seguidos", goal: 5, unit: "dias", type: "streak", xp: 450, icon: "workspace_premium" }
  ],

  // ── ENEM Date ──
  enemDate: new Date("2026-10-25T13:00:00-03:00"),

  // ── Flashcards Plus+ ──
  flashcards: [
    // Biologia
    { id: "fc1", subject: "biologia", question: "Qual a função da Mitocôndria?", answer: "Respiração celular e produção de ATP.", level: "facil", nextReview: null },
    { id: "fc2", subject: "biologia", question: "O que é a Parede Celular?", answer: "Estrutura rígida externa à membrana plasmática (plantas/fungos).", level: "media", nextReview: null },
    { id: "fc3", subject: "biologia", question: "O que define o Dogma Central da Biologia?", answer: "Fluxo de informação: DNA -> RNA -> Proteína.", level: "media", nextReview: null },
    { id: "fc4", subject: "biologia", question: "Função dos Ribossomos?", answer: "Síntese de proteínas.", level: "facil", nextReview: null },
    { id: "fc5", subject: "biologia", question: "O que são seres Procariontes?", answer: "Seres sem núcleo celular definido (ex: bactérias).", level: "facil", nextReview: null },

    // Matemática
    { id: "fc6", subject: "matematica", question: "Fórmula da Área do Círculo?", answer: "A = π * r²", level: "facil", nextReview: null },
    { id: "fc7", subject: "matematica", question: "O que é um Logaritmo?", answer: "O expoente ao qual a base deve ser elevada para obter o número.", level: "dificil", nextReview: null },
    { id: "fc8", subject: "matematica", question: "Teorema de Pitágoras?", answer: "a² = b² + c² (em triângulos retângulos).", level: "facil", nextReview: null },
    { id: "fc9", subject: "matematica", question: "Fórmula de Bhaskara (Delta)?", answer: "Δ = b² - 4ac", level: "facil", nextReview: null },
    { id: "fc10", subject: "matematica", question: "Soma dos ângulos internos de um triângulo?", answer: "180 graus.", level: "facil", nextReview: null },

    // História
    { id: "fc11", subject: "historia", question: "Quando foi a Revolução Francesa?", answer: "1789.", level: "facil", nextReview: null },
    { id: "fc12", subject: "historia", question: "O que foi a Queda do Muro de Berlim?", answer: "Símbolo do fim da Guerra Fria em 1989.", level: "media", nextReview: null },
    { id: "fc13", subject: "historia", question: "Quem proclamou a República no Brasil?", answer: "Marechal Deodoro da Fonseca (1889).", level: "media", nextReview: null },
    { id: "fc14", subject: "historia", question: "O que foi o Tratado de Tordesilhas?", answer: "Divisão de terras entre Portugal e Espanha (1494).", level: "facil", nextReview: null },
    { id: "fc15", subject: "historia", question: "Principal característica da Era Vargas?", answer: "Centralização do poder e criação de leis trabalhistas.", level: "media", nextReview: null },

    // Física
    { id: "fc16", subject: "fisica", question: "2ª Lei de Newton (Fórmula)?", answer: "F = m * a", level: "facil", nextReview: null },
    { id: "fc17", subject: "fisica", question: "O que é Calorimetria?", answer: "Estudo da troca de energia térmica (calor) entre corpos.", level: "media", nextReview: null },
    { id: "fc18", subject: "fisica", question: "Velocidade da Luz no vácuo?", answer: "Aproximadamente 300.000 km/s.", level: "facil", nextReview: null },
    { id: "fc19", subject: "fisica", question: "Fórmula da Energia Cinética?", answer: "Ec = (m * v²) / 2", level: "media", nextReview: null },
    { id: "fc20", subject: "fisica", question: "O que diz a Lei de Ohm?", answer: "V = R * I (Tensão = Resistência * Corrente).", level: "facil", nextReview: null },

    // Química
    { id: "fc21", subject: "quimica", question: "O que é uma ligação Covalente?", answer: "Compartilhamento de elétrons entre átomos.", level: "media", nextReview: null },
    { id: "fc22", subject: "quimica", question: "Qual o pH de uma solução neutra?", answer: "7.", level: "facil", nextReview: null },
    { id: "fc23", subject: "quimica", question: "O que é Tabela Periódica?", answer: "Organização dos elementos por número atômico crescente.", level: "facil", nextReview: null },
    { id: "fc24", subject: "quimica", question: "Lei de Lavoisier?", answer: "Na natureza nada se cria, nada se perde, tudo se transforma.", level: "facil", nextReview: null },
    { id: "fc25", subject: "quimica", question: "O que são Isótopos?", answer: "Átomos do mesmo elemento com massas diferentes (nêutrons).", level: "media", nextReview: null },

    // Geografia
    { id: "fc26", subject: "geografia", question: "Maior bioma do Brasil?", answer: "Amazônia.", level: "facil", nextReview: null },
    { id: "fc27", subject: "geografia", question: "O que é o El Niño?", answer: "Aquecimento anormal das águas do Oceano Pacífico.", level: "media", nextReview: null },
    { id: "fc28", subject: "geografia", question: "Capital do Brasil?", answer: "Brasília.", level: "facil", nextReview: null },
    { id: "fc29", subject: "geografia", question: "O que define a Globalização?", answer: "Integração econômica, política e cultural mundial.", level: "media", nextReview: null },
    { id: "fc30", subject: "geografia", question: "Principal fonte de energia do Brasil?", answer: "Hidrelétrica.", level: "facil", nextReview: null },

    // Português
    { id: "fc31", subject: "portugues", question: "O que é um Substantivo?", answer: "Classe de palavras que nomeia seres, objetos e lugares.", level: "facil", nextReview: null },
    { id: "fc32", subject: "portugues", question: "Figura de linguagem: Metáfora?", answer: "Comparação implícita sem o termo 'como'.", level: "media", nextReview: null },
    { id: "fc33", subject: "portugues", question: "Função da Crase?", answer: "Junção da preposição 'a' com o artigo 'a'.", level: "facil", nextReview: null },
    { id: "fc34", subject: "portugues", question: "O que é um Ditongo?", answer: "Encontro de uma vogal e uma semivogal na mesma sílaba.", level: "media", nextReview: null },
    { id: "fc35", subject: "portugues", question: "Conjunção Coordenativa Adversativa?", answer: "Exemplos: Mas, porém, contudo, todavia.", level: "media", nextReview: null }
  ],

  // ── Exclusive Leagues & Ranking (Plus+) ──
  rankings: [
    { id: 1, name: "Ana Beatriz", xp: 12450, league: "diamante", avatar: "AB", isYou: false },
    { id: 2, name: "Marcos Oliveira", xp: 11200, league: "diamante", avatar: "MO", isYou: false },
    { id: 3, name: "Carla Silva", xp: 9800, league: "diamante", avatar: "CS", isYou: false },
    { id: 4, name: "Lucas Mendes", xp: 8500, league: "rubi", avatar: "LM", isYou: false },
    { id: 5, name: "Mariana Costa", xp: 7200, league: "rubi", avatar: "MC", isYou: false },
    { id: 6, name: "Gabriel", xp: 0, league: "quartzo", avatar: "G", isYou: true }, // Current User
    { id: 7, name: "Rafael Souza", xp: 4100, league: "esmeralda", avatar: "RS", isYou: false },
    { id: 8, name: "Beatriz Lima", xp: 3800, league: "esmeralda", avatar: "BL", isYou: false },
    { id: 9, name: "Henrique Rocha", xp: 2500, league: "ametista", avatar: "HR", isYou: false },
    { id: 10, name: "Julia Pereira", xp: 1200, league: "ametista", avatar: "JP", isYou: false }
  ],

  leagues: [
    { id: "quartzo", label: "Quartzo", color: "slate", icon: "diamond", minXp: 0 },
    { id: "ametista", label: "Ametista", color: "purple", icon: "auto_awesome", minXp: 500 },
    { id: "esmeralda", label: "Esmeralda", color: "emerald", icon: "pentagon", minXp: 1500 },
    { id: "rubi", label: "Rubi", color: "rose", icon: "favorite", minXp: 3000 },
    { id: "diamante", label: "Diamante", color: "cyan", icon: "verified", minXp: 5000 }
  ]
};

// ============================================================
// State Management (localStorage-based)
// ============================================================
const AppState = {
  _defaults: {
    onboardingDone: false,
    userName: "",
    userEmail: "",
    userAge: "",
    userPlan: "gratis", // gratis, pro, plus
    darkMode: true,
    studyGoal: "enem", // enem, concurso, medio
    targetExam: "ENEM", // Specific exam name
    examDate: "2026-11-01", // Custom exam date
    difficultSubject: "matematica",
    studyCommitment: "2h",
    mainDifficulty: "foco", // foco, inicio, erros, disciplina
    favoriteSubjects: [],
    questionsAnsweredToday: 0,
    totalQuestionsAnswered: 0,
    correctAnswers: 0,
    studyTimeMinutes: 0,
    restTimeMinutes: 0, // [NOVO] Acumulado de descanso do Pomodoro
    pomodoroStudyMin: 25,
    pomodoroLongBreak: 15,
    weeklyStudyData: [0, 0, 0, 0, 0, 0, 0], // Sun-Sat in minutes
    subjectAccuracy: {},
    missionProgress: { m1: 0, m2: 0, m3: 0, m4: 0 },
    completedSimulados: [], // [NOVO] Histórico de simulados do usuário
    hasUsedFreePredictor: false,
    aiDailyUsage: 0,
    aiDailyUsageDate: "",
    lastActivityDate: "" // Rastreio de reset diário
  },

  get(key) {
    const stored = localStorage.getItem("eduhub_" + key);
    if (stored !== null) {
      try { return JSON.parse(stored); } catch { return stored; }
    }
    return this._defaults[key];
  },

  set(key, value) {
    localStorage.setItem("eduhub_" + key, JSON.stringify(value));
  },

  reset() {
    Object.keys(this._defaults).forEach(k => localStorage.removeItem("eduhub_" + k));
  },

  // [NEW] Migration Engine: Normaliza dados antigos para as novas versões da App
  migrate() {
    const version = localStorage.getItem("eduhub_state_version") || "1";
    
    // Configurações de Totais para migrar acurácia numérica
    const SUBJECT_TOTALS = { matematica: 104, geografia: 91, biologia: 87, historia: 85, fisica: 84, portugues: 79, quimica: 60 };

    if (version < "3") {
      console.log("[AppState] Executando Migração v3...");
      
      // 1. Normalizar subjectAccuracy (Número -> Objeto)
      const acc = this.get("subjectAccuracy") || {};
      const newAcc = {};
      Object.keys(acc).forEach(id => {
        const val = acc[id];
        if (typeof val === 'number') {
          const total = SUBJECT_TOTALS[id] || 50;
          newAcc[id] = { correct: Math.round((val / 100) * total), total: total };
        } else {
          newAcc[id] = val;
        }
      });
      this.set("subjectAccuracy", newAcc);

      // 2. Garantir weeklyStudyData compatível
      const weekly = this.get("weeklyStudyData");
      if (!Array.isArray(weekly) || weekly.length !== 7) {
        this.set("weeklyStudyData", [0, 0, 0, 0, 0, 0, 0]);
      }

      localStorage.setItem("eduhub_state_version", "3");
    }
  },

  normalize(field, value) {
    if (field === "userPlan") {
      const raw = String(value || "").trim().toLowerCase();
      if (raw === "gratis") return "gratis";
      if (raw === "basico" || raw === "básico" || raw === "basic") return "basico";
      if (raw === "pro") return "pro";
      if (raw === "plus" || raw === "plus+" || raw === "premium") return "plus";
      return this._defaults.userPlan;
    }

    if (field === 'subjectAccuracy' && typeof value === 'object') {
      // Garante que se vier do cloud algo quebrado, a gente arruma
      const SUBJECT_TOTALS = { matematica: 104, geografia: 91, biologia: 87, historia: 85, fisica: 84, portugues: 79, quimica: 60 };
      const newAcc = {};
      Object.keys(value).forEach(id => {
        const entry = value[id];
        if (typeof entry === 'number') {
          const total = SUBJECT_TOTALS[id] || 50;
          newAcc[id] = { correct: Math.round((entry / 100) * total), total: total };
        } else {
          newAcc[id] = entry;
        }
      });
      return newAcc;
    }
    return value;
  },


  async syncFull() {
    const syncMeta = {
      hasSession: false,
      profileExists: false,
      hasExplicitOnboardingDone: false,
      resolvedOnboardingDone: false
    };

    if (typeof Supabase === "undefined" || !Supabase.getClient()) return syncMeta;
    try {
      const { data: { session } } = await Supabase.getClient().auth.getSession();
      if (session && session.user) {
        syncMeta.hasSession = true;
        const profile = await Supabase.getProfile(session.user.id);
        if (profile) {
          syncMeta.profileExists = true;
          const metadata = session.user.user_metadata || {};
          const getCloudValue = (...keys) => {
            for (const key of keys) {
              if (profile[key] !== undefined && profile[key] !== null) {
                return profile[key];
              }
            }
            return undefined;
          };

          const cloudUserName = String(
            getCloudValue("userName", "user_name") ??
              metadata.full_name ??
              metadata.name ??
              metadata.given_name ??
              ""
          ).trim();
          const cloudUserAge = String(getCloudValue("userAge", "user_age") ?? "").trim();
          const localUserName = String(this.get("userName") || "").trim();
          const localUserAge = String(this.get("userAge") || "").trim();
          const resolvedUserName = cloudUserName || localUserName;
          const resolvedUserAge = cloudUserAge || localUserAge;
          const cloudOnboardingDone = getCloudValue("onboardingDone", "onboarding_done");
          syncMeta.hasExplicitOnboardingDone = typeof cloudOnboardingDone === "boolean";

          // Deterministic onboarding status across devices:
          // 1) explicit cloud flag wins; 2) otherwise infer from profile completeness.
          const resolvedOnboardingDone =
            typeof cloudOnboardingDone === "boolean"
              ? cloudOnboardingDone
              : Boolean(resolvedUserName && resolvedUserAge);
          syncMeta.resolvedOnboardingDone = resolvedOnboardingDone;

          this.set("userEmail", String(session.user.email || "").trim());
          this.set("userName", resolvedUserName);
          this.set("userAge", resolvedUserAge);
          this.set("onboardingDone", resolvedOnboardingDone);

          // Merge remaining cloud state (strict mode for non-auth identity fields).
          const fields = [
            "userPlan", "studyGoal", "targetExam", 
            "totalQuestionsAnswered", "correctAnswers", "studyTimeMinutes", "restTimeMinutes",
            "hasUsedFreePredictor", "subjectAccuracy", "missionProgress", "weeklyStudyData"
          ];
          
          fields.forEach(field => {
            const cloudValue = profile[field] !== undefined && profile[field] !== null
              ? profile[field]
              : getCloudValue(field);

            if (cloudValue !== undefined && cloudValue !== null) {
              const normalizedValue = this.normalize(field, cloudValue);
              this.set(field, normalizedValue);
            }
          });
          
          this.migrate(); // Run any final local migrations

          // Sync Simulado History
          const history = await Supabase.getSimuladoHistory(session.user.id);
          if (history && history.length > 0) {
              const formattedHistory = history.map(h => ({
                  type: h.simulado_type,
                  score: h.score,
                  total: h.total_questions,
                  date: h.completed_at
              }));
              this.set("completedSimulados", formattedHistory);
          } else {
              // If cloud history is empty, ensure local is also empty
              this.set("completedSimulados", []);
          }
        } else {
          const hadMeaningfulLocalState =
            Boolean(String(this.get("userName") || "").trim()) ||
            Boolean(String(this.get("userAge") || "").trim()) ||
            Boolean(this.get("onboardingDone")) ||
            Number(this.get("totalQuestionsAnswered") || 0) > 0;

          // New cloud account/profile: reset stale local state from previous users on this device.
          if (!hadMeaningfulLocalState) {
            Object.entries(this._defaults).forEach(([key, defaultValue]) => {
              this.set(key, defaultValue);
            });
          }

          const metadata = session.user.user_metadata || {};
          const inferredName = String(
            metadata.full_name || metadata.name || metadata.given_name || ""
          ).trim();

          this.set("userEmail", String(session.user.email || "").trim());
          if (inferredName || !String(this.get("userName") || "").trim()) {
            this.set("userName", inferredName);
          }
          if (!String(this.get("userAge") || "").trim()) {
            this.set("userAge", "");
          }

          const localOnboardingDone = Boolean(this.get("onboardingDone"));
          this.set("onboardingDone", localOnboardingDone);
          syncMeta.resolvedOnboardingDone = localOnboardingDone;

          // Save a clean baseline profile to cloud (no carry-over from old local sessions).
          await this.saveToCloud();
        }
      }
    } catch (e) {
      console.warn("Failed to sync Full AppState from Supabase:", e);
    }

    return syncMeta;
  },

  async saveToCloud() {
    if (typeof Supabase === "undefined" || !Supabase.getClient()) return Promise.resolve();
    try {
      const { data: { session } } = await Supabase.getClient().auth.getSession();
      if (session && session.user) {
        // Save critical state that defines restrictions
        // Save FULL app state (excluding sensitive/local-only keys)
        await Supabase.saveProfile(session.user.id, {
          userName: this.get("userName"),
          userAge: this.get("userAge"),
          userPlan: this.get("userPlan"),
          onboardingDone: this.get("onboardingDone"),
          studyGoal: this.get("studyGoal"),
          targetExam: this.get("targetExam"),
          totalQuestionsAnswered: this.get("totalQuestionsAnswered"),
          correctAnswers: this.get("correctAnswers"),
          studyTimeMinutes: this.get("studyTimeMinutes"),
          restTimeMinutes: this.get("restTimeMinutes"),
          hasUsedFreePredictor: this.get("hasUsedFreePredictor"),
          subjectAccuracy: this.get("subjectAccuracy"),
          missionProgress: this.get("missionProgress"),
          weeklyStudyData: this.get("weeklyStudyData")
        });
      }
    } catch (e) {
      console.warn("Failed to save AppState to Supabase:", e);
    }
  }
};
