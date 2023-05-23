const User = require('../Model/user');
const { validationResult } = require('express-validator');
const passport = require('passport');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const { Storage } = require('@google-cloud/storage')
const storage = new Storage({ keyFilename: "googleimage.json" })
const { check } = require('express-validator');
const moment = require('moment');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const emailValidator = require('email-validator');
const schedule = require('node-schedule'); // Importa el módulo 'node-schedule'

const emailTransporter = require('../configs/emailConfig'); 

//obteniendo el index
exports.getSignup = (req, res) => {
    res.render('signup');
};
  
//usando el metodo post para este index
exports.postSignup = async (req, res) => {
    const { nombres, apellidos, username, ci, direccion, fechanac, phone, email, password } = req.body;
    
  
    // Validación manual
    let errors = [];
  
    if (!nombres || nombres.trim() === '') {
      errors.push({ msg: 'El campo nombres no puede estar vacío.' });
    }
  
    if (!apellidos || apellidos.trim() === '') {
      errors.push({ msg: 'El campo apellidos no puede estar vacío.' });
    }
  
    if (!username || username.trim() === '') {
      errors.push({ msg: 'El nombre de usuario no puede estar vacío.' });
    }
  
    if (!ci || ci.trim() === '') {
      errors.push({ msg: 'El campo CI no puede estar vacío.' });
    }
  
    if (!direccion || direccion.trim() === '') {
      errors.push({ msg: 'El campo dirección no puede estar vacío.' });
    }
  
    if (!fechanac || fechanac.trim() === '') {
      errors.push({ msg: 'El campo fecha de nacimiento no puede estar vacío.' });
    }
  
    if (!phone || phone.trim() === '') {
      errors.push({ msg: 'El campo teléfono no puede estar vacío.' });
    }
  
    if (!email || email.trim() === '') {
      errors.push({ msg: 'El campo email no puede estar vacío.' });
    }
  
    if (!password || password.trim() === '') {
      errors.push({ msg: 'La contraseña no puede estar vacía.' });
    }
  
    if (errors.length > 0) {
      req.flash('error_msg', 'Hay errores en la entrada.');
      return res.status(422).render('signup', { errors });
    }
  
    if (!emailValidator.validate(email)) {
      errors.push({ msg: 'La dirección de correo electrónico no es válida.' });
      req.flash('error_msg', 'Hay errores en la entrada.');
      return res.status(422).render('signup', { errors });
    }
  
    // Genera un token único
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    
    // Configura el enlace de verificación y el contenido del correo electrónico
    const verificationLink = `${req.protocol}://${req.get('host')}/verify-email?token=${emailVerificationToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verificación de correo electrónico',
      html: `<p>Por favor, haz clic en el siguiente enlace para verificar tu correo electrónico: <a href="${verificationLink}">${verificationLink}</a></p>`,
    };
  
    
    // Envía el correo electrónico
    try {
      await emailTransporter.sendMail(mailOptions);
    } catch (error) {
      
      req.flash('error_msg', 'No se pudo enviar el correo electrónico de verificación. Por favor, inténtalo de nuevo.');
      return res.redirect('/signup');
    }
  
    const usuario = "user";
    const url = await uploadFile(req.file);
  
    // Guarda al usuario en la base de datos solo si el correo electrónico se envió correctamente
    const newUser = new User({
      nombres,
      apellidos,
      username,
      ci,
      direccion,
      rol: usuario,
      fechanac,
      phone,
      email,
      password,
      image: url,
      emailVerificationToken,
    });
  
    try {
      await newUser.save();
      
  
      // Programa la eliminación del usuario después de 40 minutos si no se verifica su correo electrónico
      const deleteJob = schedule.scheduleJob(Date.now() + 30 * 60 * 1000, async function () {
        const user = await User.findById(newUser._id);
        if (!user.emailVerified) {
          await User.findByIdAndDelete(newUser._id);
          console.log(`Usuario no verificado eliminado: ${user.username}`);
        }
      });
      newUser.deleteJob = deleteJob;
    } catch (error) {
      
      if (error.code === 11000) {
        const duplicatedField = Object.keys(error.keyValue)[0];
        let errorMessage;
        switch (duplicatedField) {
          case 'username':
            errorMessage = 'El nombre de usuario ya está en uso.';
            break;
          case 'ci':
            errorMessage = 'La cédula de identidad ya está registrada.';
            break;
          case 'email':
            errorMessage = 'El correo electrónico ya está registrado.';
            break;
          case 'phone':
            errorMessage = 'El número de celular ya está registrado.';
            break;
          default:
            errorMessage = 'Ocurrió un error. Por favor, inténtalo de nuevo.';
            
        }
        
        req.flash('error_msg', errorMessage);
        res.render('signup', {
          nombres: req.body.nombres,
          apellidos: req.body.apellidos,
          username: req.body.username,
          ci: req.body.ci,
          direccion: req.body.direccion,
          fechanac: req.body.fechanac,
          phone: req.body.phone,
          email: req.body.email,
        });
      } else {
        
        req.flash('error_msg', 'Ocurrió un error durante el registro. Por favor, inténtalo de nuevo.');
        res.render('signup', {
          nombres: req.body.nombres,
          apellidos: req.body.apellidos,
          username: req.body.username,
          ci: req.body.ci,
          direccion: req.body.direccion,
          fechanac: req.body.fechanac,
          phone: req.body.phone,
          email: req.body.email,
        });
      }
    }
  };

async function uploadFile(file) {
    const now = moment().format('YYYYMMDD_HHmmss');
    const bucket = storage.bucket('primerstorage');
    const fileName = `${now}_${file.originalname}`;
    const fileUpload = bucket.file(fileName);
    const stream = fileUpload.createWriteStream({
        resumable: false,
        public: true,
        metadata: {
            contentType: file.mimetype,
        },
    });

    return new Promise((resolve, reject) => {
        stream.on('error', reject);
        stream.on('finish', () => {
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
            resolve(publicUrl);
        });
        stream.end(file.buffer);
    });
}
