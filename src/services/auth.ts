import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin';
}

const AUTH_STORAGE_KEY = 'roche_admin_session';

export const authService = {
  async getSession(): Promise<AdminUser | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          return {
            id: session.user.id,
            email: session.user.email || 'admin@roche-motion.com',
            role: 'admin',
          };
        }
      } catch (err) {
        console.warn('Supabase auth session error:', err);
      }
    }

    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as AdminUser;
      }
    } catch {
      // fallback
    }

    return null;
  },

  async login(email: string, password: string): Promise<AdminUser> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message || 'Identifiants invalides');
      }

      const user: AdminUser = {
        id: data.user.id,
        email: data.user.email || email,
        role: 'admin',
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      return user;
    }

    // Demo/Standalone authentication mode
    if ((email === 'admin@roche-motion.com' || email.includes('admin')) && password.length >= 6) {
      const demoUser: AdminUser = {
        id: 'admin-super-demo-id',
        email,
        role: 'admin',
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(demoUser));
      return demoUser;
    }

    throw new Error('Identifiants incorrects. En mode démo, utilisez email "admin@roche-motion.com" et mot de passe "admin123"');
  },

  async logout(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  async updatePassword(newPassword: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw new Error(error.message);
      return;
    }
    // Local demo mode simulated password change
    await new Promise((r) => setTimeout(r, 400));
  },
};
