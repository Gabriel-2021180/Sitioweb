const Caso = require('../Model/casos');
const Documento = require('../Model/documentos');
const BufeteUser = require('../Model/bufeteUser')
const { Storage } = require('@google-cloud/storage');
const storage = new Storage({ keyFilename: 'googleimage.json' });
const bucketName = 'primerstorage';

// Obtener los casos del usuario
exports.getMisCasos = async (req, res) => {
  try {
    const clienteId = req.user._id; // Obtén el ID del cliente autenticado

    // Busca los casos del cliente desde la base de datos
    const casos = await Caso.find({ cliente: clienteId }).populate('abogado cliente');
    const user = req.user;
    
    // Renderiza la vista de "Mis Casos" del cliente
    res.render('mis-casos', { casos,user });
  } catch (error) {
    console.error('Error al obtener los casos del cliente:', error);
    res.status(500).json({ error: 'Ocurrió un error al obtener los casos del cliente' });
  }
};
exports.getCaso = async (req, res) => {
    const casoId = req.params.id;
  const user= req.user;
    try {
      
  
      const caso = await Caso.findById(casoId).populate('abogado cliente');
  
      // Verifica si el usuario autenticado es el mismo que el usuario asociado con el caso
      if (req.user._id.toString() !== caso.cliente._id.toString()) {
        return res.status(403).send('ey!!!!!!! lo que estas haciendo esta mal violas la confidencialidad y no puedes entrar aqui asi que porfa retirate :)');
      }
  
      const documentos = await Documento.find({ caso: casoId,estado:true });
      res.render('detalle-caso', { caso, documentos,user });
    } catch (error) {
      console.error('Error al obtener el caso:', error);
      res.status(500).json({ error: 'Ocurrió un error al obtener el caso' });
    }
  };

  exports.getDocumentoUrl = async (req, res) => {
    const { documentoId } = req.params;
    const userId = req.user._id;
  
    if (!userId) {
      return res.status(401).json({ error: 'No se proporcionó el usuario autenticado' });
    }
  
    try {
      const documento = await Documento.findById(documentoId).populate({
        path: 'caso',
        populate: {
          path: 'abogado cliente',
          select: '_id',
        },
      });
  
      if (!documento) {
        return res.status(404).json({ error: 'Documento no encontrado' });
      }
  
      const caso = documento.caso;
  
      if (!caso) {
        return res.status(404).json({ error: 'Caso no encontrado' });
      }
  
      const abogadoId = caso.abogado._id.toString();
      const clienteId = caso.cliente._id.toString();
       
       
      if (clienteId !== userId.toString()) {
        return res.status(403).json({ error: 'No tienes permiso para acceder a este documento' });
      }
  
      const documentoUrl = await storage
        .bucket(bucketName)
        .file(documento.documento)
        .getSignedUrl({
          version: 'v4',
          action: 'read',
          expires: Date.now() + 15 * 60 * 1000,
        });
  
      res.json({ url: documentoUrl[0] });
    } catch (error) {
      console.error('Error al obtener la URL del documento:', error);
      res.status(500).json({ error: 'Ocurrió un error al obtener la URL del documento' });
    }
  };

  exports.selectNewLawyer = async (req, res) => {
    try {
      const { userId, lawyerId } = req.body;
  
      // Encuentra al usuario por su ID
      const usuario = await Usuarios.findById(userId);
  
      if (!usuario) {
        return res.status(404).json({
          message: 'El usuario no fue encontrado',
        });
      }
  
      // Encuentra al nuevo abogado por su ID
      const newLawyer = await Usuarios.findById(lawyerId);
  
      if (!newLawyer || newLawyer.rol !== 'abogado') {
        return res.status(404).json({
          message: 'El nuevo abogado no fue encontrado',
        });
      }
  
      // Encuentra todos los casos del usuario que no tienen un abogado asociado
      const casos = await Caso.find({ cliente: userId, abogado: null });
  
      if (casos.length === 0) {
        return res.status(404).json({
          message: 'No se encontraron casos sin abogado para este usuario',
        });
      }
  
      // Asocia el nuevo abogado a cada caso
      for (const caso of casos) {
        caso.abogado = lawyerId;
        await caso.save();
      }
  
      // Encuentra la notificación correspondiente y márcala como leída
      const notification = await Notification.findOne({ user: userId, read: false });
      if (notification) {
        notification.read = true;
        await notification.save();
      }
  
      return res.status(200).json({
        message: 'Nuevo abogado seleccionado exitosamente',
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Error al seleccionar un nuevo abogado',
        error: error.message,
      });
    }
  };

  //SELECCIONAR OTRO ABOGADO EN CASO DE ELIMINACION:
  exports.getSelectNewLawyer = async (req, res) => {
    try {
        // Encuentra todos los abogados disponibles
        const lawyers = await User.find({ role: 'abogado' });

        // Renderiza la página de selección de nuevo abogado
        res.render('selectNewLawyer', { lawyers });
    } catch (err) {
        console.error('Error al obtener los abogados:', err);
        req.flash('error_msg', 'Ocurrió un error al obtener los abogados. Por favor, inténtalo de nuevo.');
        res.redirect('/');
    }
};