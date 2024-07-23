import { general } from "../../configuration/general";
import { ICommand } from "../../interfaces/ICommand";
import { findCommandImport } from "../../utils";

const command: ICommand = {
  name: "X1",
  description: "Tire um X1 contra alguem do grupo",
  commands: ["x1"],
  usage: `${general.PREFIX}x1 <marque a pessoa>`,
  handle: async (data) => {
    if (!data.isGroup) {
      await data.sendText("Esse comando só pode ser usado em grupos");
    }

    const mentioned = data.args[0];

    if (!mentioned) {
      await data.sendWarningReply("Você precisa marcar alguém para o X1!");
      return;
    }

    (await findCommandImport("everyone")).command?.default.handle({
      ...data,
      args: ["Maior batalha de x1 do grupo, quem perder é corno!"],
    });

    await data.sendTextWithRemotejid(
      `@${mentioned} você foi marcado para um x1, aceita? (responda com "aceito" ou "recuso")`,
      mentioned,
      true
    );

  },
};

export default command;
