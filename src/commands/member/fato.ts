import { WASocket, proto } from "baileys";
import PrismaSingleton from "../../utils/PrismaSingleton";
import { DangerError } from "../../errors/DangerError";
import { WarningError } from "../../errors/WarningError";
import { ICommand } from "../../interfaces/ICommand";
import { general } from "../../configuration/general";

const command: ICommand = {
  name: "fato",
  description: "Mostra fatos do banco ou adiciona um novo fato se informado.",
  commands: ["fato", "fatos", "facts", "fact"],
  usage: `${general.PREFIX}${general.BOT_NAME} ${general.BOT_NAME} o que é a vida?`,
  handle: async ({ args, bot, baileysMessage }) => {
    const prisma = PrismaSingleton.getInstance();
    const remoteJid = baileysMessage.key.remoteJid ?? "";
    const isGroupSecure = general.GROUP_SECURE.includes(remoteJid);
    const isHostNumber = general.NUMBERS_HOSTS.includes(remoteJid);
    const hasPermission = isGroupSecure || isHostNumber;

    if (!hasPermission) {
      throw new WarningError("❌ Você não tem permissão para usar este comando aqui.");
    }

    try {
      if (args && args.length > 0) {
        const novoFato = args.join(" ");
        await prisma.fatos.create({ data: { fato: novoFato } });
        return bot.sendMessage(
          remoteJid,
          {
            text:
              `✨ Fato adicionado com sucesso!\n\n` +
              `📝 ${novoFato}`
          }
        );
      } else {
        const fatos = await prisma.fatos.findMany({ take: 5, orderBy: { id: "desc" } });
        if (fatos.length === 0) {
          throw new WarningError("Nenhum fato cadastrado ainda.");
        }
        const lista = fatos.map((f: any, i: number) => `• ${f.fato}`).join("\n");
        return bot.sendMessage(
          remoteJid,
          {
            text:
              `🧠 Fatos mais recentes:\n\n${lista}`
          }
        );
      }
    } catch (err: any) {
      const msg = err instanceof DangerError || err instanceof WarningError
        ? err.message
        : `❌ Erro inesperado: ${err.message || err}`;
      return bot.sendMessage(remoteJid, { text: msg });
    }
  }
};

export default command;