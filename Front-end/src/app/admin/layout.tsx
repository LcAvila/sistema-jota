"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "@/store/session";
import { useTheme } from "@/store/theme";

function Guard({ children }: { children: React.ReactNode }) {
  const { session, login, logout } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  useEffect(() => {
    // Se bypass estiver ativo, garanta uma sessão mock e não redirecione
    if (!session && process.env.NEXT_PUBLIC_BYPASS_AUTH === "true") {
      const mock = {
        userId: 0,
        name: "Dev Bypass",
        role: "supervisor" as const,
        token: "dev-bypass",
        email: "bypass@local",
        storeId: 1,
      };
      login(mock);
      return; // não redireciona
    }
    if (!session) router.replace("/login");
  }, [session, router]);

  const Icons = {
    logo: (cls = "") => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="4" className="stroke-[var(--brand)]"/>
        <path d="M9 7v7a2 2 0 0 0 2 2h4" className="stroke-[var(--brand)]" strokeLinecap="round"/>
      </svg>
    ),
    dashboard: (cls = "") => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 9h8V3h-8z"/>
      </svg>
    ),
    products: (cls = "") => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 7l9-4 9 4-9 4-9-4z"/>
        <path d="M3 7v10l9 4 9-4V7"/>
      </svg>
    ),
    orders: (cls = "") => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 7h18M3 12h18M3 17h18" strokeLinecap="round"/>
      </svg>
    ),
    report: (cls = "") => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 3h10v4H7zM5 7h14v14H5z"/>
      </svg>
    ),
    inventory: (cls = "") => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
        <line x1="8" y1="12" x2="16" y2="12"/>
        <line x1="8" y1="16" x2="16" y2="16"/>
        <line x1="8" y1="8" x2="12" y2="8"/>
      </svg>
    ),
    salesLog: (cls = "") => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="12" y1="18" x2="12" y2="12"/>
        <line x1="9" y1="15" x2="15" y2="15"/>
      </svg>
    ),
    settings: (cls = "") => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V22a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09c.69 0 1.3-.4 1.51-1a1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 7.04 4.3l.06.06c.46.46 1.12.6 1.71.39A1.65 1.65 0 0 0 10.33 3.2V3a2 2 0 1 1 4 0v.09c0 .69.4 1.3 1 1.51.59.21 1.25.07 1.71-.39l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06c-.46.46-.6 1.12-.39 1.71.21.6.82 1 1.51 1H21a2 2 0 1 1 0 4h-.09c-.69 0-1.3.4-1.51 1z"/>
      </svg>
    ),
    sun: (cls = "") => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
    ),
    moon: (cls = "") => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>
    ),
    chevron: (cls = "") => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
    )
  } as const;

  type NavItem = { href: string; label: string; icon: React.ReactNode };
  const nav: NavItem[] = [
    { href: "/admin", label: "Dashboard", icon: Icons.dashboard("w-5 h-5") },
    { href: "/admin/produtos", label: "Produtos", icon: Icons.products("w-5 h-5") },
    { href: "/admin/estoque", label: "Estoque", icon: Icons.inventory("w-5 h-5") },
    { href: "/admin/relatorios", label: "Relatórios", icon: Icons.report("w-5 h-5") },
    { href: "/admin/vendas-importar", label: "Registro de Vendas", icon: Icons.salesLog("w-5 h-5") },
    { href: "/admin/configuracoes", label: "Configurações", icon: Icons.settings("w-5 h-5") },
  ];

  const [collapsed, setCollapsed] = useState(false);
  if (!session) return <div className="p-4 text-slate-600">Redirecionando...</div>;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="grid grid-cols-1 md:grid-cols-[var(--sb)_1fr] min-h-screen" style={{ ['--sb' as any]: collapsed ? '64px' : '260px' }}>
        {/* Sidebar */}
        <aside className={`border-r border-[var(--border)] bg-[var(--card)] p-2 md:p-3 flex md:flex-col gap-3 md:gap-4 sticky top-0 z-10 transition-all duration-200 h-[100dvh] overflow-y-auto overflow-x-hidden`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} md:${collapsed ? 'items-center' : 'items-start'} gap-2`}>
            <Link href="/admin" className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--muted)]`}>
                {Icons.logo('w-4 h-4')}
              </span>
              {!collapsed && <span className="font-black text-xl"><span className="text-[var(--brand)]">Jota</span> Admin</span>}
            </Link>
            <div className="hidden md:flex items-center gap-2">
              <button onClick={() => setCollapsed(c => !c)} aria-label="Alternar sidebar" className="p-2 rounded border border-[var(--border)] hover:bg-[var(--muted)] transition-colors">
                <span className={`inline-block transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`}>{Icons.chevron("w-4 h-4")}</span>
              </button>
            </div>
          </div>
          <nav className="flex-1 flex md:flex-col gap-2">
            {nav.map(n => {
              const active = pathname?.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  title={collapsed ? n.label : undefined}
                  className={`px-2 py-2 rounded border border-transparent hover:border-[var(--border)] flex items-center ${collapsed ? 'justify-center' : 'justify-between'} gap-2 transition-colors ${active ? 'bg-[var(--muted)] font-semibold text-[var(--brand)]' : ''}`}
                >
                  <span className={`flex items-center gap-2 ${collapsed ? '' : 'min-w-0'}`}>
                    {n.icon}
                    {!collapsed && <span className="truncate">{n.label}</span>}
                  </span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto hidden md:block sticky bottom-0 bg-[var(--card)] border-t border-[var(--border)] pt-2">
            {!collapsed ? (
              <>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="text-xs opacity-60">Logado como</div>
                  {/* Toggle tema (sempre disponível no rodapé) */}
                  <button onClick={toggle} className="p-2 rounded border border-[var(--border)] hover:bg-[var(--muted)] transition-colors" aria-label="Alternar tema">
                    {theme === 'dark' ? Icons.sun('w-4 h-4') : Icons.moon('w-4 h-4')}
                  </button>
                </div>
                <div className="text-sm font-medium">{session.name}</div>
                <div className="text-xs opacity-60">{session.role}</div>
                <button onClick={logout} className="mt-3 w-full text-sm px-3 py-1.5 rounded border border-[var(--border)] hover:bg-[var(--muted)] transition-colors">Sair</button>
              </>
            ) : (
              <div className="flex flex-col items-stretch gap-2">
                {/* Toggle tema compacto quando colapsada */}
                <button onClick={toggle} title="Alternar tema" className="w-full flex items-center justify-center p-2 rounded border border-[var(--border)] hover:bg-[var(--muted)] transition-colors" aria-label="Alternar tema">
                  {theme === 'dark' ? Icons.sun('w-4 h-4') : Icons.moon('w-4 h-4')}
                </button>
                <button onClick={logout} title="Sair" className="w-full flex items-center justify-center p-2 rounded border border-[var(--border)] hover:bg-[var(--muted)] transition-colors">⎋</button>
              </div>
            )}
          </div>
        </aside>

        {/* Content */}
        <main className="p-4 md:p-6">
          {/* Topbar (mobile) */}
          <Topbar/>
          {/* Page content */}
          {children}
        </main>
      </div>
    </div>
  );
}

function Topbar() {
  const { theme, toggle } = useTheme();
  const { session, logout } = useSession();
  return (
    <div className="md:hidden mb-4 flex items-center justify-between">
      <div className="text-sm text-slate-500">{session?.name} • {session?.role}</div>
      <div className="flex items-center gap-2">
        <button onClick={toggle} className="px-3 py-1.5 rounded border border-[var(--border)] hover:bg-[var(--muted)] text-sm">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button onClick={logout} className="text-sm px-3 py-1.5 rounded border border-[var(--border)] hover:bg-[var(--muted)]">Sair</button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <Guard>{children}</Guard>;
}
