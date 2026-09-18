import { useNavigate } from "react-router-dom";
import NavbarWide from "../components/NavbarWide.jsx";
import { getSesion, limpiarSesion } from "../utils/sesion.js";
import "./Entrenador.css";

const OPCIONES = [
  { label: "Información personal", path: "/alumno/informacion-personal" },
  { label: "Ver rutina", path: "/alumno/rutina" },
  { label: "Mi progreso", path: "/alumno/progreso" },
];

function Alumno() {
  const navigate = useNavigate();
  const sesion = getSesion();

  const salir = () => {
    limpiarSesion();
    navigate("/");
  };

  return (
    <div className="page">
      <NavbarWide />

      <main className="dashboard">
        <div className="dashboard__header">
          <div className="dashboard__toolbar">
            <button type="button" className="dashboard__logout" onClick={salir}>
              Salir
            </button>
          </div>
          <h1 className="dashboard__title">Panel del Alumno</h1>
          <p className="dashboard__greeting">Hola, {sesion?.nombre}</p>
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
