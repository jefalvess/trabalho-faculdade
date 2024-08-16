const cron = require("node-cron");
const { grupoPrivadoExecutar, grupoVendaExecutar, grupoFreeExecutar } = require("./models/models");
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
    "15 * 8-23 * * *",
    () => {
      grupoVendaExecutar(bot);
    },
    {
      scheduled: true,
      timezone: "America/Sao_Paulo",
    }
  );
};

const job3 = (bot) => {
  cron.schedule(
    "30 * 18-19 * * *",
    () => {
      grupoFreeExecutar(bot);
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
  job3(bot);
};

module.exports = callJobs;
