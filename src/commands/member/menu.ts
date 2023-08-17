import { general } from "../../configuration/general";
import { ICommand } from "../../interfaces/ICommand";
import { menuMessage } from "../../utils/messages";

const command: ICommand = {
  name: "menu",
  description: "Menu do bot",
  commands: ["menu","cmd","comandos","commands","ajuda","help",],
  usage: `${general.PREFIX}menu`,
  handle: async (data) => {
    return await data.sendSuccessReply(await menuMessage());
  }
};

export default command;