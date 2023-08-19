import { ICommand } from "../../interfaces/ICommand";
import simsimi from "../../services/simsimi";

const command: ICommand = {
  name: "Simsimi",
  description: "Comando para conversar com o bot",
  commands: [],
  usage: ``,
  handle: async (data) => {
    const responseText = await simsimi(data.fullMessage!);

    await data.sendText(responseText, false);
  },
};

export default command;
