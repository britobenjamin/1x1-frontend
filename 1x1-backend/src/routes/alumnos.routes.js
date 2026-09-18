import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma.js";

const router = Router();

// El estado de pago se deriva siempre de fechaVencimiento (no de lo que haya
// guardado en la columna estadoPago), así nunca queda desactualizado: pasado
// el día de vencimiento, el alumno pasa a "vencido" solo con que pase el tiempo.
function calcularEstadoPago(fechaVencimiento) {
  if (!fechaVencimiento) return "pendiente";
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const vencimiento = new Date(fechaVencimiento);
  vencimiento.setHours(0, 0, 0, 0);
  return vencimiento >= hoy ? "pagado" : "vencido";
}

function sumarMeses(fecha, meses) {
  const resultado = new Date(fecha);
  resultado.setMonth(resultado.getMonth() + meses);
  return resultado;
}

function serializeAlumno(alumno) {
  const { passwordHash, ...resto } = alumno;
  return { ...resto, estadoPago: calcularEstadoPago(alumno.fechaVencimiento) };
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

// GET /api/alumnos/:id/pagos -> historial de pagos de cuota, más reciente primero
router.get("/:id/pagos", async (req, res) => {
  const alumnoId = Number(req.params.id);
  const pagos = await prisma.pago.findMany({
    where: { alumnoId },
    orderBy: { fecha: "desc" },
  });
  res.json(pagos);
});

// POST /api/alumnos/:id/pagos -> registra un pago de cuota (body: { meses?, fechaVencimiento })
// y actualiza fechaVencimiento del alumno. Queda una fila en el historial por cada pago.
router.post("/:id/pagos", async (req, res) => {
  const alumnoId = Number(req.params.id);
  const { meses, fechaVencimiento } = req.body;
  if (!fechaVencimiento) {
    return res.status(400).json({ error: "Falta la fecha de vencimiento" });
  }

  const alumnoActual = await prisma.alumno.findUnique({ where: { id: alumnoId } });
  if (!alumnoActual) return res.status(404).json({ error: "Alumno no encontrado" });

  const nuevaFecha = new Date(fechaVencimiento);

  const [pago, alumno] = await prisma.$transaction([
    prisma.pago.create({
      data: {
        alumnoId,
        meses: meses != null && meses !== "" ? Number(meses) : null,
        fechaVencimientoAnterior: alumnoActual.fechaVencimiento,
        fechaVencimientoNueva: nuevaFecha,
      },
    }),
    prisma.alumno.update({
      where: { id: alumnoId },
      data: { fechaVencimiento: nuevaFecha },
    }),
  ]);

  res.status(201).json({ pago, alumno: serializeAlumno(alumno) });
});

// POST /api/alumnos
router.post("/", async (req, res) => {
  const {
    entrenadorId,
    nombre,
    apellido,
    dni,
    password,
    mail,
    telefono,
    sexo,
    edad,
    peso,
    experiencia,
    frecuencia,
    lesiones,
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
        mail: mail || null,
        telefono: telefono || null,
        sexo: sexo || null,
        edad: edad != null ? Number(edad) : null,
        peso: pesoInicial,
        experiencia,
        frecuencia: frecuencia != null ? Number(frecuencia) : null,
        lesiones: lesiones?.trim() || null,
        estadoPago: estadoPago || "pendiente",
        // Primer vencimiento: un mes después de la inscripción (si se inscribe
        // el 5, la cuota vence el 5 del mes siguiente). El entrenador puede
        // ajustarlo después desde Administración.
        fechaVencimiento: sumarMeses(new Date(), 1),
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
    mail,
    telefono,
    sexo,
    edad,
    peso,
    experiencia,
    frecuencia,
    lesiones,
    estadoPago,
    fechaVencimiento,
  } = req.body;

  const data = {
    ...(nombre !== undefined && { nombre }),
    ...(apellido !== undefined && { apellido }),
    ...(dni !== undefined && { dni }),
    ...(mail !== undefined && { mail: mail || null }),
    ...(telefono !== undefined && { telefono: telefono || null }),
    ...(sexo !== undefined && { sexo: sexo || null }),
    ...(edad !== undefined && { edad: edad != null ? Number(edad) : null }),
    ...(peso !== undefined && { peso: peso != null && peso !== "" ? Number(peso) : null }),
    ...(experiencia !== undefined && { experiencia }),
    ...(frecuencia !== undefined && {
      frecuencia: frecuencia != null ? Number(frecuencia) : null,
    }),
    ...(lesiones !== undefined && { lesiones: lesiones?.trim() || null }),
    ...(estadoPago !== undefined && { estadoPago }),
    ...(fechaVencimiento !== undefined && {
      fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : null,
    }),
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

    // Si cambió el nombre o apellido, propaga la copia de solo lectura que
    // usan semana/dia/registropeso/rutinaejercicio para identificar al alumno
    // desde Workbench (esas columnas las llena un trigger BEFORE INSERT, no
    // se actualizan solas).
    if (data.nombre !== undefined || data.apellido !== undefined) {
      await prisma.$executeRaw`
        UPDATE semana SET alumnoNombre = ${alumno.nombre}, alumnoApellido = ${alumno.apellido}
        WHERE alumnoId = ${id}
      `;
      await prisma.$executeRaw`
        UPDATE dia d JOIN semana s ON s.id = d.semanaId
        SET d.alumnoNombre = ${alumno.nombre}, d.alumnoApellido = ${alumno.apellido}
        WHERE s.alumnoId = ${id}
      `;
      await prisma.$executeRaw`
        UPDATE registropeso SET alumnoNombre = ${alumno.nombre}, alumnoApellido = ${alumno.apellido}
        WHERE alumnoId = ${id}
      `;
      await prisma.$executeRaw`
        UPDATE rutinaejercicio re
        JOIN dia d ON d.id = re.diaId
        JOIN semana s ON s.id = d.semanaId
        SET re.alumnoNombre = ${alumno.nombre}, re.alumnoApellido = ${alumno.apellido}
        WHERE s.alumnoId = ${id}
      `;
    }

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
