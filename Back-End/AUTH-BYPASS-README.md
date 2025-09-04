# Bypass de Autenticação - Sistema Jota

## Status Atual
✅ **AUTENTICAÇÃO DESABILITADA** - Modo desenvolvimento ativo

## O que foi alterado

### Backend
- Criado `src/middlewares/auth-bypass.middleware.ts` - Middleware que sempre passa autenticação
- Criado `src/config/auth-config.ts` - Configuração centralizada para autenticação
- Todas as rotas agora usam o middleware de bypass
- Usuário mock sempre disponível com role 'supervisor'

### Frontend
- Criado `src/lib/auth-bypass.ts` - Funções de autenticação mock
- `src/lib/auth.ts` agora importa do arquivo de bypass
- Layout admin sempre cria sessão mock automaticamente
- Tela de login mantida mas não é mais necessária

## Como reativar a autenticação

### 1. Backend
Edite o arquivo `src/config/auth-config.ts`:
```typescript
export const AUTH_CONFIG = {
  AUTH_ENABLED: true, // Mude para true
  // ... resto da configuração
};
```

### 2. Restaurar middlewares originais
Substitua as importações nas rotas de volta para os middlewares originais:

```typescript
// Em vez de:
import { authenticateJWT } from '../middlewares/auth-bypass.middleware';

// Use:
import { authenticateJWT } from '../middlewares/auth.middleware';
```

### 3. Frontend
Edite o arquivo `src/lib/auth.ts` para restaurar as funções originais:
```typescript
// Comente ou remova esta linha:
// export * from './auth-bypass';

// E restaure todo o código original de autenticação
```

### 4. Layout Admin
No arquivo `src/app/admin/layout.tsx`, restaure a verificação de sessão:
```typescript
useEffect(() => {
  if (!session) router.replace("/login");
}, [session, router]);
```

## Vantagens do bypass atual

1. **Desenvolvimento acelerado** - Sem problemas de login
2. **Testes mais rápidos** - Acesso direto a todas as funcionalidades
3. **Estrutura preservada** - Fácil reativação quando necessário
4. **Usuário mock consistente** - Sempre com role 'supervisor'

## Arquivos modificados

### Backend
- `src/middlewares/auth-bypass.middleware.ts` (novo)
- `src/config/auth-config.ts` (novo)
- `src/routes/*.ts` (todas as rotas)

### Frontend
- `src/lib/auth-bypass.ts` (novo)
- `src/lib/auth.ts` (modificado)
- `src/app/admin/layout.tsx` (modificado)

## Notas importantes

- O sistema continua funcionando normalmente
- Todas as funcionalidades estão acessíveis
- A segurança está desabilitada - não use em produção
- Para reativar, siga os passos acima na ordem correta

## Última atualização
Data: $(Get-Date -Format "dd/MM/yyyy HH:mm")
Status: Bypass ativo
