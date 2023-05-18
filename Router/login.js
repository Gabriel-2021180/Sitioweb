  const express = require('express');
  const passport = require('passport');
  const router = express.Router();
  const LoginController = require('../Controller/LoginController');
  const SignupController = require('../Controller/SignUpController');
  const ProfileController = require('../Controller/ProfileController');
  const { body } = require('express-validator');
  const { RateLimiterMemory } = require('rate-limiter-flexible');
  const multer = require('multer');
  const emailTransporter = require('../configs/emailConfig');
  const citasController = require('../Controller/CitasController');


  const User = require('../Model/user'); // Asegúrate de que la ruta sea correcta
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
      res.redirect('/');
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
  const ChatController = require('../Controller/ChatController');
  // Asegúrate de que el usuario esté autenticado antes de acceder al chat
router.get('/chat', LoginController.isAuthenticated, (req, res) => {
  res.render('chat', { user: req.user });
});
//router.post('/chat', ChatController.chat);
//router.post('/citas', citasController.postCita);
//router.get('/citas', LoginController.isAuthenticated,citasController.getCitas);
//router.get('/citasJSON', citasController.getCitasJSON);

module.exports = router;
