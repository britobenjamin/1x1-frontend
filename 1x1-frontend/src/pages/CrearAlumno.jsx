import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import NavbarWide from "../components/NavbarWide.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import { getAlumno, crearAlumno, actualizarAlumno } from "../utils/api.js";
import { getSesion } from "../utils/sesion.js";
import "./CrearAlumno.css";

const FRECUENCIAS = [1, 2, 3, 4, 5];

function CrearAlumno() {
  const navigate = useNavigate();
  const sesion = getSesion();
  const [searchParams] = useSearchParams();
  const idEditar = searchParams.get("id");
  const modoEdicion = !!idEditar;

  const [alumnoAEditar, setAlumnoAEditar] = useState(null);
  const [cargando, setCargando] = useState(modoEdicion);
  const [experiencia, setExperiencia] = useState("");
  const [sexo, setSexo] = useState("");
  const [modificarPassword, setModificarPassword] = useState(!modoEdicion);
  const [mostrarExito, setMostrarExito] = useState(false);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (modoEdicion) {
      getAlumno(idEditar).then((a) => {
        setAlumnoAEditar(a);
        setExperiencia(a.experiencia);
        setSexo(a.sexo || "");
        setCargando(false);
      });
    }
  }, [idEditar, modoEdicion]);

  const guardarCambios = async (e) => {
    e.preventDefault();
    const form = Object.fromEntries(new FormData(e.target));
    setError("");

    if (form.dni?.trim() !== form.confirmarDni?.trim()) {
      setError("Los DNI ingresados no coinciden.");
      return;
    }
    if (form.mail?.trim() !== form.confirmarMail?.trim()) {
      setError("Los mails ingresados no coinciden.");
      return;
    }
    if (form.telefono?.trim() !== form.confirmarTelefono?.trim()) {
      setError("Los teléfonos ingresados no coinciden.");
      return;
    }
    if (form.password && form.password !== form.confirmarPassword) {
      setError("Las contraseñas ingresadas no coinciden.");
      return;
    }

    setGuardando(true);

    const data = {
      nombre: form.nombre?.trim(),
      apellido: form.apellido?.trim(),
      mail: form.mail?.trim(),
      telefono: form.telefono?.trim(),
      sexo: form.sexo || null,
      edad: form.edad || null,
      peso: form.peso || null,
      experiencia: form.experiencia,
      frecuencia: form.experiencia === "entrenando" ? form.frecuencia : null,
      lesiones: form.lesiones?.trim() || null,
      dni: form.dni?.trim(),
    };
    if (form.password) data.password = form.password;

    try {
      if (modoEdicion) {
        await actualizarAlumno(idEditar, data);
      } else {
        await crearAlumno({ ...data, entrenadorId: sesion.id });
      }
      setMostrarExito(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return null;

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
                required
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
                required
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

          <div className="form-card__row">
            <div className="form-card__field">
              <label className="form-card__label" htmlFor="mail">
                Mail
              </label>
              <input
                id="mail"
                name="mail"
                type="email"
                className="form-card__input"
                defaultValue={alumnoAEditar?.mail}
                autoComplete="off"
                required
              />
            </div>

            <div className="form-card__field">
              <label className="form-card__label" htmlFor="confirmarMail">
                Repetir mail
              </label>
              <input
                id="confirmarMail"
                name="confirmarMail"
                type="email"
                className="form-card__input"
                defaultValue={alumnoAEditar?.mail}
                autoComplete="off"
                required
              />
            </div>
          </div>

          <div className="form-card__row">
            <div className="form-card__field">
              <label className="form-card__label" htmlFor="telefono">
                Teléfono
              </label>
              <input
                id="telefono"
                name="telefono"
                type="text"
                inputMode="numeric"
                placeholder="Ej: 3815489574"
                className="form-card__input"
                defaultValue={alumnoAEditar?.telefono}
                autoComplete="off"
                required
              />
            </div>

            <div className="form-card__field">
              <label className="form-card__label" htmlFor="confirmarTelefono">
                Repetir teléfono
              </label>
              <input
                id="confirmarTelefono"
                name="confirmarTelefono"
                type="text"
                inputMode="numeric"
                placeholder="Ej: 3815489574"
                className="form-card__input"
                defaultValue={alumnoAEditar?.telefono}
                autoComplete="off"
                required
              />
            </div>
          </div>

          <div className="form-card__section">
            <span className="form-card__label">Sexo</span>
            <div className="form-card__options">
              <label className="form-card__option">
                <input
                  type="radio"
                  name="sexo"
                  value="masculino"
                  checked={sexo === "masculino"}
                  onChange={() => setSexo("masculino")}
                />
                Masculino
              </label>
              <label className="form-card__option">
                <input
                  type="radio"
                  name="sexo"
                  value="femenino"
                  checked={sexo === "femenino"}
                  onChange={() => setSexo("femenino")}
                />
                Femenino
              </label>
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

          <div className="form-card__field">
            <label className="form-card__label" htmlFor="lesiones">
              Lesiones
            </label>
            <textarea
              id="lesiones"
              name="lesiones"
              className="form-card__input form-card__textarea"
              placeholder="Ej: molestia en el hombro derecho, evitar press militar..."
              defaultValue={alumnoAEditar?.lesiones}
            />
          </div>

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
                autoComplete="off"
                required
              />
            </div>

            <div className="form-card__field">
              <label className="form-card__label" htmlFor="confirmarDni">
                Repetir DNI
              </label>
              <input
                id="confirmarDni"
                name="confirmarDni"
                type="text"
                inputMode="numeric"
                className="form-card__input"
                defaultValue={alumnoAEditar?.dni}
                autoComplete="off"
                required
              />
            </div>
          </div>

          <div className="form-card__row">
            <div className="form-card__field">
              <label className="form-card__label" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-card__input"
                placeholder={
                  modoEdicion && !modificarPassword ? "••••••••" : ""
                }
                autoComplete="new-password"
                disabled={modoEdicion && !modificarPassword}
                required={!modoEdicion || modificarPassword}
              />
            </div>

            <div className="form-card__field">
              <label className="form-card__label" htmlFor="confirmarPassword">
                Repetir contraseña
              </label>
              <input
                id="confirmarPassword"
                name="confirmarPassword"
                type="password"
                className="form-card__input"
                placeholder={
                  modoEdicion && !modificarPassword ? "••••••••" : ""
                }
                autoComplete="new-password"
                disabled={modoEdicion && !modificarPassword}
                required={!modoEdicion || modificarPassword}
              />
            </div>
          </div>

          {modoEdicion && !modificarPassword && (
            <button
              type="button"
              className="form-card__link-btn form-card__link-btn--centrado"
              onClick={() => setModificarPassword(true)}
            >
              Modificar contraseña
            </button>
          )}

          {error && <p className="form-card__error">{error}</p>}

          <button type="submit" className="form-card__submit" disabled={guardando}>
            {guardando
              ? "Guardando..."
              : modoEdicion
              ? "Guardar cambios"
              : "Crear alumno"}
          </button>
        </form>
      </main>

      <ConfirmModal
        open={mostrarExito}
        title={modoEdicion ? "Cambios guardados con éxito" : "Alumno creado con éxito"}
        confirmLabel={modoEdicion ? "Seguir editando" : "Ir al menú"}
        cancelLabel="Volver al listado"
        confirmVariant="primary"
        hideCancel={!modoEdicion}
        mostrarCerrar={modoEdicion}
        onConfirm={() =>
          modoEdicion ? setMostrarExito(false) : navigate("/entrenador")
        }
        onCancel={() =>
          navigate(modoEdicion ? "/entrenador/lista-alumnos" : "/entrenador")
        }
      />
    </div>
  );
}

export default CrearAlumno;
