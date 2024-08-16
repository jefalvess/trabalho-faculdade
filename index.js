require("dotenv").config();
const { Telegraf } = require("telegraf");
const {
  setWebhook,
  getWebhookInfo,
  getCurrentTime,
} = require("./models/models");
const { message } = require("telegraf/filters");
const express = require("express");
const chatId = parseInt(process.env.GRUPO_ID);
const chatId2 = parseInt(-4279611369);
const port = process.env.PORT || 3000;
const bot = new Telegraf(process.env.BOT_TOKEN);
const callJobs = require("./jobs");

const app = express();

app.use(express.json());

app.get("/work", (req, res) => {
  res.send("Servidor Express está funcionando!");
});

app.get("/test", async (req, res) => {
  const currentTime1 = await getCurrentTime();
  bot.telegram.sendMessage(chatId2, `ROUTE WORK ${currentTime1}`);
  res.send("Servidor Express está funcionando!");
});

app.post(`/bot${process.env.BOT_TOKEN}`, (req, res) => {
  bot.handleUpdate(req.body);
  res.sendStatus(200);
});

bot.on(message("text"), async (ctx) => {
  console.log(ctx.message.text.toLowerCase());
  if (
    ctx.message.chat.id === chatId &&
    ctx.message.text.toLowerCase() === "buscar"
  ) {
    ctx.reply("Estou trabalhando corretamente");
  }
});

if (process.env.ENV === "prod") {
  (async function () {
    console.log("Iniciando configuração do webhook...");
    await setWebhook();
    await getWebhookInfo();
  })();
}

function startBot() {
  bot.launch((err) => {
    if (err) {
      console.error("Erro ao iniciar o bot:", err);
    } else {
      console.log("Bot iniciado com sucesso");
      callJobs(bot);
    }
  });
}

startBot();

app.listen(port, () => {
  console.log(`Servidor Express está rodando na porta ${port}`);
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
