import "dotenv/config";
import express from "express";
import cors from "cors";

import entrenadoresRoutes from "./routes/entrenadores.routes.js";
import alumnosRoutes from "./routes/alumnos.routes.js";
import ejerciciosRoutes from "./routes/ejercicios.routes.js";
import rutinasRoutes from "./routes/rutinas.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/entrenadores", entrenadoresRoutes);
app.use("/api/alumnos", alumnosRoutes);
app.use("/api/ejercicios", ejerciciosRoutes);
app.use("/api", rutinasRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API 1x1 escuchando en http://localhost:${PORT}`);
});
