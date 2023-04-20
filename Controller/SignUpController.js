const User = require('../Model/user'); // Asegúrate de que la ruta sea correcta
const { validationResult } = require('express-validator');
const passport = require('passport');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const { Storage } = require('@google-cloud/storage')
const storage = new Storage({ keyFilename: "googleimage.json" })
const moment = require('moment');

exports.getSignup = (req, res) => {
    res.render('signup');
};

exports.postSignup = async (req, res) => {
    const { nombres, apellidos, username, ci, direccion, fechanac, phone, email, password } = req.body;
    // Validación manual
    let errors = [];
    if (!req.body.nombres || req.body.nombres.trim() === '') {
        errors.push({ msg: 'El campo nombres no puede estar vacío.' });
    }
    if (!req.body.apellidos || req.body.apellidos.trim() === '') {
        errors.push({ msg: 'El campo apellidos no puede estar vacío.' });
    }
    if (!req.body.username || req.body.username.trim() === '') {
        errors.push({ msg: 'El nombre de usuario no puede estar vacío.' });
    }
    if (!req.body.ci || req.body.ci.trim() === '') {
        errors.push({ msg: 'El campo CI no puede estar vacío.' });
    }
    if (!req.body.direccion || req.body.direccion.trim() === '') {
        errors.push({ msg: 'El campo dirección no puede estar vacío.' });
    }
    if (!req.body.fechanac || req.body.fechanac.trim() === '') {
        errors.push({ msg: 'El campo fecha de nacimiento no puede estar vacío.' });
    }
    if (!req.body.phone || req.body.phone.trim() === '') {
        errors.push({ msg: 'El campo teléfono no puede estar vacío.' });
    }
    if (!req.body.email || req.body.email.trim() === '') {
        errors.push({ msg: 'El campo email no puede estar vacío.' });
    }
    if (!req.body.password || req.body.password.trim() === '') {
        errors.push({ msg: 'La contraseña no puede estar vacía.' });
    }

    if (errors.length > 0) {
        req.flash('error_msg', 'Hay errores en la entrada.');
        return res.status(422).render('signup', { errors });
    }
    
    const usuario = "user";
    const url = await uploadFile(req.file);
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
    });

    try {
        await newUser.save();
        req.flash('success_msg', 'Te has registrado exitosamente');
        res.redirect('/index');
    } catch (error) {
        console.error('Error al guardar el usuario:', error);
        req.flash('error_msg', 'Error al guardar el usuario.');
        return res.status(500).render('signup');
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
