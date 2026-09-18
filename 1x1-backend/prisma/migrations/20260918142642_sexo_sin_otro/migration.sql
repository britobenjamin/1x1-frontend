-- AlterTable
-- Se deja solo masculino/femenino. Si hubiera filas con 'otro' quedarían NULL
-- (hoy no hay ninguna), antes de angostar el ENUM.
UPDATE `alumno` SET `sexo` = NULL WHERE `sexo` = 'otro';
ALTER TABLE `alumno` MODIFY `sexo` ENUM('masculino', 'femenino') NULL;
