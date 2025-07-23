import { general } from "../../configuration/general";
import { ICommand } from "../../interfaces/ICommand";
import { getOllamaResults } from "../../services/gpt";

const command: ICommand = {
  name: "meme",
  description: "Crie uma frase de meme personalizada para o grupo.",
  commands: [],
  usage: ``,
  handle: async ({ sendLogOwner, bot, remoteJid }) => {
    try {
      const iaResponse = await getOllamaResults(
        "Crie uma frase de meme personalizada e engraçada para um grupo de WhatsApp. Responda apenas com a frase, sem explicações ou comentários extras.",
        general.NUMBERS_HOSTS.includes(remoteJid!) || general.GROUP_SECURE.includes(remoteJid!),
        undefined,
        remoteJid!
      );
      if (!iaResponse || iaResponse.length < 5) {
        return;
      }
      await bot.sendMessage(remoteJid!, {
        text: `🤣 Meme do grupo:\n\n${iaResponse}`
      });
    } catch (err: any) {
      await sendLogOwner("❌ Erro ao gerar meme pela IA: " + (err.message || err));
    }
  },
};

export default command;
