"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "@/store/theme";
import { useSession } from "@/store/session";
import { hasRole } from "@/lib/auth-bypass";

function Guard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const { session, logout } = useSession();
  const [unread, setUnread] = useState(0);

  // Proteção: somente vendedor
  useEffect(() => {
    if (!session) {
      router.replace('/login');
      return;
    }
    
    // Verifica se o usuário tem permissão para acessar o painel
    if (!hasRole(["seller"], session.role)) {
      router.replace("/admin");
      return;
    }
  }, [session, router]);

  const Icons = {
    logo: (cls = "") => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="4" className="stroke-[var(--brand)]"/>
        <path d="M9 7v7a2 2 0 0 0 2 2h4" className="stroke-[var(--brand)]" strokeLinecap="round"/>
      </svg>
    ),
    orders: (cls = "") => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 7h18M3 12h18M3 17h18" strokeLinecap="round"/>
      </svg>
    ),
    pick: (cls = "") => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 7h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z"/>
        <path d="M9 7V5a3 3 0 0 1 6 0v2"/>
      </svg>
    ),
    delivery: (cls = "") => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 7h11v6H3z"/>
        <path d="M14 9h4l3 3v4h-7z"/>
        <circle cx="7.5" cy="17.5" r="1.5"/>
        <circle cx="18.5" cy="17.5" r="1.5"/>
      </svg>
    ),
    bell: (cls = "") => (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 8a6 6 0 1 1 12 0c0 4 1.5 5 2 6H4c.5-1 2-2 2-6z"/>
        <path d="M9 19a3 3 0 0 0 6 0"/>
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

  type NavItem = { href: string; label: string; icon: React.ReactNode; badge?: number };
  const nav: NavItem[] = [
    { href: "/painel/pedidos", label: "Pedidos", icon: Icons.orders("w-5 h-5") },
    { href: "/painel/separacao", label: "Separação", icon: Icons.pick("w-5 h-5") },
    { href: "/painel/entregas", label: "Entregas", icon: Icons.delivery("w-5 h-5") },
    { href: "/painel/notificacoes", label: "Notificações", icon: Icons.bell("w-5 h-5"), badge: unread },
  ];

  // Poll leve de notificações não lidas
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        // opcional: implementar listNotifications via apiFetch
        const list: any[] = [];
        if (!mounted) return;
        const count = list.filter(n => !n.read).length;
        setUnread(count);
      } catch { /* noop */ }
    };
    load();
    const id = setInterval(load, 15000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const [collapsed, setCollapsed] = useState(false);
  // Importante: manter hooks com mesma ordem em todas as renderizações.
  // Só retornamos após todos hooks terem sido registrados.
  if (!session) return <div className="p-4 text-slate-600">Redirecionando...</div>;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="grid grid-cols-1 md:grid-cols-[var(--sb)_1fr] min-h-screen" style={{ ['--sb' as any]: collapsed ? '64px' : '260px' }}>
        {/* Sidebar */}
        <aside className={`border-r border-[var(--border)] bg-[var(--card)] p-2 md:p-3 flex md:flex-col gap-3 md:gap-4 sticky top-0 z-10 transition-all duration-200`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} md:${collapsed ? 'items-center' : 'items-start'} gap-2`}>
            <Link href="/painel" className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--muted)]`}>
                {Icons.logo('w-4 h-4')}
              </span>
              {!collapsed && <span className="font-black text-xl"><span className="text-[var(--brand)]">Jota</span> Painel</span>}
            </Link>
            <div className="hidden md:flex items-center gap-2">
              <button onClick={() => setCollapsed(c => !c)} aria-label="Alternar sidebar" className="p-2 rounded border border-[var(--border)] hover:bg-[var(--muted)] transition-colors">
                <span className={`inline-block transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`}>{Icons.chevron("w-4 h-4")}</span>
              </button>
              <button onClick={toggle} className="p-2 rounded border border-[var(--border)] hover:bg-[var(--muted)] transition-colors" aria-label="Alternar tema">
                {theme === 'dark' ? Icons.sun('w-4 h-4') : Icons.moon('w-4 h-4')}
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
                  {!collapsed && n.badge ? (
                    <span className="ml-3 inline-flex items-center justify-center min-w-6 h-5 px-1.5 rounded-full text-xs bg-[var(--brand)] text-white">
                      {n.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto hidden md:block">
            {!collapsed ? (
              <>
                <div className="text-xs opacity-60">Logado como</div>
                <div className="text-sm font-medium">{session.name}</div>
                <div className="text-xs opacity-60">{session.role}</div>
                <button onClick={() => { logout(); router.replace('/login'); }} className="mt-3 w-full text-sm px-3 py-1.5 rounded border border-[var(--border)] hover:bg-[var(--muted)] transition-colors">Sair</button>
              </>
            ) : (
              <button onClick={() => { logout(); router.replace('/login'); }} title="Sair" className="w-full flex items-center justify-center p-2 rounded border border-[var(--border)] hover:bg-[var(--muted)] transition-colors">⎋</button>
            )}
          </div>
        </aside>

        {/* Content */}
        <main className="p-4 md:p-6">
          {/* Topbar (mobile) */}
          <div className="md:hidden mb-4 flex items-center justify-between">
            <div className="text-sm text-slate-500">{session.name} • {session.role}</div>
            <div className="flex items-center gap-2">
              <button onClick={toggle} className="px-3 py-1.5 rounded border border-[var(--border)] hover:bg-[var(--muted)] text-sm">
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
              <button onClick={() => { logout(); router.replace('/login'); }} className="text-sm px-3 py-1.5 rounded border border-[var(--border)] hover:bg-[var(--muted)]">Sair</button>
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Guard>{children}</Guard>
  );
}
