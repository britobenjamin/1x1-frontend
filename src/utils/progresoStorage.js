const STORAGE_KEY = "1x1_progreso";
const STORAGE_KEY_DIAS = "1x1_progreso_dias";

function getTodos(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getProgreso(alumnoId) {
  const todos = getTodos(STORAGE_KEY);
  return todos[alumnoId] || {};
}

export function toggleEjercicioCompletado(alumnoId, instanciaId) {
  const todos = getTodos(STORAGE_KEY);
  const progresoAlumno = { ...(todos[alumnoId] || {}) };
  progresoAlumno[instanciaId] = !progresoAlumno[instanciaId];
  todos[alumnoId] = progresoAlumno;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  return progresoAlumno;
}

export function getDiasCompletados(alumnoId) {
  const todos = getTodos(STORAGE_KEY_DIAS);
  return todos[alumnoId] || {};
}

export function toggleDiaCompletado(alumnoId, claveDia) {
  const todos = getTodos(STORAGE_KEY_DIAS);
  const diasAlumno = { ...(todos[alumnoId] || {}) };
  diasAlumno[claveDia] = !diasAlumno[claveDia];
  todos[alumnoId] = diasAlumno;
  localStorage.setItem(STORAGE_KEY_DIAS, JSON.stringify(todos));
  return diasAlumno;
}

export function eliminarSemanaDeProgreso(alumnoId, indiceSemanaEliminada) {
  const todosDias = getTodos(STORAGE_KEY_DIAS);
  const diasAlumno = todosDias[alumnoId] || {};
  const nuevosDias = {};
  Object.entries(diasAlumno).forEach(([clave, valor]) => {
    const [indiceSemana, indiceDia] = clave.split("-").map(Number);
    if (indiceSemana === indiceSemanaEliminada) return;
    const nuevoIndice =
      indiceSemana > indiceSemanaEliminada ? indiceSemana - 1 : indiceSemana;
    nuevosDias[`${nuevoIndice}-${indiceDia}`] = valor;
  });
  todosDias[alumnoId] = nuevosDias;
  localStorage.setItem(STORAGE_KEY_DIAS, JSON.stringify(todosDias));
  return nuevosDias;
}
