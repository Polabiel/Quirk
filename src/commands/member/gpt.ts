import { general } from "../../configuration/general";
import { InvalidParameterError } from "../../errors/InvalidParameterError";
import { ICommand } from "../../interfaces/ICommand";
import gpt from "../../services/gpt";

const command: ICommand = {
  name: "Informações do dono",
  description: "Esse comando mostra as informações do criador do bot",
  commands: ["dono", "info", "owner", "criador", "desenvolvedor"],
  usage: `${general.PREFIX}dono`,
  handle: async (data) => {
    await data.sendWaitReact();

    if (!data.args[0]) {
      throw new InvalidParameterError("Você precisa me perguntar algo!");
    }

    const responseText = await gpt(data.args[0]);

    await data.sendSuccessReply(responseText);
  },
};

export default command;
