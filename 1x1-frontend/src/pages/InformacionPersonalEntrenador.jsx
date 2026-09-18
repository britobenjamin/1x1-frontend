import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavbarWide from "../components/NavbarWide.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import FechaInput from "../components/FechaInput.jsx";
import { getEntrenador, actualizarEntrenador } from "../utils/api.js";
import { getSesion, setSesion } from "../utils/sesion.js";
import "./CrearAlumno.css";

function formatearFecha(fechaISO) {
  if (!fechaISO) return "-";
  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function InformacionPersonalEntrenador() {
  const navigate = useNavigate();
  const sesion = getSesion();
  const [entrenador, setEntrenador] = useState(null);
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [modificando, setModificando] = useState(false);
  const [mostrarExito, setMostrarExito] = useState(false);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (sesion?.id) {
      getEntrenador(sesion.id).then((e) => {
        setEntrenador(e);
        setFechaNacimiento(e.fechaNacimiento?.slice(0, 10) || "");
      });
    }
  }, [sesion?.id]);

  const guardarCambios = async (e) => {
    e.preventDefault();
    const form = Object.fromEntries(new FormData(e.target));
    setError("");

    if (form.mail?.trim() !== form.confirmarMail?.trim()) {
      setError("Los mails ingresados no coinciden.");
      return;
    }
    if (form.telefono?.trim() !== form.confirmarTelefono?.trim()) {
      setError("Los teléfonos ingresados no coinciden.");
      return;
    }

    setGuardando(true);
    const data = {
      nombre: form.nombre?.trim(),
      apellido: form.apellido?.trim(),
      mail: form.mail?.trim(),
      telefono: form.telefono?.trim(),
      fechaNacimiento: form.fechaNacimiento || null,
    };

    try {
      const actualizado = await actualizarEntrenador(sesion.id, data);
      setEntrenador(actualizado);
      setFechaNacimiento(actualizado.fechaNacimiento?.slice(0, 10) || "");
      setSesion({ ...sesion, nombre: actualizado.nombre });
      setModificando(false);
      setMostrarExito(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  if (!entrenador) return null;

  return (
    <div className="page">
      <NavbarWide />

      <main className="crear-alumno">
        <Link to="/entrenador" className="crear-alumno__back">
          ← Volver
        </Link>

        <form className="form-card" onSubmit={guardarCambios}>
          <h1 className="form-card__title">Información personal</h1>

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
                defaultValue={entrenador.nombre}
                disabled={!modificando}
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
                defaultValue={entrenador.apellido}
                disabled={!modificando}
                required
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
                defaultValue={entrenador.mail}
                autoComplete="off"
                disabled={!modificando}
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
                defaultValue={entrenador.mail}
                autoComplete="off"
                disabled={!modificando}
                required
              />
            </div>
          </div>

          <div className="form-card__row">
            <div className="form-card__field">
              <label className="form-card__label" htmlFor="telefono">
                Número de teléfono
              </label>
              <input
                id="telefono"
                name="telefono"
                type="text"
                inputMode="numeric"
                placeholder="Ej: 3815489574"
                className="form-card__input"
                defaultValue={entrenador.telefono}
                autoComplete="off"
                disabled={!modificando}
                required
              />
            </div>

            <div className="form-card__field">
              <label className="form-card__label" htmlFor="confirmarTelefono">
                Repetir número de teléfono
              </label>
              <input
                id="confirmarTelefono"
                name="confirmarTelefono"
                type="text"
                inputMode="numeric"
                placeholder="Ej: 3815489574"
                className="form-card__input"
                defaultValue={entrenador.telefono}
                autoComplete="off"
                disabled={!modificando}
                required
              />
            </div>
          </div>

          <div className="form-card__row">
            <div className="form-card__field">
              <label className="form-card__label" htmlFor="fechaNacimiento">
                Fecha de nacimiento
              </label>
              <FechaInput
                id="fechaNacimiento"
                name="fechaNacimiento"
                className="form-card__input"
                value={fechaNacimiento}
                onChange={setFechaNacimiento}
                disabled={!modificando}
                required
              />
              <p className="form-card__ayuda">Formato: día / mes / año</p>
            </div>

            <div className="form-card__field">
              <span className="form-card__label">
                Inscripto en la aplicación desde
              </span>
              <p className="form-card__valor-lectura">
                {formatearFecha(entrenador.createdAt)}
              </p>
            </div>
          </div>

          {error && <p className="form-card__error">{error}</p>}

          {!modificando && (
            <button
              type="button"
              className="form-card__modificar"
              onClick={() => setModificando(true)}
            >
              Modificar datos
            </button>
          )}

          <button
            type="submit"
            className="form-card__submit"
            disabled={guardando || !modificando}
          >
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </main>

      <ConfirmModal
        open={mostrarExito}
        title="Cambios guardados con éxito"
        confirmLabel="Seguir editando"
        cancelLabel="Ir al menú"
        confirmVariant="primary"
        onConfirm={() => setMostrarExito(false)}
        onCancel={() => navigate("/entrenador")}
      />
    </div>
  );
}

export default InformacionPersonalEntrenador;
