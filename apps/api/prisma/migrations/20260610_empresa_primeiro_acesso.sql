UPDATE `CA_Parceiros`
SET `ParSenha` = NULL;

ALTER TABLE `CA_Parceiros`
  MODIFY COLUMN `ParSenha` VARCHAR(200) NULL;
