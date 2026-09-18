import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavbarWide from "../components/NavbarWide.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import DiaEjerciciosEditor from "../components/DiaEjerciciosEditor.jsx";
import {
  getEjercicios,
  getAlumnos,
  getRutinaHistorial,
  actualizarSemana,
  crearSemana,
  eliminarSemana,
  mapSemanaDesdeApi,
  mapSemanaParaApi,
} from "../utils/api.js";
import { getSesion } from "../utils/sesion.js";
import "./ArmarRutina.css";
import "./ListaAlumnos.css";

let contadorTemporal = 0;
const nuevoIdTemporal = () => `temp-${Date.now()}-${contadorTemporal++}`;

function ModificarRutina() {
  const navigate = useNavigate();
  const sesion = getSesion();

  const [busqueda, setBusqueda] = useState("");
  const [alumno, setAlumno] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [semanas, setSemanas] = useState([]);
  const [semanaActiva, setSemanaActiva] = useState(0);
  const [diaActivo, setDiaActivo] = useState(0);
  const [rutinaEncontrada, setRutinaEncontrada] = useState(true);
  const [mostrarCopiarModal, setMostrarCopiarModal] = useState(false);
  const [confirmarEliminarSemana, setConfirmarEliminarSemana] = useState(false);
  const [errorValidacion, setErrorValidacion] = useState("");

  const [libreria, setLibreria] = useState([]);
  const [mostrarExito, setMostrarExito] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (sesion?.id) {
      getEjercicios(sesion.id).then(setLibreria);
      getAlumnos(sesion.id).then(setAlumnos);
    }
  }, [sesion?.id]);

  const resultadosAlumno = useMemo(() => {
    if (alumno) return [];
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return alumnos;
    return alumnos.filter((a) =>
      `${a.nombre} ${a.apellido}`.toLowerCase().includes(termino)
    );
  }, [busqueda, alumno, alumnos]);

  const seleccionarAlumno = async (a) => {
    setAlumno(a);
    setBusqueda(`${a.nombre} ${a.apellido}`);
    setDiaActivo(0);
    setSemanaActiva(0);

    const historial = await getRutinaHistorial(a.id);
    if (historial.length > 0) {
      setSemanas(historial.map(mapSemanaDesdeApi));
      setRutinaEncontrada(true);
    } else {
      setSemanas([]);
      setRutinaEncontrada(false);
    }
  };

  const cambiarAlumno = () => {
    setAlumno(null);
    setBusqueda("");
    setSemanas([]);
    setSemanaActiva(0);
    setDiaActivo(0);
    setRutinaEncontrada(true);
    setErrorValidacion("");
  };

  const cantidadDias = semanas[semanaActiva]?.dias.length || 0;
  const dias = Array.from({ length: cantidadDias }, (_, i) => i);
  const diaActivoObj = semanas[semanaActiva]?.dias[diaActivo];
  const ejerciciosDelDiaActivo = diaActivoObj?.ejercicios || [];
  const progresoEjercicios = Object.fromEntries(
    ejerciciosDelDiaActivo.map((ej) => [ej.instanciaId, !!ej.completado])
  );

  // Compara contra el mismo día de la semana anterior (por ejercicioId) para
  // que el entrenador vea si el alumno lo realizó la última vez, incluso
  // después de recargar la página (no depende de un flag copiado a mano).
  const diaAnteriorObj = semanas[semanaActiva - 1]?.dias[diaActivo];
  const historialAnteriorEjercicios = diaAnteriorObj
    ? Object.fromEntries(
        ejerciciosDelDiaActivo
          .map((ej) => {
            const anterior = diaAnteriorObj.ejercicios.find(
              (e) => e.ejercicioId === ej.ejercicioId
            );
            return anterior ? [ej.instanciaId, !!anterior.completado] : null;
          })
          .filter(Boolean)
      )
    : {};

  const actualizarDiasDeSemanaActiva = (actualizar) => {
    setSemanas((prev) => {
      const copia = prev.map((s) => ({ ...s, dias: [...s.dias] }));
      copia[semanaActiva] = {
        ...copia[semanaActiva],
        dias: actualizar(copia[semanaActiva].dias),
      };
      return copia;
    });
  };

  const agregarEjercicioAlDia = (ejercicioLibreria) => {
    actualizarDiasDeSemanaActiva((diasActuales) => {
      const nuevos = [...diasActuales];
      const dia = nuevos[diaActivo] || { ejercicios: [] };
      nuevos[diaActivo] = {
        ...dia,
        ejercicios: [
          ...dia.ejercicios,
          {
            instanciaId: nuevoIdTemporal(),
            ejercicioId: ejercicioLibreria.id,
            nombre: ejercicioLibreria.nombre,
            video: ejercicioLibreria.video,
            peso: "",
            series: "",
            repeticiones: "",
          },
        ],
      };
      return nuevos;
    });
  };

  const actualizarCampo = (instanciaId, campo, valor) => {
    setErrorValidacion("");
    actualizarDiasDeSemanaActiva((diasActuales) => {
      const nuevos = [...diasActuales];
      const dia = nuevos[diaActivo];
      nuevos[diaActivo] = {
        ...dia,
        ejercicios: dia.ejercicios.map((ej) =>
          ej.instanciaId === instanciaId ? { ...ej, [campo]: valor } : ej
        ),
      };
      return nuevos;
    });
  };

  const eliminarEjercicio = (instanciaId) => {
    actualizarDiasDeSemanaActiva((diasActuales) => {
      const nuevos = [...diasActuales];
      const dia = nuevos[diaActivo];
      nuevos[diaActivo] = {
        ...dia,
        ejercicios: dia.ejercicios.filter((ej) => ej.instanciaId !== instanciaId),
      };
      return nuevos;
    });
  };

  const reordenarEjercicios = (nuevosEjercicios) => {
    actualizarDiasDeSemanaActiva((diasActuales) => {
      const nuevos = [...diasActuales];
      nuevos[diaActivo] = { ...nuevos[diaActivo], ejercicios: nuevosEjercicios };
      return nuevos;
    });
  };

  const irASemana = (index) => {
    setSemanaActiva(index);
    setDiaActivo(0);
  };

  const solicitarNuevaSemana = () => {
    setMostrarCopiarModal(true);
  };

  const agregarSemana = (diasNuevos) => {
    setSemanas((prev) => [...prev, { dias: diasNuevos }]);
    setSemanaActiva(semanas.length);
    setDiaActivo(0);
    setMostrarCopiarModal(false);
  };

  const crearSemanaVacia = () => {
    const cantidadBase = semanas[semanas.length - 1]?.dias.length || 0;
    agregarSemana(
      Array.from({ length: cantidadBase }, () => ({ ejercicios: [] }))
    );
  };

  const crearSemanaCopiando = (indiceSemanaBase) => {
    const semanaBase = semanas[indiceSemanaBase];
    const diasCopiados = semanaBase.dias.map((dia) => ({
      ejercicios: dia.ejercicios.map((ej) => ({
        ...ej,
        instanciaId: nuevoIdTemporal(),
        completado: false,
      })),
    }));
    agregarSemana(diasCopiados);
  };

  const confirmarEliminarSemanaActiva = async () => {
    const semana = semanas[semanaActiva];
    if (typeof semana.id === "number") {
      await eliminarSemana(semana.id);
    }
    const nuevasSemanas = semanas.filter((_, i) => i !== semanaActiva);
    setSemanas(nuevasSemanas);
    setSemanaActiva((prev) => Math.min(prev, nuevasSemanas.length - 1));
    setDiaActivo(0);
    setConfirmarEliminarSemana(false);
  };

  const encontrarEjercicioIncompleto = () => {
    for (let s = 0; s < semanas.length; s++) {
      const dias = semanas[s].dias;
      for (let d = 0; d < dias.length; d++) {
        const incompleto = dias[d].ejercicios.some(
          (ej) => !ej.peso || !ej.series || !ej.repeticiones
        );
        if (incompleto) return { semana: s, dia: d };
      }
    }
    return null;
  };

  const guardarCambios = async () => {
    const incompleto = encontrarEjercicioIncompleto();
    if (incompleto) {
      setSemanaActiva(incompleto.semana);
      setDiaActivo(incompleto.dia);
      setErrorValidacion(
        `Completá el peso, las series y las repeticiones de todos los ejercicios antes de guardar (Semana ${
          incompleto.semana + 1
        }, Día ${incompleto.dia + 1}).`
      );
      return;
    }
    setErrorValidacion("");
    setGuardando(true);
    try {
      for (const semana of semanas) {
        const payload = mapSemanaParaApi(semana);
        if (typeof semana.id === "number") {
          await actualizarSemana(semana.id, payload.dias);
        } else {
          await crearSemana(alumno.id, payload.dias);
        }
      }
      const historial = await getRutinaHistorial(alumno.id);
      setSemanas(historial.map(mapSemanaDesdeApi));
      setMostrarExito(true);
    } catch (err) {
      setErrorValidacion(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="page">
      <NavbarWide />

      <main className="armar-rutina">
        <Link to="/entrenador" className="armar-rutina__back">
          ← Volver
        </Link>

        <h1 className="armar-rutina__title">Modificar rutina</h1>

        <section className="armar-rutina__section">
          <label className="armar-rutina__label" htmlFor="buscador-alumno">
            ¿De qué alumno es la rutina?
          </label>

          {alumno ? (
            <div className="armar-rutina__alumno-chip">
              <span>
                {alumno.nombre} {alumno.apellido}
              </span>
              <button type="button" onClick={cambiarAlumno}>
                Cambiar
              </button>
            </div>
          ) : (
            <div className="armar-rutina__buscador">
              <input
                id="buscador-alumno"
                type="text"
                placeholder="Buscar alumno por nombre..."
                className="armar-rutina__input"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              {resultadosAlumno.length > 0 && (
                <ul className="lista-alumnos__lista armar-rutina__lista-alumnos">
                  {resultadosAlumno.map((a) => (
                    <li key={a.id}>
                      <button
                        type="button"
                        className="alumno-item"
                        onClick={() => seleccionarAlumno(a)}
                      >
                        <span className="alumno-item__nombre">
                          {a.nombre} {a.apellido}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {busqueda.trim() && resultadosAlumno.length === 0 && (
                <p className="armar-rutina__sin-resultados">
                  No se encontraron alumnos.
                </p>
              )}
            </div>
          )}
        </section>

        {alumno && !rutinaEncontrada && (
          <p className="armar-rutina__sin-resultados">
            {alumno.nombre} todavía no tiene una rutina cargada.{" "}
            <Link to="/entrenador/armar-rutina">Armale una desde acá</Link>.
          </p>
        )}

        {alumno && rutinaEncontrada && semanas.length > 0 && (
          <section className="armar-rutina__section">
            <div className="armar-rutina__semanas-bloque">
              <div className="armar-rutina__tabs">
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
                <button
                  type="button"
                  className="armar-rutina__tab"
                  onClick={solicitarNuevaSemana}
                >
                  + Agregar semana
                </button>
              </div>

              {semanas.length > 1 && (
                <button
                  type="button"
                  className="armar-rutina__eliminar-semana"
                  onClick={() => setConfirmarEliminarSemana(true)}
                >
                  Eliminar semana {semanaActiva + 1}
                </button>
              )}
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

                <DiaEjerciciosEditor
                  ejercicios={ejerciciosDelDiaActivo}
                  libreria={libreria}
                  onAgregar={agregarEjercicioAlDia}
                  onActualizarCampo={actualizarCampo}
                  onEliminar={eliminarEjercicio}
                  onReordenar={reordenarEjercicios}
                  progreso={progresoEjercicios}
                  historialAnterior={historialAnteriorEjercicios}
                />

                <button
                  type="button"
                  className="armar-rutina__guardar armar-rutina__guardar--separado"
                  onClick={guardarCambios}
                  disabled={guardando}
                >
                  {guardando ? "Guardando..." : "Guardar cambios"}
                </button>

                {errorValidacion && (
                  <p className="armar-rutina__error">{errorValidacion}</p>
                )}
              </>
            )}

            <div className="asistencia">
              <h2 className="asistencia__titulo">Asistencia semanal</h2>
              {semanas.map((semana, i) => (
                <div key={i} className="asistencia__fila">
                  <span className="asistencia__semana">Semana {i + 1}</span>
                  <div className="asistencia__circulos">
                    {semana.dias.map((dia, d) => {
                      const hecho = !!dia.completado;
                      return (
                        <span
                          key={d}
                          className={
                            "asistencia__circulo" +
                            (hecho
                              ? " asistencia__circulo--hecho"
                              : " asistencia__circulo--pendiente")
                          }
                          title={`Día ${d + 1}${
                            hecho ? " · asistió" : " · no asistió"
                          }`}
                        >
                          {hecho ? "✓" : "–"}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {mostrarCopiarModal && (
        <div
          className="confirm-modal__overlay"
          onClick={() => setMostrarCopiarModal(false)}
        >
          <div
            className="confirm-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="confirm-modal__cerrar-x"
              onClick={() => setMostrarCopiarModal(false)}
              aria-label="Cerrar"
            >
              ×
            </button>

            <h2 className="confirm-modal__title">Nueva semana</h2>
            <p className="confirm-modal__message">
              Elegí qué semana querés copiar
            </p>
            <div className="confirm-modal__semanas-grid">
              {semanas.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className="confirm-modal__semana-numero"
                  onClick={() => crearSemanaCopiando(i)}
                  title={`Copiar de Semana ${i + 1}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <div className="confirm-modal__actions">
              <button
                type="button"
                className="confirm-modal__cancel"
                onClick={() => setMostrarCopiarModal(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="confirm-modal__confirm confirm-modal__confirm--primary"
                onClick={crearSemanaVacia}
              >
                Empezar vacía
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmarEliminarSemana}
        title="¿Eliminar semana?"
        message={`¿Estás seguro que querés eliminar la semana ${
          semanaActiva + 1
        }?`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        confirmVariant="danger"
        mostrarCerrar
        onConfirm={confirmarEliminarSemanaActiva}
        onCancel={() => setConfirmarEliminarSemana(false)}
      />

      <ConfirmModal
        open={mostrarExito}
        title="¡Cambios guardados! 🎉"
        confirmLabel="Seguir modificando"
        cancelLabel="Volver al menú"
        confirmVariant="primary"
        onConfirm={() => setMostrarExito(false)}
        onCancel={() => navigate("/entrenador")}
      />
    </div>
  );
}

export default ModificarRutina;
