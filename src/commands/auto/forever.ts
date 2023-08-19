import { ICommand } from "../../interfaces/ICommand";

const command: ICommand = {
  name: "Forever",
  description:
    "Esse comando que envia uma imagem aleatoria toda vez que o forever fala alguma coisa",
  commands: [],
  usage: ``,
  handle: async (data) => {
    const numberForever: string = "554188853723";
    if (
      !data.remoteJid?.startsWith(numberForever) ||
      !data.participant?.startsWith(numberForever)
    )
      return;
    if (Math.random() <= 0.5) {
      await data.sendReact("🏳‍🌈");
    } else {
      await data.sendReact("🏳️‍⚧️");
    }
  },
};

export default command;
