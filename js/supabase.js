/**
 * EduHub Brasil - Supabase Configuration & Client
 * Centralizes all cloud database and auth interactions.
 */

const SupabaseConfig = {
    URL: "https://tixfiukvvyokgaxflxdr.supabase.co", 
    ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpeGZpdWt2dnlva2dheGZseGRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MDYxNTEsImV4cCI6MjA4OTI4MjE1MX0.0FpUCJaH7LE47roOp1tStdhqZDCTyT2dQBeo33W9uCw"
};

const PROD_APP_ORIGIN = "https://mobileapp-taupe.vercel.app";
const GOOGLE_OAUTH_PENDING_KEY = "eduhub_google_oauth_pending";
const GOOGLE_OAUTH_INTENT_PARAM = "eduhub_oauth";

function getOAuthRedirectTo() {
    const origin = String(window.location?.origin || "").trim();
    const hostname = String(window.location?.hostname || "").trim().toLowerCase();
    const protocol = String(window.location?.protocol || "").trim().toLowerCase();

    // On webviews/local wrappers, OAuth should always return to the public app URL.
    if (
        protocol === "file:" ||
        protocol === "capacitor:" ||
        protocol === "ionic:" ||
        hostname === "localhost" ||
        hostname === "127.0.0.1"
    ) {
        return PROD_APP_ORIGIN;
    }

    return origin || PROD_APP_ORIGIN;
}

function buildGoogleOAuthRedirectTo() {
    const baseRedirect = getOAuthRedirectTo();

    try {
        const redirectUrl = new URL(baseRedirect);
        redirectUrl.searchParams.set(GOOGLE_OAUTH_INTENT_PARAM, "google");
        return redirectUrl.toString();
    } catch (_error) {
        const separator = baseRedirect.includes("?") ? "&" : "?";
        return `${baseRedirect}${separator}${GOOGLE_OAUTH_INTENT_PARAM}=google`;
    }
}

// Initialize Supabase Client (lazy loaded once keys are available)
let supabaseClient = null;

const Supabase = {
    _extractMissingColumnName(error) {
        const raw = [error?.message, error?.details, error?.hint]
            .filter(Boolean)
            .join(" ");
        const match = raw.match(/column\s+"?([A-Za-z0-9_]+)"?\s+does\s+not\s+exist/i);
        return match ? match[1] : "";
    },

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

        const redirectTo = buildGoogleOAuthRedirectTo();

        localStorage.setItem(GOOGLE_OAUTH_PENDING_KEY, String(Date.now()));

        try {
            const result = await client.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo
                }
            });

            if (result?.error) {
                localStorage.removeItem(GOOGLE_OAUTH_PENDING_KEY);
            }

            return result;
        } catch (error) {
            localStorage.removeItem(GOOGLE_OAUTH_PENDING_KEY);
            throw error;
        }
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
        localStorage.removeItem(GOOGLE_OAUTH_PENDING_KEY);
    },

    async ensureProfile(userId) {
        const client = this.getClient();
        if (!client || !userId) return { data: null, error: null };

        // Keep bootstrap minimal so profile creation does not depend on optional columns.
        const { data, error } = await client
            .from('profiles')
            .upsert({ id: userId }, { onConflict: 'id' })
            .select('id')
            .maybeSingle();

        if (error) {
            console.warn("Error ensuring profile row:", error);
        }

        return { data, error };
    },

    async ensureProfileFromSession(preferredName = "") {
        const client = this.getClient();
        if (!client) return { data: null, error: null };

        const { data: { session } } = await client.auth.getSession();
        const userId = session?.user?.id;
        if (!userId) return { data: null, error: null };

        const ensured = await this.ensureProfile(userId);
        if (ensured.error) return ensured;

        const metadata = session.user.user_metadata || {};
        const resolvedName = String(
            preferredName ||
            metadata.full_name ||
            metadata.name ||
            metadata.given_name ||
            ""
        ).trim();

        if (!resolvedName) return ensured;

        const { error } = await client
            .from('profiles')
            .update({ userName: resolvedName, updated_at: new Date().toISOString() })
            .eq('id', userId);

        if (error) {
            // Non-fatal: profile row already exists, and schema may not include this optional column.
            console.warn("Error updating ensured profile name:", error);
        }

        return ensured;
    },

    async saveProfile(userId, profileData) {
        const client = this.getClient();
        if (!client) return { data: null, error: { message: "Conexão não configurada." } };

        await this.ensureProfile(userId);

        // Retry once per missing column so critical fields (e.g., onboardingDone/userPlan)
        // still persist even when optional columns are absent in older DB schemas.
        const payload = { id: userId, ...profileData, updated_at: new Date().toISOString() };
        let retries = 0;
        let lastError = null;

        while (retries <= 4) {
            const { data, error } = await client
                .from('profiles')
                .upsert(payload, { onConflict: 'id' });

            if (!error) {
                return { data, error: null };
            }

            lastError = error;
            const missingColumn = this._extractMissingColumnName(error);
            const missingKey = Object.keys(payload).find(
                (key) => key.toLowerCase() === String(missingColumn || "").toLowerCase()
            );

            if (!missingKey || missingKey === "id") {
                break;
            }

            delete payload[missingKey];
            retries += 1;
            console.warn(`[Supabase] Retrying saveProfile without unsupported column: ${missingKey}`);
        }

        if (lastError) {
            console.error("Error saving profile:", lastError);
        }
        return { data: null, error: lastError };
    },

    async getProfile(userId) {
        const client = this.getClient();
        if (!client) return null;
        const { data, error } = await client
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
        if (error) {
            console.error("Error fetching profile:", error);
            throw error;
        }
        return data || null;
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
