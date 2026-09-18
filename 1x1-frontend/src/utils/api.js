const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(data?.error || "Error de conexión con el servidor");
  }
  return data;
}

// Auth
export const loginEntrenador = (dni, password) =>
  request("/auth/entrenador", {
    method: "POST",
    body: JSON.stringify({ dni, password }),
  });

export const loginAlumno = (dni, password) =>
  request("/auth/alumno", {
    method: "POST",
    body: JSON.stringify({ dni, password }),
  });

// Alumnos
export const getAlumnos = (entrenadorId) =>
  request(`/alumnos?entrenadorId=${entrenadorId}`);

export const getAlumno = (id) => request(`/alumnos/${id}`);

export const crearAlumno = (data) =>
  request("/alumnos", { method: "POST", body: JSON.stringify(data) });

export const actualizarAlumno = (id, data) =>
  request(`/alumnos/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const eliminarAlumno = (id) =>
  request(`/alumnos/${id}`, { method: "DELETE" });

export const getHistorialPeso = (alumnoId) =>
  request(`/alumnos/${alumnoId}/pesos`);

export const agregarPeso = (alumnoId, peso) =>
  request(`/alumnos/${alumnoId}/pesos`, {
    method: "POST",
    body: JSON.stringify({ peso }),
  });

// Ejercicios (librería del entrenador)
export const getEjercicios = (entrenadorId) =>
  request(`/ejercicios?entrenadorId=${entrenadorId}`);

export const crearEjercicio = (data) =>
  request("/ejercicios", { method: "POST", body: JSON.stringify(data) });

export const actualizarEjercicio = (id, data) =>
  request(`/ejercicios/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const eliminarEjercicio = (id) =>
  request(`/ejercicios/${id}`, { method: "DELETE" });

// Rutinas (semanas / días / ejercicios asignados, con historial)
export const getRutinaHistorial = (alumnoId) =>
  request(`/alumnos/${alumnoId}/rutina`);

export const crearSemana = (alumnoId, dias) =>
  request(`/alumnos/${alumnoId}/semanas`, {
    method: "POST",
    body: JSON.stringify({ dias }),
  });

export const actualizarSemana = (semanaId, dias) =>
  request(`/semanas/${semanaId}`, {
    method: "PUT",
    body: JSON.stringify({ dias }),
  });

export const eliminarSemana = (semanaId) =>
  request(`/semanas/${semanaId}`, { method: "DELETE" });

export const toggleDiaCompletado = (diaId, completado) =>
  request(`/dias/${diaId}/completado`, {
    method: "PATCH",
    body: JSON.stringify({ completado }),
  });

export const actualizarRutinaEjercicio = (id, data) =>
  request(`/rutina-ejercicios/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

// Convierte una semana tal como la devuelve la API (semana -> dias -> rutinaEjercicios)
// al formato que usan los componentes del front (instanciaId = id del RutinaEjercicio).
export function mapSemanaDesdeApi(semana) {
  return {
    id: semana.id,
    numero: semana.numero,
    dias: semana.dias.map((dia) => ({
      id: dia.id,
      completado: dia.completado,
      ejercicios: dia.ejercicios.map((re) => ({
        instanciaId: re.id,
        ejercicioId: re.ejercicioId,
        nombre: re.ejercicio.nombre,
        video: re.ejercicio.video,
        peso: re.peso ?? "",
        repeticiones: re.repeticiones ?? "",
        series: re.series ?? "",
        completado: re.completado,
        recomendacion: re.recomendacion ?? "",
        comentarioAlumno: re.comentarioAlumno ?? "",
      })),
    })),
  };
}

// Arma el payload que espera POST/PUT de semanas a partir del formato del front.
// Los ids "temp-..." son ejercicios/días que todavía no existen en la base.
export function mapSemanaParaApi(semana) {
  return {
    dias: semana.dias.map((dia) => ({
      ...(typeof dia.id === "number" ? { id: dia.id } : {}),
      ejercicios: dia.ejercicios.map((ej) => ({
        ...(typeof ej.instanciaId === "number" ? { id: ej.instanciaId } : {}),
        ejercicioId: ej.ejercicioId,
        peso: ej.peso,
        repeticiones: ej.repeticiones,
        series: ej.series,
        recomendacion: ej.recomendacion,
      })),
    })),
  };
}
