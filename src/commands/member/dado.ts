import { general } from "../../configuration/general";
import { ICommand } from "../../interfaces/ICommand";

const command: ICommand = {
  name: "dado",
  description: "Rolar um dado de 6 lados",
  commands: ["dado"],
  usage: `${general.PREFIX}dado`,
  handle: async (data) => {
    const numeroRandom = Math.floor(Math.random() * 6) + 1;
    await data.sendReact("🎲");
    return await data.sendReply(`🎲 Caiu em: ${numeroRandom}`);
  },
};

export default command;
