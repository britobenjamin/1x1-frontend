const STORAGE_KEY = "1x1_rutinas";

function getTodas() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function normalizarRutina(rutina) {
  if (!rutina) return null;
  if (Array.isArray(rutina.semanas) && rutina.semanas.length > 0) {
    return rutina;
  }
  if (Array.isArray(rutina.dias)) {
    return { semanas: [{ dias: rutina.dias }] };
  }
  return null;
}

export function getRutina(alumnoId) {
  const todas = getTodas();
  return normalizarRutina(todas[alumnoId]);
}

export function saveRutina(alumnoId, rutina) {
  const todas = getTodas();
  todas[alumnoId] = rutina;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todas));
}
