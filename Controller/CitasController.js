  const Cita = require('../Model/citas');

  exports.postCita = async (req, res) => {
    try {
      const { motivo, estado, fecha, hora, cliente, abogado } = req.body; // Asegúrate de recibir estos campos en el cuerpo de la solicitud
      const cita = new Cita({ motivo, estado, fecha, hora, cliente, abogado }); // Agrega los campos aquí
      await cita.save();
      res.render('Citas');
    } catch (error) {
      console.error('Error al crear la cita:', error);
      res.status(500).json({ message: 'Error al crear la cita' });
    }
  };
  

  exports.getCitas = async (req, res) => {
    try {
      const citas = await Cita.find();
      res.render('Citas', { user: req.user });
    } catch (error) {
      console.error('Error al obtener las citas:', error);
      res.status(500).json({ message: 'Error al obtener las citas'  });
    }
  };
  exports.getCitasJSON = async (req, res) => {
    try {
      // Supongamos que el id del cliente se pasa como un parámetro en la URL
      const clienteId = req.user._id;
  
      
      // Buscar citas donde el campo 'cliente' coincide con 'clienteId'
      const citas = await Cita.find({ cliente: clienteId });
  
      res.json(citas);
    } catch (error) {
      console.error('Error al obtener las citas:', error);
      res.status(500).json({ message: 'Error al obtener las citas' });
    }
  };
  
  
  
  
  


