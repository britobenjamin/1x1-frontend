import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import NavbarWide from "../components/NavbarWide.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import { ALUMNOS_MOCK } from "../utils/alumnosMock.js";
import "./CrearAlumno.css";

const FRECUENCIAS = [1, 2, 3, 4, 5];

function CrearAlumno() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const idEditar = searchParams.get("id");
  const alumnoAEditar = idEditar
    ? ALUMNOS_MOCK.find((a) => String(a.id) === idEditar)
    : null;
  const modoEdicion = !!alumnoAEditar;

  const [experiencia, setExperiencia] = useState(
    alumnoAEditar?.experiencia || ""
  );
  const [mostrarExito, setMostrarExito] = useState(false);

  const guardarCambios = (e) => {
    e.preventDefault();
    if (modoEdicion) {
      setMostrarExito(true);
    }
  };

  return (
    <div className="page">
      <NavbarWide />

      <main className="crear-alumno">
        <Link to="/entrenador" className="crear-alumno__back">
          ← Volver
        </Link>

        <form className="form-card" onSubmit={guardarCambios}>
          <h1 className="form-card__title">
            {modoEdicion ? "Editar alumno" : "Crear alumno"}
          </h1>

          <div className="form-card__row">
            <div className="form-card__field">
              <label className="form-card__label" htmlFor="nombre">
                Nombre
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                className="form-card__input"
                defaultValue={alumnoAEditar?.nombre}
              />
            </div>

            <div className="form-card__field">
              <label className="form-card__label" htmlFor="apellido">
                Apellido
              </label>
              <input
                id="apellido"
                name="apellido"
                type="text"
                className="form-card__input"
                defaultValue={alumnoAEditar?.apellido}
              />
            </div>
          </div>

          <div className="form-card__row">
            <div className="form-card__field">
              <label className="form-card__label" htmlFor="edad">
                Edad
              </label>
              <input
                id="edad"
                name="edad"
                type="number"
                min="0"
                className="form-card__input"
                defaultValue={alumnoAEditar?.edad}
              />
            </div>

            <div className="form-card__field">
              <label className="form-card__label" htmlFor="peso">
                Peso (kg)
              </label>
              <input
                id="peso"
                name="peso"
                type="number"
                min="0"
                className="form-card__input"
                defaultValue={alumnoAEditar?.peso}
              />
            </div>
          </div>

          <div className="form-card__section">
            <span className="form-card__label">Experiencia</span>
            <div className="form-card__options">
              <label className="form-card__option">
                <input
                  type="radio"
                  name="experiencia"
                  value="nuevo"
                  checked={experiencia === "nuevo"}
                  onChange={() => setExperiencia("nuevo")}
                />
                Soy nuevo
              </label>
              <label className="form-card__option">
                <input
                  type="radio"
                  name="experiencia"
                  value="entrenando"
                  checked={experiencia === "entrenando"}
                  onChange={() => setExperiencia("entrenando")}
                />
                Vengo entrenando
              </label>
            </div>
          </div>

          {experiencia === "entrenando" && (
            <div className="form-card__section">
              <span className="form-card__label">¿Cuántas veces por semana?</span>
              <div className="form-card__options form-card__options--frecuencia">
                {FRECUENCIAS.map((n) => (
                  <label key={n} className="form-card__option form-card__option--pill">
                    <input
                      type="radio"
                      name="frecuencia"
                      value={n}
                      defaultChecked={alumnoAEditar?.frecuencia === n}
                    />
                    {n}
                  </label>
                ))}
              </div>
            </div>
          )}

          <p className="form-card__note">Con estos datos iniciará sesión</p>

          <div className="form-card__row">
            <div className="form-card__field">
              <label className="form-card__label" htmlFor="dni">
                DNI
              </label>
              <input
                id="dni"
                name="dni"
                type="text"
                inputMode="numeric"
                className="form-card__input"
                defaultValue={alumnoAEditar?.dni}
              />
            </div>

            <div className="form-card__field">
              <label className="form-card__label" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-card__input"
                placeholder={modoEdicion ? "Dejar en blanco para no cambiarla" : ""}
              />
            </div>
          </div>

          <button type="submit" className="form-card__submit">
            {modoEdicion ? "Guardar cambios" : "Crear alumno"}
          </button>
        </form>
      </main>

      <ConfirmModal
        open={mostrarExito}
        title="Cambios guardados con éxito"
        confirmLabel="Seguir editando"
        cancelLabel="Volver al listado"
        confirmVariant="primary"
        onConfirm={() => setMostrarExito(false)}
        onCancel={() => navigate("/entrenador/lista-alumnos")}
      />
    </div>
  );
}

export default CrearAlumno;
