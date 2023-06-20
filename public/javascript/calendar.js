
  var calendar;



  document.addEventListener('DOMContentLoaded', function () {

    var calendarEl = document.getElementById('calendar');

    calendar = new FullCalendar.Calendar(calendarEl, {

      initialView: 'dayGridMonth',

      timeZone: 'local',

      locale: 'es',

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

                start: adjustToLocalTime(cita.fecha, cita.hora),

                end: adjustToLocalTime(cita.fecha, cita.horaFin), // Modificado para usar 'horaFin' en lugar de 'hora'

                allDay: false,

                description: cita.motivo,

                extendedProps: {

                  estado: cita.estado,
                  abogadoNombre: cita.abogado.nombres + ' ' + cita.abogado.apellidos,

                },

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
    var eventAbogado = document.getElementById('eventabogado'); // Corregido para seleccionar el elemento correctamente
  
    eventMotivo.textContent = 'Motivo: ' + event.title;
    eventFecha.textContent = 'Fecha: ' + event.start.toLocaleDateString();
    eventHora.textContent = 'Hora: ' + event.start.toLocaleTimeString();
    eventHoraFin.textContent = 'Hora Fin: ' + event.end.toLocaleTimeString();
    eventEstado.textContent = 'Estado: ' + event.extendedProps.estado;
    console.log(event.extendedProps.abogadoNombre)
    if (event.extendedProps.abogadoNombre) {
      eventAbogado.textContent = 'Abogado: ' + event.extendedProps.abogadoNombre;
    } else {
      eventAbogado.textContent = 'Abogado: N/A';
    }
  
    eventModal.style.display = 'block';
  
    eventClose.onclick = function () {
      eventModal.style.display = 'none';
    };
  }
  





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
  
    // Ajustar la fecha y la hora a la zona horaria local del cliente
    newDate.setHours(newDate.getHours() + newDate.getTimezoneOffset() / 60);
    newDate.setHours(hours, minutes, 0, 0);
  
    return newDate;
  }
  



  function addCitaToCalendar(cita) {

    const event = {

      title: cita.motivo,

      start: adjustToLocalTime(cita.fecha.$date, cita.hora), // Modificado para usar 'fecha.$date'

      end: adjustToLocalTime(cita.fecha.$date, cita.horaFin), // Modificado para usar 'fecha.$date' y 'horaFin'

      allDay: false,

      description: cita.motivo,

      extendedProps: {

        estado: cita.estado,
        abogadoNombre: cita.abogado.nombres + ' ' + cita.abogado.apellidos, // Obtener el nombre y apellido del abogado

      },

    };

    

    calendar.addEvent(event);

  }
