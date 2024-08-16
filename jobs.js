const cron = require("node-cron");
const { grupoPrivadoExecutar, grupoVendaExecutar } = require("./models/models");
const job1 = (bot) => {
  cron.schedule(
    "* 8-23 * * *",
    () => {
      grupoPrivadoExecutar(bot);
    },
    {
      scheduled: true,
      timezone: "America/Sao_Paulo",
    }
  );
};

const job2 = (bot) => {
  cron.schedule(
    "30 * * * * *",
    () => {
      grupoVendaExecutar(bot);
    },
    {
      scheduled: true,
      timezone: "America/Sao_Paulo",
    }
  );
};

const callJobs = (bot) => {
  job1(bot);
  job2(bot);
};

module.exports = callJobs;
