const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const { Schema } = mongoose;

const userSchema = new Schema({
  nombres: { type: String,required: true,unique: false},
  apellidos: { type: String,required: true,unique: false },
  username: { type: String, required: true, unique: true },
  ci: { type: String, required: true, unique: true },
  direccion: { type: String,required: true, unique:false},
  rol: String,
  fechanac: Date,
  phone: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  estado:{type:Boolean, default: true},
  password: String,
  image: String,
  emailVerificationToken: String,
  resetPasswordToken: String,
    resetPasswordExpires: Date,
  //rol o el nombre que le vayan a poner: Int o bool no se cuántos tipos van a haber
  emailVerified: { type: Boolean, default: false },
  seekingReplacementLawyer: { type: Boolean, default: false }
  
});

userSchema.methods.encryptPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

userSchema.methods.comparePassword = async function (password) {
  const isMatch = await bcrypt.compare(password, this.password);
  return isMatch;
};

userSchema.pre('save', async function (next) {
  if (this.isModified('password') || this.isNew) {
    try {
        // Comprueba si la contraseña ya está encriptada
        if (!this.password.startsWith('$2b$')) {
            this.password = await this.encryptPassword(this.password);
        }
        next();
    } catch (error) {
        next(error);
    }
} else {
    next();
}
});

// Eliminar el índice único del campo nombres
userSchema.index({ nombres: 1 }, { unique: false });

module.exports = mongoose.model('User', userSchema);
