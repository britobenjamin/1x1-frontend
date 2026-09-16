import { useNavigate } from "react-router-dom";
import NavbarWide from "../components/NavbarWide.jsx";
import { ALUMNOS_MOCK } from "../utils/alumnosMock.js";
import "./Entrenador.css";

const OPCIONES = [
  { label: "Información personal", path: "/alumno/informacion-personal" },
  { label: "Ver rutina", path: "/alumno/rutina" },
];

const ALUMNO_ACTUAL = ALUMNOS_MOCK[0];

function Alumno() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <NavbarWide />

      <main className="dashboard">
        <div className="dashboard__header">
          <div className="dashboard__toolbar">
            <button
              type="button"
              className="dashboard__logout"
              onClick={() => navigate("/")}
            >
              Salir
            </button>
          </div>
          <h1 className="dashboard__title">Panel del Alumno</h1>
          <p className="dashboard__greeting">Hola, {ALUMNO_ACTUAL.nombre}</p>
        </div>

        <div className="dashboard__grid">
          {OPCIONES.map((opcion) => (
            <button
              key={opcion.label}
              type="button"
              className="dashboard__card"
              onClick={() => navigate(opcion.path)}
            >
              {opcion.label}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Alumno;
