# Especificação para desenvolvimento — Módulo de Chamados de TI do Procis

## Contexto geral

O sistema atual se chama **Procis** e já possui uma tela de login pronta em split layout:

- Lado direito: login padrão do ERP Procis, já existente.
- Lado esquerdo: entrada/login para o novo módulo de chamados de TI.

O objetivo é criar um módulo interno de abertura e gestão de chamados de informática para a **Projovem**, uma ONG de Jovens Aprendizes.

O sistema deve ter uma separação clara entre:

1. **Área do solicitante**: usuários que abrem chamados.
2. **Área técnica/admin**: técnico de informática, chefe de TI/desenvolvedor e demais usuários autorizados.

A tela de login já existe, então esta especificação trata principalmente das telas, permissões, fluxo e estrutura de banco de dados do módulo de chamados.

---

## Objetivo do módulo

Criar um sistema de helpdesk interno para organizar chamados de TI, como:

- Problemas de rede;
- Computadores com defeito;
- Computadores lentos;
- Impressoras;
- Problemas com e-mail;
- Problemas de acesso a sistemas;
- Problemas de internet;
- Outros problemas técnicos.

---

## Regra importante sobre urgência/prioridade

O solicitante **não deve escolher urgência ou prioridade** ao abrir o chamado.

Motivo: os solicitantes geralmente são chefes/coordenadores/departamentos, e para eles todos os chamados tendem a parecer urgentes.

A prioridade deve ser definida somente pela área técnica, preferencialmente pelo chefe de TI/técnico responsável, que tem visão geral da operação da empresa.

Portanto:

- O formulário do solicitante **não deve ter campo de urgência**.
- O chamado deve entrar inicialmente como `nao_classificada`.
- A área técnica deve poder definir a prioridade depois da triagem:
  - Baixa;
  - Média;
  - Alta;
  - Urgente.

---

## Perfis de acesso

O sistema atual do Procis já trabalha com tokens diferentes conforme o tipo do usuário, por exemplo:

- Desenvolvedor;
- Professor;
- Outros tipos.

O módulo de chamados deve aproveitar essa lógica para redirecionar o usuário para a área correta.

### Perfis sugeridos

| Perfil | Acesso |
|---|---|
| desenvolvedor | Acesso total ao módulo de chamados |
| tecnico | Acesso à área técnica, chamados, filtros e atendimento |
| coordenador_ti | Acesso técnico + relatórios |
| solicitante | Pode abrir chamado e ver somente seus próprios chamados |
| admin_departamento | Pode abrir chamado e ver chamados do próprio departamento |
| gestor_unidade | Pode abrir chamado e ver chamados da própria unidade |

Para o MVP, os perfis principais podem ser:

- `desenvolvedor`;
- `tecnico`;
- `solicitante`;
- `admin_departamento`.

---

## Redirecionamento depois do login

Após o login, o sistema deve verificar o tipo do usuário/token.

Fluxo:

```txt
Usuário fez login
        |
        v
Sistema verifica o tipo/token do usuário
        |
        |-- desenvolvedor / tecnico / coordenador_ti
        |       |
        |       v
        |   /chamados/admin/dashboard
        |
        |-- solicitante / admin_departamento / gestor_unidade
                |
                v
            /chamados/portal
```

---

## Rotas sugeridas

### Área do solicitante

```txt
/chamados/portal
/chamados/portal/novo
/chamados/portal/meus-chamados
/chamados/portal/meus-chamados/:id
```

### Área técnica/admin

```txt
/chamados/admin/dashboard
/chamados/admin/todos
/chamados/admin/nao-atribuidos
/chamados/admin/meus-chamados
/chamados/admin/urgentes
/chamados/admin/vencidos
/chamados/admin/resolvidos
/chamados/admin/relatorios
/chamados/admin/configuracoes
/chamados/admin/chamado/:id
```

---

## Segurança e permissões

A proteção não pode ser apenas visual no front-end.

Mesmo que botões sejam escondidos, o back-end deve bloquear o acesso indevido.

Regras:

```txt
Se usuário não for desenvolvedor/técnico/coordenador_ti:
    bloquear acesso às rotas /chamados/admin/*

Se usuário for solicitante:
    permitir visualizar apenas chamados criados por ele

Se usuário for admin_departamento:
    permitir visualizar chamados do próprio departamento

Se usuário for gestor_unidade:
    permitir visualizar chamados da própria unidade

Se usuário for técnico/desenvolvedor:
    permitir visualizar todos os chamados
```

---

# Área do solicitante

## Objetivo

A área do solicitante deve ser simples e limitada.

O usuário deve conseguir:

1. Abrir chamado;
2. Ver seus chamados;
3. Acompanhar status;
4. Ver se foi resolvido ou não.

Ele não deve acessar:

- Relatórios;
- Dashboard técnico;
- Lista geral de chamados;
- Chamados de outros departamentos, salvo perfil específico;
- Configurações;
- Cadastro de usuários;
- Cadastro de unidades;
- Cadastro de categorias;
- Definição de prioridade;
- Atribuição de técnico.

---

## Layout sugerido — Portal do solicitante

```txt
┌──────────────────────────────────────────────────────────────┐
│ Procis Chamados                              Olá, Maria       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Precisa de ajuda com TI?                                    │
│  Abra um chamado para que o departamento de TI possa atender.│
│                                                              │
│  ┌──────────────────────┐                                    │
│  │ + Abrir novo chamado │                                    │
│  └──────────────────────┘                                    │
│                                                              │
│  Meus chamados recentes                                      │
│  ┌──────┬──────────────┬────────────┬──────────────┐         │
│  │ Nº   │ Assunto      │ Status     │ Aberto em    │         │
│  ├──────┼──────────────┼────────────┼──────────────┤         │
│  │ 142  │ Sem internet │ Em análise │ 09/07/2026   │         │
│  │ 137  │ PC lento     │ Resolvido  │ 08/07/2026   │         │
│  └──────┴──────────────┴────────────┴──────────────┘         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Menu do solicitante

```txt
Início
Abrir chamado
Meus chamados
Sair
```

---

## Formulário de abertura de chamado

Campos sugeridos:

```txt
Abrir novo chamado

Título do chamado
[ Exemplo: Computador não liga ]

Categoria do problema
[ Computador / Rede / Internet / Impressora / Sistema / E-mail / Outro ]

Unidade
[ Unidade onde ocorreu o problema ]

Departamento
[ Departamento do solicitante ]

Descrição do problema
[ Explique o que está acontecendo ]

Anexo
[ Enviar print ou imagem ]

[ Enviar chamado ]
```

Não incluir campo de urgência/prioridade para o solicitante.

---

## Categorias amigáveis para o solicitante

Evitar termos técnicos como DNS, DHCP, gateway, switch etc.

Usar categorias simples:

- Computador;
- Internet;
- Rede;
- Impressora;
- Sistema;
- E-mail;
- Telefone/ramal;
- Acesso/login;
- Outro.

---

## Mensagem após abertura

Após o envio, exibir:

```txt
Chamado aberto com sucesso!

Número do chamado: #145

O departamento de TI recebeu sua solicitação.
Você pode acompanhar o andamento em “Meus chamados”.
```

---

# Área técnica/admin

## Objetivo

A área técnica deve ser o painel de controle da TI.

O técnico/administrador deve conseguir:

- Ver todos os chamados;
- Filtrar por status;
- Filtrar por unidade;
- Filtrar por departamento;
- Filtrar por data;
- Filtrar por categoria;
- Filtrar por prioridade;
- Filtrar por responsável;
- Ver chamados não atribuídos;
- Assumir chamados;
- Alterar status;
- Definir prioridade;
- Adicionar comentários internos;
- Adicionar comentários visíveis ao solicitante;
- Finalizar chamados;
- Gerar visão gerencial/relatórios.

---

## Layout sugerido — Painel técnico

```txt
┌────────────────────────────────────────────────────────────────────┐
│ Procis Chamados TI                         🔍 Buscar   + Chamado   │
├───────────────┬────────────────────────────────────────────────────┤
│ Dashboard     │ Painel Técnico                                    │
│ Chamados      │                                                    │
│ Não atribuídos│ [Abertos] [Pendentes] [Em atendimento] [Urgentes]  │
│ Meus chamados │ [Vencendo prazo] [Resolvidos hoje] [Sem técnico]  │
│ Relatórios    │                                                    │
│ Departamentos │ Filtros                                           │
│ Unidades      │ [Status] [Departamento] [Unidade] [Prioridade]    │
│ Categorias    │ [Responsável] [Período] [Limpar filtros]          │
│ Configurações │                                                    │
│               │ Tabela de chamados                                │
│               │ # | Data | Solicitante | Depto | Unidade | Tipo   │
│               │ Prioridade | Status | Técnico | Prazo | Ações     │
└───────────────┴────────────────────────────────────────────────────┘
```

---

## Menu técnico/admin

```txt
Dashboard
Todos os chamados
Não atribuídos
Meus chamados
Urgentes
Vencidos
Resolvidos
Relatórios
Departamentos
Unidades
Categorias
Usuários/permissões
Configurações
```

---

## Cards do dashboard técnico

Cards sugeridos:

- Chamados abertos;
- Pendentes;
- Em atendimento;
- Urgentes;
- Não classificados;
- Sem técnico;
- Vencendo prazo;
- Vencidos;
- Resolvidos hoje.

---

## Tabela principal da área técnica

Colunas sugeridas:

| Coluna | Descrição |
|---|---|
| ID | Identificação do chamado |
| Data de abertura | Quando o chamado foi aberto |
| Solicitante | Quem abriu |
| Departamento | Departamento do solicitante |
| Unidade | Unidade onde ocorreu o problema |
| Categoria | Tipo de problema |
| Título | Resumo do chamado |
| Prioridade | Definida pela TI |
| Status | Situação atual |
| Responsável | Técnico responsável |
| Prazo/SLA | Prazo de atendimento, se usado |
| Última atualização | Última movimentação |
| Ações | Ver, assumir, editar, concluir |

---

## Status sugeridos

Status internos:

| Status | Uso |
|---|---|
| aberto | Chamado recém-criado |
| em_analise | Técnico está avaliando |
| em_atendimento | Técnico está trabalhando |
| pendente | Aguardando usuário, fornecedor, peça ou informação |
| resolvido | Problema resolvido |
| cancelado | Chamado inválido, duplicado ou cancelado |

Status amigáveis para o solicitante:

| Status interno | Texto para solicitante |
|---|---|
| aberto | Recebido |
| em_analise | Em análise pela TI |
| em_atendimento | Em atendimento |
| pendente | Aguardando informação |
| resolvido | Resolvido |
| cancelado | Cancelado |

---

# Banco de dados MySQL

## Observação

A estrutura abaixo foi criada pensando em integração com um banco já existente do Procis.

Como os nomes reais das tabelas atuais de usuários, departamentos e unidades podem ser diferentes, os campos de ID foram deixados como referências lógicas.

Recomenda-se adaptar os nomes conforme o banco real.

Exemplos de tabelas já existentes que podem ser aproveitadas:

- `usuarios`;
- `departamentos`;
- `unidades`.

---

## Tabela principal: chamados_tickets

Responsável por armazenar o chamado.

Campos principais:

- ID do chamado;
- Protocolo opcional;
- Usuário solicitante;
- Nome/e-mail do solicitante como snapshot;
- Departamento;
- Unidade;
- Categoria;
- Título;
- Descrição;
- Status;
- Prioridade interna;
- Técnico responsável;
- Datas principais;
- Origem;
- Campos de controle.

```sql
CREATE TABLE chamados_tickets (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    protocolo VARCHAR(30) NULL,

    solicitante_id BIGINT UNSIGNED NULL,
    solicitante_nome VARCHAR(150) NOT NULL,
    solicitante_email VARCHAR(180) NULL,

    departamento_id BIGINT UNSIGNED NULL,
    departamento_nome VARCHAR(150) NULL,

    unidade_id BIGINT UNSIGNED NULL,
    unidade_nome VARCHAR(150) NULL,

    categoria_id BIGINT UNSIGNED NULL,
    categoria_nome VARCHAR(100) NULL,

    titulo VARCHAR(180) NOT NULL,
    descricao TEXT NOT NULL,

    status ENUM(
        'aberto',
        'em_analise',
        'em_atendimento',
        'pendente',
        'resolvido',
        'cancelado'
    ) NOT NULL DEFAULT 'aberto',

    prioridade_interna ENUM(
        'nao_classificada',
        'baixa',
        'media',
        'alta',
        'urgente'
    ) NOT NULL DEFAULT 'nao_classificada',

    tecnico_responsavel_id BIGINT UNSIGNED NULL,
    tecnico_responsavel_nome VARCHAR(150) NULL,

    origem ENUM('portal', 'admin') NOT NULL DEFAULT 'portal',

    aberto_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assumido_em DATETIME NULL,
    prazo_sla_em DATETIME NULL,
    resolvido_em DATETIME NULL,
    cancelado_em DATETIME NULL,
    ultima_interacao_em DATETIME NULL,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletado_em DATETIME NULL,

    PRIMARY KEY (id),
    UNIQUE KEY uk_chamados_protocolo (protocolo),

    KEY idx_chamados_status (status),
    KEY idx_chamados_prioridade (prioridade_interna),
    KEY idx_chamados_aberto_em (aberto_em),
    KEY idx_chamados_departamento (departamento_id),
    KEY idx_chamados_unidade (unidade_id),
    KEY idx_chamados_solicitante (solicitante_id),
    KEY idx_chamados_tecnico_status (tecnico_responsavel_id, status),
    KEY idx_chamados_status_prioridade (status, prioridade_interna),
    KEY idx_chamados_categoria (categoria_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Observação sobre protocolo

O campo `id` já pode ser usado como número do chamado.

Exemplo de exibição:

```txt
Chamado #145
```

Se quiser usar protocolo formatado, o sistema pode preencher o campo `protocolo` depois do insert.

Exemplo:

```txt
CH-2026-000145
```

---

## Tabela de categorias: chamados_categorias

Responsável por armazenar as categorias disponíveis no formulário.

```sql
CREATE TABLE chamados_categorias (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255) NULL,
    ativo TINYINT(1) NOT NULL DEFAULT 1,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uk_chamados_categorias_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

Categorias iniciais:

```sql
INSERT INTO chamados_categorias (nome, descricao) VALUES
('Computador', 'Problemas com computador, notebook, desempenho, inicialização ou hardware'),
('Internet', 'Problemas de acesso à internet'),
('Rede', 'Problemas de rede interna, compartilhamentos, cabeamento ou conexão local'),
('Impressora', 'Problemas de impressão, scanner ou multifuncional'),
('Sistema', 'Problemas de acesso ou funcionamento de sistemas internos'),
('E-mail', 'Problemas com e-mail, Outlook, senha ou envio/recebimento'),
('Telefone/Ramal', 'Problemas com telefone, ramal ou comunicação interna'),
('Acesso/Login', 'Problemas de senha, login ou permissão'),
('Outro', 'Problema não listado nas categorias anteriores');
```

---

## Tabela de histórico: chamados_historico

Responsável por registrar tudo que aconteceu no chamado.

Exemplos:

- Chamado criado;
- Status alterado;
- Prioridade definida;
- Técnico atribuído;
- Comentário interno;
- Comentário visível ao solicitante;
- Chamado resolvido;
- Chamado cancelado;
- Chamado reaberto.

```sql
CREATE TABLE chamados_historico (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    chamado_id BIGINT UNSIGNED NOT NULL,

    usuario_id BIGINT UNSIGNED NULL,
    usuario_nome VARCHAR(150) NULL,
    usuario_tipo VARCHAR(50) NULL,

    tipo_evento ENUM(
        'criado',
        'status_alterado',
        'prioridade_alterada',
        'atribuicao',
        'comentario_interno',
        'comentario_publico',
        'anexo',
        'resolucao',
        'cancelamento',
        'reabertura'
    ) NOT NULL,

    status_anterior VARCHAR(50) NULL,
    status_novo VARCHAR(50) NULL,

    prioridade_anterior VARCHAR(50) NULL,
    prioridade_nova VARCHAR(50) NULL,

    comentario TEXT NULL,
    visivel_solicitante TINYINT(1) NOT NULL DEFAULT 0,

    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    KEY idx_historico_chamado (chamado_id),
    KEY idx_historico_tipo_evento (tipo_evento),
    KEY idx_historico_criado_em (criado_em),

    CONSTRAINT fk_historico_chamado
        FOREIGN KEY (chamado_id)
        REFERENCES chamados_tickets (id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Tabela de anexos: chamados_anexos

Responsável por guardar referências de arquivos anexados ao chamado.

A recomendação é salvar o arquivo em disco/storage e gravar no banco somente o caminho/metadados.

```sql
CREATE TABLE chamados_anexos (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    chamado_id BIGINT UNSIGNED NOT NULL,
    historico_id BIGINT UNSIGNED NULL,

    usuario_id BIGINT UNSIGNED NULL,
    usuario_nome VARCHAR(150) NULL,

    nome_original VARCHAR(255) NOT NULL,
    nome_armazenado VARCHAR(255) NOT NULL,
    caminho_arquivo VARCHAR(500) NOT NULL,
    mime_type VARCHAR(120) NULL,
    tamanho_bytes BIGINT UNSIGNED NULL,

    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    KEY idx_anexos_chamado (chamado_id),
    KEY idx_anexos_historico (historico_id),

    CONSTRAINT fk_anexos_chamado
        FOREIGN KEY (chamado_id)
        REFERENCES chamados_tickets (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_anexos_historico
        FOREIGN KEY (historico_id)
        REFERENCES chamados_historico (id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

# Fluxo técnico do chamado

## Abertura pelo solicitante

1. Usuário entra em `/chamados/portal`.
2. Clica em “Abrir novo chamado”.
3. Preenche título, categoria, unidade, departamento, descrição e anexo opcional.
4. Sistema cria registro em `chamados_tickets`.
5. Sistema cria registro em `chamados_historico` com `tipo_evento = 'criado'`.
6. Sistema mostra número do chamado.

Status inicial:

```txt
status = aberto
prioridade_interna = nao_classificada
tecnico_responsavel_id = NULL
```

---

## Triagem pela TI

1. Técnico acessa `/chamados/admin/dashboard`.
2. Visualiza chamados abertos e não classificados.
3. Abre o chamado.
4. Define prioridade:
   - baixa;
   - media;
   - alta;
   - urgente.
5. Pode assumir o chamado.
6. Pode alterar status para:
   - em_analise;
   - em_atendimento;
   - pendente;
   - resolvido;
   - cancelado.
7. Cada alteração deve gerar registro em `chamados_historico`.

---

## Atendimento

A tela de detalhes do chamado deve mostrar:

- Dados gerais do chamado;
- Solicitante;
- Departamento;
- Unidade;
- Categoria;
- Título;
- Descrição;
- Status;
- Prioridade interna;
- Técnico responsável;
- Datas;
- Anexos;
- Histórico completo;
- Campo para comentário interno;
- Campo para comentário público ao solicitante;
- Botões de ação:
  - Assumir;
  - Alterar prioridade;
  - Alterar status;
  - Resolver;
  - Cancelar;
  - Reabrir.

---

# Filtros da área técnica

Filtros recomendados:

- Status;
- Prioridade interna;
- Departamento;
- Unidade;
- Categoria;
- Técnico responsável;
- Período de abertura;
- Chamados sem técnico;
- Chamados não classificados;
- Chamados vencidos;
- Chamados resolvidos hoje.

---

# Relatórios futuros

Para versões futuras, considerar:

- Quantidade de chamados por departamento;
- Quantidade de chamados por unidade;
- Quantidade de chamados por categoria;
- Tempo médio de resolução;
- Chamados por técnico;
- Chamados urgentes por período;
- Chamados vencidos;
- Chamados resolvidos por mês.

---

# Estilo visual sugerido

## Portal do solicitante

Visual simples:

- Poucos botões;
- Cards grandes;
- Linguagem amigável;
- Sem menus técnicos;
- Foco em “pedir ajuda”.

Cores sugeridas:

- Fundo: `#F5F7FB`;
- Cards: branco;
- Botão principal: azul;
- Texto principal: grafite.

## Área técnica

Visual administrativo:

- Menu lateral;
- Cards de indicadores;
- Filtros;
- Tabela;
- Badges coloridas de status/prioridade;
- Ações rápidas.

Status com cores:

| Status | Cor sugerida |
|---|---|
| aberto | azul |
| em_analise | roxo |
| em_atendimento | azul claro |
| pendente | amarelo/laranja |
| resolvido | verde |
| cancelado | cinza |

Prioridade com cores:

| Prioridade | Cor sugerida |
|---|---|
| nao_classificada | cinza |
| baixa | verde |
| media | azul |
| alta | laranja |
| urgente | vermelho |

---

# Requisitos mínimos para o MVP

## Portal do solicitante

- Login integrado ao Procis;
- Redirecionamento conforme token/perfil;
- Tela inicial do portal;
- Formulário de abertura de chamado;
- Lista “Meus chamados”;
- Tela de detalhes simplificada do chamado.

## Área técnica

- Dashboard técnico;
- Tabela de todos os chamados;
- Filtros principais;
- Tela de detalhe completo;
- Assumir chamado;
- Definir prioridade;
- Alterar status;
- Comentário interno;
- Comentário público;
- Finalizar chamado.

## Banco

Criar inicialmente:

- `chamados_tickets`;
- `chamados_categorias`;
- `chamados_historico`;
- `chamados_anexos`.

---

# Observações finais para o Codex

Implementar o módulo de forma integrada ao Procis existente.

A tela de login já existe. O foco é desenvolver:

1. Rotas do módulo de chamados;
2. Controle de permissão por tipo de token;
3. Portal limitado do solicitante;
4. Painel completo da TI;
5. CRUD básico de chamados;
6. Estrutura MySQL;
7. Histórico de movimentações;
8. Suporte a anexos;
9. Separação real entre área técnica e área do solicitante.

Não permitir que o solicitante defina prioridade/urgência.
A prioridade é uma decisão interna da TI.
