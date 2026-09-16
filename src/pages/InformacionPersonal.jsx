import { Link } from "react-router-dom";
import NavbarWide from "../components/NavbarWide.jsx";
import { ALUMNOS_MOCK } from "../utils/alumnosMock.js";
import "./ArmarRutina.css";
import "./ListaAlumnos.css";

const ESTADO_LABEL = {
  pagado: "Pagado",
  vencido: "Vencido",
};

const ALUMNO_ACTUAL = ALUMNOS_MOCK[0];

function formatearFecha(fechaISO) {
  const fecha = new Date(`${fechaISO}T00:00:00`);
  return fecha.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function InformacionPersonal() {
  return (
    <div className="page">
      <NavbarWide />

      <main className="armar-rutina">
        <Link to="/alumno" className="armar-rutina__back">
          ← Volver
        </Link>

        <h1 className="armar-rutina__title">Información personal</h1>

        <div className="modal__card">
          <h2 className="modal__title">
            {ALUMNO_ACTUAL.nombre} {ALUMNO_ACTUAL.apellido}
          </h2>

          <div className="alumno-detalle">
            <div className="alumno-detalle__fila">
              <span>DNI</span>
              <span>{ALUMNO_ACTUAL.dni}</span>
            </div>
            <div className="alumno-detalle__fila">
              <span>Edad</span>
              <span>{ALUMNO_ACTUAL.edad} años</span>
            </div>
            <div className="alumno-detalle__fila">
              <span>Peso</span>
              <span>{ALUMNO_ACTUAL.peso} kg</span>
            </div>
            <div className="alumno-detalle__fila">
              <span>Inscripto el</span>
              <span>{formatearFecha(ALUMNO_ACTUAL.fechaInscripcion)}</span>
            </div>
            <div className="alumno-detalle__fila">
              <span>Experiencia</span>
              <span>
                {ALUMNO_ACTUAL.experiencia === "nuevo"
                  ? "Recién empieza"
                  : `Ya entrena (${ALUMNO_ACTUAL.frecuencia}x por semana)`}
              </span>
            </div>
            <div className="alumno-detalle__fila">
              <span>Estado de pago</span>
              <span
                className={`badge-pago badge-pago--${ALUMNO_ACTUAL.estadoPago}`}
              >
                {ESTADO_LABEL[ALUMNO_ACTUAL.estadoPago]}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default InformacionPersonal;
