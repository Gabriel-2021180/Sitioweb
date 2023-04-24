const User = require('../Model/user'); // Asegúrate de que la ruta sea correcta
const { validationResult } = require('express-validator');
const passport = require('passport');
const { RateLimiterMemory } = require('rate-limiter-flexible');

// LoginController.js


exports.getLogin = (req, res) => {
    const disableInputs = req.rateLimiterRes ? true : false;
    const remainingTime = req.rateLimiterRes && Math.ceil(req.rateLimiterRes.msBeforeNext / 1000);
    res.render('login', { error: req.flash('error'), disableInputs, remainingTime });
};

exports.postLogin = async (req, res, next) => {
    const { username } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user) {
            req.flash('error_msg', 'Ocurrió un error al iniciar sesión. Por favor, inténtalo de nuevo.');
            return res.redirect('/');
        }

        if (user && !user.emailVerified) {
            req.flash('error_msg', 'Por favor verifica tu correo electrónico antes de iniciar sesión.');
            return res.redirect('/');
        }

        // Autenticar al usuario
        passport.authenticate('local', {
            successRedirect: '/index',
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

exports.getLogout = (req, res) => {
    req.logout();
    res.redirect('/');
};

exports.getIndex = (req, res) => {
    res.render('index');
};

exports.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
};
