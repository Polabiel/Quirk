import { isJidGroup } from "baileys";
import { general } from "../../configuration/general";
import { InvalidParameterError } from "../../errors/InvalidParameterError";
import { WarningError } from "../../errors/WarningError";
import { ICommand } from "../../interfaces/ICommand";
import { getOllamaResults } from "../../services/gpt";

const command: ICommand = {
  name: "Quirk-3",
  description: "Comando da IA do Quirk",
  commands: [general.BOT_NAME.toLowerCase(), "gpt", "chat", "quirk-gpt"],
  usage: `${general.PREFIX}${general.BOT_NAME} ${general.BOT_NAME} o que é a vida?`,
  handle: async (data) => {
    await data.sendWaitReact();
    if (!data.argsJoined || data.argsJoined.length < 10)
      throw new InvalidParameterError(
        "Você precisa informar uma pergunta com mais de 10 caracteres"
      );

    const remoteJid = data.remoteJid ?? "";
    const isGroupSecure = general.GROUP_SECURE.includes(remoteJid);
    const isHostNumber = general.NUMBERS_HOSTS.includes(remoteJid);
    const secured = isGroupSecure || isHostNumber;
    const responseText = await getOllamaResults(data.argsJoined, secured)

    if (!responseText)
      throw new WarningError("Não foi possível obter uma resposta da IA");

    await data.sendSuccessReply(responseText);
  }
};

export default command;
