import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user session on load
  useEffect(() => {
    let subscription;
    const getSession = async () => {
      try {
        const { data: { session } = {} } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (err) {
        console.error("Error fetching session:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // v2 onAuthStateChange returns { data: { subscription } }
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    subscription = data?.subscription;

    return () => {
      try {
        subscription?.unsubscribe();
      } catch (err) {
        // ignore if already unsubscribed
      }
    };
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, message: error.message };
    return { success: true, user: data.user };
  };

  const register = async (email, password, full_name) => {
    // Use signUp with options to attach user metadata
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name } }
    });

    if (error) return { success: false, message: error.message };
    // Optionally upsert into your users table if you have one (ensure RLS/policies allow it)
    try {
      await supabase.from("users").insert({
        auth_id: data.user.id,
        email,
        full_name,
        role: "employee"
      }, { upsert: true });
    } catch (e) {
      // ignore if user table not present or if RLS blocks it; console for debugging
      console.warn("Could not upsert users row:", e);
    }

    return { success: true, user: data.user };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
