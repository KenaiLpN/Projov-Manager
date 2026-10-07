# Perfis e permissões modulares

Implementação preparada em 02/10/2026 a partir do plano funcional de perfis personalizados. Em 03/10/2026, a migração SQL foi aplicada com sucesso ao banco configurado em `apps/api/.env`.

## Comportamento entregue

- Cadastro, edição, busca e desativação de perfis em `/acessos/perfis`.
- Matriz de permissões por menu e submenu, com ações independentes de visualizar e editar.
- Edição implica visualização; permissões de edição não são oferecidas para itens somente de leitura.
- Perfil pai, indicador de coordenação, status ativo e controle de versão para evitar sobrescrita concorrente.
- Designação de um perfil ativo por usuário em `/acessos/designar`.
- Menu lateral e acesso direto às rotas filtrados pelo perfil efetivo.
- Validação equivalente no backend para leitura e escrita das APIs mapeadas.
- Auditoria de criação, alteração, desativação e designação de perfil.
- Perfis de sistema protegidos contra exclusão; Administrador e Desenvolvedor não podem perder a administração de perfis.

Enquanto um usuário não possui designação na nova tabela, o sistema calcula permissões compatíveis com seu `UsuTipo`. Essa compatibilidade permite publicar código e migração em etapas. Depois da designação, o perfil modular passa a ser a fonte efetiva de autorização.

## Modelo de dados

| Tabela | Finalidade |
| --- | --- |
| `access_profiles` | Nome, código, hierarquia, coordenação, status e versão do perfil |
| `access_permissions` | Catálogo técnico de seções, submenus, rotas e capacidade de edição |
| `access_profile_permissions` | Matriz visualizar/editar de cada perfil |
| `access_user_profiles` | Perfil vigente de cada usuário interno |
| `access_permission_audit_log` | Histórico antes/depois das mudanças administrativas |

O catálogo é mantido no código em `apps/api/src/lib/permissionCatalog.ts` e sincronizado com o banco ao criar ou editar um perfil. Os perfis de sistema começam sem linhas explícitas na matriz e usam a equivalência legada até serem salvos pela nova tela.

## Aplicação da migração

Arquivo: `apps/api/prisma/migrations/20261002_access_profiles.sql`.

Estado do ambiente configurado em 03/10/2026: cinco tabelas criadas, oito perfis de sistema inseridos e catálogo de permissões sincronizado. Um teste controlado criou um perfil, vinculou-o temporariamente a um usuário e confirmou que `UsuTipo` permaneceu inalterado; o perfil e o vínculo de teste foram removidos em seguida.

Para qualquer outro banco ou ambiente de implantação:

1. Faça backup verificável do banco de destino.
2. Execute o SQL com um usuário autorizado a criar tabelas, índices e chaves estrangeiras.
3. Confirme a existência das cinco tabelas e dos perfis `A`, `C`, `P`, `T`, `E`, `S`, `D` e `DEV`.
4. Publique API e frontend da mesma revisão.
5. Entre com Administrador ou Desenvolvedor, abra Perfis e Permissões e salve um perfil de teste.
6. Designe esse perfil a uma conta interna de homologação e valide menu, acesso direto e operações de escrita.
7. Valide separadamente os portais externos de Aprendiz, Educador e Empresa, que continuam usando suas regras de escopo próprias.

Não use `prisma db push` para aplicar esta mudança. O SQL explícito preserva o banco legado e permite revisão antes da execução.

## Homologação recomendada

- Perfil com somente visualização: a página abre, os controles de alteração ficam indisponíveis e POST/PUT/PATCH/DELETE retornam 403.
- Perfil com edição: leitura e gravação funcionam no mesmo submenu.
- Perfil sem acesso: item ausente no menu e rota direta direcionada para `/acesso-negado`.
- Designação: a mudança entra em vigor após recarregar a sessão; o provedor também atualiza permissões após alterações feitas pelo próprio administrador.
- Concorrência: salvar uma versão antiga de um perfil retorna conflito 409.
- Proteções: perfil de sistema não pode ser desativado; perfil personalizado com usuários ou filhos precisa ser desvinculado antes.
- Compatibilidade: usuário ainda não designado conserva o comportamento do `UsuTipo` anterior.

## Pontos de extensão

Ao adicionar uma nova página protegida, inclua sua chave no catálogo, associe a rota do frontend em `src/utils/accessPermissions.ts`, associe os endpoints em `permissionForApiRequest` e inclua testes de navegação e autorização. Endpoints sem regra continuam sujeitos à autenticação e às regras específicas já existentes, mas não entram automaticamente na matriz modular.
