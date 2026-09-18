-- AlterTable
ALTER TABLE `alumno` ADD COLUMN `mail` VARCHAR(191) NULL;
ALTER TABLE `alumno` ADD COLUMN `sexo` ENUM('masculino', 'femenino', 'otro') NULL;
