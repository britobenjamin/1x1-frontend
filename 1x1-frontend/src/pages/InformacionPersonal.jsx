import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NavbarWide from "../components/NavbarWide.jsx";
import { getAlumno } from "../utils/api.js";
import { getSesion } from "../utils/sesion.js";
import "./ArmarRutina.css";
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

function InformacionPersonal() {
  const sesion = getSesion();
  const [alumno, setAlumno] = useState(null);

  useEffect(() => {
    if (sesion?.id) {
      getAlumno(sesion.id).then(setAlumno);
    }
  }, [sesion?.id]);

  if (!alumno) return null;

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
            {alumno.nombre} {alumno.apellido}
          </h2>

          <div className="alumno-detalle">
            <div className="alumno-detalle__fila">
              <span>DNI</span>
              <span>{alumno.dni}</span>
            </div>
            <div className="alumno-detalle__fila">
              <span>Teléfono</span>
              <span>{alumno.telefono || "-"}</span>
            </div>
            <div className="alumno-detalle__fila">
              <span>Edad</span>
              <span>{alumno.edad} años</span>
            </div>
            <div className="alumno-detalle__fila">
              <span>Peso</span>
              <span>{alumno.peso} kg</span>
            </div>
            <div className="alumno-detalle__fila">
              <span>Inscripto el</span>
              <span>{formatearFecha(alumno.fechaInscripcion)}</span>
            </div>
            <div className="alumno-detalle__fila">
              <span>Experiencia</span>
              <span>
                {alumno.experiencia === "nuevo"
                  ? "Recién empieza"
                  : `Ya entrena (${alumno.frecuencia}x por semana)`}
              </span>
            </div>
            <div className="alumno-detalle__fila">
              <span>Estado de pago</span>
              <span className={`badge-pago badge-pago--${alumno.estadoPago}`}>
                {ESTADO_LABEL[alumno.estadoPago]}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default InformacionPersonal;
