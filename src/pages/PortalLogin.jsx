import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { sendOtpEmail } from "@/lib/emailService";

// ── Helper: generate a random 6-digit OTP ────────────────────────────────────
// TODO: Replace with dynamic OTP generation when email delivery is configured
const generateOTP = () => "769854";

export default function PortalLogin({ onLogin }) {
  const { loginRole } = useParams();
  const { login, register, loginWithGoogle } = useAuth();

  const [mode, setMode] = useState("signin");
  const [role] = useState(
    loginRole === "doctor" ? "Hospital" : loginRole === "patient" ? "Patient" : "Admin"
  );

  // ── Form state ───────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    dob: "",
    blood_group: "",
    gender: "",
    city: "",
    institution: "",
    consent: false,
  });

  // ── OTP verification state ───────────────────────────────────────────────────
  const [step, setStep] = useState("form"); // "form" | "otp"
  const [otpRef, setOtpRef] = useState(""); // the OTP we generated & sent
  const [otpInput, setOtpInput] = useState(["", "", "", "", "", ""]); // 6 cells
  const [otpError, setOtpError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  // ── Cooldown timer ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // ── Role helper ───────────────────────────────────────────────────────────────
  const getInternalRole = (displayRole) => {
    if (displayRole === "Hospital") return "doctor";
    if (displayRole === "Patient") return "patient";
    if (displayRole === "Admin") return "admin";
    return "doctor";
  };

  // ── Generic input change ──────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setError("");
  };

  // ── Google Login ──────────────────────────────────────────────────────────────
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

  // ── Send OTP via email service ────────────────────────────────────────────────
  const sendOtp = async (email, name, otp) => {
    await sendOtpEmail({ email, name, otp });
  };

  // ── Submit: either sign-in or begin OTP flow ──────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const internalRole = getInternalRole(role);

    try {
      if (mode === "signin") {
        await login(formData.email, formData.password, internalRole);
        onLogin(internalRole, formData.full_name);
      } else {
        // Validate required fields
        if (!formData.full_name) { setError("Full name is required."); setLoading(false); return; }
        if (internalRole === "patient" && !formData.consent) {
          setError("You must accept the consent to register."); setLoading(false); return;
        }

        // Generate & send OTP
        const otp = generateOTP();
        setOtpRef(otp);
        await sendOtp(formData.email, formData.full_name, otp);
        setStep("otp");
        setResendCooldown(60);
        setOtpInput(["", "", "", "", "", ""]);
        setOtpError("");
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── OTP cell input handler ────────────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // digits only
    const next = [...otpInput];
    next[index] = value;
    setOtpInput(next);
    setOtpError("");
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpInput[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (paste.length === 6) {
      setOtpInput(paste.split(""));
      inputRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  // ── Verify OTP & complete registration ────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const entered = otpInput.join("");
    if (entered.length < 6) { setOtpError("Please enter all 6 digits."); return; }
    if (entered !== otpRef) { setOtpError("Incorrect code. Please try again."); return; }

    setLoading(true);
    const internalRole = getInternalRole(role);
    try {
      const registerData = {
        email: formData.email,
        password: formData.password,
        role: internalRole,
        full_name: formData.full_name,
        phone: formData.phone,
        institution: formData.institution,
      };

      if (internalRole === "patient") {
        Object.assign(registerData, {
          dob: formData.dob,
          blood_group: formData.blood_group,
          gender: formData.gender,
          city: formData.city,
          consent: formData.consent,
        });
      } else {
        // Doctor/other non-patient signups
      }

      console.log("Verifying registration data:", registerData);
      await register(registerData);
      setSuccess("Account created successfully! Welcome to SehatAI 🎉");
      
      // Delay to show success message then navigate
      setTimeout(() => {
        console.log("Navigating to dashboard with role:", internalRole);
        onLogin(internalRole, formData.full_name);
      }, 1500);
    } catch (err) {
      console.error("Registration error in handleVerifyOtp:", err);
      setOtpError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    const otp = generateOTP();
    setOtpRef(otp);
    setOtpInput(["", "", "", "", "", ""]);
    setOtpError("");
    setResendCooldown(60);
    await sendOtp(formData.email, formData.full_name, otp);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  //  OTP Screen
  // ─────────────────────────────────────────────────────────────────────────────
  if (step === "otp") {
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
                <h2 className="text-slate-900 text-xl font-bold leading-tight tracking-tight">Sehat AI</h2>
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
                {/* OTP Form */}
                <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                  {/* Icon */}
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6 mx-auto">
                    <span className="material-symbols-outlined text-primary text-4xl">mark_email_read</span>
                  </div>

                  <div className="mb-6 text-center">
                    <h1 className="text-3xl font-black text-slate-900 mb-2">Check your email</h1>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      We sent a 6-digit verification code to
                      <br />
                      <span className="font-semibold text-primary">{formData.email}</span>
                    </p>
                  </div>

                  {/* Success Banner */}
                  {success && (
                    <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-600 rounded-xl px-4 py-3 text-sm font-medium">
                      <span className="material-symbols-outlined text-base">check_circle</span>
                      {success}
                    </div>
                  )}

                  {/* Error Banner */}
                  {otpError && (
                    <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm font-medium">
                      <span className="material-symbols-outlined text-base">error</span>
                      {otpError}
                    </div>
                  )}

                  <form onSubmit={handleVerifyOtp} className="space-y-6">
                    {/* OTP Cells */}
                    <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                      {otpInput.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => (inputRefs.current[i] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 outline-none transition-all
                            ${digit ? "border-primary bg-primary/5 text-primary" : "border-slate-200 bg-white text-slate-900"}
                            focus:border-primary focus:ring-2 focus:ring-primary/20`}
                        />
                      ))}
                    </div>

                    {/* Verify Button */}
                    <button
                      type="submit"
                      disabled={loading || !!success}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <span className="animate-spin material-symbols-outlined text-base">progress_activity</span>
                          Verifying…
                        </>
                      ) : (
                        <>
                          <span>Verify & Create Account</span>
                          <span className="material-symbols-outlined">verified_user</span>
                        </>
                      )}
                    </button>

                    {/* Resend */}
                    <p className="text-center text-sm text-slate-500">
                      Didn't receive the code?{" "}
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendCooldown > 0}
                        className={`font-bold transition-colors ${resendCooldown > 0 ? "text-slate-400 cursor-not-allowed" : "text-primary hover:underline"}`}
                      >
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                      </button>
                    </p>

                    {/* Back */}
                    <button
                      type="button"
                      onClick={() => { setStep("form"); setOtpError(""); }}
                      className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-primary text-sm transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">arrow_back</span>
                      Back to registration
                    </button>
                  </form>
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
                    <h2 className="text-4xl font-bold mb-4 leading-tight">One step away from better health care</h2>
                    <p className="text-lg text-white/80 leading-relaxed max-w-md">
                      Verifying your email keeps your medical data secure and HIPAA compliant.
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

  // ─────────────────────────────────────────────────────────────────────────────
  //  Main Form Screen
  // ─────────────────────────────────────────────────────────────────────────────
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
              <h2
                className="text-slate-900 text-xl font-bold leading-tight tracking-tight cursor-pointer hover:text-primary transition-colors"
                onClick={() => onLogin("gateway_back")}
              >
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
                  {/* ── SIGN IN fields ── */}
                  {mode === "signin" ? (
                    <>
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
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* ── SIGN UP fields: Patient full grid ── */}
                      <div className={role === "Patient" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
                        {/* Full Name */}
                        <div className="flex flex-col gap-2">
                          <label className="text-slate-700 text-sm font-semibold flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">person</span>Full Name
                          </label>
                          <input
                            name="full_name"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="John Doe"
                            type="text"
                            required
                            value={formData.full_name}
                            onChange={handleChange}
                          />
                        </div>

                        {role === "Patient" && (
                          <>
                            {/* DOB */}
                            <div className="flex flex-col gap-2">
                              <label className="text-slate-700 text-sm font-semibold flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">calendar_today</span>Date of Birth
                              </label>
                              <input
                                name="dob"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                type="date"
                                required
                                value={formData.dob}
                                onChange={handleChange}
                              />
                            </div>

                            {/* Blood Group */}
                            <div className="flex flex-col gap-2">
                              <label className="text-slate-700 text-sm font-semibold flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">bloodtype</span>Blood Group
                              </label>
                              <select
                                name="blood_group"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                required
                                value={formData.blood_group}
                                onChange={handleChange}
                              >
                                <option value="">Select Blood Type</option>
                                {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map((b) => (
                                  <option key={b} value={b}>{b}</option>
                                ))}
                              </select>
                            </div>

                            {/* Gender */}
                            <div className="flex flex-col gap-2">
                              <label className="text-slate-700 text-sm font-semibold flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">person</span>Gender
                              </label>
                              <select
                                name="gender"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                required
                                value={formData.gender}
                                onChange={handleChange}
                              >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>

                            {/* Phone */}
                            <div className="flex flex-col gap-2">
                              <label className="text-slate-700 text-sm font-semibold flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">call</span>Phone Number
                              </label>
                              <input
                                name="phone"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="+91 98765 43210"
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                              />
                            </div>

                            {/* Email */}
                            <div className="flex flex-col gap-2">
                              <label className="text-slate-700 text-sm font-semibold flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">mail</span>Email Address
                              </label>
                              <input
                                name="email"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="john@example.com"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                              />
                            </div>
                          </>
                        )}

                        {/* Non-patient fields (Hospital/Admin) */}
                        {role !== "Patient" && (
                          <div className="space-y-4">
                            <div className="flex flex-col gap-2">
                              <label className="text-slate-700 text-sm font-semibold flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">account_balance</span>Institution/Hospital Name
                              </label>
                              <input
                                name="institution"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="Central Health Institute"
                                type="text"
                                required
                                value={formData.institution}
                                onChange={handleChange}
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-slate-700 text-sm font-semibold flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">mail</span>Work Email
                              </label>
                              <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                                <input
                                  name="email"
                                  value={formData.email}
                                  onChange={handleChange}
                                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                  placeholder="Enter your email"
                                  type="email"
                                  required
                                />
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-slate-700 text-sm font-semibold flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">call</span>Phone Number
                              </label>
                              <input
                                name="phone"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="+1 123 456 7890"
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Password + Patient-specific fields */}
                      <div className="space-y-4 mt-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-slate-700 text-sm font-semibold flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">lock</span>Password
                          </label>
                          <input
                            name="password"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                            type="password"
                            required
                            minLength={6}
                            value={formData.password}
                            onChange={handleChange}
                          />
                        </div>

                        {role === "Patient" && (
                          <>
                            <div className="flex flex-col gap-2">
                              <label className="text-slate-700 text-sm font-semibold flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">location_on</span>City
                              </label>
                              <input
                                name="city"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="e.g. Mumbai"
                                type="text"
                                required
                                value={formData.city}
                                onChange={handleChange}
                              />
                            </div>

                            <div className="flex items-start gap-3 mt-4">
                              <input
                                id="consent"
                                name="consent"
                                type="checkbox"
                                className="mt-1 h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                                checked={formData.consent}
                                onChange={handleChange}
                                required
                              />
                              <label htmlFor="consent" className="text-slate-600 text-[13px] leading-relaxed cursor-pointer select-none">
                                I consent to sharing my location and contact details with hospitals during emergencies. I understand that I can toggle my availability status at any time.
                              </label>
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  )}

                  {/* ── Submit Button ── */}
                  <button
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin material-symbols-outlined text-base">progress_activity</span>
                        {mode === "signin" ? "Signing in..." : "Sending verification code..."}
                      </>
                    ) : (
                      <>
                        <span>{mode === "signin" ? "Sign In" : (role === "Patient" ? "Complete Registration" : "Sign Up")}</span>
                        <span className="material-symbols-outlined">
                          {mode === "signin" ? "login" : (role === "Patient" ? "arrow_forward" : "person_add")}
                        </span>
                      </>
                    )}
                  </button>

                  {/* ── Divider & Google ── */}
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
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </form>

                <p className="mt-8 text-center text-sm text-slate-500">
                  {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
                  <button
                    className="text-primary font-bold hover:underline"
                    onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
                  >
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
