import { general } from "../../configuration/general";
import { ICommand } from "../../interfaces/ICommand";

const command: ICommand = {
  name: "monkey",
  description: "Enviar um emoji de macaco aleatório",
  commands: [],
  usage: ``,
  handle: async (data) => {
    if (Math.random() < 0.03 && !data.fromMe) {
      const userNumbers = [
        "5519983578858@s.whatsapp.net",
        "5519998971730@s.whatsapp.net",
        "5519991312964@s.whatsapp.net",
        "5519998291139@s.whatsapp.net",
      ];

      if (!userNumbers) {
        throw new Error("Não foi possível encontrar os números dos usuários");
      }

      const monkeyEmoji = ["🐵", "🦍", "🦧"];
      const choiceRandom =
        monkeyEmoji[Math.floor(Math.random() * monkeyEmoji.length)];
      if (
        data.isGroup &&
        general.GROUP_SECURE.includes(data.remoteJid!) &&
        userNumbers.includes(data.participant!)
      ) {
        try {
          if (userNumbers.includes(data.participant!)) {
            await data.sendReact(choiceRandom);
          }
        } catch (error) {
          console.error(`Erro: ${error}`);
        }
      }
    }
  },
};

export default command;
