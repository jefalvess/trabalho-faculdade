require("dotenv").config();
const { Telegraf } = require("telegraf");
const cron = require("node-cron");
const readAndLogHtmlFile = require("./models/buscarOLDS");
const fetchAndSaveHtml = require("./models/criarHTML");
const redis = require("./models/redisClient");

const bot = new Telegraf(process.env.BOT_TOKEN);
const chatId = process.env.GRUPO_ID;

async function getStringFromCache(key) {
  try {
    const value = await redis.get(key);
    if (value === null) {
      return false;
    } else {
      return value;
    }
  } catch (err) {
    console.log(err)
    return false;
  }
}

async function cacheString(key, value) {
  try {
    if(process.env.ENV === "prod"){ 
      const ttl = 28800; // 8 horas em segundos
      await redis.set(key, value, 'EX', ttl);
    }
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
        if (
          (await getStringFromCache(Buffer.from(key).toString("base64"))) ==
          false
        ) {
          await bot.telegram.sendMessage(chatId, string);
          cacheString(Buffer.from(key).toString("base64"), "string");
        }
        index++;
      } else {
        clearInterval(intervalId);
      }
    }, 1000 * 2);
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

// roda a cada 30 segundo avisando que esta funcionando
if (process.env.ENV === "prod") {
  cron.schedule("* * * * *", async () => {
    // -4279611369 - prod e local memso id de sala'
    const currentTime = await getCurrentTime();
    const chatId2 = parseInt(-4279611369);
    bot.telegram.sendMessage(
      chatId2,
      `RODEI O JOB ${currentTime}`
    );
  });
}

// roda a cada minuto esperando dados
cron.schedule("* * * * *", async () => {
  executarJOB();
});

bot.on("text", async (ctx) => {
  if (
    ctx.message.chat.id.toString() === chatId &&
    ctx.message.text.toLowerCase() === "buscar"
  ) {
    ctx.reply("To trabalhando corretamente");
  }
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
