import { useNavigate } from "react-router-dom";
import NavbarWide from "../components/NavbarWide.jsx";
import { getSesion, limpiarSesion } from "../utils/sesion.js";
import "./Entrenador.css";

const OPCIONES = [
  { label: "Información personal", path: "/entrenador/informacion-personal" },
  { label: "Administración", path: "/entrenador/administracion" },
  { label: "Crear alumno", path: "/entrenador/crear-alumno" },
  { label: "Ver listado de alumnos", path: "/entrenador/lista-alumnos" },
  { label: "Lista de ejercicios", path: "/entrenador/lista-ejercicios" },
  { label: "Armar rutina", path: "/entrenador/armar-rutina" },
  { label: "Modificar rutina", path: "/entrenador/modificar-rutina" },
];

function Entrenador() {
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
          <h1 className="dashboard__title">Panel del Entrenador</h1>
          <p className="dashboard__greeting">Hola, {sesion?.nombre}</p>
        </div>

        <div className="dashboard__grid">
          {OPCIONES.map((opcion) => (
            <button
              key={opcion.label}
              type="button"
              className="dashboard__card"
              onClick={() => opcion.path && navigate(opcion.path)}
            >
              {opcion.label}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Entrenador;
