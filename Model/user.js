const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const { Schema } = mongoose;

const userSchema = new Schema({
    nombres: {type:String,required:true,unique:true},
    apellidos: {type:String,required:true,unique:true},
    username: {type:String,required:true,unique:true},
    ci: {type:String,required:true,unique:true},
    direccion: {type:String,required:true},
    rol: String,
    fechanac: Date,
    phone: {type:String,required:true,unique:true},
    email: {type:String,required:true,unique:true},
    password: String,
    image: String,
    emailVerificationToken: String,
    emailVerified: { type: Boolean, default: false },
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

module.exports = mongoose.model('User', userSchema);
