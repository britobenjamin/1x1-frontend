-- AlterTable
-- Mismo criterio que semana/dia/registropeso: columnas de solo lectura para
-- identificar rápido al alumno y al entrenador desde Workbench sin JOINs manuales.
ALTER TABLE `rutinaejercicio` ADD COLUMN `alumnoNombre` VARCHAR(191) NULL;
ALTER TABLE `rutinaejercicio` ADD COLUMN `alumnoApellido` VARCHAR(191) NULL;
ALTER TABLE `rutinaejercicio` ADD COLUMN `entrenadorNombre` VARCHAR(191) NULL;

-- Completa las filas que ya existían
UPDATE `rutinaejercicio` re
JOIN `dia` d ON d.id = re.diaId
JOIN `ejercicio` ej ON ej.id = re.ejercicioId
JOIN `entrenador` e ON e.id = ej.entrenadorId
SET re.alumnoNombre = d.alumnoNombre,
    re.alumnoApellido = d.alumnoApellido,
    re.entrenadorNombre = e.nombre;

-- `dia` ya trae alumnoNombre/alumnoApellido resueltos por su propio trigger,
-- así que solo hace falta un JOIN más para llegar al ejercicio y su entrenador.
CREATE TRIGGER `rutinaejercicio_alumno_entrenador_bi` BEFORE INSERT ON `rutinaejercicio`
FOR EACH ROW
SET NEW.alumnoNombre = (SELECT alumnoNombre FROM dia WHERE id = NEW.diaId),
    NEW.alumnoApellido = (SELECT alumnoApellido FROM dia WHERE id = NEW.diaId),
    NEW.entrenadorNombre = (
      SELECT e.nombre FROM ejercicio ej JOIN entrenador e ON e.id = ej.entrenadorId
      WHERE ej.id = NEW.ejercicioId
    );
