import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NavbarWide from "../components/NavbarWide.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import { getEjercicios, saveEjercicios } from "../utils/ejerciciosStorage.js";
import { getYoutubeId, getYoutubeThumbnail } from "../utils/youtube.js";
import "./ListaEjercicios.css";

function ListaEjercicios() {
  const [ejercicios, setEjercicios] = useState([]);
  const [nombre, setNombre] = useState("");
  const [video, setVideo] = useState("");
  const [ejercicioAEliminar, setEjercicioAEliminar] = useState(null);

  useEffect(() => {
    setEjercicios(getEjercicios());
  }, []);

  const agregarEjercicio = (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const nuevo = { id: Date.now(), nombre: nombre.trim(), video: video.trim() };
    const actualizados = [...ejercicios, nuevo];
    setEjercicios(actualizados);
    saveEjercicios(actualizados);
    setNombre("");
    setVideo("");
  };

  const confirmarEliminar = () => {
    const actualizados = ejercicios.filter(
      (e) => e.id !== ejercicioAEliminar.id
    );
    setEjercicios(actualizados);
    saveEjercicios(actualizados);
    setEjercicioAEliminar(null);
  };

  return (
    <div className="page">
      <NavbarWide />

      <main className="lista-ejercicios">
        <Link to="/entrenador" className="lista-ejercicios__back">
          ← Volver
        </Link>

        <h1 className="lista-ejercicios__title">Lista de ejercicios</h1>
        <p className="lista-ejercicios__subtitle">
          Cargá acá los ejercicios que usás habitualmente. Después vas a poder
          buscarlos directamente al armar una rutina.
        </p>

        <form className="lista-ejercicios__form" onSubmit={agregarEjercicio}>
          <div className="lista-ejercicios__field">
            <label htmlFor="nombre-ejercicio">Nombre del ejercicio</label>
            <input
              id="nombre-ejercicio"
              type="text"
              className="lista-ejercicios__input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="lista-ejercicios__field">
            <label htmlFor="video-ejercicio">Link de YouTube</label>
            <input
              id="video-ejercicio"
              type="text"
              placeholder="https://www.youtube.com/watch?v=..."
              className="lista-ejercicios__input"
              value={video}
              onChange={(e) => setVideo(e.target.value)}
            />
          </div>

          <button type="submit" className="lista-ejercicios__agregar">
            Agregar ejercicio
          </button>
        </form>

        <div className="lista-ejercicios__grid">
          {ejercicios.map((ej) => {
            const thumb = getYoutubeThumbnail(ej.video);
            const videoId = getYoutubeId(ej.video);
            return (
              <div key={ej.id} className="ejercicio-item">
                <button
                  type="button"
                  className="ejercicio-item__eliminar"
                  onClick={() => setEjercicioAEliminar(ej)}
                  aria-label="Eliminar ejercicio"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </button>

                {thumb ? (
                  <a
                    href={ej.video}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ejercicio-item__thumb"
                  >
                    <img src={thumb} alt={`Miniatura de ${ej.nombre}`} />
                  </a>
                ) : (
                  <div className="ejercicio-item__thumb ejercicio-item__thumb--vacio">
                    Sin video
                  </div>
                )}

                <div className="ejercicio-item__info">
                  <span className="ejercicio-item__nombre">{ej.nombre}</span>
                  {ej.video && !videoId && (
                    <span className="ejercicio-item__aviso">Link inválido</span>
                  )}
                </div>
              </div>
            );
          })}

          {ejercicios.length === 0 && (
            <p className="lista-ejercicios__vacio">
              Todavía no agregaste ningún ejercicio.
            </p>
          )}
        </div>
      </main>

      <ConfirmModal
        open={Boolean(ejercicioAEliminar)}
        title="Eliminar ejercicio"
        message={
          ejercicioAEliminar &&
          `¿Seguro que querés eliminar "${ejercicioAEliminar.nombre}" de la lista de ejercicios?`
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={confirmarEliminar}
        onCancel={() => setEjercicioAEliminar(null)}
      />
    </div>
  );
}

export default ListaEjercicios;
