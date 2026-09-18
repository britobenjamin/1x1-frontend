import { useEffect, useState } from "react";
import "./FechaInput.css";

// Tres campos separados (día / mes / año) en vez de un solo input de fecha:
// así no hay que pelear con separadores ni con el formato que le imponga el
// sistema operativo de cada usuario. El mes se elige de una lista para que
// no haya dudas de a qué número corresponde cada uno.

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function isoAPartes(iso) {
  if (!iso) return { dia: "", mes: "", anio: "" };
  const partes = iso.slice(0, 10).split("-");
  if (partes.length !== 3) return { dia: "", mes: "", anio: "" };
  const [anio, mes, dia] = partes;
  return { dia: String(Number(dia)), mes: String(Number(mes)), anio };
}

function partesAIso(dia, mes, anio) {
  const diaN = Number(dia);
  const mesN = Number(mes);
  const anioN = Number(anio);
  if (!diaN || !mesN || !anioN || anio.length < 4) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${anioN}-${pad(mesN)}-${pad(diaN)}`;
}

function soloDigitos(valor, maxLargo) {
  return valor.replace(/\D/g, "").slice(0, maxLargo);
}

// value/onChange trabajan siempre en formato ISO ("YYYY-MM-DD"), igual que el
// resto de la app y la API; lo único que cambia es cómo se ve y se completa.
function FechaInput({
  id,
  name,
  value,
  onChange,
  className,
  disabled,
  required,
}) {
  const [dia, setDia] = useState("");
  const [mes, setMes] = useState("");
  const [anio, setAnio] = useState("");

  useEffect(() => {
    const partes = isoAPartes(value);
    setDia(partes.dia);
    setMes(partes.mes);
    setAnio(partes.anio);
  }, [value]);

  const actualizar = (nuevoDia, nuevoMes, nuevoAnio) => {
    setDia(nuevoDia);
    setMes(nuevoMes);
    setAnio(nuevoAnio);
    onChange?.(partesAIso(nuevoDia, nuevoMes, nuevoAnio));
  };

  const campoClase = ["fecha-input__campo", className].filter(Boolean).join(" ");

  return (
    <div className="fecha-input">
      {name && (
        <input type="hidden" name={name} value={partesAIso(dia, mes, anio)} />
      )}
      <input
        id={id}
        type="text"
        inputMode="numeric"
        placeholder="Día"
        aria-label="Día"
        className={`${campoClase} fecha-input__campo--dia`}
        value={dia}
        onChange={(e) => actualizar(soloDigitos(e.target.value, 2), mes, anio)}
        disabled={disabled}
        required={required}
      />
      <select
        aria-label="Mes"
        className={`${campoClase} fecha-input__campo--mes`}
        value={mes}
        onChange={(e) => actualizar(dia, e.target.value, anio)}
        disabled={disabled}
        required={required}
      >
        <option value="">Mes</option>
        {MESES.map((nombreMes, indice) => (
          <option key={nombreMes} value={indice + 1}>
            {nombreMes}
          </option>
        ))}
      </select>
      <input
        type="text"
        inputMode="numeric"
        placeholder="Año"
        aria-label="Año"
        className={`${campoClase} fecha-input__campo--anio`}
        value={anio}
        onChange={(e) => actualizar(dia, mes, soloDigitos(e.target.value, 4))}
        disabled={disabled}
        required={required}
      />
    </div>
  );
}

export default FechaInput;
