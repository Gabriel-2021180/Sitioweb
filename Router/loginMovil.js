const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../Model/user');
const Caso = require('../Model/casos');
const Documento = require('../Model/documentos');
const { Storage } = require('@google-cloud/storage');

const storage = new Storage({ keyFilename: 'googleimage.json' });
const bucketName = 'primerstorage';

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post('/', async (request, response, next) => {
  try {
    const post_data = request.body;
    const username = post_data.username;
    const password = post_data.password;

    const user = await User.findOne({ username: username });

    if (user) {
      const isMatch = await user.comparePassword(password);

      if (isMatch) {
        const casos = await Caso.find({ cliente: user._id }).select('nombrecaso tipo descripcion fase');
        console.log('Casos:', casos);

        const casosConDocumentos = await Promise.all(
          casos.map(async (caso) => {
            const documentos = await Documento.find({ caso: caso._id });
            console.log(`Documentos del caso ${caso._id}:`, documentos);

            const documentosConUrl = await Promise.all(
              documentos.map(async (documento) => {
                const documentoUrl = await storage
                  .bucket(bucketName)
                  .file(documento.documento)
                  .getSignedUrl({
                    version: 'v4',
                    action: 'read',
                    expires: Date.now() + 30 * 60 * 1000, // La URL expirará en 15 minutos
                  });

                console.log(`URL del documento ${documento._id}:`, documentoUrl[0]);

                return {
                  ...documento.toObject(),
                  url: documentoUrl[0],
                };
              })
            );

            console.log(`Documentos con URL del caso ${caso._id}:`, documentosConUrl);

            return {
              ...caso.toObject(),
              documentos: documentosConUrl,
            };
          })
        );

        console.log('Casos con documentos:', casosConDocumentos);

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
          casos: casosConDocumentos,
        };

        console.log('Respuesta del usuario:', userResponse);

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
