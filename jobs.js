const cron = require("node-cron");
const {
  grupoPrivadoExecutar,
  grupoVendaExecutar,
  grupoFreeExecutar,
} = require("./models/models");

const jobGrupoPrivado = (bot) => {
  cron.schedule(
    "15 * 8-23 * * *",
    () => {
      grupoPrivadoExecutar(bot);
    },
    {
      scheduled: true,
      timezone: "America/Sao_Paulo",
    }
  );
};

const jobGrupoVendaAndFree = async (bot) => {
  grupoVendaExecutar(bot);
  cron.schedule(
    "45 * 8-23 * * *",
    async () => {
      await grupoVendaExecutar(bot);
      grupoFreeExecutar(bot)
    },
    {
      scheduled: true,
      timezone: "America/Sao_Paulo",
    }
  );
};

const callJobs = (bot) => {
  jobGrupoPrivado(bot);
  jobGrupoVendaAndFree(bot)
};

module.exports = callJobs;
