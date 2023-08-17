import { general } from "../configuration/general";
import { ICommand } from "../interfaces/ICommand";

const command: ICommand = {
  name: "Nome do comando",
  description: "Template de comando",
  commands: ["template"],
  usage: `${general.PREFIX}template`,
  handle: async (data) => {
    console.log("Comando executado!", { ...data });
  },
};

export default command;
