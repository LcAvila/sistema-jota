export type AuthUser = { id: number; name: string; email: string; role?: string; storeId?: number };

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function saveAuth(token: string, user: AuthUser) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    // cookie simples (não httpOnly) para facilitar proteção client-side em múltiplas abas
    document.cookie = `role=${encodeURIComponent(user.role || '')}; path=/; max-age=${60 * 60 * 24}`;
  } catch {}
}

export function getToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function getUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch { return null; }
}

export function logout() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    document.cookie = 'role=; Max-Age=0; path=/';
  } catch {}
}

export async function loginRequest(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
  
  try {
    console.log('Tentando login em:', `${baseUrl}/auth/login`);
    
    const resp = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    console.log('Resposta do servidor:', resp.status, resp.statusText);
    
    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}));
      console.error('Erro na resposta:', data);
      
      // Mensagens de erro mais específicas
      if (resp.status === 401) {
        throw new Error('E-mail ou senha incorretos');
      } else if (resp.status === 404) {
        throw new Error('Serviço de autenticação não encontrado');
      } else if (resp.status === 500) {
        throw new Error('Erro interno do servidor');
      } else if (resp.status === 0 || resp.status >= 500) {
        throw new Error('Servidor não está respondendo. Verifique sua conexão.');
      } else {
        throw new Error(data?.message || `Falha no login (HTTP ${resp.status})`);
      }
    }
    
    const result = await resp.json();
    console.log('Login bem-sucedido:', result);
    return result;
    
  } catch (error: any) {
    console.error('Erro durante login:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão com a internet.');
    }
    
    throw error;
  }
}

export function hasRole(required: string | string[] | undefined, role?: string | null): boolean {
  if (!required) return true;
  const r = role || '';
  const list = Array.isArray(required) ? required : [required];
  return list.includes(r);
}
