const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatLog = document.getElementById('chat-log');

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const mensaje = chatInput.value;
  agregarMensaje('Tú', mensaje);
  chatInput.value = '';

  const respuesta = await enviarMensaje(mensaje);
  agregarMensaje('Bot', respuesta);
});

function agregarMensaje(remitente, texto) {
  const div = document.createElement('div');
  div.textContent = `${remitente}: ${texto}`;
  chatLog.appendChild(div);
}

async function enviarMensaje(mensaje) {
  const res = await fetch('/.netlify/functions/enviar', {
    method: 'POST',
    body: JSON.stringify({ mensaje })
  });
  const data = await res.json();
  return data.respuesta;
}