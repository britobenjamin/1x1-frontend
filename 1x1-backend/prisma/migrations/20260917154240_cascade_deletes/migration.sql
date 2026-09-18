-- DropForeignKey
ALTER TABLE `dia` DROP FOREIGN KEY `Dia_semanaId_fkey`;

-- DropForeignKey
ALTER TABLE `rutinaejercicio` DROP FOREIGN KEY `RutinaEjercicio_diaId_fkey`;

-- DropForeignKey
ALTER TABLE `semana` DROP FOREIGN KEY `Semana_alumnoId_fkey`;

-- DropIndex
DROP INDEX `RutinaEjercicio_diaId_fkey` ON `rutinaejercicio`;

-- AddForeignKey
ALTER TABLE `Semana` ADD CONSTRAINT `Semana_alumnoId_fkey` FOREIGN KEY (`alumnoId`) REFERENCES `Alumno`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dia` ADD CONSTRAINT `Dia_semanaId_fkey` FOREIGN KEY (`semanaId`) REFERENCES `Semana`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RutinaEjercicio` ADD CONSTRAINT `RutinaEjercicio_diaId_fkey` FOREIGN KEY (`diaId`) REFERENCES `Dia`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
