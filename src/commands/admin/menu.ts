import { general } from "../../configuration/general";
import { ICommand } from "../../interfaces/ICommand";
import { menuAdminMessage } from "../../utils/messages";

const command: ICommand = {
  name: "Menu de admintradores",
  description: "Menu de comandos de admin",
  commands: [
    "menustaff",
    "staff",
    "staffmenu",
    "adminmenu",
    "menuadmin",
    "admin",
  ],
  usage: `${general.PREFIX}menuadmin`,
  handle: async (data) => {
    await data.sendReply(await menuAdminMessage());

  },
};

export default command;
