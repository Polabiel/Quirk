import { general } from "../../configuration/general";
import { Forbidden } from "../../errors/Forbidden";
import { InvalidParameterError } from "../../errors/InvalidParameterError";
import { WarningError } from "../../errors/WarningError";
import { ICommand } from "../../interfaces/ICommand";

const command: ICommand = {
  name: "Banimento",
  description: "Bani um usuário ou mais usuários do grupo",
  commands: ["ban", "banir", "banimento", "kick", "kickar", "expulsar"],
  usage: `${general.PREFIX}ban @numero1 | @numero2`,
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
        if (element.id.startsWith(general.NUMBER_BOT)) {
          throw new InvalidParameterError("Não posso me banir!");
        }
        await data.bot!.groupParticipantsUpdate(
          data.remoteJid!,
          [element.id],
          "remove"
        );
      }
    } catch (error: any) {
      if (error.message === "not-authorized") throw new Forbidden("Você não tem permissão para banir este usuário!");
      throw new WarningError("Não foi possível banir o(s) usuário(s)!");
    }
    return data.sendSuccessReply("Usuário(s) banido(s) com sucesso!");
  },
};

export default command;
