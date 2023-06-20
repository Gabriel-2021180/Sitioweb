const User = require('../Model/user'); // Asegúrate de que la ruta sea correcta
const { validationResult } = require('express-validator');
const passport = require('passport');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const Notification=require('../Model/notificaciones')
// LoginController.js


exports.getLogin = (req, res) => {
    const disableInputs = req.rateLimiterRes ? true : false;
    const remainingTime = req.rateLimiterRes && Math.ceil(req.rateLimiterRes.msBeforeNext / 1000);
    res.render('login', { error: req.flash('error'), disableInputs, remainingTime });
};

exports.postLogin = async (req, res, next) => {
    const { username } = req.body;

    try {
        // Buscar por nombre de usuario o correo electrónico
        const user = await User.findOne({ 
            $or: [
                { username: username, estado: true },
                { email: username, estado: true }
            ]
        });

        if (!user) {
            req.flash('error_msg', 'Ocurrió un error al iniciar sesión. Por favor, inténtalo de nuevo.');
            return res.redirect('/');
        }

        if (user && !user.emailVerified) {
            req.flash('error_msg', 'Por favor verifica tu correo electrónico antes de iniciar sesión.');
            return res.redirect('/');
        }

        // Comprueba si el usuario tiene alguna notificación pendiente
        const notification = await Notification.findOne({ user: user._id, read: false });

        // Autenticar al usuario
        passport.authenticate('local', {
            successRedirect: notification ? '/abogados' : '/index',
            failureRedirect: '/',
            failureFlash: true,
        })(req, res, next);
    } catch (err) {
        console.error('Error al verificar el correo electrónico:', err);
        req.flash('error_msg', 'Ocurrió un error al iniciar sesión. Por favor, inténtalo de nuevo.');
        res.redirect('/');
    }
};



  
exports.getIndex = (req, res) => {
    res.render('index');
};


  

/*exports.getIndex = (req, res) => {
    res.render('index');
};*/

exports.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
};
  
exports.getLogout = (req, res) => {
    req.session.destroy(); // Destruye la sesión del usuario
    res.redirect('/index');
  };