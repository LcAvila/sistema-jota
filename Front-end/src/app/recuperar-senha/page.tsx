"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/api";

export default function RecoverPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailValid = /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!emailValid) {
      setError("Informe um e-mail válido");
      return;
    }
    setLoading(true);
    try {
      const res = await requestPasswordReset(email);
      setInfo(res.message);
    } catch (err: any) {
      setError(err?.message || "Não foi possível iniciar a recuperação");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-slate-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="relative rounded-2xl border border-slate-200/70 bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm shadow-xl p-6 sm:p-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="rounded-full border border-emerald-100 bg-white p-3 shadow-sm">
              <Image src="/assets/logo/logo.png" alt="Logo" width={48} height={48} className="h-12 w-12 object-contain" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Recuperar senha</h1>
              <p className="text-sm text-slate-600 dark:text-slate-300">Informe seu e-mail para receber instruções.</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="text-sm rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
                {error}
              </div>
            )}
            {info && (
              <div className="text-sm rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200">
                {info}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">E-mail</label>
              <input
                type="email"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-900/40"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
                required
                autoComplete="email"
                spellCheck={false}
              />
              {!emailValid && email.length > 0 && (
                <p className="text-xs text-red-600">Formato de e-mail inválido</p>
              )}
            </div>

            <button
              disabled={!emailValid || loading}
              type="submit"
              className="group relative inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:opacity-60 dark:focus:ring-emerald-900/50"
            >
              {loading && (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
              )}
              <span>{loading ? "Enviando..." : "Enviar instruções"}</span>
            </button>

            <div className="text-center text-sm">
              <Link href="/login" className="text-emerald-700 hover:text-emerald-800 dark:text-emerald-300">Voltar ao login</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
