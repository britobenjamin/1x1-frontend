import { Router } from "express";
import { prisma } from "../prisma.js";

const router = Router();

// GET /api/ejercicios?entrenadorId=1
router.get("/", async (req, res) => {
  const entrenadorId = Number(req.query.entrenadorId);
  if (!entrenadorId) {
    return res.status(400).json({ error: "Falta el parámetro entrenadorId" });
  }
  const ejercicios = await prisma.ejercicio.findMany({
    where: { entrenadorId },
    orderBy: { id: "asc" },
  });
  res.json(ejercicios);
});

// POST /api/ejercicios
router.post("/", async (req, res) => {
  const { entrenadorId, nombre, video } = req.body;
  if (!entrenadorId || !nombre || !video) {
    return res
      .status(400)
      .json({ error: "Faltan campos obligatorios: entrenadorId, nombre, video" });
  }
  const ejercicio = await prisma.ejercicio.create({
    data: { entrenadorId: Number(entrenadorId), nombre, video },
  });
  res.status(201).json(ejercicio);
});

// PUT /api/ejercicios/:id
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { nombre, video } = req.body;
  try {
    const ejercicio = await prisma.ejercicio.update({
      where: { id },
      data: {
        ...(nombre !== undefined && { nombre }),
        ...(video !== undefined && { video }),
      },
    });
    res.json(ejercicio);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Ejercicio no encontrado" });
    }
    throw err;
  }
});

// DELETE /api/ejercicios/:id
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    await prisma.ejercicio.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Ejercicio no encontrado" });
    }
    throw err;
  }
});

export default router;
