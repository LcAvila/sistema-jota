export type AuthUser = { id: number; name: string; email: string; role?: string; storeId?: number };

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Usuários mock para diferentes tipos de login
const MOCK_USERS = {
  admin: {
    id: 1,
    name: 'Administrador',
    email: 'admin@jota.com',
    role: 'admin',
    storeId: 1
  },
  vendedor: {
    id: 2,
    name: 'Vendedor',
    email: 'vendedor@jota.com',
    role: 'seller',
    storeId: 1
  },
  supervisor: {
    id: 3,
    name: 'Supervisor',
    email: 'supervisor@jota.com',
    role: 'supervisor',
    storeId: 1
  }
};

const MOCK_TOKENS = {
  admin: 'admin-token-123',
  vendedor: 'vendedor-token-456',
  supervisor: 'supervisor-token-789'
};

export function saveAuth(token: string, user: AuthUser) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    document.cookie = `role=${encodeURIComponent(user.role || '')}; path=/; max-age=${60 * 60 * 24}`;
  } catch {}
}

export function getToken(): string | null {
  try { 
    const token = localStorage.getItem(TOKEN_KEY);
    return token || null;
  } catch { 
    return null; 
  }
}

export function getUser(): AuthUser | null {
  try {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch { 
    return null; 
  }
}

export function logout() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    document.cookie = 'role=; Max-Age=0; path=/';
  } catch {}
}

export async function loginRequest(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
  console.log('🔐 Tentativa de login:', { email, password: '***' });
  
  // Validação básica
  if (!email || !password) {
    console.log('❌ Email ou senha vazios');
    throw new Error('Email e senha são obrigatórios');
  }
  
  // Simula um delay pequeno para parecer real
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Credenciais válidas para diferentes tipos de usuário
  const validCredentials = {
    'admin@jota.com': { password: 'admin123', userType: 'admin' as keyof typeof MOCK_USERS },
    'vendedor@jota.com': { password: 'vendedor123', userType: 'vendedor' as keyof typeof MOCK_USERS },
    'supervisor@jota.com': { password: 'supervisor123', userType: 'supervisor' as keyof typeof MOCK_USERS }
  };
  
  console.log('📋 Credenciais válidas:', Object.keys(validCredentials));
  console.log('🔍 Verificando email:', email);
  console.log('🔍 Verificando senha:', password);
  
  const credentials = validCredentials[email as keyof typeof validCredentials];
  
  if (!credentials) {
    console.log('❌ Email não encontrado:', email);
    throw new Error('Credenciais inválidas');
  }
  
  console.log('🔍 Senha esperada:', credentials.password);
  console.log('🔍 Senha recebida:', password);
  console.log('🔍 Senhas coincidem:', credentials.password === password);
  
  if (credentials.password !== password) {
    console.log('❌ Senha incorreta para:', email);
    throw new Error('Credenciais inválidas');
  }
  
  const userType = credentials.userType;
  const user = MOCK_USERS[userType];
  const token = MOCK_TOKENS[userType];
  
  console.log('✅ Login bem-sucedido como', user.name, `(${user.role})`);
  
  return {
    token,
    user
  };
}

export function hasRole(required: string | string[] | undefined, role?: string | null): boolean {
  if (!required || !role) return false;
  
  const requiredRoles = Array.isArray(required) ? required : [required];
  return requiredRoles.includes(role);
}
