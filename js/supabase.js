/**
 * EduHub Brasil - Supabase Configuration & Client
 * Centralizes all cloud database and auth interactions.
 */

const SupabaseConfig = {
    URL: "https://tixfiukvvyokgaxflxdr.supabase.co", 
    ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpeGZpdWt2dnlva2dheGZseGRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MDYxNTEsImV4cCI6MjA4OTI4MjE1MX0.0FpUCJaH7LE47roOp1tStdhqZDCTyT2dQBeo33W9uCw"
};

// Initialize Supabase Client (lazy loaded once keys are available)
let supabaseClient = null;

const Supabase = {
    getClient() {
        if (!SupabaseConfig.URL || !SupabaseConfig.ANON_KEY) {
            console.warn("Supabase keys are missing. Cloud sync disabled.");
            return null;
        }
        if (!supabaseClient) {
            supabaseClient = supabase.createClient(SupabaseConfig.URL, SupabaseConfig.ANON_KEY);
        }
        return supabaseClient;
    },

    async signIn(email, password) {
        const client = this.getClient();
        if (!client) return { error: { message: "Conexão não configurada." } };
        return await client.auth.signInWithPassword({ email, password });
    },

    async signInWithGoogle() {
        const client = this.getClient();
        if (!client) return { error: { message: "Conexão não configurada." } };

        // Use the correct app URL depending on environment
        const isProd = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
        const redirectTo = isProd
            ? 'https://mobileapp-taupe.vercel.app/'
            : window.location.origin + '/index.html';

        return await client.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo
            }
        });
    },

    async signUp(email, password, metadata) {
        const client = this.getClient();
        if (!client) return { error: { message: "Conexão não configurada." } };
        return await client.auth.signUp({
            email,
            password,
            options: { data: metadata }
        });
    },

    async signOut() {
        const client = this.getClient();
        if (client) await client.auth.signOut();
    },

    async saveProfile(userId, profileData) {
        const client = this.getClient();
        if (!client) return;
        const { error } = await client
            .from('profiles')
            .upsert({ id: userId, ...profileData, updated_at: new Date() });
        if (error) console.error("Error saving profile:", error);
    },

    async getProfile(userId) {
        const client = this.getClient();
        if (!client) return null;
        const { data, error } = await client
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (error) {
            console.error("Error fetching profile:", error);
            return null;
        }
        return data;
    },

    // --- SIMULADOS API ---
    async getQuestionsForSimulado(subjectFilter = null, limit = 10) {
        const client = this.getClient();
        if (!client) return [];

        let query = client.from('questions').select('*').limit(100);
        
        // Handle categories as 'type' and subjects as 'subject'
        const categories = ['ENEM', 'Vestibular', 'Concurso', 'VESTIBULAR', 'CONCURSO'];
        if (subjectFilter) {
            if (categories.includes(subjectFilter)) {
                query = query.eq('type', subjectFilter.toUpperCase());
            } else if (subjectFilter !== 'Geral' && subjectFilter !== 'Todos') {
                query = query.eq('subject', subjectFilter.toLowerCase());
            }
        }

        const { data, error } = await query;
        if (error) {
            console.error("Error fetching questions:", error);
            return [];
        }

        const safeData = data || [];
        
        // Shuffle all first
        const shuffled = [...safeData].sort(() => Math.random() - 0.5);

        // Helper to normalize weight (Dificil: 3, Media: 2, Facil: 1)
        const getWeight = (dif) => {
            const d = String(dif || "media").toLowerCase();
            if (d.includes("dif") || d === "3") return 3;
            if (d.includes("fac") || d === "1") return 1;
            return 2;
        };

        // Sort by weight DESCENDING (3 -> 2 -> 1)
        shuffled.sort((a, b) => getWeight(b.difficulty) - getWeight(a.difficulty));

        return shuffled.slice(0, limit);
    },

    async saveSimuladoHistory(userId, simuladoType, score, totalQuestions = 10) {
        const client = this.getClient();
        if (!client) return;

        const { error } = await client
            .from('simulado_history')
            .insert({
                user_id: userId,
                simulado_type: simuladoType,
                score: score,
                total_questions: totalQuestions
            });
            
        if (error) console.error("Error saving simulado history:", error);
    },

    async getRandomSimuladoByDistribution(distribution = [3, 4, 3], type = 'ENEM', allowedSubjects = null) {
        const client = this.getClient();
        if (!client) return [];

        try {
            const searchType = type.toUpperCase();
            // 1. Get all subjects that have questions of this type
            let query = client
                .from('questions')
                .select('subject')
                .eq('type', searchType);
            
            if (allowedSubjects && allowedSubjects.length > 0) {
                query = query.in('subject', allowedSubjects);
            }

            const { data: allSubjectsData, error: sError } = await query;

            if (sError || !allSubjectsData || allSubjectsData.length === 0) {
                return this.getQuestionsForSimulado(searchType, 10);
            }

            let subjects = [...new Set(allSubjectsData.map(q => q.subject))];
            
            // 3. Shuffle and pick up to 3 random subjects
            const shuffledSubjects = subjects.sort(() => Math.random() - 0.5);
            const picked = shuffledSubjects.slice(0, 3);
            
            let finalSet = [];
            // Pick questions for each subject based on distribution
            for (let i = 0; i < picked.length; i++) {
                // If we have fewer than 3 subjects, we need to adjust the distribution or just take more from available ones
                let limit = distribution[i] || 3;
                if (picked.length === 2 && i === 1) limit = 7; // Simple adjustment for 2 subjects (3 + 7 = 10)
                if (picked.length === 1) limit = 10; // 10 from the only subject

                const { data, error: qError } = await client
                    .from('questions')
                    .select('*')
                    .eq('type', searchType)
                    .eq('subject', picked[i])
                    .limit(30); 

                if (qError || !data) continue;
                
                const shuffledPool = data.sort(() => Math.random() - 0.5);
                finalSet = [...finalSet, ...shuffledPool.slice(0, limit)];
            }

            // Fill up if still less than 10 due to small pools
            if (finalSet.length < 10 && finalSet.length > 0) {
                // If we have allowedSubjects, we should only pull extra from those subjects
                let extraQuery = client.from('questions').select('*').eq('type', searchType);
                if (allowedSubjects && allowedSubjects.length > 0) {
                    extraQuery = extraQuery.in('subject', allowedSubjects);
                }
                const { data: extra } = await extraQuery.limit(10 - finalSet.length);
                if (extra) finalSet = [...finalSet, ...extra];
            }

            return finalSet.sort(() => Math.random() - 0.5);
        } catch (err) {
            console.error("Error in getRandomSimuladoByDistribution:", err);
            return this.getQuestionsForSimulado(type, 10);
        }
    },
    
    async getCustomSimulado(config = null) {
        const client = this.getClient();
        if (!client) return [];

        try {
            // If config is just an array of subjects (legacy)
            if (Array.isArray(config)) {
                const { data } = await client.from('questions').select('*').in('subject', config).limit(50);
                return (data || []).sort(() => Math.random() - 0.5).slice(0, 10);
            }

            // If config is a mapping { id: count }
            if (typeof config === 'object' && config !== null) {
                let finalSet = [];
                const entries = Object.entries(config);

                for (const [subjectId, count] of entries) {
                    if (count <= 0) continue;
                    
                    const { data, error } = await client
                        .from('questions')
                        .select('*')
                        .eq('subject', subjectId)
                        .limit(count * 2); // Pull slightly more for better randomization
                    
                    if (data && data.length > 0) {
                        const subjectQuestions = data.sort(() => Math.random() - 0.5).slice(0, count);
                        finalSet = [...finalSet, ...subjectQuestions];
                    }
                }
                
                return finalSet.sort(() => Math.random() - 0.5);
            }

            return [];
        } catch (err) {
            console.error("Error in getCustomSimulado:", err);
            return [];
        }
    },

    async getSimuladoHistory(userId) {
        const client = this.getClient();
        if (!client) return [];

        const { data, error } = await client
            .from('simulado_history')
            .select('*')
            .eq('user_id', userId)
            .order('completed_at', { ascending: false });
            
        if (error) {
            console.error("Error fetching simulado history:", error);
            return [];
        }
        return data;
    },

    async deleteAccount() {
        const client = this.getClient();
        if (!client) return { error: { message: "Client not initialized" } };
        return await client.rpc('delete_own_account');
    }
};
