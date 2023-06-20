  const express = require('express');
  const passport = require('passport');
  const Caso = require('../Model/casos');
  const router = express.Router();
  const LoginController = require('../Controller/LoginController');
  const SignupController = require('../Controller/SignUpController');
  const ProfileController = require('../Controller/ProfileController');
  const BufeteUserController=require('../Controller/infobufete');
  const { body } = require('express-validator');
  const { RateLimiterMemory } = require('rate-limiter-flexible');
  const multer = require('multer');
  const emailTransporter = require('../configs/emailConfig');
  const citasController = require('../Controller/CitasController');
  const casosController=require('../Controller/casoController');
  const ChatController = require('../Controller/ChatController');
  const User = require('../Model/user'); // Asegúrate de que la ruta sea correcta
const bufeteUser = require('../Model/bufeteUser');
  const upload = multer();
  const rateLimiter = new RateLimiterMemory({
    points: 4,
    duration: 60 * 5,
  });

  router.get('/', LoginController.getLogin);
  router.get('/signup', SignupController.getSignup);
  router.get('/verify-email', async (req, res) => {
    const token = req.query.token;

    try {
      const user = await User.findOne({ emailVerificationToken: token });

      if (!user) {
        req.flash('error_msg', 'El enlace de verificación no es válido o ha expirado.');
        return res.redirect('/login');
      }

      user.emailVerified = true;
      user.emailVerificationToken = undefined;
      await user.save();
      req.flash('success_msg', 'Correo electrónico verificado exitosamente. Ahora puedes iniciar sesión.');
      res.redirect('/login');
    } catch (error) {
      console.error('Error al verificar el correo electrónico:', error);
      req.flash('error_msg', 'Ocurrió un error al verificar tu correo electrónico. Por favor, inténtalo de nuevo.');
      res.redirect('/signup');
    }
  });
  router.post(
    '/signup',
    [
      body('nombres').notEmpty().withMessage('El campo nombres no puede estar vacío.'),
      body('apellidos').notEmpty().withMessage('El campo apellidos no puede estar vacío.'),
      body('username').notEmpty().withMessage('El campo nombre de usuario no puede estar vacío.'),
      body('ci').notEmpty().withMessage('El campo cédula de identidad no puede estar vacío.'),
      body('direccion').notEmpty().withMessage('El campo dirección no puede estar vacío.'),
      body('fechanac').notEmpty().withMessage('El campo fecha de nacimiento no puede estar vacío.'),
      body('phone').notEmpty().withMessage('El campo teléfono no puede estar vacío.'),
      body('email').notEmpty().withMessage('El campo email no puede estar vacío.'),
      body('password').notEmpty().withMessage('El campo contraseña no puede estar vacío.'),
    ],
    upload.single('image'),
    SignupController.postSignup
  );


  router.post(
    '/login',
    async (req, res, next) => {
      try {
        const rateLimiterRes = await rateLimiter.consume(req.ip);
        req.rateLimiterRes = rateLimiterRes;
        next();
      } catch (err) {
        console.log('Demasiadas solicitudes');
        req.rateLimiterRes = err;
        const remainingTime = Math.ceil(err.msBeforeNext / 1000);
        req.flash('error', `Demasiadas solicitudes, por favor espera ${remainingTime} segundos antes de intentar de nuevo.`);

        return res.render('login', { error: req.flash('error'), disableInputs: true }); // Cambiado aquí
      }
    },
    LoginController.postLogin
  );
  router.get('/index', (req, res) => {
    res.render('index', { user: req.user });
  });
  //router.get('/index', /*LoginController.isAuthenticated,*/ LoginController.getIndex);
  router.get('/logout', LoginController.getLogout);
  router.get('/login', LoginController.getLogin);
  router.get('/profile',LoginController.isAuthenticated,ProfileController.getProfile);
  
  router.get('/abogados', BufeteUserController.getAbogados);
  router.get('/perfil/:id', BufeteUserController.getPerfilAbogado);
  router.post('/solicitar', BufeteUserController.postSolicitudAbogado);
  router.get('/mis-casos', LoginController.isAuthenticated,casosController.getMisCasos);
  // Asegúrate de que el usuario esté autenticado antes de acceder al chat
  router.get('/chat/:id', LoginController.isAuthenticated, async (req, res) => {
    try {
      const caso = await Caso.findById(req.params.id);
      if (!caso) {
        // Maneja el caso en el que no se encuentra el caso
        return res.status(404).send('Caso no encontrado');
      }
      res.render('chat', { user: req.user, caso });
    } catch (error) {
      // Maneja cualquier otro error que pueda ocurrir
      console.error(error);
      res.status(500).send('Error al buscar el caso');
    }
  });
  
//validacion en tiempo real:
router.get('/checkUsername', async (req, res) => {
  const username = req.query.username;
  const user = await User.findOne({ username: username });
  if (user) {
    res.send({ valid: false });
  } else {
    res.send({ valid: true });
  }
});

router.get('/checkEmail', async (req, res) => {
  const email = req.query.email;
  const user = await User.findOne({ email: email });
  if (user) {
    res.send({ valid: false });
  } else {
    res.send({ valid: true });
  }
});
router.get('/checkphone', async (req, res) => {
  const phone = req.query.phone;
  const user = await User.findOne({ phone: phone });
  if (user) {
    res.send({ valid: false });
  } else {
    res.send({ valid: true });
  }
});
router.get('/checkci', async (req, res) => {
  const ci = req.query.ci;
  const user = await User.findOne({ ci: ci });
  if (user) {
    res.send({ valid: false });
  } else {
    res.send({ valid: true });
  }
});
//perte de casos
router.get('/casos/:id', LoginController.isAuthenticated,casosController.getCaso);
router.get('/get-documento-url/:documentoId', LoginController.isAuthenticated, casosController.getDocumentoUrl);
router.post('/chat/:id', LoginController.isAuthenticated, ChatController.chat);
router.get('/citas', LoginController.isAuthenticated,citasController.getCitas);
router.get('/citasJSON', citasController.getCitasJSON);
//editar un usuario
router.post('/profile/edit', LoginController.isAuthenticated, upload.single('editimage'), SignupController.postEditUser);
//solicitar abogado de remplazo
router.post('/solicitud-abogado-reemplazo', LoginController.isAuthenticated, BufeteUserController.postSolicitudAbogadoReemplazo);
//olvide mi contraseña
const forgotPasswordController = require('../Controller/forgotPasswordController');
router.get('/forgot-password', forgotPasswordController.getForgotPassword);
router.post('/forgot-password', forgotPasswordController.postForgotPassword);
router.get('/reset-password', forgotPasswordController.getResetPassword);
router.post('/reset-password', forgotPasswordController.postResetPassword);

module.exports = router;
