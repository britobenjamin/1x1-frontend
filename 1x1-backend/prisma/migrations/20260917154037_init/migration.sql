-- CreateTable
CREATE TABLE `Entrenador` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Entrenador_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Alumno` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `entrenadorId` INTEGER NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `apellido` VARCHAR(191) NOT NULL,
    `dni` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `edad` INTEGER NULL,
    `peso` DOUBLE NULL,
    `fechaInscripcion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `experiencia` ENUM('nuevo', 'entrenando') NOT NULL,
    `frecuencia` INTEGER NULL,
    `estadoPago` ENUM('pagado', 'pendiente', 'vencido') NOT NULL DEFAULT 'pendiente',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Alumno_dni_key`(`dni`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ejercicio` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `entrenadorId` INTEGER NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `video` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Semana` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `alumnoId` INTEGER NOT NULL,
    `numero` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Semana_alumnoId_numero_key`(`alumnoId`, `numero`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Dia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `semanaId` INTEGER NOT NULL,
    `numero` INTEGER NOT NULL,
    `completado` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Dia_semanaId_numero_key`(`semanaId`, `numero`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RutinaEjercicio` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `diaId` INTEGER NOT NULL,
    `ejercicioId` INTEGER NOT NULL,
    `orden` INTEGER NOT NULL,
    `peso` DOUBLE NULL,
    `repeticiones` INTEGER NULL,
    `series` INTEGER NULL,
    `completado` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Alumno` ADD CONSTRAINT `Alumno_entrenadorId_fkey` FOREIGN KEY (`entrenadorId`) REFERENCES `Entrenador`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ejercicio` ADD CONSTRAINT `Ejercicio_entrenadorId_fkey` FOREIGN KEY (`entrenadorId`) REFERENCES `Entrenador`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Semana` ADD CONSTRAINT `Semana_alumnoId_fkey` FOREIGN KEY (`alumnoId`) REFERENCES `Alumno`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dia` ADD CONSTRAINT `Dia_semanaId_fkey` FOREIGN KEY (`semanaId`) REFERENCES `Semana`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RutinaEjercicio` ADD CONSTRAINT `RutinaEjercicio_diaId_fkey` FOREIGN KEY (`diaId`) REFERENCES `Dia`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RutinaEjercicio` ADD CONSTRAINT `RutinaEjercicio_ejercicioId_fkey` FOREIGN KEY (`ejercicioId`) REFERENCES `Ejercicio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
