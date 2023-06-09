const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../Model/user');
const Caso = require('../Model/casos');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.post('/', async (request, response, next) => {

  try {

    const post_data = request.body;

    const username = post_data.username;

    const password = post_data.password;

    console.log(username, password);

    const user = await User.findOne({ username: username });

    console.log(username);

    console.log(password);

    if (user) {

      const isMatch = await user.comparePassword(password);

      if (isMatch) {

        console.log("casos1");

        const casos = await Caso.find({ cliente: user._id }).select('nombrecaso tipo descripcion fase');

        console.log("casos2");

        let userResponse = {

          _id: user._id,

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

          emailVerified: user.emailVerified,

          casos: casos.map(caso => ({

            _id: caso._id,

            nombrecaso: caso.nombrecaso,

            tipo: caso.tipo,

            descripcion: caso.descripcion,

            fase: caso.fase

          }))

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