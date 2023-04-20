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

exports.postLogin = (req, res, next) => {
    passport.authenticate('local', { successRedirect: '/index', failureRedirect: '/', failureFlash: true })(req, res, next);
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
