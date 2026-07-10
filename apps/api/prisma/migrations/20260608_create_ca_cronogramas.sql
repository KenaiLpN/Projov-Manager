SET @old_cronogramas_exists = (
  SELECT COUNT(*)
  FROM information_schema.tables
  WHERE table_schema = DATABASE()
    AND table_name = 'CACA_cronogramas'
);

SET @ca_cronogramas_exists = (
  SELECT COUNT(*)
  FROM information_schema.tables
  WHERE table_schema = DATABASE()
    AND table_name = 'CA_Cronogramas'
);

SET @rename_cronogramas_sql = IF(
  @old_cronogramas_exists = 1 AND @ca_cronogramas_exists = 0,
  'RENAME TABLE `CACA_cronogramas` TO `CA_Cronogramas`',
  'SELECT 1'
);

PREPARE rename_cronogramas_stmt FROM @rename_cronogramas_sql;
EXECUTE rename_cronogramas_stmt;
DEALLOCATE PREPARE rename_cronogramas_stmt;

CREATE TABLE IF NOT EXISTS `CA_Cronogramas` (
  `CroCodigo` INT NOT NULL AUTO_INCREMENT,
  `CroTurma` INT NOT NULL,
  `CroDisciplina` INT NOT NULL,
  `CroEducador` INT NOT NULL,
  `CroQuantidade` INT NOT NULL,
  `CroDataInicio` DATETIME NOT NULL,
  `CroDataAula` DATETIME NOT NULL,
  `CroSequencia` INT NOT NULL DEFAULT 1,
  `CroStatus` VARCHAR(1) NULL DEFAULT 'A',
  `CroUsuario` VARCHAR(50) NULL,
  `CroDataCriacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CroDataAlteracao` DATETIME NULL,
  PRIMARY KEY (`CroCodigo`),
  UNIQUE KEY `CA_Cronogramas_turma_disc_data_seq_key` (`CroTurma`, `CroDisciplina`, `CroDataAula`, `CroSequencia`),
  KEY `CA_Cronogramas_turma_idx` (`CroTurma`),
  KEY `CA_Cronogramas_disciplina_idx` (`CroDisciplina`),
  KEY `CA_Cronogramas_educador_idx` (`CroEducador`),
  KEY `CA_Cronogramas_data_aula_idx` (`CroDataAula`)
);

SET @copy_cronogramas_sql = IF(
  @old_cronogramas_exists = 1 AND @ca_cronogramas_exists = 1,
  'INSERT IGNORE INTO `CA_Cronogramas` (`CroCodigo`, `CroTurma`, `CroDisciplina`, `CroEducador`, `CroQuantidade`, `CroDataInicio`, `CroDataAula`, `CroSequencia`, `CroStatus`, `CroUsuario`, `CroDataCriacao`, `CroDataAlteracao`) SELECT `CroCodigo`, `CroTurma`, `CroDisciplina`, `CroEducador`, `CroQuantidade`, `CroDataInicio`, `CroDataAula`, `CroSequencia`, `CroStatus`, `CroUsuario`, `CroDataCriacao`, `CroDataAlteracao` FROM `CACA_cronogramas`',
  'SELECT 1'
);

PREPARE copy_cronogramas_stmt FROM @copy_cronogramas_sql;
EXECUTE copy_cronogramas_stmt;
DEALLOCATE PREPARE copy_cronogramas_stmt;
