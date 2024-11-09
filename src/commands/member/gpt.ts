import { general } from "../../configuration/general";
import { InvalidParameterError } from "../../errors/InvalidParameterError";
import { WarningError } from "../../errors/WarningError";
import { ICommand } from "../../interfaces/ICommand";
import { getOpenAIResults } from "../../services/gpt";

const command: ICommand = {
  name: "GPT-3",
  description: "Comando da IA do Quirk",
  commands: [general.BOT_NAME, "gpt", "chat", "chat-gpt"],
  usage: `${general.PREFIX}${general.BOT_NAME} ${general.BOT_NAME} o que é a vida?`,
  handle: async (data) => {
    await data.sendWaitReact();
    if(!data.argsJoined || data.argsJoined.length < 10) throw new InvalidParameterError("Você precisa informar uma pergunta com mais de 10 caracteres");
    const responseText = await getOpenAIResults(data.argsJoined);

    if(!responseText) throw new WarningError("Não foi possível obter uma resposta da IA");

    await data.sendSuccessReply(responseText.result);
  },
};

export default command;
