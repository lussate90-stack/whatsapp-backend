require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

app.get('/api/meta/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('Code não recebido');

  try {
    const response = await axios.get(
      'https://graph.facebook.com/v19.0/oauth/access_token',
      {
        params: {
          client_id: process.env.META_APP_ID,
          client_secret: process.env.META_APP_SECRET,
          redirect_uri: process.env.META_REDIRECT_URI,
          code
        }
      }
    );

    const accessToken = response.data.access_token;
    console.log('ACCESS TOKEN DO USUÁRIO:', accessToken);

    res.send('WhatsApp conectado com sucesso. Pode fechar esta página.');
  } catch (error) {
    res.status(500).send('Erro ao conectar com a Meta');
  }
});

app.post('/api/webhook/whatsapp', (req, res) => {
  console.log('Mensagem recebida:', JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

app.get('/api/webhook/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Servidor rodando na porta', PORT);
});
