# 1x1 — Especificación funcional

**Eslogan:** *Un día a la vez*

Plataforma de gestión pensada para preparadores físicos que trabajan de forma independiente (no para gimnasios), donde el entrenador arma y asigna rutinas semanales a sus clientes, hace seguimiento de su cumplimiento y lleva control de los pagos.

---

## 1. Resumen del proyecto

- Web con dos portales de acceso: **Entrenador** y **Cliente**.
- El entrenador crea sus clientes (nickname + contraseña) y les arma una rutina semanal, ejercicio por ejercicio, con video explicativo.
- El cliente ingresa con ese nickname, ve la rutina del día, tacha lo que va completando, usa un cronómetro de descanso entre series y puede dejar comentarios por ejercicio.
- El estado de pago (pagado / pendiente / vencido) se anota manualmente por el entrenador y es visible para ambos.
- **Alcance de esta etapa:** solo frontend, con datos simulados (sin backend todavía). El backend se define y se construye en una etapa posterior.

---

## 2. Roles de usuario

### Entrenador
- Se registra y accede con su propio usuario.
- Gestiona una cartera de clientes (uno a muchos: un entrenador → muchos clientes).
- Crea el usuario de cada cliente (nickname + contraseña) y se lo entrega personalmente.
- Arma la rutina semanal de cada cliente.
- Registra el estado de pago de cada cliente.

### Cliente
- Tiene un único entrenador.
- Ingresa con el nickname y contraseña que le dio su entrenador (no se autorregistra).
- Ve y ejecuta su rutina, dejando comentarios y usando el cronómetro.
- Ve su propio estado de pago.

---

## 3. Flujos principales

1. **Registro del entrenador** → crea su cuenta en el portal Entrenador.
2. **Alta de cliente** → el entrenador crea un nuevo cliente, define nickname + contraseña, se los entrega.
3. **Armado de rutina semanal** → el entrenador entra al panel del cliente y carga los 7 días, con ejercicios, series, repeticiones y video de YouTube en cada uno.
4. **Ejecución de la rutina** → el cliente entra, ve el día actual, ejecuta cada ejercicio (mira el video si necesita, usa el cronómetro entre series), tacha al completar y puede dejar un comentario por ejercicio.
5. **Registro de pago** → el entrenador marca cuándo pagó cada cliente; queda historial.

---

## 4. Funcionalidades — Panel Entrenador

- **Gestión de clientes:** alta, edición y listado de clientes propios.
- **Panel de creación de rutinas:** por cada cliente, carga de la semana completa (7 días). Por cada ejercicio dentro de un día:
  - Nombre del ejercicio
  - Series
  - Repeticiones
  - Video: se pega el link de YouTube, se muestra en miniatura dentro del panel; al hacer click abre el video en YouTube
- **Historial de rutinas:** las rutinas anteriores de cada cliente quedan guardadas y consultables (no se pierden al cargar una nueva semana).
- **Estado de pago:** el entrenador marca manualmente si el cliente está pagado / pendiente / vencido. Cada registro genera una entrada en el historial de pagos del cliente.
- **Vista de cumplimiento:** el entrenador ve qué ejercicios tachó el cliente (interpretándolo como "realizado") y puede leer los comentarios que dejó por ejercicio.

## 5. Funcionalidades — Panel Cliente

- **Login** con nickname y contraseña provistos por el entrenador.
- **Rutina del día:** se muestra automáticamente el día que corresponde dentro de la semana cargada por el entrenador, con cada ejercicio (nombre, series, repeticiones, miniatura del video).
- **Tachado de ejercicios:** al marcar un ejercicio como hecho, queda registrado como completado (el entrenador lo ve así).
- **Comentario por ejercicio:** campo de texto en cada ejercicio para que el cliente le avise algo puntual al entrenador (dolor, dificultad, duda, etc.).
- **Cronómetro de descanso:** el cliente define el tiempo de descanso que quiere entre series; al llegar a cero suena una campana y se dispara una notificación.
- **Estado de pago:** visualización simple de si está al día o no.

---

## 6. Cronómetro de descanso — detalle

- Input ajustable por el cliente (minutos/segundos).
- Controles: iniciar, pausar, reiniciar.
- Al llegar a 0: sonido de campana (audio embebido) + notificación del navegador (Web Notification API — requiere que el cliente otorgue el permiso la primera vez que usa la app).
- Vive dentro de la pantalla de ejecución de la rutina, siempre accesible mientras el cliente entrena.

---

## 7. Estructura de datos (a nivel frontend, con vista a futuro backend)

Aunque en esta etapa los datos se van a simular (mock data / localStorage), conviene pensar la información ya organizada así, para que el futuro backend sea un simple reemplazo de la fuente de datos:

- **Entrenador**: id, nombre, usuario, contraseña
- **Cliente**: id, nickname, contraseña, entrenador_id, estado_pago (pagado / pendiente / vencido)
- **Rutina (semana)**: id, cliente_id, fecha_inicio, días[]
- **DíaRutina**: id, rutina_id, día_semana, ejercicios[]
- **Ejercicio**: id, día_id, nombre, series, repeticiones, video_url, completado (sí/no), comentario_cliente
- **HistorialPago**: id, cliente_id, fecha, estado
- **HistorialRutina**: versiones anteriores de rutinas por cliente, para consulta

---

## 8. Identidad visual

- **Nombre:** 1x1
- **Eslogan:** Un día a la vez
- **Color principal:** naranja `#FA4B0A` (acciones, marca, elementos activos)
- **Naranja oscuro (hover/pressed):** `#C93D08`
- **Fondo:** negro `#0D0D0D`
- **Superficie/tarjetas:** gris carbón `#1C1C1C`
- **Texto secundario/bordes:** gris medio `#8C8C86`
- **Estado pagado:** verde `#3FA34D`
- **Estado pendiente:** ámbar `#FFC107`
- **Estado vencido:** rojo `#E63946`
- **Tipografía de títulos/logo:** Anton
- **Tipografía de interfaz (labels, botones):** Oswald (bold)
- **Tipografía de texto/comentarios:** Inter

---

## 9. Stack técnico

- **Frontend:** React + Vite (mismo enfoque que Ticket Virtual)
- **Estado/datos:** mock data + localStorage para simular usuarios, rutinas y pagos mientras no exista backend
- **Ruteo:** React Router, con dos ramas principales: `/entrenador` y `/cliente`
- **Estilos:** CSS con variables propias (paleta 1x1 definida arriba)
- **Backend:** no se construye en esta etapa. Se define más adelante (posiblemente Node.js + Express + base de datos, a definir cuando llegue el momento)
- **Este proyecto lo desarrolla Benjamin en solitario** (no involucra a su hermano, a diferencia de Ticket Virtual)

---

## 10. Roadmap por fases

### Fase 1 — Frontend con datos simulados (MVP)
- Estructura del proyecto en React + Vite, ruteo de los dos portales
- Identidad visual aplicada (paleta y tipografías)
- Login simulado para Entrenador y Cliente
- Panel Entrenador: alta/edición de clientes, armado de rutina semanal (ejercicios con series, repeticiones y video)
- Panel Cliente: rutina del día, tachado de ejercicios, video, cronómetro de descanso con campana y notificación, comentario por ejercicio
- Registro y visualización del estado de pago
- Todo persistido en localStorage (sin backend real)

### Fase 2 — Backend e integración real
- Diseño de la base de datos y API a partir del modelo de la sección 7
- Autenticación real (reemplaza el login simulado)
- Migración de localStorage a la API
- Historial de pagos y de rutinas persistente en base de datos

### Fase 3 — Funcionalidades avanzadas
- Estadísticas de cumplimiento (porcentaje de ejercicios completados por semana/mes)
- Notificaciones push reales (más allá de la notificación del navegador)
- Posible evolución a PWA o app mobile

---

## 11. Preguntas abiertas para etapas futuras

- ¿Se guarda un porcentaje de cumplimiento histórico por cliente (además del tachado semanal)?
- ¿El entrenador puede editar la rutina de la semana en curso, o solo cargar la próxima semana?
- ¿El comentario del cliente queda como historial permanente o se puede borrar/marcar como "leído"?
- ¿Cómo se resuelve la notificación del cronómetro si el cliente cambia de pestaña o cierra el navegador?



datos agregados que el entrenador tenga la opcion de "copiar la misma rutina del dia "y tiene que seleccionar aqui que dia quiere copiar la misma rutina" para que no tenga que estar cargando manualmente ejercico por ejercicio y que una vez que se copie la rutina del dia que eligió que ahi pueda modificar el peso 
