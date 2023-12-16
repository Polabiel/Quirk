import { general } from "../../configuration/general";
import { InvalidParameterError } from "../../errors/InvalidParameterError";
import { WarningError } from "../../errors/WarningError";
import { ICommand } from "../../interfaces/ICommand";
import gpt from "../../services/gpt";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const command: ICommand = {
  name: "GPT-3",
  description: "Comando para perguntar algo para o GPT-3",
  commands: ["gpt", general.BOT_NAME, "chat", "chat-gpt"],
  usage: `${general.PREFIX}gpt ${general.BOT_NAME} o que é a vida?`,
  handle: async (data) => {
    await data.sendWaitReact();
    if (data.isGroup) {
      const group = await prisma.group.findUnique({
        where: {
          number: data.remoteJid!,
        },
      });
      if (!group?.TOKEN_OPEANAI)
        throw new WarningError(
          "Você precisa de um token para usar o GPT\n\nPara obter um token, acesse: https://platform.openai.com/account/api-keys e envie o comando /token <token>"
        );

      if (!data.args[0]) {
        throw new InvalidParameterError("Você precisa me perguntar algo!");
      }

      const responseText = await gpt(data.args[0], group.TOKEN_OPEANAI);

      await data.sendSuccessReply(responseText);
    }
    return await data.sendWarningReply(
      "Este comando só pode ser executado em grupos!"
    );
  },
};

export default command;
