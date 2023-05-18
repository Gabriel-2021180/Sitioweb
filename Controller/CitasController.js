  const Cita = require('../Model/citas');

  exports.postCita = async (req, res) => {
    try {
      const { motivo, estado, fecha, hora } = req.body;
      const cita = new Cita({ motivo, estado, fecha, hora });
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
      res.status(500).json({ message: 'Error al obtener las citas' });
    }
  };
  exports.getCitasJSON = async (req, res) => {
    try {
      const citas = await Cita.find();
      res.json( citas);
    } catch (error) {
      console.error('Error al obtener las citas:', error);
      res.status(500).json({ message: 'Error al obtener las citas' });
    }
  };
  



