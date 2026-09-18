-- AlterTable
-- Columnas de solo lectura para identificar rápido al alumno dueño de cada
-- fila al mirar estas tablas desde Workbench, sin tener que hacer el JOIN
-- manualmente. Se mantienen con triggers, igual que `alumno.identificador`.
ALTER TABLE `semana` ADD COLUMN `alumnoNombre` VARCHAR(191) NULL;
ALTER TABLE `semana` ADD COLUMN `alumnoApellido` VARCHAR(191) NULL;

ALTER TABLE `dia` ADD COLUMN `alumnoNombre` VARCHAR(191) NULL;
ALTER TABLE `dia` ADD COLUMN `alumnoApellido` VARCHAR(191) NULL;

ALTER TABLE `registropeso` ADD COLUMN `alumnoNombre` VARCHAR(191) NULL;
ALTER TABLE `registropeso` ADD COLUMN `alumnoApellido` VARCHAR(191) NULL;

-- Completa las filas que ya existían
UPDATE `semana` s
JOIN `alumno` a ON a.id = s.alumnoId
SET s.alumnoNombre = a.nombre, s.alumnoApellido = a.apellido;

UPDATE `dia` d
JOIN `semana` s ON s.id = d.semanaId
JOIN `alumno` a ON a.id = s.alumnoId
SET d.alumnoNombre = a.nombre, d.alumnoApellido = a.apellido;

UPDATE `registropeso` r
JOIN `alumno` a ON a.id = r.alumnoId
SET r.alumnoNombre = a.nombre, r.alumnoApellido = a.apellido;

-- alumnoId ya viene resuelto desde la app al insertar, así que un trigger
-- BEFORE INSERT (una sola sentencia, sin BEGIN/END) alcanza para completarlas.
CREATE TRIGGER `semana_alumno_bi` BEFORE INSERT ON `semana`
FOR EACH ROW
SET NEW.alumnoNombre = (SELECT nombre FROM alumno WHERE id = NEW.alumnoId),
    NEW.alumnoApellido = (SELECT apellido FROM alumno WHERE id = NEW.alumnoId);

CREATE TRIGGER `registropeso_alumno_bi` BEFORE INSERT ON `registropeso`
FOR EACH ROW
SET NEW.alumnoNombre = (SELECT nombre FROM alumno WHERE id = NEW.alumnoId),
    NEW.alumnoApellido = (SELECT apellido FROM alumno WHERE id = NEW.alumnoId);

-- `dia` no tiene alumnoId propio: sale de la semana a la que pertenece.
CREATE TRIGGER `dia_alumno_bi` BEFORE INSERT ON `dia`
FOR EACH ROW
SET NEW.alumnoNombre = (
      SELECT a.nombre FROM semana s JOIN alumno a ON a.id = s.alumnoId WHERE s.id = NEW.semanaId
    ),
    NEW.alumnoApellido = (
      SELECT a.apellido FROM semana s JOIN alumno a ON a.id = s.alumnoId WHERE s.id = NEW.semanaId
    );
