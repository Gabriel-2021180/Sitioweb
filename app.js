const express = require('express');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const login = require('./Router/login');
const db = require('./db');
const email = require('../configs/emailConfig'); 

// Asegúrate de que la ruta sea correcta



const { body, validationResult } = require('express-validator');
const app = express();
require('dotenv').config();
// Configurar express
app.use(express.urlencoded({ extended: true }));


// Configurar express-session
app.use(session({
  secret: '1235asdesas',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 60 * 1000, // 30 minutos
  },
}));

// Configurar connect-flash
app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});
// Importar la configuración de Passport
require('./passport-config')(passport);

// Configurar Passport para tu aplicación Express
app.use(passport.initialize());
app.use(passport.session());



// Configurar Express
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.static('public'));

// Configurar rutas
app.use('/', login);

// Iniciar servidor
app.listen(3000, () => {
  console.log('server UP! en http://localhost:3000');
});
