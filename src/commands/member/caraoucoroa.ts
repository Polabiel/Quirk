import { general } from "../../configuration/general";
import { ICommand } from "../../interfaces/ICommand";

const command: ICommand = {
  name: "caraoucoroa",
  description: "Jogar cara ou coroa",
  commands: ["cara", "caraoucoroa", "coroa", "coinflip", "flip"],
  usage: `${general.PREFIX}caraoucoroa`,
  handle: async (data) => {
    const numeroRandom = Math.floor(Math.random() * 2);
    let resultado;

    if (numeroRandom === 0) {
      resultado = "Cara";
      await data.sendReact("🌕");
    } else {
      resultado = "Coroa";
      await data.sendReact("🌑");
    }

    await data.sendReply(`Resultado: ${resultado}`);
  },
};

export default command;
