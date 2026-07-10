UPDATE `CA_Educadores`
SET `EducSenha` = NULL;

ALTER TABLE `CA_Educadores`
  MODIFY COLUMN `EducSenha` VARCHAR(200) NULL;
