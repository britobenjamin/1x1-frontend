import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavbarWide from "../components/NavbarWide.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import DiaEjerciciosEditor from "../components/DiaEjerciciosEditor.jsx";
import {
  getEjercicios,
  getAlumnos,
  getRutinaHistorial,
  crearSemana,
} from "../utils/api.js";
import { getSesion } from "../utils/sesion.js";
import "./ArmarRutina.css";

const MAX_DIAS = 7;

function ArmarRutina() {
  const navigate = useNavigate();
  const sesion = getSesion();

  const [busqueda, setBusqueda] = useState("");
  const [alumno, setAlumno] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [cantidadDiasInput, setCantidadDiasInput] = useState("");
  const [rutinaExistente, setRutinaExistente] = useState(false);
  const [diaActivo, setDiaActivo] = useState(0);
  const [ejerciciosPorDia, setEjerciciosPorDia] = useState({});

  const [libreria, setLibreria] = useState([]);
  const [mostrarExito, setMostrarExito] = useState(false);
  const [errorValidacion, setErrorValidacion] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (sesion?.id) {
      getEjercicios(sesion.id).then(setLibreria);
      getAlumnos(sesion.id).then(setAlumnos);
    }
  }, [sesion?.id]);

  const resultadosAlumno = useMemo(() => {
    if (alumno || !busqueda.trim()) return [];
    const termino = busqueda.toLowerCase();
    return alumnos.filter((a) =>
      `${a.nombre} ${a.apellido}`.toLowerCase().includes(termino)
    );
  }, [busqueda, alumno, alumnos]);

  const cantidadDias = Math.min(
    MAX_DIAS,
    Math.max(0, parseInt(cantidadDiasInput, 10) || 0)
  );
  const dias = Array.from({ length: cantidadDias }, (_, i) => i);

  const seleccionarAlumno = async (a) => {
    setAlumno(a);
    setBusqueda(`${a.nombre} ${a.apellido}`);
    const historial = await getRutinaHistorial(a.id);
    const tieneRutina = historial.length > 0;
    setRutinaExistente(tieneRutina);
    if (tieneRutina) setCantidadDiasInput("");
  };

  const cambiarAlumno = () => {
    setAlumno(null);
    setBusqueda("");
    setErrorValidacion("");
    setRutinaExistente(false);
  };

  const irADia = (index) => {
    if (index >= cantidadDias) return;
    setDiaActivo(index);
  };

  const agregarEjercicioAlDia = (ejercicioLibreria) => {
    setEjerciciosPorDia((prev) => ({
      ...prev,
      [diaActivo]: [
        ...(prev[diaActivo] || []),
        {
          instanciaId: `temp-${Date.now()}`,
          ejercicioId: ejercicioLibreria.id,
          nombre: ejercicioLibreria.nombre,
          video: ejercicioLibreria.video,
          peso: "",
          series: "",
          repeticiones: "",
        },
      ],
    }));
  };

  const actualizarCampo = (instanciaId, campo, valor) => {
    setErrorValidacion("");
    setEjerciciosPorDia((prev) => {
      const ejercicios = (prev[diaActivo] || []).map((ej) =>
        ej.instanciaId === instanciaId ? { ...ej, [campo]: valor } : ej
      );
      return { ...prev, [diaActivo]: ejercicios };
    });
  };

  const eliminarEjercicio = (instanciaId) => {
    setEjerciciosPorDia((prev) => ({
      ...prev,
      [diaActivo]: (prev[diaActivo] || []).filter(
        (ej) => ej.instanciaId !== instanciaId
      ),
    }));
  };

  const reordenarEjercicios = (nuevosEjercicios) => {
    setEjerciciosPorDia((prev) => ({ ...prev, [diaActivo]: nuevosEjercicios }));
  };

  const encontrarDiaIncompleto = () => {
    for (let d = 0; d < cantidadDias; d++) {
      const incompleto = (ejerciciosPorDia[d] || []).some(
        (ej) => !ej.peso || !ej.series || !ej.repeticiones
      );
      if (incompleto) return d;
    }
    return null;
  };

  const guardarRutina = async () => {
    const diaIncompleto = encontrarDiaIncompleto();
    if (diaIncompleto !== null) {
      setDiaActivo(diaIncompleto);
      setErrorValidacion(
        `Completá el peso, las series y las repeticiones de todos los ejercicios antes de guardar (Día ${
          diaIncompleto + 1
        }).`
      );
      return;
    }
    setErrorValidacion("");
    if (alumno) {
      setGuardando(true);
      const diasGuardados = Array.from({ length: cantidadDias }, (_, i) => ({
        ejercicios: (ejerciciosPorDia[i] || []).map((ej) => ({
          ejercicioId: ej.ejercicioId,
          peso: ej.peso,
          repeticiones: ej.repeticiones,
          series: ej.series,
          recomendacion: ej.recomendacion,
        })),
      }));
      try {
        await crearSemana(alumno.id, diasGuardados);
        setMostrarExito(true);
      } catch (err) {
        setErrorValidacion(err.message);
      } finally {
        setGuardando(false);
      }
    }
  };

  const ejerciciosDelDiaActivo = ejerciciosPorDia[diaActivo] || [];

  return (
    <div className="page">
      <NavbarWide />

      <main className="armar-rutina">
        <Link to="/entrenador" className="armar-rutina__back">
          ← Volver
        </Link>

        <h1 className="armar-rutina__title">Armar rutina</h1>

        <section className="armar-rutina__section">
          <label className="armar-rutina__label" htmlFor="buscador-alumno">
            ¿Para quién es esta rutina?
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
                <ul className="armar-rutina__resultados">
                  {resultadosAlumno.map((a) => (
                    <li key={a.id}>
                      <button type="button" onClick={() => seleccionarAlumno(a)}>
                        {a.nombre} {a.apellido}
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

        <section className="armar-rutina__section">
          {alumno && rutinaExistente && (
            <div className="armar-rutina__aviso-rutina">
              <p className="armar-rutina__aviso-rutina__texto">
                Este alumno ya cuenta con una rutina
              </p>
              <Link
                to="/entrenador/modificar-rutina"
                className="armar-rutina__aviso-rutina__boton"
              >
                Ir a modificar rutina
              </Link>
            </div>
          )}

          <label className="armar-rutina__label">
            ¿En la semana, cuantos dias entrenará?
          </label>
          <div className="armar-rutina__opciones-dias">
            {Array.from({ length: MAX_DIAS }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                className={
                  "armar-rutina__opcion-dia" +
                  (Number(cantidadDiasInput) === n
                    ? " armar-rutina__opcion-dia--activo"
                    : "")
                }
                disabled={rutinaExistente}
                onClick={() => {
                  setCantidadDiasInput(String(n));
                  setDiaActivo(0);
                }}
              >
                {n} {n === 1 ? "día" : "días"}
              </button>
            ))}
          </div>
        </section>

        {!rutinaExistente && cantidadDias > 0 && (
          <>
            <hr className="armar-rutina__separador" />
            <p className="armar-rutina__subtitulo">Agrega los ejercicios</p>
            <section className="armar-rutina__section">
              <div className="armar-rutina__tabs">
                {dias.map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={
                      "armar-rutina__tab" +
                      (d === diaActivo ? " armar-rutina__tab--activo" : "")
                    }
                    onClick={() => irADia(d)}
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
              />
            </section>
          </>
        )}

        <button
          type="button"
          className="armar-rutina__guardar"
          onClick={guardarRutina}
          disabled={guardando || rutinaExistente}
        >
          {guardando ? "Guardando..." : "Guardar rutina"}
        </button>

        {errorValidacion && (
          <p className="armar-rutina__error">{errorValidacion}</p>
        )}
      </main>

      <ConfirmModal
        open={mostrarExito}
        title="¡Guardado con éxito! 🎉"
        confirmLabel="Seguir armando rutina"
        cancelLabel="Volver al menú"
        confirmVariant="primary"
        onConfirm={() => setMostrarExito(false)}
        onCancel={() => navigate("/entrenador")}
      />
    </div>
  );
}

export default ArmarRutina;
