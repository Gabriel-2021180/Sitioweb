const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const { Schema } = mongoose;

const userSchema = new Schema({
    nombres:String,
    apellidos:String,
    username:String,
    ci:String,
    direccion:String,
    rol:String,
    fechanac:Date,
    phone:String,
    email: String,
    password: String,
    image:String
});

userSchema.methods.encryptPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

userSchema.methods.comparePassword = async function(password) {
  const isMatch = await bcrypt.compare(password, this.password);
  return isMatch;
};

// Asegúrate de llamar a `encryptPassword` antes de guardar un usuario en la base de datos.
// Por ejemplo, si estás utilizando Mongoose, puedes hacerlo en un middleware 'pre-save':

userSchema.pre('save', async function(next) {
  if (this.isModified('password') || this.isNew) {
    try {
      this.password = await this.encryptPassword(this.password);
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});
module.exports = mongoose.model('user', userSchema);
