require("dotenv").config();
const { Telegraf } = require("telegraf");
const cron = require("node-cron");
const readAndLogHtmlFile = require("./models/buscarOLDS");
const fetchAndSaveHtml = require("./models/criarHTML");
const redis = require("./models/redisClient");
const { message } = require("telegraf/filters");
const express = require("express");

const WEBHOOK_URL = `${process.env.URL}/bot${process.env.BOT_TOKEN}`;
const chatId = parseInt(process.env.GRUPO_ID);
const port = process.env.PORT || 3000;
const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

app.use(express.json());

// Função para configurar o webhook
async function setWebhook() {
  try {
    const response = await bot.telegram.setWebhook(WEBHOOK_URL);
    console.log('Webhook configurado com sucesso:', response);
  } catch (error) {
    console.error('Erro ao configurar o webhook:', error);
  }
}

// Função para obter informações do webhook
async function getWebhookInfo() {
  try {
    const info = await bot.telegram.getWebhookInfo();
    console.log('Webhook Info:', info);
  } catch (error) {
    console.error('Erro ao obter informações do webhook:', error);
  }
}

// Rota básica de teste
app.get("/work", (req, res) => {
  res.send("Servidor Express está funcionando!");
});

app.get("/test", async (req, res) => {
  const currentTime1 = await getCurrentTime();
  const chatId2 = parseInt(-4279611369);
  bot.telegram.sendMessage(chatId2, `ROUTE WORK ${currentTime1}`);
  res.send("Servidor Express está funcionando!");
});

// Rota para receber atualizações do Telegram
app.post(`/bot${process.env.BOT_TOKEN}`, (req, res) => {
  bot.handleUpdate(req.body); // Processa a atualização recebida
  res.sendStatus(200); // Envia resposta HTTP 200 OK
});

async function getStringFromCache(key) {
  try {
    const value = await redis.get(key);
    return value === null ? false : value;
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function cacheString(key, value) {
  try {
    const ttl = 28800; // 8 horas em segundos
    await redis.set(key, value, "EX", ttl);
  } catch (err) {
    console.error("Erro ao inserir string no cache:", err);
  }
}

async function readAndLogMessages(mensagens) {
  try {
    let index = 0;
    const intervalId = setInterval(async () => {
      if (index < mensagens.length) {
        let string = `\nGanho: ${mensagens[index]["ganho"]}\nJogo: ${mensagens[index]["jogo"]} | ${mensagens[index]["modalidade"]} | data : ${mensagens[index]["data"]}\nAposte: (${mensagens[index].bet1}) ${mensagens[index]["fazer1"]} -> ${mensagens[index]["old1"]}\nAposte: (${mensagens[index]["bet2"]}) ${mensagens[index]["fazer2"]} -> ${mensagens[index]["old2"]}\nhá ${mensagens[index]["descoberta"]}`;
        let key = `${mensagens[index]["bet1"]})-${mensagens[index]["fazer1"]} ${mensagens[index]["ganho"]}`;
        if (await getStringFromCache(Buffer.from(key).toString("base64")) == false) {
          await bot.telegram.sendMessage(chatId, string);
          cacheString(Buffer.from(key).toString("base64"), "string");
        }
        index++;
      } else {
        clearInterval(intervalId);
      }
    }, 1000 * 2.5);

    const chatId2 = parseInt(-4279611369);
    bot.telegram.sendMessage(chatId2, `PROCESSADO COM SUCESSO`);
  } catch (error) {
    console.log("erro ao enviar dados");
  }
}

async function getCurrentTime() {
  try {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  } catch (error) {
    console.log(error);
  }
}

async function executarJOB() {
  try {
    await fetchAndSaveHtml();
    const mensagens = await readAndLogHtmlFile();
    await readAndLogMessages(mensagens);
  } catch (error) {
    console.log(error);
  }
}

bot.on(message("text"), async (ctx) => {
  if (ctx.message.chat.id === chatId && ctx.message.text.toLowerCase() === "buscar") {
    ctx.reply("Estou trabalhando corretamente");
  }
});

// Roda a cada minuto esperando dados
cron.schedule("* * * * *", async () => {
  executarJOB();
});

// Inicializa o servidor Express
app.listen(port, () => {
  console.log(`Servidor Express está rodando na porta ${port}`);
});

// Gerencia sinais de término
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

// Configuração inicial
(async function() {
  console.log('Iniciando configuração do webhook...');
  if (process.env.ENV === "prod") {
    // Configura o webhook somente em produção
    await setWebhook();
    await getWebhookInfo();
  } else {
    // Inicializa o bot com polling em ambientes não-prod
    bot.launch().catch(console.error);
  }
})();
