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
      grupoFreeExecutar(bot);
    },
    {
      scheduled: true,
      timezone: "America/Sao_Paulo",
    }
  );
};

const getHost = async (bot) => {
  // Configura um cron job para ser executado a cada minuto (você pode ajustar a expressão cron)
  cron.schedule(
    "*/5 * * * * *",
    async () => {
      try {
        await axios.get("https://job-ddg1.onrender.com/test");
      } catch (error) {}
    },
    {
      scheduled: true,
      timezone: "America/Sao_Paulo",
    }
  );
};

const callJobs = (bot) => {
  jobGrupoPrivado(bot);
  jobGrupoVendaAndFree(bot);
  getHost(bot);
};

module.exports = callJobs;
