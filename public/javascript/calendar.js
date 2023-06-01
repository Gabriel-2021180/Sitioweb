

var calendar;

document.addEventListener('DOMContentLoaded', function () {
  var calendarEl = document.getElementById('calendar');
  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    timeZone: 'local',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    initialDate: new Date(),
    navLinks: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    weekends: true,
    editable: true,
    select: function (info) {
      // Mostrar el modal con el formulario
      openModal(info);
    },
    eventClick: function (info) {
      openEventModal(info.event);
    },
    events: function (info, successCallback, failureCallback) {
      fetch('/citasJSON')
        .then((response) => {
          if (!response.ok) {
            throw new Error('Error al cargar las citas');
          }
          return response.json();
        })
        .then((citas) => {
          const events = citas.map((cita) => {
            return {
              title: cita.motivo,
              start: new Date(cita.fecha + 'T' + cita.hora),
              end: new Date(cita.fecha + 'T' + cita.hora),
              allDay: false,
              description: cita.motivo,
            };
          });
          successCallback(events);
        })
        .catch((error) => {
          console.error('Error al cargar las citas:', error);
          failureCallback(error);
        });
    },
  });

  calendar.render();
  console.log('Antes de cargar citas'); // Agregar este mensaje de consola
  loadCitas(); 
  // Función para abrir el modal con el formulario
  function openModal(info) {
    var modal = document.getElementById('myModal');
    var dateInput = document.getElementById('date');
    var submitBtn = document.getElementById('save-event');
    var closeBtn = document.getElementById('xclose');

    
  }

  function closeModal() {
    var modal = document.getElementById('myModal');
    modal.style.display = 'none';
  }
});

function openEventModal(event) {
  var eventModal = document.getElementById('eventModal');
  var eventClose = document.getElementById('eventClose');
  var eventMotivo = document.getElementById('eventMotivo');
  var eventFecha = document.getElementById('eventFecha');
  var eventHora = document.getElementById('eventHora');
  var eventEstado = document.getElementById('eventEstado');
  var eventHoraFin = document.getElementById('eventHoraFin');
  eventMotivo.textContent = 'Motivo: ' + event.title;
  eventFecha.textContent = 'Fecha: ' + event.start.toLocaleDateString();
  eventHora.textContent = 'Hora: ' + event.start.toLocaleTimeString();
  eventHoraFin.textContent='Hora Fin: '+ event.end.toLocaleTimeString();
  eventEstado.textContent = 'Estado: ' + event.extendedProps.estado;

  eventModal.style.display = 'block';

  eventClose.onclick = function () {
    eventModal.style.display = 'none';
  };
}

// Remove these lines
async function loadCitas() {
  try {
    const response = await fetch('/citasJSON');
    const citas = await response.json();
    console.log('Citas recibidas:', citas);
    for (const cita of citas) {
      addCitaToCalendar(cita);
    }
  } catch (error) {
    console.error('Error al cargar las citas:', error);
  }

  // Set the time zone of the Full Calendar library to the local time zone.
  calendar.timeZone = 'local';
}

function adjustToLocalTime(date, time) {
  let [hours, minutes] = time.split(':');
  let newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0); // Usa setHours en lugar de setUTCHours
  newDate.setDate(newDate.getDate() + 1); // Agrega un día a la fecha
  return newDate; // Devuelve un objeto Date en lugar de una cadena ISO
}



function addCitaToCalendar(cita) {
  const event = {
    title: cita.motivo,
    start: adjustToLocalTime(cita.fecha, cita.hora),
    
    end: adjustToLocalTime(cita.fecha, cita.horafin), // Usa 'cita.horafin' para la hora de fin
    allDay: false,
    description: cita.motivo,
    estado: cita.estado,
  };
  
  calendar.addEvent(event);
}









