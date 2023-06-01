const Caso = require('../Model/casos');
require('dotenv').config();
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const chat = async (req, res) => {
  const userMessage = req.body.message;
  const user = req.user;
  const casoId = req.params.id; // Obtén el ID del caso de la URL

  if (!user) {
    console.error("Error: el objeto user no está definido");
    return res.status(500).json({ message: "Error al obtener información del usuario." });
  }

  try {
    // Busca el caso específico asociado al usuario
    const caso = await Caso.findOne({ _id: casoId, cliente: user._id });

    if (!caso) {
      console.error("Error: el caso no fue encontrado o no está asociado al usuario");
      return res.status(404).json({ message: "Caso no encontrado." });
    }

    // Crea el contexto con la información del usuario y el caso
    let context = `Usuario: ${user.username}\nNombre: ${user.nombres} ${user.apellidos}\nCorreo: ${user.email}\n`;
    context += `el nombre de mi Caso es: ${caso.nombrecaso}\n esta es la Descripcion de mi Caso: ${caso.descripcion}\nahora cuando te pregunte acerca del avance o te pida consejos te basras en esto Observaciones: ${caso.observaciones.join(', ')}\n`;
    context += `Mensaje: ${userMessage}`;

    const openai = new OpenAIApi(configuration);
    const response = await openai.createCompletion({
      model: "text-davinci-002",
      prompt: context,
      max_tokens: 200,
      n: 1,
      stop: null,
      temperature: 0.8,
    });

    const generatedMessage = response.data.choices[0].text;
    res.json({ message: generatedMessage });
  } catch (error) {
    console.error("Error en la API de OpenAI:", error);
    res.status(500).json({ message: "Error al generar la respuesta." });
  }
};


module.exports = { chat };
