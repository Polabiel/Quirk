import { general } from "../../configuration/general";
import { InvalidParameterError } from "../../errors/InvalidParameterError";
import { ICommand } from "../../interfaces/ICommand";
import { gpt2 } from "../../services/gpt";

const command: ICommand = {
  name: "GPT-3",
  description: "Comando para perguntar algo para o GPT-3",
  commands: ["gpt", general.BOT_NAME],
  usage: `${general.PREFIX}gpt ${general.BOT_NAME} o que é a vida?`,
  handle: async (data) => {
    if (data.isGroup) {
      await data.sendWaitReact();

      if (!data.args[0]) {
        throw new InvalidParameterError("Você precisa me perguntar algo!");
      }

      const responseText = await gpt2(data.args[0]);

      await data.sendSuccessReply(responseText);
    }
    await data.sendWarningReply(
      "Este comando só pode ser executado em grupos!"
    );
  },
};

export default command;
