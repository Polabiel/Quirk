import { general } from "../configuration/general";
import { ICommand } from "../interfaces/ICommand";

const command: ICommand = {
  name: "comando",
  description: "Descrição do comando",
  commands: ["comando1", "comando2"],
  usage: `${general.PREFIX}comando`,
  handle: async () => {
    console.log("Comando executado!");
  }
};

export default command;