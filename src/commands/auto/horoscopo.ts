import { general } from "../../configuration/general";
import { ICommand } from "../../interfaces/ICommand";
import { getOllamaResults } from "../../services/gpt";

const command: ICommand = {
  name: "horoscopo",
  description: "Gera um horóscopo fictício para o dia.",
  commands: [],
  usage: ``,
  handle: async ({ sendLogOwner, bot, remoteJid }) => {
    try {
      const iaResponse = await getOllamaResults(
        "Gere um horóscopo fictício, divertido e curto para um grupo de WhatsApp. Responda apenas com o horóscopo, sem explicações ou comentários extras.",
        general.NUMBERS_HOSTS.includes(remoteJid!) || general.GROUP_SECURE.includes(remoteJid!),
        undefined,
        remoteJid!
      );
      if (!iaResponse || iaResponse.length < 5) {
        return;
      }
      await bot.sendMessage(remoteJid!, {
        text: `🔮 Horóscopo do grupo:\n\n${iaResponse}`
      });
    } catch (err: any) {
      await sendLogOwner("❌ Erro ao gerar horóscopo pela IA: " + (err.message || err));
    }
  },
};

export default command;
