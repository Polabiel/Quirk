import { general } from "../../configuration/general";
import { InvalidParameterError } from "../../errors/InvalidParameterError";
import { ICommand } from "../../interfaces/ICommand";
import { SquareCloudAPI } from "@squarecloud/api";

const command: ICommand = {
  name: "SquareCloud",
  description: "Descrição do comando",
  commands: ["square", "squarecloud"],
  usage: `${general.PREFIX}square <status|restart|shutdown|logs>`,
  handle: async (data) => {
    await data.sendWaitReact();

    if (!data.args[0]) {
      throw new InvalidParameterError("Você precisa especificar um argumento");
    }

    try {
      const api = new SquareCloudAPI(process.env.API_KEY!);
      const application = await api.applications.get(process.env.BOT_ID!);

      switch (data.args[0]) {
        case "status":
          const status = await application!.getStatus();
          const uptimeDate = new Date(status?.uptimeTimestamp);
          const uptimeDurationMs = Date.now() - uptimeDate.getTime();
          const uptimeDays = Math.floor(
            uptimeDurationMs / (1000 * 60 * 60 * 24)
          );
          const uptimeHours = Math.floor(
            (uptimeDurationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const uptimeMinutes = Math.floor(
            (uptimeDurationMs % (1000 * 60 * 60)) / (1000 * 60)
          );
          const uptimeSeconds = Math.floor(
            (uptimeDurationMs % (1000 * 60)) / 1000
          );
          const uptimeString = `${uptimeDays} dias, ${uptimeHours} horas, ${uptimeMinutes} minutos e ${uptimeSeconds} segundos`;

          await data.sendSuccessReply(
            ` ━━ ${general.PREFIX_EMOJI} Status do SquareCloud do ${general.BOT_NAME} ━━ \n\n🖥 Status: ${status?.status}\n\n🌡 CPU: ${status?.cpuUsage}\n\n🧠 RAM: ${status?.ramUsage}Mb\n\n⚙ SDD: ${status?.storageUsage}\n\n⏰ Tempo de atividade: ${uptimeString}\n\n🏓 Conexão ${status?.network?.total}`
          );
          break;
        case "restart":
          application!.restart();
          await data.sendSuccessReply("Reiniciando o sistema...");
          break;
        case "shutdown":
        case "stop":
          application!.stop();
          await data.sendSuccessReply("Desligando o sistema...");
          break;
        case "logs":
        case "log":
          const logsUrl = await application!.getLogs(); // URL
          await data.sendSuccessReply(`📄 Logs: ${logsUrl}`);
          break;
        case "info":
          await data.sendSuccessReply(
            `${general.PREFIX_EMOJI} Info do SquareCloud do ${
              general.BOT_NAME
            }\n\n🆔 ID: ${application?.id}\n\n✏ Nome: ${
              application?.tag
            }\n\n🔗 URL: ${
              application!.url
            }\n\n📃 URL de Logs: ${await application!.getLogs()}\n\n📚 Linguagem: ${
              application?.lang
            }\n\n📄 Cluster: ${application?.cluster}`
          );
          break;
        default:
          const cases = [
            "status",
            "restart",
            "shutdown",
            "stop",
            "info",
            "log",
            "logs",
          ];
          const random = cases[Math.floor(Math.random() * cases.length)];
          await data.sendWarningReply(
            `Você precisa especificar um argumento válido. Exemplo: ${general.PREFIX}square ${random}`
          );
      }
    } catch (error) {
      return await data.sendErrorReply(
        "Erro ao executar o comando. Tente novamente mais tarde."
      );
    }
  },
};

export default command;
