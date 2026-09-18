import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavbarWide from "../components/NavbarWide.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import { getYoutubeThumbnail } from "../utils/youtube.js";
import {
  getRutinaHistorial,
  toggleDiaCompletado,
  actualizarRutinaEjercicio,
  mapSemanaDesdeApi,
} from "../utils/api.js";
import { getSesion } from "../utils/sesion.js";
import "./ArmarRutina.css";
import "../components/DiaEjerciciosEditor.css";
import "./VerRutina.css";

const FRASES_CELEBRACION = [
  "¡Felicidades por completar tu rutina! 🧡\nCada día cuenta, cada esfuerzo suma.\nSeguí avanzando, un día a la vez.",
  "¡Rutina completada! 🎉\nHoy diste un paso más hacia tu objetivo.\nNo hace falta hacerlo todo de una vez… solo un día a la vez.",
  "¡Felicidades! ❤️\nHoy elegiste no rendirte.\nCelebrá este pequeño logro y seguí construyendo el siguiente.\nUn día a la vez.",
];

function elegirFraseAleatoria() {
  return FRASES_CELEBRACION[
    Math.floor(Math.random() * FRASES_CELEBRACION.length)
  ];
}

function VerRutina() {
  const sesion = getSesion();
  const navigate = useNavigate();
  const [semanas, setSemanas] = useState([]);
  const [semanaActiva, setSemanaActiva] = useState(0);
  const [diaActivo, setDiaActivo] = useState(0);
  const [instanciaAQuitar, setInstanciaAQuitar] = useState(null);
  const [confirmarQuitarDia, setConfirmarQuitarDia] = useState(false);
  const [mostrarCelebracion, setMostrarCelebracion] = useState(false);
  const [fraseCelebracion, setFraseCelebracion] = useState("");
  const [guardandoComentarioId, setGuardandoComentarioId] = useState(null);
  const [comentarioGuardadoId, setComentarioGuardadoId] = useState(null);
  const [comentariosDraft, setComentariosDraft] = useState({});
  const [comentariosBloqueados, setComentariosBloqueados] = useState({});

  useEffect(() => {
    if (sesion?.id) {
      getRutinaHistorial(sesion.id).then((historial) => {
        const mapeadas = historial.map(mapSemanaDesdeApi);
        setSemanas(mapeadas);
        setSemanaActiva(Math.max(0, mapeadas.length - 1));
      });
    }
  }, [sesion?.id]);

  const diaActivoObj = semanas[semanaActiva]?.dias[diaActivo];
  const diaActivoCompletado = !!diaActivoObj?.completado;

  const actualizarDia = (nuevoDia) => {
    setSemanas((prev) => {
      const copia = prev.map((s) => ({ ...s, dias: [...s.dias] }));
      copia[semanaActiva].dias[diaActivo] = nuevoDia;
      return copia;
    });
  };

  const aplicarToggleDia = async () => {
    const nuevoCompletado = !diaActivoCompletado;
    await toggleDiaCompletado(diaActivoObj.id, nuevoCompletado);
    actualizarDia({ ...diaActivoObj, completado: nuevoCompletado });
    if (nuevoCompletado) {
      setFraseCelebracion(elegirFraseAleatoria());
      setMostrarCelebracion(true);
    }
  };

  const marcarDiaCompletado = () => {
    if (diaActivoCompletado) {
      setConfirmarQuitarDia(true);
    } else {
      aplicarToggleDia();
    }
  };

  const confirmarQuitarDiaCompletado = async () => {
    await aplicarToggleDia();
    setConfirmarQuitarDia(false);
  };

  const irAlMenuDesdeCelebracion = () => {
    setMostrarCelebracion(false);
    navigate("/alumno");
  };

  const aplicarToggle = async (instanciaId) => {
    const ejercicio = diaActivoObj.ejercicios.find(
      (ej) => ej.instanciaId === instanciaId
    );
    const nuevoCompletado = !ejercicio.completado;
    await actualizarRutinaEjercicio(instanciaId, { completado: nuevoCompletado });
    actualizarDia({
      ...diaActivoObj,
      ejercicios: diaActivoObj.ejercicios.map((ej) =>
        ej.instanciaId === instanciaId
          ? { ...ej, completado: nuevoCompletado }
          : ej
      ),
    });
  };

  const marcarCompletado = (instanciaId, completadoActual) => {
    if (completadoActual) {
      setInstanciaAQuitar(instanciaId);
    } else {
      aplicarToggle(instanciaId);
    }
  };

  const confirmarQuitarTilde = () => {
    aplicarToggle(instanciaAQuitar);
    setInstanciaAQuitar(null);
  };

  const getComentarioDraft = (ej) =>
    comentariosDraft[ej.instanciaId] ?? ej.comentarioAlumno ?? "";

  const getComentarioBloqueado = (ej) =>
    comentariosBloqueados[ej.instanciaId] ?? !!ej.comentarioAlumno;

  const cambiarComentarioDraft = (instanciaId, valor) => {
    setComentariosDraft((prev) => ({ ...prev, [instanciaId]: valor }));
  };

  const guardarComentario = async (instanciaId) => {
    const comentarioAlumno = comentariosDraft[instanciaId] ?? "";

    setGuardandoComentarioId(instanciaId);
    await actualizarRutinaEjercicio(instanciaId, { comentarioAlumno });
    actualizarDia({
      ...diaActivoObj,
      ejercicios: diaActivoObj.ejercicios.map((ej) =>
        ej.instanciaId === instanciaId ? { ...ej, comentarioAlumno } : ej
      ),
    });
    setGuardandoComentarioId(null);
    setComentariosBloqueados((prev) => ({ ...prev, [instanciaId]: true }));
    setComentarioGuardadoId(instanciaId);
    setTimeout(
      () =>
        setComentarioGuardadoId((prev) => (prev === instanciaId ? null : prev)),
      2500
    );
  };

  const modificarComentario = (instanciaId) => {
    setComentariosBloqueados((prev) => ({ ...prev, [instanciaId]: false }));
  };

  const cantidadDias = semanas[semanaActiva]?.dias.length || 0;
  const dias = Array.from({ length: cantidadDias }, (_, i) => i);
  const ejerciciosDelDiaActivo = diaActivoObj?.ejercicios || [];

  const irASemana = (index) => {
    setSemanaActiva(index);
    setDiaActivo(0);
  };

  return (
    <div className="page">
      <NavbarWide />

      <main className="armar-rutina">
        <Link to="/alumno" className="armar-rutina__back">
          ← Volver
        </Link>

        <h1 className="armar-rutina__title">Mi rutina</h1>

        {semanas.length === 0 ? (
          <p className="armar-rutina__sin-resultados">
            Todavía no tenés una rutina cargada.
          </p>
        ) : (
          <section className="armar-rutina__section">
            <div className="armar-rutina__tabs armar-rutina__tabs--semanas">
              {semanas.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={
                    "armar-rutina__tab" +
                    (i === semanaActiva ? " armar-rutina__tab--activo" : "")
                  }
                  onClick={() => irASemana(i)}
                >
                  Semana {i + 1}
                </button>
              ))}
            </div>

            {cantidadDias > 0 && (
              <>
                <div className="armar-rutina__tabs">
                  {dias.map((d) => (
                    <button
                      key={d}
                      type="button"
                      className={
                        "armar-rutina__tab" +
                        (d === diaActivo ? " armar-rutina__tab--activo" : "")
                      }
                      onClick={() => setDiaActivo(d)}
                    >
                      Día {d + 1}
                    </button>
                  ))}
                </div>

                {ejerciciosDelDiaActivo.length === 0 ? (
                  <p className="armar-rutina__sin-resultados">
                    No hay ejercicios cargados para este día.
                  </p>
                ) : (
                  <div className="dia-editor__lista">
                    {ejerciciosDelDiaActivo.map((ej, index) => {
                      const thumb = getYoutubeThumbnail(ej.video);
                      const completado = !!ej.completado;
                      return (
                        <div
                          key={ej.instanciaId}
                          className={
                            "ejercicio-card ejercicio-card--solo-lectura" +
                            (completado ? " ejercicio-card--completado" : "")
                          }
                        >
                          <button
                            type="button"
                            className={
                              "ejercicio-card__check" +
                              (completado ? " ejercicio-card__check--marcado" : "")
                            }
                            aria-label={
                              completado
                                ? "Marcar como no hecho"
                                : "Marcar como hecho"
                            }
                            onClick={() =>
                              marcarCompletado(ej.instanciaId, completado)
                            }
                          >
                            ✓
                          </button>

                          {thumb && (
                            <a
                              href={ej.video}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ejercicio-card__thumb"
                            >
                              <img
                                src={thumb}
                                alt={`Miniatura de ${ej.nombre}`}
                              />
                            </a>
                          )}

                          <div className="ejercicio-card__campos">
                            <span className="ejercicio-card__numero">
                              Ejercicio N.º {index + 1}
                            </span>
                            <h3 className="ejercicio-card__nombre">
                              {ej.nombre}
                            </h3>

                            <div className="ejercicio-card__row ejercicio-card__row--tres">
                              <div className="ejercicio-card__field">
                                <label>Peso (kg)</label>
                                <p className="ejercicio-card__valor">
                                  {ej.peso || "-"}
                                </p>
                              </div>
                              <div className="ejercicio-card__field">
                                <label>Repeticiones</label>
                                <p className="ejercicio-card__valor">
                                  {ej.repeticiones || "-"}
                                </p>
                              </div>
                              <div className="ejercicio-card__field">
                                <label>Series</label>
                                <p className="ejercicio-card__valor">
                                  {ej.series || "-"}
                                </p>
                              </div>
                            </div>

                            {ej.recomendacion && (
                              <div className="ejercicio-card__recomendacion">
                                <span className="ejercicio-card__recomendacion-label">
                                  Recomendación del entrenador
                                </span>
                                <p>{ej.recomendacion}</p>
                              </div>
                            )}

                            <div className="ejercicio-card__comentario-form">
                              <label htmlFor={`comentario-${ej.instanciaId}`}>
                                Tu comentario para el entrenador
                              </label>
                              <textarea
                                id={`comentario-${ej.instanciaId}`}
                                className="dia-editor__input dia-editor__textarea"
                                placeholder="Dejá acá tu comentario sobre este ejercicio..."
                                value={getComentarioDraft(ej)}
                                disabled={getComentarioBloqueado(ej)}
                                onChange={(e) =>
                                  cambiarComentarioDraft(
                                    ej.instanciaId,
                                    e.target.value
                                  )
                                }
                              />
                              <div className="ejercicio-card__comentario-acciones">
                                {getComentarioBloqueado(ej) ? (
                                  <button
                                    type="button"
                                    className="ejercicio-card__comentario-guardar"
                                    onClick={() =>
                                      modificarComentario(ej.instanciaId)
                                    }
                                  >
                                    Modificar comentario
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className="ejercicio-card__comentario-guardar"
                                    disabled={
                                      !getComentarioDraft(ej).trim() ||
                                      guardandoComentarioId === ej.instanciaId
                                    }
                                    onClick={() =>
                                      guardarComentario(ej.instanciaId)
                                    }
                                  >
                                    {guardandoComentarioId === ej.instanciaId
                                      ? "Guardando..."
                                      : "Guardar comentario"}
                                  </button>
                                )}
                                {comentarioGuardadoId === ej.instanciaId && (
                                  <span className="ejercicio-card__comentario-ok">
                                    Comentario guardado ✓
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <button
                  type="button"
                  className={
                    "ver-rutina__dia-listo" +
                    (diaActivoCompletado ? " ver-rutina__dia-listo--hecho" : "")
                  }
                  onClick={marcarDiaCompletado}
                >
                  {diaActivoCompletado
                    ? "✓ Rutina del día completada"
                    : "¡Listo! Terminé con mi rutina del día"}
                </button>

              </>
            )}
          </section>
        )}
      </main>

      <ConfirmModal
        open={instanciaAQuitar !== null}
        title="¿Quitar la marca?"
        message="¿Seguro que querés quitar la tilde del ejercicio realizado?"
        confirmLabel="Quitar tilde"
        cancelLabel="Cancelar"
        confirmVariant="danger"
        mostrarCerrar
        onConfirm={confirmarQuitarTilde}
        onCancel={() => setInstanciaAQuitar(null)}
      />

      <ConfirmModal
        open={confirmarQuitarDia}
        title="¿Quitar la marca?"
        message="¿Estás seguro que querés quitar la tilde de tu día terminado?"
        confirmLabel="Quitar tilde"
        cancelLabel="Cancelar"
        confirmVariant="danger"
        mostrarCerrar
        onConfirm={confirmarQuitarDiaCompletado}
        onCancel={() => setConfirmarQuitarDia(false)}
      />

      {mostrarCelebracion && (
        <div
          className="confirm-modal__overlay"
          onClick={irAlMenuDesdeCelebracion}
        >
          <div
            className="confirm-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ver-rutina__celebracion">
              <p className="ver-rutina__celebracion-emojis" aria-hidden="true">
                🎉🎊✨🎊🎉
              </p>
              <p className="ver-rutina__celebracion-texto">
                {fraseCelebracion}
              </p>
            </div>
            <button
              type="button"
              className="confirm-modal__confirm confirm-modal__confirm--primary ver-rutina__celebracion-boton"
              onClick={irAlMenuDesdeCelebracion}
            >
              Ir al menú
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VerRutina;
