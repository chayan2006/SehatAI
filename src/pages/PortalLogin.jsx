import React, { useState } from "react";

export default function PortalLogin({ onLogin, initialRole = "doctor" }) {
  const [mode, setMode] = useState("signin");
  const [role, setRole] = useState(
    initialRole === "doctor"
      ? "Hospital"
      : initialRole === "patient"
        ? "Patient"
        : "Admin",
  );

  // Convert Interface role to internal role
  const getInternalRole = (displayRole) => {
    if (displayRole === "Hospital") return "doctor";
    if (displayRole === "Patient") return "patient";
    if (displayRole === "Admin") return "admin";
    return "doctor";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(getInternalRole(role));
  };

  return (
    <div className="bg-background-light font-display text-slate-900 min-h-screen">
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        <div className="flex h-full grow flex-col">
          {/* Top Navigation Bar */}
          <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-primary/10 bg-white px-6 md:px-10 py-3 sticky top-0 z-50">
            <div className="flex items-center gap-4 text-primary">
              <div className="size-8 flex items-center justify-center bg-primary rounded-lg text-white">
                <span className="material-symbols-outlined">
                  health_and_safety
                </span>
              </div>
              <h2
                className="text-slate-900 text-xl font-bold leading-tight tracking-tight cursor-pointer hover:text-primary transition-colors"
                onClick={() => onLogin("gateway_back")}
              >
                Sehat AI
              </h2>
            </div>
            <div className="flex flex-1 justify-end gap-4 items-center">
              <span className="text-sm text-slate-500 hidden md:block">
                HIPAA Compliant System
              </span>
              <div className="bg-primary/10 rounded-full p-1 border border-primary/20">
                <span className="material-symbols-outlined text-primary text-xl px-1">
                  lock
                </span>
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
                    {mode === "signin"
                      ? `Access your ${role} portal securely.`
                      : `Join Sehat AI to manage your ${role} operations.`}
                  </p>
                </div>
                {/* Login Fields */}
                <form className="space-y-5" onSubmit={handleSubmit}>
                  {mode === "signup" && role === "Hospital" && (
                    <div className="flex flex-col gap-2">
                      <label className="text-slate-700 text-sm font-semibold">
                        Hospital Name
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          local_hospital
                        </span>
                        <input
                          className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                          placeholder="Enter hospital name"
                          type="text"
                          required
                        />
                      </div>
                    </div>
                  )}
                  {mode === "signup" && role === "Patient" && (
                    <div className="flex flex-col gap-2">
                      <label className="text-slate-700 text-sm font-semibold">
                        Full Name
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          person
                        </span>
                        <input
                          className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                          placeholder="Enter your name"
                          type="text"
                          required
                        />
                      </div>
                    </div>
                  )}
                  {mode === "signup" && role === "Admin" && (
                    <div className="flex flex-col gap-2">
                      <label className="text-slate-700 text-sm font-semibold">
                        Admin Full Name
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                          shield
                        </span>
                        <input
                          className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                          placeholder="Enter your name"
                          type="text"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <label className="text-slate-700 text-sm font-semibold">
                      Email or Username
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        mail
                      </span>
                      <input
                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                        placeholder="Enter your credentials"
                        type="text"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-slate-700 text-sm font-semibold">
                      Password
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        lock_open
                      </span>
                      <input
                        className="w-full pl-12 pr-12 py-4 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                        placeholder="••••••••"
                        type="password"
                        required
                      />
                      <button
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary"
                        type="button"
                      >
                        <span className="material-symbols-outlined">
                          visibility
                        </span>
                      </button>
                    </div>
                  </div>

                  {mode === "signin" && (
                    <div className="flex items-center justify-between py-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary bg-white"
                          type="checkbox"
                        />
                        <span className="text-sm text-slate-600 font-medium">
                          Remember me
                        </span>
                      </label>
                      <a
                        className="text-sm text-primary font-bold hover:underline"
                        href="#"
                      >
                        Forgot password?
                      </a>
                    </div>
                  )}
                  <button
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                    type="submit"
                  >
                    <span>{mode === "signin" ? "Sign In" : "Sign Up"}</span>
                    <span className="material-symbols-outlined">
                      {mode === "signin" ? "login" : "person_add"}
                    </span>
                  </button>
                </form>
                {/* Social Login */}
                {mode === "signin" && (
                  <div className="mt-8">
                    <div className="relative flex items-center justify-center mb-6">
                      <div className="w-full border-t border-slate-200"></div>
                      <span className="absolute bg-white px-4 text-sm text-slate-400">
                        Or continue with
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <button className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                        <img
                          className="size-5"
                          alt="Google logo for social login"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsMzC7BC7LQzIBLnrJ4SC1JqWmLrpcpntDILB7jEPMZcsLYOonCvchBVEr5aRfOLUdD9gGVgLYQdWWtFESqO5jtci20HRN1B1yj-d9lqulTQ1pRCiMd5kqidhX2bhg8KcBcY8oTGQXJwWEL7OmnSRogMl9PfoYt7XTZhhN1O4hGROiUqFWpbKW84V3RzigvN1l3uCD-nYF9ieZDs_GfQhreKs50OxnWUkFr6KRDrGbk-JCWc1klb6stdi2ySHYPFY5t9tbCo_mGwg0"
                        />
                        <span className="text-sm font-semibold text-slate-700">
                          Google
                        </span>
                      </button>
                      <button className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                        <img
                          className="size-5"
                          alt="Facebook logo for social login"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDfGj59exUm69bILQzL5x18j-pVKIpJKOS-2tbHtK9Uel8xpCuuvy29mo_KW-DSOaiACF9LeAfL3eXh3IGpPDSnvv8-VlgyFLngKKaE09WnjUF3XciPJYU9DE93bItMPeeETeN7yzGiCJZjrLC9m0-SiAhonFahE1uZjG2-X8FbHItmqcaLS09s9Lz7ld5SfMpHFhdLrwodMSwBqDwOMIXaZZAqxzMsqoKMpS74iKWvtL6DLZahCthDOzNE-MGhlJtojwX3116_0Mj"
                        />
                        <span className="text-sm font-semibold text-slate-700">
                          Facebook
                        </span>
                      </button>
                    </div>
                  </div>
                )}
                <p className="mt-8 text-center text-sm text-slate-500">
                  {mode === "signin"
                    ? "Don't have an account? "
                    : "Already have an account? "}
                  <button
                    className="text-primary font-bold hover:underline"
                    onClick={() =>
                      setMode(mode === "signin" ? "signup" : "signin")
                    }
                  >
                    {mode === "signin" ? "Register your hospital" : "Sign in"}
                  </button>
                </p>
              </div>
              {/* Image/Illustration Section */}
              <div className="hidden lg:block relative overflow-hidden bg-primary/5">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-[#0f231f]/90 z-10"></div>
                <img
                  className="absolute h-full w-full object-cover"
                  alt="Healthcare"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTEQFayjZRzckOURrukHZEo_hsFBbDFSOHjVnMEhJuBir5IuUJc4AJwLrQTo3Z-O6UewP3nr11pesY0uw5JRJxZDacFTZVHSoDyHW-qUv23GYPnPkmDU1_KOyg-7ZvZd_-7xt9zVq2SifFw3qVKUtPtwMXiDqyWBsS1U-KKXLlHli-h_rtfguNmPA55fND4lw50-HCFfWXQNRzszR8L55RwxUi4GEZ0hM9LKOTwUuo7keq74sbCSM8haNCWZAJGmKudVuJ57FZqT4r"
                />
                <div className="relative z-20 h-full flex flex-col justify-end p-16 text-white">
                  <div className="mb-6 inline-flex p-3 bg-white/20 backdrop-blur-md rounded-2xl w-fit">
                    <span className="material-symbols-outlined text-4xl">
                      monitoring
                    </span>
                  </div>
                  <h2 className="text-4xl font-bold mb-4 leading-tight">
                    Empowering Healthcare with AI Precision
                  </h2>
                  <p className="text-lg text-white/80 leading-relaxed max-w-md">
                    Real-time patient monitoring, predictive analytics, and
                    secure healthcare management for modern clinical
                    environments.
                  </p>
                  <div className="mt-12 flex gap-4">
                    <div className="flex -space-x-3">
                      <div
                        className="size-10 rounded-full border-2 border-primary bg-slate-300 bg-cover"
                        style={{
                          backgroundImage:
                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB9znIzywpEwc7QhLEz5QniJpIAsFyZqhpPqCFyG1eq2N6sBr1gfhhi1p2JuGUGg4D4Govg9hqHhXHsVLBy0rgNlPGaAaa8xmV--LEPb88drq43m8mWW7p3ebRgrgxnWBOrp9WPWx8w2F35g_s_UmW3mNLUIaK4rbo5cOVnYsjG4Ti-oCRJ0QDe_n05Z5U-VNbIs9dS_LPvCtweYDB9OCSWgLBDJiupBz24SCyJfV-ONzUe7Ltk0_IKOla6zswcnA7OuixpmhIzgP9N')",
                        }}
                      ></div>
                      <div
                        className="size-10 rounded-full border-2 border-primary bg-slate-300 bg-cover"
                        style={{
                          backgroundImage:
                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD4WNK-4Qe1N7a-nXCxZXlGfVlPMlNZd_oDHN-2mxQtwHnYymcmc09z16bHVbkvOsDOreHTa1E3OE95HWg3VUL0XDZL-fYKBwTe6DM35dUCUxPVoJZp23jQ4q_paDhFd8CMZltZ22Id8NtvqcVOdFdYar7YxRPuFYyOt7AdNqC5JqOikQhgmzwzGO-Nc49aUgpk3V3TFTHKR5E0fmUkimjpY_pwb_sLIgQ4yZpI7kd24ZJAVowW-7X6zw6fb4bp0-T8Eu4QxVOPgzNn')",
                        }}
                      ></div>
                      <div
                        className="size-10 rounded-full border-2 border-primary bg-slate-300 bg-cover"
                        style={{
                          backgroundImage:
                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAj-tbnLfq_TeP242LS89QpsySECbq_8pixbnoyhxhr35pyZLfq6u17pAubqYKOwpoGndvsp1Co1jyfbOJSCoeR7Ku2nzK4eUCdvZzLGITH0nKPMkYZSs9cMMHugYrgV_Zl7E1R0EQYQ2gf7do40ipNGKMVTQCm8NBF5RjOD6MjzhkbrAoQRkN2c0R5nbNT61eXrq8b7e0qJ-mghF7c6a9jKkyjM081znElzUn0wU6esN-xENLPi91nSUVqWA2nnLbqRA27SHSI5wX1')",
                        }}
                      ></div>
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="text-xs font-bold uppercase tracking-wider text-white">
                        Trusted by
                      </span>
                      <span className="text-sm font-medium">
                        500+ Healthcare Providers
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
          {/* Footer */}
          <footer className="p-6 text-center text-slate-400 text-sm">
            <div className="flex flex-wrap justify-center gap-6 mb-4">
              <a className="hover:text-primary transition-colors" href="#">
                Privacy Policy
              </a>
              <a className="hover:text-primary transition-colors" href="#">
                Terms of Service
              </a>
              <a className="hover:text-primary transition-colors" href="#">
                HIPAA Compliance
              </a>
              <a className="hover:text-primary transition-colors" href="#">
                Support
              </a>
            </div>
            <p>
              © 2024 Sehat AI. All rights reserved. Secure 256-bit SSL
              Encrypted.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
