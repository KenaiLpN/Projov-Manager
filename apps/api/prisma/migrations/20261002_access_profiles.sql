CREATE TABLE IF NOT EXISTS `access_profiles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(64) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `parentId` INT NULL,
  `isCoordinator` BOOLEAN NOT NULL DEFAULT FALSE,
  `isSystem` BOOLEAN NOT NULL DEFAULT FALSE,
  `active` BOOLEAN NOT NULL DEFAULT TRUE,
  `version` INT NOT NULL DEFAULT 1,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `access_profiles_code_key` (`code`),
  UNIQUE KEY `access_profiles_name_key` (`name`),
  KEY `access_profiles_parentId_idx` (`parentId`),
  KEY `access_profiles_active_idx` (`active`),
  CONSTRAINT `access_profiles_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `access_profiles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `access_permissions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `key` VARCHAR(120) NOT NULL,
  `section` VARCHAR(80) NOT NULL,
  `groupName` VARCHAR(100) NOT NULL,
  `label` VARCHAR(120) NOT NULL,
  `routePattern` VARCHAR(255) NULL,
  `editable` BOOLEAN NOT NULL DEFAULT TRUE,
  `displayOrder` INT NOT NULL DEFAULT 0,
  `active` BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `access_permissions_key_key` (`key`),
  KEY `access_permissions_section_displayOrder_idx` (`section`, `displayOrder`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `access_profile_permissions` (
  `profileId` INT NOT NULL,
  `permissionId` INT NOT NULL,
  `canView` BOOLEAN NOT NULL DEFAULT FALSE,
  `canEdit` BOOLEAN NOT NULL DEFAULT FALSE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`profileId`, `permissionId`),
  KEY `access_profile_permissions_permissionId_idx` (`permissionId`),
  CONSTRAINT `access_profile_permissions_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `access_profiles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `access_profile_permissions_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `access_permissions` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `access_user_profiles` (
  `userCode` VARCHAR(50) NOT NULL,
  `profileId` INT NOT NULL,
  `validFrom` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `validUntil` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`userCode`),
  KEY `access_user_profiles_profileId_idx` (`profileId`),
  CONSTRAINT `access_user_profiles_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `access_profiles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `access_permission_audit_log` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `actorCode` VARCHAR(50) NOT NULL,
  `event` VARCHAR(80) NOT NULL,
  `targetType` VARCHAR(50) NOT NULL,
  `targetId` VARCHAR(100) NOT NULL,
  `beforeJson` JSON NULL,
  `afterJson` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `access_permission_audit_log_actorCode_createdAt_idx` (`actorCode`, `createdAt`),
  KEY `access_permission_audit_log_targetType_targetId_idx` (`targetType`, `targetId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT IGNORE INTO `access_profiles` (`code`, `name`, `isSystem`, `active`) VALUES
  ('A', 'Administrador', TRUE, TRUE),
  ('C', 'Recepção', TRUE, TRUE),
  ('P', 'Pedagógico', TRUE, TRUE),
  ('T', 'Técnico', TRUE, TRUE),
  ('E', 'Empresarial', TRUE, TRUE),
  ('S', 'Pesquisa', TRUE, TRUE),
  ('D', 'Desligado', TRUE, FALSE),
  ('DEV', 'Desenvolvedor', TRUE, TRUE);
