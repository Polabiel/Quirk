import { general } from "../../configuration/general";
import { ICommand } from "../../interfaces/ICommand";

const command: ICommand = {
  name: "Ping",
  description: "Comando para verificar o tempo de resposta do bot",
  commands: ["ping", "pong", "latency", "latencia", "latência", "pingar"],
  usage: `${general.PREFIX}ping`,
  handle: async (data) => {
    const start = Date.now();

    await data.sendReact("🏓");

    const end = Date.now();
    const latency = end - start;

    if (latency > 0) {
      await data.sendReply(`🏓 Pong!\nTempo de resposta: ${latency}ms`);
    } else {
      await data.sendReply(`🏓 Pong!\nTempo de resposta indisponível.`);
    }
  },
};

export default command;
