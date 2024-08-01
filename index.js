const { Telegraf } = require("telegraf");
const cron = require("node-cron");
const readAndLogHtmlFile = require("./models/buscarOLDS");
const fetchAndSaveHtml = require("./models/criarHTML");
require("dotenv").config();
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 * 8 });

const bot = new Telegraf(process.env.BOT_TOKEN);
const chatId = process.env.GRUPO_ID;

async function addToCache(string) {
  cache.set(string, true);
}

async function isInCache(string) {
  return await cache.has(string);
}

async function readAndLogMessages(mensagens) {
  try {
    let index = 0;
    const intervalId = setInterval(async () => {
      if (index < mensagens.length) {
        let string = `\nGanho: ${mensagens[index]['ganho']}\nJogo: ${mensagens[index]['jogo']} | ${mensagens[index]["modalidade"]} | data : ${mensagens[index]['data']}\nAposte: (${mensagens[index].bet1}) ${mensagens[index]['fazer1']} -> ${mensagens[index]['old1']}\nAposte: (${mensagens[index]['bet2']}) ${mensagens[index]['fazer2']} -> ${mensagens[index]['old2']}\nhá ${mensagens[index]["descoberta"]}`;
        let key = `${mensagens[index]['bet1']}) ${mensagens[index]['fazer1']}`
        if (!(await isInCache(key))) {
          await bot.telegram.sendMessage(chatId, string);
          addToCache(key);
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

async function buscarTUDO(mensagens) {
  try {
    let index = 0;
    const intervalId = setInterval(async () => {
      if (index < mensagens.length) {
        console.log(mensagens[index])
        let string = `\nGanho: ${mensagens[index].ganho}\nJogo: ${mensagens[index].jogo} | ${mensagens[index]["modalidade"]} | data : ${mensagens[index].data}\nAposte: (${mensagens[index].bet1}) ${mensagens[index].fazer1} -> ${mensagens[index].old1}\nAposte: (${mensagens[index].bet2}) ${mensagens[index].fazer2} -> ${mensagens[index].old2}\nhá ${mensagens[index]["descoberta"]}`;
        await bot.telegram.sendMessage(chatId, string);
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
  } catch(error) { 
    console.log(error)
  }
}

async function executarJOB() {
  try { 
  await fetchAndSaveHtml();
  const mensagens = await readAndLogHtmlFile();
  await readAndLogMessages(mensagens);
  } catch(error) { 
    console.log(error)
  }
}

cron.schedule("0 * * * *", async () => {
  const currentTime = await getCurrentTime();
  bot.telegram.sendMessage(chatId, `ESTOU FUNCIONANDO CORRETAMENTE ${currentTime}`);
});

cron.schedule("* * * * *", async () => {
  executarJOB();
});

bot.on("text", async (ctx) => {
  if (
    ctx.message.chat.id.toString() === chatId &&
    ctx.message.text.toLowerCase() === "buscar"
  ) {
    ctx.reply("To trabalhando corretamente");
    buscarTUDO(await readAndLogHtmlFile())
  }
});

bot.telegram.sendMessage(chatId, `OLA EU FUI INICIADO COM SUCESSO \n \n \n \n \n \n \n \n \n.`);

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
