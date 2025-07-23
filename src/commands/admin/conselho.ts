import { general } from "../../configuration/general";
import { DangerError } from "../../errors/DangerError";
import { WarningError } from "../../errors/WarningError";
import { ICommand } from "../../interfaces/ICommand";
import { getOllamaResults } from "../../services/gpt";
import { logger } from "../../utils/logger";

const command: ICommand = {
 name: "conselho",
 description: "Receba um conselho aleatório e engraçado gerado por IA.",
 commands: ["conselho", "advice", "dica"],
 usage: `${general.PREFIX}conselho`,
 handle: async ({ sendReply, argsJoined, remoteJid}) => {
  if (!argsJoined) return;
  
  const prompt = "Dê um conselho profundo e sério sobre o assunto em até 60 caracteres.";

  const result = await getOllamaResults(argsJoined, true, prompt, remoteJid!);

  await sendReply(result);
 },
};

export default command;
