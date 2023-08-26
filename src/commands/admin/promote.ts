import { general } from "../../configuration/general";
import { Forbidden } from "../../errors/Forbidden";
import { InvalidParameterError } from "../../errors/InvalidParameterError";
import { ICommand } from "../../interfaces/ICommand";

const command: ICommand = {
  name: "Promote",
  description: "promover um usuário ou mais usuários do grupo",
  commands: ["promote", "promover"],
  usage: `${general.PREFIX}promover @numero1 | @numero2`,
  handle: async (data) => {
    if (!data.args[0]) {
      throw new InvalidParameterError("Você precisa mencionar um usuário!");
    }

    const userList = data.args.map((number) => {
      if (number.startsWith("@")) {
        number = number.slice(1);
      }
      return {
        id: `${number}@s.whatsapp.net`,
      };
    });

    try {
      for (const element of userList) {
        await data.bot!.groupParticipantsUpdate(
          data.remoteJid!,
          [element.id],
          "promote"
        );
      }
    } catch (error: any) {
      if (error.message === "not-authorized")
        throw new Forbidden("Você não tem permissão para banir este usuário!");
      return await data.sendWarningReply(
        `Não foi possível promover o(s) usuário(s)!\n Você deve usar o comando assim *${general.PREFIX}promover @numero1 | @numero2*`
      );
    }
    return data.sendSuccessReply("Usuário(s) promovido(s) com sucesso!");
  },
};

export default command;
