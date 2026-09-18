-- AlterTable
ALTER TABLE `Entrenador` DROP COLUMN `email`,
    ADD COLUMN `dni` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Entrenador_dni_key` ON `Entrenador`(`dni`);
