import { general } from "../../configuration/general";
import { ICommand } from "../../interfaces/ICommand";

const command: ICommand = {
  name: "João",
  description: "João envia uma imagem ou video aleatório do joão",
  commands: ["joao", "joão", "jao", "jão"],
  usage: `${general.PREFIX}joao`,
  handle: async (data) => {
    if (Math.random() < 0.5) {
      await data.sendImageFromFile(
        "https://telegra.ph/file/ab47cfb86938bcb9dcd8b.jpg"
      );
      return;
    }
    await data.sendImageFromFile(
      "https://telegra.ph/file/9e78cfbac221acd3e889c.png"
    );
  },
};

export default command;
