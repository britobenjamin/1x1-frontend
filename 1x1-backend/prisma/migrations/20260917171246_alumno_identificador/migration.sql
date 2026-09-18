-- AlterTable
-- MySQL no permite que una columna GENERATED dependa de una columna AUTO_INCREMENT,
-- así que la mantenemos sincronizada con un trigger en vez de GENERATED ALWAYS AS.
-- No hay trigger de INSERT: MySQL no permite que un trigger vuelva a actualizar la
-- misma tabla que disparó el INSERT. Por eso el valor para filas nuevas se completa
-- desde la aplicación (ver alumnos.routes.js) justo después del create().
ALTER TABLE `alumno` ADD COLUMN `identificador` VARCHAR(255) NULL;

CREATE TRIGGER `alumno_identificador_bu` BEFORE UPDATE ON `alumno`
FOR EACH ROW
SET NEW.identificador = CONCAT(NEW.id, ' - ', NEW.nombre, ' - ', NEW.apellido);

UPDATE `alumno` SET `identificador` = CONCAT(`id`, ' - ', `nombre`, ' - ', `apellido`);
