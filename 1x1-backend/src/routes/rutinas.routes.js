import { Router } from "express";
import { prisma } from "../prisma.js";

const router = Router();

const includeCompleto = {
  dias: {
    orderBy: { numero: "asc" },
    include: {
      ejercicios: {
        orderBy: { orden: "asc" },
        include: { ejercicio: true },
      },
    },
  },
};

// GET /api/alumnos/:alumnoId/rutina  -> historial completo (todas las semanas)
router.get("/alumnos/:alumnoId/rutina", async (req, res) => {
  const alumnoId = Number(req.params.alumnoId);
  const semanas = await prisma.semana.findMany({
    where: { alumnoId },
    orderBy: { numero: "asc" },
    include: includeCompleto,
  });
  res.json(semanas);
});

// GET /api/alumnos/:alumnoId/rutina/actual -> última semana cargada
router.get("/alumnos/:alumnoId/rutina/actual", async (req, res) => {
  const alumnoId = Number(req.params.alumnoId);
  const semana = await prisma.semana.findFirst({
    where: { alumnoId },
    orderBy: { numero: "desc" },
    include: includeCompleto,
  });
  if (!semana) return res.status(404).json({ error: "El alumno no tiene rutina cargada" });
  res.json(semana);
});

function diasParaCreate(dias = []) {
  return dias.map((dia, diaIndex) => ({
    numero: dia.numero ?? diaIndex,
    ejercicios: {
      create: (dia.ejercicios || []).map((ej, ejIndex) => ({
        ejercicioId: Number(ej.ejercicioId),
        orden: ej.orden ?? ejIndex,
        peso: ej.peso != null && ej.peso !== "" ? Number(ej.peso) : null,
        repeticiones:
          ej.repeticiones != null && ej.repeticiones !== ""
            ? Number(ej.repeticiones)
            : null,
        series: ej.series != null && ej.series !== "" ? Number(ej.series) : null,
        recomendacion: ej.recomendacion?.trim() || null,
      })),
    },
  }));
}

// POST /api/alumnos/:alumnoId/semanas -> crea una semana nueva (siguiente número) con sus días/ejercicios
router.post("/alumnos/:alumnoId/semanas", async (req, res) => {
  const alumnoId = Number(req.params.alumnoId);
  const { dias } = req.body;

  const ultima = await prisma.semana.findFirst({
    where: { alumnoId },
    orderBy: { numero: "desc" },
  });
  const siguienteNumero = ultima ? ultima.numero + 1 : 1;

  const semana = await prisma.semana.create({
    data: {
      alumnoId,
      numero: siguienteNumero,
      dias: { create: diasParaCreate(dias) },
    },
    include: includeCompleto,
  });
  res.status(201).json(semana);
});

// PUT /api/semanas/:semanaId -> actualiza días/ejercicios de una semana ya existente.
// Hace upsert por id (no borra y recrea todo) para no perder el progreso que ya marcó el alumno
// en los días/ejercicios que no cambiaron.
router.put("/semanas/:semanaId", async (req, res) => {
  const semanaId = Number(req.params.semanaId);
  const { dias = [] } = req.body;

  const existente = await prisma.semana.findUnique({
    where: { id: semanaId },
    include: { dias: { include: { ejercicios: true } } },
  });
  if (!existente) return res.status(404).json({ error: "Semana no encontrada" });

  await prisma.$transaction(async (tx) => {
    const diasEnviadosIds = new Set(
      dias.filter((d) => d.id).map((d) => Number(d.id))
    );

    for (const diaExistente of existente.dias) {
      if (!diasEnviadosIds.has(diaExistente.id)) {
        await tx.dia.delete({ where: { id: diaExistente.id } });
      }
    }

    for (let i = 0; i < dias.length; i++) {
      const diaPayload = dias[i];
      const ejerciciosPayload = diaPayload.ejercicios || [];
      const diaExistente = existente.dias.find((d) => d.id === diaPayload.id);

      let diaId;
      if (diaExistente) {
        diaId = diaExistente.id;
        await tx.dia.update({ where: { id: diaId }, data: { numero: i } });
      } else {
        const nuevoDia = await tx.dia.create({ data: { semanaId, numero: i } });
        diaId = nuevoDia.id;
      }

      const ejerciciosExistentes = diaExistente?.ejercicios || [];
      const ejerciciosEnviadosIds = new Set(
        ejerciciosPayload.filter((e) => e.id).map((e) => Number(e.id))
      );

      for (const ejExistente of ejerciciosExistentes) {
        if (!ejerciciosEnviadosIds.has(ejExistente.id)) {
          await tx.rutinaEjercicio.delete({ where: { id: ejExistente.id } });
        }
      }

      for (let j = 0; j < ejerciciosPayload.length; j++) {
        const ej = ejerciciosPayload[j];
        const ejExistente = ejerciciosExistentes.find((e) => e.id === ej.id);
        const data = {
          ejercicioId: Number(ej.ejercicioId),
          orden: j,
          peso: ej.peso != null && ej.peso !== "" ? Number(ej.peso) : null,
          repeticiones:
            ej.repeticiones != null && ej.repeticiones !== ""
              ? Number(ej.repeticiones)
              : null,
          series: ej.series != null && ej.series !== "" ? Number(ej.series) : null,
          recomendacion: ej.recomendacion?.trim() || null,
        };
        if (ejExistente) {
          await tx.rutinaEjercicio.update({ where: { id: ejExistente.id }, data });
        } else {
          await tx.rutinaEjercicio.create({ data: { ...data, diaId } });
        }
      }
    }
  });

  const semanaActualizada = await prisma.semana.findUnique({
    where: { id: semanaId },
    include: includeCompleto,
  });
  res.json(semanaActualizada);
});

// DELETE /api/semanas/:semanaId
router.delete("/semanas/:semanaId", async (req, res) => {
  const semanaId = Number(req.params.semanaId);
  try {
    await prisma.semana.delete({ where: { id: semanaId } });
    res.status(204).end();
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Semana no encontrada" });
    }
    throw err;
  }
});

// PATCH /api/dias/:diaId/completado  body: { completado: boolean }
router.patch("/dias/:diaId/completado", async (req, res) => {
  const diaId = Number(req.params.diaId);
  const { completado } = req.body;
  try {
    const dia = await prisma.dia.update({
      where: { id: diaId },
      data: { completado: !!completado },
    });
    res.json(dia);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Día no encontrado" });
    }
    throw err;
  }
});

// PATCH /api/rutina-ejercicios/:id
// body: { completado?, peso?, repeticiones?, series?, recomendacion?, comentarioAlumno? }
router.patch("/rutina-ejercicios/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { completado, peso, repeticiones, series, recomendacion, comentarioAlumno } =
    req.body;

  const data = {
    ...(completado !== undefined && { completado: !!completado }),
    ...(peso !== undefined && { peso: peso != null ? Number(peso) : null }),
    ...(repeticiones !== undefined && {
      repeticiones: repeticiones != null ? Number(repeticiones) : null,
    }),
    ...(series !== undefined && { series: series != null ? Number(series) : null }),
    ...(recomendacion !== undefined && {
      recomendacion: recomendacion?.trim() || null,
    }),
    ...(comentarioAlumno !== undefined && {
      comentarioAlumno: comentarioAlumno?.trim() || null,
    }),
  };

  try {
    const rutinaEjercicio = await prisma.rutinaEjercicio.update({
      where: { id },
      data,
      include: { ejercicio: true },
    });
    res.json(rutinaEjercicio);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Ejercicio de rutina no encontrado" });
    }
    throw err;
  }
});

export default router;
