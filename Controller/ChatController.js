const Caso = require('../Model/casos');
require('dotenv').config();
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const chat = async (req, res) => {
  const userMessage = req.body.message;
  const user = req.user;
  const casoId = req.params.id;

  if (!user) {
    console.error("Error: el objeto user no está definido");
    return res.status(500).json({ message: "Error al obtener información del usuario." });
  }

  try {
    const caso = await Caso.findOne({ _id: casoId, cliente: user._id });

    if (!caso) {
      console.error("Error: el caso no fue encontrado o no está asociado al usuario");
      return res.status(404).json({ message: "Caso no encontrado." });
    }

    let context = `Eres un abogado asistente de inteligencia artificial y estas aquí para ayudarme, soy ${user.nombres} ${user.apellidos}.\n`;
    context += `El caso se llama "${caso.nombrecaso}" y aquí está su descripción: ${caso.descripcion}.\n`;
    context += `Hasta ahora, estas son las observaciones que se han hecho sobre mi caso:\n`;
    for (let i = 0; i < caso.observaciones.length; i++) {
      context += `- Observación ${i+1}: ${caso.observaciones[i]}\n`;
    }
    context += `Ahora te hago la siguiente pregunta: "${userMessage}"`;

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
