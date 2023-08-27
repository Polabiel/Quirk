import { general } from "../../configuration/general";
import { InvalidParameterError } from "../../errors/InvalidParameterError";
import { ICommand } from "../../interfaces/ICommand";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const command: ICommand = {
  name: "Comunicado",
  description:
    "Esse comando envia uma mensagem para todos os grupos e contatos",
  commands: [
    "comunicado",
    "comunicar",
    "avisar",
    "anunciar",
    "anuncio",
    "anúncio",
    "anúnciar",
  ],
  usage: `${general.PREFIX}comunicado <mensagem>`,
  handle: async (data) => {
    await data.sendWaitReact();

    if (!data.args[0])
      throw new InvalidParameterError("Você precisa enviar uma mensagem");

    const groups = await prisma.group.findMany();
    const users = await prisma.user.findMany();

    for (const group of groups) {
      await data.sendTextWithRemotejid(data.args[0], group.number);
    }
    for (const user of users) {
      await data.sendTextWithRemotejid(data.args[0], user.number);
    }
    return data.sendSuccessReply("Mensagem enviada com sucesso!");
  },
};

export default command;
