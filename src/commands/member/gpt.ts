import { isJidGroup } from "@whiskeysockets/baileys";
import { general } from "../../configuration/general";
import { InvalidParameterError } from "../../errors/InvalidParameterError";
import { WarningError } from "../../errors/WarningError";
import { ICommand } from "../../interfaces/ICommand";
import gpt, { getOpenAIResults } from "../../services/gpt";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const command: ICommand = {
  name: "GPT-3",
  description: "Comando para perguntar algo para o GPT-3",
  commands: ["gpt", general.BOT_NAME, "chat", "chat-gpt"],
  usage: `${general.PREFIX}gpt ${general.BOT_NAME} o que é a vida?`,
  handle: async (data) => {
    await data.sendWaitReact();
    if (
      general.NUMBERS_HOSTS.includes(
        isJidGroup(data.remoteJid!) ? data.participant! : data.remoteJid!
      )
    ) {
      const responseText = await getOpenAIResults(data.args[0]);

      return await data.sendSuccessReply(responseText.result);
    }

    if (data.isGroup) {
      const responseText = await getOpenAIResults(data.args[0]);

      await data.sendSuccessReply(responseText);
    } else {
      throw new WarningError("Este comando só pode ser executado em grupos!");
    }
  },
};

export default command;
