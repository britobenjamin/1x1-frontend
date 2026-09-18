import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavbarWide from "../components/NavbarWide.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import AsistenciaChart from "../components/AsistenciaChart.jsx";
import {
  getAlumnos,
  eliminarAlumno,
  getHistorialPeso,
  getRutinaHistorial,
  agregarPeso,
} from "../utils/api.js";
import { getSesion } from "../utils/sesion.js";
import "./ListaAlumnos.css";

const ESTADO_LABEL = {
  pagado: "Pagado",
  pendiente: "Pendiente",
  vencido: "Vencido",
};

function formatearFecha(fechaISO) {
  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function ListaAlumnos() {
  const navigate = useNavigate();
  const sesion = getSesion();
  const [alumnos, setAlumnos] = useState([]);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [alumnoAEliminar, setAlumnoAEliminar] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [historialAbierto, setHistorialAbierto] = useState(false);
  const [historialPeso, setHistorialPeso] = useState([]);
  const [historialAsistencia, setHistorialAsistencia] = useState([]);
  const [historialCargando, setHistorialCargando] = useState(false);
  const [nuevoPeso, setNuevoPeso] = useState("");
  const [guardandoPeso, setGuardandoPeso] = useState(false);
  const [pesoGuardadoOk, setPesoGuardadoOk] = useState(false);

  useEffect(() => {
    if (sesion?.id) {
      getAlumnos(sesion.id).then(setAlumnos);
    }
  }, [sesion?.id]);

  const alumnosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return alumnos;
    return alumnos.filter((a) =>
      `${a.nombre} ${a.apellido}`.toLowerCase().includes(termino)
    );
  }, [alumnos, busqueda]);

  const confirmarEliminarAlumno = async () => {
    await eliminarAlumno(alumnoAEliminar.id);
    setAlumnos((prev) => prev.filter((a) => a.id !== alumnoAEliminar.id));
    setAlumnoAEliminar(null);
  };

  const cerrarModalAlumno = () => {
    setAlumnoSeleccionado(null);
    setHistorialAbierto(false);
    setHistorialPeso([]);
    setHistorialAsistencia([]);
    setNuevoPeso("");
    setPesoGuardadoOk(false);
  };

  const toggleHistorialPeso = async () => {
    if (!historialAbierto && historialPeso.length === 0) {
      setHistorialCargando(true);
      const [registros, semanas] = await Promise.all([
        getHistorialPeso(alumnoSeleccionado.id),
        getRutinaHistorial(alumnoSeleccionado.id),
      ]);
      setHistorialPeso(registros);
      setHistorialAsistencia(semanas);
      setHistorialCargando(false);
    }
    setHistorialAbierto((prev) => !prev);
  };

  const agregarNuevoPeso = async (e) => {
    e.preventDefault();
    if (!nuevoPeso) return;

    setGuardandoPeso(true);
    const registro = await agregarPeso(alumnoSeleccionado.id, nuevoPeso);
    setHistorialPeso((prev) => [registro, ...prev]);
    setAlumnoSeleccionado((prev) => ({ ...prev, peso: registro.peso }));
    setAlumnos((prev) =>
      prev.map((a) =>
        a.id === alumnoSeleccionado.id ? { ...a, peso: registro.peso } : a
      )
    );
    setNuevoPeso("");
    setGuardandoPeso(false);
    setPesoGuardadoOk(true);
    setTimeout(() => setPesoGuardadoOk(false), 3000);
  };

  return (
    <div className="page">
      <NavbarWide />

      <main className="lista-alumnos">
        <Link to="/entrenador" className="lista-alumnos__back">
          ← Volver
        </Link>

        <h1 className="lista-alumnos__title">Listado de alumnos</h1>

        <input
          type="text"
          placeholder="Buscar alumno por nombre..."
          className="lista-alumnos__buscador"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <ul className="lista-alumnos__lista">
          {alumnosFiltrados.map((a) => (
            <li key={a.id} className="alumno-fila">
              <button
                type="button"
                className="alumno-item"
                onClick={() => setAlumnoSeleccionado(a)}
              >
                <span className="alumno-item__nombre">
                  {a.nombre} {a.apellido}
                </span>
                <span
                  className={`badge-pago badge-pago--${a.estadoPago}`}
                >
                  {ESTADO_LABEL[a.estadoPago]}
                </span>
              </button>

              <div className="alumno-fila__acciones">
                <button
                  type="button"
                  className="alumno-accion alumno-accion--editar"
                  onClick={() =>
                    navigate(`/entrenador/crear-alumno?id=${a.id}`)
                  }
                  aria-label={`Editar a ${a.nombre} ${a.apellido}`}
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
                  className="alumno-accion alumno-accion--eliminar"
                  onClick={() => setAlumnoAEliminar(a)}
                  aria-label={`Eliminar a ${a.nombre} ${a.apellido}`}
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
            </li>
          ))}
        </ul>

        {alumnosFiltrados.length === 0 && (
          <p className="lista-alumnos__sin-resultados">
            No se encontraron alumnos.
          </p>
        )}
      </main>

      {alumnoSeleccionado && (
        <div className="modal__overlay" onClick={cerrarModalAlumno}>
          <div
            className="modal__card"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal__cerrar-x"
              onClick={cerrarModalAlumno}
              aria-label="Cerrar"
            >
              ×
            </button>

            <h2 className="modal__title">
              {alumnoSeleccionado.nombre} {alumnoSeleccionado.apellido}
            </h2>

            <div className="alumno-detalle">
              <div className="alumno-detalle__fila">
                <span>DNI</span>
                <span>{alumnoSeleccionado.dni}</span>
              </div>
              <div className="alumno-detalle__fila">
                <span>Teléfono</span>
                <span>{alumnoSeleccionado.telefono || "-"}</span>
              </div>
              <div className="alumno-detalle__fila">
                <span>Edad</span>
                <span>{alumnoSeleccionado.edad} años</span>
              </div>
              <div className="alumno-detalle__fila">
                <span>Peso</span>
                <span>{alumnoSeleccionado.peso} kg</span>
              </div>
              <div className="alumno-detalle__fila">
                <span>Inscripto el</span>
                <span>{formatearFecha(alumnoSeleccionado.fechaInscripcion)}</span>
              </div>
              <div className="alumno-detalle__fila">
                <span>Experiencia</span>
                <span>
                  {alumnoSeleccionado.experiencia === "nuevo"
                    ? "Recién empieza"
                    : `Ya entrena (${alumnoSeleccionado.frecuencia}x por semana)`}
                </span>
              </div>
              <div className="alumno-detalle__fila">
                <span>Lesiones</span>
                <span>{alumnoSeleccionado.lesiones || "-"}</span>
              </div>
              <div className="alumno-detalle__fila">
                <span>Estado de pago</span>
                <span
                  className={`badge-pago badge-pago--${alumnoSeleccionado.estadoPago}`}
                >
                  {ESTADO_LABEL[alumnoSeleccionado.estadoPago]}
                </span>
              </div>
            </div>

            <div className="historial-peso">
              <button
                type="button"
                className="historial-peso__header"
                onClick={toggleHistorialPeso}
                aria-expanded={historialAbierto}
              >
                <span>Historial del Alumno</span>
                <svg
                  className={
                    "historial-peso__flecha" +
                    (historialAbierto ? " historial-peso__flecha--abierto" : "")
                  }
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {historialAbierto && (
                <div className="historial-peso__lista">
                  {historialCargando ? (
                    <p className="historial-peso__vacio">Cargando...</p>
                  ) : historialPeso.length === 0 ? (
                    <p className="historial-peso__vacio">
                      Todavía no hay registros de peso.
                    </p>
                  ) : (
                    historialPeso.map((registro) => (
                      <div key={registro.id} className="historial-peso__fila">
                        <span className="historial-peso__fecha">
                          {formatearFecha(registro.fecha)}
                        </span>
                        <span className="historial-peso__valor">
                          {registro.peso} kg
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {historialAbierto && !historialCargando && (
                <div className="historial-peso__seccion">
                  <form
                    className="historial-peso__form"
                    onSubmit={agregarNuevoPeso}
                  >
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="Nuevo peso (kg)"
                      className="historial-peso__input"
                      value={nuevoPeso}
                      onChange={(e) => setNuevoPeso(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="historial-peso__agregar"
                      disabled={guardandoPeso || !nuevoPeso}
                    >
                      {guardandoPeso ? "Guardando..." : "Agregar peso"}
                    </button>
                  </form>
                  {pesoGuardadoOk && (
                    <p className="historial-peso__ok">
                      Peso nuevo guardado con éxito
                    </p>
                  )}
                </div>
              )}

              {historialAbierto && !historialCargando && (
                <div className="historial-peso__seccion">
                  <p className="historial-peso__subtitulo">
                    Progreso de asistencia
                  </p>
                  <AsistenciaChart semanas={historialAsistencia} />
                </div>
              )}
            </div>

            <button
              type="button"
              className="modal__cerrar"
              onClick={cerrarModalAlumno}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(alumnoAEliminar)}
        title="Eliminar alumno"
        message={
          alumnoAEliminar &&
          `¿Seguro que querés eliminar a ${alumnoAEliminar.nombre} ${alumnoAEliminar.apellido} del listado de alumnos?`
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        mostrarCerrar
        onConfirm={confirmarEliminarAlumno}
        onCancel={() => setAlumnoAEliminar(null)}
      />
    </div>
  );
}

export default ListaAlumnos;
