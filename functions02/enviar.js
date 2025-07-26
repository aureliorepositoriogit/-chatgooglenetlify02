const https = require('https');

exports.handler = async (event, context) => {
  // Configurar CORS para permitir Google Sites
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Manejar preflight OPTIONS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS OK' })
    };
  }

  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    
    console.log('📨 Mensaje recibido desde Google Sites:', data);

    // Validar datos mínimos
    if (!data.message || !data.sender) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Faltan datos requeridos' })
      };
    }

    // Configurar Pusher
    const pusherData = {
      appId: '1914107',
      key: '46e53dfe6f8d93182aaa',
      secret: process.env.PUSHER_SECRET || 'tu-pusher-secret-aqui',
      cluster: 'us2'
    };

    // Datos a enviar via Pusher
    const messageData = {
      sender: data.sender,
      message: data.message,
      clientId: data.clientId,
      userAgent: data.userAgent,
      location: data.location,
      timestamp: data.timestamp || new Date().toISOString(),
      messageId: data.messageId,
      fromGoogleSites: data.fromGoogleSites || false
    };

    // Enviar a Pusher
    const pusherPayload = JSON.stringify({
      name: 'chatbidireccion',
      channel: 'chataurelio',
      data: JSON.stringify(messageData)
    });

    const pusherOptions = {
      hostname: 'api-us2.pusherapp.com',
      port: 443,
      path: `/apps/${pusherData.appId}/events`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(pusherPayload),
        'X-Pusher-Key': pusherData.key,
        'X-Pusher-Secret': pusherData.secret
      }
    };

    // Promesa para manejar la request a Pusher
    const pusherRequest = new Promise((resolve, reject) => {
      const req = https.request(pusherOptions, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(body);
          } else {
            reject(new Error(`Pusher error: ${res.statusCode} ${body}`));
          }
        });
      });

      req.on('error', reject);
      req.write(pusherPayload);
      req.end();
    });

    await pusherRequest;

    // Aquí puedes agregar lógica para GPT si es necesario
    // ...

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Mensaje enviado correctamente',
        clientId: data.clientId
      })
    };

  } catch (error) {
    console.error('❌ Error en función Netlify:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Error interno del servidor',
        details: error.message 
      })
    };
  }
};