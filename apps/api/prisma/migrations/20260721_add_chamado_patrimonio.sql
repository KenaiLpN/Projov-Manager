-- Adiciona a identificação patrimonial opcional aos chamados existentes.
-- Execute uma única vez no banco que já possui a tabela chamados_tickets.

ALTER TABLE `chamados_tickets`
  ADD COLUMN `patrimonio_codigo` VARCHAR(60) NULL AFTER `departamento_nome`,
  ADD KEY `idx_chamados_patrimonio` (`patrimonio_codigo`);
