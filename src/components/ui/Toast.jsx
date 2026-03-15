import React, { useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Loader2, X } from 'lucide-react';

// ── Toast component ─────────────────────────────────────────────────────────
export function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-semibold min-w-[280px] max-w-[360px] animate-in slide-in-from-bottom-4 duration-300
            ${t.type === 'success' ? 'bg-white border-emerald-200 text-emerald-800' :
              t.type === 'error'   ? 'bg-white border-red-200 text-red-800' :
              t.type === 'loading' ? 'bg-white border-slate-200 text-slate-700' :
                                     'bg-white border-slate-200 text-slate-700'}`}
        >
          {t.type === 'loading' && <Loader2 className="w-4 h-4 animate-spin text-slate-400 shrink-0" />}
          {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
          {t.type === 'error'   && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
          <span className="flex-1">{t.message}</span>
          {t.type !== 'loading' && (
            <button onClick={() => removeToast(t.id)} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ── useToast hook ─────────────────────────────────────────────────────────────
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    if (type !== 'loading') {
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Helper: show loading → then replace with success/error
  const withToast = useCallback(async (asyncFn, { loading, success, error }) => {
    const id = addToast(loading, 'loading');
    try {
      const result = await asyncFn();
      removeToast(id);
      addToast(success, 'success');
      return result;
    } catch (err) {
      removeToast(id);
      addToast(error || err?.message || 'Something went wrong', 'error');
      throw err;
    }
  }, [addToast, removeToast]);

  return { toasts, addToast, removeToast, withToast };
}
