const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../Model/user'); // Asegúrate de cambiar esta ruta al archivo del modelo de usuario correcto

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post('/', async (request, response, next) => {
  try {

    const post_data = request.body;
    const username = post_data.username;
    const password = post_data.password;
    console.log(username,password)
    const user = await User.findOne({ username: username });
    console.log(username);
    console.log(password);
    if (user) {
      const isMatch = await user.comparePassword(password);
      if (isMatch) {
        // Crear un objeto de usuario para enviar como respuesta
        let userResponse = {
          nombres: user.nombres,
          apellidos: user.apellidos,
          username: user.username,
          ci: user.ci,
          direccion: user.direccion,
          rol: user.rol,
          fechanac: user.fechanac,
          phone: user.phone,
          email: user.email,
          image: user.image,
          emailVerified: user.emailVerified
        };
        response.json({ success: true, message: 'Inicio de sesión exitoso', user: userResponse });
      } else {
        response.json({ success: false, message: 'Nombre de usuario o contraseña incorrecta' });
      }      
    } else {
      response.json({ success: false, message: 'Nombre de usuario o contraseña incorrecta' });
    }
  } catch (err) {
    console.error('Error al iniciar sesión:', err);
    response.status(500).json({ success: false, message: 'Error al iniciar sesión' });
  }
});

module.exports = router;
