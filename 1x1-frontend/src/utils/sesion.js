const SESION_KEY = "1x1_sesion";

// Guarda quién está logueado ahora mismo (entrenador o alumno).
// No es "la base de datos" de la app: solo un puntero de sesión para
// saber qué usuario sos al recargar la página; los datos reales viven en la API.
export function getSesion() {
  try {
    const raw = localStorage.getItem(SESION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSesion(sesion) {
  localStorage.setItem(SESION_KEY, JSON.stringify(sesion));
}

export function limpiarSesion() {
  localStorage.removeItem(SESION_KEY);
}
