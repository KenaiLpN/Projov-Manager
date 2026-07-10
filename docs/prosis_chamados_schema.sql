-- Schema MySQL — Módulo de Chamados de TI do Procis
-- Charset recomendado: utf8mb4
-- Observação: adaptar nomes de tabelas/campos caso o banco atual do Procis já tenha tabelas de usuários, departamentos e unidades.

CREATE TABLE IF NOT EXISTS chamados_categorias (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255) NULL,
    ativo TINYINT(1) NOT NULL DEFAULT 1,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uk_chamados_categorias_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

CREATE TABLE IF NOT EXISTS chamados_tickets (
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

CREATE TABLE IF NOT EXISTS chamados_historico (
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

CREATE TABLE IF NOT EXISTS chamados_anexos (
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
