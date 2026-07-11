/**
 * Evolution API - Setup Simples
 * Roda em Railway/Render/Replit
 * Conecta WhatsApp ao n8n via webhooks
 */

const express = require('express');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// Configurações
const PORT = process.env.PORT || 3000;
const WEBHOOK_URL = process.env.WEBHOOK_URL; // URL do seu n8n webhook
const WEBHOOK_KEY = process.env.WEBHOOK_KEY; // Chave de segurança (opcional)

// Pasta pra salvar sessão do WhatsApp
const SESSION_PATH = './whatsapp-session';

console.log('🚀 Evolution API iniciando...');
console.log(`📱 Webhook URL: ${WEBHOOK_URL}`);

// ============================================
// CLIENTE WHATSAPP
// ============================================

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: SESSION_PATH,
  }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
});

// QR Code pra autenticação
client.on('qr', (qr) => {
  console.log('\n📲 QR CODE GERADO - Escaneie com seu WhatsApp:\n');
  qrcode.generate(qr, { small: true });
  console.log('\n✅ Após escanear, aguarde a conexão...\n');
});

// Conectado
client.on('ready', () => {
  console.log('✅ WhatsApp conectado com sucesso!');
});

// Desconectado
client.on('disconnected', (reason) => {
  console.log('❌ WhatsApp desconectado:', reason);
});

// ============================================
// RECEBER MENSAGENS
// ============================================

client.on('message', async (message) => {
  // Ignora mensagens do grupo e de mídia
  if (message.from.includes('@g.us') || message.type !== 'chat') {
    return;
  }

  const senderPhone = message.from.replace('@c.us', '');
  const messageText = message.body;
  const timestamp = new Date().toISOString();

  console.log(`\n📨 Mensagem de ${senderPhone}:`);
  console.log(`   "${messageText}"\n`);

  try {
    // Envia pra n8n via webhook
    await axios.post(WEBHOOK_URL, {
      phone: senderPhone,
      message: messageText,
      timestamp: timestamp,
      messageId: message.id._serialized,
    });

    console.log(`✅ Enviado para n8n`);
  } catch (error) {
    console.error('❌ Erro ao enviar para n8n:', error.message);
  }
});

// ============================================
// ENDPOINTS HTTP
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    whatsapp_connected: client.info ? true : false,
  });
});

// Endpoint pra receber respostas do n8n e enviar pro WhatsApp
app.post('/send-message', async (req, res) => {
  try {
    const { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({ error: 'phone e message são obrigatórios' });
    }

    // Formata o número pro WhatsApp (remove caracteres especiais)
    const formattedPhone = phone.replace(/\D/g, '');
    const whatsappId = `${formattedPhone}@c.us`;

    // Envia mensagem
    await client.sendMessage(whatsappId, message);

    console.log(`\n✉️  Resposta enviada para ${phone}:`);
    console.log(`   "${message}"\n`);

    res.json({
      success: true,
      phone: phone,
      message: message,
    });
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error.message);
    res.status(500).json({
      error: 'Falha ao enviar mensagem',
      details: error.message,
    });
  }
});

// Endpoint pra status
app.get('/status', (req, res) => {
  res.json({
    connected: client.info ? true : false,
    info: client.info || null,
  });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
  console.log(`\n🌐 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📍 Endpoint de saída: POST /send-message`);
  console.log(`💚 Health check: GET /health\n`);
});

client.initialize();
