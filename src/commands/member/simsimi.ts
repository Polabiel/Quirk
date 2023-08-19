import { general } from "../../configuration/general";
import { InvalidParameterError } from "../../errors/InvalidParameterError";
import { ICommand } from "../../interfaces/ICommand";
import simsimi from "../../services/simsimi";

const command: ICommand = {
  name: "Simsimi",
  description: "Comando para conversar com o bot",
  commands: ["simsimi", "bot", `${general.BOT_NAME}`],
  usage: `${general.PREFIX}bot eae ${general.BOT_NAME} tudo bem?`,
  handle: async (data) => {
    if (!data.args[0]) {
      throw new InvalidParameterError("Você precisa enviar uma mensagem!");
    }
    const responseText = await simsimi(data.fullMessage!);

    await data.sendSuccessReply(responseText);
  },
};

export default command;
