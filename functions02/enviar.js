const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const { mensaje } = JSON.parse(event.body);

  // Ejemplo básico de integración con OpenAI GPT
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: mensaje }]
    })
  });

  const data = await response.json();
  const respuesta = data.choices?.[0]?.message?.content || "Error en la respuesta";

  return {
    statusCode: 200,
    body: JSON.stringify({ respuesta })
  };
};