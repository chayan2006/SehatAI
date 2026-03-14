import { supabase } from './supabaseClient';

export const userService = {
  // Sign Up
  async signUp({ email, password, fullName, role, hospitalName }) {
    // Sign up the user with Supabase Auth
    // The trigger `on_auth_user_created` in the DB will automatically:
    // 1. Create a profile in public.profiles
    // 2. Create a record in public.hospitals if the role is 'doctor'
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
          hospital_name: hospitalName // Matches trigger: new.raw_user_meta_data->>'hospital_name'
        }
      }
    });

    if (authError) throw authError;
    return authData;
  },


  // Sign In
  async signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  // Get current session
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  // Sign Out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get user profile
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update user profile
  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    
    if (error) throw error;
    return data;
  }
};

