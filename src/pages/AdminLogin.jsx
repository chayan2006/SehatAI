import React, { useState } from 'react';
import { userService } from '../database/userService';


export default function AdminLogin({ onConfirm, onBack }) {
    const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [institution, setInstitution] = useState('');
    const [npi, setNpi] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (mode === 'signin') {
                await userService.signIn({ email, password });
            } else {
                await userService.signUp({
                    email,
                    password,
                    fullName,
                    role: 'admin',
                    hospitalName: institution, // Map institution to hospital name for admin
                });
            }
            onConfirm();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };


    if (mode === 'signup') {
        return (
            <div className="bg-background-light font-display antialiased overflow-hidden">
                <div className="flex h-screen w-full">
                    <div className="w-full lg:w-1/2 flex flex-col justify-between items-center px-8 lg:px-24 bg-white relative dna-pattern overflow-y-auto">

                        <div className="w-full max-w-md pt-8 self-start">
                            <button
                                onClick={onBack}
                                className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium text-sm"
                            >
                                <span className="material-symbols-outlined text-lg">arrow_back</span>
                                Back to Gateway
                            </button>
                        </div>

                        <div className="max-w-md w-full py-8 space-y-8 z-10 flex-1 flex flex-col justify-center">
                            <div className="lg:hidden flex items-center gap-3 mb-4">
                                <span className="material-symbols-outlined text-vital-green text-4xl">shield</span>
                                <h1 className="text-2xl font-bold text-slate-900">SehatAI</h1>
                            </div>
                            <div className="text-left">
                                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Registration</h2>
                                <p className="mt-2 text-slate-500 font-satoshi">HIPAA-Compliant multi-agent health monitoring enrollment.</p>
                            </div>

                            <div className="bg-slate-100 p-1 rounded-xl flex items-center">
                                <button onClick={() => setMode('signin')} className="flex-1 py-2 text-sm font-medium rounded-lg text-slate-500 hover:text-slate-700 transition-all">Sign In</button>
                                <button className="flex-1 py-2 text-sm font-semibold rounded-lg bg-white shadow-sm text-slate-900 transition-all">Sign Up</button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="name">Admin Full Name</label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">person</span>
                                            <input 
                                                className="block w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-all" 
                                                id="name" name="name" placeholder="Dr. Sarah Chen" required type="text" 
                                                value={fullName} onChange={(e) => setFullName(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="email-signup">Professional Email</label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">alternate_email</span>
                                            <input 
                                                autoComplete="email" 
                                                className="block w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-all" 
                                                id="email-signup" name="email" placeholder="s.chen@medical-center.org" required type="email" 
                                                value={email} onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="password-signup">Password</label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                                            <input 
                                                className="block w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-all" 
                                                id="password-signup" name="password" placeholder="••••••••" required type="password" 
                                                value={password} onChange={(e) => setPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="institution">Institution/Hospital Name</label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">account_balance</span>
                                            <input 
                                                className="block w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-all" 
                                                id="institution" name="institution" placeholder="Central Health Institute" required type="text" 
                                                value={institution} onChange={(e) => setInstitution(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="npi">Authorized NPI Number / Verification Code</label>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">verified</span>
                                            <input 
                                                className="block w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-all" 
                                                id="npi" name="npi" placeholder="10-digit NPI or Secure Code" required type="text" 
                                                value={npi} onChange={(e) => setNpi(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl">
                                        {error}
                                    </div>
                                )}

                                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex gap-3">
                                    <span className="material-symbols-outlined text-slate-400 text-lg">info</span>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        <strong>Security Notice:</strong> Accounts require manual verification by the Chief Medical Officer or System Architect before access is granted to patient-sensitive data streams.
                                    </p>
                                </div>
                                <div className="pt-2">
                                    <button 
                                        className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-vital-green hover:bg-vital-green/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vital-green transition-all disabled:opacity-50" 
                                        type="submit"
                                        disabled={loading}
                                    >
                                        {loading ? "Initializing..." : "Create Secure Admin Account"}
                                    </button>
                                </div>
                            </form>


                            <div className="pt-8 mt-4 border-t border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                                    <span className="text-xs font-bold uppercase tracking-wider text-primary">System Status: Operational</span>
                                </div>
                                <div className="flex items-center gap-1 text-slate-400">
                                    <span className="material-symbols-outlined text-sm">verified_user</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest">v2.4.0 HIPAA-SECURE</span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full max-w-md pb-8 self-end text-center text-slate-300 font-bold uppercase tracking-[0.4em] text-[10px] select-none">
                            SehatAI Advanced Intelligence Protection
                        </div>
                    </div>

                    <div className="hidden lg:flex w-1/2 bg-vital-green relative flex-col justify-between items-center text-white px-12 overflow-y-auto">
                        <div className="absolute inset-0 opacity-20 pointer-events-none">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -mr-20 -mt-20"></div>
                            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl -ml-20 -mb-20"></div>
                        </div>

                        <div className="w-full pt-8 self-start text-transparent select-none">Spacer</div>

                        <div className="relative z-10 w-full max-w-lg text-center space-y-12 flex-1 flex flex-col justify-center items-center py-8">
                            <div className="inline-flex p-6 bg-white/10 backdrop-blur-md rounded-[2.5rem] border border-white/20 shadow-2xl mb-4">
                                <span className="material-symbols-outlined text-white text-[120px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 200" }}>shield_with_heart</span>
                            </div>
                            <div className="space-y-6">
                                <h2 className="text-5xl font-black leading-tight tracking-tight">
                                    Empowering Clinical Excellence with <span className="text-white/80 italic">Agentic AI</span>
                                </h2>
                                <p className="text-xl font-medium text-white/90 max-w-md mx-auto leading-relaxed">
                                    Begin your onboarding journey. Our multi-agent intelligence ensures your institution stays ahead of critical health alerts with 99.9% precision.
                                </p>
                            </div>
                            <div className="grid grid-cols-3 gap-4 pt-6 w-full">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                                        <span className="material-symbols-outlined text-2xl">how_to_reg</span>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">1. Register</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 opacity-60">
                                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                                        <span className="material-symbols-outlined text-2xl">fact_check</span>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">2. Verify</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 opacity-60">
                                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                                        <span className="material-symbols-outlined text-2xl">rocket_launch</span>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">3. Deploy</span>
                                </div>
                            </div>
                            <div className="mt-16 py-4 px-8 bg-black/10 backdrop-blur-sm rounded-full inline-flex items-center gap-3 border border-white/10">
                                <span className="flex h-2 w-2 rounded-full bg-white"></span>
                                <span className="text-sm font-semibold tracking-wide">Onboarding: Waiting for manual architect verification...</span>
                            </div>
                        </div>

                        <div className="w-full pb-8 self-end flex items-center gap-3 z-10">
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-vital-green text-xl">shield</span>
                            </div>
                            <span className="font-bold text-lg tracking-tighter">SehatAI Admin</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background-light font-display antialiased overflow-hidden">
            <div className="flex h-screen w-full">
                {/* Left Side: Clinical White Minimalist Form */}
                <div className="w-full lg:w-1/2 flex flex-col justify-between items-center px-8 lg:px-24 bg-white relative dna-pattern">

                    <div className="w-full max-w-md pt-8 self-start">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium text-sm"
                        >
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            Back to Gateway
                        </button>
                    </div>

                    <div className="max-w-md w-full py-8 space-y-8 z-10 flex-1 flex flex-col justify-center">
                        {/* Branding Mobile Only */}
                        <div className="lg:hidden flex items-center gap-3 mb-8 pt-8">
                            <span className="material-symbols-outlined text-vital-green text-4xl">shield</span>
                            <h1 className="text-2xl font-bold text-slate-900">SehatAI</h1>
                        </div>
                        <div className="text-left">
                            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Gateway</h2>
                            <p className="mt-2 text-slate-500 font-satoshi">Secure access for Senior AI Architects & Institutions</p>
                        </div>

                        {/* Toggle Switch */}
                        <div className="bg-slate-100 p-1 rounded-xl flex items-center">
                            <button className="flex-1 py-2 text-sm font-semibold rounded-lg bg-white shadow-sm text-slate-900 transition-all">Sign In</button>
                            <button onClick={() => setMode('signup')} className="flex-1 py-2 text-sm font-medium rounded-lg text-slate-500 hover:text-slate-700 transition-all">Sign Up</button>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="email-signin">Admin Email</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">alternate_email</span>
                                        <input 
                                            autoComplete="email" 
                                            className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-all" 
                                            id="email-signin" name="email" placeholder="architect@institution.org" required type="email" 
                                            value={email} onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-sm font-semibold text-slate-700" htmlFor="token">Security Token / Password</label>
                                        <button
                                            className="text-xs font-medium text-primary hover:text-primary/80 cursor-pointer"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                alert("Token reset protocol initiated. Please check your secure email.");
                                            }}
                                        >
                                            Reset Token?
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">encrypted</span>
                                        <input 
                                            className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-all" 
                                            id="token" name="token" placeholder="••••••••••••••••" required type="password" 
                                            value={password} onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl">
                                    {error}
                                </div>
                            )}

                            <div className="pt-2">
                                <button 
                                    className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50" 
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? "Initializing..." : "Initialize Secure Session"}
                                </button>
                            </div>

                            <div className="relative my-6">
                                <div aria-hidden="true" className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-slate-400 font-medium">Or Use High-Security Hardware</span>
                                </div>
                            </div>

                            {/* MFA Integration */}
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    className="flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all group"
                                    type="button"
                                    onClick={() => alert("Initializing Biometric Hardware Capture...")}
                                >
                                    <span className="material-symbols-outlined text-slate-600 group-hover:text-primary">fingerprint</span>
                                    <span className="text-sm font-semibold text-slate-700">Biometric</span>
                                </button>
                                <button
                                    className="flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all group"
                                    type="button"
                                    onClick={() => alert("Searching for FIDO2 Security Key on USB/NFC...")}
                                >
                                    <span className="material-symbols-outlined text-slate-600 group-hover:text-primary">key</span>
                                    <span className="text-sm font-semibold text-slate-700">FIDO2 Key</span>
                                </button>
                            </div>
                        </form>


                        {/* Bottom Emergency Alert / Status */}
                        <div className="pt-8 mt-4 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                                <span className="text-xs font-bold uppercase tracking-wider text-primary">System Status: Operational</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-400">
                                <span className="material-symbols-outlined text-sm">verified_user</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest">v2.4.0 HIPAA-SECURE</span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full max-w-md pb-8 self-end text-center text-slate-300 font-bold uppercase tracking-[0.4em] text-[10px] select-none">
                        SehatAI Advanced Intelligence Protection
                    </div>
                </div>

                <div className="hidden lg:flex w-1/2 bg-vital-green relative flex-col justify-between items-center text-white px-12 overflow-y-auto">
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -mr-20 -mt-20"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl -ml-20 -mb-20"></div>
                    </div>

                    <div className="w-full pt-8 self-start text-transparent select-none">Spacer</div>

                    <div className="relative z-10 w-full max-w-lg text-center space-y-12 flex-1 flex flex-col justify-center items-center py-8">
                        <div className="inline-flex p-6 bg-white/10 backdrop-blur-md rounded-[2.5rem] border border-white/20 shadow-2xl mb-4">
                            <span className="material-symbols-outlined text-white text-[120px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 200" }}>shield_with_heart</span>
                        </div>
                        <div className="space-y-6">
                            <h2 className="text-5xl font-black leading-tight tracking-tight">
                                Securing the Future of <span className="text-white/80 italic">Health Intelligence</span>
                            </h2>
                            <p className="text-xl font-medium text-white/90 max-w-md mx-auto leading-relaxed">
                                HIPAA-Compliant Multi-Agent Intelligence for Senior AI Architects and Health Institutions.
                            </p>
                        </div>

                        <div className="flex justify-center gap-8 pt-6 w-full">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                                    <span className="material-symbols-outlined text-2xl">security</span>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">ISO 27001</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                                    <span className="material-symbols-outlined text-2xl">health_and_safety</span>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">HIPAA Compliant</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                                    <span className="material-symbols-outlined text-2xl">hub</span>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Multi-Agent</span>
                            </div>
                        </div>

                        <div className="mt-16 py-4 px-8 bg-black/10 backdrop-blur-sm rounded-full inline-flex items-center gap-3 border border-white/10">
                            <span className="flex h-2 w-2 rounded-full bg-white"></span>
                            <span className="text-sm font-semibold tracking-wide">System Trust: SehatAI Sentinel is actively monitoring...</span>
                        </div>
                    </div>

                    <div className="w-full pb-8 self-end flex items-center gap-3 z-10">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-vital-green text-xl">shield</span>
                        </div>
                        <span className="font-bold text-lg tracking-tighter">SehatAI Admin</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
