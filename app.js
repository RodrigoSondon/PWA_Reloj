/* =========================================================
   app.js – Lógica del Reloj · PWA Reloj
   =========================================================
*/

const horaDigital       = document.getElementById('hora-digital');
const fechaTexto        = document.getElementById('fecha-texto');
const contenedorMarcadores = document.getElementById('marcadores-horas');

const NOMBRES_MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

const NOMBRES_DIAS = [
  'domingo', 'lunes', 'martes', 'miércoles',
  'jueves', 'viernes', 'sábado'
];

function formatearDosDigitos(numero) {
  return String(numero).padStart(2, '0');
}

function actualizarHoraDigital(ahora) {
  const hh = formatearDosDigitos(ahora.getHours());
  const mm = formatearDosDigitos(ahora.getMinutes());
  const ss = formatearDosDigitos(ahora.getSeconds());

  const cadenaHora = `${hh}:${mm}:${ss}`;

  horaDigital.textContent = cadenaHora;
  horaDigital.setAttribute('datetime', cadenaHora);
}

function actualizarFecha(ahora) {
  const diaSemana = NOMBRES_DIAS[ahora.getDay()];
  const dia       = ahora.getDate();
  const mes       = NOMBRES_MESES[ahora.getMonth()];
  const anio      = ahora.getFullYear();

  fechaTexto.textContent = `${diaSemana}, ${dia} de ${mes} de ${anio}`;
}


function actualizarReloj() {
  const ahora = new Date(); // Obtener hora actual del sistema

  actualizarManecillas(ahora);

  actualizarHoraDigital(ahora);
  actualizarFecha(ahora);
}

dibujarMarcadoresHora();

actualizarReloj();

//Actualizar el reloj cada 1000 ms (1 segundo)
setInterval(actualizarReloj, 1000);