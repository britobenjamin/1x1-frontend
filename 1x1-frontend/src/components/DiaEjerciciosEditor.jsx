import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getYoutubeThumbnail } from "../utils/youtube.js";
import ConfirmModal from "./ConfirmModal.jsx";
import "./DiaEjerciciosEditor.css";

function DiaEjerciciosEditor({
  ejercicios,
  libreria,
  onAgregar,
  onActualizarCampo,
  onEliminar,
  onReordenar,
  progreso,
}) {
  const [busquedaEjercicio, setBusquedaEjercicio] = useState("");
  const [dragIndex, setDragIndex] = useState(null);
  const [instanciaAEliminar, setInstanciaAEliminar] = useState(null);
  const [comentariosBloqueados, setComentariosBloqueados] = useState({});
  const inputBusquedaRef = useRef(null);

  const toggleBloqueoComentario = (instanciaId) => {
    setComentariosBloqueados((prev) => ({
      ...prev,
      [instanciaId]: !prev[instanciaId],
    }));
  };

  const eliminarRecomendacion = (instanciaId) => {
    onActualizarCampo(instanciaId, "recomendacion", "");
    setComentariosBloqueados((prev) => ({ ...prev, [instanciaId]: false }));
  };

  const irABuscador = () => {
    inputBusquedaRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    inputBusquedaRef.current?.focus();
  };

  const confirmarEliminar = () => {
    onEliminar(instanciaAEliminar);
    setInstanciaAEliminar(null);
  };

  const resultados = busquedaEjercicio.trim()
    ? libreria.filter((ej) =>
        ej.nombre.toLowerCase().includes(busquedaEjercicio.toLowerCase())
      )
    : [];

  const seleccionar = (ej) => {
    onAgregar(ej);
    setBusquedaEjercicio("");
  };

  const handleDrop = (targetIndex) => {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      return;
    }
    const reordenados = [...ejercicios];
    const [movido] = reordenados.splice(dragIndex, 1);
    reordenados.splice(targetIndex, 0, movido);
    onReordenar(reordenados);
    setDragIndex(null);
  };

  return (
    <div className="dia-editor">
      {libreria.length === 0 ? (
        <p className="dia-editor__aviso">
          Todavía no cargaste ejercicios.{" "}
          <Link to="/entrenador/lista-ejercicios">
            Andá a "Lista de ejercicios" para agregarlos
          </Link>
          .
        </p>
      ) : (
        <div className="dia-editor__buscador">
          <input
            ref={inputBusquedaRef}
            type="text"
            placeholder="Buscar ejercicio para agregar..."
            className="dia-editor__input"
            value={busquedaEjercicio}
            onChange={(e) => setBusquedaEjercicio(e.target.value)}
          />
          {resultados.length > 0 && (
            <ul className="dia-editor__resultados">
              {resultados.map((ej) => (
                <li key={ej.id}>
                  <button type="button" onClick={() => seleccionar(ej)}>
                    {ej.nombre}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {busquedaEjercicio.trim() && resultados.length === 0 && (
            <p className="dia-editor__sin-resultados">
              No se encontraron ejercicios.
            </p>
          )}
        </div>
      )}

      {ejercicios.length > 0 && (
        <p className="dia-editor__ayuda">
          Mantené el click y arrastrá un ejercicio para cambiar el orden.
        </p>
      )}

      <div className="dia-editor__lista">
        {ejercicios.map((ej, index) => {
          const thumb = getYoutubeThumbnail(ej.video);
          const hecho = progreso ? !!progreso[ej.instanciaId] : null;
          return (
            <div
              key={ej.instanciaId}
              className={
                "ejercicio-card" +
                (dragIndex === index ? " ejercicio-card--arrastrando" : "") +
                (hecho === null
                  ? ""
                  : hecho
                  ? " ejercicio-card--marcado-hecho"
                  : " ejercicio-card--marcado-pendiente")
              }
              title={
                hecho === null
                  ? undefined
                  : hecho
                  ? "El alumno marcó este ejercicio como realizado"
                  : "El alumno no marcó este ejercicio como realizado"
              }
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
              onDragEnd={() => setDragIndex(null)}
            >
              <span className="ejercicio-card__grip" aria-hidden="true">
                ⠿
              </span>

              <button
                type="button"
                className="ejercicio-card__eliminar"
                onClick={() => setInstanciaAEliminar(ej.instanciaId)}
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

              {thumb && (
                <a
                  href={ej.video}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ejercicio-card__thumb"
                >
                  <img src={thumb} alt={`Miniatura de ${ej.nombre}`} />
                </a>
              )}

              <div className="ejercicio-card__campos">
                <span className="ejercicio-card__numero">
                  Ejercicio N.º {index + 1}
                </span>
                <h3 className="ejercicio-card__nombre">{ej.nombre}</h3>

                <div className="ejercicio-card__row ejercicio-card__row--tres">
                  <div className="ejercicio-card__field">
                    <label>Peso (kg)</label>
                    <input
                      type="number"
                      min="0"
                      className="dia-editor__input"
                      value={ej.peso}
                      onChange={(e) =>
                        onActualizarCampo(
                          ej.instanciaId,
                          "peso",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="ejercicio-card__field">
                    <label>Repeticiones</label>
                    <input
                      type="number"
                      min="0"
                      className="dia-editor__input"
                      value={ej.repeticiones}
                      onChange={(e) =>
                        onActualizarCampo(
                          ej.instanciaId,
                          "repeticiones",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="ejercicio-card__field">
                    <label>Series</label>
                    <input
                      type="number"
                      min="0"
                      className="dia-editor__input"
                      value={ej.series}
                      onChange={(e) =>
                        onActualizarCampo(
                          ej.instanciaId,
                          "series",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                <div className="ejercicio-card__field">
                  <label>Recomendación para el alumno (opcional)</label>
                  <textarea
                    className="dia-editor__input dia-editor__textarea"
                    placeholder="Ej: prestá atención a la técnica, bajá el peso si te cuesta la última serie..."
                    value={ej.recomendacion || ""}
                    disabled={!!comentariosBloqueados[ej.instanciaId]}
                    onChange={(e) =>
                      onActualizarCampo(
                        ej.instanciaId,
                        "recomendacion",
                        e.target.value
                      )
                    }
                  />
                  <div className="ejercicio-card__comentario-acciones">
                    <button
                      type="button"
                      className="ejercicio-card__comentario-guardar"
                      disabled={
                        !comentariosBloqueados[ej.instanciaId] &&
                        !ej.recomendacion?.trim()
                      }
                      onClick={() => toggleBloqueoComentario(ej.instanciaId)}
                    >
                      {comentariosBloqueados[ej.instanciaId]
                        ? "Modificar comentario"
                        : "Guardar comentario"}
                    </button>
                    {ej.recomendacion?.trim() && (
                      <button
                        type="button"
                        className="ejercicio-card__comentario-borrar"
                        onClick={() => eliminarRecomendacion(ej.instanciaId)}
                      >
                        Eliminar comentario
                      </button>
                    )}
                  </div>
                </div>

                {ej.comentarioAlumno && (
                  <div className="ejercicio-card__comentario-alumno">
                    <div className="ejercicio-card__comentario-alumno-header">
                      <span className="ejercicio-card__comentario-alumno-label">
                        Comentario del alumno
                      </span>
                      <button
                        type="button"
                        className="ejercicio-card__comentario-borrar"
                        onClick={() =>
                          onActualizarCampo(
                            ej.instanciaId,
                            "comentarioAlumno",
                            ""
                          )
                        }
                      >
                        Borrar comentario
                      </button>
                    </div>
                    <p>{ej.comentarioAlumno}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {ejercicios.length > 0 && (
        <button
          type="button"
          className="dia-editor__agregar-otro"
          onClick={irABuscador}
          aria-label="Agregar otro ejercicio"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      )}

      <ConfirmModal
        open={instanciaAEliminar !== null}
        title="¿Eliminar ejercicio?"
        message="¿Seguro que querés eliminar este ejercicio de esta rutina?"
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        confirmVariant="danger"
        onConfirm={confirmarEliminar}
        onCancel={() => setInstanciaAEliminar(null)}
      />
    </div>
  );
}

export default DiaEjerciciosEditor;
