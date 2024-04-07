import { DangerError } from "../../errors/DangerError";
import { ICommand } from "../../interfaces/ICommand";
import { general } from "../../configuration/general";
import { PrismaClient, fatos } from "@prisma/client";
const prisma = new PrismaClient();

const command: ICommand = {
  name: "Fato",
  description: "Relata um fato aleatório ou adiciona um novo fato",
  commands: ["fato", "fatos", "fact", "facts"],
  usage: `${general.PREFIX}fato <Escreva o novo fato aqui>`,
  handle: async (data) => {
    if (data.args[0]) {
      await prisma.fatos.create({
        data: {
          fato: data.args.join(" "),
          criador: data.participant,
        },
      });
      return data.sendSuccessReply(`Fato adicionado com sucesso!`);
    } else {
      const fatos: fatos[] = await prisma.fatos.findMany();
      if (fatos.length === 0)
        throw new DangerError("Nenhum fato encontrado, adicione um novo fato!");
      const fatoChoice = fatos[Math.floor(Math.random() * fatos.length)];
      data.sendSuccessReply(`Fato: ${fatoChoice.fato}`);
    }
  },
};

export default command;
