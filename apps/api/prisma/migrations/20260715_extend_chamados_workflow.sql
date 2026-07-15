-- Atualização do módulo de chamados para bancos que já receberam o script de 20260714.
-- Para uma instalação nova, execute somente 20260714_create_chamados_tables.sql.
-- Este script deve ser executado uma única vez e não é aplicado automaticamente pelo build.

ALTER TABLE `chamados_tickets`
  ADD COLUMN `solicitante_funcao` VARCHAR(100) NULL AFTER `solicitante_email`,
  ADD COLUMN `observacao` TEXT NULL AFTER `descricao`;

-- Aceita temporariamente os valores antigos para permitir a conversão dos dados.
ALTER TABLE `chamados_tickets`
  MODIFY COLUMN `prioridade_interna` ENUM(
    'nao_classificada',
    'baixa',
    'minima',
    'media',
    'alta',
    'urgente',
    'maxima'
  ) NOT NULL DEFAULT 'nao_classificada';

UPDATE `chamados_tickets`
SET `prioridade_interna` = 'minima'
WHERE `prioridade_interna` = 'baixa';

UPDATE `chamados_tickets`
SET `prioridade_interna` = 'maxima'
WHERE `prioridade_interna` IN ('alta', 'urgente');

ALTER TABLE `chamados_tickets`
  MODIFY COLUMN `prioridade_interna` ENUM(
    'nao_classificada',
    'minima',
    'media',
    'maxima'
  ) NOT NULL DEFAULT 'nao_classificada';

ALTER TABLE `chamados_historico`
  MODIFY COLUMN `tipo_evento` ENUM(
    'criado',
    'editado',
    'status_alterado',
    'prioridade_alterada',
    'atribuicao',
    'comentario_interno',
    'comentario_publico',
    'anexo',
    'resolucao',
    'cancelamento',
    'reabertura'
  ) NOT NULL;

CREATE TABLE IF NOT EXISTS `chamados_resolucoes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `chamado_id` BIGINT UNSIGNED NOT NULL,
  `usuario_id` VARCHAR(50) NULL,
  `usuario_nome` VARCHAR(150) NULL,
  `observacao` TEXT NULL,
  `resolvido_em` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_resolucoes_chamado` (`chamado_id`),
  KEY `idx_resolucoes_resolvido_em` (`resolvido_em`),
  CONSTRAINT `fk_resolucoes_chamado`
    FOREIGN KEY (`chamado_id`)
    REFERENCES `chamados_tickets` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

