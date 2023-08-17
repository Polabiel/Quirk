import { general } from "../../configuration/general";
import { ICommand } from "../../interfaces/ICommand";

const command: ICommand = {
  name: "Bot",
  description: "Converse com o Bot",
  commands: ["bot"],
  usage: `${general.PREFIX}bot`,
  handle: async () => {
    console.log("Comando executado!");
  }
};

export default command;