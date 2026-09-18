import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma.js";

const router = Router();

// POST /api/auth/entrenador  body: { dni, password }
router.post("/entrenador", async (req, res) => {
  const { dni, password } = req.body;
  if (!dni || !password) {
    return res.status(400).json({ error: "Faltan dni y/o password" });
  }

  const entrenador = await prisma.entrenador.findUnique({ where: { dni } });
  if (!entrenador || !(await bcrypt.compare(password, entrenador.passwordHash))) {
    return res.status(401).json({ error: "DNI o contraseña incorrectos" });
  }

  const { passwordHash, ...resto } = entrenador;
  res.json(resto);
});

// POST /api/auth/alumno  body: { dni, password }
router.post("/alumno", async (req, res) => {
  const { dni, password } = req.body;
  if (!dni || !password) {
    return res.status(400).json({ error: "Faltan dni y/o password" });
  }

  const alumno = await prisma.alumno.findUnique({ where: { dni } });
  if (!alumno || !(await bcrypt.compare(password, alumno.passwordHash))) {
    return res.status(401).json({ error: "DNI o contraseña incorrectos" });
  }

  const { passwordHash, ...resto } = alumno;
  res.json(resto);
});

export default router;
