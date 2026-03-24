import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function PortalLogin({ onLogin }) {
  const { loginRole } = useParams();
  const { login, register, loginWithGoogle } = useAuth();

  const [mode, setMode] = useState("signin");
  const [role] = useState(
    loginRole === "doctor" ? "Hospital" : loginRole === "patient" ? "Patient" : "Admin"
  );

  const [formData, setFormData] = useState({ full_name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getInternalRole = (displayRole) => {
    if (displayRole === "Hospital") return "doctor";
    if (displayRole === "Patient") return "patient";
    if (displayRole === "Admin") return "admin";
    return "doctor";
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    const internalRole = getInternalRole(role);
    try {
      await loginWithGoogle(internalRole);
      onLogin(internalRole);
    } catch (err) {
      setError(err.message || "Google authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const internalRole = getInternalRole(role);
    try {
      if (mode === "signin") {
        await login(formData.email, formData.password, internalRole);
      } else {
        if (!formData.full_name) { setError("Full name is required."); setLoading(false); return; }
        await register({ email: formData.email, password: formData.password, role: internalRole, full_name: formData.full_name });
      }
      onLogin(internalRole, formData.full_name);
    } catch (err) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light font-display text-slate-900 min-h-screen">
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        <div className="flex h-full grow flex-col">
          {/* Top Nav */}
          <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-primary/10 bg-white px-6 md:px-10 py-3 sticky top-0 z-50">
            <div className="flex items-center gap-4 text-primary">
              <div className="size-8 flex items-center justify-center bg-primary rounded-lg text-white">
                <span className="material-symbols-outlined">health_and_safety</span>
              </div>
              <h2 className="text-slate-900 text-xl font-bold leading-tight tracking-tight cursor-pointer hover:text-primary transition-colors" onClick={() => onLogin("gateway_back")}>
                Sehat AI
              </h2>
            </div>
            <div className="flex flex-1 justify-end gap-4 items-center">
              <span className="text-sm text-slate-500 hidden md:block">HIPAA Compliant System</span>
              <div className="bg-primary/10 rounded-full p-1 border border-primary/20">
                <span className="material-symbols-outlined text-primary text-xl px-1">lock</span>
              </div>
            </div>
          </header>

          <main className="flex-1 flex items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 bg-white rounded-xl overflow-hidden shadow-2xl shadow-primary/5">
              {/* Form Section */}
              <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                <div className="mb-8">
                  <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">
                    {mode === "signin" ? "Welcome back" : "Create an account"}
                  </h1>
                  <p className="text-slate-500">
                    {mode === "signin" ? `Access your ${role} portal securely.` : `Join Sehat AI as a ${role}.`}
                  </p>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm font-medium">
                    <span className="material-symbols-outlined text-base">error</span>
                    {error}
                  </div>
                )}

                <form className="space-y-5" onSubmit={handleSubmit}>
                  {/* Full Name (register only) */}
                  {mode === "signup" && (
                    <div className="flex flex-col gap-2">
                      <label className="text-slate-700 text-sm font-semibold">
                        {role === "Hospital" ? "Doctor / Hospital name" : "Your full name"}
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          {role === "Admin" ? "shield" : "person"}
                        </span>
                        <input
                          name="full_name"
                          className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                          placeholder={role === "Hospital" ? "Doctor / Hospital name" : "Your full name"}
                          type="text"
                          required
                          value={formData.full_name}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  <div className="flex flex-col gap-2">
                    <label className="text-slate-700 text-sm font-semibold">Email</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                      <input
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                        placeholder="Enter your email"
                        type="email"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-2">
                    <label className="text-slate-700 text-sm font-semibold">Password</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock_open</span>
                      <input
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-12 pr-12 py-4 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                        placeholder="••••••••"
                        type="password"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin material-symbols-outlined text-base">progress_activity</span>
                        {mode === "signin" ? "Signing in..." : "Creating account..."}
                      </>
                    ) : (
                      <>
                        <span>{mode === "signin" ? "Sign In" : "Sign Up"}</span>
                        <span className="material-symbols-outlined">{mode === "signin" ? "login" : "person_add"}</span>
                      </>
                    )}
                  </button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-slate-500 font-medium italic">or secure social link</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-4 rounded-xl border border-slate-200 shadow-sm transition-all flex items-center justify-center gap-3 disabled:opacity-60 group"
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </form>

                <p className="mt-8 text-center text-sm text-slate-500">
                  {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
                  <button className="text-primary font-bold hover:underline" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}>
                    {mode === "signin" ? "Register here" : "Sign in"}
                  </button>
                </p>
              </div>

              {/* Illustration */}
              <div className="hidden lg:block relative overflow-hidden bg-primary/5">
                <div className="absolute inset-0 bg-linear-to-br from-primary/80 to-background-dark/90 z-10"></div>
                <img
                  className="absolute h-full w-full object-cover"
                  alt="Healthcare"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTEQFayjZRzckOURrukHZEo_hsFBbDFSOHjVnMEhJuBir5IuUJc4AJwLrQTo3Z-O6UewP3nr11pesY0uw5JRJxZDacFTZVHSoDyHW-qUv23GYPnPkmDU1_KOyg-7ZvZd_-7xt9zVq2SifFw3qVKUtPtwMXiDqyWBsS1U-KKXLlHli-h_rtfguNmPA55fND4lw50-HCFfWXQNRzszR8L55RwxUi4GEZ0hM9LKOTwUuo7keq74sbCSM8haNCWZAJGmKudVuJ57FZqT4r"
                />
                <div className="relative z-20 h-full flex flex-col justify-end p-16 text-white">
                  <div className="mb-6 inline-flex p-3 bg-white/20 backdrop-blur-md rounded-2xl w-fit">
                    <span className="material-symbols-outlined text-4xl">monitoring</span>
                  </div>
                  <h2 className="text-4xl font-bold mb-4 leading-tight">Empowering Healthcare with AI Precision</h2>
                  <p className="text-lg text-white/80 leading-relaxed max-w-md">
                    Real-time patient monitoring, predictive analytics, and secure healthcare management for modern clinical environments.
                  </p>
                </div>
              </div>
            </div>
          </main>

          <footer className="p-6 text-center text-slate-400 text-sm">
            <p>© 2024 Sehat AI. All rights reserved. Secure 256-bit SSL Encrypted.</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
