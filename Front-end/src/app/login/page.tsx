"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { loginRequest, saveAuth, hasRole } from "@/lib/auth";
import { useSession } from "@/store/session";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { login: loginSession } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { session } = useSession();

  // Se já estiver logado, redireciona para a página correta
  useEffect(() => {
    if (session) {
      if (hasRole(["admin", "supervisor"], session.role)) {
        router.replace("/admin");
      } else if (hasRole(["seller"], session.role)) {
        router.replace("/painel");
      }
    }
  }, [session, router]);

  const emailValid = /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);
  const passwordValid = password.length >= 6;

  // Prefill email if remembered
  useEffect(() => {
    try {
      const remembered = localStorage.getItem("rememberedEmail");
      if (remembered) {
        setEmail(remembered);
        setRememberMe(true);
      }
    } catch {}
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!emailValid) { setError("Informe um e-mail válido"); return; }
    if (!passwordValid) { setError("Senha deve ter ao menos 6 caracteres"); return; }
    setLoading(true);
    
    try {
      console.log('Iniciando processo de login...');
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
      
      const { token, user } = await loginRequest(email, password);
      console.log('Login bem-sucedido, salvando dados...');
      
      saveAuth(token, user);
      // Preenche a store de sessão usada pelo Guard do /admin
      loginSession({
        userId: user.id,
        name: user.name,
        role: (user.role as any) || "seller",
        token,
        email: user.email,
        storeId: (user as any).storeId,
      });
      
      // Persist or clear remembered email
      try {
        if (rememberMe) localStorage.setItem("rememberedEmail", email);
        else localStorage.removeItem("rememberedEmail");
      } catch {}
      
      console.log('Redirecionando usuário...');
      // Redirecionamento por papel
      if (hasRole(["admin","supervisor"], user.role)) {
        router.replace("/admin");
      } else if (hasRole(["seller"], user.role)) {
        router.replace("/painel");
      } else {
        setError("Seu perfil não possui rota configurada.");
      }
    } catch (err: any) {
      console.error('Erro durante login:', err);
      setError(err?.message || "Falha no login");
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-slate-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="relative rounded-2xl border border-slate-200/70 bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm shadow-xl p-6 sm:p-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="rounded-full border border-emerald-100 bg-white p-3 shadow-sm">
              <Image src="/assets/logo/logo.png" alt="Logo" width={56} height={56} className="h-14 w-14 object-contain" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Bem-vindo ao Painel</h1>
              <p className="text-sm text-slate-600 dark:text-slate-300">Acesso para colaboradores e administradores</p>
            </div>
            
            {/* Informações de debug */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
                <p><strong>Debug:</strong> API URL: {process.env.NEXT_PUBLIC_API_URL || 'Não configurada'}</p>
                <p><strong>Ambiente:</strong> {process.env.NODE_ENV}</p>
              </div>
            )}
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="text-sm rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">E-mail</label>
              <input
                type="email"
                className={`w-full rounded-lg border bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-900/40 ${email.length>0 && !emailValid ? 'border-red-300 focus:border-red-500 focus:ring-red-100 dark:border-red-800 dark:focus:border-red-700 dark:focus:ring-red-900/40' : 'border-slate-200'}`}
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`w-full rounded-lg border bg-white px-3 py-2 pr-10 text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-emerald-400 dark:focus:ring-emerald-900/40 ${password.length>0 && !passwordValid ? 'border-red-300 focus:border-red-500 focus:ring-red-100 dark:border-red-800 dark:focus:border-red-700 dark:focus:ring-red-900/40' : 'border-slate-200'}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-2 flex items-center rounded-md p-2 text-slate-500 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  {showPassword ? (
                    // Eye-off icon
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.94 10.94 0 0112 20C7 20 2.73 16.11 1 12c.66-1.55 1.73-3 3.06-4.24M9.9 4.24A10.94 10.94 0 0112 4c5 0 9.27 3.89 11 8a11.71 11.71 0 01-4.26 5.11" />
                      <path d="M1 1l22 22" />
                    </svg>
                  ) : (
                    // Eye icon
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {!passwordValid && password.length > 0 && (
                <p className="text-xs text-red-600">A senha precisa ter pelo menos 6 caracteres</p>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 select-none cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-300"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="text-slate-600 dark:text-slate-300">Lembrar-me</span>
              </label>
              <Link href="/recuperar-senha" className="text-emerald-700 hover:text-emerald-800 underline underline-offset-2 dark:text-emerald-300">Esqueceu a senha?</Link>
            </div>

            <button
              disabled={loading || !emailValid || !passwordValid}
              type="submit"
              className="group relative inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:opacity-60 dark:focus:ring-emerald-900/50"
            >
              {loading && (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
              )}
              <span>{loading ? "Entrando..." : "Acessar"}</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              <span className="text-xs text-slate-500">ou continue com</span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button type="button" disabled title="Em breve" className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {/* Google icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303C33.602,32.658,29.24,36,24,36c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.84,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24 s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,16.053,19.013,12,24,12c3.059,0,5.84,1.154,7.961,3.039l5.657-5.657 C34.046,6.053,29.268,4,24,4C16.318,4,9.531,8.221,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.2l-6.191-5.238C29.211,35.091,26.715,36,24,36 c-5.214,0-9.567-3.322-11.289-7.946l-6.522,5.022C9.253,39.556,16.04,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-1.357,3.657-5.02,6.28-9.303,6.28c-5.214,0-9.567-3.322-11.289-7.946 l-6.522,5.022C9.253,39.556,16.04,44,24,44c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
                <span>Google</span>
              </button>
              <button type="button" disabled title="Em breve" className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {/* Microsoft icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23" className="h-5 w-5"><path fill="#f25022" d="M1 1h10v10H1z"/><path fill="#00a4ef" d="M1 12h10v10H1z"/><path fill="#7fba00" d="M12 1h10v10H12z"/><path fill="#ffb900" d="M12 12h10v10H12z"/></svg>
                <span>Microsoft</span>
              </button>
            </div>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
          Ao acessar, você concorda com os termos de uso. Permissões serão aplicadas conforme seu perfil (funcionário/adm).
        </p>
      </div>
    </div>
  );
}
