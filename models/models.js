require("dotenv").config();
const calculadora = require("./calculadora");
const redis = require("./redisClient");
const readAndLogHtmlFile = require("./buscarOLDS");
const fetchAndSaveHtml = require("./criarHTML");
const WEBHOOK_URL = `${process.env.URL}/bot${process.env.BOT_TOKEN}`;
const chatId2 = parseInt(-4279611369);

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

// Função para configurar o webhook
async function setWebhook(bot) {
  try {
    const response = await bot.telegram.setWebhook(WEBHOOK_URL);
    console.log("Webhook configurado com sucesso:", response);
  } catch (error) {
    console.error("Erro ao configurar o webhook:", error);
  }
}

// Função para obter informações do webhook
async function getWebhookInfo(bot) {
  try {
    const info = await bot.telegram.getWebhookInfo();
    console.log("Webhook Info:", info);
  } catch (error) {
    console.error("Erro ao obter informações do webhook:", error);
  }
}

async function readAndLogMessages(mensagens, bot) {
  try {
    let index = 0;
    const intervalId = setInterval(async () => {
      if (index < mensagens.length) {
        let oldGanha = await calculadora(
          mensagens[index]["old1"],
          mensagens[index]["old2"],
          mensagens[index]["ganho"]
        );
        let string = `Data do jogo: ${mensagens[index]["data"]}\nJogo: ${mensagens[index]["jogo"]} | ${mensagens[index]["modalidade"]}\n\nAposte: (${mensagens[index].bet1}) ${mensagens[index]["fazer1"]} -> ${mensagens[index]["old1"]}\n\nAposte: (${mensagens[index]["bet2"]}) ${mensagens[index]["fazer2"]} -> ${mensagens[index]["old2"]}\n\n\n${oldGanha}\n\n `;

        let key = `${mensagens[index]["bet1"]})-${mensagens[index]["fazer1"]} ${mensagens[index]["ganho"]}`;
        if (
          (await getStringFromCache(Buffer.from(key).toString("base64"))) ==
          false
        ) {
          bot.telegram.sendMessage(chatId, string);
          cacheString(Buffer.from(key).toString("base64"), "string");
        }
        index++;
      } else {
        clearInterval(intervalId);
      }
    }, 1000 * 3);

    if (process.env.ENV === "prod") {
      const chatId2 = parseInt(-4279611369);
      bot.telegram.sendMessage(chatId2, `PROCESSADO COM SUCESSO`);
    } else {
      console.log("PROCESSADO COM SUCESSO");
    }
  } catch (error) {
    console.log("erro ao enviar dados");
  }
}

async function executarJOB(bot) {
  try {
    await fetchAndSaveHtml();
    const mensagens = await readAndLogHtmlFile();
    await readAndLogMessages(mensagens, bot);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  setWebhook,
  getWebhookInfo,
  getStringFromCache,
  cacheString,
  getCurrentTime,
  readAndLogMessages,
  executarJOB,
};
