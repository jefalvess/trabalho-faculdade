const cron = require("node-cron");

const { executarJOB } = require("./models/models");

// Função para o primeiro job
const job1 = (bot) => {
  cron.schedule(
    "* 8-23 * * *",
    () => {
      executarJOB(bot);
    },
    {
      scheduled: true,
      timezone: "America/Sao_Paulo",
    }
  );
};

// Função para o segundo job
const job2 = (bot) => {
  cron.schedule("* * * * * *", async () => {
    console.log("Job 2 executado diariamente à meia-noite");
  });
};

// Função para chamar todos os jobs
const callJobs = (bot) => {
  job1(bot);
  job2(bot);
};

module.exports = callJobs;
