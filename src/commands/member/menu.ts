import { general } from "../../configuration/general";
import { ICommand } from "../../interfaces/ICommand";
import { menuMessage } from "../../utils/messages";

const command: ICommand = {
  name: "menu",
  description: "Menu do bot",
  commands: ["menu", "cmd", "comandos", "commands", "ajuda", "help", "comando"],
  usage: `${general.PREFIX}menu`,
  handle: async (data) => {
    for (const host of general.GROUP_SECURE) {
      if (data.remoteJid?.includes(host)) {
        return await data.sendSuccessReply(await menuMessage(true));
      }
    }
    return await data.sendSuccessReply(await menuMessage(false));
  },
};

export default command;
