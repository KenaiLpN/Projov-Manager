-- =====================================================
-- Migração: CA_OcorrenciasdoAprendiz
-- Corrige os tipos das colunas para compatibilidade
-- com o Prisma Client (Schema: schema.prisma)
-- =====================================================

ALTER TABLE CA_OcorrenciasdoAprendiz
  MODIFY COLUMN OcadDataOcorrencia DATETIME NULL,
  MODIFY COLUMN OcadDataEntrega    DATETIME NULL,
  MODIFY COLUMN OcadPrevDevolucao  DATETIME NULL,
  MODIFY COLUMN OcadDevolucao      DATETIME NULL;

-- Verificação após a migração
DESCRIBE CA_OcorrenciasdoAprendiz;
