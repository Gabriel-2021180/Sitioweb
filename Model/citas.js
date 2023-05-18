const mongoose = require('mongoose');
const { Schema } = mongoose;

const citaSchema = new Schema({
    motivo: {type:String,required:true},
    estado: {type:String,required:true},
    fecha: {type:Date,required:true},
    hora: {type:String,required:true},
});

module.exports = mongoose.model('Cita', citaSchema);
