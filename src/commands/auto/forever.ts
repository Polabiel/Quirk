import { ICommand } from "../../interfaces/ICommand";

const command: ICommand = {
  name: "Forever",
  description:
    "Esse comando que envia uma imagem aleatoria toda vez que o forever fala alguma coisa",
  commands: [],
  usage: ``,
  handle: async (data) => {
    if (!data.remoteJid?.startsWith("554188853723")) return;
    if (Math.random() <= 0.5) {
      await data.sendReact("🏳‍🌈");
      return;
    } else {
      await data.sendReact("🏳️‍⚧️");
      return;
    }
  },
};

export default command;
