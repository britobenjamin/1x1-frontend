-- CreateTable
CREATE TABLE `Pago` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `alumnoId` INTEGER NOT NULL,
    `meses` INTEGER NULL,
    `fechaVencimientoAnterior` DATE NULL,
    `fechaVencimientoNueva` DATE NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `alumnoNombre` VARCHAR(191) NULL,
    `alumnoApellido` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Pago` ADD CONSTRAINT `Pago_alumnoId_fkey` FOREIGN KEY (`alumnoId`) REFERENCES `Alumno`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Igual criterio que semana/dia/registropeso/rutinaejercicio: alumnoId ya
-- viene resuelto desde la app al insertar, así que alcanza con un trigger
-- BEFORE INSERT (una sola sentencia) para completar el nombre/apellido.
CREATE TRIGGER `Pago_alumno_bi` BEFORE INSERT ON `Pago`
FOR EACH ROW
SET NEW.alumnoNombre = (SELECT nombre FROM Alumno WHERE id = NEW.alumnoId),
    NEW.alumnoApellido = (SELECT apellido FROM Alumno WHERE id = NEW.alumnoId);
