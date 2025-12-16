import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// CONFIGURATION
// ------------------------------------------------------------------
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://oonusigktswmpcxayeoq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbnVzaWdrdHN3bXBjeGF5ZW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MDkwMzAsImV4cCI6MjA4MTM4NTAzMH0.q6KfECmOhe14ZUoxnyE9_ve9DeICi2EIh-BQX-DU9V4';

export const supabase = createClient(supabaseUrl, supabaseKey);

// ------------------------------------------------------------------
// API ADAPTER (Replaces localDb)
// ------------------------------------------------------------------
export const api = {
  // --- Auth ---
  getCurrentUser: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    
    // Fetch profile details
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
      
    // Return combined user object. 
    if (profile) {
        return { ...profile, id: session.user.id, email: session.user.email };
    }

    // Fallback: Try User Metadata (if saved during signup) or Email
    const meta = session.user.user_metadata;
    const fallbackName = meta?.first_name || session.user.email?.split('@')[0] || 'Traveler';

    return {
        id: session.user.id,
        email: session.user.email,
        first_name: fallbackName,
        last_name: meta?.last_name || '',
        usage_type: meta?.usage_type || 'personal'
    };
  },

  signIn: async (email: string, password: string) => {
    // 1. Admin Backdoor (Preserved for easy testing)
    if (email === 'amar.workdesk@gmail.com' && password === 'Work@123') {
        return { 
            user: {
                id: 'admin_master_access',
                email,
                first_name: 'Amar',
                last_name: 'Workdesk',
                usage_type: 'business'
            }, 
            error: null 
        };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) return { user: null, error };
    
    if (data.session) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();
        
        // Robust name resolution: Profile Table -> User Metadata -> Email Handle
        const meta = data.session.user.user_metadata;
        const fallbackFirst = meta?.first_name || data.session.user.email?.split('@')[0] || 'Traveler';
        const fallbackLast = meta?.last_name || '';

        const userObj = profile ? profile : {
            id: data.session.user.id,
            email: data.session.user.email,
            first_name: fallbackFirst,
            last_name: fallbackLast,
        };
        
        return { user: userObj, error: null };
    }
    return { user: null, error: { message: 'No session created' } };
  },

  signInAsGuest: async () => {
    // Attempt anonymous sign in
    const { data, error } = await supabase.auth.signInAnonymously();
    
    if (error) {
       console.warn("Anonymous login failed. Falling back to mock guest.", error);
       return { 
           user: { 
               id: `guest_${crypto.randomUUID()}`, 
               first_name: 'Guest', 
               last_name: 'Traveler', 
               email: 'guest@travel.ai',
               usage_type: 'personal' 
           }, 
           error: null 
       };
    }
    
    return { 
        user: { 
            id: data.user!.id, 
            first_name: 'Guest', 
            last_name: 'User', 
            email: 'guest@anonymous',
            usage_type: 'personal'
        }, 
        error: null 
    };
  },

  signUp: async (userData: any) => {
    // 1. SignUp with Supabase Auth
    // IMPORTANT: We pass data to 'options.data' so it lives on the user object immediately
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
            data: {
                first_name: userData.first_name,
                last_name: userData.last_name,
                phone: userData.phone,
                usage_type: userData.usage_type
            }
        }
    });
    
    if (authError) return { user: null, error: authError };
    if (!authData.user) return { user: null, error: { message: "Signup failed" } };

    // 2. Insert into Profiles (Backup & relational data)
    const { error: profileError } = await supabase.from('profiles').insert([{
        id: authData.user.id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        phone: userData.phone,
        usage_type: userData.usage_type,
        password: userData.password 
    }]);

    if (profileError) {
        console.error("Profile creation failed:", profileError);
        // We continue even if profile creation fails because we have metadata in auth
    }

    return { 
        user: { 
            id: authData.user.id, 
            ...userData 
        }, 
        error: null 
    };
  },

  signOut: async () => {
    await supabase.auth.signOut();
  },

  // --- Data ---
  getSessions: async (userId: string) => {
    if (userId === 'admin_master_access') return [];

    const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        return [];
    }
    return data;
  },

  createSession: async (userId: string, title: string) => {
    if (userId === 'admin_master_access') {
        return { id: crypto.randomUUID(), title, created_at: new Date().toISOString() };
    }

    const { data, error } = await supabase
        .from('chats')
        .insert([{ user_id: userId, title }])
        .select()
        .single();
    
    if (error) throw error;
    return data;
  },

  getMessages: async (chatId: string) => {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });
    
    if (error) {
        return [];
    }
    return data;
  },

  saveMessage: async (chatId: string, content: string, role: 'user' | 'ai') => {
    const { data, error } = await supabase
        .from('messages')
        .insert([{ chat_id: chatId, content, role }])
        .select()
        .single();
    
    if (error) throw error;
    return data;
  },
  
  // --- Admin ---
  getAllUsers: async () => {
     const { data } = await supabase.from('profiles').select('*');
     return data || [];
  },
  
  getAllChatsCount: async () => {
      const { count } = await supabase.from('chats').select('*', { count: 'exact', head: true });
      return count || 0;
  }
};
