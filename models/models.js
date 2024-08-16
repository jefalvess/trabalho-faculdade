require("dotenv").config();
const calculadora = require("./calculadora");
const redis = require("./redisClient");
const readAndLogHtmlFile = require("./buscarOLDS");
const fetchAndSaveHtml = require("./criarHTML");
const WEBHOOK_URL = `${process.env.URL}/bot${process.env.BOT_TOKEN}`;

async function excluirMensagens(bot, listaAtual) {
  try {
    let cursor = '0';
    let keys = [];
    do {
      const reply = await redis.scan(cursor);
      keys = reply['keys']
    } while (cursor !== '0');
    for (const key of keys) {
      if (listaAtual.indexOf(key) === -1) { 
        try {
          const value = await redis.get(key);
          const data = value.split("--")
          let message_id = parseInt(data[0])
          let chatId = parseInt(data[1]);
          chatId = -chatId;
          await bot.telegram.deleteMessage(chatId, message_id);
          await redis.del(key);
        } catch (err) {
          console.error(`Erro ao obter o valor para a chave ${key}:`, err);
        }
    }
    }
  } catch (err) {
    console.error("Erro ao buscar e processar entradas do cache:", err);
  }
}

async function getStringFromCache(key, chatId) {
  try {
    const chatIdString = String(chatId); // Converter chatId para string
    const fullKey = `cache-${chatIdString}:${key}`; // Prefixo de chave com chatId e key
    const value = await redis.get(fullKey); // Obter o valor diretamente
    return value === null ? false : value;
  } catch (err) {
    console.error("Erro ao buscar string do cache:", err);
    return false;
  }
}

async function cacheString(key, value, chatId) {
  try {
    const chatIdString = String(chatId); // Converter chatId para string
    const fullKey = `cache-${chatIdString}:${key}`; // Prefixo de chave com chatId e key
    const ttl = 28800; // 8 horas em segundos
    await redis.set(fullKey, value, "EX", ttl);
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

async function readAndLogMessages(mensagens, bot, chatId) {
  return new Promise((resolve, reject) => {
    try {
      let index = 0;
      let keysAtualmente = [];

      const intervalId = setInterval(async () => {
        if (index < mensagens.length) {
          let oldGanha = await calculadora(
            mensagens[index]["old1"],
            mensagens[index]["old2"],
            mensagens[index]["ganho"]
          );
          let string = `Data do jogo: ${mensagens[index]["data"]}\nJogo: ${mensagens[index]["jogo"]} | ${mensagens[index]["modalidade"]}\n\nAposte: (${mensagens[index].bet1}) ${mensagens[index]["fazer1"]} -> ${mensagens[index]["old1"]}\n\nAposte: (${mensagens[index]["bet2"]}) ${mensagens[index]["fazer2"]} -> ${mensagens[index]["old2"]}\n\n\n${oldGanha}\n\n `;

          let key = `${mensagens[index]["bet1"]})-${mensagens[index]["fazer1"]} ${mensagens[index]["ganho"]}`;
          keysAtualmente.push(Buffer.from(key).toString("base64"));
          
          if (
            (await getStringFromCache(Buffer.from(key).toString("base64"), chatId)) ===
            false
          ) {
            const sentMessage = await bot.telegram.sendMessage(chatId, string);
            const messageId = sentMessage.message_id;
            await cacheString(Buffer.from(key).toString("base64"), `${String(messageId)}-${chatId}`, chatId);
          }
          index++;
        } else {
          clearInterval(intervalId);
          resolve(keysAtualmente); // Retorna as chaves processadas
        }
      }, 1000 * 2);

      if (process.env.ENV === "prod") {
        const chatId2 = parseInt(-4279611369);
        bot.telegram.sendMessage(chatId2, `PROCESSADO COM SUCESSO`);
      } else {
        console.log("PROCESSADO COM SUCESSO");
      }
    } catch (error) {
      console.log("erro ao enviar dados");
      reject(error); // Rejeita a Promise em caso de erro
    }
  });
}

async function grupoPrivadoExecutar(bot) {
  try {
    const url = process.env.URL_GRUPO_PRIVADO;
    const fileName = "index1.html"
    await fetchAndSaveHtml(url, fileName);
    const mensagens = await readAndLogHtmlFile(fileName);
    const chatId = parseInt(process.env.GRUPO_ID);
    const keys = await readAndLogMessages(mensagens, bot, chatId);
    await excluirMensagens(bot, keys)
  } catch (error) {
    console.log(error);
  }
}

async function grupoVendaExecutar(bot) {
  try {
    const url = process.env.URL_GRUPO_VENDA;
    const fileName = "index2.html"
    await fetchAndSaveHtml(url, fileName);
    const mensagens = await readAndLogHtmlFile(fileName);
    const chatId = parseInt(process.env.GRUPO_ID_VENDA);
    const keys = await readAndLogMessages(mensagens, bot, chatId);
    await excluirMensagens(bot, keys)
  } catch (error) {
    console.log(error);
  }
}


async function grupoFreeExecutar(bot) {
  try {
    const fileName = "index2.html"
    const mensagens = await readAndLogHtmlFile(fileName);
    const chatId = parseInt(process.env.GRUPO_ID_FREE);
    await readAndLogMessages(mensagens, bot, chatId);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  setWebhook,
  getWebhookInfo,
  getCurrentTime,
  grupoPrivadoExecutar,
  grupoVendaExecutar,
  grupoFreeExecutar,
};
