import { isJidGroup } from "baileys";
import { general } from "../../configuration/general";
import { InvalidParameterError } from "../../errors/InvalidParameterError";
import { WarningError } from "../../errors/WarningError";
import { ICommand } from "../../interfaces/ICommand";
import gpt from "../../services/gpt";
import PrismaSingleton from "../../utils/PrismaSingleton";

const prisma = PrismaSingleton.getInstance();

const command: ICommand = {
  name: "GPT-3",
  description: "Comando da IA do Quirk",
  commands: [general.BOT_NAME.toLowerCase(), "gpt", "chat", "chat-gpt"],
  usage: `${general.PREFIX}${general.BOT_NAME} ${general.BOT_NAME} o que é a vida?`,
  handle: async (data) => {
    if (isJidGroup(data.remoteJid!)) {
      await data.sendWaitReact();
      if (!data.argsJoined || data.argsJoined.length < 10)
        throw new InvalidParameterError(
          "Você precisa informar uma pergunta com mais de 10 caracteres"
        );

      const group = await prisma.group.findUnique({
        where: { number: data.remoteJid! },
        select: { TOKEN_OPEANAI: true },
      });

      if(!group?.TOKEN_OPEANAI) throw new WarningError("Grupo não possui token de IA configurado!");

      const responseText = await gpt(data.argsJoined, group.TOKEN_OPEANAI)

      if (!responseText)
        throw new WarningError("Não foi possível obter uma resposta da IA");

      await data.sendSuccessReply(responseText);
    }
    throw new WarningError("Este comando só pode ser usado em grupos!")
  }
};

export default command;
