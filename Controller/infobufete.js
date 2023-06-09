const BufeteUser = require('../Model/bufeteUser');
const SolicitudAbogado = require('../Model/SolicitudAbogado');
const Caso = require('../Model/casos');

exports.getAbogados = async (req, res) => {
  try {
    const user = req.user;
    const seekingReplacementLawyer = user && user.seekingReplacementLawyer ? user.seekingReplacementLawyer : false;

    const abogados = await BufeteUser.find({}).select('-password -emailVerified -direccion -ci');
    res.render('abogados', { abogados, user, seekingReplacementLawyer }); 
  } catch (error) {
    console.error('Error al obtener los datos de los abogados:', error);
    res.status(500).json({ error: 'Ocurrió un error al obtener los datos de los abogados' });
  }
};

exports.getPerfilAbogado = async (req, res) => {
  try {
    const abogado = await BufeteUser.findById(req.params.id).select('-password');
    const usuarioAutenticado = req.isAuthenticated();
    const user=req.user;

    // Comprueba si el usuario está definido antes de intentar acceder a sus propiedades
    const seekingReplacementLawyer = user && user.seekingReplacementLawyer ? user.seekingReplacementLawyer : false;


    // Busca el caso asociado con el usuario solo si el usuario está definido
    let tipoDeCaso = null;
    if (user) {
      const caso = await Caso.findOne({ cliente: user._id });

      // Si el caso existe, obtén el tipo de caso
      tipoDeCaso = caso ? caso.tipo : null;
    }

    res.render('abogadoProfile', { abogado, usuarioAutenticado, user, seekingReplacementLawyer, tipoDeCaso });
  } catch (error) {
    console.error('Error al obtener los datos del abogado:', error);
    res.status(500).json({ error: 'Ocurrió un error al obtener los datos del abogado' });
  }
};


exports.postSolicitudAbogado = async (req, res) => {
  try {
    const { abogadoId, mensaje,tipo } = req.body;
    const clienteId = req.user._id;

    // Verifica si ya existe una solicitud de este cliente a este abogado
    const solicitudExistente = await SolicitudAbogado.findOne({ abogado: abogadoId, cliente: clienteId });
    if (solicitudExistente) {
      req.flash('error_msg', 'Ya has enviado una solicitud a este abogado. Por favor, espera su respuesta.');
      return res.redirect('/abogados');
    }

    const solicitud = new SolicitudAbogado({
      abogado: abogadoId,
      cliente: clienteId,
      mensaje,
      tipo,
      estado: 'pendiente',
      tipoSolicitud:'nuevo',
    });

    await solicitud.save();

    res.redirect(`/abogados`);
  } catch (error) {
    console.error('Error al enviar la solicitud de abogado:', error);
    req.flash('error_msg', 'Ocurrió un error al enviar la solicitud de abogado. Por favor, inténtalo de nuevo.');
    res.redirect('/abogados');
  }
};

  exports.postSolicitudAbogadoReemplazo = async (req, res) => {
    try {
      const { abogadoId, mensaje, tipo } = req.body;
      const clienteId = req.user._id;
  
      const solicitud = new SolicitudAbogado({
        abogado: abogadoId,
        cliente: clienteId,
        mensaje,
        tipo,
        estado: 'pendiente',
        tipoSolicitud:'atiende un caso a medias',
      });
  
      await solicitud.save();
  
      // Actualiza el campo seekingReplacementLawyer del usuario a false
      const usuario = await Usuarios.findById(clienteId);
      usuario.seekingReplacementLawyer = false;
      await usuario.save();
  
      res.redirect(`/abogados`);
    } catch (error) {
      console.error('Error al enviar la solicitud de abogado de reemplazo:', error);
      req.flash('error_msg', 'Ocurrió un error al enviar la solicitud de abogado de reemplazo. Por favor, inténtalo de nuevo.');
      res.redirect('/abogados');
    }
  };
  