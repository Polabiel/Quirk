import { general } from "../../configuration/general";
import { ICommand } from "../../interfaces/ICommand";
import simsimi from "../../services/simsimi";

const command: ICommand = {
  name: "Simsimi",
  description: "Comando para conversar com o bot",
  commands: ["simsimi","bot",`${general.BOT_NAME as string}`],
  usage: ``,
  handle: async (data) => {
    const responseText = await simsimi(data.fullMessage!);

    await data.sendSuccessReply(responseText);
  },
};

export default command;
