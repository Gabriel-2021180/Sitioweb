
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

    var today = new Date();
    var yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (info.start < yesterday) {
      alert('Solo puedes hacer citas para hoy y mañana.');
      return;
    }
    dateInput.value = info.startStr;
    modal.style.display = 'block';

    // Filtrar horarios entre 8:00 AM y 6:00 PM
    var timeInput = document.getElementById('time');
    timeInput.min = '08:00';
    timeInput.max = '18:00';
    timeInput.step = '1800'; // media hora

    submitBtn.onclick = function () {
      // Crear un objeto de evento con la información del formulario
      var title = document.getElementById('title').value;
      var time = document.getElementById('time').value;

      var selectedTime = document.getElementById('time').value;
      var selectedHour = parseInt(selectedTime.split(':')[0]);
      if (selectedHour < 8 || selectedHour >= 18) {
        alert('Solo puedes hacer citas entre las 8:00 AM y las 6:00 PM.');
        return;
      }

      var event = {
        title: title,
        start: info.startStr,
        end: info.endStr,
        allDay: time === '',
      };
    
      if (time) {
        var startTime = new Date(info.startStr);
        var endTime = new Date(info.endStr);

        var timeParts = time.split(':');
        startTime.setHours(timeParts[0]);
        startTime.setMinutes(timeParts[1]);

        endTime.setHours(timeParts[0]);
        endTime.setMinutes(timeParts[1]);

        event.start = startTime;
        event.end = endTime;
      }

      // Agregar el evento al calendario y enviar al servidor
      calendar.addEvent(event);
      saveEvent(event);

      // Cerrar el modal
      closeModal();
    };
    var timeInput = document.getElementById('time');
    timeInput.setAttribute('min', '08:00');
    timeInput.setAttribute('max', '18:00');
    closeBtn.onclick = function () {
      closeModal();
    };
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

  eventMotivo.textContent = 'Motivo: ' + event.title;
  eventFecha.textContent = 'Fecha: ' + event.start.toLocaleDateString();
  eventHora.textContent = 'Hora: ' + event.start.toLocaleTimeString();
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
  newDate.setUTCHours(hours, minutes, 0, 0);
  return newDate.toISOString();
}


function addCitaToCalendar(cita) {
  const event = {
    title: cita.motivo,
    start: adjustToLocalTime(cita.fecha, cita.hora),
    end: adjustToLocalTime(cita.fecha, cita.hora),
    allDay: false,
    description: cita.motivo,
    estado: cita.estado,
  };
  calendar.addEvent(event);
}

// Función para guardar la cita en el servidor
function saveEvent(event) {
  const fechaHora = event.start.toISOString().split('T');
  const fecha = new Date(fechaHora[0]); // Crear un objeto Date sin zona horaria
  const fechaSinZonaHoraria = fecha.toISOString().split('T')[0]; // Convertirlo a una cadena de texto sin zona horaria
  const hora = fechaHora[1].substring(0, 5);

  const cita = {
    motivo: event.title,
    estado: 'pendiente',
    fecha: fechaSinZonaHoraria,
    hora: hora,
  };

  fetch('/citas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cita),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Error al guardar la cita');
      }
      return response.json();
    })
    .then((savedEvent) => {
      console.log('Cita guardada:', savedEvent);
    })
    .catch((error) => {
      console.error('Error al guardar la cita:', error);
    });
}





