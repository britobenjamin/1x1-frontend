import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import NavbarWide from "../components/NavbarWide.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import {
  getEjercicios,
  crearEjercicio,
  actualizarEjercicio,
  eliminarEjercicio,
} from "../utils/api.js";
import { getSesion } from "../utils/sesion.js";
import { getYoutubeId, getYoutubeThumbnail } from "../utils/youtube.js";
import "./ListaEjercicios.css";

function InputLimpiable({ value, onChange, ...props }) {
  return (
    <div className="lista-ejercicios__input-wrapper">
      <input {...props} value={value} onChange={onChange} />
      {value && (
        <button
          type="button"
          className="lista-ejercicios__limpiar"
          tabIndex={-1}
          aria-label="Borrar"
          onClick={() => onChange({ target: { value: "" } })}
        >
          ×
        </button>
      )}
    </div>
  );
}

function ListaEjercicios() {
  const sesion = getSesion();
  const [ejercicios, setEjercicios] = useState([]);
  const [nombre, setNombre] = useState("");
  const [video, setVideo] = useState("");
  const [ejercicioAEliminar, setEjercicioAEliminar] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [edicionNombre, setEdicionNombre] = useState("");
  const [edicionVideo, setEdicionVideo] = useState("");
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const ejerciciosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return ejercicios;
    return ejercicios.filter((ej) =>
      ej.nombre.toLowerCase().includes(termino)
    );
  }, [ejercicios, busqueda]);

  useEffect(() => {
    if (sesion?.id) {
      getEjercicios(sesion.id).then(setEjercicios);
    }
  }, [sesion?.id]);

  const agregarEjercicio = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const nuevo = await crearEjercicio({
      entrenadorId: sesion.id,
      nombre: nombre.trim(),
      video: video.trim(),
    });
    setEjercicios((prev) => [...prev, nuevo]);
    setNombre("");
    setVideo("");
  };

  const confirmarEliminar = async () => {
    await eliminarEjercicio(ejercicioAEliminar.id);
    setEjercicios((prev) => prev.filter((e) => e.id !== ejercicioAEliminar.id));
    setEjercicioAEliminar(null);
  };

  const empezarEdicion = (ej) => {
    setEditandoId(ej.id);
    setEdicionNombre(ej.nombre.toUpperCase());
    setEdicionVideo(ej.video || "");
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
  };

  const guardarEdicion = async (e) => {
    e.preventDefault();
    if (!edicionNombre.trim()) return;

    setGuardandoEdicion(true);
    const actualizado = await actualizarEjercicio(editandoId, {
      nombre: edicionNombre.trim(),
      video: edicionVideo.trim(),
    });
    setEjercicios((prev) =>
      prev.map((e) => (e.id === editandoId ? actualizado : e))
    );
    setGuardandoEdicion(false);
    setEditandoId(null);
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
            <InputLimpiable
              id="nombre-ejercicio"
              type="text"
              className="lista-ejercicios__input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value.toUpperCase())}
            />
          </div>

          <div className="lista-ejercicios__field">
            <label htmlFor="video-ejercicio">Link de YouTube</label>
            <InputLimpiable
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

        <input
          type="text"
          placeholder="Buscar ejercicio por nombre..."
          className="lista-ejercicios__buscador"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <div className="lista-ejercicios__grid">
          {ejerciciosFiltrados.map((ej) => {
            const thumb = getYoutubeThumbnail(ej.video);
            const videoId = getYoutubeId(ej.video);

            if (ej.id === editandoId) {
              return (
                <form
                  key={ej.id}
                  className="ejercicio-item ejercicio-item--edicion"
                  onSubmit={guardarEdicion}
                >
                  <div className="ejercicio-item__edicion-campos">
                    <InputLimpiable
                      type="text"
                      className="lista-ejercicios__input"
                      value={edicionNombre}
                      onChange={(e) => setEdicionNombre(e.target.value.toUpperCase())}
                      placeholder="Nombre del ejercicio"
                      autoFocus
                    />
                    <InputLimpiable
                      type="text"
                      className="lista-ejercicios__input"
                      value={edicionVideo}
                      onChange={(e) => setEdicionVideo(e.target.value)}
                      placeholder="Link de YouTube"
                    />
                  </div>
                  <div className="ejercicio-item__edicion-acciones">
                    <button
                      type="button"
                      className="ejercicio-item__cancelar"
                      onClick={cancelarEdicion}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="ejercicio-item__guardar"
                      disabled={guardandoEdicion}
                    >
                      {guardandoEdicion ? "Guardando..." : "Guardar"}
                    </button>
                  </div>
                </form>
              );
            }

            return (
              <div key={ej.id} className="ejercicio-item">
                <div className="ejercicio-item__acciones">
                  <button
                    type="button"
                    className="ejercicio-item__editar"
                    onClick={() => empezarEdicion(ej)}
                    aria-label="Editar ejercicio"
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
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                  </button>

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
                </div>

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

          {ejerciciosFiltrados.length === 0 && (
            <p className="lista-ejercicios__vacio">
              {ejercicios.length === 0
                ? "Todavía no agregaste ningún ejercicio."
                : "No se encontraron ejercicios."}
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
        mostrarCerrar
        onConfirm={confirmarEliminar}
        onCancel={() => setEjercicioAEliminar(null)}
      />
    </div>
  );
}

export default ListaEjercicios;
