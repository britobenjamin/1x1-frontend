import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NavbarWide from "../components/NavbarWide.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import { getYoutubeThumbnail } from "../utils/youtube.js";
import { getRutina } from "../utils/rutinasStorage.js";
import {
  getProgreso,
  toggleEjercicioCompletado,
  getDiasCompletados,
  toggleDiaCompletado,
} from "../utils/progresoStorage.js";
import { ALUMNOS_MOCK } from "../utils/alumnosMock.js";
import "./ArmarRutina.css";
import "../components/DiaEjerciciosEditor.css";
import "./VerRutina.css";

const ALUMNO_ACTUAL = ALUMNOS_MOCK[0];

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
  const [semanas, setSemanas] = useState([]);
  const [semanaActiva, setSemanaActiva] = useState(0);
  const [diaActivo, setDiaActivo] = useState(0);
  const [progreso, setProgreso] = useState({});
  const [instanciaAQuitar, setInstanciaAQuitar] = useState(null);
  const [diasCompletados, setDiasCompletados] = useState({});
  const [confirmarQuitarDia, setConfirmarQuitarDia] = useState(false);
  const [frasesPorDia, setFrasesPorDia] = useState({});

  useEffect(() => {
    const rutina = getRutina(ALUMNO_ACTUAL.id);
    setSemanas(rutina?.semanas || []);
    setProgreso(getProgreso(ALUMNO_ACTUAL.id));
    setDiasCompletados(getDiasCompletados(ALUMNO_ACTUAL.id));
  }, []);

  const claveDiaActivo = `${semanaActiva}-${diaActivo}`;
  const diaActivoCompletado = !!diasCompletados[claveDiaActivo];

  useEffect(() => {
    if (diaActivoCompletado) {
      setFrasesPorDia((prev) =>
        prev[claveDiaActivo]
          ? prev
          : { ...prev, [claveDiaActivo]: elegirFraseAleatoria() }
      );
    }
  }, [claveDiaActivo, diaActivoCompletado]);

  const aplicarToggleDia = () => {
    const nuevosDias = toggleDiaCompletado(ALUMNO_ACTUAL.id, claveDiaActivo);
    setDiasCompletados(nuevosDias);
  };

  const marcarDiaCompletado = () => {
    if (diaActivoCompletado) {
      setConfirmarQuitarDia(true);
    } else {
      aplicarToggleDia();
    }
  };

  const confirmarQuitarDiaCompletado = () => {
    aplicarToggleDia();
    setFrasesPorDia((prev) => {
      const copia = { ...prev };
      delete copia[claveDiaActivo];
      return copia;
    });
    setConfirmarQuitarDia(false);
  };

  const aplicarToggle = (instanciaId) => {
    const nuevoProgreso = toggleEjercicioCompletado(
      ALUMNO_ACTUAL.id,
      instanciaId
    );
    setProgreso(nuevoProgreso);
  };

  const marcarCompletado = (instanciaId) => {
    if (progreso[instanciaId]) {
      setInstanciaAQuitar(instanciaId);
    } else {
      aplicarToggle(instanciaId);
    }
  };

  const confirmarQuitarTilde = () => {
    aplicarToggle(instanciaAQuitar);
    setInstanciaAQuitar(null);
  };

  const cantidadDias = semanas[semanaActiva]?.dias.length || 0;
  const dias = Array.from({ length: cantidadDias }, (_, i) => i);
  const ejerciciosDelDiaActivo = semanas[semanaActiva]?.dias[diaActivo] || [];

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
                      const completado = !!progreso[ej.instanciaId];
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
                            onClick={() => marcarCompletado(ej.instanciaId)}
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

                {diaActivoCompletado && (
                  <div className="ver-rutina__celebracion">
                    <p className="ver-rutina__celebracion-emojis" aria-hidden="true">
                      🎉🎊✨🎊🎉
                    </p>
                    <p className="ver-rutina__celebracion-texto">
                      {frasesPorDia[claveDiaActivo] || FRASES_CELEBRACION[0]}
                    </p>
                  </div>
                )}
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
        onConfirm={confirmarQuitarDiaCompletado}
        onCancel={() => setConfirmarQuitarDia(false)}
      />
    </div>
  );
}

export default VerRutina;
