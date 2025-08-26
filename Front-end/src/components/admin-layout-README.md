# Padrão de Layout Admin

Todas as páginas da área administrativa devem utilizar os seguintes componentes para garantir padronização visual, responsividade e integração com dark/light mode:

1. **AdminLayout**: Wrapper base que provê estrutura de grid/flex, sidebar e header.
   - Caminho: `src/components/admin-layout.tsx`
   - Props: `sidebar`, `header`, `children`

2. **AdminSidebar**: Menu lateral de navegação com ícones e links para todas as rotas admin.
   - Caminho: `src/components/admin-sidebar.tsx`
   - Personalizável via prop `selectedKey` para destacar a rota ativa.

3. **AdminHeader**: Cabeçalho fixo com nome do sistema, avatar do usuário e menu de ações.
   - Caminho: `src/components/admin-header.tsx`
   - Personalizável via prop `username`.

## Como aplicar

Exemplo de uso em uma página admin:

```tsx
import { AdminLayout } from '@/components/admin-layout'
import { AdminSidebar } from '@/components/admin-sidebar'
import { AdminHeader } from '@/components/admin-header'

export default function MinhaPaginaAdmin() {
  return (
    <AdminLayout
      sidebar={<AdminSidebar selectedKey="/admin/minha-rota" />}
      header={<AdminHeader username="Admin" />}
    >
      {/* Conteúdo da página aqui */}
    </AdminLayout>
  )
}
```

## Recomendações
- Utilize componentes do Ant Design, shadcn/ui e radix para tabelas, formulários, botões e feedbacks.
- Evite wrappers/divs extras: o layout já cuida do espaçamento e responsividade.
- Para navegação, sempre destaque a rota ativa no sidebar.
- Garanta que todos os componentes respeitem o tema (dark/light) do sistema.

## Replicação
- Refatore gradualmente cada página admin para seguir este padrão.
- Para páginas com rotas filhas, utilize o mesmo AdminLayout no arquivo pai.

---

Para dúvidas ou ajustes, consulte os arquivos de exemplo ou solicite suporte ao time de desenvolvimento.
