import { general } from "../../configuration/general";
import { ICommand } from "../../interfaces/ICommand";

const command: ICommand = {
  name: "Degugger",
  description: "Comando para Debuggar e verificar algumas coisas",
  commands: ["debugger", "debugar", "debug"],
  usage: `${general.PREFIX}debugger <args?>`,
  handle: async (data) => {
    const baileysMessage = data.baileysMessage.key.remoteJid;
    await data.sendSuccessReply(`Debugando: ${baileysMessage}`, true);
  },
};

export default command;
