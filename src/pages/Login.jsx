import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "./Login.css";

function LoginCard({ role, onSubmit }) {
  return (
    <form className="login-card" onSubmit={onSubmit}>
      <h2 className="login-card__title">{role}</h2>

      <label className="login-card__label" htmlFor={`${role}-dni`}>
        DNI
      </label>
      <input
        id={`${role}-dni`}
        name="dni"
        type="text"
        inputMode="numeric"
        placeholder="Ingresá tu DNI"
        className="login-card__input"
      />

      <label className="login-card__label" htmlFor={`${role}-password`}>
        Contraseña
      </label>
      <input
        id={`${role}-password`}
        name="password"
        type="password"
        placeholder="Ingresá tu contraseña"
        className="login-card__input"
      />

      <button type="submit" className="login-card__submit">
        Ingresar
      </button>
    </form>
  );
}

function Login() {
  const navigate = useNavigate();

  const handleEntrenadorSubmit = (e) => {
    e.preventDefault();
    navigate("/entrenador");
  };

  const handleAlumnoSubmit = (e) => {
    e.preventDefault();
    navigate("/alumno");
  };

  return (
    <div className="page page--home">
      <header className="navbar">
        <img src={logo} alt="1x1" className="navbar__logo" />
        <p className="navbar__tagline">Un día a la vez</p>
      </header>

      <div className="login-bienvenida">
        <h1 className="login-bienvenida__titulo">
          Bienvenidos a la aplicación 1x1
        </h1>
        <p className="login-bienvenida__subtitulo">
          Rutinas personalizadas, seguimiento de tu progreso y contacto
          directo con tu entrenador, todo en un solo lugar.
        </p>
      </div>

      <main className="login-section">
        <LoginCard role="Entrenador" onSubmit={handleEntrenadorSubmit} />
        <LoginCard role="Alumno" onSubmit={handleAlumnoSubmit} />
      </main>
    </div>
  );
}

export default Login;
