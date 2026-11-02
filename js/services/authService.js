import { supabase } from "./supabaseClient.js";

export const auth = {
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async session() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async profile() {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (error) throw error;
    return data ? { ...data, email: user.email } : null;
  },

  async requireStaff() {
    const profile = await this.profile();
    if (!profile || !["admin", "editor"].includes(profile.role)) {
      throw new Error("You do not have permission to access the admin panel.");
    }
    return profile;
  }
};
