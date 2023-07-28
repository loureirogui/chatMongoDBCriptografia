// Desenvolvido por Guilherme Loureiro
// Pequeno projeto de chat em tempo real com conexão com mongodb e criptografia aes para desenvolvimento pessoal

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;
const crypto = require('crypto');
const mongoose = require('mongoose');
const config = require('./config');

// Constantes de conexão e criptografia de mensagens
const { mongodb, encryption } = config;
const { connectionString } = mongodb;
const { key, algorithm } = encryption;

// Estabelece a Conexão com o MongoDB
mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Definine a coleção de mensagens
const messageSchema = new mongoose.Schema({
  iv: {
    type: String,
    required: true,
  },
  encryptedMessage: {
    type: String,
    required: true,
  },
});


const Message = mongoose.model('Message', messageSchema);

// Função de criptografar a mensagem
function encryptMessage(message, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'hex'), iv);
  let encrypted = cipher.update(message, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    iv: iv.toString('hex'),
    encryptedMessage: encrypted,
  };
}

// Função de descriptografar a mensagem
function decryptMessage(encryptedMessage, iv, key) {
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encryptedMessage, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', async (socket) => {
  console.log('Novo Usuário conectado');

  try {
    // Recuperar e enviar mensagens armazenadas no banco de dados
    const messages = await Message.find({});
    if (messages) {
      for (const message of messages) {
        const decryptedMessage = decryptMessage(message.encryptedMessage, message.iv, key);
        socket.emit('chat message', decryptedMessage);
      }
    }
  } catch (err) {
    console.error('Erro ao buscar mensagens:', err);
  }

  socket.on('chat message', async (message) => {
    console.log('Mensagem recebida:', message);

    try {
      // Criptografar e armazenar mensagem no banco de dados
      const encryptedData = encryptMessage(message, key);
      const newMessage = new Message({
        iv: encryptedData.iv,
        encryptedMessage: encryptedData.encryptedMessage,
      });

      await newMessage.save();
      console.log('Mensagem criptografada armazenada com sucesso.');
    } catch (err) {
      console.error('Erro ao salvar a mensagem:', err);
    }

    io.emit('chat message', message);
  });

  socket.on('disconnect', () => {
    console.log('Usuário desconectado');
  });
});

http.listen(PORT, () => {
  console.log(`Servidor funcionando em 192.168.3.34:${PORT}`);
});