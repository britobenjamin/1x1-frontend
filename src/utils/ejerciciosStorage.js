const STORAGE_KEY = "1x1_ejercicios";

const EJERCICIOS_INICIALES = [
  {
    id: 1,
    nombre: "Press plano",
    video: "https://www.youtube.com/shorts/HzkHpIIo4IA",
  },
  {
    id: 2,
    nombre: "Sentadillas",
    video: "https://www.youtube.com/shorts/7xeLHxobaWs",
  },
  {
    id: 3,
    nombre: "Prensa 45 grados",
    video: "https://www.youtube.com/shorts/0-t5LejEP1c",
  },
];

export function getEjercicios() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      saveEjercicios(EJERCICIOS_INICIALES);
      return EJERCICIOS_INICIALES;
    }
    return JSON.parse(raw);
  } catch {
    return EJERCICIOS_INICIALES;
  }
}

export function saveEjercicios(ejercicios) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ejercicios));
}
