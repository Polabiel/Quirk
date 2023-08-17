import { general } from "../../configuration/general";
import { ICommand } from "../../interfaces/ICommand";

const command: ICommand = {
  name: "Bot",
  description: "Converse com o Bot",
  commands: ["bot"],
  usage: `${general.PREFIX}bot`,
  handle: async (data) => {
    await data.sendSuccessReply("Olá, eu sou o bot!");
  }
};

export default command;