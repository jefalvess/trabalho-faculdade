require("dotenv").config();
const redis = require('redis');

// Crie uma nova instância do cliente Redis usando a URL completa
const client = redis.createClient({
  url: process.env.URL_REDIS,
  socket: {
    tls: false, // Ativa a conexão segura (TLS/SSL)
    rejectUnauthorized: false // Permite certificados autoassinados, ajuste conforme necessário
  }
});

// Manipuladores de eventos
client .on('error', err => console.log('Redis Client Error', err))
.connect();
// client.flushDb();

module.exports = client;
