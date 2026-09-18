import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma.js";

const router = Router();

function serializeEntrenador(entrenador) {
  const { passwordHash, ...resto } = entrenador;
  return resto;
}

// POST /api/entrenadores -> alta de entrenador
router.post("/", async (req, res) => {
  const { nombre, dni, password } = req.body;
  if (!nombre || !dni || !password) {
    return res
      .status(400)
      .json({ error: "Faltan campos obligatorios: nombre, dni, password" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const entrenador = await prisma.entrenador.create({
      data: { nombre, dni, passwordHash },
    });
    res.status(201).json(serializeEntrenador(entrenador));
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Ya existe un entrenador con ese DNI" });
    }
    throw err;
  }
});

// GET /api/entrenadores/:id
router.get("/:id", async (req, res) => {
  const entrenador = await prisma.entrenador.findUnique({
    where: { id: Number(req.params.id) },
  });
  if (!entrenador) return res.status(404).json({ error: "Entrenador no encontrado" });
  res.json(serializeEntrenador(entrenador));
});

// PUT /api/entrenadores/:id -> edita los datos de "Información personal"
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { nombre, apellido, mail, telefono, fechaNacimiento } = req.body;

  const data = {
    ...(nombre !== undefined && { nombre }),
    ...(apellido !== undefined && { apellido: apellido || null }),
    ...(mail !== undefined && { mail: mail || null }),
    ...(telefono !== undefined && { telefono: telefono || null }),
    ...(fechaNacimiento !== undefined && {
      fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
    }),
  };

  try {
    const entrenador = await prisma.entrenador.update({ where: { id }, data });

    // Si cambió el nombre, propaga la copia de solo lectura que usa
    // rutinaejercicio para identificar al entrenador desde Workbench
    // (esa columna la llena un trigger BEFORE INSERT, no se actualiza sola).
    if (data.nombre !== undefined) {
      await prisma.$executeRaw`
        UPDATE rutinaejercicio re
        JOIN ejercicio ej ON ej.id = re.ejercicioId
        SET re.entrenadorNombre = ${entrenador.nombre}
        WHERE ej.entrenadorId = ${id}
      `;
    }

    res.json(serializeEntrenador(entrenador));
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Entrenador no encontrado" });
    }
    throw err;
  }
});

export default router;
