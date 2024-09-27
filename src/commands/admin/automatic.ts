import { general } from "../../configuration/general";
import { InvalidParameterError } from "../../errors/InvalidParameterError";
import { ICommand } from "../../interfaces/ICommand";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const command: ICommand = {
  name: "Modo automatico",
  description: "Esse comando desativa/ativar o modo automatico do bot",
  commands: ["modoautomatico", "auto", "automatico"],
  usage: `${general.PREFIX}modoautomatico <on/off>`,
  handle: async (data) => {
    await data.sendWaitReact();
    if (
      data.args[0] === "on" ||
      data.args[0] === "ativar" ||
      data.args[0] === "ligar" ||
      data.args[0] === "enable"
    ) {
      await prisma.group.update({
        where: {
          number: data.remoteJid!,
        },
        data: {
          enable: true,
        },
      });
      return data.sendSuccessReply("Modo automatico ativado com sucesso!");
    } else if (
      data.args[0] === "off" ||
      data.args[0] === "desativar" ||
      data.args[0] === "disable"
    ) {
      await prisma.group.update({
        where: {
          number: data.remoteJid!,
        },
        data: {
          enable: false,
        },
      });
      return data.sendSuccessReply("Modo automatico desativado com sucesso!");
    }
    else {
      throw new InvalidParameterError("Você colocar um parâmetro *ativado* ou *desativado*");
    }
  },
};

export default command;
