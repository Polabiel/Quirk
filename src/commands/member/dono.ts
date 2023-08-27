import { general } from "../../configuration/general";
import { ICommand } from "../../interfaces/ICommand";
import { ownerMessage } from "../../utils/messages";

const command: ICommand = {
  name: "Informações do dono",
  description: "Esse comando mostra as informações do criador do bot",
  commands: ["dono", "info", "owner", "criador", "desenvolvedor"],
  usage: `${general.PREFIX}dono`,
  handle: async (data) => {
    await data.sendReact("👤");
    return await data.sendText(await ownerMessage());
  },
};

export default command;
