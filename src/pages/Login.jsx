import React, { useEffect, useRef, useState } from 'react';

/* ── tiny hook: count up to a number once visible ── */
function useCountUp(target, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const step = target / (duration / 16);
      const tick = () => {
        start += step;
        if (start >= target) { setCount(target); return; }
        setCount(Math.floor(start));
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);
  return [count, ref];
}

/* ── fade-in-up on scroll ── */
function FadeIn({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
        opacity: vis ? 1 : 0,
        transform: vis ? 'translateY(0)' : 'translateY(28px)',
      }}
    >
      {children}
    </div>
  );
}

/* ── stat pill ── */
function Stat({ value, suffix, label, duration }) {
  const [count, ref] = useCountUp(value, duration);
  return (
    <div ref={ref} className="text-center">
      <p className="text-5xl font-black text-white tabular-nums">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-sm font-bold uppercase tracking-widest text-white/70 mt-2">{label}</p>
    </div>
  );
}

export default function Login({ onLogin }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const features = [
    { icon: 'psychology', color: '#6366f1', bg: '#eef2ff', title: 'AI-Powered Diagnosis', desc: 'Multi-modal AI agents analyze X-rays, CT scans, skin conditions, and injuries with clinical-grade accuracy using custom-trained deep learning models.' },
    { icon: 'trending_up', color: '#0ea5e9', bg: '#e0f2fe', title: 'Predictive Health Monitoring', desc: 'Real-time vitals tracking with anomaly detection and early-warning algorithms that notify care teams before conditions become critical.' },
    { icon: 'notifications_active', color: '#f59e0b', bg: '#fffbeb', title: 'Emergency Alerts', desc: 'Instant push, SMS, and email notifications during critical patient events — with one-tap escalation to nearby hospitals and ambulance services.' },
    { icon: 'local_hospital', color: '#00b289', bg: '#ecfdf5', title: 'Hospital Command Center', desc: 'Real-time ward management, staff scheduling, pharmacy inventory, and lab results in a unified clinical operations dashboard.' },
    { icon: 'insights', color: '#8b5cf6', bg: '#f5f3ff', title: 'Analytics & Reports', desc: 'Automated PDF diagnostic reports, compliance audits, and regional health trend dashboards with role-based access controls.' },
    { icon: 'shield', color: '#10b981', bg: '#ecfdf5', title: 'HIPAA-Grade Security', desc: 'End-to-end AES-256 encryption, Firebase authentication, Supabase RLS policies, and continuous security monitoring keep all data safe.' },
  ];

  const steps = [
    { num: '01', icon: 'person_add', title: 'Register & Verify', desc: 'Patients, doctors, and hospitals create accounts. AI verifies credentials and assigns role-specific dashboards instantly.' },
    { num: '02', icon: 'hub', title: 'AI Agents Activate', desc: 'Specialized AI agents — Patient Companion, Hospital Agent, and Diagnostic Engine — begin monitoring and responding in real time.' },
    { num: '03', icon: 'favorite', title: 'Better Healthcare', desc: 'Patients receive faster diagnoses, doctors get intelligent alerts, and hospitals operate with complete situational awareness.' },
  ];

  const roles = [
    {
      icon: 'person_pin',
      label: 'Patients',
      gradient: 'linear-gradient(135deg, #00b289 0%, #00a07a 100%)',
      perks: ['Track vitals & health history', 'AI-assisted symptom analysis', 'Book ambulances in seconds', 'Real-time medication reminders', 'Diagnostic report downloads'],
      cta: 'Get Started as Patient',
      action: 'patient',
    },
    {
      icon: 'local_hospital',
      label: 'Hospitals',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      perks: ['Real-time patient monitoring', 'Ward & bed management', 'AI triage & emergency routing', 'Staff and inventory dashboards', 'Cross-hospital network'],
      cta: 'Get Started as Hospital',
      action: 'doctor',
    },
    {
      icon: 'admin_panel_settings',
      label: 'Admins',
      gradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      perks: ['Full network oversight', 'Hospital & donor management', 'Regional analytics', 'AI engine configuration', 'Export compliance reports'],
      cta: 'Get Started as Admin',
      action: 'admin',
    },
  ];

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#0f172a', background: '#f8fafc' }}>

      {/* ── NAVBAR ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        boxShadow: scrolled ? '0 1px 20px rgba(0,0,0,0.08)' : 'none',
        transition: 'all 0.3s ease',
        borderBottom: scrolled ? '1px solid #e2e8f0' : '1px solid transparent',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 68 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, background: '#00b289', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 22, fontVariationSettings: "'FILL' 1" }}>shield_with_heart</span>
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px' }}>
              Sehat<span style={{ color: '#00b289' }}>AI</span>
            </span>
          </div>

          {/* Nav links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {['Features', 'How It Works', 'Roles', 'Support'].map(link => (
              <a key={link} href={`#${link.toLowerCase().replace(/ /g, '-')}`}
                style={{ fontSize: 14, fontWeight: 500, color: '#475569', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#00b289'}
                onMouseLeave={e => e.target.style.color = '#475569'}
              >{link}</a>
            ))}
          </nav>

          {/* CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => onLogin('patient')}
              style={{ fontSize: 14, fontWeight: 600, color: '#475569', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 16px' }}>
              Log In
            </button>
            <button onClick={() => onLogin('patient', 'signup')}
              style={{ background: '#00b289', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 22px', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,178,137,0.3)', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.target.style.background = '#009e7b'; e.target.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.target.style.background = '#00b289'; e.target.style.transform = 'translateY(0)'; }}
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 32px 80px', textAlign: 'center', background: '#ffffff', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle grid background */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0,178,137,.04) 25%, rgba(0,178,137,.04) 26%, transparent 27%, transparent 74%, rgba(0,178,137,.04) 75%, rgba(0,178,137,.04) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0,178,137,.04) 25%, rgba(0,178,137,.04) 26%, transparent 27%, transparent 74%, rgba(0,178,137,.04) 75%, rgba(0,178,137,.04) 76%, transparent 77%, transparent)', backgroundSize: '50px 50px', pointerEvents: 'none' }} />
        {/* Radial glow */}
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(0,178,137,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 780, margin: '0 auto' }}>
          {/* Pill badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 999, padding: '6px 16px', marginBottom: 28 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00b289', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: '#00b289', textTransform: 'uppercase' }}>AI-Powered Healthcare Platform</span>
          </div>

          <h1 style={{ fontSize: 'clamp(42px, 6vw, 72px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-2px', marginBottom: 24 }}>
            Every Life Matters.<br />
            <span style={{ color: '#00b289', textDecoration: 'underline', textDecorationColor: '#00b28940', textDecorationThickness: 4, textUnderlineOffset: 6 }}>SehatAI</span> Makes It Count.
          </h1>

          <p style={{ fontSize: 18, color: '#64748b', maxWidth: 580, margin: '0 auto 40px', lineHeight: 1.7 }}>
            SehatAI connects patients, doctors, and hospitals with AI-powered diagnostics, real-time monitoring, emergency routing, and predictive health intelligence — all in one unified platform.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}>
            <button onClick={() => onLogin('patient', 'signup')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#00b289', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 28px', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 6px 24px rgba(0,178,137,0.3)', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>favorite</span>
              Start as Patient
            </button>
            <button onClick={() => onLogin('doctor')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', color: '#1e293b', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '14px 28px', fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#00b289'; e.currentTarget.style.color = '#00b289'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#1e293b'; }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>local_hospital</span>
              Hospital Portal
            </button>
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['HIPAA Compliant', 'AES-256 Encrypted', 'AI-Verified Data', '24/7 Emergency Network'].map(badge => (
              <div key={badge} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#00b289' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>verified</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{badge}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: '#94a3b8', animation: 'scrollBounce 2s infinite' }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Scroll</span>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>keyboard_arrow_down</span>
        </div>
      </section>

      {/* ── STATS BANNER ── */}
      <section style={{ background: '#00b289', padding: '60px 32px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40 }}>
          <Stat value={48000} suffix="+" label="Patients Monitored" duration={1800} />
          <Stat value={230} suffix="+" label="Partner Hospitals" duration={1600} />
          <Stat value={97} suffix="%" label="AI Accuracy Rate" duration={1400} />
          <Stat value={8} suffix=" min" label="Avg. Response Time" duration={1200} />
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: '96px 32px', background: '#ffffff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: '#00b289', textTransform: 'uppercase' }}>The Process</span>
              <h2 style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-1px', marginTop: 12, marginBottom: 12 }}>How SehatAI Works</h2>
              <p style={{ color: '#64748b', fontSize: 16 }}>Three simple steps that connect patients to world-class AI-assisted healthcare.</p>
            </div>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {steps.map((s, i) => (
              <FadeIn key={s.num} delay={i * 120}>
                <div style={{ background: '#f8fafc', borderRadius: 20, padding: '36px 28px', border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden', transition: 'all 0.3s', cursor: 'default' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <span style={{ position: 'absolute', top: 16, right: 20, fontSize: 64, fontWeight: 900, color: '#e2e8f0', lineHeight: 1 }}>{s.num}</span>
                  <div style={{ width: 48, height: 48, background: '#ecfdf5', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                    <span className="material-symbols-outlined" style={{ color: '#00b289', fontSize: 24 }}>{s.icon}</span>
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES / CAPABILITIES ── */}
      <section id="features" style={{ padding: '96px 32px', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: '#00b289', textTransform: 'uppercase' }}>Capabilities</span>
              <h2 style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-1px', marginTop: 12 }}>Built to Save Lives, Not Just Connect Them</h2>
            </div>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {features.map((f, i) => (
              <FadeIn key={f.title} delay={i * 80}>
                <div style={{ background: '#ffffff', borderRadius: 20, padding: '32px 28px', border: '1px solid #e2e8f0', transition: 'all 0.3s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = f.color + '40'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                >
                  <div style={{ width: 44, height: 44, background: f.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                    <span className="material-symbols-outlined" style={{ color: f.color, fontSize: 22 }}>{f.icon}</span>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLES ── */}
      <section id="roles" style={{ padding: '96px 32px', background: '#ffffff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: '#00b289', textTransform: 'uppercase' }}>Who It's For</span>
              <h2 style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-1px', marginTop: 12 }}>Three Roles. One Mission.</h2>
            </div>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {roles.map((r, i) => (
              <FadeIn key={r.label} delay={i * 120}>
                <div style={{ borderRadius: 24, overflow: 'hidden', border: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', flexDirection: 'column', transition: 'all 0.3s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 24px 60px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  {/* Colored header */}
                  <div style={{ background: r.gradient, padding: '28px 28px 24px' }}>
                    <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                      <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 20 }}>{r.icon}</span>
                    </div>
                    <h3 style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{r.label}</h3>
                  </div>
                  {/* Features list */}
                  <div style={{ padding: '24px 28px', flex: 1 }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {r.perks.map(p => (
                        <li key={p} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: '#334155' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#00b289', marginTop: 1, flexShrink: 0, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* CTA */}
                  <div style={{ padding: '0 28px 28px' }}>
                    <button
                      onClick={() => onLogin(r.action, r.action === 'patient' ? 'signup' : undefined)}
                      style={{ width: '100%', padding: '13px 0', border: '1.5px solid #e2e8f0', background: '#fff', borderRadius: 12, fontWeight: 700, fontSize: 14, color: '#1e293b', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.target.style.background = '#f8fafc'; e.target.style.borderColor = '#00b289'; e.target.style.color = '#00b289'; }}
                      onMouseLeave={e => { e.target.style.background = '#fff'; e.target.style.borderColor = '#e2e8f0'; e.target.style.color = '#1e293b'; }}
                    >
                      {r.cta}
                    </button>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: '80px 32px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', textAlign: 'center' }}>
        <FadeIn>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <div style={{ width: 56, height: 56, background: 'rgba(0,178,137,0.15)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <span className="material-symbols-outlined" style={{ color: '#00b289', fontSize: 28, fontVariationSettings: "'FILL' 1" }}>shield_with_heart</span>
            </div>
            <h2 style={{ fontSize: 40, fontWeight: 900, color: '#fff', letterSpacing: '-1px', marginBottom: 16 }}>Ready to Transform Healthcare?</h2>
            <p style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.7, marginBottom: 36 }}>Join thousands of patients, doctors, and hospitals already using SehatAI for smarter, faster, and safer healthcare delivery.</p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => onLogin('patient', 'signup')}
                style={{ background: '#00b289', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 32px', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,178,137,0.4)', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Create Free Account
              </button>
              <button onClick={() => onLogin('doctor')}
                style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '14px 32px', fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              >
                Hospital Sign In
              </button>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0f172a', padding: '0 32px 40px', textAlign: 'center' }}>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 36, maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 30, height: 30, background: '#00b289', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 16, fontVariationSettings: "'FILL' 1" }}>shield_with_heart</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>Sehat<span style={{ color: '#00b289' }}>AI</span></span>
          </div>
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
            {['Privacy Policy', 'Terms of Service', 'HIPAA Compliance', 'Contact Support'].map(l => (
              <a key={l} href="#" style={{ fontSize: 12, color: '#64748b', textDecoration: 'none' }}
                onMouseEnter={e => e.target.style.color = '#00b289'}
                onMouseLeave={e => e.target.style.color = '#64748b'}
              >{l}</a>
            ))}
          </div>
          <p style={{ fontSize: 12, color: '#475569' }}>© 2025 SehatAI. All rights reserved. Not a substitute for professional medical advice.</p>
        </div>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.3); }
        }
        @keyframes scrollBounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(8px); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        @media (max-width: 768px) {
          section > div > div[style*="grid-template-columns: repeat(3"] {
            grid-template-columns: 1fr !important;
          }
          section > div > div[style*="grid-template-columns: repeat(4"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}
