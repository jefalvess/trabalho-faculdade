const cron = require("node-cron");
const {
  grupoPrivadoExecutar,
  grupoVendaExecutar,
  grupoFreeExecutar,
} = require("./models/models");

const jobSegundo1 = (bot) => {
  cron.schedule(
    "1 * 8-23 * * *",
    () => {
      grupoPrivadoExecutar(bot);
    },
    {
      scheduled: true,
      timezone: "America/Sao_Paulo",
    }
  );
};

const jobSegundo30 = (bot) => {
  cron.schedule(
    "30 * 8-23 * * *",
    () => {
      grupoPrivadoExecutar(bot);
    },
    {
      scheduled: true,
      timezone: "America/Sao_Paulo",
    }
  );
};

const jobSegundo15 = (bot) => {
  grupoVendaExecutar(bot);
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

const jobSegundo45 = (bot) => {
  cron.schedule(
    "45 * 8-23 * * *",
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
  jobSegundo1(bot);
  jobSegundo15(bot)
  jobSegundo30(bot);
  jobSegundo45(bot)
};

module.exports = callJobs;
