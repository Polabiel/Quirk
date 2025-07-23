import { general } from "../../configuration/general";
import { ICommand } from "../../interfaces/ICommand";
import { getOllamaResults } from "../../services/gpt";

const command: ICommand = {
  name: "curiosidade",
  description: "Compartilha uma curiosidade aleatória e interessante.",
  commands: [],
  usage: ``,
  handle: async ({ sendLogOwner, bot, remoteJid }) => {
    try {
      const iaResponse = await getOllamaResults(
        "Compartilhe uma curiosidade aleatória, interessante e divertida para um grupo de WhatsApp. Responda apenas com a curiosidade, sem explicações ou comentários extras.",
        general.NUMBERS_HOSTS.includes(remoteJid!) || general.GROUP_SECURE.includes(remoteJid!),
        undefined,
        remoteJid!
      );
      if (!iaResponse || iaResponse.length < 5) {
        return;
      }
      await bot.sendMessage(remoteJid!, {
        text: `🧐 Curiosidade do grupo:\n\n${iaResponse}`
      });
    } catch (err: any) {
      await sendLogOwner("❌ Erro ao gerar curiosidade pela IA: " + (err.message || err));
    }
  },
};

export default command;
