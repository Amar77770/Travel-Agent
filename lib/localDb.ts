
// Keys for LocalStorage
const USERS_KEY = 'pa_users';
const CHATS_KEY = 'pa_chats';
const MESSAGES_KEY = 'pa_messages';
const CURRENT_USER_KEY = 'pa_current_user';

export const api = {
  // --- Auth ---
  getCurrentUser: async () => {
    // Simulate async for interface consistency
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  signIn: async (email: string, password: string) => {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 600));
    
    // 1. Admin Backdoor
    if (email === 'amar.workdesk@gmail.com' && password === 'Work@123') {
        const adminUser = {
            id: 'admin_master_access',
            email,
            first_name: 'Amar', // Updated from Administrator
            last_name: 'Workdesk',
            usage_type: 'business'
        };
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(adminUser));
        return { user: adminUser, error: null };
    }

    // 2. Demo User Backdoor
    if (email === 'demo@example.com' && password === 'password') {
         const demoUser = {
            id: 'demo_user_123',
            email,
            first_name: 'Demo',
            last_name: 'User',
            usage_type: 'self'
        };
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(demoUser));
        return { user: demoUser, error: null };
    }

    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    let user = users.find((u: any) => u.email === email);
    
    // 3. Strict Login - No Auto Register
    if (!user) {
        return { user: null, error: { message: 'Account not found. Please Sign Up.' } };
    } 
    
    if (user.password !== password) {
         return { user: null, error: { message: 'Incorrect password.' } };
    }
    
    // Login Success
    const { password: _, ...safeUser } = user;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
    return { user: safeUser, error: null };
  },

  signInAsGuest: async () => {
     await new Promise(r => setTimeout(r, 400));
     const guestUser = {
        id: `guest_${crypto.randomUUID()}`,
        email: 'guest@travel.ai',
        first_name: 'Guest',
        last_name: 'Traveler',
        usage_type: 'personal'
     };
     localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(guestUser));
     return { user: guestUser, error: null };
  },

  signUp: async (userData: any) => {
    await new Promise(r => setTimeout(r, 600));
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    if (users.find((u: any) => u.email === userData.email)) {
        return { user: null, error: { message: 'User already exists. Please Log In.' } };
    }

    const newUser = {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        ...userData
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Auto login
    const { password, ...safeUser } = newUser;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));

    return { user: safeUser, error: null };
  },

  signOut: async () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  // --- Data ---
  getSessions: async (userId: string) => {
    const chats = JSON.parse(localStorage.getItem(CHATS_KEY) || '[]');
    return chats
        .filter((c: any) => c.user_id === userId)
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  createSession: async (userId: string, title: string) => {
    const chats = JSON.parse(localStorage.getItem(CHATS_KEY) || '[]');
    const newChat = {
        id: crypto.randomUUID(),
        user_id: userId,
        title,
        created_at: new Date().toISOString()
    };
    chats.unshift(newChat);
    localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
    return newChat;
  },

  getMessages: async (chatId: string) => {
    const allMsgs = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
    return allMsgs
        .filter((m: any) => m.chat_id === chatId)
        .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  },

  saveMessage: async (chatId: string, content: string, role: 'user' | 'ai') => {
    const allMsgs = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
    const newMsg = {
        id: crypto.randomUUID(),
        chat_id: chatId,
        content,
        role,
        created_at: new Date().toISOString()
    };
    allMsgs.push(newMsg);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(allMsgs));
    return newMsg;
  },
  
  // --- Admin ---
  getAllUsers: async () => {
     return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  },
  
  getAllChatsCount: async () => {
      const chats = JSON.parse(localStorage.getItem(CHATS_KEY) || '[]');
      return chats.length;
  }
};
