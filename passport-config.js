const LocalStrategy = require('passport-local').Strategy;
const User = require('./Model/user'); // Asegúrate de que la ruta sea correcta

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'username' }, async (username, password, done) => {
          try {
            // Buscar usuario por nombre de usuario o correo electrónico
            const user = await User.findOne({ 
                $or: [
                    { username: username },
                    { email: username }
                ]
            });
      
            if (!user) {
              console.log('Usuario no encontrado');
              return done(null, false, { message: 'Usuario no encontrado' });
            }
      
            const isMatch = await user.comparePassword(password);
      
            if (isMatch) {
              console.log('Contraseña correcta');
              return done(null, user);
            } else {
              console.log('Contraseña incorrecta'); 
              return done(null, false, { message: 'Contraseña incorrecta' });
            }
          } catch (error) {
            console.error('Error en la estrategia local:', error);
            return done(error);
          }
        })
      );
      

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};
