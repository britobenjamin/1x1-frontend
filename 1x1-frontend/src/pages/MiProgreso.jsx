import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NavbarWide from "../components/NavbarWide.jsx";
import AsistenciaChart from "../components/AsistenciaChart.jsx";
import { getRutinaHistorial, mapSemanaDesdeApi } from "../utils/api.js";
import { getSesion } from "../utils/sesion.js";
import "./ArmarRutina.css";

function MiProgreso() {
  const sesion = getSesion();
  const [semanas, setSemanas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (sesion?.id) {
      getRutinaHistorial(sesion.id).then((historial) => {
        setSemanas(historial.map(mapSemanaDesdeApi));
        setCargando(false);
      });
    }
  }, [sesion?.id]);

  return (
    <div className="page">
      <NavbarWide />

      <main className="armar-rutina">
        <Link to="/alumno" className="armar-rutina__back">
          ← Volver
        </Link>

        <h1 className="armar-rutina__title">Mi progreso</h1>

        {cargando ? null : semanas.length === 0 ? (
          <p className="armar-rutina__sin-resultados">
            Todavía no tenés rutinas cargadas.
          </p>
        ) : (
          <section className="armar-rutina__section">
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

            <div className="asistencia">
              <h2 className="asistencia__titulo">Progreso de asistencia</h2>
              <AsistenciaChart semanas={semanas} />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default MiProgreso;
