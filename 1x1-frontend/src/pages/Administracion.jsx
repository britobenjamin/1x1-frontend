import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import NavbarWide from "../components/NavbarWide.jsx";
import FechaInput from "../components/FechaInput.jsx";
import { getAlumnos, actualizarAlumno, registrarPago } from "../utils/api.js";
import { getSesion } from "../utils/sesion.js";
import "./ListaAlumnos.css";
import "./Administracion.css";

const ESTADO_LABEL = {
  pagado: "Pagado",
  pendiente: "Pendiente",
  vencido: "Vencido",
};

const MESES = [1, 2, 3, 4, 5];

function formatearFecha(fechaISO) {
  if (!fechaISO) return "-";
  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function aFechaInput(fechaISO) {
  if (!fechaISO) return "";
  return fechaISO.slice(0, 10);
}

// Suma meses a una fecha (string "YYYY-MM-DD" o ISO) evitando líos de huso
// horario: arma la fecha en UTC a partir del año/mes/día puros.
function sumarMeses(fechaISO, meses) {
  const [anio, mes, dia] = fechaISO.slice(0, 10).split("-").map(Number);
  const fecha = new Date(Date.UTC(anio, mes - 1 + meses, dia));
  return fecha.toISOString().slice(0, 10);
}

function Administracion() {
  const sesion = getSesion();
  const [alumnos, setAlumnos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [mesesElegidos, setMesesElegidos] = useState(null);
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [guardadoOk, setGuardadoOk] = useState(false);

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

  const abrirModalPago = (alumno) => {
    setAlumnoSeleccionado(alumno);
    setMesesElegidos(null);
    setFechaVencimiento(aFechaInput(alumno.fechaVencimiento));
    setGuardadoOk(false);
  };

  const cerrarModalPago = () => {
    setAlumnoSeleccionado(null);
  };

  const elegirMeses = (meses) => {
    setMesesElegidos(meses);
    const base =
      alumnoSeleccionado.fechaVencimiento || alumnoSeleccionado.fechaInscripcion;
    setFechaVencimiento(sumarMeses(base, meses));
  };

  const guardarPago = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      // Si se carga una fecha, es un pago: queda registrado en el historial.
      // Si se la borra, es solo un ajuste (no hay nada que pagar) y no genera fila.
      const actualizado = fechaVencimiento
        ? (
            await registrarPago(alumnoSeleccionado.id, {
              meses: mesesElegidos,
              fechaVencimiento,
            })
          ).alumno
        : await actualizarAlumno(alumnoSeleccionado.id, {
            fechaVencimiento: null,
          });
      setAlumnos((prev) =>
        prev.map((a) => (a.id === actualizado.id ? actualizado : a))
      );
      setAlumnoSeleccionado(actualizado);
      setGuardadoOk(true);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="page">
      <NavbarWide />

      <main className="lista-alumnos">
        <Link to="/entrenador" className="lista-alumnos__back">
          ← Volver
        </Link>

        <h1 className="lista-alumnos__title">Administración</h1>

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
                onClick={() => abrirModalPago(a)}
              >
                <span className="alumno-item__nombre">
                  {a.nombre} {a.apellido}
                </span>
                <span className={`badge-pago badge-pago--${a.estadoPago}`}>
                  {ESTADO_LABEL[a.estadoPago]}
                </span>
              </button>
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
        <div className="modal__overlay" onClick={cerrarModalPago}>
          <div
            className="modal__card"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal__cerrar-x"
              onClick={cerrarModalPago}
              aria-label="Cerrar"
            >
              ×
            </button>

            <h2 className="modal__title">
              {alumnoSeleccionado.nombre} {alumnoSeleccionado.apellido}
            </h2>

            <div className="alumno-detalle">
              <div className="alumno-detalle__fila">
                <span>Estado de pago</span>
                <span
                  className={`badge-pago badge-pago--${alumnoSeleccionado.estadoPago}`}
                >
                  {ESTADO_LABEL[alumnoSeleccionado.estadoPago]}
                </span>
              </div>
              <div className="alumno-detalle__fila">
                <span>Vence el</span>
                <span>{formatearFecha(alumnoSeleccionado.fechaVencimiento)}</span>
              </div>
            </div>

            <form onSubmit={guardarPago}>
              <p className="administracion__label">¿Cuántos meses pagó?</p>
              <div className="administracion__meses">
                {MESES.map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={
                      "administracion__mes" +
                      (mesesElegidos === n ? " administracion__mes--activo" : "")
                    }
                    onClick={() => elegirMeses(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <label
                className="administracion__label"
                htmlFor="fechaVencimiento"
              >
                Fecha de vencimiento
              </label>
              <FechaInput
                id="fechaVencimiento"
                className="historial-peso__input"
                value={fechaVencimiento}
                onChange={(iso) => {
                  setFechaVencimiento(iso);
                  setMesesElegidos(null);
                }}
              />
              <p className="administracion__ayuda">
                Formato día / mes / año. Podés ajustarla a mano si el alumno
                arranca un mes nuevo en otro día (por ejemplo, si dejó de venir
                y retomó más tarde).
              </p>

              <button
                type="submit"
                className="modal__cerrar administracion__guardar"
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "Guardar"}
              </button>

              {guardadoOk && (
                <p className="historial-peso__ok">Vencimiento guardado con éxito</p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Administracion;
