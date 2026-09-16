import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavbarWide from "../components/NavbarWide.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import { ALUMNOS_MOCK } from "../utils/alumnosMock.js";
import "./ListaAlumnos.css";

const ESTADO_LABEL = {
  pagado: "Pagado",
  vencido: "Vencido",
};

function formatearFecha(fechaISO) {
  const fecha = new Date(`${fechaISO}T00:00:00`);
  return fecha.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function ListaAlumnos() {
  const navigate = useNavigate();
  const [alumnos, setAlumnos] = useState(ALUMNOS_MOCK);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [alumnoAEliminar, setAlumnoAEliminar] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const alumnosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return alumnos;
    return alumnos.filter((a) =>
      `${a.nombre} ${a.apellido}`.toLowerCase().includes(termino)
    );
  }, [alumnos, busqueda]);

  const confirmarEliminarAlumno = () => {
    setAlumnos((prev) => prev.filter((a) => a.id !== alumnoAEliminar.id));
    setAlumnoAEliminar(null);
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
        <div
          className="modal__overlay"
          onClick={() => setAlumnoSeleccionado(null)}
        >
          <div
            className="modal__card"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="modal__title">
              {alumnoSeleccionado.nombre} {alumnoSeleccionado.apellido}
            </h2>

            <div className="alumno-detalle">
              <div className="alumno-detalle__fila">
                <span>DNI</span>
                <span>{alumnoSeleccionado.dni}</span>
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
                <span>Estado de pago</span>
                <span
                  className={`badge-pago badge-pago--${alumnoSeleccionado.estadoPago}`}
                >
                  {ESTADO_LABEL[alumnoSeleccionado.estadoPago]}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="modal__cerrar"
              onClick={() => setAlumnoSeleccionado(null)}
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
        onConfirm={confirmarEliminarAlumno}
        onCancel={() => setAlumnoAEliminar(null)}
      />
    </div>
  );
}

export default ListaAlumnos;
