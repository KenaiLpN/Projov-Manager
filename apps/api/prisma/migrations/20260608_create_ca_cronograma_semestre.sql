CREATE TABLE IF NOT EXISTS `CA_CronogramaSemestre` (
  `CseCodigo` INT NOT NULL AUTO_INCREMENT,
  `CseTurma` INT NOT NULL,
  `CseAprendiz` INT NOT NULL,
  `CseUnidadeParceiro` INT NULL,
  `CseDataBase` DATETIME NOT NULL,
  `CseDataInicio` DATETIME NULL,
  `CseDataPrevTermino` DATETIME NULL,
  `CseStatus` VARCHAR(1) NULL DEFAULT 'A',
  `CseUsuario` VARCHAR(50) NULL,
  `CseDataCriacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CseDataAlteracao` DATETIME NULL,
  PRIMARY KEY (`CseCodigo`),
  UNIQUE KEY `CA_CronogramaSemestre_turma_aprendiz_data_key` (`CseTurma`, `CseAprendiz`, `CseDataBase`),
  KEY `CA_CronogramaSemestre_turma_idx` (`CseTurma`),
  KEY `CA_CronogramaSemestre_aprendiz_idx` (`CseAprendiz`),
  KEY `CA_CronogramaSemestre_data_base_idx` (`CseDataBase`)
);
