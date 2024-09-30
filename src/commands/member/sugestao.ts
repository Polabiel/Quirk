import { isJidGroup } from "@whiskeysockets/baileys";
import { general } from "../../configuration/general";
import { InvalidParameterError } from "../../errors/InvalidParameterError";
import { ICommand } from "../../interfaces/ICommand";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const command: ICommand = {
  name: "Sugestão",
  description: `Comando para sugestão de melhorias do ${general.BOT_NAME}`,
  commands: ["sugestão", "sugestao", "sugestões", "sugestoes"],
  usage: `${general.PREFIX}token <token>`,
  handle: async (data) => {
    await data.sendWaitReact();
    if (data.args[0]) {
      const suggestion = await prisma.suggestions.create({
        data: {
          sugestao: data.args[0],
          user: {
            connectOrCreate: {
              where: {
                number: isJidGroup(data.remoteJid!)
                  ? data.participant!
                  : data.remoteJid!,
              },
              create: {
                number: isJidGroup(data.remoteJid!)
                  ? data.participant!
                  : data.remoteJid!,
                name: data.nickName!,
              },
            },
          },
        },
      });
    } else if (!data.args[0]) {
      throw new InvalidParameterError(
        "Você precisa escrever uma sugestão de melhoria!"
      );
    }
  },
};

export default command;
