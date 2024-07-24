import { ICommand } from "../../interfaces/ICommand";

const command: ICommand = {
  name: "Tarta",
  description:
    "Esse comando que envia uma mensagem aleatoria toda vez que o tarta fala alguma coisa",
  commands: [],
  usage: ``,
  handle: async (data) => {
    const numberTarta: string = "5519987315020";
    if (
      !data.remoteJid?.startsWith(numberTarta) ||
      !data.participant?.startsWith(numberTarta)
    )
      return;

    const phases: string[] = [
      "A terlandia é uma gostosa, pena que o filho dela não aprova nosso namoro",
      "Não sei se é a terlandia ou a terlandia que é gostosa",
      "To pronto pra ser o padrasto do filho da terlandia",
      "Quero ser o padrasto do filho da terlandia",
      "A Terlandia é tão incrível que eu arrumava uma desculpa qualquer só pra passar mais tempo com ela",
      "Só não maceto a terlandia porque ela é mãe do meu filho",
    ];

    const randomPhase = phases[Math.floor(Math.random() * phases.length)];
    await data.sendMentionReply(randomPhase, [
      data.remoteJid,
      data.participant,
    ]);
  },
};

export default command;
