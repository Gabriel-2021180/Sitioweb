const Cita = require('../Model/citas');
  const moment = require('moment');
  

  exports.getCitas = async (req, res) => {
    try {
      
      res.render('Citas', { user: req.user });
    } catch (error) {
      console.error('Error al obtener las citas:', error);
      res.status(500).json({ message: 'Error al obtener las citas'  });
    }
  };
  exports.getCitasJSON = async (req, res) => {
    try {
      const usuarioActual = req.user._id;
  
      // Obtener la fecha y hora actual en UTC con moment.js
      const fechaActual = moment.utc().startOf('day').toDate();
  
      // Buscar las citas donde el usuario actual es el cliente y la fecha de la cita es mayor o igual a la fecha actual
      const citas = await Cita.find({
        activo: true,
        cliente: usuarioActual,
        fecha: { $gte: fechaActual } // Filtrar las citas de hoy y futuras
      }).populate('cliente', 'nombres').populate('abogado', 'nombres apellidos');
  
      // Convertir las fechas a una cadena sin convertir la zona horaria
      const citasConFechasUTC = citas.map((cita) => {
        const fechaUTC = cita.fecha.toISOString().split('T')[0];
        const estado = getEstadoCita(cita); // Obtener el estado de la cita
  
        return { ...cita.toObject(), fecha: fechaUTC, horaFin: cita.horaFin, estado };
      });
  
      res.json(citasConFechasUTC);
    } catch (error) {
      console.error('Error al obtener las citas:', error);
      res.status(500).json({ message: 'Error al obtener las citas' });
    }
};