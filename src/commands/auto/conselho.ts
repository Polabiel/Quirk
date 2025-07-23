import { general } from "../../configuration/general";
import { ICommand } from "../../interfaces/ICommand";
import { getOllamaResults } from "../../services/gpt";

const command: ICommand = {
  name: "conselho",
  description: "Dê um conselho aleatório, sábio ou hilário.",
  commands: [],
  usage: ``,
  handle: async ({ sendLogOwner, bot, remoteJid }) => {
    try {
      const iaResponse = await getOllamaResults(
        "Dê um conselho aleatório, sábio ou hilário para um grupo de WhatsApp. Responda apenas com o conselho, sem explicações ou comentários extras.",
        general.NUMBERS_HOSTS.includes(remoteJid!) || general.GROUP_SECURE.includes(remoteJid!),
        undefined,
        remoteJid!
      );
      if (!iaResponse || iaResponse.length < 5) {
        return;
      }
      await bot.sendMessage(remoteJid!, {
        text: `💡 Conselho do grupo:\n\n${iaResponse}`
      });
    } catch (err: any) {
      await sendLogOwner("❌ Erro ao gerar conselho pela IA: " + (err.message || err));
    }
  },
};

export default command;
