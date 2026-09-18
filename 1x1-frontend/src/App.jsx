import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Entrenador from "./pages/Entrenador.jsx";
import InformacionPersonalEntrenador from "./pages/InformacionPersonalEntrenador.jsx";
import Administracion from "./pages/Administracion.jsx";
import CrearAlumno from "./pages/CrearAlumno.jsx";
import ArmarRutina from "./pages/ArmarRutina.jsx";
import ListaEjercicios from "./pages/ListaEjercicios.jsx";
import ListaAlumnos from "./pages/ListaAlumnos.jsx";
import ModificarRutina from "./pages/ModificarRutina.jsx";
import Alumno from "./pages/Alumno.jsx";
import InformacionPersonal from "./pages/InformacionPersonal.jsx";
import VerRutina from "./pages/VerRutina.jsx";
import MiProgreso from "./pages/MiProgreso.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/entrenador" element={<Entrenador />} />
        <Route
          path="/entrenador/informacion-personal"
          element={<InformacionPersonalEntrenador />}
        />
        <Route path="/entrenador/administracion" element={<Administracion />} />
        <Route path="/entrenador/crear-alumno" element={<CrearAlumno />} />
        <Route path="/entrenador/armar-rutina" element={<ArmarRutina />} />
        <Route path="/entrenador/lista-ejercicios" element={<ListaEjercicios />} />
        <Route path="/entrenador/lista-alumnos" element={<ListaAlumnos />} />
        <Route path="/entrenador/modificar-rutina" element={<ModificarRutina />} />
        <Route path="/alumno" element={<Alumno />} />
        <Route path="/alumno/informacion-personal" element={<InformacionPersonal />} />
        <Route path="/alumno/rutina" element={<VerRutina />} />
        <Route path="/alumno/progreso" element={<MiProgreso />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
