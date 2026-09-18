import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma.js";

const router = Router();

function serializeAlumno(alumno) {
  const { passwordHash, ...resto } = alumno;
  return resto;
}

// GET /api/alumnos?entrenadorId=1
router.get("/", async (req, res) => {
  const entrenadorId = Number(req.query.entrenadorId);
  if (!entrenadorId) {
    return res.status(400).json({ error: "Falta el parámetro entrenadorId" });
  }
  const alumnos = await prisma.alumno.findMany({
    where: { entrenadorId },
    orderBy: { id: "asc" },
  });
  res.json(alumnos.map(serializeAlumno));
});

// GET /api/alumnos/:id
router.get("/:id", async (req, res) => {
  const alumno = await prisma.alumno.findUnique({
    where: { id: Number(req.params.id) },
  });
  if (!alumno) return res.status(404).json({ error: "Alumno no encontrado" });
  res.json(serializeAlumno(alumno));
});

// GET /api/alumnos/:id/pesos -> historial de peso corporal, más reciente primero
router.get("/:id/pesos", async (req, res) => {
  const alumnoId = Number(req.params.id);
  const registros = await prisma.registroPeso.findMany({
    where: { alumnoId },
    orderBy: { fecha: "desc" },
  });
  res.json(registros);
});

// POST /api/alumnos/:id/pesos -> agrega un nuevo registro de peso y actualiza el peso actual del alumno
router.post("/:id/pesos", async (req, res) => {
  const alumnoId = Number(req.params.id);
  const { peso } = req.body;
  if (peso == null || peso === "") {
    return res.status(400).json({ error: "Falta el peso" });
  }
  const pesoNumero = Number(peso);

  try {
    const [registro] = await prisma.$transaction([
      prisma.registroPeso.create({ data: { alumnoId, peso: pesoNumero } }),
      prisma.alumno.update({ where: { id: alumnoId }, data: { peso: pesoNumero } }),
    ]);
    res.status(201).json(registro);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }
    throw err;
  }
});

// POST /api/alumnos
router.post("/", async (req, res) => {
  const {
    entrenadorId,
    nombre,
    apellido,
    dni,
    password,
    telefono,
    edad,
    peso,
    experiencia,
    frecuencia,
    estadoPago,
  } = req.body;

  if (!entrenadorId || !nombre || !apellido || !dni || !password || !experiencia) {
    return res.status(400).json({
      error:
        "Faltan campos obligatorios: entrenadorId, nombre, apellido, dni, password, experiencia",
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const pesoInicial = peso != null && peso !== "" ? Number(peso) : null;

  try {
    const alumno = await prisma.alumno.create({
      data: {
        entrenadorId: Number(entrenadorId),
        nombre,
        apellido,
        dni,
        passwordHash,
        telefono: telefono || null,
        edad: edad != null ? Number(edad) : null,
        peso: pesoInicial,
        experiencia,
        frecuencia: frecuencia != null ? Number(frecuencia) : null,
        estadoPago: estadoPago || "pendiente",
        ...(pesoInicial != null && {
          historialPeso: { create: { peso: pesoInicial } },
        }),
      },
    });

    // El id recién asignado no existía todavía cuando se armó el registro,
    // así que este update dispara el trigger que completa `identificador`
    // (id - nombre - apellido) para poder identificar al alumno desde SQL.
    await prisma.alumno.update({
      where: { id: alumno.id },
      data: { nombre: alumno.nombre },
    });

    res.status(201).json(serializeAlumno(alumno));
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Ya existe un alumno con ese DNI" });
    }
    throw err;
  }
});

// PUT /api/alumnos/:id
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const {
    nombre,
    apellido,
    dni,
    password,
    telefono,
    edad,
    peso,
    experiencia,
    frecuencia,
    estadoPago,
  } = req.body;

  const data = {
    ...(nombre !== undefined && { nombre }),
    ...(apellido !== undefined && { apellido }),
    ...(dni !== undefined && { dni }),
    ...(telefono !== undefined && { telefono: telefono || null }),
    ...(edad !== undefined && { edad: edad != null ? Number(edad) : null }),
    ...(peso !== undefined && { peso: peso != null && peso !== "" ? Number(peso) : null }),
    ...(experiencia !== undefined && { experiencia }),
    ...(frecuencia !== undefined && {
      frecuencia: frecuencia != null ? Number(frecuencia) : null,
    }),
    ...(estadoPago !== undefined && { estadoPago }),
  };

  if (password) {
    data.passwordHash = await bcrypt.hash(password, 10);
  }

  try {
    const alumnoActual = await prisma.alumno.findUnique({ where: { id } });
    if (!alumnoActual) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }

    const pesoCambio =
      data.peso !== undefined && data.peso !== null && data.peso !== alumnoActual.peso;

    const alumno = await prisma.alumno.update({
      where: { id },
      data: {
        ...data,
        ...(pesoCambio && { historialPeso: { create: { peso: data.peso } } }),
      },
    });
    res.json(serializeAlumno(alumno));
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Ya existe un alumno con ese DNI" });
    }
    throw err;
  }
});

// DELETE /api/alumnos/:id
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    await prisma.alumno.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }
    throw err;
  }
});

export default router;
