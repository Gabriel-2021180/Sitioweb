require('dotenv').config();
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const chat = async (req, res) => {
  const userMessage = req.body.message;
  const user = req.user;

  if (!user) {
    console.error("Error: el objeto user no está definido");
    return res.status(500).json({ message: "Error al obtener información del usuario." });
  }

  const context = `Usuario: ${user.username}\nNombre: ${user.nombres} ${user.apellidos}\nCorreo: ${user.email}\nMensaje: ${userMessage}`;

  try {
    const openai = new OpenAIApi(configuration);
    const response = await openai.createCompletion({
      model: "text-davinci-002",
      prompt: context,
      max_tokens: 150,
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
