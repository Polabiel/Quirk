import { general } from "../../configuration/general";
import { InvalidParameterError } from "../../errors/InvalidParameterError";
import { ICommand } from "../../interfaces/ICommand";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const command: ICommand = {
  name: "Configurar token",
  description: "Comando para configurar o Token enviado",
  commands: [
    "token",
    "configurar-token",
    "set-token",
    "setar-token",
    "token-set",
  ],
  usage: `${general.PREFIX}token <token>`,
  handle: async (data) => {
    await data.sendWaitReact();
    if (data.args[0] && data.isGroup) {

      const updatedGroup = await prisma.group.updateMany({
        where: {
          number: data.remoteJid!,
        },
        data: {
          TOKEN_OPEANAI: data.args[0]!,
        },
      });

      if (updatedGroup) {
        return await data.sendSuccessReply("Token configurado com sucesso!");
      } else {
        return await data.sendErrorReply(
          "Erro ao configurar o token. Grupo não encontrado."
        );
      }
    } else if (!data.isGroup) {
      return await data.sendWarningReply(
        "Este comando só pode ser executado em grupos!"
      );
    } else if (!data.args[0]) {
      throw new InvalidParameterError("Você precisa me enviar um token!");
    }
  },
};

export default command;
