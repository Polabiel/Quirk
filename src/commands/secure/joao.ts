import { general } from "../../configuration/general";
import { ICommand } from "../../interfaces/ICommand";

const command: ICommand = {
  name: "João",
  description: "João envia uma imagem ou video aleatório do joão",
  commands: ["joao", "joão","jao","jão"],
  usage: `${general.PREFIX}joao`,
  handle: async () => {
    console.log("Comando executado!");
  }
};

export default command;