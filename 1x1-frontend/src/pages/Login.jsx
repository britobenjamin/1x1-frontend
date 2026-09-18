import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { loginEntrenador, loginAlumno } from "../utils/api.js";
import { setSesion } from "../utils/sesion.js";
import "./Login.css";

function IconoPersona() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
    </svg>
  );
}

function IconoBirrete() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" />
    </svg>
  );
}

function IconoDni() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <circle cx="8" cy="12" r="2" />
      <line x1="14" y1="10" x2="18" y2="10" />
      <line x1="14" y1="14" x2="18" y2="14" />
    </svg>
  );
}

function IconoCandado() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function IconoFlecha() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function LoginCard({ role, icono, onSubmit, error, cargando, linkSumate }) {
  return (
    <form
      className={`login-card login-card--${role.toLowerCase()}`}
      onSubmit={onSubmit}
    >
      <div className="login-card__encabezado">
        <span className="login-card__icono">{icono}</span>
        <span className="login-card__separador" aria-hidden="true" />
        <h2 className="login-card__title">{role}</h2>
      </div>

      <label className="login-card__label" htmlFor={`${role}-dni`}>
        DNI
      </label>
      <div className="login-card__input-wrapper">
        <span className="login-card__input-icono">
          <IconoDni />
        </span>
        <input
          id={`${role}-dni`}
          name="dni"
          type="text"
          inputMode="numeric"
          placeholder="Ingresá tu DNI"
          className="login-card__input"
          autoComplete="off"
        />
      </div>

      <label className="login-card__label" htmlFor={`${role}-password`}>
        Contraseña
      </label>
      <div className="login-card__input-wrapper">
        <span className="login-card__input-icono">
          <IconoCandado />
        </span>
        <input
          id={`${role}-password`}
          name="password"
          type="password"
          placeholder="Ingresá tu contraseña"
          className="login-card__input"
          autoComplete="new-password"
        />
      </div>

      {linkSumate && (
        <p className="login-card__sumate">
          Si no tenés cuenta, sumate a nuestra aplicación (
          <a href={linkSumate} target="_blank" rel="noopener noreferrer">
            tocá aquí para sumarte
          </a>
          )
        </p>
      )}

      {error && <p className="login-card__error">{error}</p>}

      <button type="submit" className="login-card__submit" disabled={cargando}>
        <span>{cargando ? "Ingresando..." : "Ingresar"}</span>
        <IconoFlecha />
      </button>
    </form>
  );
}

function Login() {
  const navigate = useNavigate();
  const [errorEntrenador, setErrorEntrenador] = useState("");
  const [errorAlumno, setErrorAlumno] = useState("");
  const [cargandoEntrenador, setCargandoEntrenador] = useState(false);
  const [cargandoAlumno, setCargandoAlumno] = useState(false);

  const handleEntrenadorSubmit = async (e) => {
    e.preventDefault();
    const { dni, password } = Object.fromEntries(new FormData(e.target));
    setErrorEntrenador("");
    setCargandoEntrenador(true);
    try {
      const entrenador = await loginEntrenador(dni, password);
      setSesion({ role: "entrenador", id: entrenador.id, nombre: entrenador.nombre });
      navigate("/entrenador");
    } catch (err) {
      setErrorEntrenador(err.message);
    } finally {
      setCargandoEntrenador(false);
    }
  };

  const handleAlumnoSubmit = async (e) => {
    e.preventDefault();
    const { dni, password } = Object.fromEntries(new FormData(e.target));
    setErrorAlumno("");
    setCargandoAlumno(true);
    try {
      const alumno = await loginAlumno(dni, password);
      setSesion({ role: "alumno", id: alumno.id, nombre: alumno.nombre });
      navigate("/alumno");
    } catch (err) {
      setErrorAlumno(err.message);
    } finally {
      setCargandoAlumno(false);
    }
  };

  return (
    <div className="page page--home">
      <header className="navbar">
        <div className="navbar__marca">
          <img src={logo} alt="1x1" className="navbar__logo" />
          <span className="navbar__tagline">Un día a la vez</span>
        </div>
      </header>

      <div className="login-bienvenida">
        <h1 className="login-bienvenida__titulo">
          Bienvenidos a la aplicación{" "}
          <span className="login-bienvenida__marca">1x1</span>
        </h1>
        <p className="login-bienvenida__subtitulo">
          Rutinas personalizadas, seguimiento de tu progreso y contacto
          directo con tu entrenador, todo en un solo lugar.
        </p>
        <span className="login-bienvenida__divisor" aria-hidden="true" />
      </div>

      <main className="login-section">
        <LoginCard
          role="Entrenador"
          icono={<IconoPersona />}
          onSubmit={handleEntrenadorSubmit}
          error={errorEntrenador}
          cargando={cargandoEntrenador}
          linkSumate="https://wa.me/5493815376191?text=Hola%20Benjamin%2C%20quiero%20sumarme%20como%20Entrenador%20a%20tu%20aplicaci%C3%B3n"
        />
        <LoginCard
          role="Alumno"
          icono={<IconoBirrete />}
          onSubmit={handleAlumnoSubmit}
          error={errorAlumno}
          cargando={cargandoAlumno}
        />
      </main>
    </div>
  );
}

export default Login;
